'use strict';
// Presentation only: all item buttons retain their UID and original handlers.
window.FrontierStorageViewport148=(()=>{
 const views=new WeakMap();let frame=0;
 const metrics={mounts:0,updates:0};
 let viewportWidth=innerWidth,viewportHeight=innerHeight;
 const dimensions=()=>({columns:viewportWidth<359?1:2,height:viewportWidth<359?104:132,gap:8});
 function paint(grid,state,first=0){
  const d=dimensions(),rows=Math.ceil(state.items.length/d.columns),count=Math.ceil(viewportHeight/(d.height+d.gap))+6;
  first=Math.max(0,Math.min(Math.max(0,rows-count),first));
  const end=Math.min(rows,first+count),key=[d.columns,d.height,first,end].join(':');if(key===state.key)return;
  state.key=key;state.first=first;state.columns=d.columns;state.height=d.height;
  grid.style.setProperty('--equipment148-height',d.height+'px');
  grid.style.setProperty('gap',d.gap+'px','important');
  grid.style.setProperty('grid-template-columns','repeat('+d.columns+',minmax(0,1fr))','important');
  grid.style.setProperty('--equipment142-columns',String(d.columns));
  const nodes=[];
  if(first){state.before.style.height=(first*(d.height+d.gap)-d.gap)+'px';nodes.push(state.before)}
  nodes.push(...state.items.slice(first*d.columns,end*d.columns));
  if(end<rows){state.after.style.height=((rows-end)*(d.height+d.gap)-d.gap)+'px';nodes.push(state.after)}
  const desired=new Set(nodes);
  for(const child of [...grid.children])if(!desired.has(child))child.remove();
  let cursor=grid.firstChild;
  for(const node of nodes){
   if(node===cursor){cursor=cursor.nextSibling;continue}
   grid.insertBefore(node,cursor);
  }
  metrics.updates++;
 }
 function prepare(root){for(const grid of root.querySelectorAll('.equipment142-grid')){
  if(views.has(grid))continue;const items=[...grid.children];if(items.length<32)continue;
  const spacer=()=>{const n=document.createElement('div');n.className='equipment148-spacer';n.setAttribute('aria-hidden','true');return n};
  const state={items,before:spacer(),after:spacer(),key:null};views.set(grid,state);grid.classList.add('equipment148-window');paint(grid,state);metrics.mounts++;
 }schedule()}
 function update(){frame=0;for(const grid of document.querySelectorAll('#app .equipment148-window')){
  const state=views.get(grid);if(!state)continue;
  const scroller=grid.closest('.screen-workspace-body'),top=scroller?.getBoundingClientRect().top||0,rect=grid.getBoundingClientRect(),d=dimensions();
  paint(grid,state,Math.floor(Math.max(0,top-rect.top)/(d.height+d.gap))-2);
 }}
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 document.addEventListener('scroll',e=>{if(e.target?.classList?.contains('visual-storage'))schedule()},{capture:true,passive:true});
 window.addEventListener('resize',()=>{viewportWidth=innerWidth;viewportHeight=innerHeight;schedule()},{passive:true});
 return{prepare,refresh:schedule,info:()=>({...metrics}),all:grid=>views.get(grid)?.items||[...grid.children]};
})();
