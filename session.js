'use strict';
// View state is separate from combat state; only committed actions advance a raid.
window.FrontierSession=(()=>{
 const screens=['home','run','roster','base','warehouse','settings','tasks','dispatch','shop','doctor','recruitment','statistics','collections','containers','encyclopedia','archive','collection'];
 function ensure(){db.session??={version:1,screen:'home',paused:false,pausedAt:0};return db.session}
 function overlay(){document.querySelector('#pause-overlay')?.remove();if(!ensure().paused)return;const el=document.createElement('section');el.id='pause-overlay';el.className='pause-overlay';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.innerHTML='<div class="panel"><div class="eyebrow">PRTS / SUSPENDED</div><h2>旅程暫停中</h2><p>戰鬥、地區環境與事件都停在已保存的狀態。基建與外勤仍按原本時間累積。</p><button class="primary" onclick="FrontierSession.resume()">繼續旅程</button><button onclick="exportSave()">匯出備份</button><p class="tiny muted">看到右上角「進度已保存」後即可關閉網頁。</p></div>';document.body.append(el)}
 function pause(){const s=ensure();s.screen=screens.includes(page)?page:'home';s.paused=true;s.pausedAt=Date.now();closeModal();save();overlay()}
 function resume(){ensure().paused=false;page=ensure().screen;save();render()}
 function restore(){const s=ensure();let local;try{local=localStorage.getItem((window.FrontierStorage?.key||KEY)+'-view')}catch{}page=!s.paused&&screens.includes(local)?local:R()&&!R().result?'run':screens.includes(s.screen)?s.screen:'home';render();overlay()}
 const oldRender=render;render=function(){oldRender();if(window.FrontierBootReady){const s=ensure();if(!s.paused){const view=screens.includes(page)?page:'home';try{const key=(window.FrontierStorage?.key||KEY)+'-view';if(localStorage.getItem(key)!==view)localStorage.setItem(key,view)}catch{}}if(R()&&!R().result&&!document.querySelector('#session-pause')){const b=document.createElement('button');b.id='session-pause';b.className='session-pause';b.textContent='暫停／保存';b.setAttribute('onclick','FrontierSession.pause()');document.body.append(b)}else if(!R()||R().result)document.querySelector('#session-pause')?.remove();overlay()}};
 FrontierMobile.pause=pause;
 const prior=validSave;validSave=function(v){if(!prior(v))return false;const s=v.session;return !s||s.version===1&&screens.includes(s.screen)&&typeof s.paused==='boolean'&&Number.isFinite(s.pausedAt)&&s.pausedAt>=0};
 ensure();return{ensure,pause,resume,restore,overlay};
})();
