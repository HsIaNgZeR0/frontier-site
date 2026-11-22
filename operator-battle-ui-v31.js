'use strict';
// Presentation adapter. Only explicitly marked v3.1 raids use this layout.
window.FrontierOperatorBattleUIV31=(()=>{
 if(window.FrontierOperatorBattleUIV31)return window.FrontierOperatorBattleUIV31;
 let expanded=false,ignoreOutsideClickUntil=0;
 let preview=null,holding=null;
 function clearPreview(){if(holding)clearTimeout(holding.timer);holding=null;preview?.remove();preview=null}
 document.addEventListener('pointerdown',event=>{const card=event.target.closest?.('.v31-battle-board .fan-hand .play-card');if(!card||document.querySelector('#modal')?.open||R()?.operatorSystemVersion===113)return;clearPreview();holding={pointer:event.pointerId,x:event.clientX,y:event.clientY,timer:setTimeout(()=>{if(!holding)return;preview=document.createElement('aside');preview.className='v31-card-preview';preview.setAttribute('role','tooltip');const title=document.createElement('b');title.textContent=card.querySelector('b,h3,strong')?.textContent||card.innerText.split('\n')[0];const text=document.createElement('p');text.textContent=card.querySelector('p')?.textContent||card.innerText;preview.append(title,text);FrontierInspector.attach(preview)},280)}},true);
 document.addEventListener('pointermove',event=>{if(holding&&Math.hypot(event.clientX-holding.x,event.clientY-holding.y)>12)clearPreview()},true);
 window.addEventListener('pointerup',clearPreview,true);window.addEventListener('pointercancel',clearPreview,true);window.addEventListener('blur',clearPreview);
 function close(){expanded=false;const panel=document.querySelector('.v31-tool-menu');if(panel)panel.hidden=true;document.querySelector('.v31-menu-toggle')?.setAttribute('aria-expanded','false')}
 function skillCards(board,team,run){
  const lane=document.createElement('section');lane.className='v31-signature-lane';lane.setAttribute('aria-label','已就緒招牌技能，獨立於普通手牌');
  for(const row of team?.querySelectorAll('.team-actor')||[]){const original=row.querySelector('button[onclick]'),id=row.dataset.inspectActor,actor=run.team.find(a=>a.id===id),definition=FrontierCombat.operators[id];if(!original||!actor||!definition)continue;original.classList.add('v31-inline-legacy-skill');
   if(original.disabled||actor.hp<=0||FrontierMedicine.skillLocked(actor,run.battle.turn))continue;
   const card=original.cloneNode(false);card.className='v31-virtual-skill';card.dataset.v31SkillOwner=id;card.dataset.virtual='true';card.setAttribute('aria-label',definition.skill+'，招牌技能，'+FrontierMedicine.skillCost(id)+' 行動點');
   const image=row.querySelector('img')?.cloneNode(false);if(image){image.alt='';card.append(image)}const title=document.createElement('b');title.textContent=definition.skill;const cost=document.createElement('small');cost.textContent=FrontierMedicine.skillCost(id)+' 行動點';card.append(title,cost);lane.append(card);
  }
  if(lane.childElementCount)board.append(lane);
 }
 function allyTargets(){if(R()?.operatorSystemVersion!==31)return;const targets=document.querySelector('#modal .support-targets');if(targets){targets.classList.add('v31-ally-targets');targets.setAttribute('aria-label','選擇一名存活友方幹員');}}
 function mount(){
  const run=R(),board=document.querySelector('.screen-combat-body .card-battle'),host=document.querySelector('.screen-workspace-body');
  if(board?.dataset.v31Mounted==='1')return;
  document.querySelector('.v31-combat-tools')?.remove();
  if(!run?.battle||![31,113].includes(run.operatorSystemVersion)||!board||!host)return;
  board.dataset.v31Mounted='1';
  board.classList.add('v31-battle-board');host.classList.add('v31-battle-host');
  const team=board.querySelector('.team-panel');if(team)team.setAttribute('aria-label','出戰幹員與生命狀態');
  if(run.operatorSystemVersion===31)skillCards(board,team,run);
  for(const card of board.querySelectorAll('.fan-hand .play-card[data-hand-index]')){const entry=run.battle.hand[Number(card.dataset.handIndex)];if(!entry)continue;const data=cardStats(entry),actor=run.team.find(a=>a.id===data.owner);card.dataset.v31CardType=['attack','all'].includes(data.kind)?actor?.damageType||FrontierCombat.operators[data.owner]?.type||'physical':data.block||data.heal?'protection':'support';}
  // Keep real existing action handlers; no duplicate save or parallel state machine.
  const dock=document.querySelector('.screen-combat-actions'),controls=document.createElement('div');controls.className='v31-combat-tools';
  const toggle=document.createElement('button');toggle.className='v31-menu-toggle';toggle.setAttribute('aria-label','戰鬥功能選單');toggle.setAttribute('aria-expanded',String(expanded));toggle.setAttribute('aria-controls','v31-tool-menu');toggle.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const panel=document.createElement('div');panel.id='v31-tool-menu';panel.className='v31-tool-menu';panel.hidden=!expanded;panel.setAttribute('aria-label','藥品、收容與背包功能');
  if(dock){dock.classList.add('v31-old-dock');for(const button of [...dock.querySelectorAll('button')])panel.append(button)}
  toggle.addEventListener('click',()=>{FrontierGestures.cancel();clearPreview();expanded=!expanded;panel.hidden=!expanded;toggle.setAttribute('aria-expanded',String(expanded))});controls.append(panel,toggle);host.append(controls);
  if(run.operatorSystemVersion===31){const nav=document.querySelector('#nav')?.getBoundingClientRect(),height=Math.min(innerHeight,visualViewport?.height||innerHeight);controls.style.bottom=Math.max(10,nav?.height?height-nav.top+8:12)+'px';}else controls.style.bottom='12px';
  const source=board.querySelector('.combat-hud');if(source){for(const node of source.querySelectorAll('span,small,b'))if(node.childElementCount===0&&/\bAP\b/.test(node.textContent))node.textContent=node.textContent.replace(/\bAP\b/g,'行動點')}
 }
 const oldRender=render;render=function(){oldRender();mount();allyTargets()};
 const originalChoose=FrontierSupport.choose;FrontierSupport.choose=function(...args){const result=originalChoose(...args);allyTargets();return result};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();document.querySelector('.v31-menu-toggle')?.focus()}});
 window.addEventListener('pointerdown',e=>{if(expanded&&!e.target.closest?.('.v31-combat-tools')){e.preventDefault();e.stopImmediatePropagation();FrontierGestures.cancel();ignoreOutsideClickUntil=performance.now()+650;close()}},true);
 window.addEventListener('click',e=>{if(performance.now()<ignoreOutsideClickUntil&&!e.target.closest?.('.v31-combat-tools')){e.preventDefault();e.stopImmediatePropagation();ignoreOutsideClickUntil=0;return}if(e.target.closest?.('.v31-tool-menu button'))close()},true);
 return{mount,close,clearPreview,allyTargets};
})();
