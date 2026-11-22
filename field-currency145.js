'use strict';
// Presentation only: fieldPoints retains its existing balance and payment rules.
window.FrontierFieldCurrency145=(()=>{
 const check=checkBattle;
 checkBattle=function(...args){const r=R(),battle=r?.battle,before=r?.fieldPoints||0,out=check(...args);if(battle&&r?.reward&&battle.enemies.every(e=>e.hp<=0)){const n=Math.max(0,(r.fieldPoints||0)-before);if(n&&!r.reward.ingotEarned145){r.reward.ingotEarned145=n;save();render()}}return out};
 const paint=render;
 render=function(...args){const out=paint(...args),r=R(),amount=r?.reward?.ingotEarned145;if(page==='run'&&r&&!r.result){const bar=document.querySelector('.recruit144-status,.compact-run-summary');if(bar&&!bar.querySelector('.ingot145-wallet')){const wallet=document.createElement('span');wallet.className='ingot145-wallet';wallet.innerHTML=FrontierCurrencyIcons.html('ingot')+'<b>'+(r.fieldPoints||0).toLocaleString()+'</b>';bar.append(wallet)}}if(page==='run'&&amount){const host=document.querySelector('.battle-drops-panel,.reward139-stage,.reward-options')||document.querySelector('#app');if(host&&!host.querySelector('.ingot145-drop')){const row=document.createElement('p');row.className='ingot145-drop';row.innerHTML=FrontierCurrencyIcons.html('ingot')+'<b>+'+amount.toLocaleString()+'</b><span>已獲得</span>';host.prepend(row)}}return out};
 return{icon:()=>FrontierCurrencyIcons.html('ingot')};
})();
