'use strict';
// Combat can overlap with operator staffing or external missions.
globalThis.FrontierDutyRulesV17=(()=>{
 const baseJob=job=>typeof job==='string'&&(job.startsWith('base:')||job.startsWith('base151:'));
 const person=(s,uid)=>Object.values(s.personnel?.units||{}).find(u=>u.uid===uid);
 function external(s,uid){if(!uid)return false;const u=person(s,uid);return !!((s.dispatch?.jobs||[]).some(j=>j.uids?.includes(uid))||[s.assignments?.[uid],u?.assignment].some(job=>job&&!baseJob(job)))}
 function inRaid(s,uid){if(!s.run||s.run.result)return false;const u=person(s,uid);return !!(s.run.team?.some(a=>a.instanceId===uid||a.uid===uid||u&&a.id===u.id)||s.run.enemySupport?.uid===uid)}
 function baseBlocked(s,uid){
  const u=person(s,uid);
  const otherJob=[s.assignments?.[uid],u?.assignment].some(job=>job&&!baseJob(job)&&!String(job).startsWith('dispatch:'));
  return otherJob||!u&&inRaid(s,uid);
 }
 function valid(s){if(!s||typeof s!=='object')return false;const jobs=s.dispatch?.jobs||[],used=new Set();for(const job of jobs)for(const uid of job.uids||[]){if(used.has(uid))return false;used.add(uid)}for(const room of s.base151?.rooms||[])if(room.staff?.some(uid=>baseBlocked(s,uid)))return false;for(const facility of Object.values(s.basev2?.facilities||{}))if(facility.staff?.some(uid=>baseBlocked(s,uid)))return false;if(s.world?.worker&&baseBlocked(s,s.personnel?.units[s.world.worker]?.uid))return false;return true}
 return{baseJob,external,inRaid,baseBlocked,valid};
})();
