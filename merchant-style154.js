'use strict';
// Layout reference: actual IS merchant screenshot recorded in reports/variety154.
// Uses the original shop background; card layout is recreated in CSS for portrait phones.
window.FrontierMerchantStyle154=(()=>{
 function mount(){
  if(page!=='run'||R()?.event?.type!=='fieldMerchant')return;
  const shop=document.querySelector('.field-store');if(!shop)return;
  shop.classList.add('merchant154');
  for(const card of shop.querySelectorAll('.store-card:not([data-style154])')){
   const b=card.querySelector(':scope>button'),small=card.querySelector(':scope>small');if(!b||!small)continue;
   const match=small.textContent.match(/([\d,]+)\s*源石碇/);if(!match){card.dataset.style154='other';continue;}
   const price=match[1],label=b.textContent.trim(),sold=/已購|已售|已持有|停售/.test(label);
   card.dataset.style154='';card.classList.toggle('sold154',sold);card.classList.toggle('unaffordable154',b.disabled&&!sold);
   const quantity=small.textContent.match(/×\s*(\d+)/)?.[1]||'1';
   small.textContent='×'+quantity;small.classList.add('quantity154');
   b.setAttribute('aria-label',card.querySelector(':scope>b')?.textContent+'：'+(sold?label:price+'源石碇，購買'));
   b.innerHTML='<span class="price-label154">'+(sold?label:'價格')+'</span><span class="price-value154">'+FrontierCurrencyIcons.html('ingot')+'<strong>'+price+'</strong></span>';
   const row=R().event.rows?.find(x=>x.id===card.dataset.fieldProduct),base=row?.basePrice143??row?.price;
   if(!sold&&base>Number(price.replaceAll(',','')))b.querySelector('.price-value154').insertAdjacentHTML('afterbegin','<del>'+base+'</del>');
   if(sold){const tag=document.createElement('span');tag.className='sold-tag154';tag.textContent=label;card.append(tag)}
  }
 }
 const prior=render;render=function(...a){const out=prior.apply(this,a);mount();return out};
 let scheduled=false;const observer=new MutationObserver(()=>{if(page!=='run'||R()?.event?.type!=='fieldMerchant'||scheduled||!document.querySelector('.field-store:not(.merchant154),.merchant154 .store-card:not([data-style154])'))return;scheduled=true;queueMicrotask(()=>{scheduled=false;mount()})});observer.observe(document.getElementById('app'),{childList:true,subtree:true});
 const style=document.createElement('style');style.textContent=`
 .field-store.merchant154{padding:10px;box-sizing:border-box;background:linear-gradient(#101916bb,#101916dd),url('assets/shop154/shop-bg.png') center/cover;border:0}
 .merchant154 .store-heading{margin-bottom:6px}.merchant154>.tiny,.merchant154>.merchant143-policy{font-size:11px;line-height:1.4;margin:5px 0 10px}
 .merchant154 .store-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
 .field-store.merchant154 .store-card{position:relative;display:grid;grid-template-rows:38px 86px 46px;gap:0!important;padding:0!important;border:0;border-radius:5px;background:linear-gradient(145deg,#050908f2 30%,#09392ed9 80%,#087663bb);overflow:hidden;min-width:0;box-shadow:0 2px 6px #0005}
 .field-store.merchant154 .store-card>b{grid-row:1;grid-column:1;margin:0;padding:6px 8px;font-size:12px;line-height:15px;min-height:0;color:#f2f0e6;background:linear-gradient(90deg,#263a2dda,transparent);overflow:hidden;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;z-index:1}
 .field-store.merchant154 .store-picture{grid-row:2;grid-column:1;height:86px!important;min-width:0;align-self:center;padding:3px;box-sizing:border-box}
 .field-store.merchant154 .store-picture :is(.item-icon,.curio-icon){height:76px!important;width:76px!important;max-height:76px!important;max-width:76px!important;background:transparent!important;border:0!important;box-shadow:none!important}
 .field-store.merchant154 .store-picture img{height:76px!important;width:76px!important;max-height:76px!important;max-width:76px!important;object-fit:contain}
 .field-store.merchant154 .store-card>.quantity154{position:absolute;left:8px;bottom:10px;z-index:2;color:#e6eee9;font-size:11px;pointer-events:none}
 .field-store.merchant154 .store-card>button{grid-row:3;grid-column:1;display:flex;align-items:center;justify-content:flex-end;gap:5px;min-height:46px;height:46px;margin:0;padding:2px 7px 3px 28px!important;background:linear-gradient(90deg,transparent,#096b52a6);border:0;border-radius:0;color:#f4f8f5;opacity:1}
 .price-label154{font-size:10px;align-self:flex-start;margin-top:2px}.price-value154{display:flex;align-items:center;gap:2px;white-space:nowrap}.price-value154 strong{font-size:25px;font-weight:500;line-height:1}.price-value154 .currency-icon{width:23px!important;height:23px!important;vertical-align:middle}.price-value154 del{font-size:12px;color:#c6cfca}
 .field-store.merchant154 .store-card.unaffordable154>button{background:linear-gradient(90deg,transparent,#5723239e);color:#a6aaa7}.unaffordable154 .price-value154{opacity:.75}
 .field-store.merchant154 .store-card.sold154{background:#101614}.sold154 .store-picture{opacity:.2;filter:grayscale(1)}.sold154>button{opacity:.45!important}.sold-tag154{position:absolute;left:0;right:0;top:74px;text-align:center;background:#29332be8;color:#c2c9c4;font-size:13px;line-height:28px;transform:rotate(-9deg);pointer-events:none}
 .merchant154 .store-leave{background:#333b38;border:0;border-radius:0;min-height:44px}.merchant154 .store-card:active:not(.sold154){filter:brightness(1.15)}
 @media(min-width:420px){.merchant154 .store-grid{gap:12px}.field-store.merchant154 .store-card{grid-template-rows:38px 98px 46px}.field-store.merchant154 .store-picture{height:98px!important}.field-store.merchant154 .store-picture :is(.item-icon,.curio-icon),.field-store.merchant154 .store-picture img{height:86px!important;width:86px!important;max-height:86px!important;max-width:86px!important}}
 `;document.head.append(style);return{mount};
})();
