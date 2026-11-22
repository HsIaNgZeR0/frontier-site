'use strict';
// 招募拆袋演出：拖動拉鍊拆開人事袋，未完全拉開前由縫隙透出的光色判斷最高稀有度；
// 多抽逐一揭曉，可略過，最後以兩排直條顯示全部結果。
window.FrontierRecruitBag=(()=>{
 const F=FrontierRecruitment,UI=FrontierRecruitmentUI,units=FrontierCapture.units;
 const glow={3:'#a9dcff',4:'#c78cff',5:'#ffd95a',6:'#ff9b2f'};
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const art=id=>'assets/operators/'+(id==='texas_the_omertosa'?'char_1028_texas2':id)+'-full.png';
 const style=document.createElement('style');style.textContent=`
#rbag{position:fixed;inset:0;z-index:9000;background:radial-gradient(circle at 50% 40%,#2a2f36,#0b0d10 70%);color:#eef3f7;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;font-family:inherit}
#rbag .rb-skip{position:absolute;top:max(12px,env(safe-area-inset-top));right:16px;min-width:64px;min-height:44px;padding:0 14px;background:rgba(0,0,0,.45);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:2px;font-weight:700;letter-spacing:.1em;z-index:3}
#rbag .rb-hint{margin-top:28px;font-size:13px;letter-spacing:.12em;opacity:.75;text-align:center;padding:0 16px}
#rbag .rb-bag{position:relative;width:min(78vw,320px);aspect-ratio:3/4;border-radius:10px 10px 18px 18px;background:linear-gradient(160deg,#3c444d,#1d2228 70%);box-shadow:0 20px 60px rgba(0,0,0,.6),inset 0 0 0 2px rgba(255,255,255,.08)}
#rbag .rb-bag::before{content:'RHODES ISLAND';position:absolute;left:0;right:0;top:46%;text-align:center;font-size:12px;letter-spacing:.35em;opacity:.35}
#rbag .rb-bag::after{content:'';position:absolute;left:50%;top:56%;width:56px;height:56px;transform:translateX(-50%) rotate(45deg);border:2px solid rgba(255,255,255,.16)}
#rbag .rb-seam{position:absolute;left:8%;right:8%;top:14%;height:10px;border-radius:5px;background:repeating-linear-gradient(90deg,#8b949e 0 4px,#59616a 4px 8px)}
#rbag .rb-open{position:absolute;left:8%;top:14%;height:10px;width:0;border-radius:5px;background:#0b0d10;box-shadow:0 0 0 0 var(--g)}
#rbag .rb-light{position:absolute;left:8%;top:calc(14% - 160px);height:170px;width:0;pointer-events:none;background:linear-gradient(to top,var(--g),transparent);filter:blur(6px);opacity:0;mix-blend-mode:screen}
#rbag .rb-rays{position:absolute;inset:-40%;pointer-events:none;opacity:0;background:repeating-conic-gradient(from 0deg at 50% 22%,transparent 0 9deg,var(--g) 10deg 12deg,transparent 13deg 22deg);mix-blend-mode:screen;filter:blur(2px)}
#rbag .rb-fire{position:absolute;left:8%;right:8%;top:14%;height:0;pointer-events:none;opacity:0}
#rbag .rb-fire i{position:absolute;bottom:0;width:var(--s);height:calc(var(--s)*2.2);border-radius:50% 50% 45% 45%/60% 60% 40% 40%;background:radial-gradient(ellipse at 50% 80%,#fff6c8 0,#ffc23a 30%,#ff6a12 60%,rgba(200,30,0,0) 75%);filter:blur(1px);mix-blend-mode:screen;transform-origin:50% 100%;animation:rbfire var(--d) ease-out infinite;animation-delay:var(--w);opacity:0}
#rbag .rb-fire b{position:absolute;bottom:0;width:3px;height:3px;border-radius:50%;background:#ffd27a;box-shadow:0 0 6px 2px #ff7a1a;animation:rbspark var(--d) linear infinite;animation-delay:var(--w);opacity:0}
@keyframes rbfire{0%{transform:translateY(4px) scale(.5,.4);opacity:0}25%{opacity:1}100%{transform:translateY(calc(var(--h)*-1)) scale(.25,.9) rotate(var(--r));opacity:0}}
@keyframes rbspark{0%{transform:translate(0,0);opacity:0}15%{opacity:1}100%{transform:translate(var(--x),calc(var(--h)*-1.6));opacity:0}}
#rbag .rb-handle{position:absolute;top:calc(14% - 17px);left:calc(8% - 22px);width:44px;height:44px;border-radius:50%;background:#d9dee3;border:3px solid #6d757e;box-shadow:0 4px 12px rgba(0,0,0,.5);cursor:grab}
#rbag .rb-handle::after{content:'';position:absolute;left:50%;top:100%;width:8px;height:22px;transform:translateX(-50%);background:#d9dee3;border-radius:0 0 4px 4px}
#rbag .rb-open-btn{margin-top:14px;min-height:44px;padding:0 18px;background:transparent;color:#cfd6dc;border:1px solid rgba(255,255,255,.3)}
#rbag.rb-flash::after{content:'';position:absolute;inset:0;background:var(--g);animation:rbflash .55s ease-out forwards;pointer-events:none}
@keyframes rbflash{from{opacity:.95}to{opacity:0}}
#rbag .rb-card{position:relative;width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;cursor:pointer}
#rbag .rb-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center 30%;animation:rbslide .5s ease-out}
#rbag .rb-card .rb-info{position:relative;width:100%;padding:24px 16px max(28px,env(safe-area-inset-bottom));background:linear-gradient(transparent,rgba(0,0,0,.85) 40%);text-align:left}
#rbag .rb-stars{color:var(--g);font-size:22px;letter-spacing:2px;text-shadow:0 0 10px var(--g)}
#rbag .rb-info h2{margin:4px 0;font-size:30px}
#rbag .rb-info p{margin:0;font-size:13px;opacity:.8}
#rbag .rb-count{position:absolute;top:max(18px,env(safe-area-inset-top));left:16px;font-size:13px;opacity:.7;letter-spacing:.1em}
@keyframes rbslide{from{transform:translateX(18%);opacity:0}to{transform:none;opacity:1}}
#rbag .rb-sum{width:100%;max-width:640px;padding:60px 16px 16px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;height:100%}
#rbag .rb-row{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;flex:1;min-height:0}
#rbag .rb-strip{position:relative;overflow:hidden;background:#1b1f24;border-top:4px solid var(--g);min-height:0;animation:rbslide .35s ease-out both}
#rbag .rb-strip img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 18%}
#rbag .rb-strip span{position:absolute;left:0;right:0;bottom:0;padding:18px 2px 6px;background:linear-gradient(transparent,rgba(0,0,0,.9));font-size:11px;text-align:center;line-height:1.25;overflow-wrap:anywhere}
#rbag .rb-strip b{display:block;color:var(--g);font-size:10px;letter-spacing:0}
#rbag .rb-done{min-height:48px;background:#e8edf1;color:#111;border:0;font-weight:800;letter-spacing:.2em}
`;document.head.append(style);
 let root=null,queue=[],index=0;
 function silent(fn){const present=UI.present;UI.present=()=>{};try{return fn()}finally{UI.present=present}}
 function close(){root?.remove();root=null;render()}
 function img(id){const i=document.createElement('img');i.src=art(id);i.alt=units[id]?.name||'';i.onerror=()=>{i.onerror=null;i.src='assets/'+units[id].image+'.png'};return i}
 function open(ids){const entries=ids.map(id=>F.ensure().results.find(e=>e.id===id)).filter(e=>e&&!e.claimed);if(!entries.length)return;root?.remove();queue=entries.map(e=>e.id);index=0;const max=Math.max(...entries.map(e=>e.star));root=document.createElement('div');root.id='rbag';root.style.setProperty('--g',glow[max]||glow[3]);root.setAttribute('role','dialog');root.setAttribute('aria-label','人事袋');document.body.append(root);bag(max)}
 function settle(){silent(()=>{for(const id of queue){const e=F.ensure().results.find(x=>x.id===id);if(e&&!e.claimed)F.revealOriginal(id)}})}
 function bag(max){root.innerHTML='<button class="rb-skip">SKIP</button><div class="rb-bag"><div class="rb-rays"></div><div class="rb-light"></div><div class="rb-seam"></div><div class="rb-open"></div><div class="rb-handle" aria-hidden="true"></div></div><p class="rb-hint">'+(queue.length>1?queue.length+' 份人事資料 · ':'')+'按住拉環向右拉開</p><button class="rb-open-btn">直接拆開</button>';
  const b=root.querySelector('.rb-bag'),h=root.querySelector('.rb-handle'),o=root.querySelector('.rb-open'),l=root.querySelector('.rb-light'),rays=root.querySelector('.rb-rays');let p=0,drag=null,done=false;
  // 六星：拉鍊縫隙冒出火焰與火星，只在已拉開的範圍內出現。
  let fire=null,flames=[];if(max>=6){fire=document.createElement('div');fire.className='rb-fire';for(let i=0;i<26;i++){const f=document.createElement(i%3===2?'b':'i'),x=Math.random();f.dataset.x=x;f.style.left=(x*100)+'%';f.style.setProperty('--s',(10+Math.random()*14)+'px');f.style.setProperty('--h',(40+Math.random()*70)+'px');f.style.setProperty('--d',(.7+Math.random()*.7)+'s');f.style.setProperty('--w',(-Math.random()*1.4)+'s');f.style.setProperty('--r',((Math.random()-.5)*30)+'deg');f.style.setProperty('--x',((Math.random()-.5)*60)+'px');fire.append(f);flames.push(f)}b.append(fire)}
  const paint=()=>{const w=b.clientWidth*.84;h.style.left='calc(8% - 22px + '+(p*w)+'px)';o.style.width=(p*w)+'px';l.style.width=(p*w)+'px';const leak=Math.max(0,Math.min(1,(p-.18)/.5));l.style.opacity=String(leak*(max>=5?1:.75));o.style.boxShadow='0 0 '+(8+leak*30)+'px '+(leak*6)+'px var(--g)';rays.style.opacity=String(max>=6?leak*.55:max>=5?leak*.25:0);if(fire){fire.style.opacity=String(Math.min(1,leak*1.4));for(const f of flames)f.style.visibility=+f.dataset.x<=p?'visible':'hidden'}};
  const finish=()=>{if(done)return;done=true;settle();root.classList.add('rb-flash');setTimeout(()=>{root.classList.remove('rb-flash');reveal()},450)};
  h.addEventListener('pointerdown',e=>{drag={x:e.clientX,p};h.setPointerCapture(e.pointerId);e.preventDefault()});
  h.addEventListener('pointermove',e=>{if(!drag)return;p=Math.max(0,Math.min(1,drag.p+(e.clientX-drag.x)/(b.clientWidth*.84)));paint();if(p>=.98){drag=null;finish()}});
  const release=()=>{if(!drag)return;drag=null;if(p>=.85){p=1;paint();finish()}else{const from=p,start=performance.now();const step=t=>{if(done||drag)return;p=from*(1-Math.min(1,(t-start)/220));paint();if(p>0)requestAnimationFrame(step)};requestAnimationFrame(step)}};
  h.addEventListener('pointerup',release);h.addEventListener('pointercancel',release);
  root.querySelector('.rb-open-btn').onclick=()=>{p=1;paint();finish()};
  root.querySelector('.rb-skip').onclick=()=>{done=true;settle();summary()};paint()}
 function reveal(){if(index>=queue.length){if(queue.length>1)summary();else close();return}const e=F.ensure().results.find(x=>x.id===queue[index]),u=units[e.operator],c=e.compensationV16;root.style.setProperty('--g',glow[e.star]||glow[3]);root.innerHTML='';const card=document.createElement('div');card.className='rb-card';card.append(img(e.operator));const info=document.createElement('div');info.className='rb-info';info.innerHTML='<div class="rb-stars">'+'★'.repeat(e.star)+'</div><h2>'+esc(u.name)+'</h2><p>'+(c?.copy>1?'重複取得 · 綠票 '+c.green+'／黃票 '+c.yellow+(c.converted?'（含溢出信物兌換）':'／信物 +1'):'新幹員已加入羅德島')+'</p><p style="margin-top:8px;opacity:.55">點擊畫面繼續</p>';card.append(info);root.append(card);if(queue.length>1){const n=document.createElement('span');n.className='rb-count';n.textContent=(index+1)+' / '+queue.length;root.append(n);const s=document.createElement('button');s.className='rb-skip';s.textContent='SKIP';s.onclick=ev=>{ev.stopPropagation();summary()};root.append(s)}card.onclick=()=>{index++;reveal()}}
 function summary(){const entries=queue.map(id=>F.ensure().results.find(x=>x.id===id)).filter(Boolean);root.style.setProperty('--g',glow[Math.max(...entries.map(e=>e.star))]);root.innerHTML='';const wrap=document.createElement('div');wrap.className='rb-sum';const rows=[entries.slice(0,5),entries.slice(5,10)].filter(r=>r.length);rows.forEach((row,r)=>{const el=document.createElement('div');el.className='rb-row';row.forEach((e,i)=>{const s=document.createElement('div');s.className='rb-strip';s.style.setProperty('--g',glow[e.star]);s.style.animationDelay=((r*5+i)*.05)+'s';s.append(img(e.operator));const t=document.createElement('span');t.innerHTML='<b>'+'★'.repeat(e.star)+'</b>'+esc(units[e.operator].name);s.append(t);el.append(s)});wrap.append(el)});const done=document.createElement('button');done.className='rb-done';done.textContent='確認';done.onclick=close;wrap.append(done);root.append(wrap)}
 // 接管：抽卡後、公開招募聘用、待揭曉封套。
 F.revealOriginal=F.reveal;
 F.reveal=id=>open([id]);
 F.revealAll=()=>open(F.ensure().results.filter(e=>!e.claimed).map(e=>e.id));
 UI.revealAll=F.revealAll;
 const pull=F.pull;F.pull=count=>{const before=new Set(F.ensure().results.map(e=>e.id));pull(count);open(F.ensure().results.filter(e=>!before.has(e.id)&&!e.claimed).map(e=>e.id))};
 F.claimPublic=id=>{const r=F.ensure(),job=r.jobs.find(x=>x.id===id&&!x.claimed);if(!job||Date.now()<job.readyAt)return;job.claimed=true;const entry=F.result(job.operator,'public');save();render();open([entry.id])};
 return{open};
})();
