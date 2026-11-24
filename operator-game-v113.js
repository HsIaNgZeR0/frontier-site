'use strict';
// Bridge the authored effects into the existing expedition and durable action flow.
window.FrontierOperatorGameV113=(()=>{
 const catalog=FrontierOperatorCatalogV113,E=FrontierOperatorEffectsV113.create(catalog),rules=FrontierOperatorSignatureRulesV113.create(catalog),S=FrontierOperatorSignaturesV113.create(rules),B=FrontierOperatorBattleEventsV113;
 const tactics=FrontierDoctorTactics.ids;
 const tacticalText={
  adrenaline:'獲得 1 AP，最多回到 5 AP。行動點已滿時不能使用。本戰消耗。',
  brace:'存活幹員的專屬攻擊本戰每段 +2 傷害。本戰消耗。',
  field_guard:'生命比例最低的存活幹員獲得 6 點護盾。',
  field_draw:'抽 2 張牌，接著選擇 1 張手牌棄置。',
  field_silence:'造成 3 點物理傷害。蓄力中增加 1 點失衡衝擊；一般敵人未蓄力時跳過下次普通攻擊。',
  field_break:'造成 4 點物理傷害，然後降低最多 2 點防禦，持續兩個敵方階段。'
 };
 const tacticText=id=>tacticalText[id]?FrontierCombatUnits61.text(tacticalText[id]):cards[id]?.text||'';
 const selectedTactics=value=>Array.isArray(value)?tactics.filter(id=>value.includes(id)).slice(0,5):[];
 const tacticalLoadout=()=>selectedTactics(db.doctorTactics);
 function playTactic(index,target){
  const s=snapshot(),card=s.hand[index],d=cardStats(card);
  if(s.phase!=='player'||s.pending.length||FrontierCurios.pending()||d.cost>s.energy)return;
  if(d.energy&&s.energy>=5){toast('PRTS｜行動點已滿，應急動員尚未消耗。');return}
  const enemy=s.enemies.find(e=>e.uid===target&&e.hp>0&&!e.exited&&e.targetable!==false);
  if(d.kind==='attack'&&!enemy)return;
  const previous={team:R().team,enemies:R().battle.enemies};
  bound(s,()=>FrontierCurios.beforeCard(d,card,target));
  s.hand.splice(index,1);s.energy-=d.cost;
  if(d.energy)s.energy=Math.min(5,s.energy+d.energy);
  if(d.power)for(const actor of s.team.filter(a=>a.hp>0&&!a.exited))actor.power=(actor.power||0)+d.power;
  if(enemy&&d.kind==='attack'){
   identity(s,'tactic');
   const doctor={uid:'doctor',operator:'common'};
   if(d.damage)adapters().damage(s,doctor,enemy,d.damage,'physical');
   if(enemy.hp>0&&d.silence){
    if(enemy.action?.breakable&&enemy.action.breakWindow)enemy.action.breakProgress=Math.min(enemy.action.breakRequired,(enemy.action.breakProgress||0)+1);
    else if(!enemy.boss&&!enemy.elite)enemy.skipNextOrdinaryAction=true;
   }
   if(enemy.hp>0&&d.armorBreak){
    const applied=Math.min(enemy.def||0,d.armorBreak);
    if(applied){enemy.def-=applied;(enemy.armorReductions??=[]).push({applied,expiresEnemyPhase:s.turn+1});}
   }
  }
  const note=bound(s,()=>FrontierDoctorTactics.play(card.id,s,n=>drawCards(n,{bonus:true,owner:'common'}),enemy,adapters()));
  const ally=d.block?s.team.filter(a=>a.hp>0&&!a.exited).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0]:null;
  if(ally)ally.block=(ally.block||0)+d.block;
  if(d.activeDiscard){
   const source=identity(s,'tactic-draw');
   s.pending.push({type:'drawDiscard',draw:d.draw,discard:d.activeDiscard,owner:'doctor',source,drawn:[],stage:'draw'});
   (s.operatorInFlight??=[]).push({source,card});
  }else{
   if(d.draw)bound(s,()=>drawCards(d.draw,{bonus:true,owner:'common'}));
   (d.exhaust?s.exhaust:s.discard).push(card);
  }
  bound(s,()=>FrontierCurios.afterCard({...d,silence:0,armorBreak:0,mark:false,curioShields:ally?[{actor:ally,amount:d.block}]:undefined},card));
  if(globalThis.FrontierCombatMetricsV18){s.metrics18??=FrontierCombatMetricsV18.initial(false);s.metrics18.cards++;}
  apply(s);log(d.name+' · '+(note||'已結算'));
  if(!checkBattle()){save();render();window.FrontierOperatorUIV113?.playFeedback(previous);window.FrontierOperatorUIV113?.ordinaryCue(null,card.id,{target})}
  return true;
 }
 const active=()=>R()?.operatorSystemVersion===113;
 const formFor=(id,form='standard')=>catalog.forms.find(f=>f.operatorId===id&&f.id===form);
 function snapshot(){const r=R(),b=r?.battle;if(!b)throw Error('PRTS｜目前沒有戰鬥。');const copy=structuredClone({battle:b,team:r.team});return {...copy.battle,team:[...copy.team,...(copy.battle.friendly75||[])],pending:copy.battle.operatorPending||[],events:copy.battle.operatorEvents||[],phase:b.operatorPhase||'player'}}
 const oncePerBattleFlags={'阿米婭-CARD-12':'shadowUltimateUsed','阿米婭-CARD-18':'mercyUltimateUsed'};
 const onceFlag=id=>oncePerBattleFlags[E.definitions.get(id)?.designId];
 function finishPlayed(s,card){(onceFlag(card.id)?(s.exhaust??=[]):s.discard).push(card)}
 function exhaustSpent(s){let changed=false;for(const pile of ['hand','draw','discard']){const keep=[];for(const card of s[pile]||[]){const def=E.definitions.get(card.id),flag=onceFlag(card.id),actor=flag&&s.team.find(a=>a.operator===def.owner&&a.form===def.form);if(actor?.[flag]){(s.exhaust??=[]).push(card);changed=true}else keep.push(card)}s[pile]=keep}return changed}
 function apply(s){const prior=R().battle;s.operatorTurnEnergy=prior.turn===s.turn?Math.max(prior.operatorTurnEnergy??5,s.energy):s.energy;s=automaticChoices(s);exhaustSpent(s);const r=R();globalThis.FrontierCombatMetricsV18?.apply(r,s);globalThis.FrontierCombatMetricsV18?.commit(db,r,s);const previousEnemies=r.battle.enemies;for(const e of s.enemies)FrontierOperatorStatusDictionaryV31.convertStatus(e,previousEnemies.find(old=>old.uid===e.uid));const loot=r.battle.pending,{team,pending,events,phase,...battle}=s;r.team=team.filter(a=>!a.friendly75);battle.friendly75=team.filter(a=>a.friendly75&&!a.exited);if(s.tuning15Remainders)r.tuning15Remainders=structuredClone(s.tuning15Remainders);r.battle={...battle,pending:loot,operatorPending:pending,operatorEvents:events,operatorPhase:phase};if(r.battle.curioShuffleQueued){delete r.battle.curioShuffleQueued;FrontierCurios.emit('shuffle')}r.hp=r.teamTotal=r.team.reduce((n,a)=>n+a.hp,0);r.max=r.team.reduce((n,a)=>n+a.max,0);for(const e of r.battle.enemies)if(e.special&&!e.special.solved&&e.action?.specialId===e.special.id&&e.action.breakProgress>=e.action.breakRequired){e.special.solved=true;e.special.method='points';e.breakWeakness=.15;if(e.special.kind==='ward'){FrontierCurios.environmentCost(-1);e.specialDelay=1}FrontierCurios.emit('break',{target:e,charge:e.special.kind==='charge',interrupt:true,method:'points'})}selected=null;return r.battle}
 function openingBlessing(s){
  const pending=s.pending[0];
  const owner=s.team.find(a=>a.uid===pending.owner);
  const allies=s.team.filter(a=>a.uid!==owner?.uid&&a.hp>0&&!a.exited&&!a.friendly75);
  const target=owner&&allies.length?allies[Math.floor(random()*allies.length)]:null;
  if(target){
   s.cardBuffs??=[];
   s.cardBuffs.push({source:owner.uid,filter:{owner:owner.operator,attack:true},amount:.1,remaining:1},{source:owner.uid,filter:{owner:target.operator,attack:true},amount:.15,remaining:1});
   log('天使的祝福 · '+FrontierCapture.units[target.id].name);
  }
  s.pending.shift();
 }
 function automaticChoices(s){let changed=false;while(s.pending?.[0]?.type==='exuBlessing'){openingBlessing(s);changed=true}for(let i=0;i<64&&s.pending?.[0]?.type==='drawDiscard'&&s.pending[0].stage==='draw';i++){s=E.resolve(s,{id:identity(s,'auto-draw')},adapters());changed=true}for(const flight of s.operatorInFlight||[])if(!s.pending?.some(p=>p.source===flight.source))finishPlayed(s,flight.card);s.operatorInFlight=(s.operatorInFlight||[]).filter(f=>s.pending?.some(p=>p.source===f.source));return changed?S.sync(s):s}
 function slots(r=R()){return [...r.team,...r.team.map(a=>a.flow).filter(Boolean)].filter(a=>a.hp>0&&!a.exited&&!a.friendly75)}
 function plan(){const r=R(),b=r?.battle;if(!active()||b?.operatorVersion!==113)return;globalThis.FrontierRegional75?.plan(b);const alive=slots(r);const binder=r.team.find(a=>a.operator==='char_355_ethan'||a.id==='char_355_ethan');for(const e of b.enemies)if((e.counters?.entangle||0)>=FrontierOperatorStatusDictionaryV31.entangleThreshold(e)&&binder)FrontierOperatorStatusDictionaryV31.bind({turn:b.turn,events:b.operatorEvents??=[]},binder,e);b.enemies.forEach((e,i)=>{if(e.operatorPlannedTurn!==b.turn||!alive.some(a=>a.uid===e.operatorTarget)){const target=alive.find(a=>a.taunt>0)||FrontierRegionalEnemies.target(e,alive)||alive[(b.turn+i-1)%Math.max(1,alive.length)];e.operatorTarget=target?.uid;e.operatorPlannedTurn=b.turn}const target=alive.find(a=>a.uid===e.operatorTarget);if(target)e.target=target.id;e.action??={};if(e.action.specialId!==e.special?.id){e.action.breakProgress=0;e.operatorBreakSources=[]}Object.assign(e.action,{kind:e.intent,damageType:e.damageType,target:e.operatorTarget,specialId:e.special?.id,breakable:!!e.special&&!e.special.solved,breakWindow:!!e.special&&!e.special.solved,breakRequired:FrontierBreaks.points(e),controllable:!e.boss&&!e.elite,suppressible:!!e.special,silenceable:!!e.special&&!e.boss&&!e.elite})})}
 // Save audit receipts are not battle inputs; keep them out of isolated prediction copies.
 function clonePreviewDb(value){return structuredClone(value.meta?{...value,meta:{...value.meta,ledger:[],receipts:[]}}:value)}
 let previewSandbox=false;function bound(s,fn,preview=false){const original=preview&&!previewSandbox?db:null;if(preview){if(original)db=clonePreviewDb(db);if(s.operatorPreviewCurios)db.run.curios=structuredClone(s.operatorPreviewCurios);if(s.operatorPreviewRng)db.rng=structuredClone(s.operatorPreviewRng)}const r=R(),oldTeam=r.team,oldBattle=r.battle;r.team=s.friendly75?.length?s.team.filter(a=>!a.friendly75):s.team;r.battle=s;try{return fn()}finally{r.team=oldTeam;r.battle=oldBattle;if(preview){s.operatorPreviewCurios=structuredClone(r.curios);s.operatorPreviewRng=structuredClone(db.rng);if(original)db=original}}}
 const basic=FrontierOperatorDamageV113.create({limitLoss:(t,loss)=>window.FrontierEnemyTactics?.limitLoss(t,loss)??loss});
 function adapters(preview=false){return {...basic,shuffle:(items,state)=>{if(preview)return items.slice().reverse();if(state)state.curioShuffleQueued=true;return shuffle(items)},
  costAdjustment(s,a){return s.operatorCardHook?.owner===a?.uid?s.operatorCardHook.costDelta:0},
  shieldAmount(s,a,t,amount,primary){if(s.operatorCardHook?.owner===a.uid){const e=R()?.talent43?.effects||{};const extra=amount*(e.shield||0)/100+(s.talentShieldCarry43||0),whole=Math.floor(extra+1e-9);s.talentShieldCarry43=extra-whole;amount+=whole;s.talentUsed43??={};if(!s.talentUsed43.firstShield&&amount>0){amount+=e.firstShield||0;s.talentUsed43.firstShield=true}}return primary&&s.operatorCardHook?.owner===a.uid?amount*s.operatorCardHook.supportFactor:amount},
  cleanse(s,a,t,n){const removed=FrontierOperatorStatusDictionaryV31.cleanse(s,a,t,n);if(removed&&!preview)bound(s,()=>FrontierCurios.emit('cleanse',{actor:t,removed}));return removed},
  afterDamageRestored(s,a,t){if(t.operatorGearArmorDelta){t.def=Math.max(0,t.def-t.operatorGearArmorDelta);delete t.operatorGearArmorDelta}},
  beforeIncoming(s,a,raw,type,enemy){if(a.operator==='flow')return {raw,reduction:0};return bound(s,()=>{FrontierDefense?.beforeDamage(a,type);raw=FrontierRegionalEnemies.corrosion(a,type,raw);const amount=basic.calculate(a,raw,type).damage,event=FrontierCurios?.emit('beforeIncoming',{actor:a,target:enemy,raw,amount,direct:true,dot:false,reduction:0});return {raw,reduction:(event?.reduction||0)+(FrontierEquipment?.damageReduction(a,type)||0)+(FrontierMedicine?.incoming(a,amount,type,enemy)||0)+(FrontierDefense?.incoming(a,amount,type)||0)}},preview)},
  afterIncoming(s,a,enemy,command,applied){if(a.operator==='flow')return;return bound(s,()=>{const oldHp=a.hp+applied.hpLoss,oldBlock=(a.block||0)+applied.absorbed;FrontierCurios?.afterIncoming(a,oldHp,oldBlock,enemy,command.raw,applied.hpLoss);FrontierDefense?.afterDamage(a,oldHp,oldBlock,command.damageType,enemy);FrontierCurios?.survival(a,oldHp,applied.hpLoss);FrontierLinks?.blocked(a,oldBlock,applied.hpLoss);if(applied.hpLoss>0){if(enemy.status)FrontierMedicine?.inflict(a,enemy.status,enemy.statusStacks||1);FrontierRegionalEnemies.afterHit(enemy,a,s,command.special);globalThis.FrontierRegional75?.afterHit(s,enemy,a,command.special,applied.hpLoss);window.FrontierEnemyTactics?.afterHit(enemy,a,s,command.special)}FrontierArsenal?.incoming(a,command.damageType,enemy);if(a.hp<=0){a.downed=true;a.rescueTimer??=3;FrontierCombat.removeCards(a.id)}},preview)},
  damage(s,a,t,raw,type,meta={}){return bound(s,()=>{if(meta.dot&&!preview)raw=FrontierCurios.enemyDot(t,raw);const previous=t.hp,block=t.block,hook=!meta.equipmentDerived139&&s.operatorCardHook?.owner===a.uid?s.operatorCardHook:null;let gear=null;const te=R()?.talent43?.effects||s.talentEffects43||{};s.talentUsed43??={};const used=s.talentUsed43;let talentFlat=0;if(!meta.dot&&s.team.some(x=>x.uid===a.uid)&&s.enemies.some(x=>x.uid===t.uid))for(const key of ['firstDamage',...(t.boss||t.elite?['firstElite']:[]),...(t.boss?['firstBoss']:[])])if(!used[key]&&te[key]){talentFlat+=te[key];used[key]=true}raw+=talentFlat;if(hook){let flat=0;for(const key of ['firstOrdinary',...(used.breakReady?['breakFollow']:[])])if(!used[key]&&te[key]){flat+=te[key];used[key]=true}raw+=flat;raw=raw*hook.damageFactor*FrontierEnvironment.attackMultiplier()+(a.power||0)+(FrontierLinks?.bonus(a.operator)||0)+(FrontierAdventure?.attackBonus()||0)+(FrontierEquipment?.attackBonus(a.operator)||0)+(FrontierMedicine?.attackBonus(a.operator,t)||0);const oldDef=t.def;if(!(a.operator==='amiya'&&FrontierArsenal.index(a.operator)===27))gear=FrontierArsenal?.attack(t,a.operator,raw,type);if(t.def<oldDef)t.operatorGearArmorDelta=(t.operatorGearArmorDelta||0)+oldDef-t.def;if(gear)raw=gear.raw;if(s.curioCard)s.curioCard.raw=(s.curioCard.raw||0)+raw}if(!meta.equipmentDerived139)raw=FrontierCurios?.beforeDamage(t,raw,a.operator,type)??raw;raw=FrontierRegionalEnemies.beforeDamage(t,raw,type,s);raw=window.FrontierEnemyTactics?.beforeDamage(t,s,raw,type)??raw;const def=t.def,res=t.res;let result;try{if(gear){t.def=gear.def;t.res=gear.res}result=basic.damage(s,a,t,raw,type,meta)}finally{t.def=def;t.res=res}if(hook){const m=s.medicineCard;if(m?.owner===a.operator){if(m.extraPoise)result.poiseBreakValue=(result.poiseBreakValue??result.damage)+Math.floor(result.damage*m.extraPoise);if(m.trueHit&&!m.trueUsed&&t.hp>0){m.trueUsed=true;const extra=basic.damage(s,a,t,m.trueHit,'true',{sourceKind:'medicine',equipmentDerived139:true});result.hpLoss+=extra.hpLoss;result.damage+=extra.damage;result.absorbed=(result.absorbed||0)+extra.absorbed;result.poiseBreakValue=(result.poiseBreakValue??result.damage-extra.damage)+(extra.poiseBreakValue??extra.damage);}}}FrontierRegionalEnemies.afterDamage(t,s,result.hpLoss);window.FrontierEnemyTactics?.afterDamage(t,s,result.hpLoss,type,a);result.hp=t.hp;if(!preview&&!meta.equipmentDerived139){const breakBefore=t.special&&!t.special.solved?t.special.damage:null;if(!t.device75&&!globalThis.FrontierRegional75?.blocked(s,t))FrontierBreaks.accumulateDamage(t,result.poiseBreakValue??result.damage,{actorMultiplier:(a.toughnessMultiplier??1)*(1+(globalThis.FrontierEquipmentTuning15?.actorBonus(s,a).poise||0)),cardMultiplier:(meta.toughnessMultiplier??1)*(globalThis.FrontierRegional75?.poiseMultiplier(t)??1),extra:meta.extraToughness??0});if(breakBefore!=null&&t.special){const threshold=Math.ceil(t.special.threshold*(t.special.kind==='ward'?1.6:1));globalThis.FrontierCombatMetricsV18?.note(s,a,'poise',Math.min(threshold,t.special.damage)-breakBefore)}FrontierCurios?.damage(t,result.hpLoss,a.operator,type,previous,true);if(hook&&!(a.operator==='amiya'&&FrontierArsenal.index(a.operator)===27))FrontierArsenal?.after(t,a.operator,result.hpLoss);FrontierLinks?.hit(t,a.operator,block)}return result},preview)},
  heal(s,a,t,amount,meta={}){return bound(s,()=>{if(meta.sourceKind==='ordinary'&&meta.direct!==false){const te=R()?.talent43?.effects||{};const extra=amount*(te.heal||0)/100+(s.talentHealCarry43||0),whole=Math.floor(extra+1e-9);s.talentHealCarry43=extra-whole;amount+=whole;s.talentUsed43??={};if(!s.talentUsed43.firstHeal&&amount>0&&t.hp<t.max&&t.hp>0){amount+=te.firstHeal||0;s.talentUsed43.firstHeal=true}}if(meta.primary&&s.operatorCardHook?.owner===a.uid)amount*=s.operatorCardHook.supportFactor;if(!preview)amount=FrontierCurios?.beforeHeal(t,amount,a.operator)??amount;const before=t.hp,result=basic.heal(s,a,t,FrontierEnvironment.healing(amount),meta);if(!preview){FrontierCurios?.healed(t,before,FrontierEnvironment.healing(amount));FrontierDefense?.healed(t,before,a.operator)}return result},preview)}
 }}
 function identity(s,prefix){s.operatorSeq=(s.operatorSeq||0)+1;return prefix+':'+(s.operatorBattleId||'battle')+':'+s.operatorSeq}
 function freezeGrowth(r=R()){
  if(!r?.team||r.result||r.operatorSystemVersion!==113||r.operatorMasterySnapshot)return;
  r.operatorMasterySnapshot={};r.startingElite??={};
  for(const a of r.team){
   const uid=db.personnel?.units[a.id]?.uid;
   r.operatorMasterySnapshot[a.id]=a.borrowed?{}:structuredClone(db.masteryV31?.byUid?.[uid]||{});
   r.startingElite[a.id]??=a.borrowed?0:a.elite??db.progress?.operators?.[a.id]?.elite??0;
  }
 }
 function mastery(actor,card){
  if(!actor||!card)return 'M0';
  const r=R(),id=actor.operator||actor.id;if(r?.recruitment144?.roster.find(u=>u.id===id)?.elite===1)return 'M0';
  const preset=globalThis.FrontierTeamsPreviewV20?.effectiveStage?.(r,actor,card);
  if(preset)return preset;
  if(r?.operatorMasterySnapshot)return r.operatorMasterySnapshot[id]?.[actor.form]?.[card.id]||'M0';
  return db.masteryV31?.byUid?.[db.personnel?.units[id]?.uid]?.[actor.form]?.[card.id]||'M0';
 }
 function execute(index,selection={},preview=false){if(!preview||previewSandbox)return executeCard(index,selection,preview);const original=db,previous=previewSandbox;db=clonePreviewDb(original);previewSandbox=true;try{return executeCard(index,selection,true)}finally{db=original;previewSandbox=previous}}
 function executeCard(index,selection={},preview=false){const s=snapshot();if(preview)s.operatorMetricsPreview=true;if(s.pending.length||FrontierCurios.pending())throw Error('請先完成畫面中的抽／棄牌或收藏品選擇。');if(s.phase!=='player')throw Error('目前正在選擇保留牌，可點「返回出牌」繼續。');const card=s.hand[index],definition=card&&E.definitions.get(card.id);if(!definition)throw Error('PRTS｜此卡牌未接上新版效果。');const actor=s.team.find(a=>a.operator===definition.owner&&a.form===definition.form);if(!actor)throw Error('PRTS｜出牌幹員型態不符。');const operation=identity(s,'card'),stage=mastery(actor,card);const metadata=E.describe(card.id,stage),cap=E.targetCount(card.id,stage,actor,s);if(cap>1&&!selection.targets){const primary=s.enemies.find(e=>e.uid===selection.target&&e.hp>0&&!e.exited&&e.targetable!==false)||s.enemies.find(e=>e.hp>0&&!e.exited&&e.targetable!==false);selection={...selection,targets:[primary,...s.enemies.filter(e=>e!==primary&&e.hp>0&&!e.exited&&e.targetable!==false)].filter(Boolean).slice(0,cap).map(e=>e.uid)}}const hooks=bound(s,()=>{const d=cardStats(card);d.kind=metadata.attack?(metadata.aoe?'all':'attack'):'support';d.damage=metadata.attack?actor.atk:0;d.block=0;d.heal=0;const base=d.damage;FrontierCurios.beforeCard(d,card,selection.targets||selection.target);FrontierLinks.card(d);FrontierEquipment.beforeCard(d);FrontierMedicine.beforeCard(d);const support=!metadata.attack&&(definition.supportEffect140?.[stage]??/護盾|治療|恢復.{0,10}HP/.test(definition.sourceEffects[stage]))?FrontierCurios.emit('supportEffect',{owner:actor.operator,mult:0}):{mult:0};s.operatorCardHook={owner:actor.uid,support:!metadata.attack,damageFactor:base?d.damage/base:1,supportFactor:1+(support.mult||0),costDelta:d.cost-definition.cost};if(s.curioCard)s.curioCard.raw=0;if(metadata.attack&&actor.regionalAttackWeaken){s.operatorCardHook.damageFactor*=.8;delete actor.regionalAttackWeaken}return d},preview);s.hand.splice(index,1);let next=E.execute(s,{...selection,id:operation,actor:actor.uid,card:card.id,stage,instance:card},adapters(preview));if(next.pending.some(p=>p.source===operation)){next.operatorInFlight??=[];next.operatorInFlight.push({source:operation,card})}else finishPlayed(next,card);exhaustSpent(next);bound(next,()=>{const event=next.events.findLast(e=>e.type==='ordinaryCardPlayed');
 if(event){hooks.cost=event.cost;hooks.curioShields=next.team.map(actor=>({actor,amount:(actor.shieldLayers||[]).filter(l=>l.source===event.id).reduce((n,l)=>n+l.amount,0)})).filter(x=>x.amount>0);hooks.curioDefense=hooks.curioShields.length>0;hooks.curioDispatch=actor.profession==='先鋒'&&next.energy>s.energy-event.cost;}
 FrontierCurios.afterCard(hooks,card);FrontierArsenal.finishCard();delete next.operatorCardHook;delete next.equipmentCard;delete next.medicineCard},preview);const event=next.events.findLast(e=>e.type==='ordinaryCardPlayed');if(event)next=S.emit(next,{...event,id:operation,sourceKind:'ordinary'});if(!preview)globalThis.FrontierCombatMetricsV18?.note(next,actor,'cards',1);return S.sync(next)}
 function play(index,selection={}){const previous={team:R().team,enemies:R().battle.enemies,eventCount:R().battle.operatorEvents?.length||0,cardBuffs:R().battle.cardBuffs||[]};const card=R().battle.hand[index]?.id,definition=E.definitions.get(card);const next=execute(index,selection);if(globalThis.FrontierCombatMetricsV18){next.metrics18??=FrontierCombatMetricsV18.initial(false);next.metrics18.cards++;}apply(next);log(cardName({id:next.events.findLast(e=>e.type==='ordinaryCardPlayed')?.card})+' · 已結算');if(!checkBattle()){save();render();window.FrontierOperatorUIV113?.playFeedback(previous,{card,operator:definition?.owner,form:definition?.form,ordinary:true});const actor=R().team.find(a=>a.uid===next.events.findLast(e=>e.type==='ordinaryCardPlayed')?.actor);window.FrontierOperatorUIV113?.ordinaryAnimation(actor);window.FrontierOperatorUIV113?.ordinaryCue(actor,card,selection)}return true}
 function discard(uid){const legacy=FrontierCurios.pending();if(legacy&&['discard','activeDiscard'].includes(legacy.kind)&&!R().battle.operatorPending?.length){const index=R().battle.hand.findIndex(c=>c.uid===uid);if(index<0)throw Error('此牌已不在手上。');return FrontierCurios.resolveChoice(legacy.id,index)}const s=snapshot(),index=s.hand.findIndex(c=>c.uid===uid);if(index<0)throw Error('此牌已不在手上。');if(s.pending?.[0]?.type==='drawDiscard'&&s.pending[0].stage==='draw'){apply(s);return discard(uid)}if(s.pending?.length){if(['discard','discardFirst'].includes(s.pending[0].stage))return resolve({discard:uid});throw Error('請先完成目前的卡牌選擇。')}const retention=['retain','retain-overflow'].includes(s.phase);if(s.phase!=='player'&&!retention)throw Error('敵方結算中，請稍候再操作。');const [card]=s.hand.splice(index,1);delete card.curioRetain;delete card.retainSelected;s.discard.push(card);s.events??=[];s.events.push({id:identity(s,'discard'),type:retention?'ruleDiscard':'activeDiscard',active:!retention,card:uid,turn:s.turn,source:'swipe',sourceKind:'discard'});if(retention){s.retainRequired=(s.retainRequired||[]).filter(x=>x!==uid);s.retainSelection=(s.retainSelection||[]).filter(x=>x!==uid);if(s.retainRequired.length<=Math.min(5,2+(s.retainBonus||0)))s.phase='retain'}apply(s);if(!retention)FrontierCurios.emit('activeDiscard',{card,owner:cards[card.id]?.owner});selected=null;if(!checkBattle()){save();render();if(FrontierCurios.pending())FrontierCurios.choiceView()}return true}
 // Run the complete outgoing pipeline against an isolated save, including curio RNG.
 function attackSelection(actor,enemy,enhance,equipment139Choices,team=R().team){
  const target=enemy.uid;
  return {target,enhance,equipment139Choices,mode:'normal',
   secondaryTarget:team.find(a=>a.uid!==actor.uid&&a.hp>0)?.uid,
   stunTargets:!enemy.boss&&!enemy.elite&&!enemy.immuneStun?[target]:[],
   breakTarget:enemy.action?.breakable&&enemy.action?.breakWindow?target:undefined};
 }
 function previewOutgoing(index,owner,target,enhance,equipment139Choices){
  const original=db,previous=previewSandbox;
  try{
   db=clonePreviewDb(original);previewSandbox=true;
   const before=snapshot();
   const enemy=before.enemies.find(e=>e.uid===target),definition=E.definitions.get(before.hand[index]?.id);
   const actor=owner?before.team.find(a=>a.uid===(before.skills.find(c=>c.owner===owner)?.actorUid||owner)):before.team.find(a=>a.operator===definition?.owner&&a.form===definition?.form);
   if(!enemy||!actor)return null;
   const selection=attackSelection(actor,enemy,enhance,equipment139Choices,before.team);
   // Run the real damage adapters in a scratch save, including resource, cross-operator and gear hooks.
   const next=owner?.startsWith('aux49:')?
    B.auxiliary(before,{id:identity(before,'derived-preview'),actor:owner.slice(6),target},adapters()):
    owner?S.cast(before,{...selection,id:identity(before,'signature'),actor:owner},adapters()).state:
    execute(index,selection,false);
   return Object.fromEntries(before.enemies.map(e=>{
    const after=next.enemies.find(x=>x.uid===e.uid);
    const hits=next.events.slice(before.events.length).filter(x=>x.target===e.uid&&Number.isFinite(x.damage));
    const absorbed=hits.reduce((n,x)=>n+(x.absorbed||0),0);
    const hpLoss=Math.max(Math.max(0,e.hp-(after?.hp??e.hp)),hits.reduce((n,x)=>n+(x.hpLoss||0),0));
    return [e.uid,{damage:hpLoss+absorbed,hpLoss,absorbed}];
   }));
  }finally{db=original;previewSandbox=previous;}
 }
 function cast(actor,selection={}){const previous={team:R().team,enemies:R().battle.enemies,eventCount:R().battle.operatorEvents?.length||0,cardBuffs:R().battle.cardBuffs||[]};if(actor.startsWith('aux49:')){if(FrontierCurios.pending())throw Error('請先完成畫面中的收藏品選擇。');const s=snapshot(),next=B.auxiliary(s,{id:identity(s,'derived'),actor:actor.slice(6),...selection},adapters());if(globalThis.FrontierCombatMetricsV18){next.metrics18??=FrontierCombatMetricsV18.initial(false);next.metrics18.cards++}const caster=s.team.find(a=>a.uid===actor.slice(6));apply(S.sync(next));if(!checkBattle()){save();render();window.FrontierOperatorUIV113?.playFeedback(previous,{operator:caster?.operator,form:caster?.form,ordinary:true});window.FrontierOperatorUIV113?.ordinaryAnimation(caster);window.FrontierOperatorUIV113?.ordinaryCue(caster,null,selection,'attack')}return true}const s=snapshot();if(s.pending.length)throw Error('請先完成畫面中的抽／棄牌選擇。');if(s.phase!=='player')throw Error('請先返回出牌階段再施放招牌。');if(FrontierMedicine.skillLocked(s.team.find(a=>a.uid===actor),s.turn))throw Error('PRTS｜幹員目前無法施放招牌技能。');const caster=s.team.find(a=>a.uid===actor),skill=rules[caster?.operator]?.[caster?.form],id=identity(s,'signature'),castResult=S.cast(s,{...selection,id,actor},adapters()),next=castResult.state;if(globalThis.FrontierCombatMetricsV18){next.metrics18??=FrontierCombatMetricsV18.initial(false);next.metrics18.cards++;}apply(next);if(!checkBattle()){save();render();window.FrontierOperatorUIV113?.playFeedback(previous,{operator:caster?.operator,form:caster?.form,signature:true})}if(!castResult.replayed)window.FrontierOperatorUIV113?.signatureAnimation(caster,skill);return true}
 function resolve(choice){const previous={team:R().team,enemies:R().battle.enemies,eventCount:R().battle.operatorEvents?.length||0,cardBuffs:R().battle.cardBuffs||[]};const s=snapshot(),id=identity(s,'choice'),source=s.pending[0]?.source,origin=s.operatorInFlight?.find(f=>f.source===source)?.card,definition=origin&&E.definitions.get(origin.id);if(s.pending[0]?.type==='exuBlessing'){apply(s);save();render();return true}const next=E.resolve(s,{...choice,id},adapters());for(const flight of next.operatorInFlight||[])if(!next.pending.some(p=>p.source===flight.source))finishPlayed(next,flight.card);next.operatorInFlight=(next.operatorInFlight||[]).filter(f=>next.pending.some(p=>p.source===f.source));if(choice.discard){const discarded=next.discard.find(c=>c.uid===choice.discard);if(discarded)bound(next,()=>FrontierCurios.emit('activeDiscard',{card:discarded}),false)}apply(S.sync(next));if(!checkBattle()){save();render();window.FrontierOperatorUIV113?.playFeedback(previous,{card:origin?.id,operator:definition?.owner,form:definition?.form})}}
 function turnCommand(type,extra={}){const s=snapshot(),id=identity(s,'turn');return FrontierOperatorTurnsV31.apply(s,{...extra,type,id,seq:s.seq+1},{shuffle:items=>shuffle(items),onShuffle:state=>{state.curioShuffleQueued=true},nativeRetain:c=>!!(c.retain||c.curioRetain),retainBonus:s.retainBonus||0}).state}
 function hasPlayableCard(s){
  const allies=s.team.filter(a=>a.hp>0&&!a.exited),enemy=s.enemies.find(e=>e.hp>0&&!e.exited&&e.targetable!==false);
  return s.hand.some((card,index)=>{
   if(card.id==='curio_tactic')return true;
   const def=E.definitions.get(card.id),actor=def&&allies.find(a=>a.operator===def.owner&&a.form===def.form);
   if(!actor)return false;
   const targetType=E.describe(card.id,mastery(actor,card))?.target;
   const target=targetType==='self'?actor:targetType==='otherAlly'?allies.find(a=>a!==actor):targetType==='ally'?actor:enemy;
   if(!target)return false;
   try{execute(index,{target:target.uid},true);return true}catch{return false}
  });
 }
 function autoRetain(s){
  const required=s.retainRequired||[],limit=Math.min(5,2+(s.retainBonus||0));
  if(required.length>limit)return shuffle(required.slice()).slice(0,limit);
  const optional=s.hand.map(c=>c.uid).filter(id=>!required.includes(id));
  return [...required,...shuffle(optional).slice(0,limit-required.length)];
 }
 function endChoice(){apply(snapshot());const s=snapshot();if(s.pending.length||FrontierCurios.pending()){save();render();toast('請先完成畫面中的抽／棄牌或目標選擇，再結束回合。');return false}if(['retain','retain-overflow'].includes(s.phase)){render();return true}const automatic=s.energy<=0||!hasPlayableCard(s);const b=R().battle,bonus=R().curios&&FrontierCurioEngine.active(R().curios,'R018')?1:0;b.retainBonus=(b.retainBonus||0)-(b.curioRetainBonus||0)+bonus;b.curioRetainBonus=bonus;apply(turnCommand('endChoice'));if(automatic)return retain(autoRetain(snapshot()));if(R().battle.hand.length<=2)return retain(R().battle.hand.map(c=>c.uid));save();render();return true}
 function cancelEndChoice(){const s=snapshot();if(!['retain','retain-overflow'].includes(s.phase))return false;s.phase='player';delete s.retainRequired;delete s.retainSelection;apply(s);save();render();return true}
 function retain(ids){const next=turnCommand('retain',{cards:ids});for(const c of next.hand)delete c.curioRetain;apply(next);return enemyPhase()}
 function enemyPhase(){
  let s=snapshot();if(s.phase!=='enemy')throw Error('PRTS｜請先完成保留牌選擇。');const ad=adapters();
  s=prepareEnemyPhase(s);
  s=resolveEnemyActions(s,ad);apply(S.sync(s));if(checkBattle()){save();render();return}
  s=turnCommand('refill');s.energy=FrontierEnvironment.energy(s.energy,s.turn);FrontierRegionalEnemies.refill(s);s=B.afterRefill(s,ad);apply(S.sync(s));
  for(const enemy of R().battle.enemies.filter(e=>e.hp>0)){enemy.intent=enemy.boss?(R().battle.turn%3===0?'buff':'attack'):(R().battle.turn+R().battle.enemies.indexOf(enemy))%3===0?'defend':'attack';enemy.action={...enemy.action,kind:enemy.intent,target:null}}
  FrontierBreaks?.turn();FrontierCombat.plan();plan();save();render();
 }
 const environmentDots=['burn','bleed','poison'];
 function prepareEnemyPhase(s){
  bound(s,()=>{if(s.team.some(a=>a.hp>0&&environmentDots.some(id=>a.regionalAilments?.[id]&&a.status?.[id]>0))){FrontierMedicine.tick();for(const a of s.team)for(const id of environmentDots)if(a.regionalAilments?.[id]&&a.status?.[id]>0)a.status[id]--;}FrontierEnvironment.turn();},previewSandbox);
  for(const card of s.hand)delete card.environmentCost;
  if(globalThis.FrontierGoldenglowV24)s=FrontierGoldenglowV24.endPlayerTurn(s,adapters(previewSandbox));
  s=S.emit(s,{id:identity(s,'turn-complete'),type:'playerTurnCompleted',sourceKind:'turn',turn:s.turn});
  for(const a of s.team){if(a.operator==='operator_v31_aak'&&a.hp>0)FrontierOperatorDamageV113.spendHP(a,Math.max(20,Math.floor(a.max*.04)));if(a.specterStunAfter===s.turn)a.stunnedTurn=s.turn+1}
  return s;
 }
 function resolveEnemyActions(s,ad,preview=false){
  if(!s.team.some(a=>a.hp>0&&!a.exited))return s;
  bound(s,()=>FrontierBreaks?.beforeEnemies(),preview);
  s=B.beginEnemyPhase(s,ad);globalThis.FrontierRegional75?.begin(s);
  for(const original of s.enemies.filter(e=>e.hp>0)){
   const enemy=s.enemies.find(e=>e.uid===original.uid);if(!enemy||enemy.hp<=0||window.FrontierEnemyTactics?.beforeEnemy(enemy,s)===false)continue;enemy.block=0;FrontierRegionalEnemies.healBeforeAction(enemy);
   const due=enemy.special&&enemy.special.due<=s.turn;
   const bind=enemy.skipNextControllableAction&&(!due||!enemy.boss&&!enemy.elite);
   const stun=enemy.skipNextOrdinaryAction&&!due;
   if(bind||stun){
    if(bind){delete enemy.skipNextControllableAction;enemy.statuses=(enemy.statuses||[]).filter(status=>status.id!=='bind')}
    if(stun){delete enemy.skipNextOrdinaryAction;delete enemy.skipSource}
    if(due&&!enemy.special.solved){FrontierOperatorStatusDictionaryV31.breakStatus(enemy);if(enemy.action.breakProgress>=enemy.action.breakRequired)bound(s,()=>FrontierBreaks.solve(enemy,'points'),preview);}
    if(bind&&due&&!enemy.boss&&!enemy.elite){bound(s,()=>FrontierBreaks.solve(enemy,'bind'),preview);continue;}
    if(!due)continue;
   }
   FrontierRegionalEnemies.prepareAction(enemy,s);
   if(enemy.intent==='attack'||due){
    const victim=slots({team:s.team}).find(a=>a.uid===enemy.operatorTarget||a.id===enemy.target)||s.team.find(a=>a.hp>0&&!a.exited);if(!victim)break;
    const special=!!enemy.special&&enemy.special.due<=s.turn;enemy.action={...enemy.action,kind:'attack',damageType:enemy.damageType,special,breakable:special,breakWindow:special,breakRequired:FrontierBreaks.points(enemy)};
    const incoming=bound(s,()=>FrontierBreaks?.incoming(enemy,enemy.atk)||{raw:enemy.atk},preview);
    if(incoming.cancel)continue;
    const adapted=FrontierRegionalEnemies.action(enemy,victim,s,incoming.raw,special);
    const count=incoming.targets||adapted.splash;
    const targets=adapted.hits75?Array.from({length:adapted.hits75},()=>victim):count?[victim,...slots({team:s.team}).filter(a=>a.uid!==victim.uid&&a.operator!=='flow')].slice(0,count):[victim];
    const actionId=identity(s,'enemy');
    const tier=enemy.mechanicTier||0;
    for(const target of targets){
     if(!s.enemies.some(e=>e.uid===enemy.uid&&e.hp>0)||!slots({team:s.team}).some(a=>a.uid===target.uid))continue;
     const id=identity(s,'enemy-hit');
     const damageCap=incoming.targets&&!adapted.hits75&&tier<=1?Math.max(1,Math.floor(target.max*(tier===0?.45:.6))):undefined;
     s=B.incoming(s,{id,actionId,enemy:enemy.uid,target:target.uid,raw:adapted.equalShare75?Math.floor(adapted.raw/targets.length):adapted.splash&&target!==victim?Math.max(1,Math.floor(adapted.raw/2)):adapted.raw,damageCap,damageType:(target!==victim&&adapted.secondaryType75)||enemy.damageType||'physical',single:new Set(targets.map(a=>a.uid)).size===1,interceptable:new Set(targets.map(a=>a.uid)).size===1,special},ad);
     const event=s.events.findLast(e=>e.id===id&&e.type==='enemyDamage');if(event)s=S.emit(s,{...event,sourceKind:'enemy'});
    }
   }else if(enemy.intent==='defend')enemy.block=70;else enemy.atk+=20;
  }
  window.FrontierEnemyTactics?.afterRound(s);
  return B.endEnemyPhase(s,ad);
 }
 function previewIncoming(){
  const saved=db;db=clonePreviewDb(db);previewSandbox=true;
  try{
   let s=snapshot();s.operatorMetricsPreview=true;s.phase='enemy';s=prepareEnemyPhase(s);
   const hp=Object.fromEntries(s.team.map(a=>[a.uid,a.hp]));
   const result=resolveEnemyActions(s,adapters(true),true);
   return Object.fromEntries(result.team.map(a=>[a.uid,Math.max(0,hp[a.uid]-a.hp)]));
  }finally{db=saved;previewSandbox=false}
 }

 function initializeBattle(){const r=R(),b=r.battle;if(!active()||!b||b.operatorVersion===113)return;const base={};for(const a of r.team){for(const flag of Object.values(oncePerBattleFlags))delete a[flag];base[a.id]=structuredClone(a);const form=formFor(a.id,a.id==='amiya'?r.amiyaForm||'caster':'standard');a.uid=db.personnel?.units[a.id]?.uid||a.id;a.operator=a.id;a.form=form?.id||'standard';a.elite=r.startingElite?.[a.id]??db.progress?.operators?.[a.id]?.elite??0;a.profession=form?.profession||FrontierCapture.units[a.id]?.role;a.resources={};a.damageType=FrontierCombat.operators[a.id].type;if(form?.operatorName==='繆爾賽思'){const t=r.team.filter(x=>x.id!==a.id&&x.hp>0&&!x.exited).sort((x,y)=>y.atk-x.atk)[0],template=t?{...t,uid:db.personnel?.units[t.id]?.uid||t.id,profession:FrontierCapture.units[t.id]?.role,damageType:FrontierCombat.operators[t.id]?.type}:undefined;a.flow=FrontierOperatorDamageV113.flow(a,template)}}b.operatorActorBaseline=base;b.operatorVersion=113;b.talentEffects43=structuredClone(r.talent43?.effects||{});b.operatorBattleId='run:'+r.number+':'+(b.curioKey||crypto.randomUUID());b.operatorSeq=0;b.operatorPending=r.team.filter(a=>a.operator==='char_103_angel'&&a.elite===2&&a.hp>0).map(a=>({type:'exuBlessing',owner:a.uid}));b.operatorEvents=[];b.operatorPhase='player';b.seq=0;b.skills=[];b.receipts={};b.nextCard=1;b.hand=[];b.draw=shuffle(r.deck.map(c=>({...c,uid:b.operatorBattleId+':card:'+b.nextCard++})));b.discard=[];b.exhaust=[];b.energy=b.operatorTurnEnergy=5;for(const enemy of b.enemies){enemy.uid=enemy.id;enemy.elite=b.type==='elite';enemy.action={kind:enemy.intent,damageType:enemy.damageType,breakable:!!enemy.special,breakWindow:!!enemy.special,breakRequired:FrontierBreaks.points(enemy),breakProgress:0,target:r.team.find(a=>a.id===enemy.target)?.uid}}while(b.hand.length<7&&b.draw.length)b.hand.push(b.draw.pop());FrontierEnvironment.battle();apply(S.sync(snapshot()))}
 function restoreActors(b){const r=R();if(!r||!b?.operatorActorBaseline)return;for(const current of r.team){const base=b.operatorActorBaseline[current.id];if(!base)continue;const persistent={...base,hp:current.hp>0?Math.max(1,Math.min(base.max,current.hp-(current.aakTemporary||[]).reduce((n,e)=>n+(e.remainingHP??e.hp),0))):0,status:current.status,downed:current.hp<=0,rescueTimer:current.rescueTimer};for(const key of Object.keys(current))delete current[key];Object.assign(current,persistent)}r.hp=r.teamTotal=r.team.reduce((n,a)=>n+a.hp,0);r.max=r.team.reduce((n,a)=>n+a.max,0)}

 function rewardPool(includeLimited=false){const r=R();return r.team.flatMap(a=>{const form=formFor(a.id,a.id==='amiya'?r.amiyaForm||'caster':'standard');if(!form)return [];const uid=db.personnel?.units[a.id]?.uid,configured=db.masteryV31?.loadouts?.[uid],selected=r.operatorLoadoutsV113?.[a.id]||(configured?.form===form.id?configured.cards:form.cards.slice(0,3).map(c=>c.id));return selected.filter(id=>form.cards.some(c=>c.id===id)&&E.definitions.has(id)&&(includeLimited||!onceFlag(id)))})}
 function retireOldCards(){if(!active())return;const r=R(),allowed=new Set([...rewardPool(true),...selectedTactics(r.doctorTactics)]);let changed=false;const clean=(holder,key)=>{if(!Array.isArray(holder?.[key]))return;const old=holder[key].filter(c=>!allowed.has(c.id)&&!(c.generated&&c.id==='curio_tactic'));if(!old.length)return;r.retiredCardsV113??=[];r.retiredCardsV113.push({pile:key,cards:structuredClone(old),turn:r.battle?.turn||0});holder[key]=holder[key].filter(c=>allowed.has(c.id)||c.generated&&c.id==='curio_tactic');changed=true};clean(r,'deck');for(const key of ['hand','draw','discard','exhaust'])clean(r.battle,key);if(r.reward?.strategy){const q=r.reward.strategy;if(q.choices.includes('upgrade')){q.choices=q.choices.map(x=>x==='upgrade'?'remove':x);changed=true}if(q.stage==='upgrade'){q.stage='choose';changed=true}}if(r.reward){const rewardAllowed=new Set(rewardPool());const old=r.reward.choices.filter(c=>!rewardAllowed.has(c.id));if(old.length){r.retiredCardsV113??=[];r.retiredCardsV113.push({pile:'reward',cards:structuredClone(old)});r.reward.choices=r.reward.choices.map((c,i)=>rewardAllowed.has(c.id)?c:{id:[...rewardAllowed][i%rewardAllowed.size],up:false}).filter(c=>c.id);changed=true}for(const c of r.reward.choices)if(c.up){c.up=false;changed=true}}if(r.battle){const state={...r.battle,team:r.team};if(exhaustSpent(state)){for(const key of ['hand','draw','discard','exhaust'])r.battle[key]=state[key];changed=true;}const ids=new Set(r.battle.hand.map(c=>c.uid));for(const key of ['retainRequired','retainSelection'])if(r.battle[key])r.battle[key]=r.battle[key].filter(id=>ids.has(id))}if(r.event?.type==='manage'&&r.event.action==='upgrade'){r.event={type:'camp'};changed=true}if(changed)save();return changed}
 function install(){
  for(const form of catalog.forms){const operator=FrontierCombat.operators[form.operatorId];if(operator&&(form.id==='standard'||form.id==='caster'))operator.stageStats=structuredClone(form.stats)}
  const oldReward=makeReward;makeReward=function(...args){if(!active())return oldReward(...args);const previous=specialPool.slice();specialPool.splice(0,specialPool.length,...new Set(rewardPool()));try{return oldReward(...args)}finally{specialPool.splice(0,specialPool.length,...previous)}};
  const oldUpgrade=canUpgrade;canUpgrade=function(c){return active()?false:oldUpgrade(c)};const oldManage=campManage;campManage=function(action){if(active()&&action==='upgrade'){toast('專精僅能在基地培養。');return}return oldManage(action)};
  const oldEventView=eventView;eventView=function(){oldEventView();if(active())for(const el of document.querySelectorAll('[onclick]'))if(el.getAttribute('onclick')==="campManage('upgrade')")el.remove()};
  const oldStart=startRun;startRun=function(){const before=R(),result=oldStart();const r=R();if(!r||r===before||r.result||!r.team?.length)return result;r.operatorSystemVersion=113;freezeGrowth(r);r.deck=r.team.flatMap(a=>{const form=formFor(a.id,a.id==='amiya'?r.amiyaForm||'caster':'standard'),unit=db.personnel?.units[a.id],configured=db.masteryV31?.loadouts?.[unit?.uid],ids=form?(configured?.form===form.id?configured.cards:form.cards.slice(0,3).map(c=>c.id)):(FrontierCombat.operators[a.id].personal||r.deck.filter(c=>cards[c.id]?.owner===a.id).slice(0,3).map(c=>c.id));return ids.map(id=>({id,up:false}))});r.doctorTactics=tacticalLoadout();r.deck.push(...r.doctorTactics.map(id=>({id,up:false})));r.operatorLoadoutsV113=Object.fromEntries(r.team.map(a=>[a.id,[...new Set(r.deck.filter(c=>cards[c.id]?.owner===a.id).map(c=>c.id))].slice(0,3)]));save();render();return result};
  const oldBattle=startBattle;startBattle=function(...args){const result=oldBattle(...args);if(active()&&R()?.battle){initializeBattle();save();render()}return result};
  const oldCheck=checkBattle;checkBattle=function(){const b=active()&&R()?.battle,result=oldCheck();if(b&&!R()?.battle)restoreActors(b);return result};
  const oldStats=cardStats;cardStats=function(c){const d=oldStats(c),definition=active()&&E.definitions.get(c.id);if(active()&&selectedTactics(R().doctorTactics).includes(c.id))return {...d,text:tacticText(c.id)};if(!definition)return d;const actor=R().team.find(a=>a.operator===definition.owner&&a.form===definition.form),stage=mastery(actor||{operator:definition.owner,form:definition.form},c),m=E.describe(c.id,stage);return {...d,name:definition.name,cost:Math.max(0,definition.cost+d.cost-(cards[c.id]?.cost||0)+(window.FrontierEnemyTactics?.cost(actor)||0)),kind:['enemy','highestDefEnemy','lowestDefEnemy'].includes(m.target)?'attack':m.attack?'all':m.target==='ally'||m.target==='otherAlly'?'block':'draw',operatorType:m.attack?m.damageType:['ally','otherAlly'].includes(m.target)?'protection':'support',text:definition.sourceEffects[stage],mastery:stage}};
  const oldText=cardText;cardText=function(c){return active()&&E.definitions.has(c.id)?cardStats(c).text:oldText(c)};
  const oldPlay=playCard;playCard=function(index,target){if(!active())return oldPlay(index,target);const c=R()?.battle?.hand[index];if(c&&E.definitions.has(c.id))return FrontierOperatorUIV113.choose(index,target);if(c&&tactics.includes(c.id)&&selectedTactics(R().doctorTactics).includes(c.id))return playTactic(index,target);const result=oldPlay(index,target);if(R()?.battle)R().battle.energy=Math.min(5,R().battle.energy);return result};
  const oldEnd=endTurn;endTurn=function(){if(!active())return oldEnd();return endChoice()};
  const oldRender=render;render=function(){retireOldCards();plan();oldRender();if(active()){plan();FrontierOperatorUIV113?.mount()}};const oldIntent=intentText;intentText=function(e){if(!active()||R()?.battle?.operatorVersion!==113)return oldIntent(e);const target=slots().find(a=>a.uid===e.operatorTarget),label=target?.operator==='flow'?'流形':FrontierCapture.units[target?.id]?.name||'隊伍';if(e.hp<=0)return '已擊敗';if(e.regionalFragment)return '星環 · 保護本體';const telegraph=FrontierBreaks.telegraph(e,R().battle.turn);if(telegraph)return telegraph;if(e.skipNextControllableAction||e.skipNextOrdinaryAction)return '本回合行動受控';return e.intent==='attack'?(e.damageType==='arts'?'法術 ':'物理 ')+e.atk+' → '+label+FrontierRegionalEnemies.ordinaryIntent(e):oldIntent(e)};const oldControl=FrontierBreaks.control;FrontierBreaks.control=function(e,kind){if(!active())return oldControl(e,kind);if(!e.special||!e.action?.breakable||!e.action?.breakWindow)return false;e.operatorBreakSources??=[];const key=R().battle.operatorSeq+':'+kind;if(e.operatorBreakSources.includes(key))return false;e.operatorBreakSources.push(key);e.action.breakProgress=Math.min(e.action.breakRequired,(e.action.breakProgress||0)+1);if(e.action.breakProgress>=e.action.breakRequired){e.special.solved=true;e.special.method='points';e.breakWeakness=.15;if(e.special.kind==='ward'){FrontierCurios.environmentCost(-1);e.specialDelay=1}FrontierCurios.emit('break',{target:e,charge:e.special.kind==='charge',interrupt:true,method:'points'});return true}return false};
 }
 return {tactics,tacticText,tacticalLoadout,active,formFor,snapshot,freezeGrowth,mastery,apply,adapters,execute,attackSelection,previewOutgoing,play,discard,cast,resolve,endChoice,cancelEndChoice,retain,enemyPhase,previewIncoming,plan,initializeBattle,install,rewardPool,retireOldCards,effects:E,signatures:S,rules};
})();
