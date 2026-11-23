'use strict';
/* 基建佈局 v601：本家風格長方形房間、指揮中樞 2×2、自由拖動擺放（存於 db.baseLayout601）。 */
window.FrontierBaseLayout601=(()=>{
 if(!document.querySelector('link[data-b601]')){const l=document.createElement('link');l.rel='stylesheet';l.href='base-layout601.css?v=601e';l.dataset.b601='';document.head.appendChild(l)}
 const U=16,COLS=40,ROWS=40,RW=7,RH=4,LV=2;
 const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 // 本家房間造型：色彩、圖示與英文標示。本家沒有的房間沿用模板換色。
 const svg=d=>'<svg viewBox="0 0 16 16" aria-hidden="true">'+d+'</svg>',ico={
  hub:svg('<path fill-rule="evenodd" d="M8 1l7 7-7 7-7-7zM8 5l3 3-3 3-3-3z"/>'),
  factory:svg('<path fill-rule="evenodd" d="M7 1h2l.4 2 1.6.7 1.7-1.2 1.4 1.4-1.2 1.7.7 1.6 2 .4v2l-2 .4-.7 1.6 1.2 1.7-1.4 1.4-1.7-1.2-1.6.7-.4 2H7l-.4-2-1.6-.7-1.7 1.2-1.4-1.4 1.2-1.7-.7-1.6L1 9V7l2-.4.7-1.6-1.2-1.7 1.4-1.4 1.7 1.2L6.6 3zM8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/>'),
  trade:svg('<path fill-rule="evenodd" d="M2 5l6-3 6 3v6l-6 3-6-3zM8 7L4 5v5l4 2z"/>'),
  power:svg('<path d="M9.5 1L3 9.2h4.2L6.3 15 13 6.8H8.8z"/>'),
  workshop:svg('<path d="M2 2.5h7.5l2.5 2.5-2.5 2.5H7.2V15H4.8V7.5H2z"/>'),
  office:svg('<path fill-rule="evenodd" d="M5.5 2h5v2H15v10H1V4h4.5zM7 3.3V4h2v-.7z"/>'),
  reception:svg('<circle cx="5" cy="5" r="2.3"/><circle cx="11" cy="5" r="2.3"/><path d="M.8 14c0-3 1.9-5 4.2-5s4.2 2 4.2 5zM6.8 14c0-3 1.9-5 4.2-5s4.2 2 4.2 5z"/>'),
  training:svg('<path d="M1 6.5h2V4h2.2v8H3V9.5H1zM15 6.5h-2V4h-2.2v8H13V9.5h2zM5.2 7h5.6v2H5.2z"/>'),
  template:svg('<path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z"/>')};
 const looks={
  hub:{c:'#f0f0f0',en:'CONTROL CENTER',t:'hub'},
  factory:{c:'#ffc61a',en:'FACTORY',t:'factory'},
  trade:{c:'#20a4ea',en:'TRADING POST',t:'trade'},
  supply:{c:'#9fd12a',en:'POWER PLANT',t:'power'},
  workshop:{c:'#e9a23b',en:'WORKSHOP',t:'workshop'},
  personnel:{c:'#59b6f2',en:'OFFICE',t:'office'},
  dispatch:{c:'#f2781f',en:'RECEPTION ROOM',t:'reception'},
  commission:{c:'#cfcfcf',en:'TRAINING ROOM',t:'training'},
  cFactory:{c:'#c27cf2',en:'C-FACTORY',t:'factory'},
  cTrade:{c:'#3fd1a0',en:'C-TRADING POST',t:'trade'},
  cSupply:{c:'#ef5f7f',en:'C-POWER PLANT',t:'power'},
  logistics:{c:'#b9a3ff',en:'LOGISTICS',t:'template'}
 };
 const look=k=>looks[k]||{c:'#9aa7ad',en:'FACILITY',t:'template'};
 const size=kind=>kind==='hub'?{w:RW*2,h:RH*2}:{w:RW,h:RH};
 const overlap=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
 const inside=p=>Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x+p.w<=COLS&&p.y+p.h<=ROWS;
 function kindOf(s,id){return s?.base151?.rooms?.find(r=>r.id===id)?.kind||(String(id).startsWith('room:hub')?'hub':'')}
 /* 解析完整佈局：存檔中（v2）有效的座標優先，其餘依舊 8×8 位置順序放入預設槽位。v1 為舊尺寸佈局，直接改用預設。 */
 function resolve(s){const rooms=(s?.base151?.rooms||[]).filter(r=>r.kind!=='medical'&&!FrontierBaseEngine.types[r.kind]?.retired),saved=s?.baseLayout601?.v===LV?s.baseLayout601.rooms:{},placed=[],out={};
  const put=(r,p)=>{const box={...p,...size(r.kind),id:r.id};placed.push(box);out[r.id]=box};
  for(const r of rooms){const p=saved[r.id];if(p){const box={x:p.x,y:p.y,...size(r.kind)};if(inside(box)&&!placed.some(b=>overlap(b,box)))put(r,p)}}
  const order=rooms.filter(r=>!out[r.id]).sort((a,b)=>(a.kind==='hub'?-1:0)-(b.kind==='hub'?-1:0)||a.y-b.y||a.x-b.x);
  for(const r of order){const sz=size(r.kind);let spot=null;for(let y=0;y+sz.h<=ROWS&&!spot;y+=RH)for(let x=0;x+sz.w<=COLS;x+=RW){const box={x,y,...sz};if(!placed.some(b=>overlap(b,box))){spot={x,y};break}}
   if(!spot)for(let y=0;y+sz.h<=ROWS&&!spot;y++)for(let x=0;x+sz.w<=COLS;x++){if(!placed.some(b=>overlap(b,{x,y,...sz}))){spot={x,y};break}}
   if(spot)put(r,spot)}
  return out}
 function valid(s){const l=s?.baseLayout601;if(l==null)return true;if(typeof l!=='object'||Array.isArray(l)||![1,LV].includes(l.v)||!l.rooms||typeof l.rooms!=='object'||Array.isArray(l.rooms))return false;const keys=Object.keys(l);if(keys.some(k=>!['v','rooms'].includes(k)))return false;const ids=Object.keys(l.rooms);if(ids.length>64)return false;const boxes=[];
  for(const id of ids){const p=l.rooms[id];if(id.length>80||!p||typeof p!=='object'||Object.keys(p).some(k=>!['x','y'].includes(k))||!Number.isInteger(p.x)||!Number.isInteger(p.y))return false;if(l.v!==LV)continue;const box={x:p.x,y:p.y,...size(kindOf(s,id))};if(!inside(box)||boxes.some(b=>overlap(b,box)))return false;boxes.push(box)}return true}
 const prior=validSave;validSave=function(s){return prior(s)&&valid(s)};
 const bars=n=>'<span class="b601-lv" aria-label="等級 '+n+'">'+Array.from({length:n},()=>'<i></i>').join('')+'</span>';
 /* 本家總覽房塊：左側色條（生產類）、名稱＋白色直槓、狀態列、右下人數、底部分段條、六角形浮水印。 */
 const prodKinds={factory:'生產中',cFactory:'生產中',trade:'獲取中',cTrade:'獲取中',supply:'補給中',cSupply:'補給中'};
 const hex='<svg class="b601-hex" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 2l17 10v22L20 44 3 34V12z" fill="none" stroke="currentColor" stroke-width="3"/></svg>';
 const person='<svg viewBox="0 0 8 14" aria-hidden="true"><circle cx="4" cy="2.3" r="2.1"/><path d="M1 5.5h6v5H5.5V14h-3v-3.5H1z"/></svg>';
 function roomHTML(s,r,box){const E=FrontierBaseEngine,L=look(r.kind),seats=r.kind==='hub'||E.types[r.kind]?.kind==='none'?0:E.seats(r)||0,ready=Object.values(r.pending||{}).some(n=>n>0)||r.income>0,name=E.types[r.kind]?.name||r.kind,prod=prodKinds[r.kind];
  const style='--rc:'+L.c+';left:'+box.x*U+'px;top:'+box.y*U+'px;width:'+box.w*U+'px;height:'+box.h*U+'px';
  if(r.kind==='hub')return '<button type="button" class="b601-room b601-hub" data-room601="'+esc(r.id)+'" aria-label="'+esc(name)+' 等級 '+r.level+'" style="'+style+'"><span class="b601-frame"><span class="b601-tree"></span><span class="b601-hubtitle"><b class="b601-name">'+esc(name)+'</b><small>LEVEL OF CONTROL_INTERFACE</small><span class="b601-ver"><i class="b601-verhatch"></i><small>VER</small><strong>'+r.level+'.0</strong></span></span></span>'+(ready?'<em class="b601-ready"></em>':'')+'</button>';
  const status=ready?'可收取':prod?(prod+' ▸▸▸'):(r.staff.length?'工作中':'空閒中');
  return '<button type="button" class="b601-room'+(prod?' b601-prod':'')+'" data-room601="'+esc(r.id)+'" aria-label="'+esc(name)+' 等級 '+r.level+'" style="'+style+'"><span class="b601-frame"><span class="b601-mark">'+hex+'<span class="b601-ico">'+ico[L.t]+'</span></span>'+(prod?'<span class="b601-bar"></span>':'')+'<span class="b601-head"><b class="b601-name">'+esc(name)+'</b>'+bars(r.level)+'</span><small class="b601-status'+(ready?' is-ready':'')+'">'+status+'</small>'+(seats?'<span class="b601-count">'+person+'<b>'+r.staff.length+'</b><small>/'+seats+'</small></span>':'')+'<span class="b601-seg">'+'<i></i>'.repeat(5)+'</span></span></button>'}
 /* 名稱過長時縮小字級而非截斷為「…」。 */
 function fit(root){for(const b of root.querySelectorAll('.b601-room:not(.b601-hub) .b601-name,.b601-status')){let f=parseFloat(getComputedStyle(b).fontSize);while(b.scrollWidth>b.clientWidth+.5&&f>5){f-=.5;b.style.fontSize=f+'px'}}}
 function board(){const s=FrontierBase151.preview?.()||db,lay=resolve(s);return '<div class="b601-board" style="width:'+COLS*U+'px;height:'+ROWS*U+'px">'+(s.base151.rooms||[]).filter(r=>lay[r.id]).map(r=>roomHTML(s,r,lay[r.id])).join('')+'</div>'}
 function decorate(){const old=document.querySelector('.base151-board');if(!old||!db.base151||!FrontierBaseEngine.modern(db))return;old.classList.add('b601-host');old.innerHTML=board();fit(old);const hint=[...document.querySelectorAll('.base151-shell .tiny')].find(p=>p.textContent.includes('拖動'));if(hint)hint.textContent='雙指縮放 · 長按房間後拖動擺放 · 點按管理'}
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
  return FrontierRuntime.perform('base-layout601',()=>{const cur=resolve(db),rooms={};for(const [k,b]of Object.entries(cur))rooms[k]={x:b.x,y:b.y};rooms[id]={x,y};db.baseLayout601={v:LV,rooms};if(typeof render==='function')render()})}
 return {resolve,valid,move,board,U,COLS,ROWS};
})();
