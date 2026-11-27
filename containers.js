'use strict';
window.FrontierContainers=(()=>{
 const catalog=FrontierInventory.definitions,qualities={1:{name:'廢棄盒',base:2,up:[[4,.05],[3,.35]]},2:{name:'基礎補給箱',base:3,up:[[5,.03],[4,.50]]},3:{name:'制式軍需箱',base:4,up:[[6,.01],[5,.08]]},4:{name:'加密補給箱',base:5,up:[[7,.005],[6,.08]]},5:{name:'戰略封存匣',base:5,up:[[7,.04],[6,.15]]}};
 for(const[q,d]of Object.entries(qualities)){const id='container_c'+q;catalog[id]={id,name:d.name,category:'container',rarity:Number(q)+1,description:'取得時固定內容，可帶回基地；單次品質判定，逐件揭曉不重抽。',effect:{type:'sealedContainer',quality:Number(q)},sources:['container.exploration','modern.battle'],recipe:null,gridSize:{w:2,h:3},stack:1,rv:[0,120,300,700,1800,3500][q],balance:{legacy:q==='1',quality:Number(q),baseTier:d.base,priorityRoll:d.up}}}
 const locks=FrontierSearchLocks174;
 const accessId=id=>'search174_'+id;
 locks.register(catalog,FrontierInventory.recipes);
 const series=[
  ['field_bandage','巡線急救包',2,1,3,'medical'],['mess_tin','炊事班乾糧盒',2,2,2,'industrial'],['relay_parts','中繼器零件匣',2,3,1,'industrial'],['sample_carrier','野外採樣筒',2,1,2,'biological'],['courier_wrap','信差防潮匣',2,2,1,'intelligence'],
  ['clinic_tray','巡迴診所藥匣',3,2,2,'medical'],['demolition_case','工兵爆破具箱',3,3,1,'armory'],['signal_case','短波通訊箱',3,1,3,'intelligence'],['expedition_cooler','極地冷藏箱',3,2,3,'biological'],['workshop_case','移動工坊備件箱',3,3,2,'industrial'],
  ['surgeon_case','手術器械運輸箱',4,2,2,'medical'],['vault_ledger','礦權檔案匣',4,1,3,'intelligence'],['quarantine_case','檢疫所封存箱',4,2,3,'biological'],['armory_reserve','裝甲庫備件箱',4,3,2,'armory'],['reliquary','遺址保全匣',4,2,2,'relic'],
  ['night_dispatch','夜航密運艙',5,3,2,'intelligence'],['deep_sample','深層樣本冷封匣',5,2,3,'biological'],['sentinel_stock','哨戒軍械儲備箱',5,3,2,'armory'],['special_medicine','臨界醫療封存艙',5,2,2,'medical'],['black_archive','失聯據點遺留箱',5,2,3,'relic']
 ];
 const grand='container_last_light';
 const containerModels={
  field_bandage:['M10 25Q18 17 31 17h18q10 0 14 9l-4 24H9z','M25 18v-6q10-7 20 0v6m-13 8v15m-7-7h14'],
  mess_tin:['M11 22q0-7 12-9h26q10 2 12 8l-4 21q-1 7-12 7H23q-10-1-12-7z','M12 23q24 12 49-2m-26 10v12m-7-3h14'],
  relay_parts:['M8 27l10-14h46l-8 32H8z','M18 21h31m-28 8h27m-20 7h16m13-17h4'],
  sample_carrier:['M24 16q12-8 24 0v29q0 6-12 8t-12-8z','M24 17q12 8 24 0M24 25q12 8 24 0m-15 7v13'],
  courier_wrap:['M12 18l13-6 36 7-4 30-45-5z','M12 18l23 19 26-18m-39 4 29 6m-16 4v10'],
  clinic_tray:['M8 23l12-10h44l-7 28H12z','M18 23h35m-28 1v8m12-8v8m8-8v8m-33 9 4 7h38l3-7'],
  demolition_case:['M6 26l10-12h48l4 27-10 8H6z','M8 27h56M21 15v34m32-34v34m-24-15 4 7m9-7 4 7'],
  signal_case:['M14 22l9-8h35v35H14z','M41 14l7-10m-28 25h16m-16 6h16m-16 6h16m9-12v9m-5-4h10'],
  expedition_cooler:['M9 20l10-9h43v34l-8 7H9z','M9 20h45l8-9M9 30h45l8-8M34 31v14m-6-11 12 8m-12 0 12-8'],
  workshop_case:['M7 26l8-12h45l6 12-7 24H7z','M26 14v-5h14v5M8 27h55m-42 0v11m25-11v11m-22 5h21'],
  surgeon_case:['M16 20l8-9h28l6 11v29H16z','M16 29h42m-35 6h28m-20-18h13m-8-4v8m-9 14v9m20-9v9'],
  vault_ledger:['M17 14l11-5 29 6v33l-11 5-29-7z','M28 9v36m7-26 15 3m-15 4 15 3m-15 4 15 3m-15 4 8 2'],
  quarantine_case:['M13 23l11-12h25l10 12v24l-9 6H13z','M13 23h46m-24 7 8 12H27zm0 4v4m0 2v1M20 24v20m32-20v20'],
  armory_reserve:['M5 29l12-13h48v26l-10 9H5z','M5 29h50l10-13M15 30v19m33-19v19m-21-12 8 6 8-6'],
  reliquary:['M13 31l11-16h25l11 15v19H13z','M13 31h47m-25-13 7 7-7 7-7-7zM20 35v9m31-9v9'],
  night_dispatch:['M5 31l13-16h45l5 13-8 19H9z','M8 32h51l8-5M18 28l7-9m5 9 7-9m6 9 7-9m0 18h7'],
  deep_sample:['M22 13l12-7 13 6 7 12v17l-7 9H22l-7-8V23z','M22 15h25m-25 29h25M23 27q12-11 23 0v10H23z'],
  sentinel_stock:['M6 27l9-12h43l9 10v17l-9 8H6z','M6 28h61m-53 0v21m45-21v19m-33-11h21m-17 5h13m-8-10v15'],
  special_medicine:['M12 18l11-9h27l10 10v31H12z','M12 19h48M21 24h11v20H21zm20 0h10v20H41zm-17 7h5m15 4h4'],
  black_archive:['M9 25l10-15 13 5 11-4 19 16-7 22H10z','M9 25l19 4 14-7 20 5m-28 2-5 10 11 5m-23-3h8m24-15 5 9'],
  last_light:['M14 22l10-14h24l12 14v29H14z','M14 22h46m-40 3v22m34-22v22m-20-17v13m-7-6h14m-15-21 7 2m7-2 7 2'],
  c1:['M12 22l13-5 34 4-4 26-43-3z','M12 22l39 7 8-8M25 31l-4 8m20-6-3 8'],
  c2:['M10 24l10-10h40v30l-9 6H10z','M10 24h41l9-10M19 30h22v11H19z'],
  c3:['M9 22l12-9h41l3 27-9 9H9z','M9 22h47l6-9m-44 16 6 6 6-6m10 0 6 6 6-6'],
  c4:['M13 18l10-8h31l8 10v28H13z','M13 24h49m-33 6h16v13H29zm5 5h6m10-8h5'],
  c5:['M9 27l12-15h32l11 15-8 22H14z','M9 27h55m-34 3-5 7 8 7h8l8-7-5-7zm8 1v12']
 };
 const roomFixtures=[
  ['藥|醫|冷藏', 'M18 19l10-9h22l7 8v31H18z'],
  ['檔|資料|紀錄|文件|病歷', 'M16 12h38v37H16z'],
  ['消毒|工作台|機組|終端|主機|控制台', 'M10 22l9-11h38l8 11-4 25H11z'],
  ['架|貨|堆|分類', 'M8 32l10-12h41l6 12v16H8z'],
  ['櫃|保險|封印', 'M15 18l11-9h26l8 9v31H15z']
 ];
 function roomContainerModel(box){return FrontierRoomBoxes146.render(box)}
 const highRiskWhite=new Set(['field_bandage','mess_tin']);
 function highRiskTier(base,roll){
  const promoted=Math.min(5,Math.max(3,base)+(roll<.60?1:0));
  if(promoted!==3)return promoted;
  if(roll>=.96)return 1;
  if(roll>=.90)return 2;
  return 3;
 }
 function highRiskDrop(base,origin,preferredKind,outer=false){
  const tier=highRiskTier(base,random());
  const eligible=series.filter(([key,,tierOfContainer])=>tier===1?highRiskWhite.has(key):!highRiskWhite.has(key)&&tierOfContainer===tier);
  const names=eligible.map(([key,,,,,profile])=>({id:'container_'+key,profile}));
  if(tier===5&&random()<.015)return create(tier,'relic',origin,grand);
  const themed=preferredKind?names.filter(entry=>entry.profile===preferredKind):[];
  const {id,profile}=pick(themed.length&&random()<.6?themed:names);
  const box=create(tier,profile,origin,id);
  if(outer)for(const item of box.sealed.contents){
   const definition=catalog[item.itemId];
   if(definition.category==='material'&&definition.rarity<=4)item.qty+=2;
  }
  return box;
 }
 const seriesTier=key=>series.find(entry=>entry[0]===key)[2];
 for(const [key,name,q,w,h,kind] of [...series,['last_light','無燈港・末班密櫃',5,3,3,'relic']]){
  const id='container_'+key,rarity=q+1;
  catalog[id]={...catalog['container_c'+q],id,name,rarity,gridSize:{w,h},description:id===grand?'無燈港最後一班貨船的密櫃。外箱佔 3×3，內裝至少 15 格，開箱後仍需整理帶走。':'取得時固定內容。可在遠征或基地開啟。',balance:{...catalog['container_c'+q].balance,legacy:false,kind,premium:id===grand}};
 }
 catalog.red_research_core={id:'red_research_core',name:'戰略研究封存核心',category:'researchCore',rarity:7,description:'可永久保存作紀念，或提交一次戰略檔案研究，解鎖收藏館的紅階研究徽章；不提高攻擊。',effect:{type:'archiveBadge',badge:'strategic_core'},sources:['container.globalRed'],recipe:null,gridSize:{w:2,h:2},stack:1,rv:30000,balance:{globalRare:true}};
 FrontierInventory.sources['container.exploration']={id:'container.exploration',name:'分支地圖封存補給、隱藏區與首領',system:'exploration'};FrontierInventory.sources['container.globalRed']={id:'container.globalRed',name:'統一紅階來源（每週隨機最多3件）',system:'rare'};
 let baseBox=db.containers?.activeBox||null;
 function day(now=Date.now()){return new Date(now).toISOString().slice(0,10)}
 function week(now=Date.now()){const d=new Date(now);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10)}
 function ensure(){if(!db.containers)db.containers={version:1,opened:0,history:[],red:{week:week(),count:0,hour:Math.floor(Date.now()/3600000),eligible:0}};return db.containers}
 function quality(q){const d=q===6?{base:5,up:[[7,.04],[6,.50]]}:qualities[q],state=ensure(),rare=state.red,now=Date.now(),w=week(now),h=Math.floor(now/3600000);if(w>rare.week){rare.week=w;rare.count=0}if(h>rare.hour){rare.hour=h;rare.eligible=0}const eligible=q>=4&&rare.count<3&&rare.eligible<10;if(q>=4&&rare.eligible<10)rare.eligible++;let total=0;const roll=random();for(const[tier,chance]of d.up){const p=tier===7?(eligible?Math.min(chance,1/280):0):chance;total+=p;if(roll<total){if(tier===7)rare.count++;return tier}}return d.base}
 function rewardPool(tier,kind,region){
  const eligible=d=>window.FrontierCollections?.eligible(d,region)??true;
  let choices=Object.values(catalog).filter(d=>!d.dropDisabled141&&!d.retired139&&(!d.equipmentKind||d.category==='equipment')&&d.rarity===tier&&eligible(d)&&!relics.some(r=>r.id===d.id)&&!['container','captureDevice','legacyRelic','legacyMaterial'].includes(d.category));
  if(tier<5){
   const preferred=kind==='medical'?'medicine':kind==='armory'?'equipment':'material';
   const specific=choices.filter(d=>d.category===preferred);
   if(specific.length)choices=specific;
  }
  return choices;
 }
 function reward(tier,kind,region,access=false,choices=rewardPool(tier,kind,region)){
  if(access){
   const itemId=window.FrontierSearchLocks174?.rollAccess(tier,choices.length,random);
   if(itemId)return {itemId,qty:1};
  }
  let d=window.FrontierCollections?FrontierCollections.select(choices):pick(choices);
  // Convert the former sample slots into materials to preserve collection odds.
  if(d?.category==='researchSample')d=null;
  if(!d)d=tier===7?catalog.red_research_core:pick(Object.values(catalog).filter(x=>!x.dropDisabled141&&x.category==='material'&&x.rarity===tier));
  const itemId=window.FrontierEquipmentV139?.roll(catalog,d.id,'container:'+db.rng.seed+':'+db.rng.counter)||d.id;return {itemId,qty:d.category==='material'&&tier<=3?2+rnd(3):1};
 }
 function create(q,kind='industrial',origin={source:'container.exploration'},id='container_c'+q){
  const instance=FrontierInventory.create(id,1,origin),counter=db.rng.counter,premium=id===grand,tier=quality(premium?6:q),region=origin.region||(R()?.result?null:R()?.expedition?.regionId),contents=[reward(tier,kind,region,Boolean(R()?.expedition&&!R().result))];
  const count=2+rnd(3);
  const secondaryTier=Math.max(1,Math.min(4,tier-1)),secondaryKind=kind==='medical'?'medical':'industrial';
  const secondaryPool=rewardPool(secondaryTier,secondaryKind,region);
  for(let i=1;i<count;i++)contents.push(reward(secondaryTier,secondaryKind,region,false,secondaryPool));
  if(q===5)contents.push({itemId:'record_high',qty:1});
  if(premium){
   contents.push(reward(5,'industrial',region),reward(5,'industrial',region));
   const area=item=>{const size=FrontierCollections.size(catalog[item.itemId],R());return size.w*size.h};
   let occupied=contents.reduce((sum,item)=>sum+area(item),0);
   while(occupied<15){const item=reward(4,'industrial',region);contents.push(item);occupied+=area(item)}
  }
  /* claude97bp：藍圖在所有內容（含末班密櫃補滿15格）決定後才額外追加，不佔用原有內容。 */
  {const bp=window.FrontierBlueprints?.containerRoll(q,kind,premium);if(bp)contents.push(bp);}
 instance.sealed={version:1,quality:q,kind,tier,contents,counterStart:counter,counterEnd:db.rng.counter,seed:db.rng.seed,revealed:0,claimed:contents.map(()=>false)};return instance}
 function drop(q,kind,origin){
  const state=ensure();
  state.lastLightMisses=(state.lastLightMisses||0)+1;
  const activeDay=day(Date.now()+8*3600000);
  if(!state.lastLightActiveDay||activeDay>state.lastLightActiveDay){
   state.lastLightActiveDay=activeDay;
   state.lastLightActiveDays=(state.lastLightActiveDays||0)+1;
  }
  if(state.lastLightActiveDays>=3||state.lastLightMisses>=36||random()<.015){
   state.lastLightMisses=0;state.lastLightActiveDays=0;
   return create(5,'relic',origin,grand);
  }
  q=Math.max(2,q);
  if(random()<.8){
   const [key,,,,,profile]=pick(series.filter(entry=>entry[2]===q));
   return create(q,profile,origin,'container_'+key);
  }
  return create(q,kind,origin);
 }
 function searchSideBox(base,origin,index,difficulty,layer){
  const floor=[2,2,3,4][Math.max(0,["normal","hard","extreme","torment"].indexOf(difficulty))];
  const tier=index===2?Math.min(5,Math.max(floor,base+(layer>=2?1:0))):Math.min(3,Math.max(2,base-1));
  const [key,,,,,profile]=pick(series.filter(entry=>entry[2]===tier));
  return create(tier,profile,origin,'container_'+key);
 }
 function startSearchScene(run,node){
  const base=node.containerQuality??(1+Math.min(2,run.expedition.layer||0)+rnd(3));
  const highRisk=run.expedition.mode==='highrisk';
  const origin={source:node.id,run:run.number};
  const layer=run.expedition.layer;
  const roomPool=Array.from({length:20},(_,index)=>index+1).filter(id=>!highRisk||(layer===0?id<=13:layer===1?id<=16:id!==14));
  const visitedRooms=run.expedition.searchRooms180??=[];
  const fresh=roomPool.filter(id=>!visitedRooms.includes(id));
  const alternatives=roomPool.filter(id=>id!==visitedRooms.at(-1));
  // 出發時已預定房間（地圖上可預先看到所需房卡）就使用預定房間；舊局維持隨機。
  const room=Number.isInteger(node.room180)&&roomPool.includes(node.room180)?node.room180:pick(fresh.length?fresh:alternatives);
  visitedRooms.push(room);

  const themes=['industrial','industrial','medical','medical','industrial','industrial','intelligence','intelligence','armory','armory','industrial','intelligence','medical','biological','armory','armory','biological','relic','relic','relic'];
  const targets=Array.from({length:4},(_,index)=>({
   box:highRisk?highRiskDrop(base,origin,themes[room-1],index!==3):index===0?standardSearchBox(run,node):searchSideBox(base,origin,index,run.expedition.difficulty,layer),
   structure174:true,status:'waiting'
  }));
  const isSpecial=highRisk&&((room===14&&run.expedition.layer===1)||(room===17&&run.expedition.layer===2));
  const shinyRoll=isSpecial?random():null;
  // Existing saved signals remain claimable through takeRitualSignal.
  const ritualSignal174=false;
  for(const target of targets)window.FrontierSurveyV27?.prepareSealedDrop(target.box);
  if(room>=3&&highRisk)targets[3].core={...locks.roomLock(room,node.id+':core'),core:true};
  if([1,2,5,6,9,11,16,18,20].includes(room)){
   const slot=targets[2];
   const tier=Math.min(4,slot.box.sealed.tier);
   slot.hiddenReward=reward(tier,'industrial',run.expedition.regionId);
   if([1,2,5,18].includes(room)){
    const families=run.focus27?.families||Object.keys(FrontierProgress.families);
    const quantity=slot.hiddenReward.qty;
    slot.hiddenVariants=Object.fromEntries(families.map(family=>[
     family,{itemId:FrontierProgress.materialId(family,tier),qty:quantity}
    ]));
   }
  }
  run.event={type:'sealedContainer',box:targets[0].box,searchScene:{version:1,open:false,focus:-1,active:null,targets,shinyRoll,ritualSignal174,lock:locks.roomLock(room,node.id+':door')}};
  window.FrontierSearch141?.upgrade(run.event.searchScene,node);
  save();render();
 }
 const searchScene=()=>R()?.event?.searchScene;
 function applyAlert(run,key,amount,reason){
  run.alertLedger??=[];
  if(run.alertLedger.some(x=>x.key===key))return false;
  const before=run.alert??(run.expedition.mode==='highrisk'?20:0);
  run.alert=Math.min(100,Math.max(0,before+amount));
  run.alertLedger.push({key,before,after:run.alert,reason});
  return true;
 }
 function alertView(run){
  const alert=run.alert??(run.expedition.mode==='highrisk'?20:0);
  const bands=[[25,'靜默'],[50,'注意'],[75,'戒備'],[90,'追緝'],[101,'封鎖']];
  const [next,label]=bands.find(([max])=>alert<max);
  return '<section class="search174-alert"><b>警戒 '+alert+'/100 · '+label+'</b><progress max="100" value="'+alert+'"></progress><small>'+(next<=100?'下一階段 '+next:'最高警戒')+'</small>'+(run.alertLedger||[]).slice(-3).map(e=>'<small>'+esc(e.reason)+' '+(e.after-e.before>=0?'+':'')+(e.after-e.before)+'</small>').join('')+'</section>';
 }
 const roomPositions=[[35,31],[67,36],[34,68],[65,73],[32,49],[69,53]];
 const entryPosition=[50,87];
 function focusSearch(index){if(searchScene()?.search141)return FrontierSearch141.select(index);return legacyFocus141(index)}
 function legacyFocus141(index){
  const scene=searchScene();
  if(!scene||scene.active!==null||!Number.isInteger(index)||index< -1||index>=scene.targets.length||scene.outerOnly174&&index>0||index>=0&&(!scene.open||scene.targets[index].status!=='waiting'))return;
  if(scene.focus===index||window.FrontierRuntime?.busy&&!scene.search141)return;
  const stage=document.querySelector('.search174-stage');
  const avatar=stage?.querySelector('.search174-avatar');
  if(!avatar){scene.focus=index;render();return}
  const previous=scene.focus;
  const [x,y]=roomPositions[index]||entryPosition;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const running=avatar.getAnimations();
  const room=reduce?null:stage.getBoundingClientRect();
  const actor=room&&running.length?avatar.getBoundingClientRect():null;
  const [prevX,prevY]=roomPositions[previous]||entryPosition;
  const dx=room?(actor?actor.left+actor.width/2-room.left-stage.clientLeft:stage.clientWidth*prevX/100)-stage.clientWidth*x/100:0;
  const dy=room?(actor?actor.top+actor.height/2-room.top-stage.clientTop:stage.clientHeight*prevY/100)-stage.clientHeight*y/100:0;
  for(const animation of running)animation.cancel();
  scene.focus=index;
  avatar.style.setProperty('--walk-x',x+'%');
  avatar.style.setProperty('--walk-y',y+'%');
  const buttons=stage.querySelectorAll('.search174-targets button');
  for(const button of buttons)button.setAttribute('aria-pressed',String(Number(button.dataset.searchTarget)===index));
  stage.querySelector('.search174-choice')?.remove();
  if(!reduce&&avatar.animate){
   avatar.animate([{transform:'translate(-50%, -50%) translate('+dx+'px, '+dy+'px)'},{transform:'translate(-50%, -50%)'}],{duration:500,easing:'ease-in-out'});
  }
  stage.insertAdjacentHTML('beforeend',searchChoice(scene,!reduce&&Boolean(avatar.animate)));
 }
 function accessDefinition(item){
  const effect=catalog[item?.itemId]?.effect;
  return effect?.type==='searchAccess'?locks.catalog[effect.id]:null;
 }
 function accessItems(run){
  const protectedKeys=(run.searchKeys174||[]).map(uid=>db.inventory.items.find(item=>item.uid===uid)).filter(item=>accessDefinition(item)?.key);
  return [...new Map([...(run.itemCargo||[]),...(run.secureGrid?.items||[]).filter(i=>i.kind==='equipment').map(i=>i.instance).filter(Boolean),...protectedKeys].map(i=>[i.uid,i])).values()].flatMap(item=>{
   const def=accessDefinition(item);
   const id=catalog[item.itemId]?.effect?.id;return def?[{item,id,uses:locks.pointsLeft(item),cost:locks.openCost(id,run),points:locks.usesPoints(id)}]:[];
  });
 }
 const selectedAccess={keys:[],tools:[]};
 /* 權限卡匣記在存檔：裝上後一直保留，直到房卡用盡或玩家主動取下。 */
 function syncKeys(){const saved=db.searchKeyRing174;if(!Array.isArray(saved))return;const have=new Set(accessCandidates('keys').map(i=>i.uid));selectedAccess.keys=saved.filter(uid=>have.has(uid));if(selectedAccess.keys.length!==saved.length)db.searchKeyRing174=[...selectedAccess.keys]}
 function accessCandidates(kind){
  return db.inventory.items.filter(item=>{
   const d=accessDefinition(item);
   return d&&Boolean(d.key)===(kind==='keys')&&locks.pointsLeft(item)>0;
  });
 }
 function accessPrep(){
  syncKeys();const capacity=locks.keyRingLimit(db),keys=accessCandidates('keys');
  const lock='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const tools=accessCandidates('tools').filter(i=>selectedAccess.tools.includes(i.uid));
  // 權限卡匣：固定格數的房卡欄位；開鎖裝置：不設格數的攜帶區，點整個區塊選擇。
  return '<div class="search174-prep"><section class="search174-block"><h3>權限卡匣 <small>'+selectedAccess.keys.length+'/'+capacity+' 張房卡</small></h3><div class="search174-keyslots">'+Array.from({length:7},(_,i)=>{
   if(i>=capacity)return '<button disabled aria-label="房卡欄位 '+(i+1)+' 尚未解鎖">'+lock+'</button>';
   const item=keys.find(x=>x.uid===selectedAccess.keys[i]);
   return '<button aria-label="選擇房卡 '+(i+1)+'" onclick="FrontierContainers.pickAccess(&quot;keys&quot;)">'+(item?FrontierIcons.access(item):'+')+'</button>';
  }).join('')+'</div>'+(!capacity?'<button onclick="go(&quot;doctor&quot;)">前往認知構築解鎖權限卡匣</button>':'')+'</section>'+
  '<section class="search174-block"><h3>開鎖裝置／偵查儀 <small>'+(tools.length?'攜帶 '+tools.length+' 件':'未攜帶')+'</small></h3><button type="button" class="search174-toolzone" aria-label="選擇開鎖裝置與炸藥，目前攜帶 '+tools.length+' 件" onclick="FrontierContainers.pickAccess(&quot;tools&quot;)">'+(tools.length?tools.map(item=>FrontierIcons.access(item)).join(''):'<span>點此選擇開鎖裝置、炸藥與偵查儀</span>')+'</button></section></div>';
 }
 function pickAccess(kind){
  if(!Object.hasOwn(selectedAccess,kind))return;
  syncKeys();const keys=kind==='keys',capacity=locks.keyRingLimit(db);
  if(keys&&!capacity)return;
  const candidates=accessCandidates(kind),selected=selectedAccess[kind];
  modal(keys?'選擇房卡':'選擇開鎖裝置／炸藥／偵查儀','<p>'+(keys?'最多 '+capacity+' 張，每款可帶一張。':'開鎖裝置用來開容器；炸藥在沒有房卡時破門；偵查儀在開門前查看容器的鎖。都占背包空間，炸藥最多攜帶一件。')+'</p><div class="search174-access-picker">'+candidates.map(item=>'<label title="'+esc(catalog[item.itemId].name)+'"><input type="checkbox" data-search174-load value="'+esc(item.uid)+'" aria-label="'+esc(catalog[item.itemId].name)+'" '+(selected.includes(item.uid)?'checked':'')+'>'+FrontierIcons.access(item)+'</label>').join('')+'</div>'+(!candidates.length?'<p>目前沒有可攜帶的物品。</p>':''),'<button class="primary" onclick="FrontierContainers.confirmAccess(&quot;'+kind+'&quot;)">確認攜帶</button>');
 }
 function checkAccess(keys,tools){
  const capacity=locks.keyRingLimit(db);
  if(keys.length>capacity||new Set(keys.map(i=>i.itemId)).size!==keys.length){toast('最多 '+capacity+' 張不同款的房卡。');return false}
  if(tools.filter(i=>['search174_B1','search174_B2'].includes(i.itemId)).length>1){toast('出發最多攜帶一件炸藥。');return false}
  return true;
 }
 function confirmAccess(kind){
  if(!Object.hasOwn(selectedAccess,kind))return;
  const checked=new Set([...document.querySelectorAll('#modal [data-search174-load]:checked')].map(e=>e.value));
  const items=accessCandidates(kind).filter(item=>checked.has(item.uid));
  if(!checkAccess(kind==='keys'?items:[],kind==='tools'?items:[]))return;
  selectedAccess[kind]=items.map(i=>i.uid);
  if(kind==='keys'){db.searchKeyRing174=[...selectedAccess.keys];try{save()}catch{}}
  closeModal();
  const panel=document.querySelector('.search174-prep');
  if(panel)panel.outerHTML=accessPrep();
 }
 function prepareAccess(){
  syncKeys();
  const keys=accessCandidates('keys').filter(i=>selectedAccess.keys.includes(i.uid));
  const tools=accessCandidates('tools').filter(i=>selectedAccess.tools.includes(i.uid));
  return checkAccess(keys,tools)?{keys,tools}:null;
 }
 function finishAccess(run,selection){
  run.searchKeys174=selection.keys.map(item=>item.uid);
  for(const item of selection.tools){
   if(!FrontierGrid.canTake(item.itemId,'equipment',true))continue;
   const index=db.inventory.items.findIndex(i=>i.uid===item.uid);
   if(index<0)continue;
   run.itemCargo.push(db.inventory.items.splice(index,1)[0]);FrontierGrid.sync();
  }
 }
 function canCollectAccess(id){
  if(!['search174_B1','search174_B2'].includes(id))return true;
  if(accessItems(R()).filter(x=>['B1','B2'].includes(x.id)).length<2)return true;
  toast('局內最多攜帶兩件爆破器材。');return false;
 }
 function accessOption(scene,row){
  return fitsAccess(scene.lock,row);
 }
 function fitsAccess(lock,row){
  const def=locks.catalog[row.id];
  return row.uses>=row.cost&&lock&&(def.key?locks.keyFits(lock,def.key):locks.toolFits(lock,row.id));
 }
 const canSearchExterior=scene=>[1,2,3,5,7,8,11,13,14,19,20].includes(scene.lock?.room);
 const easyDoor=scene=>!scene.lock||scene.lock.level===1||scene.lock.room>=19;
 /* v605 開門：只能用對應房卡、兩種炸藥（或沒有房卡可開的房間用開鎖裝置）；偵查儀可在開門前看鎖。 */
 const lockKindNames={mechanical:'機械鎖',electronic:'電子鎖',military:'軍規鎖',research:'研究封印'};
 function noKeyRoom(scene){return !Object.values(locks.catalog).some(d=>d.key&&locks.keyFits({room:scene.lock.room,core:false},d.key))}
 function doorOpeners(scene){return accessItems(R()).filter(row=>locks.catalog[row.id].key&&fitsAccess(scene.lock,row))}
 function doorNeeds(scene){const ids=Object.keys(locks.catalog).filter(id=>locks.catalog[id].key&&locks.keyFits({room:scene.lock.room,core:false},locks.catalog[id].key));return ids.length?ids:['T1','T2','T3','T4'].filter(id=>locks.toolFits(scene.lock,id))}
 function breachParams(scene,run,row,preferred){return {lock:scene.lock,inventory:[row],ledger:run.breachLedger174||[],sector:run.expedition.layer,actions:1,targets:scene.targets.map((t,order)=>({id:t.box.uid,rarity:catalog[t.box.itemId].rarity,order})),device:row.id,preferred}}
 function targetNeeds(scene,target){
  const ids=['T1','T2','T3','T4'];
  if(target.core)return {label:'核心權限鎖',ids:ids.filter(id=>fitsAccess(target.core,{id,uses:1,cost:1}))};
  const rule=objectRule(target);
  if(!rule?.kind)return {label:rule?.name||'無鎖',ids:[],free:true};
  const lock={...scene.lock,...rule,core:false};
  const kn=lockKindNames[rule.kind]||'';return {label:(rule.name&&rule.name!==kn?rule.name+' · ':'')+kn+' Lv.'+rule.level,ids:['T1','T2','T3','T4'].filter(id=>locks.toolFits(lock,id)),force:rule.force};
 }
 function scoutReport(scene){
  const carried=new Set(accessItems(R()).filter(r=>r.uses>=r.cost).map(r=>r.id));
  return '<div class="search605-scout"><b>偵查結果</b>'+scene.targets.map((t,i)=>{const need=targetNeeds(scene,t),name=scene.lock?.targetNames?.[i]||catalog[t.box.itemId].name;
   return '<p><span>'+['左前','右前','左後','右後'][i]+' · '+esc(name)+'</span><small>'+esc(need.label)+'</small>'+(need.free?'<em>不需開鎖裝置</em>':'<span class="search605-need">'+need.ids.map(id=>'<i class="'+(carried.has(id)?'have':'')+'" title="'+esc(locks.catalog[id].name)+(carried.has(id)?'（已攜帶）':'（未攜帶）')+'"><img src="assets/search174/'+id+'.png" alt="'+esc(locks.catalog[id].name)+'"></i>').join('')+'</span>'+(need.ids.some(id=>carried.has(id))?'<em class="ok">已攜帶可用裝置</em>':'<em class="warn">未攜帶'+(need.force?'，只能強拆（+'+need.force+' 警戒、暗格可能損毀）':'')+'</em>'))+'</p>'}).join('')+'</div>';
 }
 function openSearchDoor(method="careful",uid=null,preferred=null){
  if(searchScene()?.search141?.rollStep<2)return false;
  const run=R(),scene=searchScene();
  if(!scene||scene.open||scene.active!==null||scene.focus!==-1)return;
  const items=accessItems(run);
  const row=items.find(x=>x.item.uid===uid);
  let amount=0,reason='',plan;
  if(method==='scout'){
   if(!row||row.id!=='S1'||row.uses<row.cost||scene.scouted605)return;
   consumeAccess(run,row);scene.scouted605=true;applyAlert(run,run.expedition.current+':scout',1,'偵查隔離門');save();render();showSearchDoor();return;
  }
  if(method==='access'){
   if(!row||!doorOpeners(scene).some(x=>x.item.uid===row.item.uid))return;
   amount=locks.tools[row.id]?.alert||0;reason=locks.catalog[row.id].name;
  }else if(method==='breach'){
   if(!row||!scene.lock||!['B1','B2'].includes(row.id))return;
   const params={...breachParams(scene,run,row,preferred),inventory:items};
   if(!locks.breachPlan({...params,roll:0}))return;
   plan=locks.breachPlan({...params,roll:random()});
   amount=plan.alert;reason=locks.catalog[row.id].name;
  }else if(method==='exterior'){
   if(!canSearchExterior(scene))return;
   scene.outerOnly174=true;reason='僅搜外圍';
  }else if(method!=='careful'||scene.lock)return;
  if((method==='access'||method==='breach')&&row)consumeAccess(run,row);
  if(plan){
   (run.breachLedger174??=[]).push(plan.receipt);
   if(run.tools)run.tools.searchActions=(run.tools.searchActions||0)+1;
   for(const t of scene.targets)if(plan.destroyed.includes(t.box.uid))t.status='destroyed';
   if(plan.intercept)run.pendingBreachIntercept=true;
  }
  if(amount)applyAlert(run,run.expedition.current+":door",amount,reason);
  scene.open=true;
  closeModal();save();render();
 }
 function showSearchDoor(){
  if(searchScene()?.search141?.rollStep<2)return false;
  const scene=searchScene();
  if(!scene||scene.open)return;
  modal('開啟區域隔離門',(scene.scouted605?scoutReport(scene):'')+'<div class="search174-door-options search605-door">'+doorActions(scene)+'</div>',
   '<button onclick="closeModal()">返回</button>');
 }
 function chooseBreach(uid){
  const run=R(),scene=searchScene(),row=accessItems(run).find(x=>x.item.uid===uid);if(!scene||scene.open||!row)return;
  const params=breachParams(scene,run,row,null),names=['左前','右前','左後','右後'];
  modal('定向切割：選擇犧牲區域','<p>選定的區域會被切毀；另有 40% 機率波及 1 個鄰近區域。</p><div class="search174-door-options">'+params.targets.map((t,i)=>{const ok=locks.breachPlan({...params,preferred:t.id,roll:0});return '<button '+(ok?'':'disabled ')+'onclick="FrontierContainers.openSearchDoor(&quot;breach&quot;,'+esc(JSON.stringify(uid))+','+esc(JSON.stringify(t.id))+')">'+names[i]+' · '+esc(scene.lock?.targetNames?.[i]||'容器')+'</button>'}).join('')+'</div>','<button onclick="FrontierContainers.showSearchDoor()">返回</button>');
 }
 function doorOption(row,title,cost,penalty,onclick,disabled){
  const icon=row?FrontierIcons.access(row.item):'';
  return '<button class="search605-opt" '+(disabled?'disabled ':'')+'onclick="'+onclick+'"><span class="search605-ic" aria-hidden="true">'+icon+'</span><span class="search605-tx"><b>'+esc(title)+'</b><small>'+cost+'</small><em>'+penalty+'</em></span></button>';
 }
 function doorActions(scene){
  if(!scene.lock)return '<button class="primary" onclick="FrontierContainers.openSearchDoor()">解除隔離門</button>';
  const run=R(),items=accessItems(run),out=[],keys=doorOpeners(scene),need=doorNeeds(scene),toolRoom=noKeyRoom(scene);
  for(const row of keys)out.push(doorOption(row,'用'+locks.catalog[row.id].name+'打開','預計消耗 '+row.cost+' 點（剩 '+row.uses+' 點）'+(locks.tools[row.id]?.alert?' · 警戒 +'+locks.tools[row.id].alert:''),'代價：只扣點數；容器全數保全，但不額外給物資。門後容器仍可能需要開鎖裝置。',"FrontierContainers.openSearchDoor(&quot;access&quot;,"+esc(JSON.stringify(row.item.uid))+")"));
  if(!keys.length)out.push('<p class="search605-miss">未攜帶可開此門的'+(toolRoom?'開鎖裝置':'房卡')+'。需要：'+need.map(id=>'<img src="assets/search174/'+id+'.png" alt="" title="'+esc(locks.catalog[id].name)+'">'+esc(locks.catalog[id].name)).join('、')+'</p>');
  const info={B1:['爆破藥包','消耗 1 件 · 警戒 +25（本局第二次 +40，並引來追兵）','代價：炸毀較稀有的容器，房內只留 1～2 箱；每局最多爆破 2 次。'],B2:['定向切割炸藥','消耗 1 件 · 警戒 +18（本局第二次 +30，並引來追兵）','代價：自選 1 區容器犧牲，40% 再波及 1 區；每局限用 1 次。']};
  for(const id of ['B1','B2']){
   const row=items.find(r=>r.id===id&&r.uses>0),d=locks.catalog[id];
   let why='';if(!row)why='（未攜帶）';else if(!(id==='B1'?scene.lock.breachable:scene.lock.precisionBreachable))why='（此門無法爆破）';else if(!locks.breachPlan({...breachParams(scene,run,row,id==='B2'?scene.targets[0].box.uid:null),roll:0})&&!(id==='B2'&&scene.targets.some(t=>locks.breachPlan({...breachParams(scene,run,row,t.box.uid),roll:0}))))why='（本局爆破額度已用完）';
   const click=!row?'':id==='B1'?"FrontierContainers.openSearchDoor(&quot;breach&quot;,"+esc(JSON.stringify(row.item.uid))+")":"FrontierContainers.chooseBreach("+esc(JSON.stringify(row.item.uid))+")";
   out.push(doorOption(row||{item:{itemId:'search174_'+id}},'用'+info[id][0]+'炸開'+why,info[id][1],info[id][2],click,!!why));
  }
  const scout=items.find(r=>r.id==='S1'&&r.uses>=r.cost),scoutAny=items.find(r=>r.id==='S1');
  if(!scene.scouted605)out.push(doorOption(scout||scoutAny||{item:{itemId:'search174_S1'}},'啟用'+locks.catalog.S1.name+(scout?'':scoutAny?'（點數不足）':'（未攜帶）'),(scoutAny?'預計消耗 '+scoutAny.cost+' 點（剩 '+scoutAny.uses+' 點）':'每次消耗 普通1／困難2／極限4／折磨5／高危5 點')+' · 警戒 +1 · 不開門','代價：扣偵查儀點數；可看到門後每個容器需要的開鎖裝置等級，再決定要不要開。',scout?"FrontierContainers.openSearchDoor(&quot;scout&quot;,"+esc(JSON.stringify(scout.item.uid))+")":'',!scout));
  if(canSearchExterior(scene))out.push('<button onclick="FrontierContainers.openSearchDoor(&quot;exterior&quot;)">只搜外圍 · 不加警戒 · 放棄門後容器</button>');
  return out.join('');
 }
 function consumeAccess(run,row){
  const def=locks.catalog[row.id];
  if(row.points){
   /* v604 點數制：依難度扣點，並發放權限獎勵素材 */
   const left=Math.max(0,row.uses-row.cost);
   row.item.searchPoints604=left;row.item.searchUses174=Math.ceil(left/locks.maxPoints(row.id)*def.uses);
   if(row.id[0]==='T')grantAccessBonus(run,row);/* v605：房卡只保全容器，不另給物資 */
  }else row.item.searchUses174=row.uses-1;
  const uid=row.item.uid;
  if(!(row.points?row.item.searchPoints604:row.item.searchUses174)&&!run.searchKeys174?.includes(uid)){run.itemCargo=run.itemCargo.filter(i=>i.uid!==uid);if(run.secureGrid)run.secureGrid.items=run.secureGrid.items.filter(i=>i.uid!==uid);}
  FrontierGrid.sync();
 }
 function useText(row){return row.points?'消耗 '+row.cost+' 點（剩 '+row.uses+' 點）':'消耗 1 次（剩 '+row.uses+' 次）'}
 /* 權限獎勵：價值（金材當量）＝消耗點數×難度倍率×每點價值；拆成金／銀／藍素材，餘數以機率給藍材，期望值不變。 */
 function grantAccessBonus(run,row){
  const value=locks.accessBonusValue(row.id,run);if(!(value>0)||!run.field?.materials)return;
  const families=run.focus27?.families?.length?run.focus27.families:Object.keys(FrontierProgress.families);
  const SV=locks.SILVER_VALUE,BV=locks.BLUE_VALUE;let gold=Math.floor(value+1e-9),rest=value-gold,silver=Math.floor(rest/SV+1e-9);rest-=silver*SV;let blue=Math.floor(rest/BV+1e-9);rest-=blue*BV;if(random()<rest/BV)blue++;
  const got=[];
  for(const [tier,count] of [[6,gold],[5,silver],[4,blue]])for(let i=0;i<count;i++){const id=FrontierProgress.materialId(pick(families),tier);run.field.materials[id]=(run.field.materials[id]||0)+1;got.push(id)}
  (run.accessBonus604??=[]).push({id:row.id,cost:row.cost,value:Math.round(value*100)/100,items:got});
  if(got.length&&typeof toast==='function')toast('權限獎勵：'+[[6,'金'],[5,'銀'],[4,'藍']].map(([tier,name])=>{const n=got.filter(id=>catalog[id]?.rarity===tier).length;return n?name+'材×'+n:''}).filter(Boolean).join('、'));
 }
 function unlockSearchCore(uid){
  const run=R(),scene=searchScene(),target=scene?.targets[scene.focus];
  if(!scene?.open||scene.active!==null||target?.status!=='waiting'||!target.core||target.core.open)return;
  const row=accessItems(run).find(x=>x.item.uid===uid);
  if(!row||!fitsAccess(target.core,row))return;
  consumeAccess(run,row);target.core.open=true;
  applyAlert(run,target.core.id,locks.tools[row.id]?.alert||0,'核心權限核驗');
  save();render();
 }
 function suspendSearchBox(){
  if(searchScene()?.search141)return FrontierSearch141.back();
  const event=R()?.event,scene=event?.searchScene,target=scene?.targets[scene.active];
  if(!target)return;
  target.box=event.box;
  target.paused=true;
  scene.active=null;
  closeModal();save();render();
 }
 function objectRule(target){
  if(!target.structure174)return null;const rule=locks.containerRule(target.box.itemId),scene=searchScene();
  if(!rule.kind||target.core||!scene?.targets?.includes(target)||scene.targets.every(t=>(t.box.sealed?.tier||0)>=5))return rule;
  const locked=scene.targets.filter(t=>t.core||t.structure174&&locks.containerRule(t.box.itemId).kind).sort((a,b)=>Number(!!b.core)-Number(!!a.core)||(b.box.sealed?.tier||0)-(a.box.sealed?.tier||0)||scene.targets.indexOf(a)-scene.targets.indexOf(b));
  return locked.indexOf(target)>=2?{type:1,name:'已解除箱鎖',alert:0}:rule;
 }
 function objectMethods(scene,target){
  const rule=objectRule(target);if(!rule?.kind||target.objectOpened174||target.core)return [];
  const lock={...scene.lock,...rule,core:false};
  return accessItems(R()).filter(row=>row.id[0]==='T'&&fitsAccess(lock,row));
 }
 const coldRoomRisk=run=>['chernobog','kjerag','sami'].includes(run.expedition.regionId);
 function prepareObject(method,uid){
  if(searchScene()?.search141)return method==='tool'?FrontierSearch141.unlock(uid):false;
  const run=R(),scene=searchScene(),target=scene?.targets[scene.focus];
  if(!scene?.open||scene.active!==null||target?.status!=='waiting'||target.core||target.objectOpened174)return;
  const rule=objectRule(target);
  if(!rule)return;
  let alert;
  if(method==='tool'){
   const row=objectMethods(scene,target).find(x=>x.item.uid===uid);
   if(!row)return;
   alert=locks.catalog[row.id].key?(rule.type===5?2:1):locks.tools[row.id].alert;
   consumeAccess(run,row);
  }else if(method==='clue'&&rule.clue&&target.locatedCode174)alert=2;
  else if(method==='force'&&rule.force){
   alert=rule.force;
   target.lostCompartment174=!!target.hiddenReward;
   if(rule.type===6&&coldRoomRisk(run))FrontierEnvironment.adjust(1,"應急破封");
   if(rule.guard&&!scene.guardFought174)target.requiresGuard174=true;
  }else return;
  target.objectOpened174=method;
  if(run.tools)run.tools.searchActions++;
  applyAlert(run,target.box.uid+':lock',alert,'容器開啟');
  save();render();
 }
 function packSealedSearch(){if(searchScene()?.search141&&searchScene().active===null)return false;
  const run=R(),event=run?.event,scene=event?.searchScene,target=scene?.targets[scene.focus];
  if(!scene?.open||scene.active!==null||target?.status!=='waiting'||target.core&&!target.core.open||!objectRule(target)?.carrySealed)return;
  const box=target.box;
  if(!FrontierGrid.canTake(box.itemId,'equipment')){toast('背包空間不足，無法整箱帶走。');return;}
  box.sealed.fieldSeal174=true;
  scene.active=scene.focus;
  event.box=box;
  carry();
 }
 function inspectSearchTarget(){
  const scene=searchScene(),target=scene?.targets[scene.focus];
  if(!scene?.open||scene.active!==null||target?.status!=='waiting')return;
  const rule=objectRule(target);
  if(rule?.clue&&!target.core&&!target.locatedCode174&&
      scene.targets.some(other=>other!==target&&other.generalDone))target.locatedCode174=true;
  target.inspected174=true;
  save();render();
 }
 function sceneSearchActions(scene){
  const target=scene.targets[scene.focus];
  if(scene.search141)return FrontierSearch141.operations(scene,target);
  if(target.paused)return '<button class="primary" onclick="FrontierContainers.beginSceneSearch(&quot;resume&quot;)">繼續開箱</button>';
  if(target?.core&&!target.core.open){
   const permitted=accessItems(R()).filter(row=>row.id[0]==='T'&&fitsAccess(target.core,row));
   return '<span>核心容器需要相容的開鎖裝置；房卡只用於房門</span>'+permitted.map(row=>'<button onclick="FrontierContainers.unlockSearchCore('+esc(JSON.stringify(row.item.uid))+')"><span aria-hidden="true">'+FrontierIcons.html(row.item.itemId)+'</span>'+esc(locks.catalog[row.id].name)+' · '+useText(row)+'</button>').join('');
  }
  const rule=objectRule(target),definition=catalog[target.box.itemId];
  const inspected=target.inspected174?
   '<small>'+esc(definition.name)+' · '+FrontierInventory.qualityName(target.box.sealed.quality+1)+' · '+esc(rule?.name||'一般封裝')+(rule?.level?' L'+rule.level:'')+' · '+definition.gridSize.w+'×'+definition.gridSize.h+(target.hiddenReward&&!target.lostCompartment174?' · 有暗格':'')+'</small>':
   '<button onclick="FrontierContainers.inspectSearchTarget()">查看容器</button>';
  const openMethods=()=>{
   const available=objectMethods(scene,target).map(row=>'<button onclick="FrontierContainers.prepareObject(&quot;tool&quot;,'+
    esc(JSON.stringify(row.item.uid))+')">'+esc(locks.catalog[row.id].name)+' · '+useText(row)+' · 警戒 +'+(locks.catalog[row.id].key?(rule.type===5?2:1):locks.tools[row.id].alert)+'</button>').join('');
   const clue=target.locatedCode174?'<button onclick="FrontierContainers.prepareObject(&quot;clue&quot;)">輸入現場密碼 · 警戒 +2</button>':'';
   const force=rule.force?'<button onclick="FrontierContainers.prepareObject(&quot;force&quot;)">強行破拆 · 警戒 +'+rule.force+
    (target.hiddenReward?' · 損失暗格':'')+(rule.type===6&&coldRoomRisk(R())?' · 加重地區環境':'')+(rule.guard&&!scene.guardFought174?' · 須先迎戰守衛':'')+'</button>':'';
   const sealed=rule.carrySealed?'<button onclick="FrontierContainers.packSealedSearch()">整箱帶走 · '+definition.gridSize.w+'×'+definition.gridSize.h+'</button>':'';
   return (available+clue+force||'<small>需要相容的開鎖裝置。</small>')+sealed;
  };
  if(target.requiresGuard174)return inspected+'<button class="primary" onclick="FrontierContainers.faceSearchGuard()">迎戰守衛後搜索</button>';
  if(rule?.kind&&!target.objectOpened174&&!target.core)return inspected+openMethods();
  const alert=target.quickDone?2:rule?.alert??2;
  const general='<button class="primary" onclick="FrontierContainers.beginSceneSearch()">' +(alert?'一般搜索 · 1 次行動 · 警戒 +'+alert:'直接拾取')+'</button>';
  const quick=rule?.type!==1&&!target.quickDone&&!target.generalDone&&R().tools?
    '<button onclick="FrontierContainers.beginSceneSearch(&quot;quick&quot;)">快速翻找 · 1 次行動 · 只開表層</button>':'';
  const deep=target.hiddenReward&&!target.lostCompartment174&&target.generalDone&&!target.deepDone&&R().tools?
    '<button onclick="FrontierContainers.beginSceneSearch(&quot;deep&quot;)">開啟暗格 · 1 次行動 · 警戒 +5</button>':'';
  const sorting=deep&&target.hiddenVariants?'<label class="search174-sort">材料分支<select data-native-select="true" aria-label="暗格材料分支" onchange="FrontierContainers.chooseSearchFamily(this.value)"><option value="">沿用物資原分支</option>'+Object.entries(target.hiddenVariants).map(([key,value])=>'<option value="'+esc(key)+'">'+esc(catalog[value.itemId].name)+'</option>').join('')+'</select></label>':'';
  return inspected+(target.generalDone?'':general)+quick+sorting+deep;
 }
 let searchFamily;
 function chooseSearchFamily(family){
  const scene=searchScene(),target=scene?.targets[scene.focus];
  if(target)searchFamily={uid:target.box.uid,family};
 }
 function beginSceneSearch(method="general"){
  if(searchScene()?.search141)return FrontierSearch141.begin(({general:'normal',quick:'surface'})[method]||method);
  const event=R()?.event,scene=event?.searchScene,target=scene?.targets[scene.focus];
  if(!scene?.open||scene.active!==null||target?.status!=='waiting'||target.core&&!target.core.open)return;
  const run=R(),sealed=target.box.sealed,rule=objectRule(target);
  if(target.requiresGuard174||rule?.kind&&!target.core&&!target.objectOpened174)return;
  if(method==='resume'){
   if(!target.paused)return;
   delete target.paused;
  }else if(method==='quick'){
   if(!run.tools||rule?.type===1||target.quickDone||target.generalDone)return;
   target.quickDone=true;run.tools.searchActions++;
   sealed.surfaceOnly=true;
  }else if(method==='general'){
   if(target.generalDone)return;
   target.generalDone=true;
   delete sealed.surfaceOnly;
   if(run.tools)run.tools.searchActions++;
   const alert=target.quickDone?2:rule?.alert??2;
   if(alert)applyAlert(run,target.box.uid+":search",alert,"一般搜索");
  }else if(method==='deep'){
   if(!target.generalDone||target.deepDone||!target.hiddenReward||target.lostCompartment174||!run.tools)return;
   target.deepDone=true;run.tools.searchActions++;
   const family=searchFamily?.uid===target.box.uid?searchFamily.family:null;
   const directed=target.hiddenVariants?.[family];
   if(directed)target.deepFamily=family;
   sealed.contents.push(directed||target.hiddenReward);sealed.claimed.push(false);
   sealed.revealed=sealed.contents.length;
   delete sealed.layout;
   applyAlert(run,target.box.uid+":deep",5,"開啟暗格");
  }else return;
  scene.active=scene.focus;
  event.box=target.box;
  save();render();
 }
 function returnToSearchScene(carried=false){
  if(searchScene()?.search141)return FrontierSearch141.back(carried);
  const event=R()?.event,scene=event?.searchScene,target=scene?.targets[scene.active];
  if(!target)return;
  target.box=event.box;
  const canResume=!target.generalDone||target.hiddenReward&&!target.lostCompartment174&&!target.deepDone;
  target.status=carried?'carried':canResume?'waiting':event.box.sealed.claimed.every(Boolean)?'searched':'left';
  // The next interaction resumes from the same floor position.
  scene.active=null;
  if(document.querySelector('#modal[open] [data-search174-box]'))closeModal();
  event.box=scene.targets.find(t=>t.status==='waiting')?.box||event.box;
  save();render();
 }
 function faceSearchGuard(){
  const run=R(),scene=searchScene(),target=scene?.targets[scene.focus];
  if(!scene?.open||scene.active!==null||!target?.requiresGuard174||run.battle)return;
  const event=run.event;
  run.searchGuard174=event;
  run.event=null;
  startBattle('battle');
  if(!run.battle){delete run.searchGuard174;run.event=event;return;}
  save();render();
 }
 function searchPursuit(run){
  /* 警戒追擊套用所有難度。 */
  return run.pendingBreachIntercept||run.alert>=75&&!run.searchPursuits174?.includes(run.expedition.layer);
 }
 function leaveSearchScene(evade=false){
  const run=R(),scene=searchScene();
  if(!scene||scene.active!==null||run.battle)return;
  if(!searchPursuit(run)){completeNode();return;}
  const layer=run.expedition.layer;
  const untouched=scene.targets.every(t=>t.status!=='carried'&&!t.box.sealed.claimed.some(Boolean));
  if(evade&&!untouched)return;
  const pending=run.pendingBreachIntercept;
  const pursuits=run.searchPursuits174??=[];
  const newPursuit=!pursuits.includes(layer);
  if(newPursuit)pursuits.push(layer);
  if(evade){delete run.pendingBreachIntercept;completeNode();return;}
  const event=run.event;
  delete run.pendingBreachIntercept;
  run.breachIntercept174=run.expedition.current;
  run.event=null;
  startBattle('battle');
  if(!run.battle){
   delete run.breachIntercept174;
   if(pending)run.pendingBreachIntercept=true;
   if(newPursuit)pursuits.pop();
   run.event=event;
   toast('追兵戰鬥無法初始化，搜索進度保留。');
   return;
  }
  save();render();
 }
 function takeRitualSignal(){
  const run=R(),scene=searchScene();
  if(!scene?.open||scene.active!==null||scene.outerOnly174||!scene.ritualSignal174||scene.ritualTaken174)return;
  const id=accessId('K10');
  if(!FrontierGrid.canTake(id,'equipment')){toast('背包沒有放置信物的空間。');return}
  scene.ritualTaken174=true;
  run.itemCargo.push(FrontierInventory.create(id,1,{source:'ritual:'+run.expedition.current,run:run.number}));
  applyAlert(run,scene.lock.id+':ritual',2,'回收祭儀信物');
  FrontierGrid.sync();save();render();
 }
 function specialContainmentReady(run,scene){
  return scene.open&&!scene.outerOnly174&&scene.shinyRoll!=null&&scene.targets[3].core?.open&&!run.battle&&scene.active===null&&
    scene.targets.every(t=>t.status==='waiting')&&!run.specialContainment174?.includes(run.expedition.layer);
 }
 function specialContainment(){
  const run=R(),scene=searchScene();
  if(!run||!scene||!specialContainmentReady(run,scene))return;
  (run.specialContainment174??=[]).push(run.expedition.layer);
  applyAlert(run,run.expedition.current+':containment',9,'解除活體隔離');
  const chance=run.expedition.layer===1?.25:.35;
  run.event=null;
  startBattle('battle');
  const enemy=run.battle?.enemies.find(e=>{
   const def=FrontierCapture.units[e.species];
   return def?.kind==='enemy'&&!def.boss&&!def.retired&&!e.regionBoss;
  });
  if(enemy&&scene.shinyRoll<chance){enemy.shiny174=true;enemy.name='異色 · '+enemy.name;}
  if(!run.battle)throw Error('收容戰鬥無法初始化，搜索進度保留。');
  save();render();
 }
 function searchChoice(scene,walking=false){
  const index=scene.focus;
  if(!scene.open||scene.active!==null||index<0||scene.targets[index]?.status!=='waiting')return '';
  return '<div class="search174-choice '+(index%2?'choice-left':'choice-right')+(index>=2?' choice-bottom':'')+(walking?' after-walk':'')+'">'+sceneSearchActions(scene)+'</div>';
 }
 function searchSceneView(scene){
  if(scene?.search141)return FrontierSearch141.view(scene);
  return legacyRoom141(scene);
 }
 function legacyRoom141(scene){
  const pursuit=searchPursuit(R());
  const evade=pursuit&&scene.targets.every(t=>t.status!=='carried'&&!t.box.sealed.claimed.some(Boolean));
  const [x,y]=roomPositions[scene.focus]||entryPosition;
  const exit='<button class="search174-exit" aria-label="'+(pursuit?'離開並迎擊追兵':'離開搜索區')+'" onclick="FrontierContainers.leaveSearchScene()">'+(pursuit?'迎擊追兵':'離開')+'</button>';
  return '<section class="panel event-panel search174-scene"><div class="search174-title"><h2>'+esc(scene.lock?.name||'搜索現場')+'</h2>'+exit+'</div>'+alertView(R())+'<div class="search174-stage'+(scene.open?'':' is-sealed')+'" data-room="'+(scene.lock?.room||1)+'">'+
    (scene.open?'<div class="search174-targets">'+scene.targets.map((target,index)=>{
      if(scene.outerOnly174&&index>0)return '';
      const box=target.box,done=target.status!=='waiting',label=scene.lock?.targetNames?.[index]||catalog[box.itemId].name;
      const repeated=scene.targets.some((previous,i)=>i<index&&previous.box.itemId===box.itemId);
      return '<button data-search-target="'+index+'" aria-pressed="'+(scene.focus===index)+'" '+(done?'disabled':'')+' onclick="FrontierContainers.focusSearch('+index+')">'+roomContainerModel(box,label,index,repeated)+'<b>'+esc(label)+'</b><small>'+({waiting:scene.search141?(target.search141.paused?'搜索未完成':target.search141.first==='normal'?'可繼續搜索':target.search141.locked&&!target.search141.unlocked?'容器上鎖':'未搜索'):target.generalDone?'暗格待開':target.quickDone?'已翻找表層':'未搜索',searched:'已搜索',left:'已離開',carried:'已攜走',destroyed:'已毀損'})[target.status]+'</small></button>';
    }).join('')+'</div>':'<button class="search174-door" onclick="FrontierContainers.showSearchDoor()"><span aria-hidden="true" class="search174-lock"></span><b>區域隔離門</b></button>')+
    '<span class="search174-avatar" style="--walk-x:'+x+'%;--walk-y:'+y+'%" aria-hidden="true"><i></i><b>博士</b></span>'+
    searchChoice(scene)+'</div>'+
    '<div class="search174-actions">'+
    (scene.open&&!scene.outerOnly174&&scene.ritualSignal174&&!scene.ritualTaken174&&scene.active===null?'<button onclick="FrontierContainers.takeRitualSignal()">檢查祭儀暗號 · 警戒 +2</button>':'')+
    (specialContainmentReady(R(),scene)?'<button onclick="FrontierContainers.specialContainment()">解除活體隔離 · 放棄房內物資 · +9 警戒</button>':'')+
    (evade?'<button onclick="FrontierContainers.leaveSearchScene(true)">放棄物資並避開追兵</button>':'')+'</div></section>';
 }
 function qualityLabel(q){return ({1:"白階",2:"綠階",3:"藍階",4:"銀階",5:"金階"})[q]||"未辨識"}
 function standardSearchBox(r,node){const e=r.expedition;const q=node.containerQuality??(e.mode==='scout'?1+rnd(2):node.hidden?4:e.layer>=4?3+rnd(3):e.layer>=2?2+rnd(3):1+rnd(3));const difficulty=['normal','hard','extreme','torment'].indexOf(e.difficulty),adjust=node.containerQuality==null&&e.mode!=='scout',floor=[2,2,3,3][Math.max(0,difficulty)],scaled=adjust?Math.min(5,Math.max(floor,q)+(random()<[0,.15,.3,.45][Math.max(0,difficulty)]?1:0)):q;return drop(scaled,pick(['industrial','medical','armory','biological','intelligence','relic']),{source:node.id,run:r.number})}
 function openNode(node){startSearchScene(R(),node)}
 // All search entrances, including temporary floors, use the same persisted room system.
 const enterBefore142=enter;enter=function(type){const r=R();if(type==='search'&&r?.expedition&&!r.result&&!r.battle&&!r.reward&&!r.event&&r.choices?.includes(type)){const node=r.expedition.layers.flatMap(l=>l.rows.flat()).find(n=>n.id===r.expedition.current)||{id:r.expedition.current||'search:'+r.number+':'+r.depth};openNode(node);return}return enterBefore142(type)};
 let converting142=false;
 function convertLegacySearch142(){if(converting142||R()?.event?.type!=='search')return;converting142=true;queueMicrotask(async()=>{try{await FrontierRuntime.perform('search142-legacy-room',()=>{const r=R();if(r?.event?.type!=='search'||r.result||r.battle||r.reward)return false;const node=r.expedition?.layers.flatMap(l=>l.rows.flat()).find(n=>n.id===r.expedition.current)||{id:r.expedition?.current||'search:'+r.number+':'+r.depth};openNode(node);save();render();return true})}finally{converting142=false}})}

 function carriedBoxes(r=R()){
  if(!r||r.result)return [];
  return [...(r.itemCargo||[]),...(r.grid?.groundItems||[]),...(r.secureGrid?.items||[]).map(item=>item.instance).filter(Boolean)].filter(box=>catalog[box.itemId]?.category==='container'&&box.sealed);
 }
 function carriedBox(){
  const panel=document.querySelector('#modal[open] [data-carried-box]');
  return panel&&carriedBoxes().find(box=>box.uid===panel.dataset.carriedBox)||null;
 }
 function currentBox(){return carriedBox()||(page==='containers'&&baseBox?db.inventory.items.find(x=>x.uid===baseBox):page==='containers'?null:R()?.event?.box)}
 function fieldTools(run,box){
  const permitted=box.sealed.quality>=5?['T4']:box.sealed.quality===4?['T3','T4']:['T2','T3','T4'];
  return accessItems(run).filter(row=>row.uses>=row.cost&&permitted.includes(row.id));
 }
 function unsealCarried(boxUid,toolUid){
  const run=R(),box=carriedBoxes().find(item=>item.uid===boxUid);
  if(!box?.sealed.fieldSeal174)return;
  const row=fieldTools(run,box).find(tool=>tool.item.uid===toolUid);
  if(!row)return;
  consumeAccess(run,row);
  delete box.sealed.fieldSeal174;
  if(run.tools)run.tools.searchActions++;
  applyAlert(run,box.uid+':unseal',4,'野外解封');
  save();openCarried(boxUid);
 }
 function openCarried(uid){
  const box=carriedBoxes().find(item=>item.uid===uid);if(!box)return false;
  if(box.sealed.fieldSeal174){
   const choices=fieldTools(R(),box).map(row=>'<button onclick="FrontierContainers.unsealCarried('+
    esc(JSON.stringify(uid))+','+esc(JSON.stringify(row.item.uid))+')">'+esc(locks.catalog[row.id].name)+' · '+useText(row)+' · 警戒 +4</button>').join('');
   closeModal();modal('野外解封','<div class="search174-door-options">'+(choices||'<p>需要適階破解器，也可整箱帶回基地拆封。</p>')+'</div>',
    '<button onclick="FrontierContainers.returnToBag()">返回背包</button>');
   return true;
  }
  closeModal();modal('現場開箱','<div data-carried-box="'+esc(uid)+'">'+boxView(box)+'</div>','<button onclick="FrontierContainers.returnToBag()">返回背包</button>');
  window.FrontierLootGrid?.schedule();return true;
 }
 function chooseCarried(forceList=false){
  const boxes=carriedBoxes();if(!forceList&&boxes.length===1)return openCarried(boxes[0].uid);
  closeModal();modal('選擇容器','<div class="carried-box-list">'+(!boxes.length?'<p>背包內沒有其他可開啟的容器。</p>':'')+boxes.map(box=>{const d=catalog[box.itemId];return '<button class="rarity-'+(box.sealed.quality+1)+'" data-item-id="'+d.id+'" onclick="FrontierContainers.openCarried(\''+esc(box.uid)+'\')">'+FrontierIcons.html(d.id)+'<span>'+esc(d.name)+' · '+d.gridSize.w+'×'+d.gridSize.h+'</span></button>'}).join('')+'</div>','<button onclick="FrontierContainers.returnToBag()">返回背包</button>');
 }
 function returnToBag(){closeModal();if(page==='run'&&R()?.grid&&!R()?.result)FrontierScreen.openTool('bag')}
 function finishCarried(box){
  const r=R();
  r.itemCargo=r.itemCargo.filter(item=>item.uid!==box.uid);
  if(r.grid?.groundItems)r.grid.groundItems=r.grid.groundItems.filter(item=>item.uid!==box.uid);
  if(r.secureGrid?.items)r.secureGrid.items=r.secureGrid.items.filter(item=>item.uid!==box.uid);
  const c=ensure();c.opened++;c.history.unshift({id:box.uid,quality:box.sealed.quality,at:Date.now(),contents:box.sealed.contents,source:'field'});c.history=c.history.slice(0,200);
  closeModal();
 }
 function closeCarried(keep=true){const r=R(),box=r?.event?.box;if(!r?.boxReturn||box?.uid!==r.boxReturn.uid)return false;const empty=box.sealed.claimed.every(Boolean);if(keep&&!empty){if(!FrontierGrid.canTake(box.itemId,'equipment')){toast('需要騰出完整空間收回箱子，或選擇放棄剩餘內容。');return false}r.itemCargo.push(box)}if(empty){const c=ensure();c.opened++;c.history.unshift({id:box.uid,quality:box.sealed.quality,at:Date.now(),contents:box.sealed.contents,source:'field'});c.history=c.history.slice(0,200)}delete r.boxReturn;r.event=null;FrontierGrid.sync();save();render();return true}
 function openBase(uid){const box=db.inventory.items.find(x=>x.uid===uid&&catalog[x.itemId]?.category==='container');if(!box)return;baseBox=uid;ensure().activeBox=uid;page='containers';save();render()}
 const searchCount=box=>box.sealed.surfaceOnly?1:box.sealed.contents.length;
 function reveal(all=false){if(searchScene()?.search141&&searchScene().active===null)return;const box=currentBox();if(!box)return;if(R()?.equipment139&&!R().result&&box.sealed.preview139&&!box.sealed.preview139.confirmed){toast('請先確認裝備容器預覽，再開始搜尋。');return}box.sealed.revealed=all?searchCount(box):Math.min(searchCount(box),box.sealed.revealed+1);save();renderLoot()}
 function finishBase(box){if(page!=='containers'||!baseBox||!box.sealed.claimed.every(Boolean))return;db.inventory.items=db.inventory.items.filter(x=>x.uid!==box.uid);const c=ensure();c.opened++;c.history.unshift({id:box.uid,quality:box.sealed.quality,at:Date.now(),contents:box.sealed.contents});c.history=c.history.slice(0,200);baseBox=null;c.activeBox=null}
 function take(index,refresh=true){if(searchScene()?.search141&&searchScene().active===null)return;const box=currentBox(),s=box?.sealed;if(!s||index>=s.revealed||s.surfaceOnly&&index>0||index<0||s.claimed[index])return;if(R()?.equipment139&&!R().result&&s.preview139&&!s.preview139.confirmed)throw Error('請先確認開始搜尋');const content=s.contents[index],d=catalog[content.itemId];const carried=carriedBox()?.uid===box.uid;if(page!=='containers'&&!canCollectAccess(content.itemId))return;if(carried)window.FrontierExplorer?.search(box);s.claimed[index]=true;if(baseBox&&page==='containers'){if(['material','record','medicine'].includes(d.category))FrontierProgress.deposit(d.id,content.qty);else FrontierEquipment.deposit(FrontierInventory.create(d.id,content.qty,{source:'box:'+box.uid+':'+index}));finishBase(box)}else{if(['material','record','medicine'].includes(d.category))R().field.materials[d.id]=(R().field.materials[d.id]||0)+content.qty;else R().itemCargo.push(FrontierInventory.create(d.id,content.qty,{source:'box:'+box.uid+':'+index}));if(carried&&s.claimed.every(Boolean))finishCarried(box);FrontierGrid.sync();if(!carried&&R().boxReturn&&s.claimed.every(Boolean))closeCarried(false)}if(!baseBox&&R()&&!R().result)window.FrontierEquipmentFieldUI139?.containerLoot(box);if(refresh){save();renderLoot()}if(carried&&s.claimed.every(Boolean))chooseCarried(true)}
 function takeAll(){const box=currentBox();if(!box)return;if(!box.sealed.contents.length&&page==='containers'){finishBase(box);save();renderLoot();return}const count=box.sealed.revealed;for(let i=0;i<count&&currentBox()?.uid===box.uid;i++)take(i,false);save();renderLoot()}
 function carry(){if(searchScene()?.search141&&searchScene().active===null)return false;if(currentBox()?.sealed.surfaceOnly){toast('請先完成一般搜索再帶走物資箱。');return}if(carriedBox())return returnToBag();if(R()?.boxReturn)return closeCarried(true);const box=currentBox();if(!box||baseBox&&page==='containers')return;if(!FrontierGrid.canTake(box.itemId,'equipment')){const {w,h}=catalog[box.itemId].gridSize;toast('密封箱需要 '+w+'×'+h+' 的完整空間。可先開箱或整理背包。');return}R().itemCargo.push(box);FrontierGrid.sync();if(searchScene()?.active!=null)return returnToSearchScene(true);completeNode()}
 function leave(){if(searchScene()?.active!=null){return returnToSearchScene()}if(R()?.boxReturn){modal('放棄未取出的內容？','<p>已裝入背包的物資保留；未拿取的箱內物品留在此地。這不會推進路線。</p>','<button class="danger" onclick="closeModal();FrontierContainers.closeCarried(false)">放棄剩餘內容，返回路線</button><button onclick="closeModal()">繼續整理</button>');return}if(baseBox&&page==='containers'){baseBox=null;ensure().activeBox=null;save();render();return}modal('放棄未裝入的箱內物資？','<p>已裝入的內容保留；箱子與尚未拿取的物資留在此地。</p>','<button class="danger" onclick="closeModal();completeNode()">確認前進</button><button onclick="closeModal()">繼續整理</button>')}
 function boxView(box){const scene=searchScene();if(scene&&R()?.event?.box===box&&scene.active===null)return searchSceneView(scene);if(window.FrontierLootGrid)return FrontierLootGrid.view(box);const s=box.sealed;return `<section class="panel"><div class="eyebrow">SEALED LOOT / FIXED AT ACQUISITION</div><h1>${catalog[box.itemId].name}</h1><p class="tiny muted">${box.uid} · 2×3 · 結果已固定。滑開封條或逐件揭曉；跳過動畫不會改變內容。</p><div class="box-packet rarity-${s.tier}" id="box-packet" role="button" tabindex="0" aria-label="向上滑動揭曉下一件"><b>▣</b><span>${s.revealed}/${s.contents.length} · 向上滑動拆封</span></div><div class="row"><button class="primary" onclick="FrontierContainers.reveal()">揭曉下一件</button><button onclick="FrontierContainers.reveal(true)">快速全部揭曉</button><button onclick="FrontierContainers.takeAll()">收取已揭曉</button></div><div class="loot-reveal-list">${s.contents.map((item,i)=>i>=s.revealed?'<div class="panel loot-unknown">？</div>':`<article class="panel rarity-${catalog[item.itemId].rarity}"><span class="tag">${FrontierInventory.qualityNames[catalog[item.itemId].rarity]}</span><h3>${catalog[item.itemId].name} ×${item.qty}</h3><p class="tiny muted">${catalog[item.itemId].description}</p><button ${s.claimed[i]?'disabled':''} onclick="FrontierContainers.take(${i})">${s.claimed[i]?'已收取':'裝入物資'}</button><button onclick="FrontierInventory.describe('${item.itemId}')">詳情</button></article>`).join('')}</div><div class="row">${baseBox?'<button onclick="FrontierContainers.leave()">收起箱子</button>':'<button onclick="FrontierContainers.carry()">帶走密封箱／剩餘內容</button><button onclick="FrontierContainers.leave()">放棄剩餘物資並前進</button>'}</div></section>`}
 function baseView(){const boxes=FrontierInventory.ensure().items.filter(x=>catalog[x.itemId]?.category==='container'),cores=db.inventory.items.filter(x=>x.itemId==='red_research_core');return `<section class="panel"><h3>封存戰利品</h3><p class="tiny muted">基地可不限數量保存密封箱，內容在取得時已固定。紅階所有來源每週隨機最多3件；總出率將納入全局模擬。</p>${boxes.map(box=>`<div class="trade-row"><span>${catalog[box.itemId].name} · ${box.uid}</span><button onclick="FrontierContainers.openBase('${box.uid}')">拆封</button></div>`).join('')||'<p class="tiny muted">尚無密封箱。</p>'}${cores.map(item=>`<div class="trade-row"><span>戰略研究封存核心</span><button onclick="FrontierContainers.studyCore('${item.uid}')">提交紀念研究</button></div>`).join('')}</section>`}
 function studyCore(uid){const item=db.inventory.items.find(x=>x.uid===uid&&x.itemId==='red_research_core');if(!item)return;db.research??={badges:[]};db.research.badges??=[];if(db.research.badges.includes('strategic_core')){toast('此研究已完成，可保留核心作紀念。');return}db.inventory.items=db.inventory.items.filter(x=>x.uid!==uid);db.research.badges.push('strategic_core');save();render()}
 const oldEvent=eventView;eventView=function(){if(R()?.event?.type==='search'&&R()?.expedition){$('#app').innerHTML=runHeader()+'<section class="panel"><p>PRTS／正在確認現場……</p></section>';convertLegacySearch142();return}if(R()?.event?.type==='sealedContainer'){$('#app').innerHTML=runHeader()+(searchScene()?searchSceneView(searchScene()):boxView(R().event.box))+bagHtml();return}oldEvent()};
 function renderLoot(){
  const scene=searchScene();
  const body=page==='run'&&scene?.active!=null&&document.querySelector('#modal[open] [data-search174-box]');
  if(body&&body.dataset.search174Box===R().event.box.uid){refreshSearchBox();return}
  render();
 }
 function refreshSearchBox(){
  const scene=searchScene();
  if(page!=='run'||scene?.active==null)return;
  const box=R().event.box, dialog=document.querySelector('#modal');
  const body=dialog.querySelector('[data-search174-box]');
  if(dialog.open&&body){
   if(body.dataset.search174Box!==box.uid){closeModal();refreshSearchBox();return}
   body.innerHTML=boxView(box);
   window.FrontierLootGrid?.schedule();
   return;
  }
  if(dialog.open)return;
  modal('現場開箱','<div data-search174-box="'+esc(box.uid)+'">'+boxView(box)+'</div>',
    '<button onclick="FrontierContainers.suspendSearchBox()">返回房間</button>');
  dialog.querySelector('.screen-tool-head button')?.setAttribute('onclick','FrontierContainers.suspendSearchBox()');
  window.FrontierLootGrid?.schedule();
 }
 document.querySelector('#modal')?.addEventListener('cancel',event=>{
  if(!event.target.querySelector('[data-search174-box]'))return;
  event.preventDefault();
  FrontierRuntime.perform('return-from-search-box',suspendSearchBox);
 });
 const oldRender=render;
 render=function(){
  if(page==='containers'){nav();const box=currentBox();$('#app').innerHTML=box?boxView(box):baseView()}
  else oldRender();
  const box=carriedBox();
  if(box)document.querySelector('#modal [data-carried-box]').innerHTML=boxView(box);
  refreshSearchBox();
 };
 const oldCollection=collection;collection=function(){oldCollection();$('#app').innerHTML=baseView()+$('#app').innerHTML};
 const oldCheck=checkBattle;checkBattle=function(){const r=R(),b=r?.battle;if(b&&r.searchGuard174&&r.hp>0&&b.enemies.every(e=>e.hp<=0)){const event=r.searchGuard174,scene=event.searchScene;scene.guardFought174=true;for(const target of scene.targets)delete target.requiresGuard174;delete r.searchGuard174;r.battle=null;r.event=event;save();render();return}if(b&&r.breachIntercept174===r.expedition?.current&&r.hp>0&&b.enemies.every(e=>e.hp<=0)){delete r.breachIntercept174;completeNode();return}if(r?.expedition&&b&&r.hp>0&&b.enemies.every(e=>e.hp<=0)&&!b.containerDropped){b.containerDropped=true;if(random()<(b.type==='boss'?.9:b.type==='elite'?.45:.2)){const q=r.expedition.mode==='scout'?1:b.type==='boss'?4+rnd(2):b.type==='elite'?3:1+rnd(3);r.itemCargo.push(drop(q,'armory',{source:'battle:'+r.number+':'+r.depth}))}}return oldCheck()};
 const oldValid=validSave;validSave=function(v){let copy=v;if(v.run?.event?.type==='sealedContainer')copy={...v,run:{...v.run,event:null}};if(!oldValid(copy))return false;const back=v.run?.boxReturn;if(back&&(back.version!==1||typeof back.uid!=='string'||v.run.event?.type!=='sealedContainer'||v.run.event.box?.uid!==back.uid||v.run.battle||v.run.reward||v.run.expedition?.current))return false;const boxes=[...(v.inventory?.items||[]),...(v.run?.itemCargo||[]),...(v.run?.grid?.groundItems||[]),...(v.run?.event?.box?[v.run.event.box]:[]),...(v.run?.secureGrid?.items||[]).filter(x=>x.kind==='equipment').map(x=>x.instance)].filter(x=>catalog[x.itemId]?.category==='container');return boxes.every(box=>{const s=box.sealed;return FrontierInventory.valid(box)&&s?.version===1&&(s.searchedInField===undefined||typeof s.searchedInField==='boolean')&&qualities[s.quality]&&Number.isInteger(s.tier)&&s.tier>=2&&s.tier<=7&&Array.isArray(s.contents)&&s.contents.length>=(s.search141Round?.mode==='surface'?1:s.equipmentRetired139===2?0:catalog[box.itemId].balance?.surveyEquipment?1:2)&&s.contents.length<=(box.itemId===grand?16:6)&&(!catalog[box.itemId].balance?.surveyEquipment||((s.contents.length===1||s.equipmentRetired139===2&&s.contents.length===0)&&s.tier===catalog[box.itemId].rarity&&s.contents.every(i=>catalog[i.itemId]?.category==='equipment'&&catalog[i.itemId].rarity===s.tier)))&&s.contents.every(i=>catalog[i.itemId]&&Number.isInteger(i.qty)&&i.qty>=1&&i.qty<=catalog[i.itemId].stack)&&Number.isInteger(s.revealed)&&s.revealed>=0&&s.revealed<=s.contents.length&&Array.isArray(s.claimed)&&s.claimed.length===s.contents.length&&s.claimed.every(x=>typeof x==='boolean')})};
 let touch=null;document.addEventListener('pointerdown',e=>{if(e.target.closest?.('#box-packet'))touch={id:e.pointerId,y:e.clientY}});document.addEventListener('pointerup',e=>{if(!touch||touch.id!==e.pointerId)return;const delta=touch.y-e.clientY;touch=null;if(delta>45)FrontierRuntime.perform('box-swipe',()=>reveal())});document.addEventListener('pointercancel',()=>touch=null);
 ensure();FrontierInventory.validateCatalog();
 return{legacyRoom141,legacyFocus141,accessRows141:accessItems,consumeAccess141:consumeAccess,qualities,searchSceneView,renderLoot,canCollectAccess,specialContainment,takeRitualSignal,faceSearchGuard,leaveSearchScene,unlockSearchCore,accessPrep,pickAccess,confirmAccess,prepareAccess,finishAccess,searchCount,focusSearch,showSearchDoor,openSearchDoor,chooseBreach,chooseSearchFamily,packSealedSearch,unsealCarried,inspectSearchTarget,prepareObject,beginSceneSearch,suspendSearchBox,returnToSearchScene,highRiskTier,highRiskDrop,ensure,day,week,quality,qualityLabel,reward,create,drop,grand,chooseCarried,carriedBoxes,carriedBox,returnToBag,openNode,openBase,openCarried,closeCarried,currentBox,reveal,take,takeAll,carry,leave,boxView,baseView,studyCore};
})();