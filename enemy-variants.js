'use strict';
/* 敵人收藏變異：閃光（約1%）與色違（約0.5%）。數值與機制完全相同，只改外觀與收容條件。
   收容：只接受藍階以上裝置；成功率基礎各降10／20百分點（金階裝置無視），其餘加成照常。 */
window.FrontierVariants=(()=>{
 const RATE={shiny:.01,color:.005},LABEL={shiny:'閃光',color:'色違'},PENALTY={shiny:.10,color:.20},MIN_TIER=4;
 /* 色違色相：依物種固定，挑選偏好看的區間（避開灰濁的黃綠） */
 const HUES=[150,200,240,290,320,105];
 function hue(species){let h=0;for(const c of String(species))h=(h*31+c.charCodeAt(0))>>>0;return HUES[h%HUES.length]}
 const of=x=>x?.variant177||(x?.variant==='shiny'||x?.variant==='color'?x.variant:null)||(x?.shiny?'color':null);
 const label=v=>LABEL[v]||'';
 const suffix=v=>v?'（'+LABEL[v]+'）':'';
 function capturable(e){const u=FrontierCapture.units[e?.species];return !!u&&u.kind==='enemy'&&!u.boss&&!e.boss&&!e.regionBoss&&!e.summoned75&&!e.extra75&&!e.device75&&!e.regionalFragment&&!e.bloodblade75}
 function roll(e){
  if(!e||e.variantRolled177)return;e.variantRolled177=true;if(!capturable(e))return;
  const r=Math.random();const v=r<RATE.color?'color':r<RATE.color+RATE.shiny?'shiny':null;
  if(!v)return;e.variant177=v;e.name=String(e.name||FrontierCapture.units[e.species].name)+suffix(v);
 }
 const oldStart=startBattle;startBattle=function(...args){const result=oldStart(...args);const b=R()?.battle;if(b&&R()?.contract?.mode!=='simulation'){let hit=false;for(const e of b.enemies){roll(e);if(e.variant177)hit=true}if(hit){save();render()}}return result};
 return{RATE,LABEL,PENALTY,MIN_TIER,hue,of,label,suffix,roll,capturable};
})();
