'use strict';
globalThis.FrontierCombatMetricsV18=(()=>{
 const keys=['damage','taken','healing','cards'],maxKeys=['maxDamage','maxTaken','maxHealing'];
 const initial=partial=>({version:18,partial:!!partial,damage:0,taken:0,healing:0,cards:0,maxDamage:0,maxTaken:0,maxHealing:0,net:{}});
 function add(row,key,n){row[key]=(row[key]||0)+n}
 function operatorId(actor){return actor&&!actor.friendly75&&actor.operator!=='flow'?actor.operator||null:null}
 function note(s,actor,key,n){
  if(!(n>0)||!Number.isFinite(n)||s.equipment139Probe||s.operatorMetricsPreview)return;
  const id=operatorId(actor);
  if(!id)return;
  const delta=s.operatorMetricsDelta??={};
  const row=Object.hasOwn(delta,id)?delta[id]:Object.defineProperty(delta,id,{value:{},enumerable:true,writable:true})[id];
  add(row,key,n);
 }
 function commit(account,r,s){
  if(!s?.operatorMetricsDelta)return;
  const delta=s.operatorMetricsDelta;
  delete s.operatorMetricsDelta;
  if(!delta||r.contract?.mode==='simulation')return;
  const totals=r.grayDepth156?(account.grayDepth156.operatorMetrics??={}):(account.operatorMetricsV1??={});
  for(const [id,values] of Object.entries(delta)){
   const row=Object.hasOwn(totals,id)?totals[id]:Object.defineProperty(totals,id,{value:{},enumerable:true,writable:true})[id];
   for(const [key,n] of Object.entries(values))add(row,key,n);
  }
 }
 function run(r){return r.telemetry18??=initial(true)}
 function record(s,kind,amount,target){if(!(amount>0)||!Number.isFinite(amount))return;const m=s.metrics18??=initial(false);m[kind]+=amount;const key={damage:'maxDamage',taken:'maxTaken',healing:'maxHealing'}[kind];m[key]=Math.max(m[key],amount);if(target?.uid)m.net[target.uid]=(m.net[target.uid]||0)+(kind==='healing'?amount:-amount)}
 function loss(s,t,n,type){const enemy=s.enemies?.some(e=>e.uid===t.uid);record(s,enemy?'damage':'taken',n,t);if(!enemy)note(s,t,'taken',n);if(enemy&&n>0&&['physical','arts','true'].includes(type)){const best=s.metrics18.maxByType??={};best[type]=Math.max(best[type]||0,n);}}
 function apply(r,s){const before=r.battle?.metrics18||initial(false),m=s.metrics18??=initial(false),prior=r.battle;
  // Cover direct HP effects that bypass the shared damage/healing adapter.
  for(const [group,oldGroup]of [[s.team,r.team],[s.enemies,prior?.enemies]])for(const t of group||[]){const old=oldGroup?.find(x=>x.uid===t.uid);if(!old||t.exited&&!old.exited)continue;const recorded=(m.net[t.uid]||0)-(before.net[t.uid]||0),maxDelta=(t.max||0)-(old.max||0),actual=t.hp-old.hp;let residual=actual-recorded;if(maxDelta&&Math.sign(maxDelta)===Math.sign(residual))residual-=Math.sign(residual)*Math.min(Math.abs(residual),Math.abs(maxDelta));if(residual>0){if(group===s.team)record(s,'healing',residual,t)}else if(residual<0){record(s,group===s.team?'taken':'damage',-residual,t);if(group===s.team)note(s,t,'taken',-residual)}}
  const total=run(r);if(m.maxByType){total.maxByType??={};for(const [type,n]of Object.entries(m.maxByType))total.maxByType[type]=Math.max(total.maxByType[type]||0,n);}for(const k of keys)total[k]+=Math.max(0,(m[k]||0)-(before[k]||0));for(const k of maxKeys)total[k]=Math.max(total[k],m[k]||0);for(const [uid,n]of Object.entries(m.net))total.net[uid]=(total.net[uid]||0)+n-(before.net[uid]||0);
 }
 function reconcile(before,after,account){if(!after||!before||before.number!==after.number)return;const old=before.telemetry18||initial(true),m=run(after);m.curioIds??=[];for(const x of after.curios?.owned||[])if(!m.curioIds.includes(x.id))m.curioIds.push(x.id);m.captures??=[];for(const x of after.capturedInstances||[])if(!m.captures.some(c=>c.uid===x.uid))m.captures.push({uid:x.uid,species:x.species});if(after.result)return;for(const a of after.team||[]){const b=before.team?.find(x=>x.id===a.id);if(!b||a.exited&&!b.exited)continue;const uid=a.uid||a.instanceId||a.id,known=(m.net[uid]||0)-(old.net[uid]||0),delta=a.hp-b.hp,maxDelta=(a.max||0)-(b.max||0);let residual=delta-known;if(maxDelta&&Math.sign(maxDelta)===Math.sign(residual))residual-=Math.sign(residual)*Math.min(Math.abs(residual),Math.abs(maxDelta));if(residual>0){m.healing+=residual;m.maxHealing=Math.max(m.maxHealing,residual)}else if(residual<0){m.taken-=residual;m.maxTaken=Math.max(m.maxTaken,-residual);if(account&&after.battle)note(after.battle,a,'taken',-residual)}m.net[uid]=(m.net[uid]||0)+residual;}}
 return{initial,run,record,loss,apply,reconcile,note,commit};
})();
