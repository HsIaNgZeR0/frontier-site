'use strict';
// Signature transactions use authored functions, never executable prose parsing.
globalThis.FrontierOperatorSignaturesV113=(()=>{
 const clone=value=>structuredClone(value);
 function create(definitions){
  const definition=actor=>definitions[actor.operator]?.[actor.form||'standard'];
  const key=actor=>actor.uid;
  function setup(state){state.skills??=[];state.signatureState??={actors:{},receipts:{},events:{}};return state.signatureState}
  function progress(state,actor,def){const value=def.resource?actor.resources?.[def.resource]??0:state.signatureState.actors[key(actor)]?.charge??0;if(!Number.isSafeInteger(value)||value<0)throw Error('Invalid signature charge state');return value}
  function threshold(state,actor,def,command){const value=typeof def.threshold==='function'?def.threshold(state,actor,command):def.threshold;if(!Number.isSafeInteger(value)||value<1)throw Error('Invalid signature threshold');return value}
  function battleLimit(state,actor,def){const value=typeof def.maxBattle==='function'?def.maxBattle(state,actor):def.maxBattle??Infinity;if(value!==Infinity&&(!Number.isSafeInteger(value)||value<1))throw Error('Invalid signature battle limit');return value}
  function syncDraft(state){
   const meta=setup(state),cards=[];if(new Set(state.team.map(a=>a.uid)).size!==state.team.length)throw Error('Duplicate signature owner');
   for(const actor of state.team){if(actor.operator==='operator_v31_aak'&&!actor.passiveInit49){actor.passiveInit49=true;actor.resources??={};actor.resources.medicine=Math.max(1,actor.resources.medicine||0)}if(actor.operator==='operator_v31_muelsyse'&&actor.flow?.hp<=0&&actor.flowRebuildAt==null)actor.flowRebuildAt=state.turn+1;if(actor.operator==='char_172_svrash'&&actor.elite===2&&actor.hp>0&&!actor.exited)for(const enemy of state.enemies)enemy.intentRevealed=true;const def=definition(actor);if(!def)continue;if(!Object.hasOwn(meta.actors,key(actor)))Object.defineProperty(meta.actors,key(actor),{value:{charge:typeof def.initialCharge==='function'?def.initialCharge(state,actor):def.initialCharge||0,casts:0,lastTurn:null},enumerable:true,writable:true});
    if(actor.hp<=0||actor.exited||meta.actors[key(actor)].casts>=battleLimit(state,actor,def)||progress(state,actor,def)<threshold(state,actor,def))continue;
    // Readiness is independent of AP, targeting, turn limits and ordinary zones.
    cards.push({uid:'signature:'+key(actor),id:def.id,owner:actor.uid,operator:actor.operator,form:actor.form||'standard',virtual:true,ready:true,name:def.name,type:def.type,art:def.art});
   }
   for(const actor of state.team)if(state.phase==='player'&&actor.operator==='texas_the_omertosa'&&actor.hp>0&&!actor.exited&&actor.fastDeployReady49===state.turn)cards.push({uid:'aux49:'+actor.uid+':'+state.turn,id:'TEXO-AMBUSH49',owner:'aux49:'+actor.uid,actorUid:actor.uid,operator:actor.operator,virtual:true,auxiliary49:true,ready:true,name:'瞬身急襲',type:'arts'});state.skills=cards;return state;
  }
  function sync(input){return syncDraft(clone(input))}
  function emit(input,event){
   const state=sync(input),meta=state.signatureState;
   if(typeof event.id!=='string'||!event.id)throw Error('Signature event requires stable identity');
   const digest=JSON.stringify(event);
   if(Object.hasOwn(meta.events,event.id)){if(meta.events[event.id]!==digest)throw Error('Signature event changed');return state}
   Object.defineProperty(meta.events,event.id,{value:digest,enumerable:true});
   // Signature, copied and passive events never enter ordinary-card charging.
   if(event.copied||!['ordinary','enemy','turn'].includes(event.sourceKind))return state;
   if(event.type==='ordinaryCardPlayed'&&event.sourceKind==='ordinary'){const actor=state.team.find(a=>a.uid===event.actor);if(actor)actor.lastActionTurn49=state.turn}
   for(const actor of state.team){const def=definition(actor),handler=event.sourceKind==='ordinary'?def?.onOrdinaryEvent:def?.onBattleEvent;if(!handler||actor.hp<=0||actor.exited)continue;
    const amount=handler(state,actor,event);
    if(!Number.isSafeInteger(amount)||amount<0)throw Error('Invalid authored signature charge');
    if(!amount)continue;
    if(def.resource){actor.resources??={};actor.resources[def.resource]=Math.min(def.resourceCap??threshold(state,actor,def),progress(state,actor,def)+amount)}
    else {const entry=meta.actors[key(actor)];entry.charge=Math.min(threshold(state,actor,def),entry.charge+amount)}
   }
   if(event.sourceKind==='ordinary'&&event.type==='ordinaryCardPlayed'&&!event.copied){for(const ptil of state.team.filter(a=>a.operator==='char_128_plosis'&&a.hp>0&&!a.exited&&!a.ptilAuraUsed)){ptil.ptilAuraOwners??=[];if(state.team.some(a=>a.uid===event.actor)&&!ptil.ptilAuraOwners.includes(event.actor))ptil.ptilAuraOwners.push(event.actor);if(ptil.ptilAuraOwners.length>=2){ptil.ptilAuraUsed=true;for(const ally of state.team){const d=definition(ally);if(ally.uid!==ptil.uid&&ally.hp>0&&!ally.exited&&d?.cardCountChargeEligible&&!d.resource){const entry=meta.actors[key(ally)];entry.charge=Math.min(threshold(state,ally,d),entry.charge+1)}}}}}
   return syncDraft(state);
  }
  function cast(input,command,adapters={}){
   let state=sync(input),meta=state.signatureState;
   if(typeof command.id!=='string'||!command.id)throw Error('Missing signature operation identity');
   const digest=JSON.stringify(command);
   if(Object.hasOwn(meta.receipts,command.id)){const receipt=meta.receipts[command.id];if(receipt.digest!==digest)throw Error('Signature operation changed');return {state,result:clone(receipt.result),replayed:true}}
   const actor=state.team.find(a=>a.uid===command.actor),def=actor&&definition(actor);
   if(!actor||!def||actor.hp<=0||actor.exited||state.phase!=='player'||state.pending?.length)throw Error('Signature owner or phase unavailable');
   if(actor.exhaustedTurn===state.turn||actor.stunnedTurn===state.turn||actor.cardsLockedTurn===state.turn)throw Error('Signature owner is unable to act this turn');
   const entry=meta.actors[key(actor)],need=threshold(state,actor,def,command),cost=typeof def.cost==='function'?def.cost(state,actor,command):def.cost;
   if(!Number.isSafeInteger(cost)||cost<0||!Number.isSafeInteger(state.energy)||state.energy<cost||progress(state,actor,def)<need)throw Error('Signature is not affordable or ready');
   const teamCasts=Object.values(meta.actors).filter(a=>a.lastTurn===state.turn).reduce((n,a)=>n+(a.turnCasts||0),0);
   if(entry.lastTurn===state.turn||teamCasts>=2||entry.casts>=battleLimit(state,actor,def)||entry.lastTurn!=null&&state.turn-entry.lastTurn<(def.minTurnGap??1))throw Error('Signature use limit reached');
   if(typeof def.validate!=='function'||typeof def.execute!=='function')throw Error('Signature effect is not implemented');
   // Target and mode validation precede payment. Exceptions discard this draft.
   def.validate(state,actor,command,adapters);
   state.energy-=cost;if(def.resource)actor.resources[def.resource]-=need;else entry.charge=0;
   actor.lastActionTurn49=state.turn;const eventStart=state.events?.length||0;def.execute(state,actor,command,adapters);
   for(const event of (state.events||[]).slice(eventStart)){event.sourceKind='signature';event.sourceAction=command.id}
   entry.casts++;entry.lastTurn=state.turn;entry.turnCasts=1;
   const result={signature:def.id,actor:actor.uid,cost,turn:state.turn};
   Object.defineProperty(meta.receipts,command.id,{value:{digest,result:clone(result)},enumerable:true});
   syncDraft(state);return {state,result,replayed:false};
  }
  return {sync,emit,cast};
 }
 return {create};
})();
