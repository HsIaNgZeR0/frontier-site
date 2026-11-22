'use strict';
// Identify committed contents without changing search timers, item IDs or reward rolls.
window.FrontierCurioLoot=(()=>{
 let hold=null,tip=null,suppress=0;
 function clear(){clearTimeout(hold?.timer);tip?.remove();tip=null;hold=null}
 async function identify(index,token){const box=FrontierContainers.currentBox(),uid=box?.uid;if(!box||!FrontierCurios.live()||!FrontierCurioEngine.active(R().curios,'R054'))return;const item=box.sealed.contents[index];if(!item||index<box.sealed.revealed)return;const ok=await FrontierRuntime.perform('curio-identify',()=>{const current=FrontierContainers.currentBox();if(current?.uid!==uid||current.sealed.contents[index]!==item)return;FrontierCurios.emit('identify',{unknown:true,item});save();render()});if(ok&&hold===token&&item.curioIdentified){tip=document.createElement('aside');tip.className='visual-held-item';tip.setAttribute('role','tooltip');tip.innerHTML='<b>PRTS｜識別鏡片 · 物資預覽</b>'+FrontierVisualUI.info(item.itemId)+'<small>尚未收取；搜索時間與背包規則不變。放開關閉。</small>';FrontierInspector.attach(tip)}}
 window.addEventListener('pointerdown',e=>{suppress=0;clear();const node=e.target.closest?.('[data-curio-unknown]');if(!node||e.button>0||!FrontierCurios.live()||!FrontierCurioEngine.active(R().curios,'R054'))return;hold={x:e.clientX,y:e.clientY,shown:false};const token=hold,index=Number(node.dataset.curioUnknown);hold.timer=setTimeout(()=>{if(hold!==token)return;hold.shown=true;identify(index,token)},350)},true);
 window.addEventListener('pointermove',e=>{if(hold&&Math.hypot(e.clientX-hold.x,e.clientY-hold.y)>13)clear()},true);window.addEventListener('pointerup',()=>{if(hold?.shown)suppress=performance.now()+600;clear()},true);window.addEventListener('pointercancel',clear,true);window.addEventListener('blur',clear);window.addEventListener('click',e=>{if(performance.now()<suppress&&e.target.closest?.('[data-curio-unknown]')){e.preventDefault();e.stopImmediatePropagation()}},true);
 return{identify};
})();
