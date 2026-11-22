'use strict';
window.FrontierOffline=(()=>{
 let registration=null,installed=false;
 async function register(){if(!('serviceWorker'in navigator)||!['https:','http:'].includes(location.protocol))return;try{registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});installed=!!registration.active;registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'){installed=true;if(navigator.serviceWorker.controller)toast('新版本已準備好，重新開啟頁面一次即可套用；目前進度會保留。')}})});await registration.update()}catch{}}
 function status(){return{supported:'serviceWorker'in navigator,installed,online:navigator.onLine}}
 const oldSettings=FrontierMobile.settings;FrontierMobile.settings=function(){return oldSettings()+view()};
 function view(){return `<section class="panel"><h3>離線遊玩</h3><p>${navigator.onLine?'目前已連線':'目前離線'} · ${installed?'離線程式已準備':'首次載入後會準備離線程式'}</p><p class="tiny muted">遊戲程式會完整保存，已看過的原作圖片會按需保存；未快取的圖片離線時以簡單符號替代。雲端信箱、登入與帳號管理仍需要連線。進度獨立保存在瀏覽器，離線快取更新不會清除存檔。</p></section>`}
 const oldRender=render;render=function(){oldRender();if(page==='settings')$('#app').innerHTML+=view()};
 if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
 document.addEventListener('error',event=>{const image=event.target;if(image?.tagName==='IMG'){image.hidden=true;const fallback=document.createElement('span');fallback.className='image-fallback';fallback.textContent='◇';fallback.setAttribute('aria-label',image.alt||'暫無圖像');image.after(fallback)}},true);
 return{register,status,view};
})();
