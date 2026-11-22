'use strict';
window.FrontierRender32=(()=>{
 // Growth/roster preview owns the current roster. Do not construct obsolete
 // training/equipment panels just to hide and discard them in the screen bank.
 const legacyRoster=window.rosterView;
 window.rosterView=function(){if(window.FrontierGrowth&&window.FrontierRosterPreviewV20?.enabled){document.getElementById('app').replaceChildren();return}return legacyRoster()};
 const legacyShop=window.shopView;
 window.shopView=function(){if(window.FrontierVisualUI&&matchMedia('(max-width:720px)').matches){document.getElementById('app').replaceChildren();return}return legacyShop()};
 let batching=false,pending=false,painting=false;const original=render,metrics={requests:0,paints:0,paintMs:0};
 const motions=new WeakMap();
 let scene=null,motion=null;
 let rewardSignal=null;
 const reducedQuery='(prefers-reduced-motion: reduce)';
 const reduced=matchMedia(reducedQuery);
 const pageFrames=[
  {opacity:.52,transform:'translateY(14px)',offset:0},
  {opacity:.92,transform:'translateY(3px)',offset:.68},
  {opacity:1,transform:'none',offset:1}
 ];
 const panelFrames=[
  {opacity:.46,transform:'translateY(12px) scale(.985)',offset:0},
  {opacity:.94,transform:'translateY(2px) scale(.998)',offset:.7},
  {opacity:1,transform:'none',offset:1}
 ];
 function transition(){
  const host=document.querySelector('.screen-workspace-body')||document.getElementById('app');if(!host)return;
  const run=page==='run'?R():null;
  const tabs=run?.battle?'':[...host.querySelectorAll('nav button.active,nav button.chosen,nav [aria-selected="true"],nav [aria-current="page"],nav [aria-pressed="true"],[role="tablist"] [aria-selected="true"],.survey-periods [aria-pressed="true"],.tabs button.active,.tabs button.chosen')].map(el=>el.getAttribute('onclick')||el.dataset.storeTab||el.textContent.trim()).join('|');
  const next=[page,run?(run.result?'result':run.battle?'battle':run.reward?'reward':run.event?.type||'route'):'',tabs].join(':');
  const fromBattle=scene?.startsWith('run:battle:');
  const changed=scene!==null&&scene!==next;scene=next;
  if(!changed||!window.FrontierBootReady)return;
  motion?.cancel();motion=null;
  rewardSignal?.remove();rewardSignal=null;
  if(fromBattle&&run?.reward&&!run.result){
   motion=enter(host,'reward');
   if(!document.hidden)showRewardSignal();
   return;
  }
  // Paint the new content immediately. No outgoing snapshot, timer, input lock or layout animation.
  motion=enter(host,run?.battle?'fixed':'page');
 }
 function showRewardSignal(){
  const signal=document.createElement('div');
  signal.className='frontier-battle-clear';
  signal.setAttribute('aria-hidden','true');
  const title=document.createElement('strong');title.textContent='作戰完成';
  signal.append(title);
  document.body.append(signal);
  rewardSignal=signal;
  const clear=()=>{signal.remove();if(rewardSignal===signal)rewardSignal=null};
  if(reduced.matches||typeof signal.animate!=='function'){setTimeout(clear,920);return;}
  const animation=signal.animate([
   {opacity:0,transform:'translateY(8px) scale(.96)'},
   {opacity:1,transform:'translateY(0) scale(1)',offset:.15},
   {opacity:1,transform:'translateY(0) scale(1)',offset:.76},
   {opacity:0,transform:'translateY(-7px) scale(1)'}
  ],{duration:920,easing:'ease-out',fill:'backwards'});
  animation.onfinish=clear;
 }
 function enter(host,kind='panel'){
  if(!host||document.hidden||typeof host.animate!=='function')return null;
  motions.get(host)?.cancel();motions.delete(host);
  if(matchMedia(reducedQuery).matches)return null;
  const frames=kind==='reward'?[{opacity:.78},{opacity:1}]:kind==='fixed'?[{opacity:.72},{opacity:1}]:kind==='page'?pageFrames:panelFrames;
  const animation=host.animate(frames,{duration:180,easing:'cubic-bezier(.2,.65,.35,1)'});
  animation.id='frontier-enter78';motions.set(host,animation);return animation;
 }
 const previousModal=modal;modal=function(...args){const result=previousModal(...args);const host=document.querySelector('#modal .screen-simple-dialog')||document.getElementById('modal');const title=String(args[0]||''),economic=/購買|購入|兌換|交易|售出|回收|領取|已獲得|調校|強化|升級|配方/.test(title);if(economic){motions.get(host)?.cancel();motions.delete(host)}else if(window.FrontierBootReady)enter(host,/背包與保險箱|局內裝備詞條/.test(title)?'fixed':'panel');return result};
 document.addEventListener('click',e=>{if(e.target.closest?.('nav button,.tabs button,.survey-periods button,[role="tab"]'))queueMicrotask(transition)},true);
 window.FrontierMotion78={enter};
 reduced.addEventListener?.('change',()=>{if(reduced.matches){document.getAnimations().filter(a=>a.id==='frontier-enter78').forEach(a=>a.cancel());motion=null;rewardSignal?.remove();rewardSignal=null;}});
 function paint(){
  metrics.paints++;const t=performance.now();painting=true;
  // Keep an existing animated image when the same enemy still uses the same
  // asset. Rebuilding its surrounding stats must not restart its decoder.
  const battle=page==='run'?R()?.battle?.operatorBattleId:null,models=new Map();
  if(battle)for(const img of document.querySelectorAll('.enemy-card[data-enemy-id] .enemy-idle-model'))models.set(img.closest('[data-enemy-id]').dataset.enemyId+'|'+img.getAttribute('src'),img);
  try{
   const result=original();
   if(battle&&R()?.battle?.operatorBattleId===battle)for(const img of document.querySelectorAll('.enemy-card[data-enemy-id] .enemy-idle-model')){const prior=models.get(img.closest('[data-enemy-id]').dataset.enemyId+'|'+img.getAttribute('src'));if(prior&&prior!==img)img.replaceWith(prior)}
   transition();return result;
  }finally{metrics.paintMs+=performance.now()-t;painting=false}
 }
 render=function(){metrics.requests++;if(batching&&!painting){pending=true;return}return paint()};
 function begin(){if(batching)return false;batching=true;pending=false;return true}
 function end(batched,success){if(!batched)return;batching=false;const requested=pending;pending=false;if(success&&requested)render()}
 return{begin,end,info:()=>({...metrics})};
})();
