'use strict';
/* 基建佈局 v601：本家風格長方形房間、指揮中樞 2×2、自由拖動擺放（存於 db.baseLayout601）。 */
window.FrontierBaseLayout601=(()=>{
 if(!document.querySelector('link[data-b601]')){const l=document.createElement('link');l.rel='stylesheet';l.href='base-layout601.css?v=601c';l.dataset.b601='';document.head.appendChild(l)}
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
 /* 室內剖面插圖（本家總覽的房間剖面：天花燈條、後牆面板、透視地板與設施剪影）。座標系 112×64。 */
 const props={
  factory:'<rect x="14" y="30" width="22" height="18" class="m"/><rect x="17" y="24" width="8" height="6" class="m"/><rect x="58" y="32" width="24" height="16" class="m"/><path d="M36 44h22v3H36z" class="a"/><circle cx="25" cy="38" r="4" class="a"/><circle cx="70" cy="40" r="3" class="a"/><rect x="86" y="36" width="12" height="12" class="m"/>',
  trade:'<rect x="12" y="34" width="14" height="14" class="m"/><rect x="26" y="38" width="10" height="10" class="m"/><rect x="15" y="24" width="10" height="10" class="m"/><path d="M12 41h14M19 34v14" class="l"/><rect x="62" y="30" width="34" height="18" class="m"/><rect x="66" y="33" width="26" height="5" class="a"/>',
  power:'<rect x="40" y="18" width="32" height="30" rx="3" class="m"/><path d="M40 24h32M40 30h32M40 36h32M40 42h32" class="l"/><rect x="52" y="12" width="8" height="6" class="a"/><rect x="14" y="34" width="14" height="14" class="m"/><rect x="84" y="34" width="14" height="14" class="m"/><path d="M28 44h12M72 44h12" class="al"/>',
  workshop:'<rect x="16" y="38" width="44" height="4" class="m"/><path d="M20 42v6M56 42v6" class="l"/><path d="M78 48V28l10-6 6 4" class="al"/><rect x="74" y="44" width="12" height="4" class="m"/><rect x="26" y="32" width="8" height="6" class="a"/>',
  office:'<rect x="34" y="38" width="40" height="4" class="m"/><path d="M38 42v6M70 42v6" class="l"/><rect x="44" y="26" width="18" height="12" class="m"/><rect x="46" y="28" width="14" height="8" class="a"/><rect x="84" y="22" width="16" height="26" class="m"/><path d="M84 30h16M84 38h16" class="l"/>',
  reception:'<path d="M14 48V36h30v12" class="m"/><rect x="12" y="34" width="4" height="14" class="m"/><rect x="42" y="34" width="4" height="14" class="m"/><rect x="56" y="42" width="18" height="3" class="a"/><path d="M60 45v3M70 45v3" class="l"/><rect x="82" y="22" width="18" height="12" class="a" opacity=".5"/>',
  training:'<path d="M20 48V26M44 48V26M20 30h24M20 40h24" class="l"/><circle cx="74" cy="30" r="5" class="m"/><rect x="70" y="35" width="8" height="13" class="m"/><path d="M84 44h14" class="al"/><rect x="82" y="41" width="3" height="6" class="m"/><rect x="97" y="41" width="3" height="6" class="m"/>',
  template:'<rect x="14" y="22" width="26" height="26" class="m"/><path d="M14 30h26M14 38h26" class="l"/><rect x="60" y="28" width="16" height="20" class="m"/><rect x="80" y="34" width="18" height="14" class="m"/><rect x="63" y="31" width="10" height="4" class="a"/>',
  hub:'<path d="M30 48l8-14h36l8 14z" class="m"/><rect x="40" y="16" width="32" height="16" class="m"/><rect x="42" y="18" width="28" height="12" class="a" opacity=".55"/><path d="M14 20h18M80 20h18M14 26h12M86 26h12" class="al"/><circle cx="56" cy="24" r="3" class="a"/>'};
 function interior(t){return '<svg class="b601-int" viewBox="0 0 112 64" preserveAspectRatio="none" aria-hidden="true"><rect width="112" height="64" class="w"/><path d="M0 10h112" class="l"/><path d="M0 0h112v6H0z" class="c"/><path d="M30 3h52" class="g"/><path d="M28 10v38M56 10v38M84 10v38" class="p"/><path d="M0 48h112v16H0z" class="f"/><path d="M0 48h112" class="fl"/><path d="M8 64L18 48M40 64l4-16M72 64l-4-16M104 64L94 48" class="p"/>'+(props[t]||props.template)+'</svg>'}
 function roomHTML(s,r,box){const E=FrontierBaseEngine,L=look(r.kind),seats=r.kind==='hub'||E.types[r.kind]?.kind==='none'?0:Math.min(5,E.seats(r)||0),ready=Object.values(r.pending||{}).some(n=>n>0)||r.income>0,name=E.types[r.kind]?.name||r.kind;
  return '<button type="button" class="b601-room b601-t-'+L.t+(r.kind==='hub'?' b601-hub':'')+'" data-room601="'+esc(r.id)+'" aria-label="'+esc(name)+' 等級 '+r.level+'" style="--rc:'+L.c+';left:'+box.x*U+'px;top:'+box.y*U+'px;width:'+box.w*U+'px;height:'+box.h*U+'px"><span class="b601-frame">'+interior(L.t)+'</span><small class="b601-en">'+L.en+'</small><span class="b601-head"><span class="b601-ico">'+ico[L.t]+'</span><b class="b601-name">'+esc(name)+'</b></span>'+bars(r.level)+(seats?'<span class="b601-staff">'+Array.from({length:seats},(_,i)=>'<i class="'+(i<r.staff.length?'on':'')+'"></i>').join('')+'</span>':'')+(ready?'<em class="b601-ready" aria-label="可收取"></em>':'')+'</button>'}
 /* 名稱過長時縮小字級而非截斷為「…」。 */
 function fit(root){for(const b of root.querySelectorAll('.b601-room:not(.b601-hub) .b601-name')){let f=parseFloat(getComputedStyle(b).fontSize);const max=b.parentElement.clientWidth-b.previousElementSibling.offsetWidth-6;while(b.scrollWidth>max&&f>8){f-=.5;b.style.fontSize=f+'px'}}}
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
