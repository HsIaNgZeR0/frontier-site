'use strict';
window.FrontierSurvey16=(()=>{
 const E=FrontierSurveyIndex16,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const active=()=>R()?.survey16&&!R().result,known=n=>!active()||E.visibility(R(),n)==='known';
 const view=v=>v===6?'本層全部':E.depth(v)+' 列',aliveRoute=()=>active()&&!R().battle&&!R().event&&!R().reward&&!R().survey16.sideBranchReturnNode;
 function info(n){const visibility=E.visibility(R(),n);if(visibility!=='known'){const combat=visibility==='blurred'&&['battle','elite','boss'].includes(n.type);return{kind:'unknown',name:visibility==='blurred'?(combat?'可能交戰':'可能非戰鬥'):'未知節點',image:'<span class="survey16-unknown" aria-hidden="true">?</span>',description:'訊號尚未辨識；可先精準掃描，或抵達時確認風險後進入。'};}const kind=FrontierTrail.nodeKind(n),name=FrontierTrail.nodeName({...n,hidden:false});return{kind,name,image:FrontierTrail.icon(kind),description:'節點類型：'+name+'。危險級 '+n.risk+'/3。'+(n.toolInfo||'')};}
 function currentEffect(){
  const value=R()?.survey16?.surveyIndex??0;
    const penalty=FrontierEnvironment.visibilityPenalty(R());
  if(value===6)return '可辨識本層所有節點。';
  const range=Math.max(0,E.depth(value)-penalty);
  return (range?'可辨識前方 '+range+' 列的節點。':'下一列僅能分辨是否可能交戰。')+(penalty&&value>0?'地區環境使能見度降低一列。':'');
 }
 function indicator(){
  if(!active())return '';
  const value=R().survey16.surveyIndex;
  return '<button type="button" class="survey16-indicator" data-survey16-indicator aria-label="勘察 '+value+'，長按查看效果"><svg viewBox="0 0 46 39" aria-hidden="true"><path d="M5 24 9 28M7 15 12 18M13 8 16 13M23 5v5m10-2-3 5m9 2-5 3m7 6-4 4M13 29l10 7 10-7"/><path class="survey16-bracket" d="M4 8v-4h6m26 0h6v4M4 31v4h6m26 0h6v-4"/></svg><span>'+value+'</span></button>';
 }
 document.addEventListener('contextmenu',event=>{if(event.target.closest('[data-survey16-indicator]'))event.preventDefault();});
 let indexHold,indexTip;
 function clearIndexHold(){clearTimeout(indexHold?.timer);indexHold=null;indexTip?.remove();indexTip=null;}
 document.addEventListener('pointerdown',event=>{
  if(!event.target.closest('[data-survey16-indicator]'))return;
  clearIndexHold();
  const {clientX:x,clientY:y}=event;
  indexHold={x,y,timer:setTimeout(()=>{
   const tip=document.createElement('aside');
   tip.className='visual-held-item survey16-index-tip';
   tip.setAttribute('role','tooltip');
   tip.textContent=currentEffect();
   FrontierInspector.attach(tip);
   indexTip=tip;
  },340)};
 });
 document.addEventListener('pointermove',e=>{if(indexHold&&Math.hypot(e.clientX-indexHold.x,e.clientY-indexHold.y)>12)clearIndexHold();});
 for(const name of ['pointerup','pointercancel'])document.addEventListener(name,clearIndexHold);
 document.addEventListener('click',event=>{
  if(event.detail===0&&event.target.closest('[data-survey16-indicator]'))modal('勘察', '<p>'+esc(currentEffect())+'</p>','');
 });
 function details(){const s=R()?.survey16;if(!s)return;modal('PRTS · 勘察指數','<p>勘察 '+s.surveyIndex+'/6 · 前方 '+view(s.surveyIndex)+'</p><p>0：下一列只辨戰鬥可能；1～2：一列；3：兩列；4～5：三列；6：本層全顯示。曾掃描及已走過節點永久保留。</p><p>精準掃描消耗1；失聯支道消耗2，每層最多一次，不設單局次數上限。零點仍可走主線。</p><p>安全角落、部分情報事件／搜索與行商可補充；精英戰25%機會，整局此來源最多+2。永久調查情報與商店調查點數不會被扣除。</p><ol>'+s.log.slice().reverse().map(x=>'<li>'+esc(x.reason)+'：'+x.before+' → '+x.after+'</li>').join('')+'</ol>','<button onclick="closeModal()">關閉</button>');}
 function payment(cost){const s=R().survey16,next=s.surveyIndex-cost;if(next<0)return '<p>目前勘察 '+s.surveyIndex+'/6，需要 '+cost+' 點，尚缺 '+(-next)+' 點。</p><p>勘察不足，不會扣款；仍可繼續主路線。</p>';return'<p>勘察 <b>'+s.surveyIndex+' → '+Math.max(0,next)+'</b>／6</p><p>視野：'+view(s.surveyIndex)+' → '+view(Math.max(0,next))+'</p><p>'+(E.depth(next)<E.depth(s.surveyIndex)?'未曾單獨揭露的遠方節點可能重新被迷霧遮住。':'目前視野範圍不會縮減。')+' 已掃描及走過的節點不受影響。</p>';}
 function preview(id){const r=R(),n=E.find(r,id);if(!n)return;const v=E.visibility(r,n),can=FrontierExpedition.available(n),scanable=E.possible(r).has(id)&&v!=='known'&&!r.survey16.scannedNodeIds.includes(id);modal(info(n).name,'<p>'+esc(info(n).description)+'</p>'+(v==='known'?'<p>危險級 '+n.risk+'/3。未實際生成的物資不作獎勵保證。</p>':'<p>相鄰未知節點會先揭露並要求確認，不會直接觸發戰鬥。</p>'),(scanable?'<button '+(r.survey16.surveyIndex<1?'disabled':'')+' onclick="FrontierSurvey16.confirmScan(\''+id+'\')">精準掃描 · 1 勘察</button>':'')+(can?'<button class="primary" onclick="FrontierSurvey16.confirmEnter(\''+id+'\')">'+(v==='known'?'進入此節點':'辨識並確認')+'</button>':'')+'<button onclick="closeModal()">返回地圖</button>');}
 function confirmScan(id){const r=R(),n=E.find(r,id);if(!n||!aliveRoute()||!E.possible(r).has(id)||known(n)||r.survey16.surveyIndex<1)return;modal('精準掃描',payment(1)+'<p>永久揭露指定節點的類型與危險級，不重抽內容。</p>','<button onclick="closeModal()">取消</button><button class="primary" onclick="FrontierSurvey16.scan(\''+id+'\')">確認掃描</button>');}
 function scan(id){if(!E.scan(R(),id))return;closeModal();save();render();preview(id);}
 function confirmEnter(id){const r=R(),n=E.find(r,id);if(!n||!FrontierExpedition.available(n))return;if(!r.survey16.surveyRevealedNodeIds.includes(id))r.survey16.surveyRevealedNodeIds.push(id);save();render();modal('確認前進 · '+info(n).name,'<p>'+esc(info(n).description)+'</p>'+(FrontierEnvironment.travelHint(n)?'<p>行進預估 · '+esc(FrontierEnvironment.travelHint(n))+'</p>':''),'<button onclick="closeModal()">取消</button><button class="primary" onclick="closeModal();FrontierExpedition.enterNode(\''+id+'\',true)">確認進入</button>');}
 function passage(id){const x=E.entrance(R());if(!x||x.id!==id)return;modal('失聯支道 · '+x.hint,payment(2)+'<p>額外探索 '+x.nodes.length+' 個連續節點的異常夾層，完成後回到第'+(x.layer+1)+'層、第'+(x.row+1)+'列的原合法選點，不取代主線或撤離。戰敗依一般規則結算；不保證稀有物資。整條支道只扣一次入場費。</p>','<button onclick="closeModal()">稍後決定</button><button onclick="FrontierSurvey16.skip(\''+id+'\')">放棄入口</button><button class="primary" '+(R().survey16.surveyIndex<2?'disabled':'')+' onclick="FrontierSurvey16.enter(\''+id+'\')">確認進入 · 2 勘察</button>');}
 function skip(id){if(!E.skip(R(),id))return;closeModal();save();render();}
 function beginRoom(){const r=R(),x=E.room(r);if(!x)throw Error('支道節點資料不完整');r.event=null;if(x.kind==='supply'||x.kind==='capture'&&x.seed%3===0)r.event={type:'camp',surveySupply16:true,passageKind:x.kind,room16:x.id};else{startBattle(x.kind==='combat'?'elite':'battle');r.battle.surveyPassage16=x.id;}save();render();}
 function enter(id){
  const r=R(),x=E.enter(r,id);if(!x)return;closeModal();
  if(!x.mainNode){beginRoom();return}
  r.event={type:'camp',surveyAdvance16:true,room16:E.room(r).id};save();render();
 }
 function openGate(n){
  const r=R(),e=r.expedition;
  if(r.curios?.offers?.length){FrontierCurios.viewOffer();return}
  FrontierEnvironment.enter(n);
  e.current=n.id;e.lastLane=n.lane;r.node=n.type;
  r.event={type:'camp',surveyGate16:n.passage16};save();render();
 }
 function leaveGate(id){
  const r=R(),e=r?.event;if(e?.surveyGate16!==id)return;
  if(!e.surveyReturned16&&!E.skip(r,id))return;
  completeNode();
 }
 function gateView(r,ev){
  const x=r.survey16.entrances.find(e=>e.id===ev.surveyGate16);
  if(!x)return false;
  const returned=ev.surveyReturned16;
  const choices=returned?'':`<button class="primary" ${r.survey16.surveyIndex<2?'disabled':''} onclick="FrontierSurvey16.enter('${x.id}')">進入深埋迷境 · 2 勘察</button>`;
  $('#app').innerHTML=runHeader()+`<section class="panel reward139-stage passage16-stage"><div class="passage16-emblem">${FrontierTrail.icon('passage')}</div><h1>樹籬之途</h1><p>${returned?'探索完畢。小隊已回到原本的路口。':'探索 '+x.nodes.length+' 站後返回主路線。'}</p><div class="reward139-options">${choices}<button onclick="FrontierSurvey16.leaveGate('${x.id}')">${returned?'返回主路線':'略過入口，沿主路前進'}</button></div></section>`;
  return true;
 }
 function routeState(r=R()){
  const e=r?.expedition,b=r?.survey16?.sideBranchReturnNode;
  const x=r?.survey16?.entrances.find(entry=>entry.id===b?.entrance);
  if(!x?.mainNode||!r.event?.surveyAdvance16)return null;
  const groups=[['battle','merchant'],['gift','camp'],['search','elite']];
  if(x.seed%2)[groups[0],groups[1]]=[groups[1],groups[0]];
  const rows=x.nodes.map((room,row)=>groups[row].map((kind,lane)=>({
   id:room.id+':'+kind,kind,type:kind==='gift'?'event':kind,storyEvent:kind==='gift'?'gift_choice':undefined,
   layer:e.layer,row,lane,mapX:lane?70:30,risk:kind==='elite'?2:kind==='battle'?1:0,
   links:x.nodes[row+1]?groups[row+1].map(next=>x.nodes[row+1].id+':'+next):[]
  })));
  const visited=(b.routeChoices||[]).filter(Boolean);
  return {...e,temporary:true,row:b.index,current:null,visited,graphVersion:2,atExit:false,layers:e.layers.map((layer,i)=>i===e.layer?{rows}:layer)};
 }
 function routeAvailable(n){return !!n&&n.row===routeState()?.row;}
 function routeNode(id){const e=routeState();return e?.layers[e.layer].rows.flat().find(n=>n.id===id);}
 function openTemporary(id){
  const n=routeNode(id);if(!routeAvailable(n))return;
  const r=R(),b=r.survey16.sideBranchReturnNode;
  (b.routeChoices??=[])[b.index]=id;
  r.event=null;r.node=n.type;
  FrontierEnvironment.enter(n);
  if(n.kind==='gift'){FrontierEncounters.openGift();return;}
  if(n.kind==='merchant'){FrontierTrading.fieldMerchant({...n,id:r.expedition.current});return;}
  r.choices=[n.type];
  globalThis.enter(n.type);
 }
 function passageMap(r){if(!routeState(r))return false;desktop();return true;}
 function proceed(id){const r=R();if(!r?.event?.surveyAdvance16||r.event.room16!==id||E.room(r)?.id!==id)return;beginRoom();}
 const supplyKey=(r,ev)=>'camp:'+ev.room16+':'+E.room(r)?.seed;
 const supplyOffer=(r,ev)=>r.equipment139?.offers.find(offer=>offer.key===supplyKey(r,ev));
 function supply(choice,roomId){const r=R(),ev=r?.event,b=r?.survey16?.sideBranchReturnNode;if(!b||!ev?.surveySupply16||roomId&&roomId!==ev.room16)return;if(ev.reward139){if(ev.reward139!=='module'||supplyOffer(r,ev))return;if(r.equipment139?.claimed.includes(supplyKey(r,ev))){completeNode();return}delete ev.reward139;}if(!['leave',...(ev.passageKind==='capture'?['capture']:['module','material'])].includes(choice))return;if(choice==='module'&&r.equipment139){FrontierEquipmentUI139.offer(supplyKey(r,ev));if(supplyOffer(r,ev))ev.reward139='module';else toast('PRTS｜沒有可選的模組，請選擇其他補給。');save();render();return;}if(choice==='material'){FrontierRewards139.material();completeNode();}else if(choice==='capture'){const defs=Object.values(FrontierInventory.definitions).filter(d=>d.category==='captureDevice'&&!d.retired&&d.rarity===Math.min(5,2+Math.floor(r.expedition.layer/2)));const d=defs[E.hash(b.entrance)%defs.length];if(!d)throw Error('收容補給資料不完整');r.field.materials[d.id]=(r.field.materials[d.id]||0)+1;FrontierGrid.sync();completeNode();}else if(choice==='leave')completeNode();}
 function gain(amount,reason,key){if(!active())return false;return E.change(R(),amount,reason,key);}
 function camp(){const r=R();if(!active()||r.event?.type!=='camp'||r.event.surveyGate16||r.event.reward139||(r.event.surveySupply16||r.event.surveyAdvance16)||r.survey16.surveyIndex===6)return;gain(1,'安全角落校準','camp:'+r.expedition.current);completeNode();}
 function buy(){const r=R(),ev=r?.event;if(!active()||ev?.type!=='fieldMerchant'||ev.surveySold16||!ev.surveyStock16||r.fieldPoints<16||r.survey16.surveyIndex===6)return;r.fieldPoints-=16;ev.surveySold16=true;gain(1,'行商訊號電池','merchant:'+r.expedition.current);save();render();}
 const start=startRun;startRun=function(...args){const prior=R(),out=start(...args);if(R()&&R()!==prior){E.init(R(),db.rng.seed,true);E.remember(R());save();render();}return out;};
 const enterNode=FrontierExpedition.enterNode;FrontierExpedition.enterNode=function(id,confirmed=false){if(active()){const r=R(),n=E.find(r,id);if(!n||!FrontierExpedition.available(n))return;if(!known(n)&&!confirmed){confirmEnter(id);return;}if(!r.survey16.surveyRevealedNodeIds.includes(id))r.survey16.surveyRevealedNodeIds.push(id);if(n.passage16&&!FrontierEndings.slot(n)){openGate(n);return}const x=E.entrance(r);if(x)E.skip(r,x.id);}return enterNode(id);};
 const oldPreview=FrontierExpedition.preview;FrontierExpedition.preview=id=>active()?preview(id):oldPreview(id);
 const complete=completeNode;completeNode=function(...args){const r=R(),s=r?.survey16;if(s?.sideBranchReturnNode&&!r.result){if(r.event?.surveyAdvance16)return;r.event=null;r.reward=null;r.battle=null;selected=null;if(E.nextRoom(r)){r.event={type:'camp',surveyAdvance16:true,room16:E.room(r).id};save();render();return;}const branch=s.sideBranchReturnNode,x=s.entrances.find(a=>a.id===branch.entrance);E.restore(r);if(x?.mainNode)return complete(...args);FrontierCombat.sync();save();render();return;}const out=complete(...args);if(active()){E.remember(R());save();}return out;};
 const check=checkBattle;checkBattle=function(...args){const r=R(),b=r?.battle,key=b?.operatorBattleId||r?.expedition.current;const win=b&&r.hp>0&&b.enemies.every(e=>e.hp<=0);const beforeModules=new Set(r?.equipment139?.modules.map(m=>m.uid)||[]),out=check(...args);if(active())for(const m of R().equipment139?.modules||[])if(!beforeModules.has(m.uid)&&!R().survey16.freshModules.includes(m.uid))R().survey16.freshModules.push(m.uid);if(active()&&win&&R().reward&&b.type==='elite'&&!r.survey16.receipts.includes('elite-roll:'+key)){r.survey16.receipts.push('elite-roll:'+key);if(r.survey16.counters.elite<2&&E.hash(db.rng.seed+':'+key+':survey')%100<25){r.survey16.counters.elite++;gain(1,'精英戰訊號回收','elite:'+key);save();render();}}return out;};
 const choose=FrontierAdventure.select;FrontierAdventure.select=function(accept){const r=R(),ev=r?.event,key=r?.expedition.current,def=FrontierAdventure.events[ev?.id],eligible=active()&&accept&&ev?.type==='frontierEvent'&&!ev.claimed&&(['trail_intel','anomaly_log','bell_keeper'].includes(ev.id)||['intel','scout'].includes(def?.effect));const out=choose(accept);if(eligible&&ev.claimed&&active()){if(def?.effect==='intel')r.intel=Math.max(0,r.intel-def.value);else if(ev.id==='trail_intel')r.intel=Math.max(0,r.intel-2);gain(1,'情報事件校準','event:'+key);save();render();}return out;};
 const findMaterial=FrontierTrail.materialFind;FrontierTrail.materialFind=function(...args){const r=R(),n=r?.expedition&&E.find(r,r.expedition.current);if(active()&&n?.hidden&&E.hash(db.rng.seed+':search:'+n.id)%100<30)gain(1,'異常搜索回波','search:'+n.id);return findMaterial(...args);};
 const containerSearch=FrontierExplorer.search;FrontierExplorer.search=function(box,...args){const searched=box?.sealed?.searchedInField,out=containerSearch(box,...args),r=R(),n=r?.expedition&&E.find(r,r.expedition.current);if(active()&&!searched&&box?.sealed?.searchedInField&&n?.hidden&&E.hash(db.rng.seed+':search:'+n.id)%100<30)gain(1,'異常搜索回波','search:'+n.id);return out;};
 const refreshTools=FrontierExplorer.refreshInformation;FrontierExplorer.refreshInformation=function(...args){if(active())E.remember(R());const out=refreshTools(...args);if(active())E.remember(R());return out;};
 const toolPreview=FrontierExplorer.preview;FrontierExplorer.preview=function(...args){const out=toolPreview(...args);if(active()){const s=R().survey16;for(const rows of Object.values(R().tools?.previews||{}))for(const row of rows)for(const n of row.nodes)if(!s.surveyRevealedNodeIds.includes(n.id))s.surveyRevealedNodeIds.push(n.id);save();}return out;};
 const qualityPreview=FrontierExplorer.previewQuality;FrontierExplorer.previewQuality=function(...args){if(active()&&FrontierExplorer.has(17)){const n=FrontierExplorer.futureRows().flatMap(row=>row.nodes).find(n=>n.type==='container');if(n&&!R().survey16.surveyRevealedNodeIds.includes(n.id))R().survey16.surveyRevealedNodeIds.push(n.id);}return qualityPreview(...args);};
 const scout=FrontierMedicine.scout;FrontierMedicine.scout=function(...args){const out=scout(...args);if(active())E.remember(R());return out;};
 const end=endRun;endRun=function(...args){const r=R();if(r?.survey16?.sideBranchReturnNode)E.restore(r,false);const out=end(...args);if(R()?.result&&R().survey16){R().survey16.surveyIndex=0;R().survey16.freshModules=[];save();}return out;};
 for(const name of ['camp']){const old=FrontierRewards139[name];FrontierRewards139[name]=function(...args){if(active()&&(R().event?.surveyGate16||R().event?.surveySupply16||R().event?.surveyAdvance16))return;return old(...args);};}
 const rest=campRest;campRest=function(...args){if(active()&&(R().event?.surveyGate16||R().event?.surveySupply16||R().event?.surveyAdvance16))return;return rest(...args);};
 const evView=eventView;eventView=function(){const r=R(),ev=r?.event;if(active()&&ev?.surveyGate16)return gateView(r,ev);if(active()&&ev?.surveyAdvance16&&passageMap(r))return;if(active()&&ev?.surveyAdvance16){$('#app').innerHTML=runHeader()+'<section class="panel reward139-stage"><h1>異常夾層 · 繼續深入</h1><p>前一節點已完成。新取得的模組可在下一場戰鬥前安裝或替換；舊模組仍需安全角落或層間配置。</p><button onclick="FrontierEquipmentUI139.manage()">配置新取得模組</button><button class="primary" onclick="FrontierSurvey16.proceed(\''+ev.room16+'\')">前往下一節點</button></section>';return;}if(active()&&ev?.surveySupply16){if(ev.reward139==='module'&&supplyOffer(r,ev))return FrontierRewards139.moduleChoice(supplyOffer(r,ev));$('#app').innerHTML=runHeader()+'<section class="panel event-panel reward139-stage"><small>PRTS / LOST-SIGNAL PASSAGE</small><h1>異常夾層 · '+(ev.passageKind==='capture'?'遺失的收容設施':'秘密補給室')+'</h1><p>僅選一項後前往下一節點；完成整條支道再返回主線。實體物資須裝入背包並成功撤離。</p><div class="reward139-options">'+(ev.passageKind==='capture'?'<button onclick="FrontierSurvey16.supply(\'capture\',\''+ev.room16+'\')">回收收容裝置</button>':'<button onclick="FrontierSurvey16.supply(\'module\',\''+ev.room16+'\')">局內增幅模組 · 三選一</button><button onclick="FrontierSurvey16.supply(\'material\',\''+ev.room16+'\')">回收一般物資</button>')+'<button onclick="FrontierSurvey16.supply(\'leave\',\''+ev.room16+'\')">放棄補給 · 繼續前進</button></div></section>';return;}const def=active()&&ev?.type==='frontierEvent'&&FrontierAdventure.events[ev.id];if(def&&(def.effect==='intel'||ev.id==='trail_intel')){const original=def.choice;def.choice='回收訊號，勘察指數 +1（不另給舊探索情報）';try{return evView()}finally{def.choice=original;}}return evView();};
 const claim=FrontierEquipmentUI139.claim;FrontierEquipmentUI139.claim=function(...args){const before=new Set(R()?.equipment139?.modules.map(m=>m.uid)||[]),out=claim(...args);if(active())for(const m of R().equipment139.modules)if(!before.has(m.uid)&&!R().survey16.freshModules.includes(m.uid))R().survey16.freshModules.push(m.uid);return out;};
 const marketModule=FrontierRewards139.buyModule;FrontierRewards139.buyModule=function(...args){const before=new Set(R()?.equipment139?.modules.map(m=>m.uid)||[]),out=marketModule(...args);if(active())for(const m of R().equipment139.modules)if(!before.has(m.uid)&&!R().survey16.freshModules.includes(m.uid))R().survey16.freshModules.push(m.uid);return out;};
 const beforeBattle=startBattle;startBattle=function(...args){if(active())R().survey16.freshModules=[];return beforeBattle(...args);};
 const install=FrontierEquipmentRegistry139.E.install;FrontierEquipmentRegistry139.E.install=function(state,cmd){const m=state.run?.equipment139?.modules.find(m=>m.uid===cmd.module);if(state.run?.survey16&&m&&!E.canModule(state.run,m,cmd.frame))throw Error('舊模組須在安全角落或層間配置；新取得模組可在下一場戰鬥前安裝。');return install(state,cmd);};
 function mount(){if(!active()||page!=='run')return;const r=R(),s=r.survey16,host=document.querySelector('.screen-workspace-body')||$('#app');if(!host)return;const b=s.sideBranchReturnNode;if(b&&!s.entrances.some(x=>x.id===b.entrance&&x.mainNode)&&!host.querySelector('.survey16-return')){const p=document.createElement('div');p.className='survey16-return';const branch=s.entrances.find(x=>x.id===b.entrance);p.textContent=(branch.mainNode?'深埋迷境':'異常夾層')+' · 第 '+(b.index+1)+'／'+r.survey16.entrances.find(x=>x.id===b.entrance).nodes.length+' 節點 · 完成後返回第'+(b.layer+1)+'層第'+(b.row+1)+'列；原撤離路線保留';const chain=document.createElement('div');chain.className='survey16-chain';chain.innerHTML=s.entrances.find(x=>x.id===b.entrance).nodes.map((n,i)=>'<span class="'+(i===b.index?'current':i<b.index?'done':'')+'">'+(i<b.index?'✓':i+1)+'<small>'+(i===b.index?'目前節點':i<b.index?'已完成':'未抵達')+'</small></span>').join('');p.append(chain);host.prepend(p);}if(r.event?.type==='fieldMerchant'&&r.event.surveyStock16===undefined)r.event.surveyStock16=E.hash(db.rng.seed+':'+r.expedition.current+':merchant16')%100<45;
  if(aliveRoute()&&!host.querySelector('.survey16-toolbar')){const bar=document.createElement('div');bar.className='survey16-toolbar';bar.innerHTML='<button onclick="FrontierSurvey16.details()">◎ 勘察 '+s.surveyIndex+'/6｜前方 '+view(s.surveyIndex)+'</button><small>'+esc(s.log.at(-1)?.reason||'PRTS 訊號正常')+'</small>';if(!host.querySelector('[data-survey16-indicator]'))host.prepend(bar);const x=E.entrance(r);if(x){const box=document.createElement('div');box.className='survey16-entrance';box.innerHTML='<b>⌁ 偵測到失聯支道</b><span>'+x.hint+' · '+x.nodes.length+' 個節點 · 2 勘察</span><button onclick="FrontierSurvey16.passage(\''+x.id+'\')">'+(s.surveyIndex<2?'勘察不足 · 查看':'調查入口')+'</button><button onclick="FrontierSurvey16.skip(\''+x.id+'\')">放棄</button>';if(bar.isConnected)bar.after(box);else host.querySelector('.ui-route-summary')?.after(box);}if(s.surveyIndex===6){const n=r.expedition.layers[r.expedition.layer].rows[r.expedition.row]?.find(n=>E.possible(r).has(n.id));if(n){const p=document.createElement('p');p.className='survey16-preview';p.textContent='精準預覽：'+info(n).name+' · 危險級 '+n.risk+'/3';bar.after(p);}}}
  if(!r.equipment139&&r.event?.type==='camp'&&!r.event.surveyGate16&&!r.event.reward139&&!r.event.surveySupply16&&!r.event.surveyAdvance16&&!host.querySelector('[data-survey16-camp]')){const button=document.createElement('button');button.dataset.survey16Camp='';button.className='reward139-option';button.disabled=s.surveyIndex===6;button.textContent=button.disabled?'勘察已滿（6/6）':'校準勘察 +1 · 放棄本次其他休整獎勵';button.onclick=()=>FrontierRuntime.perform('survey16-camp',camp);(host.querySelector('.reward139-options')||host).append(button);}
  if(r.event?.type==='fieldMerchant'&&r.event.surveyStock16&&!host.querySelector('[data-survey16-buy]')){const button=document.createElement('button');button.dataset.survey16Buy='';button.className='reward139-option';button.disabled=r.event.surveySold16||r.fieldPoints<16||s.surveyIndex===6;button.textContent=(r.event.surveySold16?'已售出':'訊號電池 · 勘察 +1 · 16 源石碇');button.onclick=()=>FrontierRuntime.perform('survey16-buy',buy);host.append(button);}
 }
 const draw=render;render=function(...args){if(active())E.remember(R());const out=draw(...args);mount();return out;};

 function temporaryInfo(n){const kind=n.kind,name=kind==='gift'?'得償所願':FrontierExpedition.nodeNames[n.type];return {kind,name,image:FrontierTrail.icon(kind),description:name};}
 function desktop(){
  const r=R(),e=routeState(r)||r.expedition,rows=e.layers[e.layer].rows,all=rows.flat(),visited=new Set(e.visited),possible=e.temporary?new Set(rows.slice(e.row).flat().map(n=>n.id)):E.possible(r),height=rows.length*92+70;
  const lateral=new Set(e.temporary?[]:FrontierExpedition.lateralTargets(e));
  const paths=all.flatMap(n=>n.links.map(id=>{const to=all.find(x=>x.id===id);if(!to)return '';const x=n.mapX*3,y=42+n.row*92,xx=to.mapX*3,yy=42+to.row*92;return '<path class="'+(visited.has(n.id)&&visited.has(to.id)?'travelled':possible.has(n.id)&&possible.has(to.id)?'possible':'')+'" d="M'+x+' '+y+' C'+x+' '+(y+40)+' '+xx+' '+(yy-40)+' '+xx+' '+yy+'"/>';})).join('')+(e.lateralRoutes||[]).map(([a,b])=>{
   const from=all.find(n=>n.id===a),to=all.find(n=>n.id===b);
   return from&&to?'<path class="route-lateral-edge'+(lateral.has(a)||lateral.has(b)?' route-lateral-ready':'')+'" d="M'+from.mapX*3+' '+(42+from.row*92)+' H'+to.mapX*3+'"/>':'';
  }).join('');
  const buttons=all.map(n=>{const d=e.temporary?temporaryInfo(n):info(n);return '<button class="ui-route-node route-type-'+d.kind+' '+((e.temporary?routeAvailable(n):FrontierExpedition.available(n))?'reachable':visited.has(n.id)?'completed':'')+(lateral.has(n.id)?' route-lateral-target':'')+'" style="left:'+n.mapX+'%;top:'+(n.row*92+16)+'px" data-route-id="'+n.id+'" aria-label="'+esc(d.name)+'" oncontextmenu="return false" onpointerdown="FrontierScreen.routePress(event,\''+n.id+'\')" onclick="FrontierScreen.routeClick(\''+n.id+'\')">'+d.image+(lateral.has(n.id)?'<span class="route-lateral-cost">−1</span>':'')+'</button>';}).join('');
  $('#app').innerHTML=runHeader()+'<section class="survey16-desktop">'+(e.temporary?'<header class="ui-route-summary"><h2>深埋迷境'+indicator()+'</h2><span>'+e.row+'/'+rows.length+' 站</span></header>':'')+(e.atExit?'<div class="ui-exit"><button onclick="FrontierExpedition.extract()">安全撤離</button><button onclick="FrontierExpedition.advance()">繼續深入</button></div>':'')+'<div class="survey16-desktop-scroll"><div class="survey16-desktop-tree ui-route-map" style="height:'+height+'px"><svg aria-hidden="true" viewBox="0 0 300 '+height+'" preserveAspectRatio="none">'+paths+'</svg>'+buttons+'</div></div><section class="survey16-desktop-tools panel"><button onclick="FrontierEquipmentUI139.manage()">配置局內增幅模組</button><button onclick="emergency()">緊急撤出</button></section>'+bagHtml()+FrontierMedicine.view()+FrontierMedicine.routeIntel()+(r.story?.flags.specialExit&&e.layer===3?'<button onclick="FrontierAdventure.specialExit()">歧路歸航 · 特殊撤離</button>':'')+'</section>';
 }

 const valid=validSave;validSave=function(v){return E.valid(v.run)&&valid(v);};
 return{indicator,routeState,routeAvailable,routeNode,openTemporary,temporaryInfo,active,known,info,details,preview,confirmScan,scan,confirmEnter,payment,passage,skip,enter,supply,proceed,leaveGate,gain,camp,buy,mount,desktop};
})();
