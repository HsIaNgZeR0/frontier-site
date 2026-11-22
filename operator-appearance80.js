
'use strict';
window.FrontierAppearance80=(()=>{
 const entries=FrontierAppearanceData80,outfits=window.FrontierOutfits86||[];
 const byId=new Map(outfits.map(outfit=>[outfit.id,outfit]));
 const byForm=new Map();
 const paths=new Map(),pending=new Set();let queued=false;
 const price=2;
 let shopTab='certificate',shopOperator='';
 const formFor=(id,form)=>form||(id==='amiya'?(db.amiya?.form||'caster'):'standard');
 const key=(id,form)=>id+':'+formFor(id,form);
 const entry=(id,form)=>entries[key(id,form)];
 const owned=id=>Object.hasOwn(db.operatorAppearance80?.owned||{},id)&&db.operatorAppearance80.owned[id]===true;
 const unlocked=id=>!!db.personnel?.units[id]&&(db.progress?.operators?.[id]?.elite||0)>=2;
 const label=id=>FrontierCapture.units[id]?.name||id;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 for(const outfit of outfits){
  const artKey=key(outfit.operator,outfit.form);
  if(!byForm.has(artKey))byForm.set(artKey,[]);
  byForm.get(artKey).push(outfit);
  for(const kind of ['portrait','full'])paths.set(outfit[kind],{id:outfit.operator,form:outfit.form,kind});
 }
 function choice(id,form){
  const value=db.operatorAppearance80?.choices?.[key(id,form)];
  const outfit=byId.get(value);
  if(outfit?.operator===id&&outfit.form===formFor(id,form)&&owned(value))return value;
  return value==='e2'&&unlocked(id)&&entry(id,form)?.e2Portrait?'e2':'base';
 }
 function src(id,kind='portrait',form){
  const r=entry(id,form);if(!r)return null;
  const selected=choice(id,form),outfit=byId.get(selected);
  if(outfit)return outfit[kind==='full'?'full':'portrait'];
  const art=r.singleArt?'e2':selected,type=kind==='full'?'Full':'Portrait';
  return r[art+type]||r['base'+type]||null;
 }
 for(const r of Object.values(entries)){
  for(const variant of ['base','e2'])for(const kind of ['Portrait','Full']){
   const file=r[variant+kind];if(file)paths.set(file,{id:r.id,form:r.form,kind:kind==='Full'?'full':'portrait'});
  }
  if(r.form==='standard'||r.form==='caster'){
   const unit=FrontierCapture.units[r.id];
   for(const alias of [r.id,unit?.image,r.official].filter(Boolean)){
    paths.set('assets/'+alias+'.png',{id:r.id,kind:'portrait'});
    paths.set('assets/operators/'+alias+'.png',{id:r.id,kind:'portrait'});
    paths.set('assets/operators/'+alias+'-full.png',{id:r.id,kind:'full'});
    paths.set('assets/'+alias+'-art.png',{id:r.id,kind:'full'});
   }
  }
 }
 paths.set('assets/amiya-full.webp',{id:'amiya',kind:'full'});
 function image(img){
  if(img.hasAttribute('data-appearance80-preview'))return;
  const raw=img.getAttribute('src');if(!raw)return;
  let file;
  try{const u=new URL(raw,location.href);if(u.origin!==location.origin)return;file=decodeURIComponent(u.pathname).replace(/^\//,'')}catch{return}
  const r=paths.get(file);if(!r)return;
  const next=src(r.id,r.kind,r.form);if(next&&file!==next)img.src=next;
 }
 function sync(root=document){if(root.matches?.('img'))image(root);root.querySelectorAll?.('img[src]').forEach(image)}
 const observer=new MutationObserver(records=>{
  for(const r of records){
   if(r.type==='attributes')pending.add(r.target);
   else for(const n of r.addedNodes){if(n.nodeType!==1)continue;if(n.matches('img'))pending.add(n);n.querySelectorAll('img[src]').forEach(img=>pending.add(img))}
  }
  if(!pending.size||queued)return;
  queued=true;queueMicrotask(()=>{queued=false;for(const img of pending)if(img.isConnected)image(img);pending.clear()});
 });
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 async function select(id,form,value){
  const r=entry(id,form),outfit=byId.get(value);
  const legal=value==='base'||value==='e2'&&unlocked(id)&&!!r?.e2Portrait&&!r.singleArt||
   outfit?.operator===id&&outfit.form===formFor(id,form)&&owned(value);
  if(!r||!db.personnel?.units[id]||!legal||FrontierRuntime.busy)return;
  const ok=await FrontierRuntime.perform('operator-appearance80',()=>{
   db.operatorAppearance80??={version:1,choices:{}};
   db.operatorAppearance80.choices[key(id,form)]=value;save();return true;
  });
  if(ok){
   sync();
   for(const b of document.querySelectorAll('[data-appearance80]'))b.setAttribute('aria-pressed',String(b.dataset.appearance80===choice(id,form)));
  }
 }
 function picker(id,form){
  const r=entry(id,form);if(!r||!db.personnel?.units[id])return null;
  const available=(byForm.get(key(id,form))||[]).filter(outfit=>owned(outfit.id));
  const hasElite=unlocked(id)&&!!r.e2Portrait&&!r.singleArt;
  if(!available.length&&!hasElite&&!(r.singleArt&&unlocked(id)))return null;
  const host=document.createElement('div');host.className='appearance80-picker';host.setAttribute('aria-label','幹員立繪');
  if(!available.length&&!hasElite){host.classList.add('appearance80-single');host.textContent='此升變型態使用專屬立繪。';return host}
  const options=[['base',r.singleArt?'專屬立繪':'初始立繪',r.singleArt?r.e2Portrait:r.basePortrait]];
  if(hasElite)options.push(['e2','精二立繪',r.e2Portrait]);
  for(const outfit of available)options.push([outfit.id,outfit.name,outfit.portrait]);
  for(const [value,title,portrait] of options){
   const button=document.createElement('button');button.type='button';button.dataset.appearance80=value;button.setAttribute('aria-pressed',String(choice(id,form)===value));
   const image=document.createElement('img');image.src=portrait;image.dataset.appearance80Preview='true';image.alt='';image.draggable=false;
   const text=document.createElement('span');text.textContent=title;button.append(image,text);button.onclick=()=>select(id,form,value);host.append(button);
  }
  return host;
 }
 function stock(){
  return outfits.filter(outfit=>!shopOperator||outfit.operator===shopOperator).map(outfit=>{
   const variant=outfit.form==='guard'?' · 近衛':outfit.form==='medic'?' · 醫療':'';
   return '<article class="outfit-card"><img data-appearance80-preview src="'+esc(outfit.full)+'" alt="" loading="lazy"><div><b>'+esc(outfit.name)+'</b><small>'+esc(label(outfit.operator)+variant)+'</small><button type="button" data-outfit-buy="'+esc(outfit.id)+'"></button></div></article>';
  }).join('');
 }
 function refreshShop(root=document){
  const wallet=root.querySelector('[data-outfit-balance]');if(wallet)wallet.textContent=db.wallet.originium;
  for(const button of root.querySelectorAll('[data-outfit-buy]')){
   const bought=owned(button.dataset.outfitBuy);
   button.disabled=bought||db.wallet.originium<price;
   button.textContent=bought?'已擁有':price+' 至純源石';
  }
 }
 function view(){
  const tabs='<div class="outfit-tabs" role="group" aria-label="採購分類"><button data-outfit-tab="certificate" aria-pressed="'+(shopTab==='certificate')+'">憑證商店</button><button data-outfit-tab="outfit" aria-pressed="'+(shopTab==='outfit')+'">時裝商店</button></div>';
  if(shopTab!=='outfit')return tabs+FrontierTrading.view();
  const ids=[...new Set(outfits.map(outfit=>outfit.operator))];
  return tabs+'<section class="outfit-shop"><div class="outfit-shop-head"><h2>時裝商店</h2><span>至純源石 <b data-outfit-balance>'+db.wallet.originium+'</b></span></div><label>幹員<select data-outfit-filter><option value="">全部幹員</option>'+
   ids.map(id=>'<option value="'+esc(id)+'"'+(shopOperator===id?' selected':'')+'>'+esc(label(id))+'</option>').join('')+'</select></label><div class="outfit-stock">'+stock()+'</div></section>';
 }
 async function buy(id){
  const outfit=byId.get(id);
  if(!outfit||FrontierRuntime.busy||owned(id)||db.wallet.originium<price)return false;
  const ok=await FrontierRuntime.perform('outfit-purchase',()=>{
   if(owned(id)||db.wallet.originium<price)return false;
   db.operatorAppearance80??={version:1,choices:{}};
   db.operatorAppearance80.owned??={};
   db.wallet.originium-=price;db.operatorAppearance80.owned[id]=true;save();return true;
  });
  if(ok){refreshShop();toast('已取得「'+outfit.name+'」，可在幹員立繪中套用。')}
  return ok;
 }
 document.addEventListener('click',event=>{
  const tab=event.target.closest?.('[data-outfit-tab]');
  if(tab){
   shopTab=tab.dataset.outfitTab;
   const body=tab.closest('.screen-workspace-body');
   if(body){body.innerHTML=view();refreshShop(body);body.scrollTop=0}
   return;
  }
  const button=event.target.closest?.('[data-outfit-buy]');
  if(button&&!button.disabled)void buy(button.dataset.outfitBuy);
 });
 document.addEventListener('change',event=>{
  const filter=event.target.closest?.('[data-outfit-filter]');
  if(!filter)return;
  shopOperator=filter.value;
  const shop=filter.closest('.outfit-shop');shop.querySelector('.outfit-stock').innerHTML=stock();refreshShop(shop);
 });
 sync();return{src,choice,unlocked,picker,select,sync,entries,view,refreshShop,buy,outfits};
})();
