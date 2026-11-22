'use strict';
window.FrontierContainers=(()=>{
 const catalog=FrontierInventory.definitions,qualities={1:{name:'廢棄盒',base:2,up:[[4,.05],[3,.35]]},2:{name:'基礎補給箱',base:3,up:[[5,.03],[4,.50]]},3:{name:'制式軍需箱',base:4,up:[[6,.01],[5,.08]]},4:{name:'加密補給箱',base:5,up:[[7,.005],[6,.08]]},5:{name:'戰略封存匣',base:5,up:[[7,.04],[6,.15]]}};
 for(const[q,d]of Object.entries(qualities)){const id='container_c'+q;catalog[id]={id,name:d.name,category:'container',rarity:Number(q)+1,description:'取得時固定內容，可帶回基地；單次品質判定，逐件揭曉不重抽。',effect:{type:'sealedContainer',quality:Number(q)},sources:['container.exploration','modern.battle'],recipe:null,gridSize:{w:2,h:3},stack:1,rv:[0,120,300,700,1800,3500][q],balance:{legacy:q==='1',quality:Number(q),baseTier:d.base,priorityRoll:d.up}}}
 const series=[
  ['field_bandage','巡線急救包',2,1,3,'medical'],['mess_tin','炊事班乾糧盒',2,2,2,'industrial'],['relay_parts','中繼器零件匣',2,3,1,'industrial'],['sample_carrier','野外採樣筒',2,1,2,'biological'],['courier_wrap','信差防潮匣',2,2,1,'intelligence'],
  ['clinic_tray','巡迴診所藥匣',3,2,2,'medical'],['demolition_case','工兵爆破具箱',3,3,1,'armory'],['signal_case','短波通訊箱',3,1,3,'intelligence'],['expedition_cooler','極地冷藏箱',3,2,3,'biological'],['workshop_case','移動工坊備件箱',3,3,2,'industrial'],
  ['surgeon_case','手術器械運輸箱',4,2,2,'medical'],['vault_ledger','礦權檔案匣',4,1,3,'intelligence'],['quarantine_case','檢疫所封存箱',4,2,3,'biological'],['armory_reserve','裝甲庫備件箱',4,3,2,'armory'],['reliquary','遺址保全匣',4,2,2,'relic'],
  ['night_dispatch','夜航密運艙',5,3,2,'intelligence'],['deep_sample','深層樣本冷封匣',5,2,3,'biological'],['sentinel_stock','哨戒軍械儲備箱',5,3,2,'armory'],['special_medicine','臨界醫療封存艙',5,2,2,'medical'],['black_archive','失聯據點遺留箱',5,2,3,'relic']
 ];
 const grand='container_last_light';
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
 function reward(tier,kind,region){
  const eligible=d=>window.FrontierCollections?.eligible(d,region)??true;
  let choices=Object.values(catalog).filter(d=>!d.dropDisabled141&&!d.retired139&&(!d.equipmentKind||d.category==='equipment')&&d.rarity===tier&&eligible(d)&&!relics.some(r=>r.id===d.id)&&!['container','captureDevice','legacyRelic','legacyMaterial'].includes(d.category));
  if(tier<5){
   const preferred=kind==='medical'?'medicine':kind==='armory'?'equipment':'material';
   const specific=choices.filter(d=>d.category===preferred);
   if(specific.length)choices=specific;
  }
  let d=window.FrontierCollections?FrontierCollections.select(choices):pick(choices);
  // Convert the former sample slots into materials to preserve collection odds.
  if(d?.category==='researchSample')d=null;
  if(!d)d=tier===7?catalog.red_research_core:pick(Object.values(catalog).filter(x=>!x.dropDisabled141&&x.category==='material'&&x.rarity===tier));
  const itemId=window.FrontierEquipmentV139?.roll(catalog,d.id,'container:'+db.rng.seed+':'+db.rng.counter)||d.id;return {itemId,qty:d.category==='material'&&tier<=3?2+rnd(3):1};
 }
 function create(q,kind='industrial',origin={source:'container.exploration'},id='container_c'+q){
  const instance=FrontierInventory.create(id,1,origin),counter=db.rng.counter,premium=id===grand,tier=quality(premium?6:q),region=origin.region||(R()?.result?null:R()?.expedition?.regionId),contents=[reward(tier,kind,region)];
  const count=2+rnd(3);
  for(let i=1;i<count;i++)contents.push(reward(Math.max(1,Math.min(4,tier-1)),kind==='medical'?'medical':'industrial',region));
  if(q===5)contents.push({itemId:'record_high',qty:1});
  if(premium){
   contents.push(reward(5,'industrial',region),reward(5,'industrial',region));
   const area=item=>{const size=FrontierCollections.size(catalog[item.itemId],R());return size.w*size.h};
   let occupied=contents.reduce((sum,item)=>sum+area(item),0);
   while(occupied<15){const item=reward(4,'industrial',region);contents.push(item);occupied+=area(item)}
  }
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
 function qualityLabel(q){return ({2:"綠階",3:"藍階",4:"銀階",5:"金階"})[Math.max(2,q)]||"未辨識"}
 function openNode(node){const r=R(),e=r.expedition,q=node.containerQuality??(e.mode==='scout'?1+rnd(2):node.hidden?4:e.layer>=4?3+rnd(3):e.layer>=2?2+rnd(3):1+rnd(3));const difficulty=['normal','hard','extreme','torment'].indexOf(e.difficulty),adjust=node.containerQuality==null&&e.mode!=='scout',floor=[2,2,3,3][Math.max(0,difficulty)],scaled=adjust?Math.min(5,Math.max(floor,q)+(random()<[0,.15,.3,.45][Math.max(0,difficulty)]?1:0)):q,box=drop(scaled,pick(['industrial','medical','armory','biological','intelligence','relic']),{source:node.id,run:r.number});r.event={type:'sealedContainer',box};save();render()}
 function carriedBoxes(r=R()){
  if(!r||r.result)return [];
  return [...(r.itemCargo||[]),...(r.grid?.groundItems||[]),...(r.secureGrid?.items||[]).map(item=>item.instance).filter(Boolean)].filter(box=>catalog[box.itemId]?.category==='container'&&box.sealed);
 }
 function carriedBox(){
  const panel=document.querySelector('#modal[open] [data-carried-box]');
  return panel&&carriedBoxes().find(box=>box.uid===panel.dataset.carriedBox)||null;
 }
 function currentBox(){return carriedBox()||(page==='containers'&&baseBox?db.inventory.items.find(x=>x.uid===baseBox):page==='containers'?null:R()?.event?.box)}
 function openCarried(uid){
  const box=carriedBoxes().find(item=>item.uid===uid);if(!box)return false;
  closeModal();modal('現場開箱','<div data-carried-box="'+esc(uid)+'">'+boxView(box)+'</div>','<button onclick="FrontierContainers.returnToBag()">返回背包</button>');
  window.FrontierLootGrid?.schedule();return true;
 }
 function chooseCarried(forceList=false){
  const boxes=carriedBoxes();if(!forceList&&boxes.length===1)return openCarried(boxes[0].uid);
  closeModal();modal('選擇容器','<div class="carried-box-list">'+(!boxes.length?'<p>背包內沒有其他可開啟的容器。</p>':'')+boxes.map(box=>{const d=catalog[box.itemId];return '<button class="rarity-'+d.rarity+'" data-item-id="'+d.id+'" onclick="FrontierContainers.openCarried(\''+esc(box.uid)+'\')">'+FrontierIcons.html(d.id)+'<span>'+esc(d.name)+' · '+d.gridSize.w+'×'+d.gridSize.h+'</span></button>'}).join('')+'</div>','<button onclick="FrontierContainers.returnToBag()">返回背包</button>');
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
 function reveal(all=false){const box=currentBox();if(!box)return;if(R()?.equipment139&&!R().result&&box.sealed.preview139&&!box.sealed.preview139.confirmed){toast('請先確認裝備容器預覽，再開始搜尋。');return}box.sealed.revealed=all?box.sealed.contents.length:Math.min(box.sealed.contents.length,box.sealed.revealed+1);save();render()}
 function finishBase(box){if(page!=='containers'||!baseBox||!box.sealed.claimed.every(Boolean))return;db.inventory.items=db.inventory.items.filter(x=>x.uid!==box.uid);const c=ensure();c.opened++;c.history.unshift({id:box.uid,quality:box.sealed.quality,at:Date.now(),contents:box.sealed.contents});c.history=c.history.slice(0,200);baseBox=null;c.activeBox=null}
 function take(index,refresh=true){const box=currentBox(),s=box?.sealed;if(!s||index>=s.revealed||index<0||s.claimed[index])return;if(R()?.equipment139&&!R().result&&s.preview139&&!s.preview139.confirmed)throw Error('請先確認開始搜尋');const content=s.contents[index],d=catalog[content.itemId];const carried=carriedBox()?.uid===box.uid;if(carried)window.FrontierExplorer?.search(box);s.claimed[index]=true;if(baseBox&&page==='containers'){if(['material','record','medicine'].includes(d.category))FrontierProgress.deposit(d.id,content.qty);else FrontierEquipment.deposit(FrontierInventory.create(d.id,content.qty,{source:'box:'+box.uid+':'+index}));finishBase(box)}else{if(['material','record','medicine'].includes(d.category))R().field.materials[d.id]=(R().field.materials[d.id]||0)+content.qty;else R().itemCargo.push(FrontierInventory.create(d.id,content.qty,{source:'box:'+box.uid+':'+index}));if(carried&&s.claimed.every(Boolean))finishCarried(box);FrontierGrid.sync();if(!carried&&R().boxReturn&&s.claimed.every(Boolean))closeCarried(false)}if(!baseBox&&R()&&!R().result)window.FrontierEquipmentFieldUI139?.containerLoot(box);if(refresh){save();render()}if(carried&&s.claimed.every(Boolean))chooseCarried(true)}
 function takeAll(){const box=currentBox();if(!box)return;if(!box.sealed.contents.length&&page==='containers'){finishBase(box);save();render();return}const count=box.sealed.revealed;for(let i=0;i<count&&currentBox()?.uid===box.uid;i++)take(i,false);save();render()}
 function carry(){if(carriedBox())return returnToBag();if(R()?.boxReturn)return closeCarried(true);const box=currentBox();if(!box||baseBox&&page==='containers')return;if(!FrontierGrid.canTake(box.itemId,'equipment')){const {w,h}=catalog[box.itemId].gridSize;toast('密封箱需要 '+w+'×'+h+' 的完整空間。可先開箱或整理背包。');return}R().itemCargo.push(box);FrontierGrid.sync();completeNode()}
 function leave(){if(R()?.boxReturn){modal('放棄未取出的內容？','<p>已裝入背包的物資保留；未拿取的箱內物品留在此地。這不會推進路線。</p>','<button class="danger" onclick="closeModal();FrontierContainers.closeCarried(false)">放棄剩餘內容，返回路線</button><button onclick="closeModal()">繼續整理</button>');return}if(baseBox&&page==='containers'){baseBox=null;ensure().activeBox=null;save();render();return}modal('放棄未裝入的箱內物資？','<p>已裝入的內容保留；箱子與尚未拿取的物資留在此地。</p>','<button class="danger" onclick="closeModal();completeNode()">確認前進</button><button onclick="closeModal()">繼續整理</button>')}
 function boxView(box){if(window.FrontierLootGrid)return FrontierLootGrid.view(box);const s=box.sealed;return `<section class="panel"><div class="eyebrow">SEALED LOOT / FIXED AT ACQUISITION</div><h1>${catalog[box.itemId].name}</h1><p class="tiny muted">${box.uid} · 2×3 · 結果已固定。滑開封條或逐件揭曉；跳過動畫不會改變內容。</p><div class="box-packet rarity-${s.tier}" id="box-packet" role="button" tabindex="0" aria-label="向上滑動揭曉下一件"><b>▣</b><span>${s.revealed}/${s.contents.length} · 向上滑動拆封</span></div><div class="row"><button class="primary" onclick="FrontierContainers.reveal()">揭曉下一件</button><button onclick="FrontierContainers.reveal(true)">快速全部揭曉</button><button onclick="FrontierContainers.takeAll()">收取已揭曉</button></div><div class="loot-reveal-list">${s.contents.map((item,i)=>i>=s.revealed?'<div class="panel loot-unknown">？</div>':`<article class="panel rarity-${catalog[item.itemId].rarity}"><span class="tag">${FrontierInventory.qualityNames[catalog[item.itemId].rarity]}</span><h3>${catalog[item.itemId].name} ×${item.qty}</h3><p class="tiny muted">${catalog[item.itemId].description}</p><button ${s.claimed[i]?'disabled':''} onclick="FrontierContainers.take(${i})">${s.claimed[i]?'已收取':'裝入物資'}</button><button onclick="FrontierInventory.describe('${item.itemId}')">詳情</button></article>`).join('')}</div><div class="row">${baseBox?'<button onclick="FrontierContainers.leave()">收起箱子</button>':'<button onclick="FrontierContainers.carry()">帶走密封箱／剩餘內容</button><button onclick="FrontierContainers.leave()">放棄剩餘物資並前進</button>'}</div></section>`}
 function baseView(){const boxes=FrontierInventory.ensure().items.filter(x=>catalog[x.itemId]?.category==='container'),cores=db.inventory.items.filter(x=>x.itemId==='red_research_core');return `<section class="panel"><h3>封存戰利品</h3><p class="tiny muted">基地可不限數量保存密封箱，內容在取得時已固定。紅階所有來源每週隨機最多3件；總出率將納入全局模擬。</p>${boxes.map(box=>`<div class="trade-row"><span>${catalog[box.itemId].name} · ${box.uid}</span><button onclick="FrontierContainers.openBase('${box.uid}')">拆封</button></div>`).join('')||'<p class="tiny muted">尚無密封箱。</p>'}${cores.map(item=>`<div class="trade-row"><span>戰略研究封存核心</span><button onclick="FrontierContainers.studyCore('${item.uid}')">提交紀念研究</button></div>`).join('')}</section>`}
 function studyCore(uid){const item=db.inventory.items.find(x=>x.uid===uid&&x.itemId==='red_research_core');if(!item)return;db.research??={badges:[]};db.research.badges??=[];if(db.research.badges.includes('strategic_core')){toast('此研究已完成，可保留核心作紀念。');return}db.inventory.items=db.inventory.items.filter(x=>x.uid!==uid);db.research.badges.push('strategic_core');save();render()}
 const oldEvent=eventView;eventView=function(){if(R()?.event?.type==='sealedContainer'){$('#app').innerHTML=runHeader()+boxView(R().event.box)+bagHtml();return}oldEvent()};
 const oldRender=render;render=function(){if(page==='containers'){nav();const box=currentBox();$('#app').innerHTML=box?boxView(box):baseView()}else oldRender();const box=carriedBox();if(box)document.querySelector('#modal [data-carried-box]').innerHTML=boxView(box)};
 const oldCollection=collection;collection=function(){oldCollection();$('#app').innerHTML=baseView()+$('#app').innerHTML};
 const oldCheck=checkBattle;checkBattle=function(){const r=R(),b=r?.battle;if(r?.expedition&&b&&r.hp>0&&b.enemies.every(e=>e.hp<=0)&&!b.containerDropped){b.containerDropped=true;if(random()<(b.type==='boss'?.9:b.type==='elite'?.45:.2)){const q=r.expedition.mode==='scout'?1:b.type==='boss'?4+rnd(2):b.type==='elite'?3:1+rnd(3);r.itemCargo.push(drop(q,'armory',{source:'battle:'+r.number+':'+r.depth}))}}return oldCheck()};
 const oldValid=validSave;validSave=function(v){let copy=v;if(v.run?.event?.type==='sealedContainer')copy={...v,run:{...v.run,event:null}};if(!oldValid(copy))return false;const back=v.run?.boxReturn;if(back&&(back.version!==1||typeof back.uid!=='string'||v.run.event?.type!=='sealedContainer'||v.run.event.box?.uid!==back.uid||v.run.battle||v.run.reward||v.run.expedition?.current))return false;const boxes=[...(v.inventory?.items||[]),...(v.run?.itemCargo||[]),...(v.run?.grid?.groundItems||[]),...(v.run?.event?.box?[v.run.event.box]:[]),...(v.run?.secureGrid?.items||[]).filter(x=>x.kind==='equipment').map(x=>x.instance)].filter(x=>catalog[x.itemId]?.category==='container');return boxes.every(box=>{const s=box.sealed;return FrontierInventory.valid(box)&&s?.version===1&&(s.searchedInField===undefined||typeof s.searchedInField==='boolean')&&qualities[s.quality]&&Number.isInteger(s.tier)&&s.tier>=2&&s.tier<=7&&Array.isArray(s.contents)&&s.contents.length>=(s.equipmentRetired139===2?0:catalog[box.itemId].balance?.surveyEquipment?1:2)&&s.contents.length<=(box.itemId===grand?16:6)&&(!catalog[box.itemId].balance?.surveyEquipment||((s.contents.length===1||s.equipmentRetired139===2&&s.contents.length===0)&&s.tier===catalog[box.itemId].rarity&&s.contents.every(i=>catalog[i.itemId]?.category==='equipment'&&catalog[i.itemId].rarity===s.tier)))&&s.contents.every(i=>catalog[i.itemId]&&Number.isInteger(i.qty)&&i.qty>=1&&i.qty<=catalog[i.itemId].stack)&&Number.isInteger(s.revealed)&&s.revealed>=0&&s.revealed<=s.contents.length&&Array.isArray(s.claimed)&&s.claimed.length===s.contents.length&&s.claimed.every(x=>typeof x==='boolean')})};
 let touch=null;document.addEventListener('pointerdown',e=>{if(e.target.closest?.('#box-packet'))touch={id:e.pointerId,y:e.clientY}});document.addEventListener('pointerup',e=>{if(!touch||touch.id!==e.pointerId)return;const delta=touch.y-e.clientY;touch=null;if(delta>45)FrontierRuntime.perform('box-swipe',()=>reveal())});document.addEventListener('pointercancel',()=>touch=null);
 ensure();FrontierInventory.validateCatalog();
 return{qualities,ensure,day,week,quality,qualityLabel,reward,create,drop,grand,chooseCarried,carriedBoxes,carriedBox,returnToBag,openNode,openBase,openCarried,closeCarried,currentBox,reveal,take,takeAll,carry,leave,boxView,baseView,studyCore};
})();
