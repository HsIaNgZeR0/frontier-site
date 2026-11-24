'use strict';
window.FrontierOffline=(()=>{
 let registration=null,installed=false;
 async function register(){if(!('serviceWorker'in navigator)||!['https:','http:'].includes(location.protocol))return;try{registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});installed=!!navigator.serviceWorker.controller;registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'){installed=true;if(navigator.serviceWorker.controller)toast('新版本已準備好，重新開啟頁面一次即可套用；目前進度會保留。')}})});await registration.update()}catch{}}
 function status(){return{supported:'serviceWorker'in navigator,installed,online:navigator.onLine}}
 const oldSettings=FrontierMobile.settings;FrontierMobile.settings=function(){return oldSettings()+view()};
 function view(){return `<section class="panel" data-offline-readiness><h3>離線遊玩</h3><p data-offline-label>${navigator.onLine?'目前已連線':'目前離線'} · ${navigator.serviceWorker?.controller?'可以離線開啟':'離線資源準備中'}</p><p class="tiny muted">在有網路時開啟一次，等上方顯示「可以離線開啟」。之後即使完全斷網，也能用同一個瀏覽器或主畫面圖示重新開啟。遊戲進度存於本機；未快取的圖片會顯示替代圖示。</p></section>`}
 const oldRender=render;render=function(){oldRender();if(page==='settings')$('#app').innerHTML+=view()};
 function refreshLabel(){for(const label of document.querySelectorAll('[data-offline-label]'))label.textContent=(navigator.onLine?'目前已連線':'目前離線')+' · '+(navigator.serviceWorker?.controller?'可以離線開啟':'離線資源準備中')}
 navigator.serviceWorker?.addEventListener('controllerchange',refreshLabel);
 window.addEventListener('online',refreshLabel);window.addEventListener('offline',refreshLabel);
 if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
 document.addEventListener('error',event=>{const image=event.target;if(image?.tagName==='IMG'){image.hidden=true;const fallback=document.createElement('span');fallback.className='image-fallback';fallback.textContent='◇';fallback.setAttribute('aria-label',image.alt||'暫無圖像');image.after(fallback)}},true);
 return{register,status,view};
})();
