'use strict';
window.FrontierStoreV18=(()=>{
 const F=FrontierTrading,c=FrontierInventory.definitions,oldEnsure=F.ensure,oldDaily=F.daily,oldWeekly=F.weekly,esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const hash=s=>{let n=2166136261;for(const x of s)n=Math.imul(n^x.charCodeAt(0),16777619);return n>>>0};
 F.ensure=function(){const s=oldEnsure();s.boughtYellowDay??={};s.boughtYellowWeek27??={...s.boughtYellowDay};s.yellowTicketWeek27??=s.week;if(s.yellowTicketWeek27!==s.week){s.boughtYellowWeek27={};s.yellowTicketWeek27=s.week}return s};
 const toolOffer=(id,cost,limit=1)=>({id:'search174:'+id,item:'search174_'+id,qty:1,cost,limit});
 // 房卡／開鎖裝置／炸藥：依稀有度定價（3綠 4藍 5銀 6金）。
 // 綠票：開鎖裝置與炸藥 50／100／200／400；房卡 100／300／500／1000。
 const unit=s=>hash(s)/4294967296,L=()=>FrontierSearchLocks174,yellowLadder={4:2,5:3,6:8};
 const greenLadder={tool:{3:50,4:100,5:200,6:400},keycard:{3:100,4:300,5:500,6:1000}};
 const priced=(id,ladder,limit=1)=>toolOffer(id,ladder.tool?ladder[L().catalog[id].key?'keycard':'tool'][L().catalog[id].rarity]:L().shopPrice(id,ladder),limit);
 F.daily=function(){const s=F.ensure(),rows=oldDaily();
  rows.push(priced('T1',greenLadder,2),priced('T2',greenLadder),{...priced(unit(s.day+':support')<.3?'B1':'T1',greenLadder),id:'search174:daily-support'});
  // 每日一張房卡：綠卡＝藍物品機率、藍卡＝銀、銀卡＝金、金卡＝金的一半。
  const key=L().pickKeycard(unit(s.day+':key'),3);
  rows.push(priced(key,greenLadder));
  // 三分之一機率追加一件高階開鎖裝置或炸藥，與房卡獨立抽選，依銀／金物品權重。
  if(hash(s.day+':extra')%3===0){const w=L().shopTierWeight,pool=[['T3',w[5]],['B2',w[5]],['T4',w[6]]];let r=unit(s.day+':extra-tier')*pool.reduce((a,x)=>a+x[1],0);const extra=pool.find(([,x])=>(r-=x)<0)?.[0]||'T4';rows.push(priced(extra,greenLadder))}
rows.unshift({id:"first-aid149",item:"med_aid_t3",qty:1,cost:5,limit:10});if((hash(s.day)>>>1)%2===0)rows.unshift({id:'gacha-ticket',special:'ticket',qty:1,cost:50,limit:1});return rows};
 F.weekly=()=>{
  const seed=hash(F.ensure().week),rows=oldWeekly().filter(r=>r.id!=='ticket');
  const week=F.ensure().week;
  rows.push(priced(seed%2?'T3':'B2',yellowLadder));
  const first=L().pickKeycard(unit(week+':key'),5);rows.push(priced(first,yellowLadder));
  if(seed%4===0){const second=L().pickKeycard(unit(week+':key2'),5,[first]);if(second)rows.push(priced(second,yellowLadder))}
  if(seed%6===0)rows.push(priced('T4',yellowLadder));
  return rows;
 };F.yellowDaily=()=>[{id:'daily-ticket',special:'ticket',qty:1,cost:5,limit:2}];
 F.buy=function(type,id){if(!['daily','weekly','yellowDaily'].includes(type))return;const s=F.ensure(),weekly=type==='weekly',yellow=weekly||type==='yellowDaily',rows=weekly?F.weekly():yellow?F.yellowDaily():F.daily(),stock=weekly?s.boughtWeek:yellow?s.boughtYellowWeek27:s.boughtDay,row=rows.find(r=>r.id===id),currency=yellow?'yellow':'green';if(!row||(stock[id]||0)>=row.limit||db.wallet[currency]<row.cost||row.global&&(s.global[row.global]||0)>=1){toast('憑證不足或已達限購。');return}db.wallet[currency]-=row.cost;stock[id]=(stock[id]||0)+1;if(row.global)s.global[row.global]=(s.global[row.global]||0)+1;if(row.operator)FrontierRecruitment.result(row.operator,'voucher-target');else if(row.special==='ticket')FrontierRecruitment.ensure().tickets+=row.qty;else if(row.special==='permit')FrontierRecruitment.ensure().permits+=row.qty;else F.grant(row.item,row.qty,weekly?'shop.weekly':'shop.daily');save();render()};
 const title=row=>row.operator?FrontierCapture.units[row.operator].name+' · 招募回應':row.special==='permit'?'人事情報':row.special==='ticket'?'尋訪憑證':c[row.item]?.name||'商品';
 const picture=row=>row.operator?portrait(row.operator):row.special?'<img src="assets/item-legacy-ticket.png" alt="'+title(row)+'">':FrontierIcons.html(row.item);
 F.view=function(){const s=F.ensure(),groups=[['yellowDaily','黃票商店 · 每週尋訪',F.yellowDaily(),s.boughtYellowWeek27,'yellow'],['daily','綠票商店 · 每日更新',F.daily(),s.boughtDay,'green'],['weekly','黃票商店 · 每週商品',F.weekly(),s.boughtWeek,'yellow']];return '<section class="store-page"><div class="store-heading"><h2>憑證交易所</h2><div>'+FrontierCurrencyIcons.html('green')+' '+db.wallet.green+' '+FrontierCurrencyIcons.html('yellow')+' '+db.wallet.yellow+'</div></div><p class="tiny muted">每日台灣08:00更新。黃票尋訪憑證每週2張、每張5黃票；綠票隨機刷出時50綠票、限1張。每週商品週一08:00更新。</p>'+groups.map(([type,name,rows,stock,currency])=>'<section class="store-section"><h3>'+name+'</h3><div class="store-grid" data-shop-kind="'+type+'">'+rows.map(row=>{const bought=stock[row.id]||0,disabled=bought>=row.limit||db.wallet[currency]<row.cost||row.global&&(s.global[row.global]||0)>=1;return '<article class="store-card" data-store-product="'+row.id+'"><div class="store-picture">'+picture(row)+'</div><b>'+esc(title(row))+'</b><small>×'+row.qty+' · 已購 '+bought+'/'+row.limit+'</small><div class="store-price">'+FrontierCurrencyIcons.html(currency)+'<strong>'+row.cost+'</strong></div><button '+(disabled?'disabled':'')+' onclick="FrontierTrading.buy(\''+type+'\',\''+row.id+'\')">'+(bought>=row.limit?'已售完':'兌換')+'</button></article>'}).join('')+'</div></section>').join('')+'<button onclick="FrontierStoreV18.recycle()">回收物資與藍圖</button></section>'};
 F.fieldMerchant=function(node){const r=R(),layer=r.expedition?.layer||0,D=FrontierCurioData.entries,owned=r.curios?.owned||[],meds=shuffle(FrontierMedicine.ids.filter(id=>c[id].rarity<=Math.min(5,3+Math.floor(layer/2)))).slice(0,3),quality=Math.min(5,3+Math.floor(layer/2)),box=FrontierContainers.create(quality,'industrial',{source:node.id}),pool=shuffle(Object.keys(D).filter(id=>!owned.some(o=>o.id===id))),common=pool.filter(id=>D[id].rank==='normal'),high=pool.filter(id=>D[id].rank!=='normal'),ids=[...common.slice(0,2),...high.slice(0,1)];for(const id of [...pool,...Object.keys(D)])if(ids.length<3&&!ids.includes(id))ids.push(id);const families=shuffle(Object.keys(FrontierProgress.families)).slice(0,3),tiers=[2,Math.min(4,3+Math.floor(layer/3)),Math.min(5,3+Math.floor(layer/2))];r.event={type:'fieldMerchant',storeVersion:18,node:node.id,bought:{},rows:[...meds.map((item,i)=>({id:'medicine:'+i,type:'medicine',item,qty:1,price:10+c[item].rarity*2+i*2})),{id:'sealed',type:'container',instance:box,price:30+Math.floor(layer/2)*12},...ids.slice(0,3).map((curio,i)=>({id:'curio:'+i,type:'curio',curio,price:D[curio].rank==='core'?36:D[curio].rank==='rare'?26:16})),...families.map((family,i)=>({id:'material:'+i,type:'material',item:FrontierProgress.materialId(family,tiers[i]),qty:tiers[i]===2?4:tiers[i]===3?3:1,price:{2:8,3:14,4:22,5:38}[tiers[i]]}))]};save();render()};
 function regionalStockBlocked(row){
  const climate=FrontierEnvironment.current();
  return climate?.rulesVersion>=3&&climate.region==='lungmen'&&climate.value>=4&&row.type==='container';
 }
 function fieldRows(event){
  const rows=event.rows;
  if(rows.some(row=>row.type==='module')||!R()?.equipment139)return rows;
  // A merchant already open in an older save keeps its purchases and reuses one listed module.
  const moduleIndex=event.moduleMarket139?.findIndex(row=>!row.sold)??-1;
  const slot=rows.findLastIndex(row=>row.type==='material'&&!event.bought[row.id]);
  if(moduleIndex<0||slot<0)return rows;
  const item=event.moduleMarket139[moduleIndex];
  return rows.map((row,i)=>i===slot?{id:row.id,type:'module',item:item.id,qty:1,price:item.price,legacyModuleIndex:moduleIndex}:row);
 }
 F.fieldBuy=function(id){const r=R(),e=r?.event,row=e?.type==='fieldMerchant'?fieldRows(e).find(x=>x.id===id):null;if(e?.type!=='fieldMerchant'||!row||e.bought[id]||r.fieldPoints<row.price)return;if(regionalStockBlocked(row)){toast('PRTS｜通緝達 4 星，行商暫停售出容器。');return;}if(row.type==='curio'){if(!FrontierCurioEngine.gain(r.curios,row.curio))return;db.curioArchive??={version:1,ids:[]};if(!db.curioArchive.ids.includes(row.curio))db.curioArchive.ids.push(row.curio);FrontierCurios.emit('acquire',{id:row.curio})}else if(row.type==='module'){
  const stock=r.equipment139;
  if(!stock||c[row.item]?.category!=='runModule')return;
  if(row.legacyModuleIndex!=null){
   e.moduleMarket139[row.legacyModuleIndex].sold=true;
   e.rows[e.rows.findIndex(x=>x.id===id)]=row;
  }
  stock.modules.push({uid:'module139:'+r.number+':'+stock.next++,id:row.item,installedOn:null});
 }else if(['medicine','material'].includes(row.type))r.field.materials[row.item]=(r.field.materials[row.item]||0)+(row.qty||1);else if(row.type==='container'){if(row.instance.sealed.quality<3)return;if(!FrontierGrid.canTake(row.instance.itemId,'equipment')){toast('背包沒有足夠的完整空間。');return}r.itemCargo.push(row.instance)}else return;r.fieldPoints-=row.price;e.bought[id]=true;const s=F.ensure(),region=r.expedition.regionId;s.trust[region]=(s.trust[region]||0)+1;FrontierGrid.sync();FrontierCombat.sync();save();render()};
 function fieldView(){const r=R(),e=r.event;return runHeader()+'<section class="field-store"><div class="store-heading"><h2>詭異行商</h2><span>源石碇 '+r.fieldPoints+'</span></div><p class="tiny muted">商品進店時固定，容器最低藍階。物資仍需成功帶回。</p><div class="store-grid">'+fieldRows(e).filter(row=>row.type!=='upgrade'&&(row.type!=='container'||row.instance.sealed.quality>=3)).map(row=>{const item=row.item||row.instance?.itemId,name=row.type==='curio'?FrontierCurioData.entries[row.curio].name:c[item]?.name,owned=row.type==='curio'&&r.curios.owned.some(x=>x.id===row.curio);return '<article class="store-card" data-field-product="'+row.id+'"'+(row.type==='curio'?' data-curio="'+row.curio+'"':row.type==='module'?' data-module-product':'')+'><div class="store-picture">'+(row.type==='curio'?FrontierCurios.icon(row.curio):FrontierIcons.html(item))+'</div><b>'+esc(name)+'</b><small>×'+(row.qty||1)+' · '+row.price+'源石碇</small><button '+(e.bought[row.id]||owned||regionalStockBlocked(row)||r.fieldPoints<row.price?'disabled':'')+' onclick="FrontierTrading.fieldBuy(\''+row.id+'\')">'+(e.bought[row.id]?'已購入':owned?'已持有':regionalStockBlocked(row)?'盤查停售':'購買')+'</button></article>'}).join('')+'</div>'+(e.curioAlternative?'<section class="store-alternative">'+FrontierIcons.html(e.curioAlternative.item)+'<b>替代交易 · '+e.curioAlternative.qty+'份素材</b><button '+(e.curioAlternative.claimed||r.fieldPoints<8?'disabled':'')+' onclick="FrontierCurios.buyMarket(true)">8源石碇</button></section>':'')+'<button class="store-leave" onclick="completeNode()">離開商隊</button></section>'+bagHtml()}
 const oldEvent=eventView;eventView=function(){if(R()?.event?.type!=='fieldMerchant')return oldEvent();$('#app').innerHTML=fieldView()};
 let scheduled=false;const prior=render;render=function(){prior();const e=R()?.event;if(e?.type==='fieldMerchant'&&e.storeVersion!==18&&!scheduled&&window.FrontierBootReady){scheduled=true;setTimeout(async()=>{try{if(FrontierRuntime.busy)return;await FrontierRuntime.perform('upgrade-field-store-v18',()=>{const old=structuredClone(R().event);F.fieldMerchant({id:old.node});R().event.legacy18=old;save();render()})}finally{scheduled=false}},0)}};
 function recycle(){modal('物資回收與藍圖','<div class="store-recycle">'+Object.entries(db.progress.materials).filter(([id,n])=>n>0&&c[id]?.category==='material'&&[2,3,4].includes(c[id].rarity)&&!c[id].retired).map(([id,n])=>'<div>'+FrontierIcons.html(id)+'<span>'+esc(c[id].name)+' ×'+n+'</span><button onclick="FrontierStoreV18.sell(\'material\',\''+id+'\')">回收一組</button></div>').join('')+db.inventory.items.map(i=>'<div>'+FrontierIcons.html(i.itemId)+'<span>'+esc(c[i.itemId].name)+'</span>'+(c[i.itemId].category==='blueprint'?'<button onclick="FrontierStoreV18.sell(\'blueprint\',\''+i.uid+'\')">研究</button>':'')+'<button onclick="FrontierStoreV18.sell(\'physical\',\''+i.uid+'\')">出售</button></div>').join('')+'</div>','<button onclick="closeModal()">關閉</button>')}
 function sell(type,id){if(type==='material')F.sellMaterial(id);else if(type==='blueprint')F.useBlueprint(id);else F.sellPhysical(id);recycle()}
 const oldValid=validSave;validSave=s=>oldValid(s)&&(!s.trading?.boughtYellowDay||Object.values(s.trading.boughtYellowDay).every(n=>Number.isSafeInteger(n)&&n>=0&&n<=2));
 return{fieldView,recycle,sell};
})();
