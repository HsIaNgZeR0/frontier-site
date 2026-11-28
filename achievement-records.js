'use strict';
globalThis.FrontierAchievementRecords=(()=>{
 const walletKeys=['lmd','synth','green','yellow'];
 const difficulty=['normal','hard','extreme','torment'];
 const types=['physical','arts','true'];
 const amount=x=>Number.isSafeInteger(x)&&x>=0?x:0;
 function walletHistory(state){
  if(state.achievementsV1)return state.achievementsV1;
  const earned=Object.fromEntries(walletKeys.map(k=>[k,0]));
  for(const tx of state.meta?.ledger||[])for(const key of walletKeys)earned[key]+=Math.max(0,amount(tx.to?.wallet?.[key])-amount(tx.from?.wallet?.[key]));
  return {version:1,earned,partial:(state.meta?.seq||0)>(state.meta?.ledger?.length||0)||(state.runs||0)>0,best:{}};
 }
 function mergeBest(best,metrics){
  if(!metrics)return;
  for(const type of types){const n=amount(metrics.maxByType?.[type]);if(n>0)best[type]=Math.max(best[type]||0,n);}
  for(const key of ['maxHealing','maxTaken','maxDamage']){const n=amount(metrics[key]);if(n>0)best[key]=Math.max(best[key]||0,n);}
 }
 function update(before,after){
  const entry=structuredClone(walletHistory(before));
  for(const key of walletKeys)entry.earned[key]+=Math.max(0,amount(after.wallet?.[key])-amount(before.wallet?.[key]));
  if(!before.run?.grayDepth156&&before.run?.contract?.mode!=='simulation')mergeBest(entry.best,before.run?.telemetry18);
  if(!after.run?.grayDepth156&&after.run?.contract?.mode!=='simulation')mergeBest(entry.best,after.run?.telemetry18);
  after.achievementsV1=entry;
 }
 function combat(state){
  const best={...walletHistory(state).best};
  for(const raid of state.statistics?.raids||[])if(raid.contractMode!=='simulation')mergeBest(best,raid.combatStats);
  if(!state.run?.grayDepth156&&state.run?.contract?.mode!=='simulation')mergeBest(best,state.run?.telemetry18);
  return best;
 }
 function explore(state,regions){
  const counts=()=>difficulty.map(()=>({clears:0,attempts:0}));
  const all=counts(),rows=Object.fromEntries(regions.map(id=>[id,{counts:counts(),badges:{}}]));
  const simulations=new Set((state.contracts?.boards?.simulation||[]).map(r=>r.run));
  let ambiguous=0,early=0;
  for(const raid of state.statistics?.raids||[]){
   const row=rows[raid.region],rank=difficulty.indexOf(raid.difficulty);
   if(!row||rank<0||raid.mode==='scout'||raid.mode==='highrisk'||raid.contractMode==='simulation'||simulations.has(raid.number))continue;
   const clear=raid.result==='win'&&!!raid.fullClear;
   const layer=raid.exitLayer??Math.max(0,...(raid.layers||[]));
   if(raid.result==='extract'&&layer===3){early++;continue;}
   if(!clear&&!raid.mode&&layer<1&&(raid.depth||0)<=5){ambiguous++;continue;}
   if(!clear&&!['loss','emergency','extract'].includes(raid.result))continue;
   for(const counter of [all[rank],row.counts[rank]]){counter.attempts++;if(clear)counter.clears++;}
   if(clear){for(const ending of raid.endings||[raid.ending||'normal'])row.badges[ending]=Math.max(row.badges[ending]??-1,rank);}
  }
  return {all,rows,ambiguous,early};
 }
 function operator(state,id){
  const totals=state.operatorMetricsV1?.[id]||{};
  const clears=difficulty.map(()=>0);
  const counted=new Set();
  const simulations=new Set((state.contracts?.boards?.simulation||[]).map(r=>r.run));
  for(const raid of state.statistics?.raids||[]){
   if(raid.contractMode==='simulation'||simulations.has(raid.number)||counted.has(raid.number)||!raid.team?.some(a=>a.id===id))continue;
   counted.add(raid.number);
   const rank=difficulty.indexOf(raid.difficulty);
   if(rank>=0&&raid.mode!=='scout'&&raid.mode!=='highrisk'&&raid.result==='win'&&raid.fullClear)clears[rank]++;
  }
  const run=state.run;
  const active=run&&!run.result&&run.contract?.mode!=='simulation'&&!counted.has(run.number)&&run.team?.some(a=>(a.operator||a.id)===id);
  return {totals,clears,sorties:counted.size+Number(!!active)};
 }
 return {walletKeys,difficulty,walletHistory,update,combat,explore,operator};
})();
