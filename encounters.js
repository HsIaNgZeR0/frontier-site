'use strict';
window.FrontierEncounters=(()=>{
 const catalog=FrontierInventory.definitions;
 Object.assign(FrontierAdventure.events,{gift_choice:{id:'gift_choice',title:'得償所願',choice:'三份封存物資，只能帶走一份。'},gift_exchange:{id:'gift_exchange',title:'失與得',choice:'交出一件已持有的收藏品或詞條，隨機交換同類未持有品項。'}});
 function pool(tier){const region=R()?.expedition.regionId;return Object.values(catalog).filter(d=>!d.retired&&d.rarity===tier&&!relics.some(r=>r.id===d.id)&&['material','medicine','equipment','collection','record'].includes(d.category)&&(!d.collection_id||d.region===region))}
 function reward(tier){let rows=pool(tier);if(!rows.length)rows=pool(Math.max(1,tier-1));let d=pick(rows);if(window.FrontierTrail?.seenCollection(d.id)&&random()<.96){const mats=Object.values(catalog).filter(x=>!x.retired&&x.category==='material'&&x.rarity===Math.min(6,tier));if(mats.length)d=pick(mats)}return{itemId:d.id,qty:1}}
 const oldStart=startRun;startRun=function(){
  const before=R();oldStart();
  const r=R(),e=r?.expedition;if(r===before||!r?.tools||!e)return;
  for(const [index,nodes] of e.layers.entries()){
   const eventId=index%2?'gift_exchange':'gift_choice';
   const candidates=nodes.rows.flat().filter(n=>n.type==='event'&&!n.storyEvent&&!n.earlySpecial&&!n.requiredCombat);
   if(candidates.length)pick(candidates).storyEvent=eventId;
  }
  save();render();
 };
 const oldEnter=FrontierExpedition.enterNode;FrontierExpedition.enterNode=function(id){oldEnter(id);const e=R()?.event;if(e?.type!=='frontierEvent')return;if(e.id==='gift_choice'&&!e.gifts)e.gifts=giftOffers();if(e.id==='gift_exchange')prepareExchange(e);save();render()};
 const giftOffers=()=>Array.from({length:3},()=>reward(2+rnd(3)));
 function openGift(){R().event={type:'frontierEvent',id:'gift_choice',claimed:false,gifts:giftOffers()};save();render();}
 function prepareExchange(e){e.exchangeSeed??=FrontierEquipmentV139.hash([db.rng.seed,R().number,R().expedition.current?.id||R().expedition.current,R().expedition.row,e.id].join(':'))}

 function add(item){const d=catalog[item.itemId],kind=['material','medicine','record','captureDevice'].includes(d.category)?'material':'equipment';if(!FrontierGrid.canTake(d.id,kind)){toast('請先整理出完整物資空間。');return false}if(kind==='material')R().field.materials[d.id]=(R().field.materials[d.id]||0)+item.qty;else R().itemCargo.push(FrontierInventory.create(d.id,item.qty,{source:'event.'+R().event.id,region:R().expedition.regionId,run:R().number}));FrontierGrid.sync();return true}
 function choose(index){const e=R()?.event;if(e?.id!=='gift_choice'||e.claimed||!e.gifts?.[index])return;if(!add(e.gifts[index]))return;e.claimed=true;FrontierAdventure.note('gift_choice','得償所願：選擇 '+catalog[e.gifts[index].itemId].name);completeNode()}
 const exchangeEvents=['gift_exchange','ending_exchange_entry'];
 const definition=(kind,id)=>kind==='curio'?FrontierCurioData.forRun(R())[id]:catalog[id]?.category==='runModule'?catalog[id]:null;
 const icon=(kind,id)=>kind==='curio'?FrontierCurios.icon(id):FrontierIcons.html(id);
 function poolFor(r,kind){
  if(kind==='curio'){
   const excluded=new Set((r.curios?.owned||[]).map(x=>x.id).concat(r.exchangeCuriosSeen||[]));
   return Object.keys(FrontierCurioData.forRun(R())).filter(id=>(!window.FrontierCurioOriginal137||FrontierCurioOriginal137.eligible(R(),id))&&FrontierCurioEngine.implemented.has(id)&&!excluded.has(id)).sort();
  }
  const excluded=new Set((r.equipment139?.modules||[]).map(x=>x.id));
  return Object.values(catalog).filter(d=>d.category==='runModule'&&!excluded.has(d.id)).map(d=>d.id).sort();
 }
 function eligible(kind){
  const r=R();if(!r||!poolFor(r,kind).length)return [];
  const items=kind==='curio'?r.curios?.owned:r.equipment139?.modules;
  return (items||[]).map(x=>({key:kind==='curio'?x.id:x.uid,id:x.id,installed:!!x.installedOn}));
 }
 function itemView(kind,id){
  const item=definition(kind,id);
  const attr=kind==='curio'?'data-curio':'data-item-id';
  return '<span '+attr+'="'+id+'">'+icon(kind,id)+'<b>'+item.name+'</b></span>';
 }
 function exchange(kind,key){
  const r=R(),e=r?.event;
  if(!exchangeEvents.includes(e?.id)||e.claimed||r.result||r.battle||!['curio','module'].includes(kind))return false;
  const original=eligible(kind).find(item=>item.key===key);
  if(!original)return false;
  prepareExchange(e);
  const pool=poolFor(r,kind),id=pool[FrontierEquipmentV139.hash(e.exchangeSeed+':'+kind)%pool.length];
  if(kind==='curio'){
   const previous=r.curios.owned;
   r.curios.owned=previous.filter(x=>x.id!==original.id);
   if(!FrontierCurioEngine.gain(r.curios,id)){r.curios.owned=previous;return false}
   r.exchangeCuriosSeen=[...new Set([...(r.exchangeCuriosSeen||[]),original.id,id])];
   db.curioArchive??={version:1,ids:[]};
   if(!db.curioArchive.ids.includes(id))db.curioArchive.ids.push(id);
   FrontierCurios.emit('acquire',{id});
  }else{
   const stock=r.equipment139;
   stock.modules=stock.modules.filter(x=>x.uid!==key);
   stock.modules.push({uid:'module139:'+r.number+':'+stock.next++,id,installedOn:null});
  }
  e.exchangeResult={kind,id};e.claimed=true;
  FrontierAdventure.note('gift_exchange','失與得：'+definition(kind,original.id).name+' → '+definition(kind,id).name);
  closeModal();save();render();return true;
 }
 function finish(){const e=R()?.event;if(!exchangeEvents.includes(e?.id)||!e.claimed||!e.exchangeResult)return;closeModal();completeNode()}
 function showResult(){
  const e=R()?.event;if(!exchangeEvents.includes(e?.id)||!e.exchangeResult)return;
  const {kind,id}=e.exchangeResult;if(!definition(kind,id))return;
  // 結果已由成功保存後的中央取得提示顯示，繼續留在事件畫面。
  closeModal();
 }
 function openPicker(){
  const e=R()?.event;
  if(!exchangeEvents.includes(e?.id))return;
  if(e.exchangeResult)return showResult();
  if(e.claimed)return;
  modal('失與得 · 選擇交換品','<p>交出一件，隨機取得同類未持有的品項。長按可查看效果。</p><div class="exchange-options"></div><p id="exchange-selected" aria-live="polite"></p>','<button id="exchange-submit" class="primary" disabled>確認交換</button><button onclick="closeModal()">取消</button>');
  const panel=document.querySelector('.exchange-options'),status=document.querySelector('#exchange-selected'),submit=document.querySelector('#exchange-submit');
  let selected=null;
  for(const [kind,title] of [['curio','戰術收藏品'],['module','詞條／增幅模組']]){
   const group=document.createElement('section');
   group.innerHTML='<h3>'+title+'</h3><div class="exchange-item-grid"></div>';
   const grid=group.lastElementChild,items=eligible(kind);
   if(!items.length)grid.textContent='目前沒有可交換的品項。';
   for(const item of items){
    const button=document.createElement('button');
    button.type='button';button.setAttribute('aria-pressed','false');
    button.setAttribute(kind==='curio'?'data-curio':'data-item-id',item.id);
    button.innerHTML=itemView(kind,item.id)+(item.installed?'<small>已安裝</small>':'');
    button.addEventListener('click',()=>{
     selected?.button.setAttribute('aria-pressed','false');
     selected={button,kind,key:item.key};button.setAttribute('aria-pressed','true');
     status.textContent='已選：'+definition(kind,item.id).name+(item.installed?'（交換後將從裝備卸下）':'');
     submit.disabled=false;
    });
    grid.append(button);
   }
   panel.append(group);
  }
  submit.addEventListener('click',async()=>{
   if(!selected||submit.disabled)return;
   submit.disabled=true;
   const {kind,key}=selected;
   if(await FrontierRuntime.perform('ending-exchange-submit',()=>exchange(kind,key)))closeModal();
   else submit.disabled=false;
  });
 }
 const oldEvent=eventView;eventView=function(){const e=R()?.event;if(e?.type!=='frontierEvent'||!['gift_choice','gift_exchange'].includes(e.id))return oldEvent();if(e.id==='gift_choice'&&!e.gifts)return;$('#app').innerHTML=runHeader()+'<section class="panel"><h1>'+FrontierAdventure.events[e.id].title+'</h1>'+(e.id==='gift_choice'?'<p>只能領取一份；結果已固定，重整不重抽。</p><div class="cards">'+e.gifts.map((i,index)=>'<article class="panel">'+(window.FrontierIcons?.html(i.itemId)||'')+'<h3>'+catalog[i.itemId].name+'</h3><p>'+catalog[i.itemId].description+'</p><button onclick="FrontierEncounters.choose('+index+')">帶走這一份</button></article>').join('')+'</div>':(e.exchangeResult?'<p>交換已完成。</p><button class="primary" onclick="FrontierEncounters.finish()">繼續前進</button>':'<p>交換一件收藏品或詞條，獲得同類未持有的品項。</p><button class="primary" onclick="FrontierEncounters.openPicker()">選擇交換品</button>'))+(e.claimed?'':'<button onclick="FrontierAdventure.select(false)">不交換，繼續前進</button>')+'</section>'+bagHtml()};
 const oldValid=validSave;validSave=function(v){if(!oldValid(v))return false;const e=v.run?.event;if(e?.type!=='frontierEvent')return true;const item=i=>i&&catalog[i.itemId]&&i.qty===1;return(e.id!=='gift_choice'||Array.isArray(e.gifts)&&e.gifts.length===3&&e.gifts.every(item))&&(!exchangeEvents.includes(e.id)||(!e.exchangeResult||e.claimed&&['curio','module'].includes(e.exchangeResult.kind)&&!!definition(e.exchangeResult.kind,e.exchangeResult.id)))};
 return{openGift,pool,reward,add,choose,eligible,exchange,openPicker,showResult,finish,prepareExchange};
})();
