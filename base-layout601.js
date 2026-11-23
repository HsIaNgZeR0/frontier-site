'use strict';
/* 基建佈局 v601：本家風格長方形房間、指揮中樞 2×2、自由拖動擺放（存於 db.baseLayout601）。 */
window.FrontierBaseLayout601=(()=>{
 if(!document.querySelector('link[data-b601]')){const l=document.createElement('link');l.rel='stylesheet';l.href='base-layout601.css?v=601a';l.dataset.b601='';document.head.appendChild(l)}
 const U=16,COLS=40,ROWS=40,RW=6,RH=3;
 const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 // 本家房間造型：色彩與英文標示。本家沒有的房間沿用模板換色。
 const looks={
  hub:{c:'#e8e8e8',en:'CONTROL CENTER',t:'hub'},
  factory:{c:'#ffc61a',en:'MANUFACTURING',t:'factory'},
  trade:{c:'#1e9fe6',en:'TRADING POST',t:'trade'},
  supply:{c:'#9ccc24',en:'POWER PLANT',t:'power'},
  medical:{c:'#25c8c2',en:'DORMITORY',t:'dorm'},
  dorm:{c:'#25c8c2',en:'DORMITORY',t:'dorm'},
  workshop:{c:'#e9a23b',en:'WORKSHOP',t:'workshop'},
  personnel:{c:'#5bb4f0',en:'OFFICE',t:'office'},
  dispatch:{c:'#f2781f',en:'RECEPTION ROOM',t:'reception'},
  commission:{c:'#c9c9c9',en:'TRAINING ROOM',t:'training'},
  cFactory:{c:'#c27cf2',en:'C-MANUFACTURING',t:'factory'},
  cTrade:{c:'#3fd1a0',en:'C-TRADING POST',t:'trade'},
  cSupply:{c:'#e85b7a',en:'C-POWER PLANT',t:'power'},
  cDorm:{c:'#7d8cf0',en:'C-DORMITORY',t:'dorm'},
  logistics:{c:'#b9a3ff',en:'LOGISTICS',t:'template'}
 };
 const short={factory:'製造站',cFactory:'收容製造',trade:'貿易站',cTrade:'收容貿易',supply:'補給站',cSupply:'收容補給',dispatch:'外勤調度',commission:'委託中心',logistics:'素材調度',personnel:'人事部',workshop:'加工站',dorm:'宿舍',cDorm:'收容宿舍'};
 const look=k=>looks[k]||{c:'#9aa7ad',en:'FACILITY',t:'template'};
 const size=kind=>kind==='hub'?{w:RW*2,h:RH*2}:{w:RW,h:RH};
 const overlap=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
 const inside=p=>Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x+p.w<=COLS&&p.y+p.h<=ROWS;
 function kindOf(s,id){return s?.base151?.rooms?.find(r=>r.id===id)?.kind||(String(id).startsWith('room:hub')?'hub':'')}
 /* 解析完整佈局：存檔中有效的座標優先，其餘依舊 8×8 位置順序放入預設槽位。 */
 function resolve(s){const rooms=(s?.base151?.rooms||[]).filter(r=>r.kind!=='medical'),saved=s?.baseLayout601?.rooms||{},placed=[],out={};
  const put=(r,p)=>{const box={...p,...size(r.kind),id:r.id};placed.push(box);out[r.id]=box};
  for(const r of rooms){const p=saved[r.id];if(p){const box={x:p.x,y:p.y,...size(r.kind)};if(inside(box)&&!placed.some(b=>overlap(b,box)))put(r,p)}}
  const order=rooms.filter(r=>!out[r.id]).sort((a,b)=>(a.kind==='hub'?-1:0)-(b.kind==='hub'?-1:0)||a.y-b.y||a.x-b.x);
  for(const r of order){const sz=size(r.kind);let spot=null;for(let y=0;y+sz.h<=ROWS&&!spot;y+=RH)for(let x=0;x+sz.w<=COLS;x+=RW){const box={x,y,...sz};if(!placed.some(b=>overlap(b,box))){spot={x,y};break}}
   if(!spot)for(let y=0;y+sz.h<=ROWS&&!spot;y++)for(let x=0;x+sz.w<=COLS;x++){if(!placed.some(b=>overlap(b,{x,y,...sz}))){spot={x,y};break}}
   if(spot)put(r,spot)}
  return out}
 function valid(s){const l=s?.baseLayout601;if(l==null)return true;if(typeof l!=='object'||Array.isArray(l)||l.v!==1||!l.rooms||typeof l.rooms!=='object'||Array.isArray(l.rooms))return false;const keys=Object.keys(l);if(keys.some(k=>!['v','rooms'].includes(k)))return false;const ids=Object.keys(l.rooms);if(ids.length>64)return false;const boxes=[];
  for(const id of ids){const p=l.rooms[id];if(id.length>80||!p||typeof p!=='object'||Object.keys(p).some(k=>!['x','y'].includes(k)))return false;const box={x:p.x,y:p.y,...size(kindOf(s,id))};if(!inside(box)||boxes.some(b=>overlap(b,box)))return false;boxes.push(box)}return true}
 const prior=validSave;validSave=function(s){return prior(s)&&valid(s)};
 const bars=n=>'<span class="b601-lv" aria-label="等級 '+n+'">'+Array.from({length:n},()=>'<i></i>').join('')+'</span>';
 function roomHTML(s,r,box){const E=FrontierBaseEngine,L=look(r.kind),seats=r.kind==='hub'||E.types[r.kind]?.kind==='none'?0:Math.min(5,E.seats(r)||0),ready=Object.values(r.pending||{}).some(n=>n>0)||r.income>0;
  return '<button type="button" class="b601-room b601-t-'+L.t+(r.kind==='hub'?' b601-hub':'')+'" data-room601="'+esc(r.id)+'" style="--rc:'+L.c+';left:'+box.x*U+'px;top:'+box.y*U+'px;width:'+box.w*U+'px;height:'+box.h*U+'px"><span class="b601-band"></span><span class="b601-head"><b>'+esc(short[r.kind]||E.types[r.kind]?.name||r.kind)+'</b>'+bars(r.level)+'</span><small class="b601-en">'+L.en+'</small>'+(seats?'<span class="b601-staff">'+Array.from({length:seats},(_,i)=>'<i class="'+(i<r.staff.length?'on':'')+'"></i>').join('')+'</span>':'')+(ready?'<em class="b601-ready" aria-label="可收取"></em>':'')+'</button>'}
 function board(){const s=FrontierBase151.preview?.()||db,lay=resolve(s);return '<div class="b601-board" style="width:'+COLS*U+'px;height:'+ROWS*U+'px">'+(s.base151.rooms||[]).filter(r=>lay[r.id]).map(r=>roomHTML(s,r,lay[r.id])).join('')+'</div>'}
 function decorate(){const old=document.querySelector('.base151-board');if(!old||!db.base151||!FrontierBaseEngine.modern(db))return;old.classList.add('b601-host');old.innerHTML=board();const hint=[...document.querySelectorAll('.base151-shell .tiny')].find(p=>p.textContent.includes('拖動'));if(hint)hint.textContent='雙指縮放 · 長按房間後拖動擺放 · 點按管理'}
 const prevView=window.baseView;window.baseView=function(){const out=prevView.apply(this,arguments);try{decorate()}catch(e){console.error(e)}return out};
 /* 拖動：滑鼠立即拖動；觸控長按 350ms 後才進入拖動，期間以 touchmove 阻止頁面捲動。 */
 let drag=null,suppressClick=0;
 const blockTouch=e=>{if(drag?.active&&e.cancelable)e.preventDefault()};
 document.addEventListener('touchmove',blockTouch,{passive:false,capture:true});
 function end(){if(!drag)return;clearTimeout(drag.timer);drag.el.classList.remove('b601-lift','b601-bad');drag.el.style.transform='';drag=null}
 document.addEventListener('pointerdown',e=>{const el=e.target.closest?.('[data-room601]');if(!el||e.button>0)return;const b=el.closest('.b601-board');drag={el,b,id:el.dataset.room601,pid:e.pointerId,sx:e.clientX,sy:e.clientY,active:false,t0:e.timeStamp,touch:e.pointerType!=='mouse'};
  if(drag.touch)drag.timer=setTimeout(()=>{if(drag){drag.active=true;el.classList.add('b601-lift');navigator.vibrate?.(15)}},350)},true);
 document.addEventListener('pointermove',e=>{const d=drag;if(!d||e.pointerId!==d.pid)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;
  if(!d.active){if(d.touch&&e.timeStamp-d.t0>=350){clearTimeout(d.timer);d.active=true;d.el.classList.add('b601-lift')}else{if(Math.hypot(dx,dy)<8)return;if(d.touch){end();return}d.active=true}d.el.classList.add('b601-lift')}
  e.preventDefault();e.stopImmediatePropagation();const scale=d.b.getBoundingClientRect().width/d.b.offsetWidth||1;d.el.style.transform='translate('+dx/scale+'px,'+dy/scale+'px)';const t=target(d,dx/scale,dy/scale);d.el.classList.toggle('b601-bad',!t.ok)},{capture:true,passive:false});
 function target(d,dx,dy){const s=db,lay=resolve(s),me=lay[d.id];if(!me)return{ok:false};const box={...me,x:Math.round((me.x*U+dx)/U),y:Math.round((me.y*U+dy)/U)};box.x=Math.max(0,Math.min(COLS-box.w,box.x));box.y=Math.max(0,Math.min(ROWS-box.h,box.y));return{box,lay,ok:!Object.values(lay).some(b=>b.id!==d.id&&overlap(b,box))}}
 document.addEventListener('pointerup',e=>{const d=drag;if(!d||e.pointerId!==d.pid)return;if(!d.active){end();return}e.preventDefault();e.stopImmediatePropagation();suppressClick=performance.now()+500;const scale=d.b.getBoundingClientRect().width/d.b.offsetWidth||1,t=target(d,(e.clientX-d.sx)/scale,(e.clientY-d.sy)/scale),id=d.id;end();if(!t.ok){toast('該位置與其他房間重疊。');return}move(id,t.box.x,t.box.y,t.lay)},{capture:true,passive:false});
 document.addEventListener('pointercancel',e=>{if(drag&&!drag.active)end();else if(drag&&e.pointerId===drag.pid)end()},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest?.('[data-room601]'))e.preventDefault()},true);
 document.addEventListener('click',e=>{const el=e.target.closest?.('[data-room601]');if(!el)return;if(performance.now()<suppressClick){e.preventDefault();e.stopImmediatePropagation();return}FrontierBase151.room(el.dataset.room601)});
 async function move(id,x,y,lay){lay=lay||resolve(db);const me=lay[id];if(!me)return false;const box={...me,x,y};if(!inside(box)||Object.values(lay).some(b=>b.id!==id&&overlap(b,box)))return false;
  return FrontierRuntime.perform('base-layout601',()=>{const cur=resolve(db),rooms={};for(const [k,b]of Object.entries(cur))rooms[k]={x:b.x,y:b.y};rooms[id]={x,y};db.baseLayout601={v:1,rooms};if(typeof render==='function')render()})}
 return {resolve,valid,move,board,U,COLS,ROWS};
})();
