'use strict';
window.FrontierGrayDepth156 = (() => {
  const style=document.createElement('link');style.rel='stylesheet';style.href='gray-depth156.css?v=codex159grayisolation';document.head.append(style);
  const rules = FrontierGrayDepthRules156;
  const eliteSpecies=new Set(Object.values(FrontierRegionalEnemies.roster).flatMap(roster=>roster.elite));
  const active = () => !!R()?.grayDepth156 && !R().result;
  const state = () => R().grayDepth156;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const action = (name, fn) => FrontierRuntime.perform('gray156-' + name, () => {fn();save();render();});
  const data = () => FrontierCurioData.forRun(R());
  function weeklyView(){
    const week=rules.week(Date.now()),paid=Math.min(3000,Math.max(0,db.grayDepth156?.weeks?.[week]||0));
    return '<section class="gray158-week"><small>本週合成玉</small><div><progress max="3000" value="'+paid+'" aria-label="本週合成玉進度"></progress><span>'+paid+'／3000</span></div></section>';
  }
  function entry(){
    const records=db.grayDepth156?.records||{};
    if(db.grayDepth156?.slot&&!db.grayDepth156.slot.result){
      modal('灰域縱深',weeklyView()+'<p>已暫停於第 '+db.grayDepth156.slot.grayDepth156.wave+' 波</p>','<button onclick="FrontierGrayDepth156.resume()">繼續灰域縱深</button><button onclick="closeModal()">返回</button>');return;
    }
    modal('灰域縱深',weeklyView()+'<p>三張招募券 · 12 希望 · 持續作戰直到全隊倒下</p><div class="gray156-difficulties">'+[['normal','普通','第 3 波開始獲得合成玉'],['torment','磨難','首波 4 合成玉，逐波翻倍']].map(([id,name,text])=>'<button onclick="FrontierGrayDepth156.launch(\''+id+'\')"><b>'+name+'</b><span>'+text+'</span><small>最高通關 '+(records[id]||0)+' 波</small></button>').join('')+'</div>','<button onclick="closeModal()">返回首頁</button>');
  }
  const selectEnemy=FrontierRegionalEnemies.select;
  FrontierRegionalEnemies.select=function(region,type,index,path,picker,mid){
    if(!active())return selectEnemy(region,type,index,path,picker,mid);
    const regions=Object.keys(FrontierRegionalEnemies.roster);
    const chosen=picker(regions);
    const roster=FrontierRegionalEnemies.roster[chosen];
    if(type==='boss'&&index===0)return picker(Object.values(roster.bosses));
    const id=picker([...roster.common,...roster.elite]);
    return {id,trait:FrontierRegionalEnemies.profile(id)};
  };
  function eligible(id) {
    const d = data()[id];
    if (!d || !FrontierCurioOriginal137.eligible(R(), id)) return false;
    if(d.category===5&&!d.hope144&&!d.ticket144)return false;
    return !/後續節點|下一.{0,3}節點|撤離|撤退|搜索|容器|行囊|背包|勘探|隱藏路|情報節點|商店折扣/.test(d.effect || '');
  }
  function node(wave) {
    return {id:'gray156:' + wave, type:wave % 5 === 0 ? 'boss' : 'battle', layer:0, row:wave - 1, lane:0, links:[]};
  }
  function launch(difficulty) {
    return action('launch', () => {
      db.grayDepth156??={records:{},weeks:{}};
      if(db.grayDepth156.slot&&!db.grayDepth156.slot.result)throw Error('請先繼續已暫停的灰域縱深。');
      delete db.grayDepth156.slot;delete db.grayDepth156.slotRandom;
      db.grayDepth156.mainRun=structuredClone(db.run);
      db.grayDepth156.mainRandom=structuredClone(db.rng);
      db.grayDepth156.mainSeen=structuredClone(db.world.seen);
      db.world.seen=structuredClone(db.grayDepth156.seen||{});
      const seed=new Uint32Array(1);crypto.getRandomValues(seed);
      db.rng={version:1,seed:seed[0],counter:0,records:[]};
      const regionsBefore=structuredClone(db.regions);
      const medicineBefore=structuredClone(db.medicine?.loadout);
      db.run=null;
      FrontierSurveyV27.clearFocus();
      FrontierPrep149.clearTicket();
      for (const id of ['medicine-load-0','medicine-load-1']) {const input=document.getElementById(id);if(input)input.value='';}
      document.querySelectorAll('[id^="capture-load-"]').forEach(input => input.value='0');
      page='run';render();
      const region=document.getElementById('exp-region');if(region)region.value='chernobog';
      const diff=document.getElementById('exp-difficulty');if(diff)diff.value='normal';
      const check=document.getElementById('highrisk174-mode');if(check)check.checked=false;
      globalThis.FrontierGrayLaunch156 = true;
      try {startRun();} finally {delete globalThis.FrontierGrayLaunch156;}
      const r=R();if(!r?.recruitment144?.snapshot.grayDepth156)throw Error('灰域縱深初始化失敗。');
      db.regions=regionsBefore;
      if(db.medicine)db.medicine.loadout=medicineBefore;
      closeModal();
      r.grayDepth156={version:1,difficulty,wave:1,cleared:0,phase:'prepare',choices:0,choiceIndex:0,kills:[],reward:0};
      r.expedition.layers=[{rows:[[node(1)]]}];r.expedition.layer=0;r.expedition.row=0;r.expedition.current=null;
      r.expedition.grayDepth156=true;r.expedition.graphVersion=0;delete r.endingRoute;delete r.survey16;
      r.recruitment144=FrontierExpeditionRecruit144.initial(r,r.recruitment144.snapshot);
      r.expedition.difficulty=difficulty;r.fieldPoints=0;r.alarm=0;r.event=null;r.reward=null;
      r.quickMeds=[];r.field.devices={};r.curios.rules137=137;
    });
  }
  function next() {
    return action('next', () => {
      if(!active()||R().battle||state().phase!=='prepare')return;
      if(!R().team.some(a=>a.hp>0))throw Error('請先招募並編入出戰幹員。');
      const r=R(),s=state(),n=node(s.wave);
      r.expedition.layers[0].rows[s.wave-1]=[n];r.expedition.row=s.wave-1;r.expedition.current=n.id;
      r.event=null;r.reward=null;s.phase='battle';startBattle(n.type);
    });
  }
  function scaleEnemies(battle){
      if(!active())return;
      const s=state();
      s.baseline??={hp:battle.enemies[0].max,atk:battle.enemies[0].atk,def:Math.max(10,battle.enemies[0].def||0)};
      const growth=rules.growth(s.wave);
      for(const enemy of battle.enemies){
        enemy.max=enemy.hp=Math.max(1,Math.round(s.baseline.hp*growth.hp));
        enemy.atk=Math.max(1,Math.round(s.baseline.atk*growth.atk));
        enemy.def=Math.round(s.baseline.def*growth.def);
        enemy.baseAttack=enemy.atk;
      }
  }
  function offer() {
    const r=R(),s=state(),key='gray156:'+s.cleared+':choice:'+s.choiceIndex;
    r.curios.offers??=[];
    if(!r.curios.offers.some(o=>o.key===key)){
      const pool=Object.keys(data()).filter(id=>eligible(id)&&!r.curios.owned.some(x=>x.id===id));
      const ids=FrontierCurios.select(pool,3);
      if(ids.length){r.curios.offers.push({key,ids});r.curios.rewards[key]={offered:true};}
      else {s.choices=0;afterChoices();}
    }
  }
  function choiceKey(){const s=state();return 'gray156:'+s.cleared+':choice:'+s.choiceIndex;}
  function shopKey(){const s=state();return s.cleared+':'+Number(s.refreshed);}
  function choose(id,expected=choiceKey()) {
    return action('choose',()=>{
      if(!active()||state().phase!=='choice'||expected!==choiceKey())return;
      const s=state(),key='gray156:'+s.cleared+':choice:'+s.choiceIndex;
      if(!R().curios.offers.find(o=>o.key===key)?.ids.includes(id))return;
      FrontierCurios.claim(key,id);
      if(!R().curios.rewards[key]?.completed)return;
      s.choices--;s.choiceIndex++;
      if(s.choices)offer();else afterChoices();
    });
  }
  function afterChoices(){
    const s=state();
    if(s.cleared%5===4){s.phase='merchant';s.shop=shop(0);s.refreshed=false;}
    else s.phase='prepare';
  }
  function shop(refresh) {
    const s=state(),rng=FrontierExpeditionRecruit144.random(R().recruitment144.seed+':shop:'+s.cleared+':'+refresh);
    const curios=Object.keys(data()).filter(id=>eligible(id)&&!R().curios.owned.some(x=>x.id===id));
    const modules=Object.values(FrontierEquipmentRegistry139.E.defs).filter(d=>d.category==='runModule'&&Number(d.id.slice(-3))<91);
    return Array.from({length:10},(_,i)=>{
      const kind=i<3?'ticket':i<7?'curio':'module',pool=kind==='curio'?curios:modules;
      const index=Math.floor(rng()*pool.length),item=pool[index];
      if(kind==='curio')pool.splice(index,1);
      return {kind,id:kind==='ticket'?'ticket':typeof item==='string'?item:item?.id,price:kind==='ticket'?8:kind==='curio'?12:6,sold:false,
        ...(kind==='ticket'?{ticket:FrontierExpeditionRecruit144.ticket(R().recruitment144,'gray156:shop:'+s.cleared+':'+refresh+':'+i)}:{})};
    });
  }
  function shopView(){
    const r=R(),s=state();
    const cards=s.shop.map((item,i)=>{
      const name=item.kind==='ticket'?'一般招募券':item.kind==='curio'?data()[item.id]?.name:FrontierEquipmentRegistry139.E.defs[item.id]?.name;
      const art=item.kind==='curio'?FrontierCurios.icon(item.id):item.kind==='module'?FrontierIcons.html(item.id):FrontierRecruit152.art(item.ticket);
      const disabled=item.sold||r.fieldPoints<item.price||!item.id;
      return '<article class="store-card '+(item.sold?'sold154':disabled?'unaffordable154':'')+'" data-style154><b>'+esc(name)+'</b><div class="store-picture">'+art+'</div><small class="quantity154">×1</small><button '+(disabled?'disabled':'')+' onclick="FrontierGrayDepth156.buy('+i+',&quot;'+shopKey()+'&quot;)"><span class="price-label154">'+(item.sold?'已售罄':'價格')+'</span><span class="price-value154">'+FrontierCurrencyIcons.html('ingot')+'<strong>'+item.price+'</strong></span></button>'+(item.sold?'<span class="sold-tag154">已售罄</span>':'')+'</article>';
    }).join('');
    return '<section class="gray156-stage gray156-shop field-store merchant154"><div class="store-heading"><h2>詭異行商</h2><span>'+FrontierCurrencyIcons.html('ingot')+r.fieldPoints+'</span></div><button class="talent-refresh43" '+(s.refreshed?'disabled':'')+' onclick="FrontierGrayDepth156.refresh(&quot;'+shopKey()+'&quot;)">'+(s.refreshed?'已刷新':'免費刷新一次')+'</button><div class="store-grid">'+cards+'</div><button class="store-leave" onclick="FrontierGrayDepth156.leave()">離開行商</button></section>';
  }
  function buy(index,expected=shopKey()){return action('buy',()=>{
    if(!active()||state().phase!=='merchant'||expected!==shopKey())return;
    const r=R(),s=state(),item=s.shop[index];if(!item||item.sold||!item.id||r.fieldPoints<item.price)return;
    if(item.kind==='ticket'){
      const g=r.recruitment144;FrontierExpeditionRecruit144.grayTicket156(g,'shop:'+s.cleared+':'+Number(s.refreshed)+':'+index);
    }else if(item.kind==='curio'){
      if(!FrontierCurioEngine.gain(r.curios,item.id))return;
      FrontierCurios.emit('acquire',{id:item.id});
    }else{
      const key='merchant:gray156:'+s.cleared+':'+Number(s.refreshed)+':'+index;
      FrontierEquipmentUI139.offer(key);const offer=r.equipment139.offers.find(o=>o.key===key);
      if(!offer)return;offer.ids=[item.id];FrontierEquipmentUI139.claim(key,item.id);
    }
    r.fieldPoints-=item.price;item.sold=true;
  });}
  function refresh(expected=shopKey()){return action('refresh',()=>{const s=state();if(!active()||s.phase!=='merchant'||s.refreshed||expected!==shopKey())return;s.shop=shop(1);s.refreshed=true;});}
  function leave(){return action('leave-shop',()=>{if(state().phase==='merchant')state().phase='prepare';});}
  function killRewards(){
    if(!active()||!R().battle)return;
    const r=R(),s=state();
    const gained=[];
    for(const enemy of r.battle.enemies){
      const key=s.wave+':'+(enemy.uid||enemy.id);
      if(enemy.hp>0||s.kills.includes(key))continue;
      s.kills.push(key);const amount=enemy.boss?10:eliteSpecies.has(enemy.species)?3:2;r.fieldPoints+=amount;
      gained.push({name:enemy.name,amount});
    }
    if(gained.length)s.lastKills={at:Date.now(),entries:gained};
  }
  const check=checkBattle;
  checkBattle=function(...args){
    if(!active())return check(...args);
    const r=R(),b=r.battle;if(!b)return false;
    killRewards();FrontierCombat.sync();
    if(!r.team.some(a=>a.hp>0)){endRun('loss');return true;}
    if(b.enemies.some(e=>e.hp>0))return false;
    const s=state(),wave=s.wave,d=rules.drops(wave),n=node(wave);
    FrontierCurios.emit('battleEnd',{won:true,noDowned:r.team.every(a=>a.hp>0)});
    FrontierOperatorGameV113.restoreActors(b);
    r.battle=null;selected=null;r.event=null;r.reward=null;
    FrontierExpeditionRecruit144.awardBattle(r.recruitment144,n,n.type,false);
    r.expedition.visited.push(n.id);r.expedition.current=null;r.expedition.row=0;
    s.cleared=wave;s.wave++;s.reward+=rules.reward(wave,s.difficulty);
    db.grayDepth156??={records:{},weeks:{}};
    db.grayDepth156.records[s.difficulty]=Math.max(db.grayDepth156.records[s.difficulty]||0,wave);
    for(let i=0;i<d.modules;i++){
      const key='reward:gray156:'+wave+':'+i;FrontierEquipmentUI139.offer(key);
      const o=r.equipment139.offers.find(x=>x.key===key);if(o)FrontierEquipmentUI139.claim(key,o.ids[0]);
    }
    s.choices=d.choices;s.choiceIndex=0;s.phase=s.choices?'choice':'prepare';
    if(s.choices)offer();else afterChoices();
    save();render();return true;
  };
  function finish(){return action('finish',()=>{if(active())endRun('loss');});}
  function resume(){return action('resume',()=>{
    const storage=db.grayDepth156;if(!storage?.slot||storage.slot.result)return;
    selected=null;storage.mainRun=structuredClone(db.run);db.run=storage.slot;delete storage.slot;
    storage.mainRandom=structuredClone(db.rng);db.rng=storage.slotRandom;delete storage.slotRandom;
    storage.mainSeen=structuredClone(db.world.seen);db.world.seen=structuredClone(storage.seen||{});
    preserveLegacyGear(db.run,storage.mainRun);
    db.session.paused=false;page='run';closeModal();
  });}
  function park(){return action('park',()=>{
    if(!R()?.grayDepth156)return;
    selected=null;preserveLegacyGear(db.run,db.grayDepth156.mainRun);
    db.grayDepth156.slot=db.run;db.run=db.grayDepth156.mainRun||null;
    db.grayDepth156.slotRandom=db.rng;db.rng=db.grayDepth156.mainRandom;
    delete db.grayDepth156.mainRandom;
    db.grayDepth156.seen=structuredClone(db.world.seen);
    if(db.grayDepth156.mainSeen)db.world.seen=db.grayDepth156.mainSeen;
    delete db.grayDepth156.mainSeen;
    delete db.grayDepth156.mainRun;db.session.paused=false;page='home';closeModal();
  });}
  function preserveLegacyGear(run,mainRun){
    if(run.recruitment144?.snapshot.gearItems158||run.grayDepth156.gearCopies158)return;
    const known=new Set([...(db.inventory?.items||[]),...(mainRun?.equipment?.items||[])].map(item=>item.uid));
    for(const original of run.borrowedEquipment144||[]){
      if(known.has(original.uid))continue;
      const item=structuredClone(original);delete item.owner;delete item.equipped;delete item.recruitSlot144;
      db.inventory.items.push(item);known.add(item.uid);
    }
    run.grayDepth156.gearItems158??=structuredClone([...(db.inventory?.items||[]),...(run.borrowedEquipment144||[])]);
    run.grayDepth156.stats158??=Object.fromEntries(Object.keys(run.recruitment144.snapshot.presets).map(id=>[id,[0,1,2].map(elite=>structuredClone(FrontierGrowth.stats(id,elite)))]));
    run.grayDepth156.gearCopies158=true;
  }
  const goBefore=go;
  go=function(destination){if(R()?.grayDepth156&&destination!=='run')return park();return goBefore(destination);};
  const end=endRun;
  endRun=function(...args){
    const r=R(),s=r?.grayDepth156;
    if(!s)return end(...args);
    if(r.result)return;
    r.result='loss';r.battle=null;r.event=null;r.reward=null;selected=null;
    r.settled={kept:[],credits:0,intel:0,lost:0,gearLost:false};
    FrontierExpeditionRecruit144.finish(r.recruitment144);
    r.curios.ended=true;r.curios.battle=null;
    s.phase='ended';
    r.equipment139.modules=[];r.equipment139.offers=[];
    const result=true;
    if(r.result&&!s.settled){
      db.grayDepth156??={records:{},weeks:{}};
      const key=rules.week(Date.now()),paid=db.grayDepth156.weeks[key]||0;
      s.paid=Math.max(0,Math.min(3000-paid,s.reward));
      db.grayDepth156.weeks[key]=paid+s.paid;db.wallet.synth+=s.paid;s.settled=true;
      save();render();
    }
    return result;
  };
  function open(kind){
    if(!active())return;
    if(['team','ticket','curio'].includes(kind))FrontierFieldDock.toggle(kind);
    if(kind==='module')FrontierEquipmentUI139.manage();
    if(kind==='supply')modal('戰術補給',FrontierMedicine.view(),'<button onclick="closeModal()">關閉</button>');
  }
  function cardsView(){
    const o=R().curios.offers.find(o=>o.key==='gray156:'+state().cleared+':choice:'+state().choiceIndex);
    return '<section class="gray156-choice" role="dialog" aria-label="選擇收藏品"><p>選擇收藏品 · '+(state().choiceIndex+1)+'／3</p><div>'+ (o?.ids||[]).map(id=>'<button data-gray-curio="'+id+'" onclick="FrontierGrayDepth156.choose(\''+id+'\',&quot;'+o.key+'&quot;)">'+FrontierCurios.icon(id)+'<b>'+esc(data()[id].name)+'</b><small>長按查看效果</small></button>').join('')+'</div></section>';
  }
  function commandDetails(){
    const g=R()?.recruitment144;if(!g)return;
    const E=FrontierExpeditionRecruit144;
    modal('指揮等級','<section class="command148-details"><p>初始希望 12。每波指揮經驗 +3，首領波 +6。</p>'+E.thresholdsFor(g).map((xp,i)=>'<div class="'+(g.commander148.level===i+1?'current':'')+'"><b>Lv.'+(i+1)+'</b><span>'+xp+' EXP</span><span>出戰 '+E.commandCapacity[i][0]+'／支援 '+E.commandCapacity[i][1]+'</span></div>').join('')+'</section>','<button onclick="closeModal()">關閉</button>');
  }
  function commandHud(){
    const g=R().recruitment144,c=g.commander148,T=FrontierExpeditionRecruit144.thresholdsFor(g),start=T[c.level-1],next=T[c.level],ratio=next?(c.exp-start)/(next-start):1,s=state();
    return '<section class="gray156-hud command148-hud" aria-label="灰域縱深作戰資源"><button class="command148-level" onclick="FrontierGrayDepth156.commandDetails()" aria-label="指揮等級 '+c.level+'"><span class="command-exp-ring" style="--command-exp:'+Math.max(0,Math.min(1,ratio))*100+'%"><b>'+c.level+'</b></span><span class="command-exp-copy"><small>指揮等級</small><em>'+(next?Math.max(0,c.exp-start)+' / '+(next-start):'MAX')+' EXP</em></span></button><div class="command148-survey"><b>第 '+s.wave+' 波</b><small>'+(s.wave%5===0?'首領作戰':s.difficulty==='torment'?'磨難':'普通')+'</small></div><div class="command148-wallet"><button onclick="FrontierGrayDepth156.open(\'ticket\')" class="command148-hope" aria-label="希望 '+g.hope+'" style="--hope-fill:'+Math.min(100,g.hope/12*100)+'%"><img src="assets/ui-sami148/hope_icon.png" alt=""><span><small>希望</small><b>'+g.hope+'</b></span></button><span class="command148-ingot"><i class="command148-ingot-mark" aria-hidden="true"></i><span><small>源石碇</small><b>'+(R().fieldPoints||0).toLocaleString()+'</b></span></span></div></section>';
  }
  function paint(){
    const inMode=!!R()?.grayDepth156&&page==='run';
    document.body.classList.toggle('gray156-active',inMode);
    let host=document.querySelector('#app');if(!host)return;
    if(!inMode)document.getElementById('gray156-overlay')?.remove();
    if(page==='home'){
      if(!host.querySelector('.gray156-entry'))(host.querySelector('.home20-controls')||host).insertAdjacentHTML('beforeend','<button class="gray156-entry" onclick="FrontierGrayDepth156.entry()">灰域縱深</button>');
      return;
    }
    if(page!=='run')return;
    if(R()?.grayDepth156&&R().result){
      let result=document.getElementById('gray156-overlay');
      if(!result){result=document.createElement('div');result.id='gray156-overlay';document.body.append(result);}
      if(!result.querySelector('[data-gray-result]'))result.innerHTML='<section class="gray156-stage" data-gray-result><h2>作戰結束</h2><p>'+(state().difficulty==='torment'?'磨難':'普通')+' · 通關 '+state().cleared+' 波</p><p>合成玉 +'+(state().paid||0)+'</p><button onclick="FrontierGrayDepth156.park()">返回首頁</button></section>';
      return;
    }
    if(!R()||R().result){
      return;
    }
    if(!active())return;
    let overlay=document.getElementById('gray156-overlay');
    if(!overlay){overlay=document.createElement('div');overlay.id='gray156-overlay';document.body.append(overlay);}
    host=overlay;
    const support=document.querySelector('[data-battle-tool="support"] span');if(support&&support.textContent!=='戰術補給')support.textContent='戰術補給';
    const stamp=[R().number,state().wave,state().phase,R().fieldPoints,R().recruitment144.hope,R().recruitment144.commander148.level,state().choiceIndex,state().refreshed,state().shop?.filter(x=>x.sold).length].join('-');
    if(host.querySelector('.gray156-hud')?.dataset.grayPaint===stamp)return;
    host.querySelectorAll('.gray156-hud,.gray156-dock,.gray156-stage,.gray156-choice,.gray156-supply,.gray156-kills').forEach(el=>el.remove());
    const r=R(),s=state(),g=r.recruitment144;
    host.insertAdjacentHTML('afterbegin',commandHud());
    host.querySelector('.gray156-hud').dataset.grayPaint=stamp;
    host.insertAdjacentHTML('beforeend','<nav class="gray156-dock screen-combat-actions fd-dock">'+[['team','編隊'],['ticket','招募券'],['curio','收藏品'],['module','詞條']].map(([key,label])=>'<button data-fd-key="'+key+'" onclick="FrontierGrayDepth156.open(\''+key+'\')">'+label+'</button>').join('')+'</nav>');

    if(s.lastKills&&Date.now()-s.lastKills.at<5000){
      host.insertAdjacentHTML('beforeend','<aside class="gray156-kills" role="status">'+s.lastKills.entries.map(entry=>'<div>'+esc(entry.name)+'<b>源石碇 +'+entry.amount+'</b></div>').join('')+'</aside>');
      setTimeout(()=>host.querySelector('.gray156-kills')?.remove(),5000);
    }
    FrontierFieldDock.decorate();
    if(s.phase==='choice')host.insertAdjacentHTML('beforeend',cardsView());
    else if(s.phase==='merchant'){
      host.insertAdjacentHTML('beforeend',shopView());
    }else if(!r.battle)host.insertAdjacentHTML('beforeend','<section class="gray156-stage"><h2>第 '+s.wave+' 波</h2><p>已完成 '+s.cleared+' 波 · 本趟合成玉 '+s.reward+'</p><button onclick="FrontierGrayDepth156.next()">'+(s.wave%5===0?'迎戰首領':'開始下一波')+'</button><button onclick="FrontierGrayDepth156.finish()">結束本趟</button></section>');
  }
  const renderBefore=render;render=function(...args){const out=renderBefore(...args);paint();return out;};
  const host=document.getElementById('app');
  const observer=new MutationObserver(()=>{
    observer.disconnect();
    try{paint();}finally{observer.observe(host,{childList:true,subtree:true});}
  });
  observer.observe(host,{childList:true,subtree:true});
  const pauseBefore=FrontierSession.pause;
  FrontierSession.pause=function(){
    if(active())return park();
    if(!R()||R().result)return pauseBefore();
    return action('pause-main',()=>{page='home';db.session.paused=false;closeModal();});
  };
  FrontierMobile.pause=FrontierSession.pause;
  const validBefore=validSave;
  const integer=n=>Number.isSafeInteger(n)&&n>=0;
  function validRun(r){
    const s=r?.grayDepth156;
    if(!s)return true;
    return s.version===1&&['normal','torment'].includes(s.difficulty)&&integer(s.cleared)&&s.wave===s.cleared+1&&
      ['prepare','battle','choice','merchant','ended'].includes(s.phase)&&integer(s.reward)&&
      integer(s.choices)&&s.choices<=3&&integer(s.choiceIndex)&&s.choiceIndex<=3&&
      Array.isArray(s.kills)&&new Set(s.kills).size===s.kills.length&&s.kills.every(k=>typeof k==='string')&&
      !!r.recruitment144?.snapshot.grayDepth156&&!!r.expedition?.grayDepth156&&
      (s.phase!=='battle'||!!r.battle)&&(s.phase!=='ended'||!!r.result)&&
      (!s.shop||s.shop.length===10&&s.shop.every(item=>['ticket','curio','module'].includes(item.kind)&&integer(item.price)&&typeof item.sold==='boolean'));
  }
  validSave=function(input){
    if(!validBefore(input)||!validRun(input.run))return false;
    const storage=input.grayDepth156;if(!storage)return true;
    if(!storage.records||!storage.weeks||Object.values(storage.records).some(n=>!integer(n))||Object.values(storage.weeks).some(n=>!integer(n)||n>3000))return false;
    for(const run of [storage.slot,storage.mainRun])if(run&&(!validRun(run)||!validBefore({...input,run})))return false;
    return true;
  };
  let timer=null,held=false;
  document.addEventListener('pointerdown',event=>{
    const button=event.target.closest('[data-gray-curio]');if(!button)return;held=false;
    timer=setTimeout(()=>{held=true;const d=data()[button.dataset.grayCurio];modal(d.name,'<p>'+esc(d.effect)+'</p>','<button onclick="closeModal()">關閉</button>');},400);
  });
  for(const event of ['pointerup','pointercancel','pointermove'])document.addEventListener(event,()=>clearTimeout(timer));
  document.addEventListener('click',event=>{if(held&&event.target.closest('[data-gray-curio]')){held=false;event.preventDefault();event.stopImmediatePropagation();}},true);
  return {active,entry,launch,next,choose,buy,refresh,leave,finish,open,eligible,paint,killRewards,resume,park,scaleEnemies,commandDetails};
})();
