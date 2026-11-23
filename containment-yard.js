'use strict';
/* 收容管理場：已收容個體在整個畫面自由走動；點擊看資料、筆形改名（永久存檔）、長按拖曳搬移。 */
window.FrontierContainmentYard=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const SPINE_MAX=12,HOLD_MS=360,NAME_MAX=12;
 let mobs=[],raf=0,last=0,field=null,bubble=null,focus=null,drag=null,editing=false,needSpine=false;
 const rnd=(a,b)=>a+Math.random()*(b-a);
 const instances=()=>(db.capture?.instances||[]).filter(i=>FrontierCapture.units[i.species]?.kind==='enemy');
 const nameOf=i=>i.nickname||FrontierCapture.units[i.species].name;
 function difficulty(i){
  const u=FrontierCapture.units[i.species],r=u.rarity||1;
  const [label,cls]=u.boss?['極高','x']:r>=3?['高','h']:r===2?['中','m']:['低','l'];
  return '<span class="yard-diff yard-diff-'+cls+'">'+label+' '+'★'.repeat(Math.min(6,Math.max(1,r)))+'</span>'+(i.mutation?'<span class="yard-diff yard-diff-x">變異</span>':'');
 }
 function when(t){if(!Number.isFinite(t))return '未知';const d=new Date(t),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'/'+p(d.getMonth()+1)+'/'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())}
 function region(i){const id=i.origin?.region;return FrontierExpedition.regions.find(r=>r.id===id)?.name||'舊收容檔案'}
 function bounds(){const w=field.clientWidth,h=field.clientHeight;return{x0:40,x1:Math.max(80,w-40),y0:Math.min(h-40,150),y1:Math.max(170,h-24)}}
 /* 鬆散分布：每隻從多個候選點挑離其他個體最遠的位置 */
 function spread(n){const b=bounds(),pts=[];for(let k=0;k<n;k++){let best=null,score=-1;for(let t=0;t<24;t++){const p={x:rnd(b.x0,b.x1),y:rnd(b.y0,b.y1)},d=pts.reduce((m,q)=>Math.min(m,Math.hypot(p.x-q.x,(p.y-q.y)*1.4)),1e9);if(d>score){score=d;best=p}}pts.push(best)}return pts}
 function view(){
  const list=instances();
  return '<section class="yard" aria-label="收容管理場"><div class="yard-floor" aria-hidden="true"></div><div class="yard-head"><button class="yard-back" data-yard-back aria-label="返回主頁"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><div class="yard-title"><small>CONTAINMENT YARD</small><b>收容管理場</b></div><span class="yard-count">收容個體 '+list.length+'</span></div>'+(list.length?'<p class="yard-hint">點擊查看資料 · 長按拖曳搬移</p>':'<p class="yard-empty">尚無收容個體。<br>於遠征中削弱敵人並使用收容裝置，成功撤離後會在這裡出現。</p>')+'<div class="yard-field"></div></section>';
 }
 function mount(){
  stop();field=document.querySelector('.yard-field');if(!field)return;
  const navTop=document.querySelector('#nav')?.getBoundingClientRect().top;if(navTop>0&&navTop<innerHeight)field.closest('.yard').style.bottom=(innerHeight-navTop)+'px';
  /* Spine 執行庫首次需非同步載入，載完會再 render 一次，屆時改掛模型 */
  needSpine=!window.spine?.webgl;
  const list=instances(),pts=spread(list.length);let spines=0;
  /* WebGL 名額先給沒有待機動圖的個體，有動圖的超額時仍會動 */
  const I=window.FrontierEnemyIdleAssets||{},hasIdle=i=>!!(I[i.species]||I[String(i.species).replace(/_\d+$/,'')]);
  const slots=new Set([...list.filter(i=>!hasIdle(i)),...list.filter(hasIdle)].filter(i=>FrontierEnemySpine.has?.(i.species)).slice(0,SPINE_MAX).map(i=>i.uid));
  mobs=list.map((i,k)=>{
   const u=FrontierCapture.units[i.species],size=Math.round((u.boss?150:u.rarity>=3?128:u.rarity===2?112:100)*(i.mutation?1.08:1));
   const el=document.createElement('div');el.className='yard-mob'+(i.mutation?' is-mutant':'');el.dataset.uid=i.uid;el.style.setProperty('--s',size+'px');
   el.innerHTML='<div class="yard-shadow"></div><div class="yard-body"><div class="yard-art"></div></div>';
   field.append(el);
   const art=el.querySelector('.yard-art'),key='yard-'+i.uid;let spine=false;
   if(slots.has(i.uid)&&spines<SPINE_MAX&&window.FrontierEnemySpine?.mount(art,i.species,key)){spine=true;spines++;art.addEventListener('spine-failed',()=>{m.spine=false;fallback(art,i)},{once:true})}
   else fallback(art,i);
   const m={i,el,art,key,spine,size,x:pts[k].x,y:pts[k].y,tx:pts[k].x,ty:pts[k].y,dir:Math.random()<.5?-1:1,mode:'idle',wait:rnd(.3,3.5),speed:rnd(16,30)*(u.rarity>=3?.85:1),hop:0,motion:''};
   return m;
  });
  for(const m of mobs)place(m);
  last=0;raf=requestAnimationFrame(tick);
 }
 /* 超過 WebGL 上限的個體改用 PRTS 待機動圖，再不行才用頭像 */
 function fallback(art,i){const d=FrontierCapture.units[i.species],I=window.FrontierEnemyIdleAssets||{},idle=(I[i.species]||I[String(i.species).replace(/_\d+$/,'')])?.idle;art.innerHTML=idle?'<img class="yard-idle" src="'+esc(idle)+'" alt="" draggable="false">':d.asset?'<img src="assets/'+esc(d.image)+'.png" alt="" draggable="false">':'<span class="yard-unknown">◇</span>'}
 function setMotion(m,want){if(m.motion===want)return;m.motion=want;m.el.classList.toggle('is-walking',want==='move');if(m.spine)FrontierEnemySpine.motion(m.i.species,m.key,want)}
 function place(m){m.el.style.transform='translate3d('+(m.x-m.size/2)+'px,'+(m.y-m.size)+'px,0)';m.el.style.zIndex=String(10+Math.round(m.y));m.el.style.setProperty('--dir',m.dir);m.el.style.setProperty('--hop',(-m.hop)+'px')}
 function tick(t){
  raf=0;if(!field?.isConnected){stop();return}
  const dt=last?Math.min(.1,(t-last)/1000):0;last=t;const b=bounds();
  for(const m of mobs){
   if(m.hop>0)m.hop=Math.max(0,m.hop-dt*60);
   if(drag?.m===m||focus===m){setMotion(m,'idle');place(m);continue}
   if(m.mode==='idle'){m.wait-=dt;setMotion(m,'idle');if(m.wait<=0){
     /* 偏好短程漫步，偶爾長途；目標保持在畫面內 */
     const far=Math.random()<.25,r=far?rnd(160,320):rnd(50,150),a=rnd(0,Math.PI*2);
     m.tx=Math.min(b.x1,Math.max(b.x0,m.x+Math.cos(a)*r));m.ty=Math.min(b.y1,Math.max(b.y0,m.y+Math.sin(a)*r*.6));m.mode='walk'}}
   else{const dx=m.tx-m.x,dy=m.ty-m.y,d=Math.hypot(dx,dy);if(d<2){m.mode='idle';m.wait=rnd(1.5,6)}else{const s=Math.min(d,m.speed*dt);m.x+=dx/d*s;m.y+=dy/d*s;if(Math.abs(dx)>1)m.dir=dx<0?-1:1;setMotion(m,'move')}}
   m.x=Math.min(b.x1,Math.max(b.x0,m.x));m.y=Math.min(b.y1,Math.max(b.y0,m.y));place(m);
  }
  if(bubble&&focus)aim();
  raf=requestAnimationFrame(tick);
 }
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;mobs=[];focus=null;drag=null;bubble=null;editing=false}
 /* 資料泡泡：顯示在個體頭上，靠邊時自動收進畫面 */
 function show(m){
  focus=m;editing=false;bubble?.remove();bubble=document.createElement('div');bubble.className='yard-bubble';bubble.setAttribute('role','dialog');
  fill();field.append(bubble);aim();
 }
 function fill(){
  const i=focus.i,u=FrontierCapture.units[i.species];
  bubble.innerHTML=(editing?'<form class="yard-rename"><input maxlength="'+NAME_MAX+'" value="'+esc(i.nickname||'')+'" placeholder="'+esc(u.name)+'" aria-label="自訂名稱"><button type="submit">確定</button></form>':'<div class="yard-name"><b>'+esc(nameOf(i))+'</b><button class="yard-pen" data-yard-pen aria-label="自訂名稱"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></button></div>')+(i.nickname?'<small class="yard-species">'+esc(u.name)+'</small>':'')+'<dl><dt>收容時間</dt><dd>'+when(i.capturedAt)+'</dd><dt>收容難度</dt><dd>'+difficulty(i)+'</dd><dt>收容地區</dt><dd>'+esc(region(i))+'</dd></dl>';
  if(editing){const input=bubble.querySelector('input');input.focus();input.select()}
 }
 function aim(){const fw=field.clientWidth,bw=bubble.offsetWidth,bh=bubble.offsetHeight;let x=focus.x-bw/2,y=focus.y-focus.size-focus.hop-bh-12;x=Math.max(8,Math.min(fw-bw-8,x));if(y<8)y=focus.y+12;bubble.style.transform='translate3d('+x+'px,'+y+'px,0)';bubble.style.setProperty('--tail',(focus.x-x)+'px');bubble.classList.toggle('is-below',y>focus.y)}
 function close(){bubble?.remove();bubble=null;focus=null;editing=false}
 async function rename(value){
  const i=focus?.i;if(!i)return;const name=String(value||'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,NAME_MAX);
  const live=(db.capture?.instances||[]).find(x=>x.uid===i.uid);if(!live)return;
  if(name&&name!==FrontierCapture.units[live.species].name)live.nickname=name;else delete live.nickname;
  focus.i=live;save();editing=false;fill();aim();toast(name?'已命名為「'+name+'」':'已恢復原名');
 }
 /* 指標：短按＝查看；長按＝拿起拖曳 */
 function down(e){
  const el=e.target.closest?.('.yard-mob');if(!el||e.button>0)return;const m=mobs.find(x=>x.el===el);if(!m)return;
  e.preventDefault();const start={x:e.clientX,y:e.clientY,id:e.pointerId,m,lifted:false,moved:false};
  start.timer=setTimeout(()=>{start.lifted=true;if(bubble)close();m.el.classList.add('is-held');try{m.el.setPointerCapture?.(start.id)}catch{}navigator.vibrate?.(15)},HOLD_MS);
  drag=start;
 }
 function move(e){
  if(!drag||e.pointerId!==drag.id)return;
  if(!drag.lifted){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>10){drag.moved=true;clearTimeout(drag.timer)}return}
  e.preventDefault();const r=field.getBoundingClientRect(),m=drag.m,b=bounds();
  m.x=Math.min(b.x1,Math.max(b.x0,e.clientX-r.left));m.y=Math.min(b.y1,Math.max(b.y0,e.clientY-r.top+m.size*.45));
  if(Math.abs(e.movementX||0)>1)m.dir=e.movementX<0?-1:1;place(m);
 }
 function up(e){
  if(!drag||e.pointerId!==drag.id)return;clearTimeout(drag.timer);const d=drag,m=d.m;drag=null;
  if(d.lifted){m.el.classList.remove('is-held');m.hop=10;m.mode='idle';m.wait=rnd(1,3);m.tx=m.x;m.ty=m.y;return}
  if(d.moved||e.type==='pointercancel')return;
  if(focus===m){close();return}
  m.hop=8;show(m);
 }
 document.addEventListener('pointerdown',e=>{if(!field?.isConnected)return;if(e.target.closest?.('.yard-bubble'))return;if(e.target.closest?.('.yard-mob'))down(e);else if(bubble&&e.target.closest?.('.yard'))close()},{passive:false});
 document.addEventListener('pointermove',move,{passive:false});
 document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);
 document.addEventListener('contextmenu',e=>{if(e.target.closest?.('.yard-mob'))e.preventDefault()});
 document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-home20-yard]')){FrontierRuntime.view(()=>go('yard'));return}
  if(e.target.closest?.('[data-yard-back]')){go('home');return}
  if(e.target.closest?.('[data-yard-pen]')&&focus){editing=true;fill();aim()}
 });
 document.addEventListener('submit',e=>{if(!e.target.closest?.('.yard-rename'))return;e.preventDefault();rename(e.target.querySelector('input').value)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&bubble){if(editing){editing=false;fill();aim()}else close()}});
 const prior=render;render=function(){
  document.body.classList.toggle('yard-mode',page==='yard');
  if(page==='yard'){if(field?.isConnected&&!(needSpine&&window.spine?.webgl)){nav();return}nav();$('#app').innerHTML=view();mount();return}
  if(raf)stop();prior();
 };
 return{view,mount,mobs:()=>mobs,rename:(uid,name)=>{const m=mobs.find(x=>x.i.uid===uid);if(m){focus=m;return rename(name)}}};
})();
