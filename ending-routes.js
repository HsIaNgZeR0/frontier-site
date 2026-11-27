'use strict';
window.FrontierEndings=(()=>{
 const regions={
  chernobog:['封鎖頻譜','地下列車長','熔斷鑰匙','零號熔爐','追捕失控的列車','切斷地下供電'],
  lungmen:['監控底片','無面督察','封存通行證','灰市總管','奪回追蹤檔案','移交黑市證詞'],
  siesta:['地震儀讀數','火山巡守者','耐熱採樣筒','熔岩孵化體','進入封鎖採樣區','封存失控樣本'],
  sargon:['沙刻星圖','失落王庭守衛','綠洲契據','沙海徵稅官','穿越王庭伏擊','贖回綠洲水權'],
  kazimierz:['除名名冊','退役冠軍','無徽挑戰書','無冕雙騎','應戰退役騎士','公開挑戰契約'],
  kjerag:['失落索道圖','雪線守望者','凍裂祭鈴','霜幕儀仗','清除索道伏兵','將祭鈴送抵雪線'],
  siracusa:['宴席名帖','無席之狼','公證封蠟','黑幕公證人','闖入家族宴席','保全公證卷宗'],
  columbia:['實驗迴路板','失控監管機','專利保險匣','拼接試驗體','回收實驗主機','拆除專利保險匣'],
  victoria:['中止命令','失聯近衛長','戰地封條','鋼鐵行軍隊','解除近衛包圍','送出停火密令'],
  iberia:['潮汐譜','沉默瞭望官','裂紋燈芯','逐光集群','登上斷橋瞭望台','重燃離岸燈塔'],
  sami:['逆風羅盤','冰原迷途者','無影拓片','無影林地','護送定位信標','解讀無影拓片'],
  kazdel:['殘響錄音','失名傳令者','斷齒盟印','契約代行者','奪回傳令陣地','裁定盟印的歸屬'],
  yan:['司歲台殘卷','玉門蜃影','無病害的稻種','田間化物','追索「睚」的蜃景','引水沖刷病田']
 };
 const definitions=Object.fromEntries(Object.entries(regions).map(([id,row],i)=>[id,{
  fate:{key:row[0],boss:FrontierEnemyData.units[FrontierRegionalRoster[id].bosses.fate.id].name,trial:row[4],steps:i%3===1?['fight','report']:['fight'],profile:i%4},
  exchange:{key:row[2],boss:FrontierEnemyData.units[FrontierRegionalRoster[id].bosses.exchange.id].name,trial:row[5],steps:i%3===0?['intel']:i%3===1?['pay','fight']:['fight','intel','report'],profile:(i+2)%4}
 }]));
 const epilogues={
  chernobog:['末班列車載著逃離封鎖的居民駛出地底，月台終於亮起綠燈。','零號熔爐停止供能。倖存者收回地下供電站，把電力送回地面。'],
  lungmen:['監控底片送到證人手中，外環的追捕名單第一次由居民共同查證。','灰市帳冊被公開，曾被扣押的通行證回到它們的主人手中。'],
  siesta:['巡守者倒下後，地震儀留下完整讀數。撤離警報比下一次噴發早響了一夜。','孵化巢被封存，採樣員在冷卻的火山口立下第一根安全標竿。'],
  sargon:['沙刻星圖重回王庭遺址，商隊照著星圖找到一條不經伏擊區的夜路。','綠洲的水權交還居民，水井旁原本收取通行費的鐵欄被拆下。'],
  kazimierz:['冠軍放下劍，讓除名騎士登記真名。決鬥場外的人第一次聽見那些名字。','無徽挑戰書成了公開契約。雙騎落敗後，無徽騎士也能以自己的名義入場。'],
  kjerag:['索道恢復運轉，巡山隊從守望者留下的路標找回被困旅人。','祭鈴被帶到雪線，儀仗散去後，山下終於聽見搜救隊的回鈴。'],
  siracusa:['宴席名帖在空桌上依序攤開，從未被承認的客人各自帶走一張。','公證卷宗存入中立檔案室。這一次，契約的見證人都活著離開。'],
  columbia:['監管機停下後，研究員從循環回放中辨認出第一筆被遮掩的事故。','保險匣打開，試驗體的名單與專利一同公開。實驗室的出口不再上鎖。'],
  victoria:['中止命令抵達近衛隊，前線的信號燈換成撤退色，失聯部隊得以歸隊。','停火密令順利送達，鋼鐵行軍在街口止步，醫療車隊先通過街道。'],
  iberia:['瞭望台的鏡面轉向海面，最後一班船避開了潮汐譜上標記的黑水。','離岸燈塔重新點燃。逐光集群退回礁石外，岸上的漁船終於敢回港。'],
  sami:['定位信標穿過風雪，把迷途者的路線留給下一支搜救隊。','拓片對準樹影時，林道第一次有了固定方向。歸途的腳印沒有消失。'],
  kazdel:['傳令者的錄音播放完畢，前哨明白那道延續多年的命令早已撤銷。','盟印的保管權交由倖存者共同裁定，代行者簽下的舊契約就此失效。'],
  yan:['蜃景散去，玉門的天災工事重新點亮烽燧。司歲台的殘卷記下「睚」這一次的去向。','清水流過田畦，病害退去，新的稻種在祟消散的地方發了芽。']
 };
 for(const [id,d]of Object.entries(FrontierRegionDesign75.regions))definitions[id].fourth={key:d.key,boss:d.boss,trial:d.trial,steps:({lungmen:['intel','fight'],siesta:['fight','intel'],sargon:['pay','fight'],siracusa:['pay','fight'],columbia:['intel','fight'],victoria:['fight','pay'],iberia:['intel','fight'],yan:['fight','intel']})[id]||['fight','report'],profile:0};
 const labels={fate:'命運的岔路',exchange:'未竟的約定',fourth:'遠方的回聲'};
 const eventIds={fate:'ending_fate_entry',exchange:'ending_exchange_entry',follow:'ending_followup'};
 for(const id of Object.values(eventIds))FrontierAdventure.events[id]={id,title:'命運分歧',choice:'接續故事線索'};
 const info=()=>R()?.endingRoute;
 const progress=(kind,r=R())=>r?.endingRoute?.version===2?r.endingRoute.branches[kind]:r?.endingRoute;
 const route=(kind,r=R())=>definitions[r?.expedition?.regionId]?.[kind];
 const eventPath=e=>e?.endingPath||(e?.id===eventIds.fate?'fate':e?.id===eventIds.exchange?'exchange':info()?.path);
 const ready=(kind,r=R())=>{const s=r?.endingRoute;return s?.version===2?s.branches[kind]?.phase==='ready':s?.path===kind&&s.phase==='ready'};
 const extensionPaths=r=>r?.endingRoute?.version===2?['exchange','fourth'].filter(path=>ready(path,r)):[];
 const completedExtensions=r=>r?.expedition?.extension?.paths|| (r?.expedition?.extension?[r.expedition.extension.path]:[]);
 const nextExtension=(r,layer=r?.expedition?.layer)=>extensionPaths(r).find(path=>!completedExtensions(r).slice(0,Math.max(0,layer-4)).includes(path))||null;
 const extensionPath=r=>extensionPaths(r)[0]||null;
 function bossPath(r=R(),layer=r?.expedition?.layer){
  if(layer>=5)return completedExtensions(r)[layer-5]||extensionPaths(r)[layer-5]||'normal';
  if(layer!==4)return 'normal';
  if(ready('fate',r))return 'fate';
  if(extensionPath(r))return 'normal';
  if(r.endingRoute?.version===1&&ready('exchange',r))return 'exchange';
  return r.story?.ending==='hidden'?'hidden':'normal';
 }
 function sixthLayer(e,path){
  const layer=e.layers.length;if(layer<5||layer>6||e.extension?.paths?.includes(path))return;
  const types=[['search','camp'],['elite'],['merchant'],['boss']];
  const rows=types.map((types,row)=>types.map((type,i)=>{
   const lane=types.length===1?2:i===0?0:4;
   return {id:e.regionId+':'+e.difficulty+':'+layer+':'+row+':'+lane,layer,row,lane,mapX:lane===2?50:lane===0?25:75,type,hidden:false,risk:type==='boss'?3:type==='elite'?2:0,reward:'第'+(layer+1)+'層',links:[]};
  }));
  rows.slice(0,-1).forEach((row,i)=>row.forEach(node=>node.links=[rows[i+1][0].id]));
  e.layers.push({rows});const paths=e.extension?.paths|| (e.extension?[e.extension.path]:[]);e.extension={version:2,path:paths[0]||path,paths:[...paths,path]};
 }
 const protectedNode=n=>n.requiredCombat||n.recruitOperator||n.escortGoal||['boss','signal'].includes(n.type);
 function reserve(exp,layer,preferred,exclude=-1){
  const rows=exp.layers[layer].rows;
  const candidates=rows.map((row,index)=>({row,index})).filter(x=>x.index!==exclude&&!(layer===0&&x.index===rows.length-1)&&!(layer===3&&x.index===Math.floor(rows.length/2))&&x.row.every(n=>!protectedNode(n)));
  candidates.sort((a,b)=>Math.abs(a.index-preferred)-Math.abs(b.index-preferred)||a.index-b.index);
  if(!candidates.length)throw Error('PRTS｜無法安排結局分歧，遠征尚未出發。');
  return candidates[0].index;
 }
 function install(r){
  const e=r.expedition;if(e?.mode!=='standard'||e.graphVersion!==2)return;
  const slots=[reserve(e,0,1),reserve(e,1,0),reserve(e,2,1),reserve(e,3,1),reserve(e,4,2)];
  const exchangeSlots=slots.map((row,i)=>i<2?row:reserve(e,i,row+1,row));
  const initial=()=>({phase:'open',stage:0});
  r.endingRoute={version:2,slots,exchangeSlots,branches:{fate:initial(),exchange:initial(),fourth:{phase:'open',stage:0,slots:[]}}};
  r.endingRoute.thirdEndingLead=rnd(100)<40;
  const marketRows=e.layers[1].rows;
  const marketEligible=(row,i)=>i>exchangeSlots[1]&&i!==slots[1]&&row.every(n=>!protectedNode(n))&&row.some(n=>n.type!=='camp');
  let market=marketRows.findIndex((row,i)=>i>=3&&marketEligible(row,i)&&row.every(n=>!n.storyEvent&&n.type!=='camp'));
  if(market<0)market=marketRows.findIndex(marketEligible);
  if(market>=0)for(const node of marketRows[market]){
   if(node.type==='camp')node.endingMarketCamp=true;
   node.type='merchant';node.hidden=false;node.endingMarket75=true;
  }
  if(market>=0)r.endingRoute.fourthReservations=FrontierRegionsUI75.planArtifact(r,1,market);
  if(r.story?.encounters121)for(const [layer,{rows}] of e.layers.entries()){
   const free=rows.flat().filter(n=>n.row!==slots[layer]&&n.row!==exchangeSlots[layer]&&n.row>0&&!protectedNode(n)&&!n.storyEvent&&!n.passage16&&!n.onboardingRescue&&!n.endingMarket75&&['search','event'].includes(n.type));
   const interval=free.filter(n=>n.type==='event').length>=2?[]:free.filter(n=>n.type==='search').slice(-2);
   for(const node of interval){node.type='event';node.risk=0;}
  }
 }
 function selection(node){
  const s=info();if(!s||protectedNode(node))return null;
  if(s.version===1){
   if(node.row!==s.slots[node.layer])return null;
   if(!s.path&&s.phase==='open')return node.layer===0?{kind:'fate',path:'fate'}:node.layer===1?{kind:'exchange',path:'exchange'}:null;
   return s.phase==='seeking'&&node.layer===2+s.stage?{kind:'follow',path:s.path}:null;
  }
  const four=s.branches.fourth;if(four?.phase==='seeking'&&four.slots?.[four.stage]?.layer===node.layer&&four.slots[four.stage].row===node.row)return {kind:'follow',path:'fourth'};
  for(const [path,branch] of Object.entries(s.branches)){if(path==='fourth')continue;
   const rows=path==='exchange'?s.exchangeSlots:s.slots;
   if(node.row!==rows[node.layer])continue;
   if(branch.phase==='open'&&node.layer===(path==='fate'?0:1))return {kind:path,path};
   if(branch.phase==='seeking'&&node.layer===2+branch.stage)return {kind:'follow',path};
  }
  return null;
 }
 const slot=node=>selection(node)?.kind||null;
 function framedAsEncounter(kind){
  const r=R();
  return !!r?.story?.encounters121&&(kind==='follow'||kind==='fate'&&FrontierSurveyIndex16.hash(r.expedition.regionId+':'+r.number)%3!==0);
 }
 function scoutInstead(){
  const r=R(),e=r?.event;
  if(e?.id!==eventIds.fate||e.claimed||!framedAsEncounter('fate')||!r.survey16||r.survey16.surveyIndex>=6)return;
  FrontierSurvey16.gain(1,'從目擊者確認路線','ending-alt:'+r.expedition.current);
  action(false);
 }
 function title(kind){
  if(kind==='follow')return route(eventPath(R()?.event))?.trial||'追查線索';
  return kind==='fate'?'命運所指 · 路線分歧':'失與得';
 }
 function entryDescription(kind){
  const d=definitions[R().expedition.regionId][kind];
  return '取得「'+d.key+'」，讓故事走向'+labels[kind]+(kind==='exchange'&&info()?.version===2?'，通過第五層後可深入第六層。':'。')+'下一段線索在第 3 層。';
 }
 function installBoss(r,b){
  const path=bossPath(r),d=route(path,r);if(!d||b?.type!=='boss'||b.endingBoss)return;
  const boss=b.enemies.find(e=>e.boss);if(!boss)return;
  const profile=d.profile;
  if(!boss.regionRoster)boss.name=d.boss;
  boss.max=Math.round(boss.max*[1.12,1.20,1.15,1.18][profile]);boss.hp=boss.max;
  boss.atk=Math.max(1,Math.round(boss.atk*[1.06,1,1.12,1.04][profile]));
  if(boss.regionRoster){b.endingBoss=path;return;}
  if(profile===0){boss.def=(boss.def||0)+30;boss.block+=80}
  if(profile===1){boss.res=Math.min(100,(boss.res||0)+18);boss.damageType='arts'}
  if(profile===2){for(const escort of b.enemies.filter(e=>e!==boss)){escort.name='護陣先遣隊';escort.max=Math.round(escort.max*1.25);escort.hp=escort.max;escort.atk+=20}}
  if(profile===3){boss.block+=50;boss.mechanicTier=Math.max(1,boss.mechanicTier||0);if(boss.special)boss.special.threshold=Math.round(boss.special.threshold*1.12)}
  b.endingBoss=path;
 }
 function finishStage(path){
  const s=progress(path),d=route(path);s.stage++;
  s.phase=s.stage===d.steps.length?'ready':'seeking';
  FrontierAdventure.note('ending_route:'+path,s.phase==='ready'?(['exchange','fourth'].includes(path)&&info().version===2?'追加路線已解鎖，通過主線後可挑戰「':'路線已確定。第五層首領改為「')+d.boss+'」。':'線索已取得，請前往第 '+(path==='fourth'?(s.slots[s.stage].layer+1):(3+s.stage))+' 層完成下一步。');
 }
 function action(take){
  const r=R(),event=r?.event,path=eventPath(event),s=progress(path);
  if(!s||event?.type!=='frontierEvent'||event.claimed)return;
  if(event.id===eventIds.fate||event.id===eventIds.exchange){
   const kind=event.id===eventIds.fate?'fate':'exchange';
   if(take){if(info().version===1)s.path=kind;s.phase='seeking';FrontierAdventure.note('ending_key:'+kind,'取得劇情藏品「'+route(kind).key+'」。',{choice:'accept'})}
   else if(kind==='exchange'||info().version===2){s.phase='abandoned';FrontierAdventure.note('ending_abandon:'+kind,'未接受'+labels[kind]+'證物，本趟沿其他路線前進。',{choice:'decline'});}
  }else if(event.id===eventIds.follow&&s.phase==='seeking'){
   const step=route(path).steps[s.stage];
   if(!take){s.phase='abandoned';FrontierAdventure.note('ending_abandon','放下這條結局線索。',{choice:'decline'})}
   else if(step==='fight'){
    s.phase='fighting';event.claimed=true;startBattle('elite');
    if(!r.battle){s.phase='seeking';r.event=event;event.claimed=false;return}
    r.battle.endingTrial=path;
    for(const enemy of r.battle.enemies){enemy.max=Math.round(enemy.max*1.08);enemy.hp=enemy.max}
    save();render();return;
   }else{
    const cost=step==='pay'?12:0,field='fieldPoints';
    if(r[field]<cost){toast('PRTS｜'+('源石碇')+'不足。');return}
    r[field]-=cost;finishStage(path);
   }
  }else return;
  event.claimed=true;completeNode();
 }
 function original(){
  const r=R(),event=r?.event,s=progress(eventPath(event)),previous=event?.originalStory;
  if((!previous&&!event?.originalMerchant&&!event?.originalCamp)||event.claimed)return;
  if(event.id===eventIds.follow){s.phase='abandoned';FrontierAdventure.note('ending_abandon','返回原事件，放下本條結局線索。',{choice:'decline'})}
  if(event.id===eventIds.exchange)s.phase='abandoned';
  if(event.originalMerchant){
   const e=r.expedition,node=e.layers[e.layer].rows[e.row].find(n=>n.id===e.current);
   r.event=null;r.node='merchant';FrontierTrading.fieldMerchant(node);return;
  }
  r.event=event.originalCamp?{type:'camp'}:{type:'frontierEvent',id:previous,claimed:false};
  save();render();
 }
 const enter=FrontierExpedition.enterNode;
 FrontierExpedition.enterNode=function(id){
  const r=R(),e=r?.expedition,n=e?.layers[e.layer].rows[e.row]?.find(x=>x.id===id),chosen=n&&selection(n),kind=chosen?.kind;
  if(!kind||!FrontierExpedition.available(n))return enter(id);
  const type=n.type,story=n.storyEvent;
  n.type='event';n.storyEvent=eventIds[kind];
  try{enter(id)}finally{n.type=type;if(story)n.storyEvent=story;else delete n.storyEvent}
  if(r.event?.id!==eventIds[kind])return;
  r.event.endingPath=chosen.path;
  if(story&&!Object.values(eventIds).includes(story)&&!['gift_exchange','gift_choice'].includes(story))r.event.originalStory=story;
  if(type==='merchant')r.event.originalMerchant=true;
  if(type==='camp')r.event.originalCamp=true;
  if(kind==='exchange')FrontierEncounters.prepareExchange(r.event);
  save();render();
 };
 const kind=FrontierTrail.nodeKind;
 FrontierTrail.nodeKind=n=>{const ending=slot(n);return framedAsEncounter(ending)?'event':ending==='exchange'?'exchange':ending?'story':kind(n);};
 const nodeName=FrontierTrail.nodeName;
 FrontierTrail.nodeName=n=>{const ending=slot(n);return framedAsEncounter(ending)?'不期而遇':ending?(ending==='exchange'?'失與得':ending==='follow'?'結局線索':'命運所指'):nodeName(n);};
 const previousStart=startRun;
 startRun=function(){const before=R();previousStart();const r=R();if(r&&r!==before){install(r);save();render()}};
 const previousBattle=startBattle;
 startBattle=function(type,pending){previousBattle(type,pending);const r=R();if(r&&r.battle){installBoss(r,r.battle);save();render()}};
 const previousCheck=checkBattle;
 checkBattle=function(){
  const r=R(),b=r?.battle,path=b?.endingTrial,s=progress(path);
  if(path&&s?.phase==='fighting'&&r.hp>0&&b.enemies.every(e=>e.hp<=0))finishStage(path);
  return previousCheck();
 };
 const previousEvent=eventView;
 eventView=function(){
  const e=R()?.event,path=eventPath(e),s=progress(path);
  if(!s||!e||!Object.values(eventIds).includes(e.id))return previousEvent();
  const kind=e.id===eventIds.fate?'fate':e.id===eventIds.exchange?'exchange':'follow';
  const step=kind==='follow'?route(path)?.steps[s.stage]:null;
  const details={fight:'挑戰強化緊急作戰。勝利後可推進結局；你也可以放棄這條線索。',pay:'支付 12 源石碇，取得下一段線索。',intel:'比對隨身證物與沿途記錄，證實這條線索；不消耗資源。',report:'交付上一步取得的證物，推進結局。'};
  const button=(text,fn,style='',disabled=false)=>'<button class="'+style+'" '+(disabled?'disabled ':'')+'onclick="'+fn+'">'+text+'</button>';
  const missing=step==='pay'&&R().fieldPoints<12;
  const progressText=step?'第 '+(s.stage+1)+'／'+route(path).steps.length+' 次調查 · '+labels[path]:'';
  const accept=step==='fight'?'進入作戰 · 改變結局':step?'確認線索 · 改變結局':'拿取結局藏品';
  $('#app').innerHTML=runHeader()+'<section class="panel event-panel">'+(framedAsEncounter(kind)?'<small>不期而遇</small>':'')+'<h2>'+esc(kind==='fate'&&framedAsEncounter(kind)?'旅人托付的證物':title(kind))+'</h2><p>'+esc(step?details[step]:entryDescription(kind))+'</p>'+(progressText?'<p class="tiny muted">'+progressText+(step==='pay'?' · 持有 '+R().fieldPoints+' 源石碇':step==='intel'?' · 沿途證物核驗':'')+'</p>':'')+(kind==='fate'&&framedAsEncounter(kind)?'<p class="tiny muted">只問路會放下這條線索；其他故事仍可能繼續。</p>':'')+'<div class="row">'+
    (e.exchangeResult?button('繼續前進','FrontierEncounters.finish()','primary'):
    (kind==='exchange'?button('交換收藏品或詞條','FrontierEncounters.openPicker()'):'')+
    button(missing?'資源不足 · '+accept:accept,'FrontierEndings.action(true)','primary',missing)+(kind==='fate'&&framedAsEncounter(kind)&&R().survey16?.surveyIndex<6?button('只向旅人問路 · 勘探點數 +1','FrontierEndings.scoutInstead()'):'')+button(kind==='follow'?'離開 · 放棄這條線索':'離開','FrontierEndings.action(false)')+
    (e.originalMerchant||e.originalCamp?button(e.originalMerchant?'前往行商':'在此休整','FrontierEndings.original()'):''))+'</div></section>'+bagHtml();
 };
 const previousValid=validSave;
 validSave=function(v){
  if(!previousValid(v))return false;
  const r=v.run,s=r?.endingRoute;if(!s)return true;
  const d=route(s.path,r);
  if(s.version===2){
   const e=r.expedition,validSlots=rows=>Array.isArray(rows)&&rows.length===5&&rows.every((row,i)=>Number.isInteger(row)&&!!e.layers[i]?.rows[row]);
   const four=s.branches?.fourth;if(four&&(!['open','seeking','fighting','abandoned','ready'].includes(four.phase)||!Number.isInteger(four.stage)||four.stage<0||four.stage>2||!Array.isArray(four.slots)||four.slots.some(x=>!Number.isInteger(x.layer)||x.layer<0||x.layer>4||!e.layers[x.layer]?.rows[x.row])||(four.phase==='ready'&&four.stage!==2)))return false;
   return e?.mode==='standard'&&validSlots(s.slots)&&validSlots(s.exchangeSlots)&&['fate','exchange'].every(path=>{const b=s.branches?.[path],limit=route(path,r)?.steps.length;if(!b||!Number.isInteger(b.stage)||b.stage<0||b.stage>limit)return false;return b.phase==='ready'?b.stage===limit:b.phase==='open'?b.stage===0:['seeking','fighting','abandoned'].includes(b.phase)&&b.stage<limit;})&&(!e.extension||['normal','fate','hidden'].includes(e.fifthEnding)&&(e.extension.version===1?e.extension.path===extensionPath(r):Array.isArray(e.extension.paths)&&e.extension.paths.length===e.layers.length-5&&new Set(e.extension.paths).size===e.extension.paths.length&&e.extension.paths.every((p,i)=>p===extensionPaths(r)[i])));
  }
  return s.version===1&&r.expedition?.mode==='standard'&&Array.isArray(s.slots)&&s.slots.length===5&&
   s.slots.every((n,i)=>Number.isInteger(n)&&n>=0&&!!r.expedition.layers[i]?.rows[n])&&
   (s.path===null||!!d)&&Number.isInteger(s.stage)&&s.stage>=0&&s.stage<=(d?.steps.length||0)&&
   (s.phase==='open'?!d:s.phase==='abandoned'||!!d&&(s.phase==='ready'?s.stage===d.steps.length:['seeking','fighting'].includes(s.phase)&&s.stage<d.steps.length));
 };
 function hint(){
  const s=info(),r=R();if(!s)return '';
  const paths=s.version===2?['fate','exchange','fourth']:[s.path];
  return paths.map(path=>{const b=progress(path),d=route(path);if(!b||!d||!['ready','seeking'].includes(b.phase))return '';return b.phase==='ready'?labels[path]+' · 第'+(path==='fourth'?(ready('exchange')?'七':'六'):path==='exchange'&&s.version===2?'六':'五')+'層：'+d.boss:'已持有「'+d.key+'」 · 第 '+(path==='fourth'?(b.slots[b.stage]?.layer+1):(3+b.stage))+' 層有結局線索';}).filter(Boolean).join(' ／ ');
 }
 function epilogue(r,path){if(path==='fourth')return FrontierRegionDesign75.regions[r?.expedition?.regionId]?.trial+'已完成；調查隊帶著這條獨立路線的記錄返航。';return epilogues[r?.expedition?.regionId]?.[path==='fate'?0:1]}
 function finalBoss(layer){return route(bossPath(R(),layer))?.boss||null}
 return {definitions,slot,action,scoutInstead,original,labels,hint,epilogue,finalBoss,bossPath,extensionPath,extensionPaths,nextExtension,completedExtensions,sixthLayer,ready};
})();
