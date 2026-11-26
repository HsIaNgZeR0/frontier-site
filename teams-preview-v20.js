'use strict';
// 舊分隊快照只供進行中的遠征續局；新局完全使用幹員個人方案。
window.FrontierTeamsPreviewV20=(()=>{
 const catalog={...FrontierOperatorProgressionV113.catalog,forms:FrontierOperatorCatalogV113.forms,units:FrontierCapture.units,definitions:FrontierInventory.definitions};
 function effectiveStage(r,actor,card){return r?.teamPresetV20?.configs?.[actor?.operator]?.form===actor?.form?r.teamPresetV20.configs[actor.operator].stages[card?.id]:undefined}
 return{enabled:false,catalog,effectiveStage,open:()=>go('roster'),reservedUids:()=>[]};
})();
