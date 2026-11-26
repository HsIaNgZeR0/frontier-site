'use strict';
// Reference: BV1Zx4y1R7xr p1, 17.6–19s and 26–29s: chosen row grows,
// neighbouring rows recede, a separate right-hand “確定這麼做？” control appears.
window.FrontierEventConfirm139=(()=>{
 let pending=null,observer=null,held=null,suppress=0,replaying=false;const ghosts=new Set();
 const reduced=()=>window.FrontierMotion?.reduced()||matchMedia('(prefers-reduced-motion:reduce)').matches;
 const continuation=button=>R()?.event?.claimed&&/Frontier(?:Familiar136|Recreation139|Scam139)\.choose\(['"]finish['"]\)/.test(button.getAttribute('onclick')||'');
 function clear(){const p=pending;pending=null;observer?.disconnect();observer=null;if(!p)return;for(const a of p.button.getAnimations())if(a.id==='event139-select')a.cancel();p.confirm.remove();p.button.classList.remove('event139-selected');p.button.removeAttribute('aria-pressed');p.panel.classList.remove('event139-pending');if(p.button.isConnected)FrontierEventChoices135.fit(p.panel)}
 function place(){const p=pending;if(!p||!p.button.isConnected){clear();return}const rect=p.button.getBoundingClientRect(),parent=p.options.getBoundingClientRect();p.confirm.classList.toggle('is-short',rect.height<68);p.confirm.style.top=rect.top-parent.top+p.options.scrollTop+'px';p.confirm.style.left=rect.right-parent.left-66+'px';p.confirm.style.height=rect.height+'px'}
 function departure(p){if(reduced())return;const rect=p.button.getBoundingClientRect(),ghost=p.button.cloneNode(true);ghost.removeAttribute('onclick');ghost.removeAttribute('aria-pressed');for(const n of ghost.querySelectorAll('*')){n.removeAttribute('onclick');n.removeAttribute('id')}ghost.className='event139-departure';ghost.setAttribute('aria-hidden','true');Object.assign(ghost.style,{position:'fixed',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',pointerEvents:'none',zIndex:10000,margin:'0',boxSizing:'border-box'});document.body.append(ghost);ghosts.add(ghost);const a=ghost.animate([{opacity:.8,transform:'translateX(0) scale(1)'},{opacity:0,transform:'translateX(16px) scale(.97)'}],{duration:160,easing:'ease-out'});a.finished.catch(()=>{}).finally(()=>{ghost.remove();ghosts.delete(ghost)})}
 function commit(event){const p=pending;if(!p||!p.button.isConnected||p.event!==R()?.event||p.run!==R()||p.button.disabled)return false;departure(p);clear();if(p.handler)return p.handler.call(p.button,event);try{replaying=true;p.button.click()}finally{replaying=false}return true}
 function select(button){
  if(!button?.matches('.event135-choice')||button.disabled||FrontierRuntime.busy||continuation(button))return false;
  if(pending?.button===button)return true;clear();
  const panel=button.closest('.event135-panel'),options=button.closest('.event135-options');if(!panel||!options)return false;
  const confirm=document.createElement('button');confirm.type='button';confirm.className='event139-confirm event135-tool';confirm.setAttribute('aria-label','確定這麼做？確認選擇');confirm.setAttribute('onclick',button.getAttribute('onclick')||'FrontierEventConfirm139.commit(event)');confirm.onclick=commit;confirm.innerHTML='<span>確定<br>這麼做？</span><img src="assets/events139/confirm.png" alt="" draggable="false">';
  pending={button,panel,options,confirm,event:R().event,run:R(),handler:button.onclick};panel.classList.add('event139-pending');button.classList.add('event139-selected');button.setAttribute('aria-pressed','true');options.append(confirm);FrontierEventChoices135.fit(panel);place();observer=new ResizeObserver(place);observer.observe(button);
  if(!reduced()){const a=button.animate([{transform:'scale(1)'},{transform:'scale(1.018)'}],{duration:150,easing:'cubic-bezier(.2,.75,.25,1)'});a.id='event139-select';confirm.animate([{opacity:0,transform:'translateX(-8px)'},{opacity:1,transform:'translateX(0)'}],{duration:150,easing:'ease-out'})}return true;
 }
 // Record long holds independently: long-press inspection must never choose a row on release.
 addEventListener('pointerdown',e=>{suppress=0;const b=e.target.closest?.('.event135-choice');held=b?{button:b,start:performance.now(),x:e.clientX,y:e.clientY}:null},true);
 addEventListener('pointerup',e=>{if(held&&performance.now()-held.start>=320&&Math.hypot(e.clientX-held.x,e.clientY-held.y)<14)suppress=performance.now()+550;held=null},true);
 addEventListener('pointercancel',()=>held=null,true);
 addEventListener('click',e=>{
  if(replaying)return;
  if(e.target.closest?.('.event139-confirm'))return;
  const button=e.target.closest?.('.event135-choice');if(button){if(e.defaultPrevented||continuation(button))return;e.preventDefault();e.stopImmediatePropagation();if(performance.now()>=suppress)select(button);return}
  if(pending&&pending.panel.contains(e.target))clear();
 },true);
 addEventListener('keydown',e=>{if(e.key==='Escape'&&pending){e.preventDefault();clear();return}if(['Enter',' '].includes(e.key)&&e.target.matches?.('.event135-choice')&&!continuation(e.target)){e.preventDefault();e.stopImmediatePropagation();if(select(e.target))pending?.confirm.focus({preventScroll:true})}},true);
 const draw=render;render=function(...args){clear();return draw.apply(this,args)};
 addEventListener('resize',place);addEventListener('frontier:event-fit',place);addEventListener('pagehide',()=>{clear();for(const ghost of ghosts)ghost.remove();ghosts.clear()});
 const style=document.createElement('style');style.textContent=`
 .event135-options{position:relative}.event139-pending .event135-choice{opacity:.52;transition:opacity 130ms,background-color 130ms}
 .event139-pending .event135-choice.event139-selected{opacity:1;z-index:2;transform:scale(1.018);transform-origin:center;flex-grow:1.28;background:linear-gradient(100deg,#223641ee,#334854ed);border-left-color:#e3edf1;padding-right:78px!important;box-shadow:inset 0 -1px #d4e4eb99}
 .event139-selected>.event136-hint{opacity:.06}.event139-selected .event135-choice-effect{color:#e0e8ec}
 .event135-panel .event139-confirm{position:absolute!important;z-index:3;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:64px!important;min-width:44px;min-height:44px!important;margin:0!important;padding:4px!important;border:0!important;border-radius:0!important;border-left:1px solid #b4ced066!important;background:linear-gradient(90deg,#91b8c140,#b5dce455)!important;color:#f1f5f7;font-size:10px!important;line-height:1.2;text-align:center;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%);box-shadow:none!important}
 .event139-confirm{box-sizing:border-box!important}.event139-confirm img{width:27px;height:27px;object-fit:contain;flex:none}.event139-confirm span{font-size:10px;line-height:1.2}.event139-confirm.is-short{gap:2px!important;padding:2px!important}.event139-confirm.is-short img{width:20px;height:20px}.event139-confirm.is-short span{font-size:0;line-height:1}.event139-confirm.is-short span br{display:none}.event139-confirm.is-short span:after{content:'確認';font-size:10px;line-height:1}
 .event139-departure{padding:14px 78px 14px 16px;background:#223641ed;color:#edf3f6;overflow:hidden;border:0;border-left:2px solid #e3edf1}.event139-departure>img,.event139-departure>.event136-hint{display:none}.event139-departure b{display:block;font-size:18px}.event139-departure small{display:block;font-size:12px}
 @media(prefers-reduced-motion:reduce){.event139-pending .event135-choice{transition:none}}
 `;document.head.append(style);return{select,commit,clear,get selected(){return !!pending}};
})();
