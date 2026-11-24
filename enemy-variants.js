'use strict';
/* 敵人收藏變異：閃光與色違，機率依模式難度遞增（高危最高 4%／2%）。數值與機制完全相同，只改外觀與收容條件。
   收容：只接受藍階以上裝置；成功率基礎各降10／20百分點（金階裝置無視），其餘加成照常。 */
window.FrontierVariants=(()=>{
 const RATE={shiny:.01,color:.005},LABEL={shiny:'閃光',color:'色違'},PENALTY={shiny:.10,color:.20},MIN_TIER=4;
 /* 依難度遞增（閃光／色違）：普通 1／0.5%、突襲 1.5／0.75%、險境 2／1%、磨難 3／1.5%、高危 4／2%（高危模式不論難度皆為最高） */
 const DIFF_RATE={normal:{shiny:.01,color:.005},hard:{shiny:.015,color:.0075},extreme:{shiny:.02,color:.01},torment:{shiny:.03,color:.015}},HIGHRISK_RATE={shiny:.04,color:.02};
 const rateFor=()=>{const e=R()?.expedition;if(e?.mode==='highrisk')return HIGHRISK_RATE;return DIFF_RATE[e?.difficulty]||RATE};
 /* 色違色相：依物種固定，挑選偏好看的區間（避開灰濁的黃綠） */
 const HUES=[150,200,240,290,320,105];
 function hue(species){let h=0;for(const c of String(species))h=(h*31+c.charCodeAt(0))>>>0;return HUES[h%HUES.length]}
 const of=x=>x?.variant177||(x?.variant==='shiny'||x?.variant==='color'?x.variant:null)||(x?.shiny?'color':null);
 const label=v=>LABEL[v]||'';
 const suffix=v=>v?'（'+LABEL[v]+'）':'';
 function capturable(e){const u=FrontierCapture.units[e?.species];return !!u&&u.kind==='enemy'&&!u.boss&&!e.boss&&!e.regionBoss&&!e.summoned75&&!e.extra75&&!e.device75&&!e.regionalFragment&&!e.bloodblade75}
 function roll(e){
  if(!e||e.variantRolled177)return;e.variantRolled177=true;if(!capturable(e))return;
  const rate=rateFor();const r=Math.random();const v=r<rate.color?'color':r<rate.color+rate.shiny?'shiny':null;
  if(!v)return;e.variant177=v;e.name=String(e.name||FrontierCapture.units[e.species].name)+suffix(v);
 }
 const oldStart=startBattle;startBattle=function(...args){const result=oldStart(...args);const b=R()?.battle;if(b&&R()?.contract?.mode!=='simulation'){let hit=false;for(const e of b.enemies){roll(e);if(e.variant177)hit=true}if(hit){save();render()}}return result};
 return{RATE,DIFF_RATE,HIGHRISK_RATE,rateFor,LABEL,PENALTY,MIN_TIER,hue,of,label,suffix,roll,capturable};
})();
