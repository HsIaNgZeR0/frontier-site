'use strict';
globalThis.FrontierOperatorStatusDictionaryV31=(()=>{
 // The status owner declares dispellability. Do not equate every counter with a debuff.
 const definitions={bleed:{name:'流血',cleanse:true},poison:{name:'中毒',cleanse:true},burn:{name:'灼燒',cleanse:true},slow:{name:'遲滯',cleanse:true},bind:{name:'束縛',cleanse:true},silence:{name:'沉默',cleanse:true},weightless:{name:'失重',cleanse:true},mentalDamage:{name:'精神損傷',cleanse:false},surtrEmbers:{name:'餘燼',cleanse:false}};
 function cleanse(state,actor,target,layers){if(!Number.isSafeInteger(layers)||layers<0)throw Error('Invalid cleanse count');let removed=0;const statuses=target.statuses||[];for(const status of statuses){if(removed>=layers)break;const d=definitions[status.id];if(status.dispellable===false||!d?.cleanse||!Number.isSafeInteger(status.stacks)||status.stacks<=0)continue;const n=Math.min(status.stacks,layers-removed);status.stacks-=n;removed+=n;}target.statuses=statuses.filter(s=>s.stacks>0);for(const id of ['poison','bleed','burn','cold','freeze','neural','weak','silence','corrosion','fear','wound','blind']){const value=target.status?.[id];if(removed>=layers)break;if(!Number.isSafeInteger(value)||value<=0)continue;const n=Math.min(value,layers-removed);target.status[id]-=n;removed+=n;if(id==='freeze'&&!target.status[id]&&target.drug)delete target.drug.freezeSkillLockedUntil;}state.events??=[];if(removed)state.events.push({type:'cleanse',source:actor.uid,target:target.uid,layers:removed});return removed}
 function entangleThreshold(t){return t.boss||t.elite?5:3}
 function breakStatus(target){
  if(!target.special||target.special.solved||!target.action?.breakWindow)return false;
  target.action.breakProgress=Math.min(target.action.breakRequired,(target.action.breakProgress||0)+1);
  return true;
 }
 function convertStatus(target,prior){
  if(!target.special||target.special.solved||!target.action?.breakWindow)return;
  // Ordinary enemies retain a binding action skip; only elites/bosses convert it to disruption progress.
  if(!target.boss&&!target.elite&&target.skipNextControllableAction)return;
  const converted=new Set();
  if(target.skipNextOrdinaryAction||target.skipNextControllableAction){
   if(target.skipNextOrdinaryAction)converted.add('stun');
   if(target.skipNextControllableAction)converted.add('bind');delete target.skipNextOrdinaryAction;delete target.skipNextControllableAction;delete target.skipSource;
  }
  target.statuses=(target.statuses||[]).filter(status=>{
   if(status.stacks>0)converted.add(status.id);
   return false;
  });
  for(const [id,amount] of Object.entries(target.status&&typeof target.status==="object"?target.status:{})){
   if(amount>0)converted.add(id);
   delete target.status[id];
  }
  for(const [key,id] of [['poison','poison'],['vuln','vulnerable'],['weak','weak']]){
   if(target[key]>(prior?.[key]||0))converted.add(id);
   if(target[key]>0)target[key]=0;
  }
  if(target.ignite?.length){converted.add('burn');target.ignite=[]}
  for(const id of ['shock','saw']){
   if(target.counters?.[id]>0){converted.add(id);delete target.counters[id];if(target.counterExpiry)delete target.counterExpiry[id]}
  }
  if(target.armorReductions?.length){
   converted.add('armor');
   target.def=(target.def||0)+target.armorReductions.reduce((sum,layer)=>sum+(layer.applied||0),0);
   target.armorReductions=[];
  }
  if(converted.has('suppression'))delete target.nextSuppressibleDamageReduction;
  for(const kind of converted)breakStatus(target);
 }
 function bind(state,actor,target){const threshold=entangleThreshold(target);if(target.hp<=0||target.exited||!(target.counters?.entangle>=threshold))return false;if(target.skipNextControllableAction)return false;target.counters.entangle-=threshold;if(!breakStatus(target)){target.skipNextControllableAction=true;target.statuses??=[];target.statuses=target.statuses.filter(x=>x.id!=='bind');target.statuses.push({id:'bind',source:actor.uid,stacks:1,expiresEnemyPhase:state.turn});}state.events??=[];state.events.push({type:'entangleTriggered',source:actor.uid,target:target.uid,threshold,turn:state.turn});return true}
 function entangle(state,actor,target,amount){if(target.hp<=0||target.exited)return 0;if(amount>0&&breakStatus(target))return 0;target.counters??={};const prior=target.counters.entangle||0,threshold=entangleThreshold(target);target.counters.entangle=Math.min(threshold,(target.counters.entangle||0)+amount);target.counterExpiry??={};target.counterExpiry.entangle=state.turn+1;bind(state,actor,target);return Math.min(amount,Math.max(0,threshold-prior))}
 const mentalThreshold=t=>t.boss?8:t.elite?6:4;
 function mental(state,actor,target,amount){
  if(!Number.isSafeInteger(amount)||amount<0)throw Error('Invalid mental damage');
  if(target.hp<=0||target.exited||amount>0&&breakStatus(target))return {applied:0,collapsed:false};
  target.counters??={};const threshold=mentalThreshold(target),before=target.counters.mentalDamage||0,immune=target.mentalImmuneUntil>=state.turn;
  const value=immune?Math.min(threshold-1,before+amount):before+amount,applied=Math.max(0,value-before);target.counters.mentalDamage=value;target.mentalLastTurn=state.turn;
  let collapsed=false;if(!immune&&value>=threshold){collapsed=true;target.counters.mentalDamage=0;if(target.boss)target.mentalImmuneUntil=state.turn+1;if(target.action?.breakable&&target.action?.breakWindow){if(!breakStatus(target))target.action.breakProgress=target.action.breakRequired;}else target.nextSpecialDamageReduction=Math.max(target.nextSpecialDamageReduction||0,.25)}
  state.events??=[];state.events.push({type:'mentalDamage',source:actor.uid,target:target.uid,applied,collapsed,turn:state.turn});return {applied,collapsed};
 }
 return{breakStatus,convertStatus,definitions,cleanse,mental,mentalThreshold,entangle,bind,entangleThreshold};
})();
