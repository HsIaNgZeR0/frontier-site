'use strict';
// One navigation transition, after the complete render chain; no input locks or delayed navigation.
window.FrontierNavigation134=(()=>{
 const app=()=>document.getElementById('app'),main=['home','yard','roster','base','warehouse'],storage=['warehouse','collection','containers','collections'];
 const running=new Set(),metrics={routes:0,lastRenderMs:0,lastCaptureMs:0,heavySnapshotsSkipped:0};let layer=null,routing=false,dragOffset=0,entry=null;
 const reduced=()=>window.FrontierMotion?.reduced()||matchMedia('(prefers-reduced-motion:reduce)').matches;
 const isStorage=p=>storage.includes(p);
 function content(from,to){const root=app();if(isStorage(from)&&isStorage(to))return root?.querySelector('.visual-storage-content');return root?.querySelector('.yard-stage,.screen-workspace-body')||root?.firstElementChild}
 function clear(){entry=null;for(const a of running)a.cancel();running.clear();layer?.remove();layer=null}
 function copyStage(source){
  const copy=source.cloneNode(true),src=[...source.querySelectorAll('canvas')],dst=[...copy.querySelectorAll('canvas')];
  for(let k=0;k<src.length;k++){const old=src[k],next=dst[k];next.width=Math.max(1,old.clientWidth);next.height=Math.max(1,old.clientHeight);try{next.getContext('2d').drawImage(old,0,0,next.width,next.height)}catch{}}
  return copy;
 }
 function play(node,frames,options){
  const animation=node.animate(frames,options);animation.id='frontier-navigation134';running.add(animation);
  const timer=setTimeout(()=>{animation.cancel();running.delete(animation)},(options.duration||190)+25);animation.finished.catch(()=>{}).then(()=>{clearTimeout(timer);running.delete(animation)});return animation;
 }
 function direction(from,to){const list=isStorage(from)&&isStorage(to)?storage:main,a=list.indexOf(from),b=list.indexOf(to);return a>=0&&b>=0?Math.sign(b-a)||1:to==='home'?-1:1}
 const original=go;
 go=function(next){
  if(routing||next===page||document.querySelector('.visual-storage-sliding'))return original(next);
  clear();
  const from=page,source=content(from,next),animate=!!source&&!reduced()&&!document.hidden;
  const started=performance.now(),rect=animate?source.getBoundingClientRect():null,scroll=source?.scrollTop||0;
  // WebGL is disposed when leaving the yard. Keep its displayed pixels, rather than an empty canvas.
  const snapshot=animate&&source.querySelector('canvas')?copyStage(source):source;
  metrics.lastCaptureMs=performance.now()-started;
  const previous=window.FrontierMotion.routerActive;window.FrontierMotion.routerActive=true;routing=true;
  const before=performance.now();let result;
  try{result=original(next)}finally{routing=false;window.FrontierMotion.routerActive=previous;metrics.lastRenderMs=performance.now()-before}
  const target=content(next,from),offset=dragOffset;dragOffset=0;
  if(!animate||page===from||!target||!rect.width||!rect.height)return result;
  metrics.routes++;
  const dir=direction(from,next),distance=Math.min(28,Math.max(16,rect.width*.055)),timing={duration:190,easing:'cubic-bezier(.2,.8,.25,1)',fill:'backwards'};
  // Reattaching a large inventory tree duplicates image/style work during the transition.
  const retain=snapshot&&!snapshot.isConnected&&snapshot.querySelectorAll('*').length<=240&&target.querySelectorAll('*').length<=240;
  if(snapshot&&!retain)metrics.heavySnapshotsSkipped++;
  if(retain){
   const out=document.createElement('div');out.className='navigation134-outgoing';out.inert=true;out.setAttribute('aria-hidden','true');
   Object.assign(out.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',opacity:'0'});
   for(const node of [snapshot,...snapshot.querySelectorAll('[id]')])node.removeAttribute('id');
   Object.assign(snapshot.style,{position:'relative',inset:'auto',width:'100%',height:'100%',maxHeight:'none',margin:'0',boxSizing:'border-box'});
   out.append(snapshot);document.body.append(out);if(scroll>0)snapshot.scrollTop=scroll;layer=out;
   const leaving=play(out,[{opacity:1,transform:'translateX('+offset+'px)'},{opacity:.65,transform:'translateX('+(offset-dir*distance*.35)+'px)',offset:.5},{opacity:0,transform:'translateX('+(offset-dir*distance*.65)+'px)'}],{...timing,duration:170});
   const remove=()=>{out.remove();if(layer===out)layer=null};leaving.finished.catch(()=>{}).then(remove);setTimeout(remove,195);
  }
  entry={page:next,from,target,deadline:performance.now()+190,animation:null};
  if(next==='run'&&R()?.battle)entry.animation=play(target,[{opacity:.4},{opacity:1}],{...timing,duration:140});else entry.animation=play(target,[{opacity:retain?.25:.78,transform:'translateX('+dir*distance+'px)'},{opacity:.9,transform:'translateX('+dir*3+'px)',offset:.65},{opacity:1,transform:'none'}],timing);
  return result;
 };
 const draw=render;
 render=function(...args){
  const current=entry,carry=!routing&&current&&current.page===page&&performance.now()<current.deadline&&current.target.isConnected;
  const pose=carry?{opacity:getComputedStyle(current.target).opacity,transform:getComputedStyle(current.target).transform}:null;
  const result=draw.apply(this,args);
  if(pose&&entry===current){const target=content(page,current.from),remaining=current.deadline-performance.now();if(target&&target!==current.target&&remaining>0){current.animation?.cancel();current.target=target;current.animation=play(target,[pose,{opacity:1,transform:'none'}],{duration:remaining,easing:'ease-out',fill:'backwards'})}}
  return result;
 };
 const style=document.createElement('style');style.textContent='.navigation134-outgoing{position:fixed;z-index:80;overflow:hidden;pointer-events:none!important;user-select:none;background:#10191e;contain:layout paint;will-change:transform,opacity}.navigation134-outgoing>*{min-height:0!important;flex:none!important}.navigation134-outgoing .yard-stage{border:0}.navigation134-outgoing .yard-throw-held{display:none}@media(prefers-reduced-motion:reduce){.navigation134-outgoing{display:none}}html[data-frontier-reduce-motion] .navigation134-outgoing{display:none}';document.head.append(style);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});window.addEventListener('pagehide',clear);
 return{clear,info:()=>({...metrics,animations:running.size,overlay:!!layer}),setDragOffset:value=>{dragOffset=Number(value)||0}};
})();
