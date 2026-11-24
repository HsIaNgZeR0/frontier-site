'use strict';
/* 澄閃戰鬥顯示：鎖定敵人身上的浮標、回合末浮標飛擊／自爆特效、招牌全螢幕演出。
   浮標圖示取自官方戰鬥 Spine 圖集（char_377_gdglow：C_Weapon_A_a），素材 © Hypergryph。 */
window.FrontierGoldenglowUI=(()=>{
 const ID='char_377_gdglow',ICON='assets/goldenglow/float.png';
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 let seenEvents=0,seenBattle=null,seenCasts=0;
 const actor=()=>R()?.battle&&(R().team||[]).find(a=>a.operator===ID&&a.hp>0&&!a.exited);
 const enemyEl=e=>document.querySelector('.enemy-card[data-enemy-id="'+CSS.escape(String(e.id))+'"]')||document.querySelector('.enemy-card[data-enemy-id="'+CSS.escape(String(e.uid))+'"]');
 const avatarEl=a=>document.querySelector('.v113-actor-row[data-operator-uid="'+CSS.escape(a.uid)+'"] .avatar');
 function icon(cls){const i=document.createElement('img');i.src=ICON;i.alt='';i.draggable=false;i.className=cls;return i}
 /* 鎖定敵人：顯示瞄準它的浮標數與連續階段 */
 function markers(a){
  document.querySelectorAll('.gg-lock-marker').forEach(n=>n.remove());
  const g=a?.gg;if(!g)return;const b=R().battle;
  const groups=new Map();
  for(const f of g.floats){const uid=f.split?f.target:g.lock;if(!uid)continue;(groups.get(uid)||groups.set(uid,[]).get(uid)).push(f)}
  for(const [uid,list] of groups){const e=b.enemies.find(x=>x.uid===uid&&x.hp>0);const el=e&&enemyEl(e);if(!el)continue;
   const box=document.createElement('span');box.className='gg-lock-marker';box.setAttribute('aria-label','澄閃浮標 '+list.length+' 個鎖定中');
   for(const f of list){const pip=document.createElement('span');pip.className='gg-lock-pip'+(f.temp?' temp':'')+(f.extra?' extra':'');pip.append(icon(''));const st=document.createElement('b');st.textContent=f.stage||'';pip.append(st);box.append(pip)}
   if(getComputedStyle(el).position==='static')el.style.position='relative';el.append(box)}
 }
 /* 回合末事件動畫 */
 function fly(from,to,delay,kind){
  const node=icon('gg-fly'+(kind==='explosion'?' boom':''));
  const x0=from.left+from.width/2,y0=from.top+from.height/2,x1=to.left+to.width/2,y1=to.top+to.height*.45;
  Object.assign(node.style,{left:x0+'px',top:y0+'px'});document.body.append(node);
  node.animate([{transform:'translate(-50%,-50%) scale(.6) rotate(0deg)',opacity:0},{transform:'translate(-50%,-50%) scale(1) rotate(-20deg)',opacity:1,offset:.2},{transform:`translate(calc(-50% + ${x1-x0}px),calc(-50% + ${y1-y0}px)) scale(1.1) rotate(25deg)`,opacity:1}],{duration:420,delay,easing:'cubic-bezier(.3,.1,.3,1)',fill:'both'}).finished.then(()=>{node.remove();spark(x1,y1,kind)});
 }
 function spark(x,y,kind){
  const s=document.createElement('span');s.className='gg-spark '+kind;Object.assign(s.style,{left:x+'px',top:y+'px'});document.body.append(s);
  if(kind==='explosion'){const t=document.createElement('span');t.className='gg-pa';t.textContent='啪！';Object.assign(t.style,{left:x+'px',top:(y-28)+'px'});document.body.append(t);setTimeout(()=>t.remove(),900)}
  setTimeout(()=>s.remove(),kind==='explosion'?700:420);
 }
 function playEvents(a,events){
  if(reduced()||!a)return;const av=avatarEl(a);if(!av)return;const from=av.getBoundingClientRect(),b=R().battle;let delay=0;
  for(const e of events){const enemy=b.enemies.find(x=>x.uid===e.target);const el=enemy&&enemyEl(enemy)||document.querySelector('.enemy-card');if(!el)continue;const to=el.getBoundingClientRect();
   if(e.goldenglow==='float'){fly(from,to,delay,'float');delay+=110}
   else if(e.goldenglow==='explosion'||e.goldenglow==='splash'){setTimeout(()=>spark(to.left+to.width/2,to.top+to.height*.45,e.goldenglow==='explosion'?'explosion':'splash'),delay+300);delay+=e.goldenglow==='explosion'?160:60}
   else if(e.goldenglow==='conduct'){setTimeout(()=>spark(to.left+to.width/2,to.top+to.height*.45,'float'),delay);delay+=80}}
 }
 /* 招牌：通用切入播放三技能施放動作；這裡另加粉色電弧與環繞浮標 */
 function signatureShow(){
  if(reduced())return;const o=document.createElement('div');o.className='gg-sig-show';o.setAttribute('aria-hidden','true');
  o.innerHTML='<i class="gg-sig-flash"></i><i class="gg-sig-arc a1"></i><i class="gg-sig-arc a2"></i><i class="gg-sig-arc a3"></i>';
  const ring=document.createElement('span');ring.className='gg-sig-ring';for(let i=0;i<6;i++){const f=icon('');f.style.setProperty('--i',i);ring.append(f)}o.append(ring);
  document.body.append(o);setTimeout(()=>o.remove(),1700);
 }
 function decorate(){
  const a=actor(),b=R()?.battle;if(!b){seenBattle=null;return}
  if(seenBattle!==b.operatorBattleId){seenBattle=b.operatorBattleId;seenEvents=(b.operatorEvents||[]).length;seenCasts=a?b.signatureState?.actors?.[a.uid]?.casts||0:0}
  if(!a)return;markers(a);
  const events=b.operatorEvents||[];if(events.length<seenEvents)seenEvents=0;
  const fresh=events.slice(seenEvents).filter(e=>e.goldenglow&&e.source===a.uid);seenEvents=events.length;
  if(fresh.length)requestAnimationFrame(()=>playEvents(a,fresh));
  const casts=b.signatureState?.actors?.[a.uid]?.casts||0;if(casts>seenCasts)signatureShow();seenCasts=casts;
 }
 const prior=render;render=function(){const out=prior.apply(this,arguments);try{if(page==='run')decorate()}catch(e){console.warn('goldenglow ui',e)}return out};
 return {decorate,signatureShow};
})();
