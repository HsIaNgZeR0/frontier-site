'use strict';
window.FrontierBootProgress=(()=>{
 const host=document.querySelector('#prts-boot-screen'),ring=host?.querySelector('.prts-boot-ring'),value=host?.querySelector('[role="progressbar"]'),caption=host?.querySelector('.prts-boot-caption');let current=0,target=3,completed=false;
 function paint(n){current=Math.min(100,Math.max(current,n));if(ring)ring.style.strokeDashoffset=String(100-current);if(value){value.textContent=Math.floor(current)+'%';value.setAttribute('aria-valuenow',String(Math.floor(current)))}}
 let timer=null;function start(){if(!timer)timer=setInterval(()=>{if(!completed&&current<target)paint(current+Math.min(.8,Math.max(.05,(target-current)*.12),target-current))},70)}start();
 function step(n,text){if(completed)return;start();target=Math.max(target,Math.min(96,n));if(caption&&text)caption.textContent=text}
 function complete(){if(completed)return;completed=true;stop();if(caption)caption.textContent='終端就緒';paint(100)}
 function stop(){clearInterval(timer);timer=null}window.addEventListener('frontier:boot',stop,{once:true});new MutationObserver(()=>{if(document.body.classList.contains('identity-mode')||!document.body.classList.contains('booting'))stop()}).observe(document.body,{attributes:true,attributeFilter:['class']});
 return {step,complete};
})();
