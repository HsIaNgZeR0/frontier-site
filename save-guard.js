'use strict';
// M01: preserve the exact stored text before the game can migrate or write it.
window.FrontierSaveGuard = (() => {
  const key = window.FrontierStorage?.key || 'rhodes-frontier-v1', baseline = key + '-pre-m01-backup';
  let raw = null, blocked = false, prepared = false, loaded = null, retryable = false, finishing = false;
  const storage = () => window.FrontierStorage || localStorage;
  function download(text, name) {
    if (text === null) return;
    const url = URL.createObjectURL(new Blob([text], {type:'application/json;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function recovery(message) {
    blocked = true;
    document.body?.classList.remove('booting');
    const app = document.querySelector('#app');
    app.innerHTML = '<section class="panel" style="margin:24px auto;max-width:520px"><div class="eyebrow">SAVE RECOVERY</div><h1>存檔已受到保護</h1><p id="save-reason"></p><p class="muted">目前暫停載入與自動寫入。請先下載原始存檔備份，再保留檔案供恢復進度。</p><div class="row"><button id="save-raw" style="min-height:44px">下載原始存檔</button><button id="save-baseline" style="min-height:44px">下載升級前備份</button></div><p id="save-note" role="status" class="tiny muted"></p></section>';
    document.querySelector('#save-reason').textContent = message;
    const original = document.querySelector('#save-raw'); original.disabled = raw === null;
    original.onclick = () => download(raw, '羅德島-原始存檔.json');
    document.querySelector('#save-baseline').onclick = exportBackup;
    if(retryable){const retry=document.createElement('button');retry.id='save-retry';retry.textContent='PRTS｜重新確認並繼續';retry.style.minHeight='44px';retry.addEventListener('click',()=>finish(true));document.querySelector('#save-note').before(retry)}
    if(window.FrontierCloud?.info().onlineRequired){
      const restore=document.createElement('button');
      restore.className='primary';restore.id='save-restore-import';restore.textContent='復原到上次匯入前';
      restore.style.minHeight='44px';
      const note=document.querySelector('#save-note');
      restore.onclick=async()=>{
        if(restore.dataset.confirm!=='yes'){
          restore.dataset.confirm='yes';restore.textContent='確認復原';
          note.textContent='復原後會載入上次匯入前的雲端進度。這次匯入的檔案仍會保留在本機備份。';
          return;
        }
        restore.disabled=true;
        try{await FrontierCloud.restoreImportBackup();location.reload()}
        catch(error){note.textContent=error.message;restore.disabled=false}
      };
      note.before(restore);
    }
    const reload=document.createElement('button');reload.id='save-reload';reload.textContent='重新載入已保存進度';reload.style.minHeight='44px';reload.addEventListener('click',()=>location.reload());document.querySelector('#save-note').before(reload);
    document.querySelector('#nav').innerHTML = '';
  }
  function backup(text, destination = baseline) {
    const previous = storage().getItem(destination);
    if (previous === null) storage().setItem(destination, text);
    if (storage().getItem(destination) !== (previous === null ? text : previous)) throw Error('backup verification failed');
    return true;
  }
  function prepare() {
    if (prepared) return !blocked;
    prepared = true;
    try {
      raw = storage().getItem(key);
      if (raw === null) return true;
      try { loaded = JSON.parse(raw); } catch { recovery('存檔 JSON 無法讀取，原始內容已保留。'); return false; }
      if (!loaded || typeof loaded !== 'object' || ![1,2].includes(loaded.version) || (loaded.world && loaded.world.version !== 1)) {
        recovery('這份存檔的版本目前不受支援，原始內容已保留。'); return false;
      }
      backup(raw);
      // A version-1 migration also needs an exact copy of this particular input.
      if (loaded.version === 1) {
        const legacy = key + '-legacy-backup';
        if (storage().getItem(legacy) !== null && storage().getItem(legacy) !== raw) {
          recovery('已有另一份舊版備份。請先下載原始存檔，避免覆蓋既有備份。'); return false;
        }
        backup(raw, legacy);
      }
      try { FrontierCombatUnits61.migrate(loaded); }
      catch (error) { recovery(error.message || '戰鬥數值版本無法安全轉換，原始內容已保留。'); return false; }
      return true;
    } catch { recovery('無法讀取儲存空間或確認升級前備份。請釋放空間或允許瀏覽器儲存後重新開啟。'); return false; }
  }
  function validate(validator, candidate = loaded) {
    try {
      if (candidate?.version === 2 && !validator(candidate)) { recovery('存檔資料不完整或不符合目前規則，原始內容已保留。'); return false; }
      return !blocked;
    } catch { recovery('存檔驗證未能完成，原始內容已保留。'); return false; }
  }
  function write(value) {
    if (blocked || !prepared) return false;
    try {
      const text = JSON.stringify(value); storage().setItem(key, text);
      if (storage().getItem(key) !== text) throw Error('write verification failed');
      return true;
    } catch { return false; }
  }
  function exportBackup() {
    try {
      const text = storage().getItem(baseline);
      if (text === null) throw Error('missing backup');
      download(text, '羅德島-升級前備份.json');
    } catch {
      const note = document.querySelector('#save-note');
      if (note) note.textContent = '目前沒有可讀取的升級前備份；原始存檔若可下載，請先保留原始檔。';
      else if (typeof window.toast === 'function') window.toast('目前沒有可讀取的升級前備份。');
    }
  }
  async function launch(source) {
    if(window.FrontierStorage){
      const state=await window.FrontierStorage.initialize();
      if(state.status==='error'){raw=window.FrontierStorage.getItem(key);recovery(state.error);return}
      window.FrontierStorage.subscribe(state=>{
        const label=document.querySelector('.status');
        if(label){label.textContent=({saving:'保存中…',saved:'進度已保存',degraded:'本機備援儲存',error:'儲存異常 · 請匯出'})[state.status]||'載入中';label.setAttribute?.('role','status')}
        if(state.status==='error'&&typeof window.toast==='function')window.toast(state.error);
      });
    }
    if (!prepare()) return;
    if(window.FrontierStorage&&!await window.FrontierStorage.flush()){recovery('升級前備份未能持久保存，已暫停載入。');return}
    const script = document.createElement('script');
    if (typeof source === 'string') script.textContent = source;
    else { script.src = 'game.js?v=appearance80'; script.onload=()=>{const files=['talent-engine-v43.js','exploration-rules-v18.js','runtime.js','developer.js','inventory.js','grid.js','secure.js','combat.js','duty-rules-v17.js','personnel.js','progression.js','potential-engine-v16.js','potential.js','equipment.js','medicine.js','expedition.js','search-locks174.js','containers.js','regional-enemy-combat.js','data/regional-roster-expansion.js','capture.js','economy.js','doctor.js','recruitment.js','base.js','trading.js','tasks.js','dispatch.js','data/collections.js','collections.js','tactics.js','amiya.js','combat-metrics-v18.js','statistics.js','achievement-records.js','mobile.js','contracts.js','research.js','data/attack-equipment.js','arsenal.js','data/defense-equipment.js','defense.js','environment.js','strategy.js','links.js','adventure.js','data/explore-equipment.js','explorer.js','equipment-tuning-v15.js','equipment-engine-v139.js','forge-engine141.js','data/equipment-v139.js','data/equipment-v139-effects.js','equipment-events-v139.js','equipment-exploration-v139.js','equipment-registry-v139.js','encounters.js','routes.js','data/icon-assets.js','data/node-icons.js','data/legacy-icon-assets.js','icons.js','mastery-icons-v60.js','currency-icons.js','offline.js','session.js','gestures.js','support.js','investigation.js','terminal.js','screen.js','region-atlas.js','presentation.js','visual-ui.js','newcomer.js','formation.js','pack.js','loot-grid.js','trail.js','view-zoom.js','base-engine.js','base151.js','base600-ui.js','base-layout601.js','survey-engine-v27.js','operations-engine.js','operations.js','battle-income-engine.js','battle-income.js','growth-engine.js','data/operator-profiles.js','growth.js','battle-rules.js','curio-data.js','curio-engine.js','curios.js','break-system.js','curio-loot.js','recovery-engine.js','emergency-recovery.js','import-recovery.js','operator-battle-ui-v31.js','operator-effects-v31.js','operator-status-dictionary-v31.js','operator-damage-v31.js','operator-damage-v113.js','operator-effects-v113.js','operator-signatures-v113.js','operator-signature-rules-v113.js','operator-turns-v31.js','operator-battle-events-v113.js','operator-mastery-v31.js','operator-game-v113.js','enemy-idle-assets.js','enemy-spine-index.js','enemy-spine.js','operator-game-ui-v113.js','operator-progression-ui-v113.js','operator-trial-v113.js','recruitment-ui.js','recruit-bag.js','operator-retirement-v14.js','mailbox.js','potential-ui-v16.js','store-v18.js','exploration-v18.js','recycle-engine-v19.js','recycle-ui-v19.js','home-preview-v20.js','achievements-ui.js','roster-preview-v20.js','team-presets-v20.js','teams-preview-v20.js','equipment-v139.js','equipment-tuning-ui-v15.js','equipment-picker-v139.js','data/forge141-icons.js','forge-ui141.js','equipment-field-v139.js','rewards-v139.js','elite-icons-v24.js','survey-ui-v27.js','shop-ui-v28.js','ending-routes.js','enemy-tactics.js','regional-encounters-v75.js','regions75-ui.js','enemy-bestiary.js','talent-ui-v43.js','combat-units-ui-v61.js','survey-index-v16.js','survey-ui-v16.js','operator-appearance80-data.js','operator-appearance80.js','performance-v32.js','expedition-recruit144.js','expedition-recruit-ui144.js',"field-currency145.js","command-hud148.js","prep149.js","profiles150.js","rewards151.js","recruit152.js","field-dock-claude.js","support175.js"];const equipmentChanged139=new Set(["operator-progression-ui-v113.js","roster-preview-v20.js","teams-preview-v20.js","progression.js","curios.js","data/icon-assets.js","inventory.js","mobile.js","icons.js","terminal.js","shop-ui-v28.js","talent-engine-v43.js","base-engine.js","bootstrap.js","capture.js","collections.js","containers.js","curios.js","equipment.js","explorer.js","game.js","grid.js","medicine.js","operator-battle-events-v113.js","operator-damage-v113.js","operator-effects-v113.js","operator-game-ui-v113.js","operator-game-v113.js","recovery-engine.js","runtime.js","save-guard.js","screen.js","storage.js","strategy.js","survey-engine-v27.js","survey-ui-v27.js","sw.js","team-presets-v20.js","teams-preview-v20.js","visual-ui.js","data/equipment-v139-effects.js","data/equipment-v139.js","equipment-engine-v139.js","equipment-events-v139.js","equipment-exploration-v139.js","equipment-field-v139.js","equipment-picker-v139.js","equipment-registry-v139.js","equipment-v139.js","rewards-v139.js"]);const total=files.length,preloaded=new Map(),moduleUrl=file=>file+'?v='+(file==='dispatch.js'?'claude56':['data/regional-roster-expansion.js','support175.js','expedition-recruit144.js','expedition-recruit-ui144.js','field-dock-claude.js'].includes(file)?'claude51':['presentation.js','operator-progression-ui-v113.js'].includes(file)?'claude50':file==='region-atlas.js'?'claude49':file==='performance-v32.js'?'transition-smooth-148a':(['gestures.js','operator-game-v113.js','operator-game-ui-v113.js','equipment-v139.js','achievements-ui.js','statistics.js','region-atlas.js'].includes(file)?'claude49':['survey-ui-v27.js','visual-ui.js','cloud.js','runtime.js','talent-engine-v43.js'].includes(file)?'claude49':['recruitment-ui.js','recruit-bag.js','recruitment.js','runtime.js'].includes(file)?'public73':file==='equipment-v139.js'?'manager72':file==='survey-engine-v27.js'?'claude49':['base600-ui.js','base-engine.js','statistics.js','survey-engine-v27.js'].includes(file)?'commissions71':['operations-engine.js','operations.js','base600-ui.js','base-engine.js','equipment-tuning-ui-v15.js'].includes(file)?'tasks70':['medicine.js','combat.js','curios.js','strategy.js','rewards-v139.js','operator-progression-ui-v113.js','equipment-tuning-v15.js','equipment-tuning-ui-v15.js','equipment-engine-v139.js','equipment-events-v139.js','equipment-v139.js','operator-effects-v113.js','operator-signature-rules-v113.js','operator-battle-events-v113.js','operator-damage-v113.js','operator-game-v113.js'].includes(file)?'tuning69':['recovery-engine.js','curios.js','screen.js'].includes(file)?'emergency63':file==='teams-preview-v20.js'?'panel62':'combat-units61')+'&release=claude60r176b');const preload=()=>{for(const file of files.slice(0,6)){if(preloaded.has(file))continue;const link=document.createElement('link');link.rel='preload';link.as='script';link.href=moduleUrl(file);link.dataset.frontierPreload='';preloaded.set(file,link);document.head.append(link)}};const next=()=>{preload();window.FrontierBootProgress?.step(12+80*(total-files.length)/total,'正在載入戰術終端');const file=files.shift();if(!file){finish();return}const module=document.createElement('script');module.src=moduleUrl(file);module.onload=()=>{preloaded.get(file)?.remove();preloaded.delete(file);next()};module.onerror=()=>recovery('遊戲模組載入失敗，請重新開啟。');document.body.appendChild(module)};next()};script.onerror = () => recovery('遊戲程式載入失敗，請檢查連線後重新開啟。'); }
    document.body.appendChild(script);
    if(typeof source==='string')await finish();
  }
  async function finish(retry=false){
    if(finishing||blocked&&!(retry&&retryable))return;
    if(retry){blocked=false;document.querySelector('#save-retry')?.setAttribute('disabled','');}
    // Modules may migrate a legacy snapshot. Validate the exact candidate that will be committed.
    if(!validate(validSave,db))return;
    finishing=true;window.FrontierBootReady=false;
    try{
      if(window.FrontierCloud?.info().blocked){const result=await FrontierCloud.recover();if(!result.ready)throw Error(result.conflict?'PRTS｜另一個裝置有不同進度。請使用重新載入，原始備份會保留。':'PRTS｜連線尚未恢復，請稍後按重新確認。');if(result.state)db=FrontierCombatUnits61.migrate(result.state);}
      window.FrontierMedicine?.migrateStock(db);
      if(window.FrontierOperations)FrontierOperations.ensure();
      if(window.FrontierStorage){
        const synced=window.FrontierCloud?.info().onlineRequired&&!FrontierStorage.info().conflict&&FrontierStorage.getItem(key)===JSON.stringify(db);
        if(!synced)await FrontierStorage.commit(db);
      }else if(!write(db))throw Error('本機儲存尚未完成。');
    }catch(error){retryable=true;recovery('PRTS｜啟動同步暫停：'+(error?.message||'儲存服務未回應。')+' 原始進度與備份保留。');finishing=false;return;}
    retryable=false;blocked=false;window.FrontierBootReady=true;window.FrontierBootProgress?.step(96,'正在恢復行動介面');
    try{window.FrontierSession?.restore();}catch(error){window.FrontierDiagnostics??=[];window.FrontierDiagnostics.push({at:Date.now(),message:String(error?.message||error),stage:'boot-view'});try{page='home';render();toast('PRTS｜上次畫面未能恢復，已返回首頁；已保存的遠征進度保留。');}catch{window.FrontierBootReady=false;retryable=true;recovery('PRTS｜畫面恢復失敗。存檔已保存，請重新載入。');finishing=false;return;}}
    window.FrontierBootProgress?.complete();document.body?.classList.remove('booting');window.dispatchEvent(new Event('frontier:boot'));finishing=false;
  }
  return {prepare, validate, write, exportBackup, launch, initial:()=>loaded?JSON.stringify(loaded):storage().getItem(key), read:()=>storage().getItem(key), get blocked(){return blocked;}};
})();

