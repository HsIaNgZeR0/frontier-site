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
 /* 收容帳本：普通／閃光／色違各自獨立累計（只增不減，放生或出售不會扣回）。 */
 const KINDS=['normal','shiny','color'],KIND_LABEL={normal:'普通',shiny:'閃光',color:'色違'};
 const uidNum=x=>{const m=/^enemy:(\d+)$/.exec(String(x?.uid||''));return m?Number(m[1]):-1};
 function ledger(state=db){
  if(!state)return null;
  if(state.captureLedger&&typeof state.captureLedger==='object'&&state.captureLedger.species)return state.captureLedger;
  const L={mark:-1,species:{}},inst=state.capture?.instances||[];
  for(const x of inst){const k=of(x)||'normal',row=L.species[x.species]??={normal:0,shiny:0,color:0};row[k]++;L.mark=Math.max(L.mark,uidNum(x))}
  const ids=new Set([...Object.keys(state.capture?.research||{}),...Object.keys(state.world?.roster||{})]);
  for(const id of ids){if(FrontierCapture.units[id]?.kind!=='enemy')continue;const row=L.species[id]??={normal:0,shiny:0,color:0},total=Math.max(state.capture?.research?.[id]?.count||0,state.world?.roster?.[id]?.copies||0,row.normal+row.shiny+row.color);row.normal=Math.max(row.normal,total-row.shiny-row.color)}
  state.captureLedger=L;return L;
 }
 function sync(state=db){
  const L=ledger(state);if(!L)return;let mark=L.mark;
  for(const x of state.capture?.instances||[]){const n=uidNum(x);if(n<=L.mark)continue;const k=of(x)||'normal',row=L.species[x.species]??={normal:0,shiny:0,color:0};row[k]++;mark=Math.max(mark,n)}
  L.mark=mark;
 }
 function counts(species,state=db){sync(state);const r=ledger(state)?.species?.[species];return{normal:r?.normal||0,shiny:r?.shiny||0,color:r?.color||0}}
 const oldSave=save;save=function(...a){try{sync()}catch(e){}return oldSave(...a)};
 const oldValid=validSave;validSave=function(v){
  if(!oldValid(v))return false;const L=v.captureLedger;if(L===undefined)return true;
  const ok=n=>Number.isSafeInteger(n)&&n>=0;
  return !!L&&typeof L==='object'&&Number.isSafeInteger(L.mark)&&L.mark>=-1&&L.species&&typeof L.species==='object'&&Object.values(L.species).every(r=>r&&KINDS.every(k=>ok(r[k])));
 };
 /* 戰鬥長按：右上角標示此型態是否已收容 */
 let pressed=null;
 window.addEventListener('pointerdown',e=>{pressed=e.target.closest?.('[data-inspect-enemy]')?.dataset.inspectEnemy||null},true);
 if(window.FrontierInspector?.attach){const oldAttach=FrontierInspector.attach;FrontierInspector.attach=function(tip){
  try{const e=pressed&&R()?.battle?.enemies.find(x=>x.id===pressed);
   if(e&&FrontierCapture.units[e.species]?.kind==='enemy'){const k=of(e)||'normal',n=counts(e.species)[k];if(n>0){const b=document.createElement('span');b.className='hold-captured-badge';b.textContent='已收容('+n+')';b.title=KIND_LABEL[k]+'型態已收容 '+n+' 次';tip.style.position||='';tip.prepend(b)}}
  }catch(err){}
  return oldAttach.call(this,tip);
 }}
 const css=document.createElement('style');css.textContent='.hold-inspection{position:relative}.hold-inspection>.hold-captured-badge{float:right;margin:0 0 4px 8px;padding:2px 8px;border-radius:999px;background:#2f6f4f;color:#eafff2;font-size:12px;font-weight:700;line-height:18px}.enemy-index-ledger{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.enemy-index-ledger>div{padding:6px 8px;border:1px solid rgba(255,255,255,.15);border-radius:6px;text-align:center}.enemy-index-ledger b{display:block;font-size:12px;opacity:.75}';document.head.append(css);
 return{RATE,DIFF_RATE,HIGHRISK_RATE,rateFor,LABEL,PENALTY,MIN_TIER,hue,of,label,suffix,roll,capturable,counts,sync};
})();
