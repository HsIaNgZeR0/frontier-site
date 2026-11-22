'use strict';
window.FrontierGestures=(()=>{
 const gameSurface=target=>target?.closest?.('#app,#modal,#recruit-result-dialog,#base-construction-modal,.v113-ally-drop-layer,.v113-resolution-portal');
 const editable=target=>target?.closest?.('input,textarea,select,[contenteditable="true"]');
 document.addEventListener('contextmenu',event=>{if(gameSurface(event.target)&&!editable(event.target))event.preventDefault()},true);
 document.addEventListener('selectstart',event=>{if(gameSurface(event.target)&&!editable(event.target))event.preventDefault()},true);
 document.addEventListener('dragstart',event=>{if(gameSurface(event.target)&&event.target.closest?.('img'))event.preventDefault()},true);
 // Safari can rubber-band the page if the finger leaves the card before pointer release.
 let discardTouch=null;
 document.addEventListener('touchstart',event=>{
  if(!document.body.classList.contains('in-battle')||event.touches.length!==1||!event.target.closest?.('.v113-hand .play-card,[data-drawn-discard]')){discardTouch=null;return;}
  const finger=event.changedTouches[0];discardTouch={id:finger.identifier,x:finger.clientX,y:finger.clientY};
 },{capture:true,passive:true});
 document.addEventListener('touchmove',event=>{
  if(!discardTouch||event.touches.length!==1||!event.cancelable)return;
  const finger=Array.from(event.changedTouches).find(t=>t.identifier===discardTouch.id);
  if(finger){const dy=finger.clientY-discardTouch.y,vertical=event.target.closest?.('[data-drawn-discard]')?Math.abs(dy):dy;if(vertical>=3&&vertical>=Math.abs(finger.clientX-discardTouch.x))event.preventDefault();}
 },{capture:true,passive:false});
 for(const name of ['touchend','touchcancel'])document.addEventListener(name,()=>{discardTouch=null},true);
 let drag=null,suppressUntil=0;
 const pendingCards=new Set();
 function markPending(hand){
  if(!hand||!pendingCards.size)return;
  for(const el of hand.querySelectorAll('[data-hand-index]')){
   const card=R()?.battle?.hand[el.dataset.handIndex];
   if(card&&pendingCards.has(card.uid))el.classList.add('card-play-pending');
  }
 }
 function queuePlay(state,enemy){
  const uid=state.card.uid;
  if(uid&&pendingCards.has(uid))return;
  if(uid){pendingCards.add(uid);state.el.classList.add('card-play-pending')}
  FrontierRuntime.perform('play-card-drag',()=>{const index=handIndex(state);if(index>=0){if((state.modeGuide||FrontierOperatorUIV113.targetPlan(state)?.secondary)&&enemy)FrontierOperatorUIV113.choose(index,enemy,state.modePick===true,state.gearChoices,state.secondaryTarget);else playCard(index,enemy)}}).finally(()=>{
   pendingCards.delete(uid);
   state.el.classList.remove('card-play-pending');
   const index=handIndex(state);
   if(index>=0)document.querySelector('.hand [data-hand-index="'+index+'"]')?.classList.remove('card-play-pending');
  });
 }
 function remove(){if(!drag)return;clearDamagePreview(drag);cancelAnimationFrame(drag.paintFrame);drag.highlight?.classList.remove('drag-target');clearTimeout(drag.timer);clearTimeout(drag.lockTimer);drag.hand?.classList.remove('v113-hand-inspecting');drag.ghost?.remove();drag.preview?.remove();drag.zone?.remove();drag.modeRows?.forEach(row=>row.guide.remove());drag.allies?.remove();drag.el.classList.remove('card-held');document.querySelectorAll('.drag-target').forEach(el=>el.classList.remove('drag-target'));try{drag.el.releasePointerCapture(drag.pointer)}catch{}drag=null}
 function valid(){if(!drag||R()?.number!==drag.run)return false;const b=R()?.battle;if(R()?.operatorSystemVersion===113)return !!b&&b.turn===drag.turn&&b.operatorBattleId===drag.battle.operatorBattleId&&(drag.virtualOwner?b.skills?.some(c=>c.owner===drag.virtualOwner):b.hand.some(c=>c.uid===drag.card.uid));return b===drag.battle&&b.hand[drag.index]===drag.card}
 function kindOf(state){if(state.virtualOwner){const skill=R()?.battle?.skills?.find(c=>c.owner===state.virtualOwner);return ['physical','arts','true'].includes(skill?.type)?'attack':'draw'}if(R()?.operatorSystemVersion===113){const meta=FrontierOperatorGameV113.effects.describe(state.card.id);if(meta&&(meta.attack||['enemy','enemies','highestDefEnemy','lowestDefEnemy'].includes(meta.target)))return meta.aoe?'all':'attack'}return cardStats(state.card).kind}
 function clearDamagePreview(state){clearTimeout(state.damageTimer);state.damageAnchor=undefined;for(const el of state.damageLabels||[])el.remove();state.damageLabels=[]}
 function damagePreview(anchor){
  const state=drag;
  if(!state||R()?.operatorSystemVersion!==113||!['attack','all'].includes(kindOf(state)))return;
  const key=(anchor||'*')+':'+(state.modePick===true?'enhanced':'basic')+':'+JSON.stringify(state.gearChoices||{});if(state.damageAnchor===key)return;
  clearDamagePreview(state);state.damageAnchor=key;
  const battle=R().battle;
  const targets=()=>[...document.querySelectorAll('.enemy-card[data-enemy-id]:not(:disabled)')];
  const index=state.virtualOwner?-1:battle.hand.findIndex(c=>c.uid===state.card.uid);
  const lookup=uid=>{
   if(state.previewBattle!==battle){state.previewBattle=battle;state.previewCache=new Map()}
   if(!state.previewCache.has(uid+':'+key)){
    let result;try{result=FrontierOperatorGameV113.previewOutgoing(index,state.virtualOwner,uid,state.modePick===true,state.gearChoices)}catch(error){result={error:error.message}}
    state.previewCache.set(uid+':'+key,result);
   }
   return state.previewCache.get(uid+':'+key);
  };
  function label(el,forecast){
   const result=forecast?.[el.dataset.enemyId];if(!result&&!forecast?.error)return;
   const tip=document.createElement('span');tip.className='v113-damage-preview';
   if(result){tip.textContent=(anchor?'預估 ':'以此為目標 ')+result.damage+' 傷害';tip.title='生命 −'+result.hpLoss+' · 護盾吸收 '+result.absorbed;tip.dataset.damage=result.damage}
   else{tip.textContent='目前無法施放';tip.title=forecast.error}
   el.append(tip);state.damageLabels.push(tip);
  }
  const current=()=>drag===state&&state.damageAnchor===key&&R()?.battle===battle&&valid();
  state.damageTimer=setTimeout(()=>{
   if(!current())return;
   if(anchor){const result=lookup(anchor);for(const el of targets())label(el,result);return}
   const rows=targets();
   function next(){if(!current()||!rows.length)return;const el=rows.shift();label(el,lookup(el.dataset.enemyId));if(rows.length)state.damageTimer=setTimeout(next,24)}
   next();
  },anchor?90:0);
 }
 function armLock(){if(!drag||R()?.operatorSystemVersion!==113)return;clearTimeout(drag.lockTimer);const held=drag;drag.lockTimer=setTimeout(()=>{if(drag!==held)return;drag.locked=true;if(drag.scrolling){drag.scrolling=false;drag.moving=false;drag.x=drag.lastPointerX;drag.y=drag.lastPointerY}},1000)}
 function browse(x){const card=FrontierOperatorUIV113.focusAtX(x);if(!card||card===drag.el)return;const b=R().battle,owner=card.dataset.signatureUid,index=Number(card.dataset.handIndex);drag.el.classList.remove('card-held');drag.el=card;clearDamagePreview(drag);drag.previewBattle=null;drag.virtualOwner=owner;drag.index=index;drag.card=owner?b.skills.find(c=>c.owner===owner):b.hand[index];drag.previewed=true;armLock()}
 function target(x,y){const hit=document.elementFromPoint(x,y)?.closest('.enemy-card[data-enemy-id]:not(:disabled)');if(hit)return hit;if(!matchMedia('(max-width:720px)').matches)return null;const hand=document.querySelector('.hand')?.getBoundingClientRect();if(!hand||y>=hand.top-4)return null;return [...document.querySelectorAll('.enemy-card[data-enemy-id]:not(:disabled)')].find(el=>{const r=el.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=hand.top-4})||null}
 function start(e){
  if(drag&&e.pointerId!==drag.pointer){
   const ally=e.target.closest?.('[data-ally-uid]:not([data-disabled])');
   if(!ally||!FrontierOperatorUIV113.targetPlan(drag)?.secondary)return;
   const primary=drag.primaryAlly||drag.highlight?.dataset.allyUid;
   if(!FrontierOperatorUIV113.secondaryCandidates(drag,primary).some(a=>a.uid===ally.dataset.allyUid))return;
   e.preventDefault();drag.secondaryTarget=ally.dataset.allyUid;drag.secondaryPointer=e.pointerId;
   for(const el of drag.allies?.children||[])el.classList.toggle('v133-secondary',el===ally);
   return;
  }
  const el=e.target.closest?.('.hand .play-card[data-hand-index],.hand .play-card[data-signature-uid]');if(!el||el.disabled||e.isPrimary===false||e.button>0||$('#modal')?.open)return;
  const index=Number(el.dataset.handIndex),battle=R()?.battle,virtualOwner=el.dataset.signatureUid,card=virtualOwner?battle?.skills?.find(c=>c.owner===virtualOwner):battle?.hand[index];if(!card)return;
  remove();e.preventDefault();el.setPointerCapture(e.pointerId);
  drag={virtualOwner,el,pointer:e.pointerId,index,card,battle,turn:battle.turn,run:R().number,x:e.clientX,y:e.clientY,moving:false,previewed:false,hand:el.closest('.hand'),scrollStart:el.closest('.hand').scrollLeft,lastX:e.clientX,lastAt:performance.now(),velocity:0};
  drag.timer=setTimeout(()=>{if(!drag||drag.moving)return;drag.previewed=true;if(drag.virtualOwner&&R()?.operatorSystemVersion===113){drag.preview=FrontierOperatorUIV113.signaturePreview(drag.virtualOwner);return}if(drag.hand.classList.contains('fan-hand'))return;const p=document.createElement('div');p.className='card-preview';p.textContent=cardName(card)+' · '+cardStats(card).cost+' 能量\n'+cardText(card);document.body.appendChild(p);drag.preview=p},[31,113].includes(R()?.operatorSystemVersion)?280:450);
  drag.lastPointerX=e.clientX;drag.lastPointerY=e.clientY;armLock();drag.hand.classList.add('v113-hand-inspecting');
 }
 function dragChoices(state){
  const b=R()?.battle,index=handIndex(state),resource=FrontierOperatorUIV113.attackOptions(state.card);
  const attack=['attack','all'].includes(kindOf(state));
  if(state.card.id==='curio_tactic')return [{key:'curioTactic',title:'失序命令',labels:['造成 30 傷害','獲得 30 護盾']}];
  const rows=resource?[{key:'enhance',title:'卡牌強化',labels:['基本攻擊','消耗 '+resource.cost+' '+resource.label]}]:[];
  if(!b?.equipment139Loadout?.length||index<0)return rows;
  const possible=new Set(FrontierEquipmentUI139.choiceSources(state.card).map(x=>x.src.uid+':'+x.index));
  if(!possible.size)return rows;
  const def=FrontierOperatorGameV113.effects.definitions.get(state.card.id);
  const allies=R().team.filter(a=>a.hp>0&&!a.exited);
  const owner=allies.find(a=>a.operator===def?.owner&&a.form===def?.form);
  const enemies=b.enemies.filter(e=>e.hp>0&&!e.exited&&e.targetable!==false);
  const fallback=allies.find(a=>a!==owner)?.uid||owner?.uid;
  const targets=attack?enemies:allies;
  const choices=new Map();
  probe: for(const {uid:target} of targets)for(const enhance of resource?[false,true]:[false]){
   const selection={target,enhance,mode:'normal',secondaryTarget:fallback,template:target};
   for(const x of FrontierEquipmentUI139.playChoices(index,selection)){
    const key=x.src.uid+':'+x.index;
    choices.set(key,x);
    possible.delete(key);
   }
   if(!possible.size)break probe;
  }
  for(const [key,x] of choices)rows.push({key,title:FrontierInventory.definitions[x.src.id]?.name||'裝備效果',labels:x.r.choice.map(FrontierEquipmentUI139.choiceLabel)});
  return rows;
 }
 function modeHit(row,x,y){
  return row&&y>=row.top-3&&y<=row.bottom+3&&x>=row.left-4&&x<=row.right+4;
 }
 function modePick(row,x,y,prior){
  const at=x=>x<row.middle-3?0:x>row.middle+3?1:undefined;
  if(modeHit(row,x,y))return at(x);
  if(!prior||y>=prior.y||prior.y<row.bottom||y>row.top)return;
  const t=((row.top+row.bottom)/2-prior.y)/(y-prior.y),cross=prior.x+(x-prior.x)*t;
  if(cross>=row.left-4&&cross<=row.right+4)return at(cross);
 }
 function updateAttackMode(state,x,y){
  if(state.virtualOwner||R()?.operatorSystemVersion!==113){return;}
  if(y>state.y-24&&!state.modeRows)return;
  if(!state.modeChecked){
   state.modeChecked=true;
   const handTop=state.hand.getBoundingClientRect().top;
   const entries=dragChoices(state),height=42,step=height+8,maxRows=Math.max(1,Math.floor((handTop-64)/step));
   if(!entries.length)return;
   const top=Math.max(58+(Math.min(entries.length,maxRows)-1)*step,Math.min(state.y-24,handTop-3)-height);
   state.modeRows=entries.slice(0,maxRows).map((entry,i)=>{
    const guide=document.createElement('div');
    guide.className='v113-drag-modes';
    guide.setAttribute('aria-hidden','true');
    guide.style.top=top-i*step+'px';
    guide.dataset.waiting=String(i>0);
    for(const [n,label] of entry.labels.entries()){
     const option=document.createElement('span');
     const title=document.createElement('small');title.textContent=entry.title;
     const text=document.createElement('b');text.textContent=n?'→ '+label:'← '+label;
     option.append(title,text);guide.append(option);
    }
    document.body.append(guide);
    return {...entry,guide,top:top-i*step,bottom:top-i*step+height,left:10,right:innerWidth-10,middle:innerWidth/2};
   });
   state.modeGuide=state.modeRows[0].guide;
   state.modePointer={x,y};
   return;
  }
  const next=state.modeRows?.find(row=>row.picked===undefined);
  const prior=state.modePointer;
  state.modePointer={x,y};
  if(!next)return;
  const pick=modePick(next,x,y,prior);
  if(pick===undefined)return;
  next.picked=pick;
  if(next.key==='enhance')state.modePick=pick===1;
  else if(next.key==='curioTactic')state.curioTactic=pick?'shield':'attack';
  else (state.gearChoices??={})[next.key]=pick;
  next.guide.dataset.chosen=pick?'enhance':'basic';
  const higher=state.modeRows.find(row=>row.picked===undefined);
  if(higher)higher.guide.dataset.waiting='false';
  clearDamagePreview(state);
 }
 function move(e){
  if(!drag||e.pointerId!==drag.pointer)return;if(!valid()){remove();return}e.preventDefault();
  if(!drag.moving&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<9)return;
  drag.lastPointerX=e.clientX;drag.lastPointerY=e.clientY;
  if(!drag.locked&&!drag.moving&&Math.abs(e.clientX-drag.x)>18&&Math.abs(e.clientY-drag.y)<12&&Math.abs(e.clientX-drag.x)>Math.abs(e.clientY-drag.y)*2.2){drag.moving=true;drag.scrolling=true;clearTimeout(drag.timer);drag.preview?.remove()}
  if(drag.scrolling&&drag.hand.classList.contains('v113-hand')&&Math.abs(e.clientY-drag.y)>=32){drag.scrolling=false;drag.moving=false;drag.locked=true;clearTimeout(drag.lockTimer)}
  if(drag.scrolling&&drag.hand.classList.contains('v113-hand')){browse(e.clientX);return}if(drag.scrolling){const now=performance.now();drag.velocity=(drag.lastX-e.clientX)/Math.max(1,now-drag.lastAt);drag.lastX=e.clientX;drag.lastAt=now;drag.hand.scrollLeft=drag.scrollStart+drag.x-e.clientX;return}
  if(!drag.moving&&Math.abs(e.clientY-drag.y)<14)return;
  if(!drag.moving){drag.moving=true;clearTimeout(drag.timer);drag.preview?.remove();drag.el.classList.add('card-held');drag.ghost=drag.el.cloneNode(true);drag.ghost.removeAttribute('onclick');drag.ghost.className+=' card-ghost';drag.ghost.style.width=(drag.hand.classList.contains('fan-hand')?108:drag.el.offsetWidth)+'px';if(drag.hand.classList.contains('fan-hand')){drag.ghost.style.transform='translate(-50%,-50%)';drag.ghost.style.height='150px';drag.ghost.style.maxHeight='150px'}document.body.appendChild(drag.ghost);if(R()?.operatorSystemVersion!==113){drag.zone=document.createElement('div');drag.zone.className='card-drop-zone';drag.zone.textContent=kindOf(drag)==='attack'?'拖至存活敵人施放':'向上拖曳至此施放';document.querySelector('.combat-hud')?.appendChild(drag.zone)}}
  drag.locked=true;clearTimeout(drag.lockTimer);
  const state=drag;
  updateAttackMode(state,e.clientX,e.clientY);
  if(state.paintFrame)return;
  state.paintFrame=requestAnimationFrame(()=>{
   state.paintFrame=null;
   if(drag!==state||!valid())return;
   const x=state.lastPointerX,y=state.lastPointerY,modern=R()?.operatorSystemVersion===113,kind=kindOf(state),attack=['attack','all'].includes(kind);
   if(modern&&!state.allies&&y<state.y-16&&FrontierOperatorUIV113.canTargetAllies(state))state.allies=FrontierOperatorUIV113.allyTargets(state);
   const allyHit=state.allies?document.elementFromPoint(x,y)?.closest('[data-ally-uid]:not([data-disabled])'):null;
   if(allyHit&&!attack){state.primaryAlly=allyHit.dataset.allyUid;for(const el of state.allies.children)el.classList.toggle('v133-primary',el===allyHit);if(state.secondaryTarget===state.primaryAlly&&FrontierOperatorUIV113.targetPlan(state)?.secondary?.distinctPrimary){state.secondaryTarget=null;for(const el of state.allies.children)el.classList.remove('v133-secondary');}}
   const hit=attack&&!modeHit(state.modeRows?.find(row=>row.picked===undefined),x,y)?target(x,y):null;
   const highlight=allyHit||hit||(!attack&&y<state.y-45?state.zone:null);
   if(state.highlight!==highlight){state.highlight?.classList.remove('drag-target');highlight?.classList.add('drag-target');state.highlight=highlight}
   if(hit)damagePreview(hit.dataset.enemyId);else if(state.damageAnchor!==undefined)clearDamagePreview(state);
   state.ghost.style.setProperty('--ghost-x',x+'px');
   state.ghost.style.setProperty('--ghost-y',(y-(modern?85:0))+'px');
  });
 }
 function handIndex(state){
  const battle=R()?.battle;
  if(R()?.operatorSystemVersion===113&&battle?.operatorBattleId===state.battle.operatorBattleId)return battle.hand.findIndex(card=>card.uid===state.card.uid);
  return battle===state.battle?battle.hand.indexOf(state.card):-1;
 }
 function end(e){
  if(drag&&e.pointerId===drag.secondaryPointer){e.preventDefault();drag.secondaryPointer=null;if(drag.primaryRelease){const release=drag.primaryRelease;delete drag.primaryRelease;end(release)}return;}
  if(!drag||e.pointerId!==drag.pointer)return;
  if(drag.secondaryPointer!=null){e.preventDefault();drag.primaryRelease={pointerId:e.pointerId,clientX:e.clientX,clientY:e.clientY,preventDefault(){}};return;}e.preventDefault();suppressUntil=Date.now()+650;
  if(!valid()){remove();return}
  const state=drag;if(state.scrolling){const velocity=performance.now()-state.lastAt<90?state.velocity:0;remove();if(!matchMedia('(prefers-reduced-motion:reduce)').matches)state.hand.scrollBy({left:velocity*100,behavior:'smooth'});return}const kind=kindOf(state),attack=['attack','all'].includes(kind);
  const overChoice=modeHit(state.modeRows?.find(row=>row.picked===undefined),e.clientX,e.clientY);
  if(state.moving&&state.modeRows)updateAttackMode(state,e.clientX,e.clientY);
  const hit=attack&&!overChoice?target(e.clientX,e.clientY):null;
  if(R()?.operatorSystemVersion===113&&state.moving&&!attack&&!state.allies&&e.clientY<state.y-16)state.allies=FrontierOperatorUIV113.allyTargets(state);
  const ally=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-ally-uid]:not([data-disabled])')?.dataset.allyUid;
  const downward=state.moving&&e.clientY>=state.y+52;const allowed=state.moving&&(['attack','all'].includes(kind)?!!hit:e.clientY<state.y-45);
  remove();
  if(allowed&&state.card.id==='curio_tactic'&&state.curioTactic){const index=handIndex(state);if(index>=0)FrontierRuntime.perform('curio-tactic-drag',()=>FrontierCurios.playTemporary(handIndex(state),state.curioTactic));return;}
  if(R()?.operatorSystemVersion===113&&state.moving&&!downward&&!['attack','all'].includes(kind)){if(ally)FrontierRuntime.perform('support-card-drag',()=>FrontierOperatorUIV113.dropSupport(state,ally));else if(e.clientY<state.y-45&&!state.allies)FrontierRuntime.perform('support-card-drag',()=>FrontierOperatorUIV113.dropSupport(state,R().team.find(a=>a.operator===cards[state.card.id]?.owner)?.uid));return}
  if(downward&&R()?.operatorSystemVersion===113){if(state.virtualOwner){toast(state.virtualOwner.startsWith('aux49:')?'衍生牌不占手牌上限，本回合結束自動移除。':'招牌牌會保持就緒，不需要棄置。');return}FrontierRuntime.perform('discard-card-swipe',()=>FrontierOperatorGameV113.discard(state.card.uid));return}
  if(state.virtualOwner){if(allowed&&hit)FrontierRuntime.perform('signature-card-drag',()=>FrontierOperatorUIV113.signature(state.virtualOwner,hit.dataset.enemyId));else if(allowed||!state.moving&&!state.previewed)FrontierRuntime.view(()=>FrontierOperatorUIV113.signature(state.virtualOwner));return}
  if(allowed)queuePlay(state,hit?.dataset.enemyId);
  else if(!state.moving&&!state.previewed){if(kind==='attack')FrontierRuntime.view(()=>selectCard(R()?.operatorSystemVersion===113?R().battle.hand.findIndex(c=>c.uid===state.card.uid):state.index));else FrontierRuntime.perform('play-card-tap',()=>{const index=handIndex(state);if(index>=0)selectCard(index)})}
 }
 // Run before the transaction click handler can interpret the browser's synthetic click.
 document.addEventListener('click',e=>{if(drag?.allies&&e.target.closest?.('.v113-ally-drop-layer')){e.preventDefault();e.stopImmediatePropagation();return}if(Date.now()<suppressUntil&&e.target.closest?.('.play-card,.enemy-card')){e.preventDefault();e.stopImmediatePropagation()}},true);
 document.addEventListener('pointerdown',start,{passive:false});document.addEventListener('pointermove',move,{passive:false});document.addEventListener('pointerup',end,{passive:false});document.addEventListener('pointercancel',event=>{if(!drag)return;if(event.pointerId===drag.pointer||event.pointerId===drag.secondaryPointer)remove()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)remove()});
 function scrollHand(direction){const hand=document.querySelector('.hand');hand?.scrollBy({left:direction*hand.clientWidth,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}
 const oldBattle=battleView;battleView=function(){oldBattle();const hand=document.querySelector('.hand');if(!hand||R()?.operatorSystemVersion===113)return;const controls=document.createElement('div');controls.className='hand-scroll-controls';controls.innerHTML='<button type="button" aria-label="查看前五張手牌" onclick="FrontierGestures.scrollHand(-1)">‹ 前五張</button><span></span><button type="button" aria-label="查看後五張手牌" onclick="FrontierGestures.scrollHand(1)">後五張 ›</button>';hand.after(controls);const update=()=>{const total=hand.querySelectorAll('.play-card').length,first=total?Math.min(total,Math.round(hand.scrollLeft/((hand.querySelector('.play-card')?.offsetWidth||1)+5))+1):0;controls.querySelector('span').textContent=total?first+'–'+Math.min(total,first+4)+' / '+total:'沒有手牌';controls.firstElementChild.disabled=hand.scrollLeft<2;controls.lastElementChild.disabled=hand.scrollLeft+hand.clientWidth>=hand.scrollWidth-2};hand.addEventListener('scroll',update,{passive:true});update()};
 window.addEventListener('pointerdown',()=>{suppressUntil=0},true);
 return{scrollHand,markPending,cancel:remove,suppressClick:e=>Date.now()<suppressUntil&&!!e.target.closest?.('.play-card,.enemy-card'),get active(){return !!drag}};
})();
