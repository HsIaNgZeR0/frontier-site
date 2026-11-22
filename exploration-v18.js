'use strict';
window.FrontierExplorationV18=(()=>{
 function resume(){const r=R();if(!r?.signalReplacement18)return;delete r.signalReplacement18;r.event=null;r.choices=['search'];enter('search');save();render()}
 const prior=render;render=function(){FrontierExplorationRulesV18.normalize(db);prior();if(R()?.signalReplacement18){const host=document.querySelector('.screen-workspace-body')||document.querySelector('#app');if(host&&!host.querySelector('.retired-signal-notice'))host.insertAdjacentHTML('afterbegin','<section class="panel retired-signal-notice"><p>此路線已改為物資搜查。原有裝置與已取得物資保留。</p><button onclick="FrontierExplorationV18.resume()">繼續補給節點</button></section>')}};
 return{resume};
})();
