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
  const cap=FrontierExpeditionRecruit144.capacity(st),active=st.roster.filter(u=>u.active),reserve=st.roster.filter(u=>!u.active),canEdit=!R().battle;
  const slot=(list,i,limit,zone)=>{if(i>=limit)return '<span class="fd-slot fd-locked" aria-label="尚未解鎖">'+lock+'</span>';const u=list[i];return '<span class="fd-slot" data-fd-zone="'+zone+'">'+(u?'<img src="'+esc(portrait(u))+'" alt="'+esc(units()[u.id].name)+'" data-fd-op="'+u.id+'" draggable="false"><i>E'+u.elite+'</i>':'')+'</span>'};
  return '<div class="fd-team-zones"><div class="fd-zone" data-fd-zone="active"><b>出戰 '+active.length+'/'+cap.active+'</b><div class="fd-slots">'+[0,1,2,3,4].map(i=>slot(active,i,cap.active,'active')).join('')+'</div></div><div class="fd-zone fd-zone-reserve" data-fd-zone="reserve"><b>候補 '+reserve.length+'/'+cap.reserve+'</b><div class="fd-slots">'+[0,1,2].map(i=>slot(reserve,i,cap.reserve,'reserve')).join('')+'</div></div></div>'+
   '<p class="fd-hint">'+(canEdit?'拖曳頭像到出戰或候補；點一下也可切換。':'戰鬥中無法調整編隊。')+'</p>'+
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
   host.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-fd-op]');if(!el||el.disabled||R().battle)return;drag={id:el.dataset.fdOp,x:e.clientX,y:e.clientY,pointer:e.pointerId,ghost:null,src:el}});
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
 /* 殘頁封面直接顯示三個職業圖示與名稱，一眼認出是哪三職。 */
 const roleFile={PIONEER:'vanguard',VANGUARD:'vanguard',WARRIOR:'warrior',GUARD:'warrior',TANK:'tank',DEFENDER:'tank',SNIPER:'sniper',CASTER:'caster',MEDIC:'medic',SUPPORT:'support',SUPPORTER:'support',SPECIAL:'special',SPECIALIST:'special'};
 const roleName={PIONEER:'先鋒',WARRIOR:'近衛',TANK:'重裝',SNIPER:'狙擊',CASTER:'術師',MEDIC:'醫療',SUPPORT:'輔助',SPECIAL:'特種'};
 const roleIcons=roles=>'<span class="fd-roles">'+roles.map(r=>'<img src="assets/professions/'+(roleFile[r]||'vanguard')+'.png" alt="'+(roleName[r]||r)+'">').join('')+'</span>';
 const common=()=>{const st=g(),[a,b]=[...picked].map(id=>st.fragments.find(f=>f.id===id));return a&&b?a.roles.filter(r=>b.roles.includes(r)):null};
 function ticketView(){
  const st=g();if(!st)return '<p class="fd-empty">此模式沒有招募券。</p>';
  const tickets=st.tickets.filter(t=>!t.used),frags=st.fragments,both=common();
  const synth=picked.size?'<button type="button" class="primary" data-fd-synth-confirm '+(both?.length?'':'disabled')+'>合成'+(both?(both.length?'<small>'+both.map(r=>roleName[r]||r).join('／')+'券</small>':'<small>無共同職業</small>'):'<small>再選一張</small>')+'</button>':'';
  return '<div class="fd-ticket-layout"><div class="fd-ticket-col"><b>完整券 '+tickets.length+'</b><div class="fd-ticket-list">'+(tickets.map(t=>'<button type="button" data-fd-ticket="'+t.id+'">'+FrontierRecruit152.art(t)+'<span>'+esc(t.name||(t.kind==='universal'||t.roles.length>=8?'通用招募券':t.roles.map(r=>roleName[r]||r).join('／')))+'</span></button>').join('')||'<p class="fd-empty">無</p>')+'</div></div>'+
   '<div class="fd-ticket-col"><b>殘頁 '+frags.length+(picked.size?' · 已選 '+picked.size+'/2':'')+'</b><div class="fd-ticket-list">'+(frags.map(f=>'<button type="button" class="fd-frag" data-fd-frag="'+f.id+'" aria-pressed="'+picked.has(f.id)+'">'+roleIcons(f.roles)+'<span>'+f.roles.map(r=>roleName[r]||r).join('')+'</span></button>').join('')||'<p class="fd-empty">無</p>')+'</div></div>'+
   '<div class="fd-synth">'+synth+'</div></div>'+
   '<p class="fd-hint">'+(picked.size?'選兩張殘頁，合成兩張共同職業的招募券。':'點完整券直接招募；點殘頁開始合成。')+'</p>';
 }
 async function onTicket(e){
  const t=e.target.closest('[data-fd-ticket]');if(t){picked.clear();close(true);decorate();FrontierRecruitUI144.ticket(t.dataset.fdTicket);return}
  const f=e.target.closest('[data-fd-frag]');if(f){const id=f.dataset.fdFrag;if(picked.has(id))picked.delete(id);else if(picked.size<2)picked.add(id);else{picked.delete([...picked][0]);picked.add(id)}return redraw()}
  if(e.target.closest('[data-fd-synth-confirm]')){const ids=[...picked];if(ids.length!==2||!common()?.length)return;const ok=await FrontierRecruitUI144.command('synthesize',{kind:'triple',fragments:ids});if(ok){picked.clear();toast('已合成招募券。')}redraw()}
 } function redraw(){const dock=document.querySelector('.screen-combat-actions');if(dock)decorate()}

 /* 背包：移除縮放百分比與 −／＋，改放「編輯幹員背包」；預設自動縮放到剛好塞滿寬度（仍可雙指縮放）。 */
 if(window.FrontierBagUX?.create){const create=FrontierBagUX.create;FrontierBagUX.create=function(...args){const host=create(...args);
  const zoom=host.querySelector('.bag-zoom-controls30');
  if(zoom){const b=document.createElement('button');b.type='button';b.className='fd-pack-edit';b.textContent='編輯幹員背包';b.onclick=()=>FrontierPack.open();zoom.replaceWith(b)}
  const hint=host.querySelector('.bag-ux-hint');if(hint)hint.textContent='雙指縮放 · 空白處移動 · 長按查看 · 拖近保險箱存入';
  const fit=()=>{if(!host.isConnected)return;FrontierViewZoom.change('bag','fit');
};requestAnimationFrame(()=>requestAnimationFrame(fit));
  return host}}
 /* 戰鬥上限：任何走法（每層一路走到底）累計作戰（普通／緊急／首領）不超過 10 場。
    在所有路線模組處理完後執行；只把非必戰、非首領的普通／緊急作戰改成不期而遇。 */
 const isBattle=n=>['battle','elite','boss'].includes(n.type);
 function layerMax(layer){let prev=new Map();for(let row=0;row<layer.rows.length;row++){const next=new Map();for(const n of layer.rows[row]){const src=row===0?[{v:0,path:[]}]:layer.rows[row-1].filter(p=>p.links?.includes(n.id)).map(p=>prev.get(p.id)).filter(Boolean);if(!src.length)continue;const best=src.reduce((a,b)=>b.v>a.v?b:a);next.set(n.id,{v:best.v+(isBattle(n)?1:0),path:[...best.path,n]})}prev=next}return [...prev.values()].reduce((a,b)=>!a||b.v>a.v?b:a,null)||{v:0,path:[]}}
 // 每層戰鬥上限（使用者定案 1／2／3／3／3），超過的非必戰作戰改為不期而遇。
 const layerLimits=[1,2,3,3,3];
 function capBattles(e){
  for(const [li,layer] of e.layers.entries()){const limit=layerLimits[li]??3;
   for(let guard=0;guard<40;guard++){const m=layerMax(layer);if(m.v<=limit)break;
    const pick=m.path.filter(n=>isBattle(n)&&n.type!=='boss'&&!n.requiredCombat&&!(li===0&&n.row===0)).sort((a,b)=>(a.type==='elite')-(b.type==='elite'))[0];
    if(!pick)break;pick.type='event';pick.risk=0;pick.battleCapped=true}}
  return e.layers.reduce((n,l)=>n+layerMax(l).v,0);
 }
 /* 塵封之所：出發時預定每個搜索房間，讓地圖揭露節點類型後就能看到需要的房卡。 */
 const h32=s=>{let n=2166136261;for(const c of String(s))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0};
 function assignRooms(r){const e=r.expedition,high=e.mode==='highrisk';let last=0;
  for(const [li,layer] of e.layers.entries())for(const row of layer.rows)for(const n of row){if(!['search','container'].includes(n.type)||Number.isInteger(n.room180))continue;
   const pool=Array.from({length:20},(_,i)=>i+1).filter(id=>!high||(li===0?id<=13:li===1?id<=16:id!==14)&&id!==last);n.room180=pool[h32(r.number+':'+n.id+':room')%pool.length];last=n.room180}}
 // 能開門的房卡；沒有任何房卡能開的房間（如祭儀庫）改列可用的開鎖裝置。
 function keycardsFor(room){const L=window.FrontierSearchLocks174;if(!L||!room)return [];const keys=Object.keys(L.catalog).filter(id=>L.catalog[id].key&&L.keyFits({room,core:false},L.catalog[id].key));if(keys.length)return keys;const lock=L.roomLock(room,'preview');return ['T1','T2','T3','T4'].filter(id=>L.toolFits(lock,id))}
 function keyHints(){const e=R()?.expedition;if(!e||page!=='run')return;
  const byId=new Map(e.layers.flatMap(l=>l.rows.flat()).map(x=>[x.id,x]));
  // 只有節點類型已揭露（不是「?」）時才顯示。
  for(const el of document.querySelectorAll('.ui-route-node[data-route-id]:not(.route-type-unknown)')){if(el.querySelector('.fd-keyhint'))continue;
   const n=byId.get(el.dataset.routeId);if(!n||!['search','container'].includes(n.type)||!['search','container'].includes(FrontierTrail.nodeKind(n)))continue;const keys=keycardsFor(n?.room180);if(!keys.length)continue;
   const hint=document.createElement('span');hint.className='fd-keyhint';hint.setAttribute('aria-label','可開門房卡：'+keys.map(id=>FrontierSearchLocks174.catalog[id].name).join('、'));
   hint.innerHTML=keys.slice(0,3).map(id=>'<img src="assets/search174/'+id+'.png" alt="" draggable="false">').join('')+(keys.length>3?'<b>+'+(keys.length-3)+'</b>':'');el.append(hint)}}
 if(typeof startRun==='function'){const start=startRun;startRun=function(...args){const before=R();const out=start(...args);const r=R();if(r&&r!==before&&r.expedition){try{if(r.expedition.mode==='standard'&&!r.expedition.battleCap149)r.expedition.battleCap149=capBattles(r.expedition);assignRooms(r);save();render()}catch(error){console.error(error)}}return out}}
 /* 詭異行商：所有商品只放在上方商品格，總數最多 10 個；劇情藏品（結局線索）優先保留，佔用一般商品的名額。 */
 function merchantLimit(){if(R()?.event?.type!=='fieldMerchant')return;const grid=document.querySelector('.field-store .store-grid');if(!grid)return;
  for(const extra of document.querySelectorAll('.field-store .store-alternative')){extra.classList.add('store-card');grid.append(extra)}
  const cards=[...grid.children].filter(c=>c.matches('[data-field-product],.store-card'));if(cards.length<=10)return;
  const keep=cards.filter(c=>c.classList.contains('region75-key')||c.matches('.store-alternative'));const regular=cards.filter(c=>!keep.includes(c));
  regular.slice(Math.max(0,10-keep.length)).forEach(c=>c.remove())}
 /* 長按說明放不下時自動縮小字級，直到完整顯示（最小 9px）。 */
 function fitInspection(el){let size=12;el.style.removeProperty('--fd-fit');for(let i=0;i<8&&el.scrollHeight>el.clientHeight+1&&size>9;i++){size-=.5;for(const p of el.querySelectorAll('p,li,span,div'))p.style.fontSize=size+'px';el.querySelector('b')&&(el.querySelector('b').style.fontSize=Math.max(11,size+1.5)+'px')}}
 new MutationObserver(list=>{for(const r of list)for(const n of r.addedNodes)if(n.nodeType===1&&n.matches?.('.hold-inspection'))requestAnimationFrame(()=>fitInspection(n))}).observe(document.body,{childList:true});
 /* 戰鬥：①首領機制產生的我方單位（如奎隆的尼盧火）常駐顯示在我方區；②被封鎖／繳械／暈眩的幹員頭像加上交叉鎖鏈。 */
 const chains='<svg class="fd-chains" viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke-linecap="round"><path d="M5 5 L35 35" stroke="#1b1b1b" stroke-width="7"/><path d="M35 5 L5 35" stroke="#1b1b1b" stroke-width="7"/><path d="M5 5 L35 35" stroke="#c9ced3" stroke-width="4" stroke-dasharray="5 3"/><path d="M35 5 L5 35" stroke="#c9ced3" stroke-width="4" stroke-dasharray="5 3"/></g></svg>';
 function lockReason(b,a){const t=b.turn||0,m=b.region75;if(m?.caged&&m.caged===a.uid)return '繭籠封鎖：無法行動，擊破繭籠可解除';if((a.disarmed75||0)>=t||(a.attackLockedTurn||0)>=t)return '繳械：本回合無法打攻擊牌（仍可治療與防護）';if((a.stunnedTurn||0)>=t)return '暈眩：本回合無法出牌';return null}
 function battleMarks(){const r=R(),b=r?.battle;if(!b||page!=='run')return;
  for(const row of document.querySelectorAll('.v113-actor-row[data-operator-uid]')){const a=r.team.find(x=>x.uid===row.dataset.operatorUid);row.querySelector('.fd-lock')?.remove();const why=a&&lockReason(b,a);if(!why)continue;const id=row.querySelector('.v113-actor-identity');if(!id)continue;const mark=document.createElement('div');mark.className='fd-lock';mark.dataset.battleStatus=why;mark.setAttribute('aria-label',why);mark.innerHTML=chains;const img=id.querySelector('img.avatar')||id.querySelector('img');id.append(mark);if(img){const ir=img.getBoundingClientRect(),pr=(mark.offsetParent||id).getBoundingClientRect();Object.assign(mark.style,{left:(ir.left-pr.left)+'px',top:(ir.top-pr.top)+'px',width:img.offsetWidth+'px',height:img.offsetHeight+'px',right:'auto',bottom:'auto'})}}
  const last=[...document.querySelectorAll('.v113-actor-row')].at(-1);document.querySelectorAll('.fd-ally-row').forEach(n=>n.remove());
  const allies=(b.friendly75||[]).filter(a=>!a.exited&&a.hp>0);if(!last||!allies.length)return;
  for(const f of allies){const row=document.createElement('section');row.className='fd-ally-row';const tip='尼盧火（我方機構）：HP '+f.hp+'/'+f.max+'。用治療牌治到滿即可熄滅；第 '+f.expires75+' 回合仍未熄滅會爆炸，全隊受傷並削弱攻擊最高的幹員。場上每盞尼盧火使奎隆受到的物法傷害降低 20%。';row.dataset.battleStatus=tip;row.setAttribute('aria-label',tip);row.innerHTML='<img src="assets/battle-fire75.svg" alt=""><span class="fd-ally-bar"><i style="width:'+Math.round(f.hp/f.max*100)+'%"></i></span><b>尼盧火 '+f.hp+'/'+f.max+'</b><small>第'+f.expires75+'回合爆炸</small>';last.after(row)}}
 /* 戰術獎勵「精簡牌組／戰術研習」：用實際卡面列出全部卡牌（每列 3 張，可上下捲動），點卡即選擇。 */
 function deckPicker(){const r=R(),s=r?.reward?.strategy;if(!s||!['remove','upgrade'].includes(s.stage)||typeof cardHtml!=='function')return;
  const body=document.querySelector('#app .screen-workspace-body')||document.querySelector('#app');if(!body||body.querySelector('.fd-card-grid'))return;
  for(const b of body.querySelectorAll('button'))if(/開啟卡牌列表/.test(b.textContent))b.remove();
  const title=document.createElement('h3');title.className='fd-card-title';title.textContent=(s.stage==='upgrade'?'選擇要升級的卡牌':'選擇要移除的卡牌')+'（共 '+r.deck.length+' 張）';
  const grid=document.createElement('div');grid.className='fd-card-grid';
  grid.innerHTML=r.deck.map((c,i)=>{let html='';try{html=cardHtml(c,i,'reward')}catch{html='<button class="play-card">'+esc(c.id)+'</button>'}return '<div class="fd-card-slot" data-fd-card="'+i+'">'+html+'</div>'}).join('');
  for(const el of grid.querySelectorAll('[onclick]'))el.removeAttribute('onclick');
  for(const slot of grid.querySelectorAll('[data-fd-card]')){const i=Number(slot.dataset.fdCard),c=r.deck[i],disabled=s.stage==='upgrade'&&typeof FrontierStrategy.canUpgrade==='function'&&!FrontierStrategy.canUpgrade(c);if(disabled)slot.classList.add('is-disabled');slot.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!disabled)FrontierStrategy.pickCard(i)},true)}
  const anchor=[...body.querySelectorAll('h3,h2')].find(h=>/選擇移除|選擇升級/.test(h.textContent));if(anchor){anchor.replaceWith(title)}else body.prepend(title);title.after(grid)} /* 戰後收藏品：和其他戰利品顯示在同一區；普通作戰直接取得 1 個，緊急作戰／首領二選一。 */
 function curioDrops(){const r=R();if(page!=='run'||!r||r.result)return;const s=window.FrontierCurios?.curios?.();if(!s)return;
  if(!r.reward){if(s.lastAuto)delete s.lastAuto;return}
  const host=document.querySelector('#app .compact-reward-content')||document.querySelector('#app .screen-workspace-body');if(!host||host.querySelector('.fd-curio-drop'))return;
  const D=FrontierCurioData.entries,box=document.createElement('section');box.className='fd-curio-drop';
  const offer=s.offers?.[0];
  if(offer){box.innerHTML='<h3>收藏品 · '+(offer.ids.length>1?'二選一':'取得')+'</h3><div class="fd-curio-choices">'+offer.ids.map(id=>'<button type="button" data-fd-claim="'+id+'">'+FrontierCurios.icon(id)+'<b>'+esc(D[id]?.name||id)+'</b><small>'+esc(D[id]?.effect||'')+'</small></button>').join('')+'</div><button type="button" class="fd-curio-skip" data-fd-skip>放棄收藏品</button>';
   box.addEventListener('click',e=>{const c=e.target.closest('[data-fd-claim]');if(c){FrontierCurios.claim(offer.key,c.dataset.fdClaim);return}if(e.target.closest('[data-fd-skip]'))FrontierCurios.decline(offer.key)})}
  else if(s.lastAuto&&D[s.lastAuto.id]){const d=D[s.lastAuto.id];box.innerHTML='<h3>收藏品 · 取得</h3><div class="fd-curio-choices"><div class="fd-curio-got">'+FrontierCurios.icon(s.lastAuto.id)+'<b>'+esc(d.name)+'</b><small>'+esc(d.effect||'')+'</small></div></div>'}
  else return;
  const anchor=host.querySelector('.reward-footer')||host.querySelector('.reward-cards');if(anchor)anchor.after(box);else host.append(box)}
 /* 詭異行商商品格式（刷新後亦同）：0～1 結局藏品（地區模組另行附加）、1 個依層數的箱子、1 張單一職業招募券、
    3 個收藏品、2 個裝備詞條、2～3 個依層數的素材（最低綠色）。 */
 if(window.FrontierTrading?.fieldMerchant){const buildMerchant=FrontierTrading.fieldMerchant;FrontierTrading.fieldMerchant=function(node){buildMerchant(node);const r=R(),e=r?.event;if(e?.type!=='fieldMerchant'||!r.recruitment144&&!r.expedition)return;
  const layer=r.expedition.layer||0,seed=h32([r.number,node.id,e.talentRefresh43||0,'merchant149'].join(':')),rnd=k=>h32(seed+':'+k);
  const defs=FrontierInventory.definitions,rows=e.rows,box=rows.find(x=>x.type==='container'),curios=rows.filter(x=>x.type==='curio').slice(0,3);
  const modulePool=Object.values(defs).filter(d=>d.category==='runModule'),owned=new Set((r.equipment139?.modules||[]).map(m=>m.id)),fresh=modulePool.filter(d=>!owned.has(d.id)),pool=fresh.length>=2?fresh:modulePool;
  const modules=[];for(let i=0;modules.length<2&&i<pool.length*2&&pool.length;i++){const d=pool[rnd('module'+i)%pool.length];if(!modules.some(m=>m.item===d.id))modules.push({id:'module:'+modules.length,type:'module',item:d.id,qty:1,price:18+12*(d.occupancy||1)})}
  const roleList=window.FrontierExpeditionRecruit144?.roles||['PIONEER','WARRIOR','TANK','SNIPER','CASTER','MEDIC','SUPPORT','SPECIAL'];
  const ticket=r.recruitment144?{id:'ticket144',type:'ticket144',role:roleList[rnd('role')%roleList.length],qty:1,price:20+Math.min(10,Math.round(layer*2.5))}:null;
  const tiers=[3,3,4,4,5,5,5],count=2+rnd('matcount')%2,families=Object.keys(FrontierProgress.families),mats=[];
  for(let i=0;i<count;i++){const tier=Math.max(3,Math.min(5,tiers[layer]+(rnd('tier'+i)%3===0?1:0)));mats.push({id:'material:'+i,type:'material',item:FrontierProgress.materialId(families[rnd('fam'+i)%families.length],Math.min(5,tier)),qty:tier===3?3:tier===4?2:1,price:{3:14,4:22,5:38}[Math.min(5,tier)]})}
  e.rows=[box,ticket,...curios,...(r.equipment139?modules:[]),...mats].filter(Boolean);e.format149=true;save();render()}}
 if(window.FrontierTrading?.fieldBuy){const buyField=FrontierTrading.fieldBuy;FrontierTrading.fieldBuy=function(id){const r=R(),e=r?.event,row=e?.rows?.find(x=>x.id===id);if(row?.type!=='ticket144')return buyField(id);
  if(e.bought[id]||r.fieldPoints<row.price){toast('源石碇不足。');return}const g=r.recruitment144,E=FrontierExpeditionRecruit144;
  return FrontierRuntime.perform('merchant-ticket',()=>{r.recruitment144=E.command(g,{id:crypto.randomUUID(),seq:g.seq+1,type:'shopTicket',args:{role:row.role,key:'shop:'+r.number+':'+e.node+':'+(e.talentRefresh43||0)}},FrontierCapture.units);r.fieldPoints-=row.price;e.bought[id]=true;save();render();toast('已購入'+(roleName[row.role]||row.role)+'招募券。');return true})}}
 function merchantTicketCard(){const e=R()?.event;if(e?.type!=='fieldMerchant')return;const row=e.rows?.find(x=>x.type==='ticket144'),card=document.querySelector('[data-field-product="ticket144"]');if(!row||!card||card.dataset.fdDone)return;card.dataset.fdDone='1';const pic=card.querySelector('.store-picture');if(pic)pic.innerHTML=FrontierRecruit152.art({roles:[row.role],kind:'class'});const b=card.querySelector('b');if(b)b.textContent=(roleName[row.role]||row.role)+'招募券';const s=card.querySelector('small');if(s)s.textContent='只能招募'+(roleName[row.role]||row.role)+' · '+row.price+'源石碇'}
 /* ===== 警戒值（全難度，0～100） =====
    主要來源：搜索房間行動（既有規則）；各種戰鬥少量增加；每消耗 1 點勘察 +3；部分不期而遇選項的代價。
    安全的角落可選「隱蔽休整」降低警戒。75 以上離開搜索房間會被追擊（既有規則，現套用所有難度）。 */
 const alertOf=r=>r.alert??(r.expedition?.mode==='highrisk'?20:0);
 function addAlert(r,key,amount,reason){if(!r?.expedition||!amount)return false;r.alertLedger??=[];if(r.alertLedger.some(x=>x.key===key))return false;const before=alertOf(r);r.alert=Math.min(100,Math.max(0,before+amount));r.alertLedger.push({key,before,after:r.alert,reason});return true}
 const alertBands=[[25,'靜默'],[50,'注意'],[75,'戒備'],[90,'追緝'],[101,'封鎖']];
 function alertHud(){const r=R();if(!r?.expedition||r.result)return;const box=document.querySelector('.command148-survey');if(!box)return;box.querySelector('.fd-alert')?.remove();const v=alertOf(r),label=alertBands.find(([m])=>v<m)[1];
  const el=document.createElement('div');el.className='fd-alert'+(v>=75?' is-high':'');el.dataset.battleStatus='警戒 '+v+'/100（'+label+'）。來源：搜索房間行動為主、交戰少量、每消耗 1 點勘察 +3、部分事件選項。75 以上離開搜索房間會遭到追擊。可在安全的角落選擇「隱蔽休整」降低。';el.setAttribute('aria-label',el.dataset.battleStatus);el.innerHTML='<span class="fd-alert-bar"><i style="width:'+v+'%"></i></span><small>警戒 '+v+'</small>';box.append(el)}
 // 交戰：普通 +1、緊急 +2、首領 +3
 if(typeof startBattle==='function'){const sb=startBattle;startBattle=function(type,...rest){const out=sb(type,...rest);const r=R();if(r?.battle&&r.expedition){addAlert(r,(r.expedition.current||'start')+':battle:'+(r.number||0),{battle:1,ambush:1,elite:2,boss:3}[type]||1,'交戰')}return out}}
 // 消耗勘察點數：每點 +3
 if(window.FrontierSurveyIndex16?.change){const ch=FrontierSurveyIndex16.change;FrontierSurveyIndex16.change=function(r,amount,reason,key){const out=ch(r,amount,reason,key);if(out&&amount<0)addAlert(r,'survey:'+key,-amount*3,'消耗勘察：'+reason);return out}}
 // 不期而遇：部分選項接受時多一個警戒代價
 const eventAlert={sealed_lab:6,abandoned_cart:3,broken_bridge:4,quiet_market:3,battlefield:5,wounded_runner:2};
 if(window.FrontierAdventure?.select){const sel=FrontierAdventure.select;FrontierAdventure.select=function(accept){const r=R(),e=r?.event,cost=accept&&e?.type==='frontierEvent'&&!e.claimed?eventAlert[e.id]:0;const out=sel(accept);if(cost&&R()===r)addAlert(r,(r.expedition?.current||'')+':event:'+e.id,cost,'事件：'+(FrontierAdventure.events?.[e.id]?.title||e.id));return out}}
 function eventAlertNote(){const e=R()?.event;if(e?.type!=='frontierEvent'||!eventAlert[e.id]||e.claimed)return;const btn=[...document.querySelectorAll('#app button')].find(b=>/select\(true\)|接受|調查|進入|支付|消耗/.test((b.getAttribute('onclick')||'')+b.textContent)&&!b.querySelector('.fd-alert-cost'));if(btn)btn.insertAdjacentHTML('beforeend','<small class="fd-alert-cost">警戒 +'+eventAlert[e.id]+'</small>')}
 // 安全的角落：隱蔽休整（警戒 -15，取代本次休整）
 function campAlertOption(){const r=R();if(r?.event?.type!=='camp'||!r.expedition)return;const host=document.querySelector('#app .screen-workspace-body')||document.querySelector('#app');if(!host||host.querySelector('.fd-camp-alert'))return;const v=alertOf(r);const b=document.createElement('button');b.type='button';b.className='fd-camp-alert';b.disabled=v<=0;b.innerHTML='隱蔽休整<small>警戒 '+v+' → '+Math.max(0,v-15)+'（不進行其他休整）</small>';b.onclick=()=>FrontierRuntime.perform('camp-alert',()=>{if(!addAlert(r,r.expedition.current+':camp-alert',-15,'安全的角落：隱蔽休整'))return false;completeNode();save();render();return true});const anchor=[...host.querySelectorAll('button')].pop();if(anchor)anchor.after(b);else host.append(b)}
 /* 招募／晉升成功後的短暫轉場（仿集成戰略招募）：立繪滑入、星級與職業、名稱；約 2.4 秒自動結束，右上角可跳過。 */
 let lastRoster=null;
 function recruitFx(){const r=R(),st=r?.recruitment144;if(!st){lastRoster=null;return}const key=r.number,now=Object.fromEntries(st.roster.map(u=>[u.id,u.elite]));
  if(!lastRoster||lastRoster.key!==key){lastRoster={key,map:now};return}
  const prev=lastRoster.map;lastRoster={key,map:now};
  const joined=Object.keys(now).find(id=>!(id in prev)),promoted=Object.keys(now).find(id=>id in prev&&now[id]>prev[id]);const id=joined||promoted;if(!id)return;
  const u=FrontierCapture.units[id]||{},form=st.roster.find(x=>x.id===id)?.form,art=window.FrontierAppearance80?.src(id,'full',form)||window.FrontierAppearance80?.src(id,'portrait',form)||'assets/'+(u.image||id)+'.png';
  document.querySelector('.fd-recruit-fx')?.remove();const fx=document.createElement('div');fx.className='fd-recruit-fx star-'+(u.rarity||3);fx.setAttribute('role','dialog');fx.setAttribute('aria-label',(promoted?'晉升 ':'招募 ')+(u.name||id));
  fx.innerHTML='<div class="fd-rfx-flash"></div><div class="fd-rfx-band"></div><img class="fd-rfx-art" src="'+esc(art)+'" alt=""><div class="fd-rfx-info"><small>'+(promoted?'晉升 · 精英階段 '+now[id]:'招募成功 · 精英階段 '+now[id])+'</small><b>'+esc(u.name||id)+'</b><span class="fd-rfx-stars">'+'★'.repeat(u.rarity||3)+'</span><em>'+esc(u.role||'')+'</em></div><button type="button" class="fd-rfx-skip">跳過 ›</button>';
  const done=()=>{fx.classList.add('out');setTimeout(()=>fx.remove(),220)};fx.querySelector('.fd-rfx-skip').onclick=done;fx.addEventListener('click',e=>{if(e.target===fx)done()});document.body.append(fx);setTimeout(()=>{if(fx.isConnected)done()},2400)}
 let packSyncing=false;
 function packRoster(){if(packSyncing||!window.FrontierPack?.needsRosterSync?.())return;if(FrontierRuntime.busy){setTimeout(packRoster,300);return}packSyncing=true;setTimeout(async()=>{try{await FrontierRuntime.perform('pack-roster-sync',()=>{FrontierPack.syncRoster();save();return true})}finally{packSyncing=false}render()},0)}
 const prior=render;render=function(...args){const out=prior(...args);try{decorate();keyHints();merchantLimit();battleMarks();packRoster();deckPicker();curioDrops();merchantTicketCard();alertHud();eventAlertNote();campAlertOption();recruitFx();if(R()?.event?.type==='fieldMerchant'){setTimeout(merchantLimit,60);setTimeout(merchantLimit,300)}}catch(error){console.error(error)}return out};
 window.addEventListener('resize',()=>{if(sheet)redraw()});
 return{toggle,close,decorate,keyHints,keycardsFor,capBattles,get sheet(){return sheet}};
})();
