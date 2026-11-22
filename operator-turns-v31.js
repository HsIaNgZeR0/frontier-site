'use strict';
// Isolated v3.1 turn-state component. Not enabled by the live game loader.
globalThis.FrontierOperatorTurnsV31=(()=>{
  const zones=['hand','draw','discard','exhaust'];
  const clone=value=>structuredClone(value);
  function initialize(input){
    const state=clone(input);state.version=1;state.phase??='player';state.turn??=1;
    state.seq??=0;state.nextCard??=1;state.receipts??={};state.skills??=[];
    state.pending??=[];state.events??=[];
    for(const zone of zones){state[zone]??=[];for(const card of state[zone])card.uid??='card:'+state.nextCard++}
    validate(state);return state;
  }
  function validate(state){
    if(!Number.isSafeInteger(state.seq)||state.seq<0||!Number.isInteger(state.turn)||state.turn<1)throw Error('Invalid turn sequence');
    if(!['player','retain','retain-overflow','enemy'].includes(state.phase))throw Error('Invalid turn phase');
    const ids=new Set();
    for(const zone of zones){if(!Array.isArray(state[zone]))throw Error('Invalid card zone');for(const card of state[zone]){if(typeof card.uid!=='string'||!card.uid||ids.has(card.uid)||card.virtual)throw Error('Duplicate or virtual normal card');ids.add(card.uid)}}
    if(state.hand.length>10)throw Error('Normal hand exceeds ten');
    if(state.skills.some(skill=>!skill.virtual||typeof skill.uid!=='string'||!skill.uid||ids.has(skill.uid)))throw Error('Invalid signature card or normal card zone');
    if(new Set(state.skills.map(skill=>skill.uid)).size!==state.skills.length)throw Error('Duplicate signature card');
    return true;
  }
  const limit=options=>{const value=options.retainLimit??(2+(options.retainBonus||0));if(!Number.isSafeInteger(value)||value<2)throw Error('Invalid retention bonus');return Math.min(5,value)};
  const native=(card,options)=>options.nativeRetain?options.nativeRetain(card):!!card.retain;
  function endChoice(state,options){
    if(state.phase!=='player'||state.pending.length)throw Error('An action still requires resolution');
    const expired=state.hand.filter(card=>card.temporaryTurn!=null&&card.temporaryTurn<=state.turn);
    state.hand=state.hand.filter(card=>!expired.includes(card));state.exhaust.push(...expired);
    const required=state.hand.filter(card=>native(card,options)).map(card=>card.uid);
    state.retainRequired=required;state.retainSelection=required.slice(0,limit(options));
    state.phase=required.length>limit(options)?'retain-overflow':'retain';
    return{phase:state.phase,required,candidates:state.hand.map(card=>card.uid),max:limit(options)};
  }
  function retain(state,ids,options){
    if(!['retain','retain-overflow'].includes(state.phase)||!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.length>limit(options))throw Error('Invalid retention choice');
    const selected=new Set(ids),available=new Set(state.hand.map(card=>card.uid));
    if(ids.some(id=>!available.has(id)))throw Error('Selected card is not in hand');
    const required=state.retainRequired||[];
    if(required.length<=limit(options)&&required.some(id=>!selected.has(id)))throw Error('Native retention has priority');
    if(required.length>limit(options)&&(ids.length!==limit(options)||ids.some(id=>!required.includes(id))))throw Error('Choose the native-retention overflow explicitly');
    const discarded=state.hand.filter(card=>!selected.has(card.uid));state.discard.push(...discarded);
    state.hand=state.hand.filter(card=>selected.has(card.uid));
    state.events.push({type:'ruleDiscard',turn:state.turn,cards:discarded.map(card=>card.uid),active:false});
    state.retainSelection=ids;state.phase='enemy';return{discarded:discarded.length,retained:ids.length};
  }
  function refill(state,options){
    if(state.phase!=='enemy')throw Error('Enemy phase must finish first');
    state.turn++;state.phase='player';state.energy=5;for(const zone of zones)for(const card of state[zone])if(card.retainUntilTurn!=null&&card.retainUntilTurn<=state.turn){delete card.retain;delete card.retainUntilTurn}
    const needed=Math.max(0,7-state.hand.length);let drawn=0;
    for(let i=0;i<needed&&state.hand.length<10;i++){
      if(!state.draw.length&&state.discard.length){
        if(!options.shuffle)throw Error('A deterministic game shuffle adapter is required');
        const expected=state.discard.map(card=>card.uid).sort();
        const shuffled=options.shuffle(clone(state.discard),state);
        if(!Array.isArray(shuffled)||JSON.stringify(shuffled.map(card=>card.uid).sort())!==JSON.stringify(expected))throw Error('Shuffle must preserve every card');
        state.draw=shuffled;state.discard=[];
        options.onShuffle?.(state);
      }
      if(!state.draw.length)break;
      state.hand.push(state.draw.pop());drawn++;
    }
    state.retainSelection=[];delete state.retainRequired;
    state.events.push({type:'turnStart',turn:state.turn,drawn});return{drawn,hand:state.hand.length};
  }
  function discard(state,uid,options){
    const permission=state.pending[0];
    if(state.phase!=='player'||permission?.type!=='activeDiscard'||permission.remaining<1)throw Error('Free action-phase discard is forbidden');
    const index=state.hand.findIndex(card=>card.uid===uid);if(index<0)throw Error('Card is not in hand');
    if(state.hand[index].retainSelected)throw Error('Cancel retention before discarding');
    const [card]=state.hand.splice(index,1);state.discard.push(card);
    permission.remaining--;if(!permission.remaining)state.pending.shift();
    const event={type:'activeDiscard',card:card.uid,source:permission.source,turn:state.turn};state.events.push(event);options.onActiveDiscard?.(state,event);return{discarded:uid};
  }
  function apply(input,command,options={}){
    const state=initialize(input);
    if(!command||typeof command.id!=='string'||!command.id)throw Error('Missing operation ID');
    const digest=JSON.stringify({...command,seq:undefined}),receipt=state.receipts[command.id];
    if(receipt){if(receipt.digest!==digest)throw Error('Operation ID payload changed');return{state,result:clone(receipt.result),replayed:true}}
    if(command.seq!==state.seq+1)throw Error('Stale battle operation');
    let result;
    if(command.type==='endChoice')result=endChoice(state,options);
    else if(command.type==='retain')result=retain(state,command.cards,options);
    else if(command.type==='refill')result=refill(state,options);
    else if(command.type==='discard')result=discard(state,command.card,options);
    else throw Error('Unsupported turn operation');
    state.seq=command.seq;state.receipts[command.id]={digest,result:clone(result)};validate(state);
    return{state,result,replayed:false};
  }
  function canAutoEnd(state,options={}){
    if(state.phase!=='player'||state.pending.length||options.dragging||options.animating||options.menuOpen||options.targeting||options.chainPending)return false;
    if(state.hand.some(card=>options.canPlay?.(card,state)))return false;
    if(state.skills.some(skill=>skill.ready&&options.canSkill?.(skill,state)))return false;
    return !options.hasOtherAction?.(state);
  }
  return{initialize,validate,apply,canAutoEnd};
})();
