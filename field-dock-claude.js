'use strict';
/* 遠征探索底部列（手機優先）：
   順序 背包｜戰術奇物｜編隊｜詞條｜招募券｜紀錄；編隊／戰術奇物／招募券改為從底部列上方展開的區塊，不再彈窗。
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
   if(k==='curio'){b.textContent='奇物 '+(R().curios?.owned?.length||0);b.removeAttribute('onclick');b.onclick=()=>toggle('curio')}
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

 /* ---------- 編隊：上排左出戰、右支援，下方候補；三區可互相拖曳，落在有人的格子上直接交換 ---------- */
 function zones(){const st=g(),cap=FrontierExpeditionRecruit144.capacity(st),f=!!st.formation175,active=st.roster.filter(u=>u.active),support=st.roster.filter(u=>!u.active&&(f?u.support:true)),reserve=f?st.roster.filter(u=>!u.active&&!u.support):[];return{st,f,cap:{active:cap.active,support:f?cap.support:cap.reserve,reserve:f?cap.reserve:0},active,support,reserve}}
 function teamView(){
  const st=g();if(!st)return '<p class="fd-empty">此模式沒有招募編制。</p>';
  const z=zones(),canEdit=!R().battle;
  const slot=(zone,i)=>{const limit=z.cap[zone],list=z[zone];if(i>=limit)return '<span class="fd-slot fd-locked" aria-label="尚未解鎖">'+lock+'</span>';const u=list[i];return '<span class="fd-slot" data-fd-zone="'+zone+'" data-fd-index="'+i+'">'+(u?'<img src="'+esc(portrait(u))+'" alt="'+esc(units()[u.id].name)+'" data-fd-op="'+u.id+'" draggable="false"><i>E'+u.elite+'</i><em>'+esc(units()[u.id].name)+'</em>':'')+'</span>'};
  const block=(zone,label,count,cls='')=>'<div class="fd-zone '+cls+'" data-fd-zone="'+zone+'"><b>'+label+' '+z[zone].length+'/'+z.cap[zone]+'</b><div class="fd-slots" style="--n:'+count+'">'+Array.from({length:count},(_,i)=>slot(zone,i)).join('')+'</div></div>';
  return '<div class="fd-team-zones">'+block('active','出戰',5)+block('support','支援',3,'fd-zone-support')+'</div>'+(z.f?block('reserve','候補',4,'fd-zone-reserve fd-zone-wide'):'')+
   '<p class="fd-hint">'+(canEdit?'拖曳頭像到出戰、支援或候補；拖到已有幹員的格子會直接交換。支援幹員不上場，只提供支援技能。':'戰鬥中無法調整編隊。')+'</p>'+
   (st.roster.length?'':'<p class="fd-empty">尚未招募幹員，請使用招募券。</p>');
 }
 /* 把 id 放到 zone 的第 index 格；若該格已有幹員則兩人互換區塊與位置。 */
 function place(id,zone,index){
  const z=zones(),lists={active:z.active.map(u=>u.id),support:z.support.map(u=>u.id),reserve:z.reserve.map(u=>u.id)};
  const from=Object.keys(lists).find(k=>lists[k].includes(id));if(!from||!lists[zone])return;
  const fromIndex=lists[from].indexOf(id),other=lists[zone][index];
  if(from===zone){if(other==null||other===id){lists[zone].splice(fromIndex,1);lists[zone].push(id)}else{lists[zone][index]=id;lists[zone][fromIndex]=other}}
  else if(other!=null){lists[zone][index]=id;lists[from][fromIndex]=other}
  else{if(lists[zone].length>=z.cap[zone]){toast(({active:'出戰',support:'支援',reserve:'候補'})[zone]+'已滿 '+z.cap[zone]+' 人。');return}lists[from].splice(fromIndex,1);lists[zone].push(id)}
  if(!lists.active.length){toast('至少需要一名出戰幹員。');return}
  if(z.f)FrontierRecruitUI144.command('formation175',{active:lists.active,support:lists.support});
  else{if(lists.support.length>z.cap.support){toast('候補已滿 '+z.cap.support+' 人。');return}FrontierRecruitUI144.command('formation',{active:lists.active})}
 }
 let drag=null;
 function bind(host){
  host.querySelector('[data-fd-close]')?.addEventListener('click',()=>close());
  if(sheet==='team'){
   host.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-fd-op]');if(!el||el.disabled||R().battle)return;e.preventDefault();drag={id:el.dataset.fdOp,x:e.clientX,y:e.clientY,pointer:e.pointerId,ghost:null,src:el}});
  }
  if(sheet==='curio')host.addEventListener('click',e=>{const el=e.target.closest('[data-fd-curio]');if(!el)return;curioFocus=curioFocus===el.dataset.fdCurio?null:el.dataset.fdCurio;mount(document.querySelector('.screen-combat-actions'))});
  if(sheet==='ticket')host.addEventListener('click',onTicket);
 }
 const dropSlot=(x,y)=>document.elementFromPoint(x,y)?.closest('.fd-slot[data-fd-zone],.fd-zone');
 window.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.ghost){if(Math.hypot(dx,dy)<10)return;drag.moved=true;drag.ghost=drag.src.cloneNode(true);drag.ghost.className='fd-ghost';drag.ghost.removeAttribute('data-fd-op');document.body.append(drag.ghost)}
  e.preventDefault();drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';
  const over=dropSlot(e.clientX,e.clientY);for(const z of document.querySelectorAll('.fd-over'))if(z!==over)z.classList.remove('fd-over');over?.classList.add('fd-over');
 },{passive:false});
 window.addEventListener('pointerup',e=>{if(!drag||drag.pointer!==e.pointerId)return;const d=drag;drag=null;if(!d.ghost)return;d.ghost.remove();document.querySelectorAll('.fd-over').forEach(z=>z.classList.remove('fd-over'));const over=dropSlot(e.clientX,e.clientY);if(!over)return;const zone=over.dataset.fdZone,index=over.dataset.fdIndex!=null?Number(over.dataset.fdIndex):99;place(d.id,zone,index)});
 window.addEventListener('pointercancel',()=>{drag?.ghost?.remove();drag=null});

 /* ---------- 戰術奇物：約畫面 1/3 高，列出已持有 ---------- */
 function curioView(){
  const owned=R().curios?.owned||[],D=FrontierCurioData.forRun(R()),f=curioFocus&&D[curioFocus];
  return (f?'<div class="fd-curio-detail"><b>'+esc(f.name)+'</b><p>'+esc(f.effect||'')+'</p></div>':'')+
   (owned.length?'<div class="fd-curio-grid">'+owned.map(o=>{const d=D[o.id];return d?'<button type="button" data-fd-curio="'+o.id+'" aria-pressed="'+(curioFocus===o.id)+'">'+FrontierCurios.icon(o.id)+'<span>'+esc(d.name)+'</span></button>':''}).join('')+'</div>':'<p class="fd-empty">本局尚未取得戰術奇物。</p>');
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
   '<div class="fd-ticket-col"><b>殘頁 '+frags.length+(picked.size?' · 已選 '+picked.size+'/2':'')+'</b><div class="fd-ticket-list">'+(frags.map(f=>'<button type="button" class="fd-frag" data-fd-frag="'+f.id+'" aria-pressed="'+picked.has(f.id)+'">'+FrontierRecruit152.art(f,true)+'<span>'+f.roles.map(r=>roleName[r]||r).join('')+'</span></button>').join('')||'<p class="fd-empty">無</p>')+'</div></div>'+
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
 /* 只調整超過各層上限的可選作戰，保留必要作戰與首領。 */
 const isBattle=n=>['battle','elite','boss'].includes(n.type);
 function layerMax(layer){let prev=new Map();for(let row=0;row<layer.rows.length;row++){const next=new Map();for(const n of layer.rows[row]){const src=row===0?[{v:0,path:[]}]:layer.rows[row-1].filter(p=>p.links?.includes(n.id)).map(p=>prev.get(p.id)).filter(Boolean);if(!src.length)continue;const best=src.reduce((a,b)=>b.v>a.v?b:a);next.set(n.id,{v:best.v+(isBattle(n)?1:0),path:[...best.path,n]})}prev=next}return [...prev.values()].reduce((a,b)=>!a||b.v>a.v?b:a,null)||{v:0,path:[]}}
 // Cap optional battles without removing mandatory combat.
 const layerLimits=[2,2,3,3,3];
 function tuneEncounterFrequency(r){
  const e=r.expedition;
  const layers=e.layers.slice(0,5);
  const optional=[];
  for(const [index,layer] of layers.entries()){
   const fixed=index===0?layer.rows.length-1:layer.rows.findIndex(row=>row.some(node=>node.endingMarket75));
   const candidates=layer.rows.filter((row,i)=>i!==fixed&&row.some(node=>node.type==='merchant'));
   if(index>0&&fixed<0&&candidates.length)optional.push(pick(candidates));
   const storyRows=layer.rows.filter(row=>row.some(node=>node.storyEvent&&!['gift_choice','gift_exchange','trail_intel'].includes(node.storyEvent)));
   for(const row of storyRows)for(const node of row)if(node.storyEvent)node.routeStory118=0;
   if(index>0&&storyRows.length&&rnd(100)<35)for(const node of storyRows[0])if(node.storyEvent)node.routeStory118=1;
   if(index>0&&storyRows.length>1)for(const node of storyRows[1])if(node.storyEvent)node.routeStory118=2;
  }
  const required=layers.filter((layer,index)=>index===0||layer.rows.some(row=>row.some(node=>node.endingMarket75))).length;
  const extra=Math.max(0,Math.min(4-required,1+Number(rnd(100)<30)));
  const keep=new Set(shuffle(optional).slice(0,extra));
  for(const [index,layer] of layers.entries())for(const row of layer.rows){
   if(index===0&&row===layer.rows.at(-1)||keep.has(row))continue;
   for(const node of row)if(node.type==='merchant'&&!node.endingMarket75){
    node.type='event';node.risk=0;delete node.earlySpecial;
   }
  }
 }
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
   const n=byId.get(el.dataset.routeId);if(!n||!['search','container'].includes(n.type)||!['search','container'].includes(FrontierTrail.nodeKind(n)))continue;/* v605：勘探視野要能看到該節點的下一排，才預告所需房卡 */const SI=window.FrontierSurveyIndex16;if(SI&&R().survey16&&SI.visibility(R(),{id:'fd-probe:'+n.id,layer:n.layer,row:n.row+1})!=='known')continue;const keys=keycardsFor(n?.room180);if(!keys.length)continue;
   const hint=document.createElement('span');hint.className='fd-keyhint';hint.setAttribute('aria-label','可開門房卡：'+keys.map(id=>FrontierSearchLocks174.catalog[id].name).join('、'));
   hint.innerHTML=keys.slice(0,3).map(id=>'<img src="assets/search174/'+id+'.png" alt="" draggable="false">').join('')+(keys.length>3?'<b>+'+(keys.length-3)+'</b>':'');el.append(hint)}}
 if(typeof startRun==='function'){const start=startRun;startRun=function(...args){const before=R();const out=start(...args);const r=R();if(r&&r!==before&&r.expedition){try{if(r.expedition.mode==='standard'&&!r.expedition.battleCap149){r.expedition.battleCap149=capBattles(r.expedition);tuneEncounterFrequency(r);}assignRooms(r);save();render()}catch(error){console.error(error)}}return out}}
 /* 詭異行商：所有商品只放在上方商品格，總數最多 10 個；劇情藏品（結局線索）優先保留，佔用一般商品的名額。 */
 function merchantLimit(){if(R()?.event?.type!=='fieldMerchant')return;const grid=document.querySelector('.field-store .store-grid');if(!grid)return;
  const refresh=document.querySelector('.talent-refresh43'),heading=document.querySelector('.field-store .store-heading');if(refresh&&heading&&heading.nextElementSibling!==refresh)heading.after(refresh);
  for(const extra of document.querySelectorAll('.field-store .store-alternative')){extra.classList.add('store-card');grid.append(extra)}
  const cards=[...grid.children].filter(c=>c.matches('[data-field-product],.store-card'));if(cards.length<=10)return;
  const keep=cards.filter(c=>c.classList.contains('region75-key')||c.matches('.store-alternative,[data-survey16-product]'));const regular=cards.filter(c=>!keep.includes(c));
  regular.slice(Math.max(0,10-keep.length)).forEach(c=>c.remove())}
 /* 長按說明放不下時自動縮小字級，直到完整顯示（最小 9px）。 */
 /* 注意：樣式表用了 !important，所以這裡也要用 important 才蓋得過。 */
 function fitInspection(el){const over=()=>el.scrollHeight>el.clientHeight+1,set=(n,k,v)=>n.style.setProperty(k,v,'important');
  if(!over())return;set(el,'top','calc(env(safe-area-inset-top) + 8px)');set(el,'max-height','calc(100dvh - env(safe-area-inset-top) - 16px)');
  let size=12;while(over()&&size>8){size-=.5;for(const p of el.querySelectorAll('p,li,span,div,small')){set(p,'font-size',size+'px');set(p,'margin',Math.max(1,size-8)+'px 0');set(p,'line-height','1.3')}const b=el.querySelector('b');b&&set(b,'font-size',Math.max(10,size+1.5)+'px')}
  if(over()){set(el,'overflow-y','auto');set(el,'pointer-events','auto')}}
 new MutationObserver(list=>{for(const r of list)for(const n of r.addedNodes)if(n.nodeType===1&&n.matches?.('.hold-inspection'))fitInspection(n)}).observe(document.body,{childList:true});
 /* 戰鬥：①首領機制產生的我方單位（如奎隆的尼盧火）常駐顯示在我方區；②被封鎖／繳械／暈眩的幹員頭像加上交叉鎖鏈。 */
 const chains='<svg class="fd-chains" viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke-linecap="round"><path d="M5 5 L35 35" stroke="#1b1b1b" stroke-width="7"/><path d="M35 5 L5 35" stroke="#1b1b1b" stroke-width="7"/><path d="M5 5 L35 35" stroke="#c9ced3" stroke-width="4" stroke-dasharray="5 3"/><path d="M35 5 L5 35" stroke="#c9ced3" stroke-width="4" stroke-dasharray="5 3"/></g></svg>';
 function lockReason(b,a){const t=b.turn||0,m=b.region75;if(m?.caged&&m.caged===a.uid)return '繭籠封鎖：無法行動，擊破繭籠可解除';if((a.disarmed75||0)>=t||(a.attackLockedTurn||0)>=t)return '繳械：本回合無法打攻擊牌（仍可治療與防護）';if((a.stunnedTurn||0)>=t)return '暈眩：本回合無法出牌';return null}
 function battleMarks(){const r=R(),b=r?.battle;if(!b||page!=='run')return;
  for(const row of document.querySelectorAll('.v113-actor-row[data-operator-uid]')){const a=r.team.find(x=>x.uid===row.dataset.operatorUid);row.querySelector('.fd-lock')?.remove();const why=a&&lockReason(b,a);if(!why)continue;const id=row.querySelector('.v113-actor-identity');if(!id)continue;const mark=document.createElement('div');mark.className='fd-lock';mark.dataset.battleStatus=why;mark.setAttribute('aria-label',why);mark.innerHTML=chains;const img=id.querySelector('img.avatar')||id.querySelector('img');id.append(mark);if(img){const ir=img.getBoundingClientRect(),pr=(mark.offsetParent||id).getBoundingClientRect();Object.assign(mark.style,{left:(ir.left-pr.left)+'px',top:(ir.top-pr.top)+'px',width:img.offsetWidth+'px',height:img.offsetHeight+'px',right:'auto',bottom:'auto'})}}
  const last=[...document.querySelectorAll('.v113-actor-row')].at(-1);document.querySelectorAll('.fd-allies-row,.fd-ally-row').forEach(n=>n.remove());
  const allies=(b.friendly75||[]).filter(a=>!a.exited&&a.hp>0);if(!last||!allies.length)return;
  const group=document.createElement('div');group.className='fd-allies-row';last.after(group);for(const f of allies){const row=document.createElement('section');row.className='fd-ally-row';const tip='尼盧火（我方機構）：HP '+f.hp+'/'+f.max+'。用治療牌治到滿即可熄滅；第 '+f.expires75+' 回合仍未熄滅會爆炸，全隊受傷並削弱攻擊最高的幹員。場上每盞尼盧火使奎隆受到的物法傷害降低 20%。';row.dataset.battleStatus=tip;row.setAttribute('aria-label',tip);const pct=f.hp<=1?0:Math.round(f.hp/f.max*100),left=Math.max(0,f.expires75-b.turn);row.innerHTML='<img src="assets/battle-fire75.svg" alt=""><span class="fd-ally-bar" aria-label="治療進度 '+pct+'%"><i style="width:'+pct+'%"></i></span><b>尼盧火 '+(f.hp<=1?0:f.hp)+'/'+f.max+'</b><small>'+(left<=0?'本回合結束爆炸':'剩 '+left+' 回合爆炸')+'<br><em>拖治療牌治滿即熄滅</em></small>';group.append(row)}}
 /* Boss 機制單位：卡片下方說明「這是什麼、該怎麼處理」，首領無敵時標出原因。
    回傳 [標題, 完整說明, 短說明]；敵人多時只顯示短說明，完整內容在長按與 title。 */
 function mechTag(b,e){const m=b.region75||{},boss=b.enemies.find(x=>x.uid===m.bossUid),bn=boss?.name?.split(/[，,・「」“”]/).filter(Boolean)[0]||'首領',left=n=>Math.max(0,(n||0)-b.turn);
  if(e.pilotDue75)return['駕駛員','第'+e.pilotDue75+'回合自爆：全隊受 90 法術傷害，之前擊倒',left(e.pilotDue75)+' 回合後自爆'];
  if(e.uid!==m.bossUid&&boss&&e.regionBoss&&m.kind==='duet')return[e.name,boss.hp>0?'與'+bn+'並存：任一方倒下，另一方攻擊 +50%':'搭檔已倒下：攻擊 +50%',boss.hp>0?'搭檔倒下會暴怒':'暴怒 攻擊+50%'];
  if(e.bloodblade75)return['凝血之刃','回流倒數 '+left(e.bladeDue)+' 回合：擊破可阻止'+bn+'回復 10%',left(e.bladeDue)+' 回合後回血'];
  if(e.device75){const d=e.device75,act=d.litUntil>=b.turn;if(act)return[e.name,'已啟動至第'+d.litUntil+'回合','已啟動'];return d.kind==='dukare'?[e.name,'攻擊它推進 '+d.charge+'/'+d.threshold+'（每回合也會自動 +1）','攻擊推進 '+d.charge+'/'+d.threshold]:[e.name,'攻擊它累積充能 '+d.charge+'/'+d.threshold+'，充滿後啟動','攻擊充能']}
  const x=e.extra75;if(!x)return null;
  const map={lotus:['托生蓮座','存活時'+bn+'無敵：擊破解除','擊破解除無敵'],portal:['幽影門扉','擊破：'+bn+'損失 10% HP','擊破 首領-10%'],limb:['深海肢體','擊破：'+bn+'損失 6% HP','擊破 首領-6%'],cage:['繭籠','囚禁幹員無法出牌：擊破解救','擊破解救幹員'],vortex:['魂靈渦流',(e.extraDue75?'第'+e.extraDue75+'回合':'')+'回流：'+bn+'回復 8%，先擊破',(e.extraDue75?left(e.extraDue75)+' 回合後':'')+'回血'],crystal:['結晶區塊','每塊使'+bn+'減傷 25%：擊破或用消除樁清除','首領減傷25%'],experiment:m.kind==='carnival'?['活性實驗體','擊殺計分：搶在首領前擊殺','搶先擊殺']:['活性實驗體','分擔'+bn+'一半受傷：先清除再集火','分擔首領傷害']};
  return map[x]||[e.name,'機制單位','機制單位']}
 function mechTags(){const r=R(),b=r?.battle;if(!b?.region75||page!=='run')return;const cards=[...document.querySelectorAll('.enemy-card[data-enemy-id]')],crowded=true;/* 卡片一律只放短說明，完整內容看長按。 */
  for(const card of cards){const e=b.enemies.find(x=>x.id===card.dataset.enemyId);card.querySelector('.fd-mech-tag')?.remove();if(!e||e.hp<=0)continue;
   let tag=mechTag(b,e),warn=false;const isBoss=e.uid===b.region75.bossUid;
   if(!tag&&isBoss){const k=b.region75.kind,blocked=FrontierRegional75.blocked({...b},e),stRaw=window.FrontierRegionStatus75?.(b,b.region75),st=stRaw&&!/^第 \d+ 回合$/.test(stRaw)?stRaw:'';
    if(blocked){warn=true;const why={quilon:'先擊破托生蓮座',faust:'第 1 回合隱匿，先處理護衛',soul:'無法直接傷害：擊破門扉',sami:'等充能露出破綻'}[k]||'先處理場上機制';tag=['無敵',why+(st?'（'+st+'）':''),why]}
    else{const alive=b.enemies.filter(x=>x.hp>0&&!x.exited),half=e.hp/e.max<=.5;
     const hint={awaken:'實驗體 '+alive.filter(x=>x.extra75==='experiment').length+' 隻存活時本體只受一半傷害',bigugly:'倒下後彈出駕駛員，兩回合內須擊倒',deer:half?'已過半血：物理／法術再減半，改用真傷':'半血後物理／法術傷害減半',degen:'突進命中者下回合繳械；先破韌可阻止',faust:'每 3 回合紫箭強化：留護盾與減傷',kazimierz:'公布的裁決類型減傷 55%：改用另一類型或挑戰反轉',mouse:'沙塵輪流瞄準 HP 上限最高／最低的幹員',pursuer:'每損 25% HP 預告自我泯滅：跨血線前先上盾',saint:'單發重擊後下一回合換彈'}[k];
     if(st)tag=['首領機制',st+(hint?'：'+hint:''),st];else if(hint)tag=['首領機制',hint,hint.split(/[：，；]/)[0]]}}
   if(!tag)continue;const el=document.createElement('div');el.className='fd-mech-tag'+(warn?' is-warn':'')+(crowded?' is-short':'');el.title=tag[0]+'：'+tag[1];el.setAttribute('aria-label',el.title);el.innerHTML='<b>'+esc(tag[0])+'</b><span>'+esc(crowded?tag[2]:tag[1])+'</span>';(card.querySelector('.v113-enemy-vital')?.parentNode||card).append(el)}} /* 2026-11-22：移除沒有官方模型的「積雪銀凇」，名冊改由「爪獸」遞補；舊存檔中的收容／研究／圖鑑紀錄一併移除（只執行一次）。 */
 const removedSpecies=['enemy_2047_smtree'];
 function purgeRemovedSpecies(){if(typeof db==='undefined'||!db||db.removedSpecies36)return;let changed=false;const c=db.capture,gone=new Set();
  if(c?.instances){const keep=c.instances.filter(x=>{if(removedSpecies.includes(x.species)){gone.add(x.uid);return false}return true});if(keep.length!==c.instances.length){c.instances=keep;changed=true}}
  for(const id of removedSpecies){if(c?.research?.[id]){delete c.research[id];changed=true}if(db.world?.roster?.[id]){delete db.world.roster[id];changed=true}if(db.world?.seen?.[id]){delete db.world.seen[id];changed=true}}
  if(gone.size&&db.base151?.rooms)for(const r of db.base151.rooms)if(Array.isArray(r.staff))r.staff=r.staff.filter(u=>!gone.has(u));
  db.removedSpecies36=true;try{save()}catch(e){console.warn(e)}}
 (function waitBoot(n){if(window.FrontierBootReady&&typeof db!=='undefined'&&db){try{FrontierRuntime.perform('purge-removed-species',()=>{purgeRemovedSpecies();return true})}catch(e){console.warn(e)}}else if(n<200)setTimeout(()=>waitBoot(n+1),250)})(0); /* 戰術獎勵「精簡牌組／戰術研習」：用實際卡面列出全部卡牌（每列 3 張，可上下捲動），點卡即選擇。 */
 function deckPicker(){const r=R(),s=r?.reward?.strategy;if(!s||!['remove','upgrade'].includes(s.stage)||typeof cardHtml!=='function')return;
  const body=document.querySelector('#app .screen-workspace-body')||document.querySelector('#app');if(!body||body.querySelector('.fd-card-grid'))return;
  for(const b of body.querySelectorAll('button'))if(/開啟卡牌列表/.test(b.textContent))b.remove();
  const title=document.createElement('h3');title.className='fd-card-title';title.textContent=(s.stage==='upgrade'?'選擇要升級的卡牌':'選擇要移除的卡牌')+'（共 '+r.deck.length+' 張）';
  const grid=document.createElement('div');grid.className='fd-card-grid';
  grid.innerHTML=r.deck.map((c,i)=>{let html='';try{html=cardHtml(c,i,'reward')}catch{html='<button class="play-card">'+esc(c.id)+'</button>'}return '<div class="fd-card-slot" data-fd-card="'+i+'">'+html+'</div>'}).join('');
  for(const el of grid.querySelectorAll('[onclick]'))el.removeAttribute('onclick');
  for(const slot of grid.querySelectorAll('[data-fd-card]')){const i=Number(slot.dataset.fdCard),c=r.deck[i],disabled=s.stage==='upgrade'&&typeof FrontierStrategy.canUpgrade==='function'&&!FrontierStrategy.canUpgrade(c);if(disabled)slot.classList.add('is-disabled');slot.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!disabled)FrontierStrategy.pickCard(i)},true)}
  const anchor=[...body.querySelectorAll('h3,h2')].find(h=>/選擇移除|選擇升級/.test(h.textContent));if(anchor){anchor.replaceWith(title)}else body.prepend(title);title.after(grid)} /* 戰後戰術奇物：和其他戰利品顯示在同一區；普通作戰直接取得 1 個，緊急作戰／首領二選一。 */
 function curioDrops(){const r=R();if(page!=='run'||!r||r.result)return;const s=window.FrontierCurios?.curios?.();if(!s)return;
  if(!r.reward){if(s.lastAuto)delete s.lastAuto;return}
  document.querySelectorAll('.curio-offer-entry').forEach(n=>n.remove());
  const list=document.querySelector('#app .reward-stage-items'),host=list||document.querySelector('#app .compact-reward-content')||document.querySelector('#app .screen-workspace-body');if(!host||host.querySelector('.fd-curio-drop'))return;
  const D=FrontierCurioData.forRun(R()),offer=s.offers?.[0],got=!offer&&s.lastAuto&&D[s.lastAuto.id]?s.lastAuto.id:null;if(!offer&&!got)return;
  /* 戰後戰術奇物：與其他戰利品同樣的方框；多選時在方框內直接點選。 */
  const box=document.createElement('article');box.className='rewards151-block fd-curio-drop';
  if(offer){box.innerHTML='<div class="fd-curio-choices">'+offer.ids.map(id=>'<button type="button" data-fd-claim="'+id+'" aria-label="選擇 '+esc(D[id]?.name||id)+'">'+FrontierCurios.icon(id)+'<b>'+esc(D[id]?.name||id)+'</b><small>'+esc(D[id]?.effect||'')+'</small></button>').join('')+'</div>';
   box.addEventListener('click',e=>{const c=e.target.closest('[data-fd-claim]');if(c)FrontierCurios.claim(offer.key,c.dataset.fdClaim)})}
  else box.innerHTML='<div class="rewards151-art">'+FrontierCurios.icon(got)+'</div><div><h3>'+esc(D[got].name)+'</h3><p>'+esc(D[got].effect||'')+'</p></div>';
  if(list)list.append(box);else host.append(box)}
 /* 有待選戰術奇物時不另開彈窗，改捲到戰利品方框。 */
 if(typeof modal==='function'){const baseModal=modal;window.modal=modal=function(title,...rest){if(String(title).startsWith('戰術戰術奇物 · 選擇')&&R()?.reward){const box=document.querySelector('.fd-curio-drop');if(box){box.scrollIntoView({block:'center',behavior:'smooth'});box.animate?.([{outline:'2px solid #d4eb96'},{outline:'2px solid transparent'}],{duration:900})}toast('PRTS｜請先在戰利品中選擇戰術奇物。');return}return baseModal(title,...rest)}} /* 詭異行商商品格式（刷新後亦同）：0～1 結局藏品（地區模組另行附加）、1 個依層數的箱子、1 張單一職業招募券、
    3 個戰術奇物、2 個裝備詞條、2～3 個依層數的素材（最低綠色）。 */
 if(window.FrontierTrading?.fieldMerchant){const buildMerchant=FrontierTrading.fieldMerchant;FrontierTrading.fieldMerchant=function(node){buildMerchant(node);const r=R(),e=r?.event;if(e?.type!=='fieldMerchant'||!r.recruitment144&&!r.expedition)return;
  const layer=r.expedition.layer||0,seed=h32([r.number,node.id,e.talentRefresh43||0,'merchant149'].join(':')),rnd=k=>h32(seed+':'+k);
  const defs=FrontierInventory.definitions,rows=e.rows,box=rows.find(x=>x.type==='container'),curios=rows.filter(x=>x.type==='curio').slice(0,3);
  const modulePool=Object.values(defs).filter(d=>d.category==='runModule'),owned=new Set((r.equipment139?.modules||[]).map(m=>m.id)),fresh=modulePool.filter(d=>!owned.has(d.id)),pool=fresh.length>=2?fresh:modulePool;
  const modules=[];for(let i=0;modules.length<2&&i<pool.length*2&&pool.length;i++){const d=pool[rnd('module'+i)%pool.length];if(!modules.some(m=>m.item===d.id))modules.push({id:'module:'+modules.length,type:'module',item:d.id,qty:1,price:18+12*(d.occupancy||1)})}
  const roleList=window.FrontierExpeditionRecruit144?.roles||['PIONEER','WARRIOR','TANK','SNIPER','CASTER','MEDIC','SUPPORT','SPECIAL'];
  const ticket=r.recruitment144?{id:'ticket144',type:'ticket144',role:roleList[rnd('role')%roleList.length],qty:1,price:20+Math.min(10,Math.round(layer*2.5))}:null;
  const tiers=[3,3,4,4,5,5,5],count=2+rnd('matcount')%2,families=Object.keys(FrontierProgress.families),mats=[];
  for(let i=0;i<count;i++){const tier=Math.max(3,Math.min(5,tiers[layer]+(rnd('tier'+i)%3===0?1:0)));mats.push({id:'material:'+i,type:'material',item:FrontierProgress.materialId(families[rnd('fam'+i)%families.length],Math.min(5,tier)),qty:tier===3?3:tier===4?2:1,price:{3:14,4:22,5:38}[Math.min(5,tier)]})}
  e.rows=[box,ticket,...curios,...(r.equipment139?modules:[]),...mats].filter(Boolean);e.rows=e.rows.filter(row=>FrontierEnvironment.marketAvailable(row));for(const row of e.rows)row.price=FrontierEnvironment.marketPrice(row.price);e.format149=true;save();render()}}
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
 function alertHud(){const r=R();if(!r?.expedition||r.result)return;const box=document.querySelector('.command148-hud');if(!box)return;document.querySelectorAll('.fd-alert').forEach(n=>n.remove());const v=alertOf(r),label=alertBands.find(([m])=>v<m)[1];
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
  fx.innerHTML='<div class="fd-rfx-flash"></div><div class="fd-rfx-band"></div><img class="fd-rfx-art" src="'+esc(art)+'" alt=""><div class="fd-rfx-info"><small>'+(promoted?'晉升':'招募成功')+' <img class="fd-rfx-elite" src="assets/elite/e'+now[id]+'.png" alt="精英'+(['零','一','二'][now[id]]||now[id])+'">'+'</small><b>'+esc(u.name||id)+'</b><span class="fd-rfx-stars" role="img" aria-label="'+(u.rarity||3)+'星">'+'<img src="assets/rarity/original-'+(u.rarity||3)+'.png" alt="" draggable="false">'+'</span><em>'+esc(u.role||'')+'</em></div><button type="button" class="fd-rfx-skip">跳過 ›</button>';
  const done=()=>{fx.classList.add('out');setTimeout(()=>fx.remove(),220)};fx.querySelector('.fd-rfx-skip').onclick=done;fx.addEventListener('click',e=>{if(e.target===fx)done()});document.body.append(fx);setTimeout(()=>{if(fx.isConnected)done()},2400)}
 let packSyncing=false;
 function packRoster(){if(packSyncing||!window.FrontierPack?.needsRosterSync?.())return;if(FrontierRuntime.busy){setTimeout(packRoster,300);return}packSyncing=true;setTimeout(async()=>{try{await FrontierRuntime.perform('pack-roster-sync',()=>{FrontierPack.syncRoster();save();return true})}finally{packSyncing=false}render()},0)}
 let encounterSeen142=null,encounterOverlay142=null,encounterBoot147=!!window.FrontierBootReady;
 window.addEventListener("frontier:boot",()=>{const r=R(),id=r?.battle?.operatorBattleId;encounterSeen142=id?r.number+":"+id:null;encounterBoot147=true},{once:true});
 function encounter142(){
  const r=R(),id=r?.battle?.operatorBattleId,key=id?r.number+':'+id:null;
  if(!window.FrontierBootReady||!encounterBoot147){encounterSeen142=key;return}
  if(!key||page!=='run'){encounterOverlay142?.remove();encounterOverlay142=null;return}
  if(key===encounterSeen142)return;encounterSeen142=key;
  encounterOverlay142?.remove();encounterOverlay142=null;
  if(window.FrontierMotion?.reduced()||document.hidden)return;
  const esc147=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),region=FrontierExpedition.regions.find(x=>x.id===r.expedition?.regionId)?.name||'邊境區域',type={battle:'作戰',ambush:'遭遇作戰',elite:'緊急作戰',boss:'首領作戰'}[r.battle.type]||'作戰';
  const el=document.createElement('aside');el.className='encounter142 entry147';el.dataset.duration='1000';el.setAttribute('popover','manual');el.setAttribute('aria-hidden','true');
  el.innerHTML='<div class="entry147-title"><img src="assets/ui-sami148/node_battle.png" alt=""><small>OPERATION</small><b>'+type+'</b><span>'+esc147(region)+' · 第 '+(r.expedition?.layer||1)+' 層</span><i></i></div>';
  document.body.append(el);try{el.showPopover?.()}catch{}encounterOverlay142=el;
  const animation=el.animate?.([{opacity:0},{opacity:1,offset:.12},{opacity:1,offset:.68},{opacity:0}],{duration:1000,easing:'linear',fill:'both'});
  el.firstElementChild.animate?.([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)',offset:.22},{opacity:1,transform:'translateY(0)',offset:.72},{opacity:0,transform:'translateY(-5px)'}],{duration:1000,easing:'cubic-bezier(.2,.65,.3,1)',fill:'both'});
  const remove=()=>{el.remove();if(encounterOverlay142===el)encounterOverlay142=null};if(animation)animation.finished.then(remove,remove);setTimeout(remove,1080);
 }
 const prior=render;render=function(...args){const out=prior(...args);try{decorate();encounter142();keyHints();merchantLimit();battleMarks();mechTags();packRoster();deckPicker();curioDrops();merchantTicketCard();alertHud();eventAlertNote();campAlertOption();recruitFx();if(R()?.event?.type==='fieldMerchant'){setTimeout(merchantLimit,60);setTimeout(merchantLimit,300)}}catch(error){console.error(error)}return out};
 window.addEventListener('resize',()=>{if(sheet)redraw()});
 return{toggle,close,decorate,keyHints,keycardsFor,capBattles,get sheet(){return sheet}};
})();

/* 已保存的取得結果提示。只讀交易前後差異；不抽獎、不改物品、不阻擋輸入。 */
window.FrontierAcquisition140=(()=>{
 const pending=[];let active=null,timer=null;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function holdings(s){const r=s?.run,out=new Map();if(!r)return out;
  const add=(kind,id,qty,extra)=>{if(!qty)return;const key=kind+':'+id,v=out.get(key)||{kind,id,qty:0,...extra};v.qty+=qty;out.set(key,v)};
  add('currency','ingot',r.fieldPoints||0,{name:'源石碇'});add('survey','survey',r.survey16?.surveyIndex||0,{name:'勘探點數'});
  for(const [id,n]of Object.entries(r.field?.materials||{}))add('item',id,n);
  for(const id of r.bag||[])add('item',id,1);
  for(const i of r.itemCargo||[])add('item',i.itemId,i.qty||1);
  for(const i of r.secureGrid?.items||[])add('item',i.id,i.qty||1);
  for(const [id,n]of Object.entries(r.grid?.ground||{}))add('item',id,n,{ground:true});
  for(const i of r.grid?.groundItems||[])add('item',i.itemId,i.qty||1,{ground:true});
  for(const id of r.grid?.groundRelics||[])add('item',id,1,{ground:true});
  for(const path of ['fate','exchange','fourth']){const branch=r.endingRoute?.branches?.[path];if(branch&&branch.phase!=='open'&&branch.phase!=='abandoned'){const region=r.expedition?.regionId,route=path==='fourth'?FrontierRegionDesign75.regions[region]:FrontierEndings.definitions[region]?.[path];if(route)add('story',path,1,{name:route.key,region})}}
  for(const i of r.curios?.owned||[])add('curio',i.id,1);
  for(const i of r.equipment139?.modules||[])add('module',i.id,1);
  for(const t of r.recruitment144?.tickets||[])if(!t.used)add('ticket',t.id,1,{ticket:t});
  for(const t of r.recruitment144?.fragments||[])add('fragment',t.id,1,{ticket:t});
  return out;
 }
 function card(row){const d=FrontierInventory.definitions[row.id],c=row.kind==='curio'&&FrontierCurioData.forRun(R())[row.id];
  const art=row.kind==='currency'?'<img src="assets/currencies/ingot-flat139.png" alt="">':row.kind==='survey'?'<img src="assets/ui-sami148/icon.png" alt="">':row.kind==='story'?'<img src="assets/regions/'+esc(({chernobog:'ursus',kazdel:'babel'})[row.region]||row.region)+'.png" alt="">':c?FrontierCurios.icon(row.id):['ticket','fragment'].includes(row.kind)?FrontierRecruit152.art(row.ticket,row.kind==='fragment'):FrontierIcons.html(row.id);
  const name=row.name||c?.name||d?.name||row.ticket?.name||(row.kind==='fragment'?'招募殘頁':row.id);
  const heading=row.kind==='currency'?'取得源石碇':row.kind==='survey'?'取得勘探點數':row.kind==='story'?'取得劇情證物':c?'取得戰術奇物':row.kind==='module'?'取得增幅模組':row.kind==='ticket'?'取得招募券':row.kind==='fragment'?'取得招募殘頁':d?.category==='collection'?'取得收藏品':d?.category==='medicine'?'取得戰術補給':d?.category==='captureDevice'?'取得收容裝置':'取得物資';
  return '<article class="acq140-card"><div class="acq140-art">'+art+'</div><div><small>'+heading+'</small><b>'+esc(name)+'</b><span>×'+row.qty+'</span></div></article>';
 }
 function target(row){if(row.kind==='currency')return document.querySelector('.command148-ingot,.ingot145-wallet');if(row.kind==='survey')return document.querySelector('.command148-survey,.survey16-indicator');const key=row.kind==='curio'?'curio':row.kind==='ticket'||row.kind==='fragment'?'ticket':row.kind==='module'?'module':'bag';return document.querySelector('[data-fd-key="'+key+'"]')||document.querySelector(key==='bag'?'[data-battle-tool="supply"]':key==='curio'?'.curio-entry':'.screen-combat-actions');}
 function next(){if(active||!pending.length)return;const batch=pending.splice(0,3),run=R()?.number;if(!R()||R().result){pending.length=0;return}const host=document.createElement('aside');host.className='acq140';host.setAttribute('popover','manual');host.setAttribute('role','status');host.setAttribute('aria-live','polite');host.innerHTML=batch.map(card).join('');document.body.append(host);try{host.showPopover?.()}catch{}active=host;
  const reduced=window.FrontierMotion?.reduced();host.animate?.([{opacity:0,transform:'translate(-50%,-43%) scale(.93)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{duration:reduced?70:210,easing:'cubic-bezier(.2,.75,.2,1)',fill:'both'});
  timer=setTimeout(()=>{if(R()?.number!==run||R()?.result){clear();return}const cards=[...host.children];let remain=cards.length;for(const [i,el]of cards.entries()){const box=el.getBoundingClientRect(),to=target(batch[i])?.getBoundingClientRect(),x=(to?to.left+to.width/2:innerWidth*.15)-(box.left+box.width/2),y=(to?to.top+to.height/2:innerHeight-58)-(box.top+box.height/2);const a=el.animate?.(reduced?[{opacity:1},{opacity:0}]:[{transform:'translate(0,0) scale(1)',opacity:1,offset:0},{transform:'translate('+x*.2+'px,'+y*.12+'px) scale(1.04)',opacity:1,offset:.22},{transform:'translate('+x+'px,'+y+'px) scale(.12)',opacity:.15,offset:1}],{duration:reduced?140:620,delay:reduced?0:i*65,easing:'cubic-bezier(.45,0,.65,1)',fill:'forwards'});const done=()=>{if(--remain===0){host.remove();if(active===host)active=null;next()}};if(a)a.finished.then(done,done);else done()}},1200);
 }
 function clear(){clearTimeout(timer);active?.remove();active=null;pending.length=0}
 // Announce only hidden event outcomes; purchases, visible choices and loot reviews already identify their rewards.
 function context(){const e=R()?.event;if(page!=='run'||!e||R()?.battle||R()?.reward||!['frontierEvent','traveler','stash'].includes(e.type)||e.id==='gift_choice')return null;const box=document.querySelector('.event135-options,.event-panel,.regional-encounter121');if(!box)return null;return{text:box.textContent,ids:new Set([...box.querySelectorAll('[data-item-id],[data-curio]')].map(n=>n.dataset.itemId||n.dataset.curio))}}
 function needsNotice(before,after,row,known){
  const e=before.run?.event;if(!e||!['frontierEvent','traveler','stash'].includes(e.type)||e.id==='gift_choice'||['currency','survey'].includes(row.kind))return false;
  if(['gift_exchange','ending_exchange_entry'].includes(e.id)&&after.run?.event?.exchangeResult)return true;
  if(row.kind==='curio'&&before.run.curios?.offers?.some(o=>o.ids.includes(row.id)))return false;
  const d=FrontierInventory.definitions[row.id],c=row.kind==='curio'&&FrontierCurioData.forRun(after.run)[row.id],name=row.name||c?.name||d?.name||row.ticket?.name;
  const event=after.run?.event,text=[event?.familiar136?.result,event?.recreation139?.result].filter(Boolean).join(' ');
  return !(known?.ids?.has(row.id)||name&&(text.includes(name)||known?.text?.includes(name)||FrontierAdventure.events[e.id]?.choice?.includes(name)));
 }
 function committed(before,after,label,known){if(!before.run||before.run.number!==after.run?.number||before.run.result||after.run.result||/^(?:system-save|profile|grid-|secure-|team20)/.test(label))return;// Battle drops and tactical choices already have their own reward presentation.
 if(before.run.battle||after.run.battle||before.run.reward||after.run.reward)return;const source=before.run.event;if(!source||!['frontierEvent','traveler','stash'].includes(source.type)||source.id==='gift_choice')return;const old=holdings(before),now=holdings(after),rows=[];for(const [key,row]of now){const qty=row.qty-(old.get(key)?.qty||0);if(qty>0&&needsNotice(before,after,row,known))rows.push({...row,qty})}if(!rows.length)return;const notice=document.querySelector('#toast[data-level=info]');if(notice&&/^(?:PRTS[｜：]\s*)?(?:額外物資|權限獎勵|已購入|已取得|獲得|取得|收下|找到)/.test(notice.querySelector('.prts-notice-message')?.textContent||'')){notice.classList.remove('show');try{notice.hidePopover?.()}catch{}}for(const row of rows){const existing=pending.find(v=>v.kind===row.kind&&v.id===row.id);if(existing)existing.qty+=row.qty;else pending.push(row)}next()}
 return{committed,holdings,needsNotice,context,clear,get pending(){return pending.length},get active(){return active}};
})();
