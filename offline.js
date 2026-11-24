'use strict';
window.FrontierOffline=(()=>{
 let registration=null,installed=false;
 async function register(){if(!('serviceWorker'in navigator)||!['https:','http:'].includes(location.protocol))return;try{registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});installed=!!navigator.serviceWorker.controller;registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'){installed=true;if(navigator.serviceWorker.controller)toast('新版本已準備好，重新開啟頁面一次即可套用；目前進度會保留。')}})});await registration.update()}catch{}}
 function status(){return{supported:'serviceWorker'in navigator,installed,online:navigator.onLine}}
 const pack={manifest:null,busy:false,ready:false,total:0,done:0,message:''};
 const marker=new URL('./offline-assets.json?complete=1',location.href).href;
 async function inspect(){
  if(pack.loading||pack.busy)return;
  pack.loading=true;
  try{
   const response=await fetch('./offline-assets.json');
   if(!response.ok)throw Error('暫時讀不到下載清單。');
   const data=await response.json();
   if(!/^frontier-pack-[a-f0-9]{16}$/.test(data.pack)||!Array.isArray(data.assets)||!data.assets.length||!data.assets.every(path=>path.startsWith('assets/')))throw Error('離線下載清單無法使用。');
   pack.manifest=data;pack.total=data.assets.length;
   if(await caches.has(data.pack)){
    const cache=await caches.open(data.pack);
    const keys=await cache.keys();
    pack.ready=keys.length===pack.total+1&&!!await cache.match(marker);
   }else pack.ready=false;
   pack.message='';
  }catch(error){pack.message=error.message}
  finally{pack.loading=false;refreshLabel()}
 }
 async function downloadPack(){
  if(pack.busy||pack.ready||!navigator.onLine)return;
  if(!pack.manifest)await inspect();
  const data=pack.manifest;
  if(!data||pack.busy||pack.ready)return;
  pack.busy=true;pack.done=0;pack.message='';refreshLabel();
  try{
   try{await navigator.storage?.persist?.()}catch{}
   const cache=await caches.open(data.pack);
   const saved=new Set((await cache.keys()).map(request=>request.url));
   const pending=data.assets.map(path=>new URL(path,location.href).href).filter(url=>!saved.has(url));
   pack.done=pack.total-pending.length;
   let index=0,error=null,lastPaint=0;
   await Promise.all(Array.from({length:6},async()=>{
    while(!error&&index<pending.length){
     const url=pending[index++];
     try{
      const response=await fetch(url);
      if(!response.ok||response.redirected)throw Error('檔案未能下載');
      await cache.put(url,response);
      pack.done++;
      const now=performance.now();
      if(now-lastPaint>150){lastPaint=now;refreshLabel()}
     }catch(failure){error=failure}
    }
   }));
   if(error)throw error;
   if(pack.done!==pack.total)throw Error('下載尚未完成');
   await cache.put(marker,new Response('complete'));
   pack.ready=true;
   for(const key of await caches.keys())if(key.startsWith('frontier-pack-')&&key!==data.pack)await caches.delete(key);
  }catch(error){
   pack.message=error.name==='QuotaExceededError'?'儲存空間不足。已下載的項目會保留。':'下載未完成。重新連線後可繼續下載。';
  }finally{pack.busy=false;refreshLabel()}
 }
 function download(){
  if(navigator.locks?.request)return navigator.locks.request('frontier-offline-download',{ifAvailable:true},lock=>lock?downloadPack():inspect());
  return downloadPack();
 }
 const oldSettings=FrontierMobile.settings;FrontierMobile.settings=function(){return oldSettings()+view()};
 function view(){return `<section class="panel" data-offline-readiness><h3>離線遊玩</h3><p data-offline-label>${navigator.onLine?'目前已連線':'目前離線'} · ${navigator.serviceWorker?.controller?'可以離線開啟':'離線資源準備中'}</p><p class="tiny muted">在有網路時開啟一次，等上方顯示「可以離線開啟」。之後即使完全斷網，也能用同一個瀏覽器或主畫面圖示重新開啟。遊戲進度存於本機；未快取的圖片會顯示替代圖示。</p><button type="button" class="full" style="min-height:44px" data-offline-download onclick="FrontierOffline.download()">下載完整離線版</button><progress data-offline-progress aria-label="離線下載進度" hidden></progress><p class="tiny" data-offline-download-status role="status"></p></section>`}
 const oldRender=render;render=function(){oldRender();if(page==='settings'){$('#app').insertAdjacentHTML('beforeend',view());refreshLabel();if(!pack.manifest)inspect()}};
 function refreshLabel(){
  const controlled=!!navigator.serviceWorker?.controller;
  for(const panel of document.querySelectorAll('[data-offline-readiness]')){
   panel.querySelector('[data-offline-label]').textContent=(navigator.onLine?'目前已連線':'目前離線')+' · '+(controlled?'可以離線開啟':'離線資源準備中');
   const button=panel.querySelector('[data-offline-download]'),progress=panel.querySelector('[data-offline-progress]');
   if(!button||!progress)continue;
   button.disabled=!controlled||!navigator.onLine||pack.busy||pack.ready||pack.loading;
   button.textContent=pack.ready?'完整離線版已就緒':pack.busy?'下載中…':pack.message&&pack.manifest?'繼續下載':'下載完整離線版';
   progress.hidden=!pack.busy;progress.max=pack.total||1;progress.value=pack.done;
   const size=pack.manifest?'約 '+Math.ceil(pack.manifest.bytes/1000000)+' MB':'';
   panel.querySelector('[data-offline-download-status]').textContent=pack.busy?pack.done+' / '+pack.total+' 個檔案':pack.ready?'遊戲素材可在飛航模式讀取。':pack.message||size;
  }
 }
 navigator.serviceWorker?.addEventListener('controllerchange',refreshLabel);
 window.addEventListener('online',refreshLabel);window.addEventListener('offline',refreshLabel);
 if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
 document.addEventListener('error',event=>{const image=event.target;if(image?.tagName==='IMG'){image.hidden=true;const fallback=document.createElement('span');fallback.className='image-fallback';fallback.textContent='◇';fallback.setAttribute('aria-label',image.alt||'暫無圖像');image.after(fallback)}},true);
 return{register,status,view,download};
})();
