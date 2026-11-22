'use strict';
/* 遠征探索底部列（手機優先）：
   順序 背包｜收藏品｜編隊｜詞條｜招募券｜紀錄；編隊／收藏品／招募券改為從底部列上方展開的區塊，不再彈窗。
   只改畫面，所有存檔變更都經由既有的 FrontierRecruitUI144.command（含驗證與交易保護）。 */
window.FrontierFieldDock=(()=>{
 const order=['bag','curio','team','module','ticket','info'];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const units=()=>FrontierCapture.units,g=()=>R()?.recruitment144;
 const lock='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
 let sheet=null,synth=false,curioFocus=null;const picked=new Set();
 const exploring=()=>page==='run'&&R()&&!R().result&&!R().battle;

 function key(b){
  if(b.dataset.fdKey)return b.dataset.fdKey;
  const t=b.textContent.trim();
  if(b.hasAttribute('data-recruit152-open'))return 'ticket';
  if(b.hasAttribute('data-open-gear139'))return 'module';
  if(b.classList.contains('curio-entry'))return 'curio';
  if(/^背包/.test(t))return 'bag';
  if(/^補給/.test(t))return 'team';
  if(/^紀錄/.test(t))return 'info';
  return null;
 }
 function portrait(u){return window.FrontierAppearance80?.src(u.id,'portrait',u.form)||'assets/'+units()[u.id].image+'.png'}

 function decorate(){
  const dock=document.querySelector('.screen-combat-actions');
  if(!dock||!exploring()||![...dock.children].some(b=>/^紀錄/.test(b.textContent.trim()))){if(!exploring())close(true);return}
  const st=g(),buttons=[...dock.children].filter(b=>b.matches('button'));
  for(const b of buttons){
   const k=key(b);if(!k)continue;b.dataset.fdKey=k;
   if(k==='team'){if(!st){continue}b.textContent='編隊';b.removeAttribute('onclick');b.onclick=()=>toggle('team')}
   if(k==='module')b.textContent='詞條 '+(R().equipment139?.modules?.length||0);
   if(k==='curio'){b.textContent='收藏品 '+(R().curios?.owned?.length||0);b.removeAttribute('onclick');b.onclick=()=>toggle('curio')}
   if(k==='ticket'&&st){b.innerHTML='招募券 <small>'+st.tickets.filter(t=>!t.used).length+'/'+st.fragments.length+'</small>';b.onclick=()=>toggle('ticket')}
   b.setAttribute('aria-expanded',String(sheet===k));
  }
  for(const k of order){const b=buttons.find(x=>x.dataset.fdKey===k);if(b)dock.append(b)}
  dock.classList.add('fd-dock');
  mount(dock);
 }

 function toggle(k){sheet=sheet===k?null:k;synth=false;picked.clear();curioFocus=null;decorate();if(!sheet)document.querySelector('.fd-sheet')?.remove()}
 function close(silent){sheet=null;synth=false;picked.clear();document.querySelector('.fd-sheet')?.remove();if(!silent)decorate()}

 function mount(dock){
  document.querySelector('.fd-sheet')?.remove();
  if(!sheet)return;
  const host=document.createElement('section');host.className='fd-sheet fd-sheet-'+sheet;host.setAttribute('role','region');
  host.innerHTML=sheet==='team'?teamView():sheet==='curio'?curioView():ticketView();
  host.style.bottom=Math.round(window.innerHeight-dock.getBoundingClientRect().top)+'px';
  document.body.append(host);bind(host);
 }

 /* ---------- 編隊：左 5 出戰、右 3 候補，下方全部幹員可左右滑動，拖曳到區塊 ---------- */
 function teamView(){
  const st=g();if(!st)return '<p class="fd-empty">此模式沒有招募編制。</p>';
  const cap=FrontierExpeditionRecruit144.capacity(st),active=st.roster.filter(u=>u.active),reserve=st.roster.filter(u=>!u.active),canEdit=FrontierRecruitUI144.safe();
  const slot=(list,i,limit,zone)=>{if(i>=limit)return '<span class="fd-slot fd-locked" aria-label="尚未解鎖">'+lock+'</span>';const u=list[i];return '<span class="fd-slot" data-fd-zone="'+zone+'">'+(u?'<img src="'+esc(portrait(u))+'" alt="'+esc(units()[u.id].name)+'" data-fd-op="'+u.id+'" draggable="false"><i>E'+u.elite+'</i>':'')+'</span>'};
  return '<div class="fd-team-zones"><div class="fd-zone" data-fd-zone="active"><b>出戰 '+active.length+'/'+cap.active+'</b><div class="fd-slots">'+[0,1,2,3,4].map(i=>slot(active,i,cap.active,'active')).join('')+'</div></div><div class="fd-zone fd-zone-reserve" data-fd-zone="reserve"><b>候補 '+reserve.length+'/'+cap.reserve+'</b><div class="fd-slots">'+[0,1,2].map(i=>slot(reserve,i,cap.reserve,'reserve')).join('')+'</div></div></div>'+
   '<p class="fd-hint">'+(canEdit?'拖曳頭像到出戰或候補；點一下也可切換。':'僅能在出發時、安全角落或層間整備調整編隊。')+'</p>'+
   '<div class="fd-roster" aria-label="全部幹員，可左右滑動">'+(st.roster.length?st.roster.map(u=>'<button type="button" class="fd-op '+(u.active?'is-active':'is-reserve')+'" data-fd-op="'+u.id+'" '+(canEdit?'':'disabled')+'><img src="'+esc(portrait(u))+'" alt="" draggable="false"><span>'+esc(units()[u.id].name)+'</span></button>').join(''):'<p class="fd-empty">尚未招募幹員，請使用招募券。</p>')+'</div>';
 }
 function setFormation(id,zone){
  const st=g(),cap=FrontierExpeditionRecruit144.capacity(st);let ids=st.roster.filter(u=>u.active).map(u=>u.id);
  const isActive=ids.includes(id);
  if(zone==='active'&&!isActive){if(ids.length>=cap.active){toast('出戰已滿 '+cap.active+' 人。');return}ids=[...ids,id]}
  else if(zone==='reserve'&&isActive){if(ids.length<=1){toast('至少需要一名出戰幹員。');return}if(st.roster.length-ids.length>=cap.reserve){toast('候補已滿 '+cap.reserve+' 人。');return}ids=ids.filter(x=>x!==id)}
  else return;
  FrontierRecruitUI144.command('formation',{active:ids});
 }
 let drag=null;
 function bind(host){
  host.querySelector('[data-fd-close]')?.addEventListener('click',()=>close());
  if(sheet==='team'){
   host.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-fd-op]');if(!el||el.disabled||!FrontierRecruitUI144.safe())return;drag={id:el.dataset.fdOp,x:e.clientX,y:e.clientY,pointer:e.pointerId,ghost:null,src:el}});
   host.addEventListener('click',e=>{const el=e.target.closest('button[data-fd-op]');if(!el||drag?.moved)return;const u=g().roster.find(x=>x.id===el.dataset.fdOp);if(u)setFormation(u.id,u.active?'reserve':'active')});
  }
  if(sheet==='curio')host.addEventListener('click',e=>{const el=e.target.closest('[data-fd-curio]');if(!el)return;curioFocus=curioFocus===el.dataset.fdCurio?null:el.dataset.fdCurio;mount(document.querySelector('.screen-combat-actions'))});
  if(sheet==='ticket')host.addEventListener('click',onTicket);
 }
 window.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.ghost){if(Math.abs(dy)<16)return;drag.moved=true;const img=drag.src.querySelector('img')||drag.src;drag.ghost=img.cloneNode(true);drag.ghost.className='fd-ghost';document.body.append(drag.ghost)}
  e.preventDefault();drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';
  for(const z of document.querySelectorAll('.fd-zone'))z.classList.toggle('fd-over',z.contains(document.elementFromPoint(e.clientX,e.clientY)));
 },{passive:false});
 window.addEventListener('pointerup',e=>{if(!drag||drag.pointer!==e.pointerId)return;const d=drag;setTimeout(()=>{if(drag===d)drag=null},0);if(!d.ghost)return;d.ghost.remove();document.querySelectorAll('.fd-over').forEach(z=>z.classList.remove('fd-over'));const zone=document.elementFromPoint(e.clientX,e.clientY)?.closest('.fd-zone');if(zone)setFormation(d.id,zone.dataset.fdZone)});
 window.addEventListener('pointercancel',()=>{drag?.ghost?.remove();drag=null});

 /* ---------- 收藏品：約畫面 1/3 高，列出已持有 ---------- */
 function curioView(){
  const owned=R().curios?.owned||[],D=FrontierCurioData.entries,f=curioFocus&&D[curioFocus];
  return (f?'<div class="fd-curio-detail"><b>'+esc(f.name)+'</b><p>'+esc(f.effect||'')+'</p></div>':'')+
   (owned.length?'<div class="fd-curio-grid">'+owned.map(o=>{const d=D[o.id];return d?'<button type="button" data-fd-curio="'+o.id+'" aria-pressed="'+(curioFocus===o.id)+'">'+FrontierCurios.icon(o.id)+'<span>'+esc(d.name)+'</span></button>':''}).join('')+'</div>':'<p class="fd-empty">本局尚未取得收藏品。</p>');
 }

 /* ---------- 招募券：左完整券（點擊直接招募）、右殘頁，最右合成 ---------- */
 function ticketView(){
  const st=g();if(!st)return '<p class="fd-empty">此模式沒有招募券。</p>';
  const tickets=st.tickets.filter(t=>!t.used),frags=st.fragments,ok=[2,3].includes(picked.size);
  return '<div class="fd-ticket-layout"><div class="fd-ticket-col"><b>完整券 '+tickets.length+'</b><div class="fd-ticket-list">'+(tickets.map(t=>'<button type="button" data-fd-ticket="'+t.id+'" '+(synth?'disabled':'')+'>'+FrontierRecruit152.art(t)+'<span>'+esc(t.name||(t.kind==='universal'?'通用招募券':'三職招募券'))+'</span></button>').join('')||'<p class="fd-empty">無</p>')+'</div></div>'+
   '<div class="fd-ticket-col"><b>殘頁 '+frags.length+(synth?' · 已選 '+picked.size:'')+'</b><div class="fd-ticket-list">'+(frags.map(f=>'<button type="button" class="fd-frag" data-fd-frag="'+f.id+'" aria-pressed="'+picked.has(f.id)+'" '+(synth?'':'tabindex="-1"')+'>'+FrontierRecruit152.art(f,true)+'</button>').join('')||'<p class="fd-empty">無</p>')+'</div></div>'+
   '<div class="fd-synth">'+(synth?'<button type="button" class="primary" data-fd-synth-confirm '+(ok?'':'disabled')+'>確認<br>合成</button><button type="button" data-fd-synth-cancel>取消</button>':'<button type="button" data-fd-synth '+(frags.length<2||R().battle?'disabled':'')+'>合成</button>')+'</div></div>'+
   '<p class="fd-hint">'+(synth?'勾選 2 張殘頁合成三職券，3 張合成通用券。':'點擊完整券直接招募或晉升。')+'</p>';
 }
 async function onTicket(e){
  const t=e.target.closest('[data-fd-ticket]');if(t&&!synth){close(true);decorate();FrontierRecruitUI144.ticket(t.dataset.fdTicket);return}
  if(e.target.closest('[data-fd-synth]')){synth=true;picked.clear();return redraw()}
  if(e.target.closest('[data-fd-synth-cancel]')){synth=false;picked.clear();return redraw()}
  const f=e.target.closest('[data-fd-frag]');if(f&&synth){const id=f.dataset.fdFrag;if(picked.has(id))picked.delete(id);else if(picked.size<3)picked.add(id);else toast('每次最多選三張殘頁。');return redraw()}
  if(e.target.closest('[data-fd-synth-confirm]')){const ids=[...picked];if(![2,3].includes(ids.length))return;const ok=await FrontierRecruitUI144.command('synthesize',{kind:ids.length===2?'triple':'universal',fragments:ids});if(ok){synth=false;picked.clear();toast(ids.length===2?'已合成三職招募券。':'已合成通用招募券。')}redraw()}
 }
 function redraw(){const dock=document.querySelector('.screen-combat-actions');if(dock)decorate()}

 /* 背包：移除縮放百分比與 −／＋，改放「編輯幹員背包」；預設自動縮放到剛好塞滿寬度（仍可雙指縮放）。 */
 if(window.FrontierBagUX?.create){const create=FrontierBagUX.create;FrontierBagUX.create=function(...args){const host=create(...args);
  const zoom=host.querySelector('.bag-zoom-controls30');
  if(zoom){const b=document.createElement('button');b.type='button';b.className='fd-pack-edit';b.textContent='編輯幹員背包';b.onclick=()=>FrontierPack.open();zoom.replaceWith(b)}
  const hint=host.querySelector('.bag-ux-hint');if(hint)hint.textContent='雙指縮放 · 空白處移動 · 長按查看 · 拖近保險箱存入';
  const fit=()=>{if(!host.isConnected)return;FrontierViewZoom.change('bag','fit');
   // 保險箱只有 2×2～3×3，維持原尺寸（不跟著聯合背包縮小），太寬時才縮到剛好。
   const safe=host.querySelector('.bag-ux-safe'),stage=safe?.querySelector('.bag-canvas-stage31'),canvas=stage?.firstElementChild;
   if(canvas){const z=Math.min(1,(safe.clientWidth-4)/Math.max(1,canvas.offsetWidth));canvas.style.transform='scale('+z+')';stage.style.width=canvas.offsetWidth*z+'px';stage.style.height=canvas.offsetHeight*z+'px'}};requestAnimationFrame(()=>requestAnimationFrame(fit));
  return host}}
 const prior=render;render=function(...args){const out=prior(...args);try{decorate()}catch(error){console.error(error)}return out};
 window.addEventListener('resize',()=>{if(sheet)redraw()});
 return{toggle,close,decorate,get sheet(){return sheet}};
})();
