'use strict';
window.FrontierExpedition=(()=>{
 const regions=[['chernobog','切爾諾伯格廢墟','污染與工業殘骸','poison'],['lungmen','龍門外環','都市追擊與情報','pursuit'],['siesta','汐斯塔火山','灼燒與火山研究','burn'],['sargon','薩爾貢沙海','沙塵、補水與疲勞','fatigue'],['kazimierz','卡西米爾','騎士、穿甲與賞金','armor'],['kjerag','謝拉格雪境','低溫、凍結與搜救','cold'],['siracusa','敘拉古','追蹤、伏擊與幫派','bleed'],['columbia','哥倫比亞','機械、科研與改裝','machine'],['victoria','維多利亞','複合戰線與精英','war'],['iberia','伊比利亞','海嗣與神經損傷','neural'],['sami','薩米','低溫、異常與隱藏調查','anomaly'],['kazdel','卡茲戴爾','薩卡茲、詛咒與高危研究','corrosion']].map(([id,name,theme,element],i)=>({id,name,theme,element,index:i+1}));
 const difficulties={normal:{name:'普通',hp:1,attack:1},hard:{name:'困難',hp:1.12,attack:1.07},extreme:{name:'極危',hp:1.24,attack:1.14}};
 const nodeNames={battle:'普通作戰',elite:'緊急作戰',boss:'命運交鋒',search:'塵封之所',camp:'安全的角落',event:'不期而遇',signal:'不期而遇',container:'塵封之所',merchant:'詭異行商'};
 function ensure(){if(!db.regions)db.regions={version:1,highestUnlocked:1,cleared:{},visits:{}};return db.regions}
 const current=()=>R()?.expedition;
 function difficultyAllowed(regionId,difficulty,state=ensure()){
  const region=regions.find(r=>r.id===regionId);
  if(!region||region.index>state.highestUnlocked)return false;
  if(difficulty==='normal'||difficulty==='hard')return true;
  const previous={extreme:'hard',torment:'extreme'}[difficulty];
  return !!previous&&!!state.cleared[regionId+':'+previous];
 }
 function create(regionId,difficulty,mode){
 const weighted=mode==='highrisk'?['search','search','search','search','battle','battle','elite','camp','event','merchant']:['battle','battle','search','search','event','merchant','camp'];
 const counts=mode==='highrisk'?[4+rnd(3),4+rnd(3),4+rnd(3)]:mode==='scout'?[3+rnd(3)]:[4+rnd(2),5+rnd(2),6+rnd(2),6+rnd(2),7+rnd(2)],layers=[];
 for(let layer=0;layer<counts.length;layer++){
  const rows=[];
  for(let row=0;row<counts[layer];row++){
   const boss=mode==='standard'&&[2,4].includes(layer)&&row===counts[layer]-1,width=boss?1:2+rnd(4),slots=boss?[2]:width===2?[0,4]:width===3?[0,2,4]:width===4?[0,...shuffle([1,2,3]).slice(0,2).sort(),4]:[0,1,2,3,4];
   const rowTypes=new Map(),searchAnchor=mode==='highrisk'?(row+layer)%width:-1;
   const fixed=boss?'boss':mode!=='highrisk'&&layer===0&&row===0?'battle':mode==='standard'&&layer===0&&row===counts[layer]-1?'merchant':mode==='standard'&&layer===3&&row===Math.floor(counts[layer]/2)?'camp':null;
   rows.push(slots.map((lane,index)=>{
    const pool=index===searchAnchor?['search']:weighted;
    const searchLimit=mode==='highrisk'?(width>=4?2:1)-Number(index<searchAnchor):1;
    const ranked=pool.filter(type=>(rowTypes.get(type)||0)<(type==='search'?searchLimit:1));
    const choices=ranked.length?ranked:pool;
    const previous=rows[row-1]?.reduce((best,node)=>!best||Math.abs(node.lane-lane)<Math.abs(best.lane-lane)?node:best,null);
    const different=choices.filter(type=>type!==previous?.type);
    const type=fixed||pick(different.length?different:choices);
    rowTypes.set(type,(rowTypes.get(type)||0)+1);
    return {id:regionId+':'+difficulty+':'+layer+':'+row+':'+lane,layer,row,lane,mapX:boss?50:Math.max(10,Math.min(90,10+lane*20+(rnd(5)-2))),type,hidden:!boss&&index===slots.length-1&&layer>=2&&rnd(5)===0,risk:type==='boss'?3:type==='elite'?2:type==='battle'?1:0,reward:index===0?'基礎物資':index===slots.length-1?'研究／收容':'軍械／補給',links:[]};
   }));

  }
  for(let row=0;row<rows.length-1;row++){
   const from=rows[row],to=rows[row+1],edge=(a,b)=>{if(!a.links.includes(b.id))a.links.push(b.id)};
   from.forEach((n,i)=>edge(n,to[Math.round(i*(to.length-1)/Math.max(1,from.length-1))]));
   to.forEach((n,j)=>{if(!from.some(x=>x.links.includes(n.id)))edge(from[Math.round(j*(from.length-1)/Math.max(1,to.length-1))],n)});
   // Optional adjacent forks must not cross existing routes or connect every branch.
   from.forEach((n,i)=>{if(to.length<2||random()>.3)return;const nearest=Math.round(i*(to.length-1)/Math.max(1,from.length-1)),j=Math.max(0,Math.min(to.length-1,nearest+(rnd(2)?1:-1)));if(from.every((other,k)=>other.links.every(id=>{const target=to.findIndex(x=>x.id===id);return k<i?target<=j:k>i?target>=j:true})))edge(n,to[j])});
  }
  layers.push({rows});
 }
 return{version:1,rulesVersion:15,graphVersion:2,regionId,difficulty,mode,lateralRoutes:mode==='standard'?layers.flatMap(({rows},layer)=>{if(layer===0||layer===4)return [];const row=rows[1+rnd(Math.max(1,rows.length-3))];const i=rnd(row.length-1);return [[row[i].id,row[i+1].id]];}):[],layer:0,row:0,lastLane:1,layers,visited:[],current:null,atExit:false,completedLayers:[],fullClear:false};
}
 const oldPrepare=prepare;prepare=function(){oldPrepare();const state=ensure();$('#app').insertAdjacentHTML('beforeend',`<section class="panel"><h3>選擇地區與遠征</h3><select id="exp-region">${regions.map(r=>`<option value="${r.id}" ${r.index>state.highestUnlocked?'disabled':''}>${r.index}. ${r.name}${r.index>state.highestUnlocked?'（完成前區解鎖）':''}</option>`).join('')}</select><select id="exp-difficulty">${Object.entries(difficulties).map(([id,d])=>`<option value="${id}">${d.name}</option>`).join('')}</select><p class="tiny muted">地區解鎖即開放普通與突襲；通關後開放下一區。五層共30～33站，第三／五層首領；第二／三／四層可提前撤離。</p></section>`)};
 const oldStart=startRun;startRun=function(){const regionId=document.querySelector('#exp-region')?.value||regions[0].id,difficulty=document.querySelector('#exp-difficulty')?.value||'normal',mode=document.querySelector('#highrisk174-mode')?.checked?'highrisk':'standard',state=ensure();if(!difficulties[difficulty]||!difficultyAllowed(regionId,difficulty,state)){toast('此地區或難度尚未解鎖。');return}const previous=R();oldStart();if(R()&&R()!==previous&&R().team){R().expedition=create(regionId,mode==="highrisk"?"torment":difficulty,mode);R().depth=0;R().step=0;R().fieldPoints=0;if(mode==='highrisk')R().alert=20;state.visits[regionId]=(state.visits[regionId]||0)+1;render()}};
 const oldHeader=runHeader;runHeader=function(){const e=current();if(!e)return oldHeader();const region=regions.find(r=>r.id===e.regionId),layer=e.layers[e.layer],r=R();return `<div class="row between run-top"><div><div class="eyebrow">RAID ${r.number} / ${difficulties[e.difficulty].name} / ${e.mode==='scout'?'短程偵察':e.mode==='highrisk'?'高危探索':(e.extension?e.layers.length+'層遠征':'五層遠征')}</div><h2>${region.name}</h2><p class="tiny muted">第${e.layer+1}層 · ${e.row}/${layer.rows.length}站 · 總深入${r.depth}站</p></div><span class="badge">存活 ${r.team.filter(a=>a.hp>0).length}/${r.team.length} · 警戒 ${r.alert??(r.expedition?.mode==="highrisk"?20:0)}</span></div><div class="progress"><b style="width:${e.row/layer.rows.length*100}%"></b></div>`};
 function routeAnchor(e=current()){
  return e?.row>0&&(e.lateralCrossing?.layer===e.layer&&e.lateralCrossing.row===e.row-1
   ?e.layers[e.layer].rows[e.row-1]?.find(n=>n.id===e.lateralCrossing.to)
   :e.layers[e.layer].rows[e.row-1]?.findLast(n=>e.visited.includes(n.id)));
 }
 function lateralTargets(e=current()){
  const r=R(),anchor=routeAnchor(e);
  if(!e?.lateralRoutes||!anchor||e.atExit||r.battle||r.event||r.reward||r.result||e.lateralCrossing?.layer===e.layer&&e.lateralCrossing.row===anchor.row)return [];
  return e.lateralRoutes.filter(pair=>pair.includes(anchor.id)).map(pair=>pair.find(id=>id!==anchor.id));
 }
 function crossRoute(id){
  const r=R(),e=current(),anchor=routeAnchor(e);
  if(!lateralTargets(e).includes(id))return;
  if(!r.survey16?.surveyIndex){toast('PRTS｜橫向捷徑需要 1 勘探點數。');return;}
  if(!FrontierSurvey16.gain(-1,'通過橫向捷徑','cross:'+e.layer+':'+anchor.row))return;
  e.lateralCrossing={layer:e.layer,row:anchor.row,from:anchor.id,to:id};
  if(FrontierEnvironment.current()?.rulesVersion>=3)FrontierEnvironment.enter({type:'traverse'});
  save();render();
 }
 function available(node){
 const e=current(),r=R();if(!e||!node||e.atExit||r.battle||r.event||r.reward||r.result||node.layer!==e.layer||node.row!==e.row)return false;
 let connected;if(e.graphVersion>=2){const previous=routeAnchor(e);connected=e.row===0||!!previous?.links.includes(node.id)}else connected=Math.abs(node.lane-e.lastLane)<=1;
 return connected&&(window.FrontierEnvironment?.routeAccessible(node)??true);
}
 function preview(id){const e=current(),node=e?.layers.flatMap(l=>l.rows.flat()).find(n=>n.id===id);if(!node)return;const region=regions.find(r=>r.id===e.regionId),scout=Math.max(R().scoutLevel||0,node.medicineIntel||0);modal(node.hidden&&scout<4&&!node.toolRevealed?'未知路線':(window.FrontierTrail?.nodeName(node)||nodeNames[node.type]),`<p>${region.theme}</p>${node.toolInfo?'<p>'+esc(node.toolInfo)+'</p>':''}<p>${scout>=1?'風險 '+node.risk+'/3':'尚無精確風險情報'}${scout>=3?' · 路線：'+node.reward:''}</p><p class="tiny muted">${node.hidden&&scout<4?'附近存在尚未辨識的訊號。':node.hidden?'偵察已揭露隱藏調查支線。':'敵人會顯示攻擊目標與狀態，可先準備對應的戰術補給。'}${scout>=2?'<br>補給上限：'+(node.containerQuality?FrontierContainers.qualityLabel(node.containerQuality):node.type==='boss'?'金階':node.type==='elite'?'銀階':'綠～藍階'):''}</p>`,available(node)?`<button class="primary" onclick="closeModal();FrontierExpedition.enterNode('${id}')">進入節點</button><button onclick="closeModal()">返回地圖</button>`:'<button onclick="closeModal()">返回地圖</button>')}
 function environment(node){if(R()?.environment)return;const r=R(),region=regions.find(x=>x.id===current().regionId),n=r.depth;const actor=r.team.filter(a=>a.hp>0).sort((a,b)=>a.res-b.res)[0];if(!actor)return;if(bagSize()/capacity()>.85){if(r.weightWard)r.weightWard=0;else r.alarm++}if(region.element==='fatigue'&&n>0&&n%3===0){if(r.staminaWard)r.staminaWard=0;else if(r.fatigueConvert){actor.hp=Math.min(actor.max,actor.hp+2);r.fatigueConvert=0;r.scoutLevel=Math.max(r.scoutLevel||0,2)}else actor.hp=Math.max(1,actor.hp-2)}if(n>0&&n%4===0&&['poison','burn','cold','neural','corrosion','bleed'].includes(region.element)){if(region.element==='poison'&&r.poisonFogShield)r.poisonFogShield=0;else if(region.element==='neural'&&r.neuralGuard>0)r.neuralGuard--;else FrontierMedicine.inflict(actor,region.element,1)}if(region.element==='pursuit'&&node.lane===1)r.alarm++;FrontierCombat.sync()}
 const oldEnter=enter;
 function enterNode(id){const e=current(),node=e?.layers[e.layer].rows[e.row]?.find(n=>n.id===id);if(!available(node))return;environment(node);e.current=id;e.lastLane=node.lane;R().choices=[node.type==='container'?'search':node.type==='merchant'?'event':node.type];R().node=node.type;if((node.type==='container'||node.type==='search')&&window.FrontierContainers){FrontierContainers.openNode(node);return}if(node.type==='merchant'&&window.FrontierTrading){FrontierTrading.fieldMerchant(node);return}oldEnter(R().choices[0])}
 function advance(){const e=current();if(!e?.atExit||e.layer>=e.layers.length-1)return;e.atExit=false;e.layer++;e.row=0;e.lastLane=1;R().step=e.layer;render()}
 const oldComplete=completeNode;completeNode=function(){const e=current(),r=R();if(!e)return oldComplete();if(!e.current||r.result)return;r.event=null;r.reward=null;r.battle=null;selected=null;e.visited.push(e.current);r.history.push({source:e.current,at:Date.now()});e.current=null;e.row++;r.depth++;if(r.skipMoveAlarm)r.skipMoveAlarm=0;else r.alarm++;r.intel++;r.fieldPoints+=3;FrontierCombat.sync();if(e.row>=e.layers[e.layer].rows.length){e.completedLayers.push(e.layer+1);if(e.mode==='scout'){endRun('extract');return}if(e.mode==='highrisk'){e.atExit=true;save();render();return}if(e.layer>=4){const path=window.FrontierEndings?.nextExtension(r,e.layer);if(path){if(e.layer===4)e.fifthEnding=FrontierEndings.bossPath(r,4);FrontierEndings.sixthLayer(e,path);e.layer++;e.row=0;e.lastLane=1;r.step=e.layer;FrontierAdventure.note('extension_open','第'+(e.layer+1)+'層已開啟，隊伍與物資延續；下一首領：'+FrontierEndings.finalBoss(e.layer));save();render();return}}if(e.layer>=4){e.fullClear=true;r.step=e.layer+1;endRun('win');return}if(e.rulesVersion>=14?e.layer===2:[1,2,3].includes(e.layer))e.atExit=true;else{e.layer++;e.row=0;e.lastLane=1;r.step=e.layer}}save();render()};
 function evacuationCost(r){
  if(r.expedition.mode!=='highrisk')return 0;
  const alert=r.alert||0;
  return alert>=90?18:alert>=75?12:alert>=50?6:0;
 }
 function confirmExtraction(){
  const r=R(),e=current();
  if(!e?.atExit||r.result||r.battle)return;
  const required=evacuationCost(r);
  const paid=Math.min(required,r.fieldPoints||0);
  r.fieldPoints=(r.fieldPoints||0)-paid;
  if(required)r.searchEvacuation174={sector:e.layer,alert:r.alert,paid};
  closeModal();
  endRun('extract');
 }
 function extract(){
  const r=R();
  if(!current()?.atExit)return;
  const cost=evacuationCost(r),paid=Math.min(cost,r.fieldPoints||0);
  const warning=cost?'<p>目前警戒：'+r.alert+'。疏散小隊將使用 '+paid+' 枚源石碇準備撤離。資源不足仍可撤離。</p>':'';
  modal('安全撤離？','<p>結算已裝入的物資與活體。</p>'+warning,'<button class="primary" onclick="FrontierExpedition.confirmExtraction()">確認撤離</button><button onclick="closeModal()">繼續規劃</button>');
 }
 const oldRoute=routeView;routeView=function(){const e=current();if(!e)return oldRoute();if(window.FrontierSurvey16?.active()&&!matchMedia('(max-width:720px)').matches)return FrontierSurvey16.desktop();const layer=e.layers[e.layer],r=R();$('#app').innerHTML=runHeader()+`<div class="layout"><section>${e.atExit?`<section class="panel extraction-call"><h3>第${e.layer+1}層已完成 · 撤離車隊抵達</h3><button class="primary" onclick="FrontierExpedition.extract()">安全撤離</button><button onclick="FrontierExpedition.advance()">進入第${e.layer+2}層</button></section>`:''}<div class="expedition-map">${layer.rows.map((row,i)=>`<div class="map-stage"><span class="map-row-label">${i+1}</span><div class="map-nodes">${row.map(node=>{const visited=e.visited.includes(node.id),can=available(node);return `<button class="map-node ${visited?'visited':can?'reachable':'future'} ${node.risk>=2?'risky':''}" onclick="FrontierExpedition.preview('${node.id}')" ${!can&&i>e.row&&Math.max(r.scoutLevel||0,node.medicineIntel||0)<2&&!node.toolRevealed?'disabled':''}><small>${visited?'已通過':i===e.row&&window.FrontierEnvironment&&!FrontierEnvironment.routeAccessible(node)?'高潮封鎖':can?'可抵達':'路線預覽'}</small><b>${node.hidden&&Math.max(r.scoutLevel||0,node.medicineIntel||0)<4&&!node.toolRevealed?'異常訊號':i>e.row&&Math.max(r.scoutLevel||0,node.medicineIntel||0)<2&&!node.toolRevealed?'未知路線':nodeNames[node.type]}</b><span>${(e.graphVersion>=2?'分支 '+(node.lane+1):['物資線','交戰線','調查線'][node.lane])}</span>${Math.max(r.scoutLevel||0,node.medicineIntel||0)>=1?'<small>風險 '+node.risk+'/3</small>':''}${Math.max(r.scoutLevel||0,node.medicineIntel||0)>=3?'<small>'+node.reward+'</small>':''}${Math.max(r.scoutLevel||0,node.medicineIntel||0)>=4&&node.containerQuality>=4?'<small>高階容器 '+FrontierContainers.qualityLabel(node.containerQuality)+'</small>':''}</button>`}).join('')}</div></div>`).join('')}</div><button onclick="emergency()">緊急撤出 · 放棄未保護物資</button></section><aside>${bagHtml()}${FrontierMedicine.view()}${FrontierMedicine.routeIntel()}</aside></div>`};
 const oldBattle=startBattle;startBattle=function(type,pending){oldBattle(type,pending);const e=current(),b=R()?.battle;if(!e||!b)return;const region=regions.find(r=>r.id===e.regionId),difficulty=difficulties[e.difficulty],layer=e.layer;for(const enemy of b.enemies){const max=enemy.boss?42:type==='elite'?26:18+layer;enemy.max=Math.round(max*(1+.07*layer)*difficulty.hp*(1+(region.index-1)*.015));enemy.hp=enemy.max;enemy.atk=Math.round((enemy.boss?10:type==='elite'?8:6)*(1+.04*layer)*difficulty.attack)+Math.min(3,Math.floor(R().alarm/12));if(!enemy.regionRoster){if(region.element==='armor')enemy.def=(enemy.def||0)+20;if(region.element==='machine')enemy.block+=30;if(['poison','burn','cold','neural','corrosion','bleed'].includes(region.element)){enemy.status=region.element;enemy.statusStacks=1;enemy.element=region.element}if(enemy.boss){enemy.name=region.name+' · 封鎖指揮';enemy.regionBoss=true;enemy.baseDef=enemy.def||0}}}b.regionStatsReady=true;render()};
 const oldIntent=intentText;intentText=function(enemy){const text=oldIntent(enemy);return text+(enemy.status&&enemy.intent==='attack'?' · '+({poison:'中毒',burn:'灼燒',cold:'寒冷',neural:'神經',corrosion:'腐蝕',bleed:'流血'})[enemy.status]+'+1':'')};
 const oldEnd=endRun;endRun=function(result,index){const r=R();if(!r||r.result)return;oldEnd(result,index);const e=current();if(!e||r.regionSettled||!r.result)return;r.regionSettled=true;const state=ensure();if(result==='win'&&e.fullClear&&e.mode!=='highrisk'){const key=e.regionId+':'+e.difficulty;if(!state.cleared[key]){state.cleared[key]={at:Date.now(),run:r.number};db.wallet.originium++;r.firstClearOriginium=1}{const region=regions.find(x=>x.id===e.regionId);state.highestUnlocked=Math.min(12,Math.max(state.highestUnlocked,region.index+1))}}save();render()};
 const oldValid=validSave;validSave=function(v){if(!oldValid(v))return false;const p=v.regions;if(p&&(p.version!==1||!Number.isInteger(p.highestUnlocked)||p.highestUnlocked<1||p.highestUnlocked>12||!p.cleared||!p.visits))return false;const e=v.run?.expedition;if(!e)return true;return e.version===1&&regions.some(r=>r.id===e.regionId)&&difficulties[e.difficulty]&&['standard','scout','highrisk'].includes(e.mode)&&Array.isArray(e.layers)&&(e.mode==='highrisk'?e.layers.length===3&&e.layers.every(l=>l.rows.length>=4&&l.rows.length<=6):e.mode==='scout'?e.layers.length===1:e.extension?e.layers.length>=6&&e.layers.length<=7&&[1,2].includes(e.extension.version)&&e.layers.slice(5).every((extra,j)=>extra.rows.length===4&&extra.rows.every((row,i)=>row.length<=(i?1:2)&&row.every(n=>n.layer===5+j&&n.row===i&&(i===0?['search','camp'].includes(n.type):n.type===['','elite','merchant','boss'][i])))):e.layers.length===5)&&Number.isInteger(e.layer)&&e.layer>=0&&e.layer<e.layers.length&&Number.isInteger(e.row)&&e.row>=0&&e.row<=e.layers[e.layer].rows.length&&Array.isArray(e.visited)&&new Set(e.visited).size===e.visited.length&&e.layers.every(l=>Array.isArray(l.rows)&&l.rows.every(row=>Array.isArray(row)&&(e.graphVersion>=2?row.length>=1&&row.length<=5:row.length===3)&&row.every(n=>typeof n.id==='string'&&nodeNames[n.type]&&Array.isArray(n.links))))};
 ensure();
 return{regions,difficulties,nodeNames,ensure,difficultyAllowed,current,create,available,routeAnchor,lateralTargets,crossRoute,preview,enterNode,advance,extract,confirmExtraction,environment};
})();
