'use strict';
window.FrontierNewCaptures143=(()=>{
 function refresh(){const fresh=!!db.capture?.instances.some(i=>i.unread143);for(const b of document.querySelectorAll('#nav button,#nav a')){if(!/收容/.test(b.textContent))continue;b.classList.toggle('has-new-capture143',fresh);const existing=b.querySelector('.new-capture143-dot');if(!fresh)existing?.remove();if(fresh&&!existing){const dot=document.createElement('i');dot.className='new-capture143-dot';dot.setAttribute('aria-label','有尚未查看的新收容個體');b.append(dot)}}}
 const prior=render;render=function(...a){const r=prior(...a);refresh();return r};return{refresh};
})();
