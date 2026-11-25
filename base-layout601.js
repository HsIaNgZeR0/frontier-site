'use strict';
/* 基建佈局 v601：本家風格長方形房間、指揮中樞 2×2、自由拖動擺放（存於 db.baseLayout601）。 */
window.FrontierBaseLayout601=(()=>{
 if(!document.querySelector('link[data-b601]')){const l=document.createElement('link');l.rel='stylesheet';l.href='base-layout601.css?v=601m';l.dataset.b601='';document.head.appendChild(l)}
 /* 底板 6×10 房間單位（每單位 RW×RH 小格），移動一律以整間房為單位。 */
 const U=16,RW=7,RH=4,COLS=RW*6,ROWS=RH*10,LV=2;
 const aligned=p=>p.x%RW===0&&p.y%RH===0;
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
  feed:{c:'#9fc482',en:'FEED EXCHANGE',t:'power'},
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
  for(const r of rooms){let p=saved[r.id];if(p){p={x:Math.round(p.x/RW)*RW,y:Math.round(p.y/RH)*RH};const box={...p,...size(r.kind)};if(inside(box)&&!placed.some(b=>overlap(b,box)))put(r,p)}}
  const order=rooms.filter(r=>!out[r.id]).sort((a,b)=>(a.kind==='hub'?-1:0)-(b.kind==='hub'?-1:0)||a.y-b.y||a.x-b.x);
  for(const r of order){const sz=size(r.kind);let spot=null;for(let y=0;y+sz.h<=ROWS&&!spot;y+=RH)for(let x=0;x+sz.w<=COLS;x+=RW){const box={x,y,...sz};if(!placed.some(b=>overlap(b,box))){spot={x,y};break}}
   if(spot)put(r,spot)}
  return out}
 function valid(s){const l=s?.baseLayout601;if(l==null)return true;if(typeof l!=='object'||Array.isArray(l)||![1,LV].includes(l.v)||!l.rooms||typeof l.rooms!=='object'||Array.isArray(l.rooms))return false;const keys=Object.keys(l);if(keys.some(k=>!['v','rooms'].includes(k)))return false;const ids=Object.keys(l.rooms);if(ids.length>64)return false;const boxes=[];
  for(const id of ids){const p=l.rooms[id];if(id.length>80||!p||typeof p!=='object'||Object.keys(p).some(k=>!['x','y'].includes(k))||!Number.isInteger(p.x)||!Number.isInteger(p.y))return false;if(l.v!==LV)continue;const box={x:p.x,y:p.y,...size(kindOf(s,id))};if(box.x<0||box.y<0||box.x+box.w>COLS||box.y+box.h>ROWS||boxes.some(b=>overlap(b,box)))return false;boxes.push(box)}return true}
 const prior=validSave;validSave=function(s){return prior(s)&&valid(s)};
 const bars=n=>'<span class="b601-lv" aria-label="等級 '+n+'">'+Array.from({length:n},()=>'<i></i>').join('')+'</span>';
 /* 本家總覽房塊：左側色條（生產類）、名稱＋白色直槓、狀態列、右下人數、底部分段條、六角形浮水印。 */
 const prodKinds={factory:'生產中',cFactory:'生產中',trade:'獲取中',cTrade:'獲取中',supply:'補給中',cSupply:'補給中',feed:'準備許可'};
 const hex='<svg class="b601-hex" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 2l17 10v22L20 44 3 34V12z" fill="none" stroke="currentColor" stroke-width="3"/></svg>';
 const person='<svg viewBox="0 0 8 14" aria-hidden="true"><circle cx="4" cy="2.3" r="2.1"/><path d="M1 5.5h6v5H5.5V14h-3v-3.5H1z"/></svg>';
 function roomHTML(s,r,box){const E=FrontierBaseEngine,L=look(r.kind),seats=r.kind==='hub'||E.types[r.kind]?.kind==='none'?0:E.seats(r)||0,ready=Object.values(r.pending||{}).some(n=>n>0)||r.income>0,name=E.types[r.kind]?.name||r.kind,prod=prodKinds[r.kind];
  const style='--rc:'+L.c+';left:'+box.x*U+'px;top:'+box.y*U+'px;width:'+box.w*U+'px;height:'+box.h*U+'px';
  if(r.kind==='hub')return '<button type="button" class="b601-room b601-hub" data-room601="'+esc(r.id)+'" aria-label="'+esc(name)+' 等級 '+r.level+'" style="'+style+'"><span class="b601-frame"><span class="b601-tree"></span><span class="b601-hubtitle"><b class="b601-name">'+esc(name)+'</b><small>LEVEL OF CONTROL_INTERFACE</small><span class="b601-ver"><i class="b601-verhatch"></i><small>VER</small><strong>'+r.level+'.0</strong></span></span></span>'+(ready?'<em class="b601-ready"></em>':'')+'</button>';
  const status=r.kind==='feed'?'許可 '+E.feedOptions(r).length+'/'+E.feedCapacity(r.level):ready?'可收取':prod?(prod+' ▸▸▸'):(r.staff.length?'工作中':'空閒中');
  return '<button type="button" class="b601-room'+(prod?' b601-prod':'')+'" data-room601="'+esc(r.id)+'" aria-label="'+esc(name)+' 等級 '+r.level+'" style="'+style+'"><span class="b601-frame"><span class="b601-mark">'+hex+'<span class="b601-ico">'+ico[L.t]+'</span></span><span class="b601-bar"></span><span class="b601-head"><b class="b601-name">'+esc(name)+'</b>'+bars(r.level)+'</span><small class="b601-status'+(ready?' is-ready':'')+'">'+status+'</small>'+(seats?'<span class="b601-count">'+person+'<b>'+r.staff.length+'</b><small>/'+seats+'</small></span>':'')+'<span class="b601-seg">'+'<i></i>'.repeat(5)+'</span></span></button>'}
 /* 名稱過長時縮小字級而非截斷為「…」。 */
 function fit(root){const els=[...root.querySelectorAll('.b601-room:not(.b601-hub) .b601-name,.b601-status')],m=els.map(b=>[b.scrollWidth,b.clientWidth,parseFloat(getComputedStyle(b).fontSize)]);els.forEach((b,i)=>{const[sw,cw,f]=m[i];if(sw>cw+.5&&cw>0)b.style.fontSize=Math.max(5,Math.floor(f*cw/sw*2)/2)+'px'})}
 function board(){const s=FrontierBase151.preview?.()||db,lay=resolve(s);return '<div class="b601-board" style="width:'+COLS*U+'px;height:'+ROWS*U+'px">'+(s.base151.rooms||[]).filter(r=>lay[r.id]).map(r=>roomHTML(s,r,lay[r.id])).join('')+'</div>'}
 function decorate(){const old=document.querySelector('.base151-board');if(!old||!db.base151||!FrontierBaseEngine.modern(db))return;old.classList.add('b601-host');old.innerHTML=board();fit(old);const hint=[...document.querySelectorAll('.base151-shell .tiny')].find(p=>p.textContent.includes('拖動'));if(hint)hint.textContent='雙指縮放 · 長按拖動房間 · 點按管理';const intro=[...document.querySelectorAll('.base151-shell>.tiny')].find(p=>p.textContent.includes('無人派駐'));if(intro)intro.textContent='無人也會生產，派駐可加速；離線時間照常結算，沒有每日上限。';const list=document.querySelector('.base151-room-list');if(list){list.classList.add('b601-list');list.innerHTML=listHTML()}}
 document.addEventListener('click',e=>{const el=e.target.closest?.('[data-row601]');if(el)FrontierBase151.room(el.dataset.row601)});
 /* 底部房間清單：每列「色塊＋名稱＋等級直槓｜一句重點｜右側關鍵數字」，生產類附進度條。 */
 const hm=ms=>{const m=Math.max(0,Math.ceil(ms/60000));return m>=60?Math.floor(m/60)+'時'+(m%60?m%60+'分':''):m+'分'};
 function info(s,r){const E=FrontierBaseEngine,c={definitions:FrontierInventory.definitions,recipes:FrontierInventory.recipes,units:FrontierCapture.units},p=E.recipe(r),pend=Object.values(r.pending||{}).reduce((n,x)=>n+x,0),staff=E.types[r.kind]?.kind==='none'?'':'派駐 '+r.staff.length+'/'+E.seats(r);
  if(['trade','cTrade'].includes(r.kind))return{line:'訂單 '+r.orders.length+'/32'+(staff?' · '+staff:''),value:r.income?r.income.toLocaleString():'0',unit:'待領',ready:r.income>0,pct:p?Math.min(1,r.work/p.time):null};
  if(r.kind==='feed'){const count=E.feedOptions(r).length,cap=E.feedCapacity(r.level);return{line:(count>=cap?'許可已滿':'下張約 '+hm(Math.max(0,p.time-r.work)/E.rate(s,r,c)))+(staff?' · '+staff:''),value:count+'/'+cap,unit:'許可',ready:false,pct:count>=cap?null:Math.min(1,r.work/p.time)}}
  if(r.kind==='commission'){const q=s.base151.special_commissions;return{line:q.active.length>=4?'欄位已滿，請先領取':'下張約 '+(p?hm(Math.max(0,p.time-r.work)/(E.rate(s,r,c)||1)):'—')+(staff?' · '+staff:''),value:q.active.length+'/4',unit:'委託',ready:false,pct:p?Math.min(1,r.work/p.time):null}}
  if(p){const rate=E.rate(s,r,c)||1;return{line:'下次 '+hm(Math.max(0,p.time-r.work)/rate)+(staff?' · '+staff:''),value:String(pend),unit:'待領',ready:pend>0,pct:Math.min(1,r.work/p.time)}}
  if(r.kind==='personnel')return{line:'增加公開招募欄位',value:E.publicSlots(s)+'/4',unit:'招募欄',ready:false,pct:null};
  if(r.kind==='dispatch')return{line:'提供外派隊位'+(staff?' · '+staff:''),value:String([1,1,2,2,3][r.level-1]),unit:'隊位',ready:false,pct:null};
  if(r.kind==='logistics')return{line:'白／綠／藍素材同階交換',value:'',unit:'',ready:false,pct:null};
  if(r.kind==='workshop')return{line:'即時加工，無需派駐',value:'',unit:'',ready:false,pct:null};
  if(r.kind==='hub')return{line:'可建 '+s.base151.rooms.length+'/'+E.capacity[r.level-1]+' 間',value:'',unit:'',ready:false,pct:null};
  return{line:staff||'待命',value:'',unit:'',ready:false,pct:null}}
 /* 派駐幹員與加成：與引擎 rate() 相同算法（同種收容個體減半、出戰中不計、上限 20%）。 */
 function staffInfo(s,r){const E=FrontierBaseEngine,c={definitions:FrontierInventory.definitions,recipes:FrontierInventory.recipes,units:FrontierCapture.units},seen=new Set();let sum=0;const chips=r.staff.map(uid=>{const e=E.entity(s,uid,c);if(!e)return null;const name=c.units[e.id]?.name||e.name||e.id;if(E.occupied(s,uid))return{id:e.id,kind:e.kind,name,pct:0,note:'出戰中'};let v=E.staffBonus(e,r)*(e.kind==='enemy'&&seen.has(e.species)?.5:1);seen.add(e.species);sum+=v;return{id:e.id,kind:e.kind,name,pct:v}}).filter(Boolean);return{chips,total:Math.min(.2,sum),capped:sum>.2}}
 const face=x=>{const d=FrontierCapture.units[x.id],src=x.kind==='operator'&&window.FrontierAppearance80?.src?.(x.id,'portrait')||(d?.image?'assets/'+d.image+'.png':'');return src?'<img class="b601-face" src="'+esc(src)+'" alt="'+esc(x.name)+'" loading="lazy" data-inspect-actor="'+esc(x.id)+'">':'<span class="b601-face b601-face-fb">'+esc(String(x.name).slice(0,1))+'</span>'};
 const pctTxt=v=>'+'+Math.round(v*1000)/10+'%';
 function staffHTML(s,r){if(FrontierBaseEngine.types[r.kind]?.kind==='none')return '';const st=staffInfo(s,r);if(!st.chips.length)return '<span class="b601-staffline is-empty">未派駐（0/'+FrontierBaseEngine.seats(r)+'）· 派駐可提高效率</span>';return '<span class="b601-staffline">'+st.chips.map(x=>'<span class="b601-chip'+(x.note?' is-off':'')+(x.kind==='enemy'?' is-enemy':'')+'" title="'+esc(x.name)+'">'+face(x)+'<em>'+(x.note||pctTxt(x.pct))+'</em></span>').join('')+'<span class="b601-total">'+r.staff.length+'/'+FrontierBaseEngine.seats(r)+' · 總加成 '+pctTxt(st.total)+(st.capped?'（上限）':'')+'</span></span>'}
 /* 同類房間合併成一列（數量、合計待領、最快完成），點開才列出各間。 */
 const order=['factory','trade','supply','cFactory','cTrade','cSupply','feed','commission','dispatch','personnel','workshop','logistics'],open=new Set();
 function rowHTML(s,r,sub){const E=FrontierBaseEngine,L=look(r.kind),i=info(s,r);return '<button type="button" class="b601-row'+(sub?' b601-sub':'')+(i.ready?' is-ready':'')+'" data-row601="'+esc(r.id)+'" style="--rc:'+L.c+'">'+(sub?'':'<span class="b601-row-ico">'+ico[L.t]+'</span>')+'<span class="b601-row-main"><span class="b601-row-title"><b>'+(sub?'第'+sub+'間':esc(E.types[r.kind]?.name||r.kind))+'</b>'+bars(r.level)+'</span><small>'+esc(FrontierBaseEngine.types[r.kind]?.kind==='none'?i.line:i.line.replace(/ · 派駐 \d+\/\d+/,'').replace(/^派駐 \d+\/\d+$/,''))+'</small>'+staffHTML(s,r)+(i.pct!=null?'<span class="b601-row-prog"><i style="width:'+Math.round(i.pct*100)+'%"></i></span>':'')+'</span>'+(i.value?'<span class="b601-row-val"><small>'+i.unit+'</small><b>'+esc(i.value)+'</b></span>':'')+'</button>'}
 function groupHTML(s,kind,rooms){const E=FrontierBaseEngine,L=look(kind),infos=rooms.map(r=>info(s,r)),ready=infos.some(i=>i.ready),staff=E.types[kind]?.kind==='none'?'':'派駐 '+rooms.reduce((n,r)=>n+r.staff.length,0)+'/'+rooms.reduce((n,r)=>n+E.seats(r),0),nums=infos.map(i=>Number(String(i.value).replace(/,/g,''))).filter(Number.isFinite),total=nums.reduce((a,b)=>a+b,0),pcts=infos.map(i=>i.pct).filter(x=>x!=null),best=pcts.length?Math.max(...pcts):null,is=open.has(kind);
  const avg=staff?rooms.reduce((n,r)=>n+staffInfo(s,r).total,0)/rooms.length:0,line=rooms.length+' 間 · Lv '+rooms.map(r=>r.level).join('／')+(staff?' · '+staff+' · 平均加成 '+pctTxt(avg):'');
  return '<div class="b601-group'+(is?' is-open':'')+'" style="--rc:'+L.c+'"><button type="button" class="b601-row b601-ghead'+(ready?' is-ready':'')+'" data-group601="'+kind+'" aria-expanded="'+is+'"><span class="b601-row-ico">'+ico[L.t]+'</span><span class="b601-row-main"><span class="b601-row-title"><b>'+esc(E.types[kind]?.name||kind)+'</b><em class="b601-count-tag">×'+rooms.length+'</em></span><small>'+esc(line)+'</small>'+(best!=null?'<span class="b601-row-prog"><i style="width:'+Math.round(best*100)+'%"></i></span>':'')+'</span>'+(infos[0].unit?'<span class="b601-row-val"><small>'+infos[0].unit+(nums.length>1?'合計':'')+'</small><b>'+total.toLocaleString()+'</b></span>':'')+'<span class="b601-chev" aria-hidden="true">▾</span></button>'+(is?'<div class="b601-gbody">'+rooms.map((r,k)=>rowHTML(s,r,k+1)).join('')+'</div>':'')+'</div>'}
 function listHTML(){const s=FrontierBase151.preview?.()||db,E=FrontierBaseEngine,rooms=s.base151.rooms.filter(r=>r.kind!=='medical'&&r.kind!=='hub'&&!E.types[r.kind]?.retired),kinds=[...new Set(rooms.map(r=>r.kind))].sort((a,b)=>(order.indexOf(a)+99)%99-(order.indexOf(b)+99)%99);
  return kinds.map(k=>{const g=rooms.filter(r=>r.kind===k);return g.length>1?groupHTML(s,k,g):rowHTML(s,g[0],0)}).join('')}
 document.addEventListener('click',e=>{const g=e.target.closest?.('[data-group601]');if(!g)return;const k=g.dataset.group601;open.has(k)?open.delete(k):open.add(k);const list=document.querySelector('.b601-list');if(list)list.innerHTML=listHTML()});
 const prevView=window.baseView;window.baseView=function(){const out=prevView.apply(this,arguments);try{decorate()}catch(e){console.error(e)}return out};
 /* 拖動：滑鼠立即拖動；觸控長按 350ms 後才進入拖動，期間以 touchmove 阻止頁面捲動。 */
 let drag=null,suppressClick=0;
 const blockTouch=e=>{if(drag?.active&&e.cancelable)e.preventDefault()};
 document.addEventListener('touchmove',blockTouch,{passive:false,capture:true});
 const clearSwap=()=>document.querySelectorAll('.b601-swap').forEach(x=>x.classList.remove('b601-swap'));
 function end(){if(!drag)return;clearTimeout(drag.timer);clearSwap();drag.el.classList.remove('b601-lift','b601-bad');drag.el.style.transform='';drag=null}
 document.addEventListener('pointerdown',e=>{const el=e.target.closest?.('[data-room601]');if(!el||e.button>0)return;const b=el.closest('.b601-board');if(!b)return;drag={el,b,id:el.dataset.room601,pid:e.pointerId,sx:e.clientX,sy:e.clientY,active:false,t0:e.timeStamp,touch:e.pointerType!=='mouse'};
  if(drag.touch)drag.timer=setTimeout(()=>{if(drag){drag.active=true;el.classList.add('b601-lift');navigator.vibrate?.(15)}},350)},true);
 document.addEventListener('pointermove',e=>{const d=drag;if(!d||e.pointerId!==d.pid)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;
  if(!d.active){if(d.touch&&e.timeStamp-d.t0>=350){clearTimeout(d.timer);d.active=true;d.el.classList.add('b601-lift')}else{if(Math.hypot(dx,dy)<8)return;if(d.touch){end();return}d.active=true}d.el.classList.add('b601-lift')}
  e.preventDefault();e.stopImmediatePropagation();const scale=d.b.getBoundingClientRect().width/d.b.offsetWidth||1;d.el.style.transform='translate('+dx/scale+'px,'+dy/scale+'px)';const t=target(d,dx/scale,dy/scale);d.el.classList.toggle('b601-bad',!t.ok);clearSwap();for(const id of Object.keys(t.swap||{}))d.b.querySelector('[data-room601="'+CSS.escape(id)+'"]')?.classList.add('b601-swap')},{capture:true,passive:false});
 /* 以整間房為單位吸附；落點上的房間若完全落在新位置內，且平移到原位不衝突，即互換位置。 */
 function target(d,dx,dy){const s=db,lay=resolve(s),me=lay[d.id];if(!me)return{ok:false};const box={...me,x:Math.round((me.x*U+dx)/(U*RW))*RW,y:Math.round((me.y*U+dy)/(U*RH))*RH};box.x=Math.max(0,Math.min(COLS-box.w,box.x));box.y=Math.max(0,Math.min(ROWS-box.h,box.y));
  if(box.x===me.x&&box.y===me.y)return{box,lay,ok:false,same:true};
  const hit=Object.values(lay).filter(b=>b.id!==d.id&&overlap(b,box));if(!hit.length)return{box,lay,ok:true};
  if(overlap(me,box)||hit.some(b=>b.x<box.x||b.y<box.y||b.x+b.w>box.x+box.w||b.y+b.h>box.y+box.h))return{box,lay,ok:false};
  const ox=me.x-box.x,oy=me.y-box.y,swap={};for(const b of hit)swap[b.id]={x:b.x+ox,y:b.y+oy};
  const rest=Object.values(lay).filter(b=>b.id!==d.id&&!swap[b.id]);
  for(const b of hit){const nb={...b,...swap[b.id]};if(!inside(nb)||rest.some(o=>overlap(o,nb)))return{box,lay,ok:false}}
  return{box,lay,ok:true,swap}}
 document.addEventListener('pointerup',e=>{const d=drag;if(!d||e.pointerId!==d.pid)return;if(!d.active){end();return}e.preventDefault();e.stopImmediatePropagation();suppressClick=performance.now()+500;const scale=d.b.getBoundingClientRect().width/d.b.offsetWidth||1,t=target(d,(e.clientX-d.sx)/scale,(e.clientY-d.sy)/scale),id=d.id;end();if(t.same)return;if(!t.ok){toast('無法放在這裡：房間大小不合，無法互換。');return}move(id,t.box.x,t.box.y,t.lay,t.swap)},{capture:true,passive:false});
 document.addEventListener('pointercancel',e=>{if(drag&&!drag.active)end();else if(drag&&e.pointerId===drag.pid)end()},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest?.('[data-room601]'))e.preventDefault()},true);
 document.addEventListener('click',e=>{const el=e.target.closest?.('[data-room601]');if(!el)return;if(performance.now()<suppressClick){e.preventDefault();e.stopImmediatePropagation();return}FrontierBase151.room(el.dataset.room601)});
 async function move(id,x,y,lay,swap){lay=lay||resolve(db);swap=swap||{};const me=lay[id];if(!me)return false;const box={...me,x,y};if(!inside(box)||!aligned(box)||Object.values(lay).some(b=>b.id!==id&&!swap[b.id]&&overlap(b,box)))return false;
  return FrontierRuntime.perform('base-layout601',()=>{const cur=resolve(db),rooms={};for(const [k,b]of Object.entries(cur))rooms[k]={x:b.x,y:b.y};Object.assign(rooms,swap);rooms[id]={x,y};db.baseLayout601={v:LV,rooms};if(typeof render==='function')render()})}
 /* 在彈窗標題列（房間名稱右側）插入動作按鈕；screen 版標題會跳脫 HTML，所以開窗後再插入。 */
 function titleAction(html){const m=document.querySelector('#modal');if(!m)return;const head=m.querySelector('.screen-tool-head')||m.querySelector('h2');if(!head)return;head.classList.add('b601-mtitle');const w=document.createElement('span');w.className='b601-mtitle-act';w.innerHTML=html;const title=head.matches('h2')?null:head.querySelector(':scope>b');if(title)title.after(w);else head.append(w)}
 return {titleAction,resolve,valid,move,board,U,COLS,ROWS};
})();
