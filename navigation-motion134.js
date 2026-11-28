'use strict';
// Reference: BV1sFGZzQEED, hub -> map at 38–40s. Short fade, stationary shell.
window.FrontierNavigation134=(()=>{
 const running=new Set(),metrics={routes:0,lastRenderMs:0,lastCaptureMs:0,heavySnapshotsSkipped:0,deferredTaps:0};let routing=false,entry=null,pending=null,frame=0,frameFallback155=0,dragOffset=0;
 const reduced=()=>window.FrontierMotion?.reduced()||matchMedia('(prefers-reduced-motion:reduce)').matches;
 const content=()=>document.querySelector('#app .yard-stage,#app .screen-workspace-body')||document.getElementById('app')?.firstElementChild;
 function clear(){cancelAnimationFrame(frame);clearTimeout(frameFallback155);frameFallback155=0;frame=0;pending=null;entry=null;for(const a of running)a.cancel();running.clear()}
 function play(node,frames,duration=180){const a=node.animate(frames,{duration,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});a.id='frontier-navigation134';running.add(a);a.finished.catch(()=>{}).finally(()=>running.delete(a));return a}
 const original=go;
 function route(next,fromTap=false){
  const from=page;entry=null;const previous=window.FrontierMotion?.routerActive;if(window.FrontierMotion)FrontierMotion.routerActive=true;routing=true;const t=performance.now();let out;
  try{out=original(next)}finally{routing=false;if(window.FrontierMotion)FrontierMotion.routerActive=previous;metrics.lastRenderMs=performance.now()-t}
  for(const a of running)a.cancel();running.clear();
  const target=content();if(page===from||!target||reduced()||document.hidden)return out;
  metrics.routes++;metrics.lastCaptureMs=0;const offset=dragOffset;dragOffset=0;const duration=180;
  entry={page:next,target,deadline:performance.now()+duration,animation:play(target,[{opacity:fromTap?0:.35,transform:'translate3d('+(offset?Math.sign(offset)*6:0)+'px,4px,0)'},{opacity:1,transform:'none'}],duration)};
  return out;
 }
 go=function(next){
  if(routing||next===page||document.querySelector('.visual-storage-sliding')){if(pending)clear();return original(next)}
  const e=window.event,button=e?.target?.closest?.('[onclick]'),code=button?.getAttribute('onclick')||'';
  const direct=e?.type==='click'&&/^go\(['"][\w-]+['"]\)\s*;?$/.test(code);
  if(direct&&!reduced()&&!document.hidden){
   if(pending){pending.next=next;return}
   clear();pending={next};metrics.deferredTaps++;const source=content();if(source)play(source,[{opacity:1},{opacity:.05}],100);
   const commit=()=>{cancelAnimationFrame(frame);clearTimeout(frameFallback155);frame=frameFallback155=0;const task=pending;pending=null;if(task)route(task.next,true)};frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(commit)});frameFallback155=setTimeout(commit,80);return;
  }
  clear();return route(next);
 };
 const draw=render;render=function(...args){
  const current=entry,carry=!routing&&current&&current.page===page&&performance.now()<current.deadline&&current.target.isConnected;
  const progress=carry?current.animation.effect.getComputedTiming().progress:null;
  const out=draw.apply(this,args);
  if(progress!=null&&entry===current){const target=content(),remaining=current.deadline-performance.now();if(target&&target!==current.target&&remaining>0){current.animation.cancel();current.target=target;current.animation=play(target,[{opacity:.35+.65*progress,transform:'translate3d(0,'+(4*(1-progress))+'px,0)'},{opacity:1,transform:'none'}],remaining)}}return out;
 };
 const style=document.createElement('style');style.textContent='#app{background-color:#10191e}.growth-portraits>.growth-portrait{content-visibility:auto;contain-intrinsic-size:auto 200px}.equipment142-grid>.equipment60-instance{content-visibility:auto;contain-intrinsic-size:auto 132px}';document.head.append(style);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});addEventListener('pagehide',clear);
 return{clear,info:()=>({...metrics,animations:running.size,overlay:false,pending:pending?.next||null}),setDragOffset:value=>{dragOffset=Number(value)||0}};
})();
