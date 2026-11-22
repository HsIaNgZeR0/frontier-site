'use strict';
globalThis.FrontierOperatorSignatureRulesV113=(()=>{
 function create(catalog){
  const definitions={};
  const fang=catalog.forms.find(f=>f.operatorName==='芬');
  definitions[fang.operatorId]={standard:{
   id:'signature:'+fang.operatorId+':standard',name:fang.signature.name,type:'support',
   threshold:3,cost:0,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.type==='ordinaryCardPlayed'?1:0,
   validate(s,a){if(![0,1].includes(a.elite||0)||!s.team.some(t=>t.uid!==a.uid&&t.hp>0&&!t.exited))throw Error('Fang requires a living teammate and legal elite stage')},
   execute(s,a,c){s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{other:true,cost:1,effect:'damageOrShield'},amount:(a.elite||0)===0?.15:.2,remaining:1});
    if((a.elite||0)>=1){s.pending??=[];s.pending.push({type:'drawDiscard',draw:1,discard:1,owner:a.uid,source:c.id,drawn:[],stage:(s.hand?.length||0)>=10?'discardFirst':'draw'})}
   }
  }};
  const vanilla=catalog.forms.find(f=>f.operatorName==='香草');
  definitions[vanilla.operatorId]={standard:{id:'signature:'+vanilla.operatorId+':standard',name:vanilla.signature.name,type:'physical',threshold:3,cost:1,maxBattle:2,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.type==='ordinaryCardPlayed'&&e.attack?1:0,
   validate(s,a,c){if(![0,1].includes(a.elite||0)||!s.enemies.some(e=>e.uid===c.target&&e.hp>0&&!e.exited&&e.targetable!==false))throw Error('Vanilla signature target unavailable')},
   execute(s,a,c,adapters){const target=s.enemies.find(e=>e.uid===c.target),training=a.resources?.training||0;a.resources??={};a.resources.training=0;if(typeof adapters.damage!=='function')throw Error('Shared damage adapter required');adapters.damage(s,a,target,a.atk*((a.elite||0)===0?1.6:1.9)+(training*((a.elite||0)===0?2:3))*10,'physical')}
  }};
  function target(s,c){const t=s.enemies.find(e=>e.uid===c.target&&e.hp>0&&!e.exited&&e.targetable!==false);if(!t)throw Error('Signature target unavailable');return t}
  function stage(a){if(![0,1].includes(a.elite||0))throw Error('Invalid three-star elite');return a.elite||0}
  function draw(s,a,n,adapters){const before=s.hand?.length||0;for(let i=0;i<n&&(s.hand?.length||0)<10;i++){s.hand??=[];s.draw??=[];s.discard??=[];if(!s.draw.length&&s.discard.length){if(typeof adapters.shuffle!=='function')throw Error('Deterministic shuffle required');const expected=s.discard.map(c=>c.uid).sort(),cards=adapters.shuffle(structuredClone(s.discard),s);if(JSON.stringify(cards.map(c=>c.uid).sort())!==JSON.stringify(expected)||cards.some(c=>c.virtual))throw Error('Invalid signature draw shuffle');s.draw=cards;s.discard=[]}if(!s.draw.length)break;s.hand.push(s.draw.pop())}globalThis.FrontierCombatMetricsV18?.note(s,a,'support',(s.hand?.length||0)-before)}
  const plume=catalog.forms.find(f=>f.operatorName==='翎羽');
  definitions[plume.operatorId]={standard:{id:'signature:'+plume.operatorId+':standard',name:plume.signature.name,type:'physical',threshold:3,cost:0,maxBattle:3,
   onOrdinaryEvent:(s,a,e)=>e.actor!==a.uid?0:e.kills?.length?3:e.attack?1:0,
   validate(s,a,c){stage(a);target(s,c)},
   execute(s,a,c,adapters){const t=target(s,c);adapters.damage(s,a,t,a.atk*(stage(a)?1.55:1.2),'physical');if(stage(a)&&t.hp<=0)draw(s,a,1,adapters)}
  }};
  const melan=catalog.forms.find(f=>f.operatorName==='玫蘭莎');
  definitions[melan.operatorId]={standard:{id:'signature:'+melan.operatorId+':standard',name:melan.signature.name,type:'support',threshold:3,cost:0,maxBattle:2,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.attack?1:0,
   validate(s,a){stage(a)},execute(s,a){s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{owner:a.operator,attack:true},amount:stage(a)?.5:.35,remaining:null,expiresTurn:s.turn+1});if(stage(a))a.melanthaKillShield={expiresTurn:s.turn+1,used:false}}
  }};
  const popukar=catalog.forms.find(f=>f.operatorName==='泡普卡');
  definitions[popukar.operatorId]={standard:{id:'signature:'+popukar.operatorId+':standard',name:popukar.signature.name,type:'physical',threshold:3,cost:1,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.hitTargets?.length?1:0,
   validate(s,a,c){stage(a);const ids=enemyIds(s,c,2);if(!Array.isArray(ids)||!ids.length||ids.length>2||new Set(ids).size!==ids.length||ids.some(id=>!s.enemies.some(e=>e.uid===id&&e.hp>0&&!e.exited&&e.targetable!==false)))throw Error('Choose at most two legal enemies')},
   execute(s,a,c,adapters){for(const id of enemyIds(s,c,2)){const t=s.enemies.find(e=>e.uid===id);adapters.damage(s,a,t,a.atk*(stage(a)?1.25:1),'physical');if(t.hp>0){t.counters??={};t.counters.saw=Math.min(2,(t.counters.saw||0)+1)}}}
  }};
  const midnight=catalog.forms.find(f=>f.operatorName==='月見夜');
  definitions[midnight.operatorId]={standard:{id:'signature:'+midnight.operatorId+':standard',name:midnight.signature.name,type:'support',threshold:3,cost:1,maxBattle:2,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid?1:0,validate(s,a){stage(a)},execute(s,a){a.nightSwitch={remaining:2,bonus:stage(a)?.2:.1,reduceArmored:stage(a)===1}}
  }};
  function enemyAction(a,e,eligible){if(!eligible||e.type!=='enemyDamage'||(e.totalTeamDamage??(e.absorbed+e.hpLoss))<=0)return 0;a.signatureEnemyActions??=[];const id=e.actionId||e.id;if(a.signatureEnemyActions.includes(id))return 0;a.signatureEnemyActions.push(id);return 1}
  const cardigan=catalog.forms.find(f=>f.operatorName==='卡緹');
  definitions[cardigan.operatorId]={standard:{id:'signature:'+cardigan.operatorId+':standard',name:cardigan.signature.name,type:'protection',threshold:3,cost:0,maxBattle:2,
   onBattleEvent:(s,a,e)=>enemyAction(a,e,e.single&&e.target===a.uid&&e.absorbed+e.hpLoss>0),validate(s,a){stage(a)},execute(s,a,c,adapters){adapters.heal(s,a,a,Math.round(a.max*(stage(a)?.2:.15)));a.resources??={};a.resources.vigor=Math.min(3,(a.resources.vigor||0)+(stage(a)?2:1))}
  }};
  const spot=catalog.forms.find(f=>f.operatorName==='斑點');
  definitions[spot.operatorId]={standard:{id:'signature:'+spot.operatorId+':standard',name:spot.signature.name,type:'protection',threshold:3,cost:1,
   onBattleEvent:(s,a,e)=>enemyAction(a,e,true),validate(s,a){stage(a)},execute(s,a,c,adapters){const targets=s.team.filter(x=>x.hp>0&&!x.exited).sort((x,y)=>x.hp/x.max-y.hp/y.max).slice(0,2);for(const t of targets){adapters.heal(s,a,t,Math.round(a.atk*(stage(a)?1.2:.9)));if(stage(a))globalThis.FrontierEquipmentTuning15?FrontierEquipmentTuning15.shield(s,a,t,30):t.block=(t.block||0)+30}}
  }};
  const kroos=catalog.forms.find(f=>f.operatorName==='克洛絲');
  definitions[kroos.operatorId]={standard:{id:'signature:'+kroos.operatorId+':standard',name:kroos.signature.name,type:'physical',threshold:3,cost:0,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.attack?1:0,validate(s,a,c){stage(a);target(s,c)},execute(s,a,c,adapters){const t=target(s,c),prior=t.counters?.kroosAim||0;for(let i=0;i<2&&t.hp>0;i++)adapters.damage(s,a,t,a.atk*(stage(a)?.6:.45),'physical');if(stage(a)&&prior&&t.hp>0){t.counters??={};t.counters.kroosAim=Math.min(3,(t.counters.kroosAim||0)+1);t.counterExpiry??={};t.counterExpiry.kroosAim=s.turn+1}}
  }};
  const adnachiel=catalog.forms.find(f=>f.operatorName==='安德切爾');
  definitions[adnachiel.operatorId]={standard:{id:'signature:'+adnachiel.operatorId+':standard',name:adnachiel.signature.name,type:'physical',threshold:3,cost:1,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.attack?1:0,validate(s,a,c){if(stage(a)===0)target(s,c);else if(!s.enemies.some(living))throw Error('No legal enemy')},execute(s,a,c,adapters){const t=stage(a)?s.enemies.filter(living).reduce((best,e)=>!best||(e.def||0)<(best.def||0)?e:best,null):target(s,c);adapters.damage(s,a,t,a.atk*(stage(a)?1.85:1.45),'physical');if(t.hp>0){if(stage(a))t.nextOrdinaryDamageReduction=Math.max(t.nextOrdinaryDamageReduction||0,.1);else{t.counters??={};t.counters.adnaLock=Math.min(3,(t.counters.adnaLock||0)+1);t.counterExpiry??={};t.counterExpiry.adnaLock=s.turn+1}}}
  }};
  const catapult=catalog.forms.find(f=>f.operatorName==='空爆');
  definitions[catapult.operatorId]={standard:{id:'signature:'+catapult.operatorId+':standard',name:catapult.signature.name,type:'physical',resource:'blastProgress',threshold:3,cost:2,maxBattle:2,
   onOrdinaryEvent(s,a,e){if(e.actor!==a.uid||!e.attack||!(e.hpDamage>0))return 0;if(a.blastTurn?.turn!==s.turn)a.blastTurn={turn:s.turn,cards:[],bonus:false,fallback:false};if(e.aoe){let amount=1;if(!a.blastTurn.cards.includes(e.card))a.blastTurn.cards.push(e.card);if(a.blastTurn.cards.length>=2&&!a.blastTurn.bonus){a.blastTurn.bonus=true;amount++}return amount}const deck=[...(s.hand||[]),...(s.draw||[]),...(s.discard||[]),...(s.exhaust||[])].filter(c=>c.owner===a.operator);if(deck.some(c=>['CATA-01','CATA-02','CATA-05'].includes(c.id))||a.blastTurn.fallback||(a.blastFallbackCount||0)>=2)return 0;a.blastTurn.fallback=true;a.blastFallbackCount=(a.blastFallbackCount||0)+1;return 1},
   validate(s,a,c){stage(a);const ids=enemyIds(s,c,stage(a)?4:3);if(!Array.isArray(ids)||!ids.length||ids.length>(stage(a)?4:3)||new Set(ids).size!==ids.length||ids.some(id=>!s.enemies.some(e=>e.uid===id&&living(e))))throw Error('Invalid grenade targets')},execute(s,a,c,adapters){for(const id of enemyIds(s,c,stage(a)?4:3)){const t=s.enemies.find(e=>e.uid===id);adapters.damage(s,a,t,a.atk*(stage(a)?1.25:1.05),'physical');if(stage(a)&&t.hp>0){t.counters??={};t.counters.shock=Math.min(2,(t.counters.shock||0)+1)}}}
  }};
  const lava=catalog.forms.find(f=>f.operatorName==='炎熔');
  definitions[lava.operatorId]={standard:{id:'signature:'+lava.operatorId+':standard',name:lava.signature.name,type:'arts',threshold:5,cost:2,maxBattle:2,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid?Math.min(2,e.igniteApplied||0):0,validate(s,a,c){stage(a);const ids=enemyIds(s,c,3);if(!Array.isArray(ids)||!ids.length||ids.length>3||new Set(ids).size!==ids.length||ids.some(id=>!s.enemies.some(e=>e.uid===id&&living(e))))throw Error('Invalid fireburst targets')},execute(s,a,c,adapters){for(const id of enemyIds(s,c,3)){const t=s.enemies.find(e=>e.uid===id),burning=(t.ignite||[]).length>0;adapters.damage(s,a,t,a.atk*(stage(a)?1.6:1.3)+((burning?(stage(a)?5:3):0)*10),'arts')}}
  }};
  const steward=catalog.forms.find(f=>f.operatorName==='史都華德');
  definitions[steward.operatorId]={standard:{id:'signature:'+steward.operatorId+':standard',name:steward.signature.name,type:'arts',resource:'powerStrikeReady',threshold:3,cost:1,
   onOrdinaryEvent(s,a,e){if(e.actor!==a.uid)return 0;if(e.attack&&e.hpDamage>0)return 1;if(e.information&&a.stewardInfoTurn!==s.turn){a.stewardInfoTurn=s.turn;return 1}return 0},validate(s,a){stage(a);if(!s.enemies.some(living))throw Error('No legal high-defense target')},execute(s,a,c,adapters){const enemies=s.enemies.filter(living),t=enemies.reduce((best,e)=>!best||(e.def||0)>(best.def||0)?e:best,null),values=enemies.map(e=>e.def||0).sort((x,y)=>x-y),mid=(values[Math.floor((values.length-1)/2)]+values[Math.ceil((values.length-1)/2)])/2,ignore=stage(a)&&(enemies.length===1||(t.def||0)>mid)?10:0,old=t.res;try{t.res=Math.max(0,(t.res||0)-ignore);adapters.damage(s,a,t,a.atk*(stage(a)?2.6:2.1),'arts')}finally{t.res=old}}
  }};
  const hibiscus=catalog.forms.find(f=>f.operatorName==='芙蓉');
  definitions[hibiscus.operatorId]={standard:{id:'signature:'+hibiscus.operatorId+':standard',name:hibiscus.signature.name,type:'protection',threshold:(s,a)=>stage(a)?2:3,cost:1,
   onBattleEvent:(s,a,e)=>enemyAction(a,e,(e.teamHpLoss??e.hpLoss)>0),validate(s,a){stage(a);if(!s.team.some(t=>t.hp>0&&!t.exited&&(t.hp<t.max||t.statuses?.some(x=>x.dispellable!==false&&globalThis.FrontierOperatorStatusDictionaryV31?.definitions[x.id]?.cleanse&&x.stacks>0)||Object.values(t.status||{}).some(x=>x>0))))throw Error('全員滿血，沒有需要急救或淨化的幹員')},execute(s,a,c,adapters){const t=s.team.filter(t=>t.hp>0&&!t.exited).sort((x,y)=>x.hp/x.max-y.hp/y.max)[0],low=t.hp/t.max<.35;adapters.heal(s,a,t,Math.round(a.atk*(stage(a)?1.7:1.4)),{sourceKind:'signature',sourceAction:c.id});const cleanse=adapters.cleanse||globalThis.FrontierOperatorStatusDictionaryV31?.cleanse;if(!cleanse)throw Error('Cleanse adapter required');cleanse(s,a,t,1);if(stage(a)&&low)globalThis.FrontierEquipmentTuning15?FrontierEquipmentTuning15.shield(s,a,t,50):t.block=(t.block||0)+50}
  }};
  function anselCharge(s,a,heals){a.anselHealedAllies??=[];let amount=0;for(const heal of heals){if(!(heal.amount>0))continue;amount++;if(!a.anselHealedAllies.includes(heal.target))a.anselHealedAllies.push(heal.target)}if(a.anselHealedAllies.length>=3)amount=Math.max(amount,4-(s.signatureState.actors[a.uid]?.charge||0));return amount}
  const ansel=catalog.forms.find(f=>f.operatorName==='安賽爾');
  definitions[ansel.operatorId]={standard:{id:'signature:'+ansel.operatorId+':standard',name:ansel.signature.name,type:'protection',threshold:4,cost:1,maxBattle:3,
   onOrdinaryEvent(s,a,e){if(e.actor!==a.uid)return 0;let amount=anselCharge(s,a,e.heals||[]);if(e.cleansed>0&&a.anselCleanseTurn!==s.turn){a.anselCleanseTurn=s.turn;amount++}return amount},onBattleEvent:(s,a,e)=>e.type==='healingTick'&&e.actor===a.uid?anselCharge(s,a,[{target:e.target,amount:e.amount}]):0,
   validate(s,a){stage(a)},execute(s,a,c,adapters){const targets=s.team.filter(t=>t.hp>0&&!t.exited).sort((x,y)=>x.hp/x.max-y.hp/y.max).slice(0,2);for(const t of targets){adapters.heal(s,a,t,Math.round(a.atk*(stage(a)?1.4:1.1)),{sourceKind:'signature',sourceAction:c.id});if(stage(a)){const cleanse=adapters.cleanse||globalThis.FrontierOperatorStatusDictionaryV31?.cleanse;if(!cleanse)throw Error('Cleanse adapter required');cleanse(s,a,t,1)}}a.anselHealedAllies=[]}
  }};
  const orchid=catalog.forms.find(f=>f.operatorName==='梓蘭');
  definitions[orchid.operatorId]={standard:{id:'signature:'+orchid.operatorId+':standard',name:orchid.signature.name,type:'arts',threshold:3,cost:1,maxBattle:2,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid?e.slowApplied||0:0,validate(s,a,c){stage(a);target(s,c)},execute(s,a,c,adapters){const t=target(s,c);adapters.damage(s,a,t,a.atk*(stage(a)?1.6:1.3),'arts');if(stage(a)){t.nextOrdinaryDamageReduction=Math.max(t.nextOrdinaryDamageReduction||0,.15);if(t.hp>0&&t.action?.breakable===true&&t.action?.breakWindow===true){t.action.breakProgress=Math.min(t.action.breakRequired??Infinity,(t.action.breakProgress||0)+1);if(t.action.breakProgress>=t.action.breakRequired)t.breakWeakness=.15}}else t.nextAttackDamageReduction=Math.max(t.nextAttackDamageReduction||0,.15)}
  }};
  const myrtle=catalog.forms.find(f=>f.operatorName==='桃金娘');
  definitions[myrtle.operatorId]={standard:{id:'signature:'+myrtle.operatorId+':standard',name:myrtle.signature.name,type:'support',resource:'flag',threshold:3,cost:0,maxBattle:1,
   validate(s,a){if(![0,1,2].includes(a.elite||0)||!s.events?.some(e=>e.type==='ordinaryCardPlayed'&&e.turn===s.turn))throw Error('Use a normal card this turn before rallying')},execute(s,a,c,adapters){a.resources.flag=0;globalThis.FrontierCombatMetricsV18?.note(s,a,'support',5-s.energy);s.energy=5;if((a.elite||0)>=1){s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{other:true},amount:.1,remaining:1})}if((a.elite||0)===2)draw(s,a,1,adapters)}
  }};
  const elite3=a=>{const e=a.elite||0;if(![0,1,2].includes(e))throw Error('Invalid elite stage');return e};
  function enemyIds(s,c,max){if(c.targets)return c.targets;const enemies=s.enemies.filter(living),primary=enemies.find(e=>e.uid===c.target);if(!primary)return [c.target];return [primary,...enemies.filter(e=>e!==primary)].slice(0,max).map(e=>e.uid)}
  function group(s,c,max){const ids=enemyIds(s,c,max);if(!Array.isArray(ids)||!ids.length||ids.length>max||new Set(ids).size!==ids.length)throw Error('Choose distinct legal enemies');const targets=ids.map(id=>s.enemies.find(e=>e.uid===id&&living(e)));if(targets.some(x=>!x))throw Error('Enemy target unavailable');return targets}
  const ethan=catalog.forms.find(f=>f.operatorName==='伊桑');
  definitions[ethan.operatorId]={standard:{id:'signature:'+ethan.operatorId+':standard',name:ethan.signature.name,type:'arts',threshold:(s,a)=>elite3(a)===2?2:3,cost:1,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid?1:0,validate(s,a,c){elite3(a);group(s,c,3)},execute(s,a,c,adapters){const e=elite3(a);for(const t of group(s,c,3)){adapters.damage(s,a,t,a.atk*[.65,.8,.95][e],'arts');if(t.hp<=0)continue;const layers=(t.counters?.entangle||0)+(e===2?2:1);FrontierOperatorStatusDictionaryV31.entangle(s,a,t,e===2?2:1);if(e===2&&(t.boss||t.elite)&&layers>=2)t.nextOrdinaryDamageReduction=Math.max(t.nextOrdinaryDamageReduction||0,.2)}}
  }};
  const jaye=catalog.forms.find(f=>f.operatorName==='孑');
  definitions[jaye.operatorId]={standard:{id:'signature:'+jaye.operatorId+':standard',name:jaye.signature.name,type:'physical',resource:'goods',threshold:4,resourceCap:4,cost:1,
   validate(s,a,c){elite3(a);target(s,c)},execute(s,a,c,adapters){const e=elite3(a),enemy=target(s,c);adapters.damage(s,a,enemy,a.atk*[1.65,1.85,2.05][e],'physical');const alive=s.team.filter(t=>t.hp>0&&!t.exited),ally=alive.sort((x,y)=>e===0?x.hp-y.hp:x.hp/x.max-y.hp/y.max)[0];if(ally)adapters.heal(s,a,ally,a.atk*[1,1.1,1.3][e],{sourceKind:'signature',sourceAction:c.id})}
  }};
  const ambriel=catalog.forms.find(f=>f.operatorName==='安比爾');
  definitions[ambriel.operatorId]={standard:{id:'signature:'+ambriel.operatorId+':standard',name:ambriel.signature.name,type:'physical',threshold:3,cost:2,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.attack&&e.hitTargets?.length?1:0,validate(s,a){elite3(a);if(!s.enemies.some(living))throw Error('No legal enemy')},execute(s,a,c,adapters){const e=elite3(a),enemies=s.enemies.filter(living),t=enemies.reduce((best,x)=>!best||(x.def||0)<(best.def||0)?x:best,null);adapters.damage(s,a,t,a.atk*[2.4,2.7,3][e],'physical');if(e>=1&&t.hp>0){if(!t.boss&&!t.elite){t.statuses??=[];t.statuses.push({id:'slow',source:a.uid,stacks:1,expiresEnemyPhase:s.turn})}else if(t.action?.breakable===true&&t.action?.breakWindow===true){t.action.breakProgress=Math.min(t.action.breakRequired??Infinity,(t.action.breakProgress||0)+1);if(t.action.breakProgress>=t.action.breakRequired)t.breakWeakness=.15}}if(e===2&&t.hp<=0){const other=s.enemies.filter(living).reduce((best,x)=>!best||(x.def||0)<(best.def||0)?x:best,null);if(other)adapters.damage(s,a,other,a.atk*.8,'physical')}}
  }};
  const vigna=catalog.forms.find(f=>f.operatorName==='紅豆');
  definitions[vigna.operatorId]={standard:{id:'signature:'+vigna.operatorId+':standard',name:vigna.signature.name,type:'support',threshold:3,cost:0,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.attack?1:0,validate(s,a){elite3(a)},execute(s,a){s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{owner:a.operator,attack:true},amount:[.3,.4,.5][elite3(a)],remaining:1,expiresTurn:s.turn,halveRepeatTarget:elite3(a)===2})}
  }};
  const texasNormal=catalog.forms.find(f=>f.operatorName==='德克薩斯');
  definitions[texasNormal.operatorId]={standard:{id:'signature:'+texasNormal.operatorId+':standard',name:texasNormal.signature.name,type:'arts',threshold:4,cost:2,chargeKind:'turns',
   onBattleEvent:(s,a,e)=>e.type==='playerTurnCompleted'?1:0,validate(s,a,c){const level=elite3(a);group(s,c,3);const ids=c.stunTargets||[];if(ids.length>(level?2:1)||new Set(ids).size!==ids.length||ids.some(id=>!s.enemies.some(e=>e.uid===id&&stunnable(e))))throw Error('Choose legal ordinary stun targets')},execute(s,a,c,adapters){const level=elite3(a),targets=group(s,c,3);for(const t of targets)adapters.damage(s,a,t,a.atk*[.7,.9,1.1][level],'arts');for(const id of c.stunTargets||[]){const t=s.enemies.find(e=>e.uid===id&&stunnable(e));if(t)t.skipNextOrdinaryAction=true}if(level===2)for(const t of targets)if((t.boss||t.elite)&&window(t)){t.action.breakProgress=Math.min(t.action.breakRequired??Infinity,(t.action.breakProgress||0)+1);if(t.action.breakProgress>=t.action.breakRequired)t.breakWeakness=.15}}
  }};
  const lapluma=catalog.forms.find(f=>f.operatorName==='羽毛筆');
  definitions[lapluma.operatorId]={standard:{id:'signature:'+lapluma.operatorId+':standard',name:lapluma.signature.name,type:'physical',threshold:4,cost:2,maxBattle:(s,a)=>elite3(a)===2?2:Infinity,
   onOrdinaryEvent(s,a,e){if(e.actor!==a.uid||!e.attack)return 0;a.reaperChargeKills=(a.reaperChargeKills||0)+(e.kills?.length||0);return a.reaperChargeKills>=2?4:1},validate(s,a,c){elite3(a);group(s,c,3)},execute(s,a,c,adapters){const level=elite3(a);let hits=0;for(const t of group(s,c,3)){const result=adapters.damage(s,a,t,a.atk*[1.5,1.75,2][level],'physical');if(result?.damage>0)hits++}adapters.heal(s,a,a,(Math.min(3,hits)*(level?4:3))*10,{sourceKind:'signature',sourceAction:c.id});a.reaperChargeKills=0}
  }};
  const texas=catalog.forms.find(f=>f.operatorId==='texas_the_omertosa');
  const living=e=>e.hp>0&&!e.exited&&e.targetable!==false;
  const window=e=>living(e)&&e.action?.breakable===true&&e.action?.breakWindow===true;
  const stunnable=e=>living(e)&&!e.boss&&!e.elite&&!e.immuneStun&&!e.immunities?.includes('stun');
  function selection(s,a,c){
   const elite=a.elite||0;if(![0,1,2].includes(elite))throw Error('Invalid elite stage');
   const maximum=[2,3,4][elite],ids=enemyIds(s,c,maximum);
   if(!Array.isArray(ids)||!ids.length||ids.length>maximum||new Set(ids).size!==ids.length)throw Error('Invalid sword rain targets');
   const enemies=ids.map(id=>s.enemies.find(e=>e.uid===id&&living(e)));if(enemies.some(e=>!e))throw Error('Sword rain target unavailable');
   const stunIds=c.stunTargets||[];if(!Array.isArray(stunIds)||new Set(stunIds).size!==stunIds.length||stunIds.length>(elite===2?2:1))throw Error('Invalid sword rain control targets');
   const stunned=stunIds.map(id=>s.enemies.find(e=>e.uid===id&&stunnable(e)));if(stunned.some(e=>!e))throw Error('Cannot stun this enemy');
   if(elite===0&&s.enemies.some(stunnable)&&stunned.length!==1)throw Error('Choose one legal ordinary enemy for E0 control');
   const broken=elite>=1?(c.breakTarget?s.enemies.find(e=>e.uid===c.breakTarget&&window(e)):s.enemies.find(window)):null;
   if(c.breakTarget&&!broken)throw Error('Enemy is outside a legal break window');
   return {elite,enemies,stunned,broken};
  }
  definitions[texas.operatorId]={standard:{
   id:'signature:texas_the_omertosa:standard',name:texas.signature.name,type:'arts',resource:'swordIntent',threshold:4,cost:2,maxBattle:2,minTurnGap:2,
   onOrdinaryEvent(s,a,e){
    if(e.actor!==a.uid||e.type!=='ordinaryCardPlayed')return 0;
    if(a.swordIntentTurn?.turn!==s.turn)a.swordIntentTurn={turn:s.turn,attack:false,control:false};
    let amount=0;const turn=a.swordIntentTurn;
    if(e.attack&&!turn.attack){turn.attack=true;amount++}
    if(!turn.control&&((e.statuses||[]).some(x=>['silence','suppression'].includes(x.id))||(a.elite||0)>=1&&(e.resReduced||[]).length)){turn.control=true;amount++}
    if(!a.swordIntentFirstKill&&(e.kills||[]).length){a.swordIntentFirstKill=true;amount++}
    return amount;
   },
   validate(s,a,c){selection(s,a,c)},
   execute(s,a,c,adapters){
    const selected=selection(s,a,c);if(typeof adapters.damage!=='function')throw Error('Sword rain requires shared damage adapter');
    for(const enemy of selected.enemies)for(let hit=0;hit<2&&enemy.hp>0;hit++)adapters.damage(s,a,enemy,a.atk*[.7,.85,1][selected.elite],'arts');
    for(const enemy of selected.stunned)if(enemy.hp>0){enemy.skipNextOrdinaryAction=true;enemy.skipSource=a.uid}
    if(selected.broken?.hp>0){selected.broken.action.breakProgress=Math.min(selected.broken.action.breakRequired??Infinity,(selected.broken.action.breakProgress||0)+1);if(selected.broken.action.breakProgress>=selected.broken.action.breakRequired)selected.broken.breakWeakness=.15}
   }
  }};
  for(const form of catalog.forms.filter(f=>f.operatorId==='amiya'&&['caster','guard'].includes(f.id))){
   const caster=form.id==='caster',resource=caster?'emotion':'resolve',flag=caster?'casterUltimateUsed':'shadowUltimateUsed';
   const extreme=c=>c?.mode==='extreme';
   definitions.amiya??={};definitions.amiya[form.id]={
    id:'signature:amiya:'+form.id,name:form.signature.name,type:'arts',resource,resourceCap:caster?6:5,
    threshold:(s,a,c)=>extreme(c)?(caster?6:5):3,cost:(s,a,c)=>caster&&!extreme(c)?1:2,
    validate(s,a,c){elite3(a);target(s,c);if(c.mode!=null&&!['normal','extreme'].includes(c.mode))throw Error('Unknown signature mode');if(extreme(c)&&(a.elite!==2||a[flag]))throw Error('Ultimate is unavailable')},
    execute(s,a,c,adapters){
     const tier=a.elite||0,t=target(s,c);
     if(extreme(c)){
      a[flag]=true;
      if(caster){let current=t;for(let i=0;i<4;i++){if(!living(current))current=s.enemies.filter(living).sort((x,y)=>x.hp/(x.max||x.hp)-y.hp/(y.max||y.hp))[0];if(!current)break;adapters.damage(s,a,current,a.atk,'true')}FrontierOperatorDamageV113.spendHP(a,Math.floor(a.max*.2));a.exhaustedTurn=s.turn+1}
      else {const before=t.hp;for(let i=0;i<4&&living(t);i++)adapters.damage(s,a,t,a.atk*.95,'arts');if(living(t))adapters.damage(s,a,t,a.atk*1.4,'true');if(before>0&&t.hp<=0)for(const ally of s.team.filter(x=>living(x)&&x.uid!==a.uid))globalThis.FrontierEquipmentTuning15?FrontierEquipmentTuning15.shield(s,a,ally,50):ally.block=(ally.block||0)+50;a.resolveLockedTurn=s.turn+1}
      return;
     }
     if(caster){const resonance=t.counters?.resonance||0;adapters.damage(s,a,t,a.atk*[1.7,1.95,2.2][tier],'arts');globalThis.FrontierEquipmentTuning15?FrontierEquipmentTuning15.shield(s,a,a,([3,4,6][tier])*10):a.block=(a.block||0)+([3,4,6][tier])*10;if(tier&&resonance){t.counters.resonance--;s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{other:true,attack:true,target:t.uid},amount:tier===2?.15:.1,remaining:1,expiresTurn:s.turn})}}
     else {const poise=tier===2&&(t.counters?.poise||0)>0;if(poise)t.counters.poise--;for(let i=0;i<2&&living(t);i++)adapters.damage(s,a,t,a.atk*[.8,1.05,1.15][tier]*(i===1&&poise?1.2:1),'arts');globalThis.FrontierEquipmentTuning15?FrontierEquipmentTuning15.shield(s,a,a,([5,7,9][tier])*10):a.block=(a.block||0)+([5,7,9][tier])*10;if(tier){s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{other:true,attack:true},amount:.1,remaining:1,expiresTurn:s.turn})}}
    }
   };
  }
  const medic=catalog.forms.find(f=>f.operatorId==='amiya'&&f.id==='medic');
  definitions.amiya.medic={id:'signature:amiya:medic',name:medic.signature.name,type:'arts',resource:'empathy',resourceCap:6,
   threshold:(s,a,c)=>c?.mode==='extreme'?6:(a.elite?4:3),cost:(s,a,c)=>c?.mode==='extreme'?2:1,
   validate(s,a,c){elite3(a);if(c.mode!=null&&!['normal','extreme'].includes(c.mode))throw Error('Unknown signature mode');if(c.mode==='extreme'&&(a.elite!==2||a.mercyUltimateUsed))throw Error('Mercy ultimate unavailable');group(s,c,c.mode==='extreme'?3:a.elite?2:1)},
   execute(s,a,c,adapters){const level=elite3(a),extreme=c.mode==='extreme',targets=group(s,c,extreme?3:level?2:1);if(extreme)a.mercyUltimateUsed=true;for(const t of targets){const result=adapters.damage(s,a,t,a.atk*(extreme?1.35:[1,.9,1.05][level]),'arts');if(level&&result?.damage>0&&living(t)){t.statuses??=[];if(!t.statuses.some(x=>x.id==='slow'))t.statuses.push({id:'slow',source:a.uid,stacks:1,expiresEnemyPhase:s.turn});t.nextOrdinaryDamageReduction=Math.max(t.nextOrdinaryDamageReduction||0,.15)}}const allies=s.team.filter(living).sort((x,y)=>x.hp/x.max-y.hp/y.max),healed=extreme?allies:allies.slice(0,level?2:1);for(const ally of healed)adapters.heal(s,a,ally,a.atk*(extreme?.85:[1.2,1,1.15][level]),{sourceKind:'signature',sourceAction:c.id});if(extreme)for(const ally of allies)ally.nextNormalIncomingReduction={amount:.1,turn:s.turn};if(level===2&&!a.medicFirstSignatureUsed){a.medicFirstSignatureUsed=true;const lowest=allies.slice().sort((x,y)=>x.hp/x.max-y.hp/y.max)[0];if(lowest)globalThis.FrontierEquipmentTuning15?FrontierEquipmentTuning15.shield(s,a,lowest,50):lowest.block=(lowest.block||0)+50}}
  };
  const lap=catalog.forms.find(f=>f.operatorName==='拉普蘭德');
  definitions[lap.operatorId]={standard:{id:'signature:'+lap.operatorId+':standard',name:lap.signature.name,type:'arts',threshold:(s,a)=>a.elite===2?5:6,cost:2,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid?e.mentalApplied||0:0,
   validate(s,a,c){elite3(a);group(s,c,2)},execute(s,a,c,adapters){const level=elite3(a);for(const t of group(s,c,2)){const prior=t.counters?.mentalDamage||0;for(let i=0;i<2&&living(t);i++)adapters.damage(s,a,t,a.atk*[.7,.8,.95][level],'arts');FrontierOperatorStatusDictionaryV31.mental(s,a,t,1);if(level===1&&prior>=FrontierOperatorStatusDictionaryV31.mentalThreshold(t)/2)t.nextSpecialDamageReduction=Math.max(t.nextSpecialDamageReduction||0,.15);if(level===2&&living(t)&&!t.boss&&!t.elite&&!t.immuneSilence){t.statuses??=[];t.statuses.push({id:'silence',source:a.uid,stacks:1,expiresEnemyPhase:s.turn})}}}
  }};
  const cant=catalog.forms.find(f=>f.operatorName==='曉歌');definitions[cant.operatorId]={standard:{id:'signature:'+cant.operatorId+':standard',name:cant.signature.name,type:'support',resource:'intelligence',threshold:3,cost:1,
   validate(s,a){elite3(a)},execute(s,a,c,adapters){const level=elite3(a);if(level===2){s.pending??=[];s.pending.push({type:'drawDiscard',draw:3,discard:1,owner:a.uid,source:c.id,drawn:[],stage:(s.hand?.length||0)>=10?'discardFirst':'draw'})}else draw(s,a,2,adapters);s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{other:true,effect:'damage'},amount:level?.2:.15,remaining:1})}
  }};
  const ptil=catalog.forms.find(f=>f.operatorName==='白面鴞');definitions[ptil.operatorId]={standard:{id:'signature:'+ptil.operatorId+':standard',name:ptil.signature.name,type:'protection',resource:'neural',threshold:4,cost:2,maxBattle:(s,a)=>a.elite===2?2:Infinity,
   onOrdinaryEvent(s,a,e){if(e.type!=='ordinaryCardPlayed')return 0;let gain=0;if(!e.attack){if(a.neuralSupportTurn?.turn!==s.turn)a.neuralSupportTurn={turn:s.turn,owners:[],used:false};const entry=a.neuralSupportTurn;if(!entry.owners.includes(e.actor))entry.owners.push(e.actor);if(entry.owners.length>=2&&!entry.used){entry.used=true;gain++}}if(e.actor===a.uid&&e.heals?.some(h=>h.amount>0))gain++;return gain},
   validate(s,a){elite3(a)},execute(s,a,c,adapters){const level=elite3(a);for(const ally of s.team.filter(living)){adapters.heal(s,a,ally,a.atk*[1.2,1.5,1.8][level],{sourceKind:'signature',sourceAction:c.id});ally.nextDamageReductionFlat=Math.max(ally.nextDamageReductionFlat||0,([2,3,4][level])*10);ally.nextDamageReductionExpiresTurn=s.turn}}
  }};
  const red=catalog.forms.find(f=>f.operatorName==='紅');definitions[red.operatorId]={standard:{id:'signature:'+red.operatorId+':standard',name:red.signature.name,type:'physical',threshold:3,cost:1,maxBattle:(s,a)=>a.elite===2?3:Infinity,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.attack?1:0,validate(s,a,c){elite3(a);target(s,c)},execute(s,a,c,adapters){const level=elite3(a),t=target(s,c);adapters.damage(s,a,t,a.atk*[1.6,1.8,2][level],'physical');if(living(t)){t.counters??={};t.counters.hunt=Math.min(2,(t.counters.hunt||0)+(level===2?2:1));if(level&&!t.boss&&!t.elite)t.nextOrdinaryDamageReduction=Math.max(t.nextOrdinaryDamageReduction||0,.2)}}
  }};
  const heavy=catalog.forms.find(f=>f.operatorName==='暴雨');definitions[heavy.operatorId]={standard:{id:'signature:'+heavy.operatorId+':standard',name:heavy.signature.name,type:'protection',threshold:4,cost:2,maxBattle:(s,a)=>a.elite===2?2:Infinity,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&!e.attack?1:0,onBattleEvent(s,a,e){if(e.type!=='enemyDamage'||!(e.absorbed+e.hpLoss>0)||e.single!==true)return 0;const owner=e.guardSource||e.camouflageOwner;if(owner!==a.uid)return 0;a.heavyGuardActions??=[];if(a.heavyGuardActions.includes(e.actionId))return 0;a.heavyGuardActions.push(e.actionId);return a.heavyGuardActions.length>=3?4:0},
   validate(s,a){elite3(a)},execute(s,a){const level=elite3(a);for(const ally of s.team.filter(living)){globalThis.FrontierEquipmentTuning15?FrontierEquipmentTuning15.shield(s,a,ally,([6,8,10][level])*10):ally.block=(ally.block||0)+([6,8,10][level])*10;ally.nextSingleIncomingReduction=Math.max(ally.nextSingleIncomingReduction||0,[.15,.2,.25][level])}a.heavyGuardActions=[]}
  }};
  const warf=catalog.forms.find(f=>f.operatorName==='華法林');definitions[warf.operatorId]={standard:{id:'signature:'+warf.operatorId+':standard',name:warf.signature.name,type:'support',resource:'samples',threshold:3,cost:1,maxBattle:(s,a)=>a.elite===2?3:Infinity,
   validate(s,a,c){elite3(a);if(!s.team.some(t=>t.uid===c.target&&living(t)))throw Error('Choose a living plasma recipient')},execute(s,a,c){const level=elite3(a),ally=s.team.find(t=>t.uid===c.target);s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{owner:ally.operator,attack:true},amount:[.25,.35,.4][level],remaining:1,nonlethalCost:[40,40,50][level]})}
  }};
  const exu=catalog.forms.find(f=>f.operatorName==='能天使');definitions[exu.operatorId]={standard:{id:'signature:'+exu.operatorId+':standard',name:exu.signature.name,type:'physical',threshold:4,initialCharge:(s,a)=>a.elite?2:1,cost:2,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.attack?1:0,validate(s,a,c){elite3(a);target(s,c)},execute(s,a,c,adapters){const level=elite3(a),t=target(s,c);let last;for(let i=0;i<5&&living(t);i++)last=adapters.damage(s,a,t,a.atk*[.55,.65,.8][level],'physical');if(level&&last?.damage>0&&living(t))t.exuOpening={source:a.uid,ignoreDef:(level===2?3:2)*10,turn:s.turn}}
  }};
  function sariaSupport(s,a,id){if(a.sariaSupportTurn?.turn!==s.turn)a.sariaSupportTurn={turn:s.turn,ids:[]};const ids=a.sariaSupportTurn.ids;if(ids.includes(id)||ids.length>=2)return 0;ids.push(id);return 1}
  const saria=catalog.forms.find(f=>f.operatorName==='賽雷婭');definitions[saria.operatorId]={standard:{id:'signature:'+saria.operatorId+':standard',name:saria.signature.name,type:'protection',threshold:(s,a)=>a.elite===2?4:3,cost:2,maxBattle:2,
   onOrdinaryEvent:(s,a,e)=>e.actor===a.uid&&e.heals?.some(h=>h.amount>0)?sariaSupport(s,a,e.id):0,
   onBattleEvent(s,a,e){if(e.type==='playerTurnCompleted'){a.resources??={};const old=a.resources.suitCharge||0,next=Math.min([3,4,5][a.elite||0],old+1),defense=n=>a.elite?(n>=3?1:0)+(a.elite===2&&n>=5?1:0):0;a.resources.suitCharge=next;a.def+=(defense(next)-defense(old))*10;return 0}return e.type==='enemyDamage'&&e.guardSource===a.uid&&e.absorbed+e.hpLoss>0?sariaSupport(s,a,e.actionId||e.id):0},
   validate(s,a,c){elite3(a);if(a.elite!==2)group(s,c,a.elite?2:1)},execute(s,a,c,adapters){const level=elite3(a);for(const ally of s.team.filter(living)){adapters.heal(s,a,ally,a.atk*[.45,.6,.7][level],{sourceKind:'signature',sourceAction:c.id});globalThis.FrontierEquipmentTuning15?FrontierEquipmentTuning15.shield(s,a,ally,((level?4:3)*10)):ally.block=(ally.block||0)+((level?4:3)*10)}for(const t of level===2?s.enemies.filter(living):group(s,c,level?2:1)){t.calcification??=[];t.calcification.push({amount:[.1,.15,.2][level],expiresEnemyPhase:s.turn+(level?1:0)});if(level===1)t.nextAttackDamageReduction=Math.max(t.nextAttackDamageReduction||0,.1);if(level===2)t.calcifiedOrdinaryReduction={amount:.1,expiresEnemyPhase:s.turn+1}}if(level===2){a.attackLockedUntilEnemyPhase=s.turn+1;a.sariaRecovery={turn:s.turn+1,scale:.3}}}
  }};
  const silver=catalog.forms.find(f=>f.operatorName==='銀灰');definitions[silver.operatorId]={standard:{id:'signature:'+silver.operatorId+':standard',name:silver.signature.name,type:'physical',resource:'leadership',threshold:3,cost:3,maxBattle:(s,a)=>a.elite?1:Infinity,
   onOrdinaryEvent(s,a,e){if(e.actor===a.uid&&e.attack)a.silverAttackCards=(a.silverAttackCards||0)+1;return 0},validate(s,a,c){elite3(a);if((a.silverAttackCards||0)<2)throw Error('True silver slash requires two own attack cards');group(s,c,a.elite===2?4:3)},execute(s,a,c,adapters){const level=elite3(a);for(const t of group(s,c,level===2?4:3))adapters.damage(s,a,t,a.atk*[2.4,3,3.5][level],'physical');if(level===2)a.silverIncomingPenalty={amount:.2,expiresEnemyPhase:s.turn};else{const amount=Math.min(a.def||0,20);a.def-=amount;a.armorReductions??=[];a.armorReductions.push({applied:amount,expiresEnemyPhase:s.turn})}a.silverAttackCards=0}
  }};
  const surtr=catalog.forms.find(f=>f.operatorName==='史爾特爾');definitions[surtr.operatorId]={standard:{id:'signature:'+surtr.operatorId+':standard',name:surtr.signature.name,type:'arts',resource:'molten',threshold:5,cost:2,maxBattle:(s,a)=>a.elite===2?1:Infinity,
   validate(s,a,c){elite3(a);target(s,c);if(s.turn<3)throw Error('Twilight requires the third player turn')},execute(s,a,c,adapters){const level=elite3(a),t=target(s,c);for(let i=0;i<3+level&&living(t);i++)adapters.damage(s,a,t,a.atk,'arts');FrontierOperatorDamageV113.spendHP(a,Math.floor(a.max*[.15,.2,.25][level]));if(level===2)a.attackLockedTurn=s.turn+1}
  }};
  const eyja=catalog.forms.find(f=>f.operatorName==='愛雅法拉');definitions[eyja.operatorId]={standard:{id:'signature:'+eyja.operatorId+':standard',name:eyja.signature.name,type:'arts',resource:'heat',threshold:5,cost:3,maxBattle:(s,a)=>a.elite===2?1:Infinity,
   onOrdinaryEvent(s,a,e){if(e.actor===a.uid&&e.damageTypes?.includes('arts'))a.eyjaArtsCards=(a.eyjaArtsCards||0)+1;return 0},validate(s,a,c){elite3(a);if((a.eyjaArtsCards||0)<2)throw Error('Volcano requires two own arts cards');group(s,c,a.elite?4:3)},execute(s,a,c,adapters){const level=elite3(a);for(const t of group(s,c,level?4:3)){adapters.damage(s,a,t,a.atk*[2.1,2.5,2.9][level],'arts');if(living(t)){t.ignite??=[];for(let i=0;i<(level===2?3:2)&&t.ignite.length<3;i++)t.ignite.push({source:a.uid,amount:20,expiresEnemyPhase:s.turn+1,firstBonus:0})}}s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{owner:a.operator,damageType:'arts'},amount:level===2?-.25:-.2,remaining:1,startsTurn:s.turn+1,expiresTurn:s.turn+1});a.eyjaArtsCards=0}
  }};
  const hoshi=catalog.forms.find(f=>f.operatorName==='星熊');definitions[hoshi.operatorId]={standard:{id:'signature:'+hoshi.operatorId+':standard',name:hoshi.signature.name,type:'protection',resource:'stance',threshold:4,cost:2,maxBattle:(s,a)=>a.elite===2?2:Infinity,
   validate(s,a){elite3(a)},execute(s,a){const level=elite3(a);globalThis.FrontierEquipmentTuning15?FrontierEquipmentTuning15.shield(s,a,a,([18,22,26][level])*10):a.block=(a.block||0)+([18,22,26][level])*10;a.hoshiSignatureCounters={turn:s.turn,remaining:level===2?3:2,raw:[60,80,100][level]}}
  }};
  const skadi=catalog.forms.find(f=>f.operatorName==='斯卡蒂');definitions[skadi.operatorId]={standard:{id:'signature:'+skadi.operatorId+':standard',name:skadi.signature.name,type:'physical',threshold:4,cost:2,maxBattle:(s,a)=>a.elite===2?2:Infinity,
   onOrdinaryEvent(s,a,e){if(e.actor!==a.uid||!e.attack||!e.hitTargets?.length)return 0;a.skadiHits??={};const previous=Math.max(0,...Object.values(a.skadiHits));for(const id of e.hitTargets)a.skadiHits[id]=(a.skadiHits[id]||0)+1;return Math.max(0,...Object.values(a.skadiHits))-previous},validate(s,a,c){elite3(a);target(s,c)},execute(s,a,c,adapters){const level=elite3(a),t=target(s,c),armor=(t.armorReductions||[]).length>0;adapters.damage(s,a,t,a.atk*[2.3,2.75,3.2][level]*(level===2&&armor?1.15:1),'physical');globalThis.FrontierEquipmentTuning15?FrontierEquipmentTuning15.shield(s,a,a,([8,12,16][level])*10):a.block=(a.block||0)+([8,12,16][level])*10;a.skadiHits={}}
  }};
  const angel=catalog.forms.find(f=>f.operatorName==='安潔莉納');definitions[angel.operatorId]={standard:{id:'signature:'+angel.operatorId+':standard',name:angel.signature.name,type:'arts',resource:'gravity',threshold:4,cost:2,minTurnGap:3,
   validate(s,a,c){elite3(a);group(s,c,a.elite?4:3)},execute(s,a,c,adapters){const level=elite3(a);for(const t of group(s,c,level?4:3)){adapters.damage(s,a,t,a.atk*[1.3,1.5,1.75][level],'arts');if(living(t)){t.statuses??=[];t.statuses=t.statuses.filter(x=>x.id!=='weightless');t.statuses.push({id:'weightless',source:a.uid,stacks:1,expiresEnemyPhase:s.turn+(level===2?1:0),extraBreak:level===2,extraBreakUsed:false})}}if(level===1){const t=s.enemies.find(x=>x.uid===(c.breakTarget||c.target));if(t?.action?.breakable&&t.action.breakWindow){t.action.breakProgress=Math.min(t.action.breakRequired,(t.action.breakProgress||0)+1);if(t.action.breakProgress>=t.action.breakRequired)t.breakWeakness=.15}}}
  }};
  const mlynar=catalog.forms.find(f=>f.operatorName==='瑪恩納');definitions[mlynar.operatorId]={standard:{id:'signature:'+mlynar.operatorId+':standard',name:mlynar.signature.name,type:'physical',resource:'momentum',threshold:4,cost:3,maxBattle:2,minTurnGap:3,
   onBattleEvent(s,a,e){if(e.type!=='playerTurnCompleted')return 0;const attacked=s.events?.some(x=>x.type==='ordinaryCardPlayed'&&x.actor===a.uid&&x.attack&&x.turn===s.turn),cast=s.signatureState?.actors?.[a.uid]?.lastTurn===s.turn;if(attacked||cast)return 0;a.lastRestedTurn=s.turn;if(a.momentumTurn?.turn!==s.turn)a.momentumTurn={turn:s.turn,gained:0};if(a.momentumTurn.gained>=2)return 0;a.momentumTurn.gained++;return 1},
   validate(s,a,c){elite3(a);if(a.lastRestedTurn!==s.turn-1||a.attackLockedTurn===s.turn)throw Error('True gold slash requires a rested previous turn');group(s,c,a.elite===2?4:3)},execute(s,a,c,adapters){const level=elite3(a);for(const t of group(s,c,level===2?4:3)){const broken=t.breakWeakness>0;for(let i=0;i<2&&living(t);i++){const previous=t.def;try{if(level===2&&i===1&&broken)t.def=Math.max(0,t.def-20);adapters.damage(s,a,t,a.atk*[1.1,1.3,1.5][level],'physical')}finally{t.def=previous}}}a.attackLockedTurn=s.turn}
  }};
  const specter=catalog.forms.find(f=>f.operatorName==='幽靈鯊');definitions[specter.operatorId]={standard:{id:'signature:'+specter.operatorId+':standard',name:specter.signature.name,type:'support',resource:'bloodBattle',threshold:4,cost:1,maxBattle:2,
   onOrdinaryEvent(s,a,e){if(e.actor!==a.uid||!e.attack||!(e.hpDamage>0))return 0;if(a.bloodBattleTurn?.turn!==s.turn)a.bloodBattleTurn={turn:s.turn,gained:0};if(a.bloodBattleTurn.gained>=2)return 0;a.bloodBattleTurn.gained++;return 1},
   onBattleEvent(s,a,e){if(e.type==='playerTurnCompleted'&&a.elite===2&&a.hp>0&&!a.healingBlocked){a.hp=Math.min(a.max,a.hp+Math.max(10,Math.floor(a.max*.05)));return 0}if(e.type!=='enemyDamage'||e.target!==a.uid||!(e.hpLoss>0))return 0;a.specterHurtActions??=[];if(a.specterHurtActions.includes(e.actionId)||a.specterHurtTurn===s.turn)return 0;a.specterHurtActions.push(e.actionId);a.specterHurtTurn=s.turn;let amount=1;if(a.specterBloodGuard?.turn===s.turn&&!a.specterBloodGuard.used){a.specterBloodGuard.used=true;amount++}if(a.bloodBattleTurn?.turn!==s.turn)a.bloodBattleTurn={turn:s.turn,gained:0};amount=Math.min(amount,2-a.bloodBattleTurn.gained);a.bloodBattleTurn.gained+=amount;return amount},
   validate(s,a){elite3(a);if(a.undyingUntilEnemyPhase>=s.turn)throw Error('Undying cannot be extended')},execute(s,a){const level=elite3(a);a.undyingUntilEnemyPhase=s.turn+(level?1:0);a.specterStunAfter=a.undyingUntilEnemyPhase;s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{owner:a.operator,attack:true},amount:[.2,.25,.35][level],remaining:null,expiresTurn:a.undyingUntilEnemyPhase})}
  }};
  const muel=catalog.forms.find(f=>f.operatorName==='繆爾賽思');definitions[muel.operatorId]={standard:{id:'signature:'+muel.operatorId+':standard',name:muel.signature.name,type:'arts',resource:'flowCharge',threshold:5,cost:2,maxBattle:2,
   validate(s,a,c){elite3(a);target(s,c);if(!a.flow||a.flow.hp<=0)throw Error('Flow must be restored first');if(c.template&&!s.team.some(x=>x.uid===c.template&&x.uid!==a.uid&&living(x)))throw Error('Invalid flow template');if(!a.elite&&!c.template)throw Error('Choose a flow template')},
   execute(s,a,c,adapters){const level=elite3(a),t=target(s,c);if(c.template){const template=s.team.find(x=>x.uid===c.template);const prior=a.flow,next=FrontierOperatorDamageV113.flow(a,template);next.hp=Math.min(next.max,prior.hp);next.block=prior.block;a.flow=next}const flow=a.flow;adapters.damage(s,a,t,flow.atk*[.8,1,1.25][level],flow.damageType,{sourceKind:'signature'});if(level){if(flow.melee){const stolen=Math.min(t.def||0,(level===2?3:2)*10);t.def-=stolen;flow.def+=stolen;flow.stolenDef+=stolen;if(level===2)flow.block+=80}else{const second=s.enemies.find(x=>living(x)&&x.uid!==t.uid);if(second){adapters.damage(s,a,second,flow.atk*(level===2?.75:.5),flow.damageType,{sourceKind:'signature'});if(level===2&&second.action?.breakable&&second.action.breakWindow){second.action.breakProgress=Math.min(second.action.breakRequired,(second.action.breakProgress||0)+1);if(second.action.breakProgress>=second.action.breakRequired)second.breakWeakness=.15}}}}}
  }};
  const aak=catalog.forms.find(f=>f.operatorName==='阿');definitions[aak.operatorId]={standard:{id:'signature:'+aak.operatorId+':standard',name:aak.signature.name,type:'support',resource:'medicine',threshold:5,cost:2,maxBattle:1,
   validate(s,a,c){elite3(a);if(!s.team.some(t=>t.uid===c.target&&t.uid!==a.uid&&living(t)&&!t.embers?.active))throw Error('Choose another vulnerable living teammate')},execute(s,a,c,adapters){const level=elite3(a),t=s.team.find(x=>x.uid===c.target);for(let i=0;i<15&&living(t);i++){const result=adapters.calculate(t,[50,60,70][level],'physical');adapters.takeDamage(s,t,result.damage,{sourceKind:'injection'})}if(living(t)){s.cardBuffs??=[];const prior=s.cardBuffs.find(b=>b.source===a.uid&&b.group==='aak-mixture'&&b.filter.owner===t.operator&&b.remaining>0),amount=level===2?.5:.4,count=level?2:1;if(prior){prior.amount=Math.max(prior.amount,amount);prior.remaining=Math.max(prior.remaining,count);prior.expiresTurn=Math.max(prior.expiresTurn,s.turn+1)}else s.cardBuffs.push({source:a.uid,group:'aak-mixture',filter:{owner:t.operator,attack:true},amount,remaining:count,expiresTurn:s.turn+1})}}
  }};
  definitions[muel.operatorId].standard.onBattleEvent=(s,a,e)=>{return 0};
  const angelRule=definitions[angel.operatorId].standard;angelRule.onBattleEvent=(s,a,e)=>{if(e.type==='playerTurnCompleted'&&a.elite===2&&!s.events.some(x=>x.type==='ordinaryCardPlayed'&&x.actor===a.uid&&x.attack&&x.turn===s.turn)){for(const ally of s.team)if(ally.hp>0&&!ally.exited&&!ally.embers?.active&&!ally.healingBlocked)ally.hp=Math.min(ally.max,ally.hp+30)}return 0};
  for(const name of ['芬','香草','翎羽','玫蘭莎','月見夜','克洛絲','安德切爾','伊桑','安比爾','紅豆','羽毛筆','紅','能天使']){const f=catalog.forms.find(x=>x.operatorName===name);if(f&&definitions[f.operatorId]?.[f.id])definitions[f.operatorId][f.id].cardCountChargeEligible=true}
  const sr=definitions.char_202_demkni.standard,priorSaria49=sr.execute;sr.execute=(s,a,c,ad)=>{const before=new Map(s.team.map(x=>[x.uid,{hp:x.hp,max:x.max}]));priorSaria49(s,a,c,ad);if(a.elite===2&&a.sariaReadyTurn!==s.turn){const t=s.team.filter(x=>x.uid!==a.uid&&x.hp>before.get(x.uid).hp).sort((x,y)=>before.get(x.uid).hp/before.get(x.uid).max-before.get(y.uid).hp/before.get(y.uid).max)[0];if(t){a.sariaReadyTurn=s.turn;s.cardBuffs??=[];s.cardBuffs=s.cardBuffs.filter(b=>b.group!=='saria-ready'||b.filter.owner!==t.operator);s.cardBuffs.push({source:a.uid,filter:{owner:t.operator},amount:.1,remaining:1,group:'saria-ready'})}}};
  return definitions;
 }
 return {create};
})();
