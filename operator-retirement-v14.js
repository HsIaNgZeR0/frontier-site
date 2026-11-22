'use strict';
window.FrontierOperatorRetirementV14=(()=>{
 for(const [id,u]of Object.entries(FrontierCapture.units))if(u.kind==='operator'&&!FrontierActiveOperatorIdsV14.includes(id))u.retired=true;
 const retired=id=>FrontierCapture.units[id]?.retired===true;
 function reconcile(){const recruitment=db.recruitment;if(recruitment){for(const entry of recruitment.results.filter(e=>retired(e.operator)&&!e.claimed)){entry.retired=true;entry.claimed=true;entry.revealed=true;if(!entry.retiredRefundV14){if(entry.source==='formal')recruitment.tickets++;else if(entry.source==='targeted')recruitment.targetPoints+=FrontierCapture.units[entry.operator].rarity===4?12:30;else recruitment.permits++;entry.retiredRefundV14=true}}for(const job of recruitment.jobs.filter(j=>retired(j.operator)&&!j.claimed)){job.retired=true;job.claimed=true;if(!job.retiredRefundV14){recruitment.permits++;job.retiredRefundV14=true}}}if(R()&&!R().result)return;const old=db.squad||[],removed=old.filter(retired);db.retiredOperatorsV14??={version:1,records:{}};for(const id of Object.keys(db.personnel.units).filter(retired))if(!db.retiredOperatorsV14.records[id])db.retiredOperatorsV14.records[id]={personnel:structuredClone(db.personnel.units[id]),progress:structuredClone(db.progress.operators[id]),equipment:structuredClone(db.equipment.loadouts[id]||{})};if(!removed.length)return;db.squad=old.filter(id=>!retired(id));for(const id of ['amiya','hibiscus','char_123_fang','char_124_kroos','char_210_stward'])if(db.squad.length<5&&!db.squad.includes(id))db.squad.push(id);delete db.packPlan;}
 const receive=FrontierPotential.receive;FrontierPotential.receive=id=>retired(id)?false:receive(id);
 const available=FrontierPersonnel.available;FrontierPersonnel.available=id=>!retired(id)&&available(id);
 const previous=render;render=function(){reconcile();previous()};const start=startRun;startRun=function(){reconcile();return start()};
 return{retired,reconcile};
})();
