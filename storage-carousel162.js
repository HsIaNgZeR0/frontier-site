'use strict';
// Native horizontal momentum scrolling: no pointer-move layout, clones or JS animation.
window.FrontierStorageCarousel162=(()=>{
 let current=null,raf=0;const metrics={built:0,settles:0};
 function mount(body,section,tabs,build,commit){
  const nav=body.querySelector('.visual-storage-tabs'),content=body.querySelector(':scope>.visual-storage-content');
  if(!nav||!content||section==='containers'&&db.containers?.activeBox)return false;
  const track=document.createElement('div');track.className='storage162-track';track.dataset.storage162='';
  const state={body,nav,track,tabs,build,commit,section,index:tabs.findIndex(t=>t[0]===section),panes:[],built:new Set(),touching:false};
  current=state;body.classList.add('storage162-body');body.parentElement.classList.add('storage162-shell');
  for(const [id,name]of tabs){const pane=document.createElement('section');pane.className='storage162-pane';pane.dataset.storage162Page=id;pane.setAttribute('aria-label',name);state.panes.push(pane);if(id===section){pane.append(content);state.built.add(id)}else pane.innerHTML='<div class="storage162-placeholder" aria-hidden="true"></div>';track.append(pane)}
  body.append(track);state.width=track.clientWidth;track.style.scrollBehavior='auto';track.scrollLeft=state.index*track.clientWidth;
  function ensure(i){const id=tabs[i]?.[0],pane=state.panes[i];if(!id||state.built.has(id)||!track.isConnected)return;pane.replaceChildren(build(id));state.built.add(id);metrics.built++}
  state.ensure=ensure;
  function changed(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(current!==state||!track.isConnected)return;const width=track.clientWidth;if(!width)return;const value=track.scrollLeft/width,index=Math.max(0,Math.min(tabs.length-1,Math.round(value)));ensure(index);if(Math.abs(value-index)<.015&&!state.touching&&index!==state.index){state.index=index;state.requestedIndex=null;state.section=tabs[index][0];state.committing=true;try{go(state.section)}finally{state.committing=false}metrics.settles++}FrontierStorageViewport148?.refresh()})}
  track.addEventListener('scroll',changed,{passive:true});
  track.addEventListener('pointerdown',()=>{state.touching=true},{passive:true});
  const release=()=>{state.touching=false;changed()};track.addEventListener('pointerup',release,{passive:true});track.addEventListener('pointercancel',release,{passive:true});track.addEventListener('scrollend',changed,{passive:true});
  // Prebuild once outside a gesture. Each pane retains its nodes and vertical position.
  const pending=[state.index-1,state.index+1,0,1,2,3].filter((x,i,a)=>x>=0&&x<tabs.length&&a.indexOf(x)===i&&x!==state.index);
  function warm(){if(current!==state||!track.isConnected||!pending.length)return;if(state.touching||FrontierRuntime.busy){setTimeout(warm,100);return}ensure(pending.shift());if(pending.length)setTimeout(warm,80)}
  if(window.requestIdleCallback)requestIdleCallback(warm,{timeout:600});else setTimeout(warm,120);
  return true;
 }
 function settle(next){const s=current;if(!s?.committing||!s.track.isConnected)return false;s.commit(next);return true}
 const oldGo=go;go=function(next){const s=current,index=s?.tabs.findIndex(t=>t[0]===next);if(s?.track.isConnected&&s.tabs.some(t=>t[0]===page)&&index>=0&&!s.committing){s.ensure(index);s.requestedIndex=index;if(window.FrontierMotion?.reduced()){s.track.scrollLeft=index*s.track.clientWidth;s.index=index;s.section=next;s.committing=true;try{return oldGo(next)}finally{s.committing=false}}s.track.scrollTo({left:index*s.track.clientWidth,behavior:'smooth'});return}if(s?.committing){s.body.parentElement.classList.add('visual-storage-sliding');try{return oldGo(next)}finally{s.body.parentElement.classList.remove('visual-storage-sliding')}}return oldGo(next)};
 window.addEventListener('resize',()=>{const s=current;if(s?.track.isConnected&&Math.abs(s.track.clientWidth-s.width)>1){s.width=s.track.clientWidth;s.track.scrollLeft=(s.requestedIndex??s.index)*s.width;FrontierStorageViewport148?.refresh()}},{passive:true});
 return{mount,settle,info:()=>({...metrics,index:current?.index,panes:current?.built.size})};
})();
