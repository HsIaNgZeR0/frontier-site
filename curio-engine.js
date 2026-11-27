'use strict';
// Rules are registered by event; no game-loop switch over sixty IDs.
globalThis.FrontierCurioEngine=(()=>{
 const data=()=>FrontierCurioData.entries,hooks=new Map(),implemented=new Set();
 for(const d of Object.values(data()))if(d.hope144||d.ticket144)implemented.add(d.id);
 const initial=()=>({version:1,owned:[],order:0,runUsed:{},floor:{index:-1,used:{},flags:{}},battle:null,history:[],rewards:{},routes:{}});
 const active=(s,id)=>s.owned.some(x=>x.id===id&&(data()[id].rank!=='core'||x.enabled));
 function counts(s){const values=Array(6).fill(0);for(const x of s.owned)if(active(s,x.id))values[(s.rules137?data():FrontierCurioData.legacyEntries||data())[x.id].category]++;return values}
 function activate(s,ids,inBattle=false){if(inBattle||!Array.isArray(ids)||ids.length>2||new Set(ids).size!==ids.length||ids.some(id=>data()[id]?.rank!=='core'||!s.owned.some(x=>x.id===id)))throw Error('PRTS｜只能在非戰鬥節點啟用最多兩件核心收藏品。');for(const x of s.owned)if(data()[x.id].rank==='core')x.enabled=ids.includes(x.id)}
 function gain(s,id){if(!data()[id]||!implemented.has(id)||s.owned.some(x=>x.id===id))return false;s.owned.push({id,order:++s.order,enabled:data()[id].rank!=='core'||s.owned.filter(x=>data()[x.id].rank==='core'&&x.enabled).length<2});return true}
 function valid(s){if(!s)return true;const counter=x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.values(x).every(n=>Number.isSafeInteger(n)&&n>=0);if(s.shown154&&(!counter(s.shown154)||Object.keys(s.shown154).some(id=>!data()[id])||Object.values(s.shown154).some(n=>n>1000000)))return false;if(s.version!==1||!Array.isArray(s.owned)||!Number.isSafeInteger(s.order)||s.order<0||new Set(s.owned.map(x=>x.id)).size!==s.owned.length||new Set(s.owned.map(x=>x.order)).size!==s.owned.length||s.owned.some(x=>!data()[x.id]||!Number.isInteger(x.order)||x.order<1||typeof x.enabled!=='boolean')||!counter(s.runUsed)||!s.floor||!Number.isInteger(s.floor.index)||s.floor.index< -1||!counter(s.floor.used))return false;if(s.battle&&(!counter(s.battle.used)||!counter(s.battle.turn?.used)||!counter(s.battle.totals)))return false;if(s.offers&&(!Array.isArray(s.offers)||s.offers.some(o=>typeof o.key!=='string'||!Array.isArray(o.ids)||o.ids.length<1||o.ids.length>3||new Set(o.ids).size!==o.ids.length||o.ids.some(id=>!data()[id]))))return false;return s.owned.filter(x=>data()[x.id].rank==='core'&&x.enabled).length<=2&&s.owned.every(x=>x.order<=s.order)}
 function register(id,event,scope,condition,effect,key='',version=0){implemented.add(id);const list=hooks.get(event)||[];list.push({id,scope,condition,effect,key,version});hooks.set(event,list)}
 function bucket(s,scope){if(scope==='run')return s.runUsed;if(scope==='floor')return s.floor.used;if(scope==='battle')return s.battle?.used;if(scope==='turn')return s.battle?.turn.used;return null}
 function once(s,id,scope,key=''){if(!scope)return true;const b=bucket(s,scope);if(!b||b[id+key])return false;b[id+key]=1;return true}
 function dispatch(s,event,c){if(!s||c.origin==='curio'&&!c.chain&&!['counter','pursuit'].includes(event.type)||c.preview)return event;if(c.chain&&++c.chain.events>128){s.guardStops=(s.guardStops||0)+1;return event}const e=event,b=s.battle;
  if(e.type==='floorStart'&&s.floor.index!==c.floor)s.floor={index:c.floor,used:{},flags:{}};
  if(e.type==='battleStart'){if(b?.key===c.battleKey)return e;if(b){s.history.push({key:b.key,used:b.used,totals:b.totals});if(s.history.length>100)s.history.shift()}s.battle={key:c.battleKey,used:{},totals:{},flags:{},turn:{index:c.turn,used:{},flags:{}}}}
  if(s.battle&&c.inBattle!==false&&s.battle.turn.index!==c.turn)s.battle.turn={index:c.turn,used:{},flags:{}};
  const battle=s.battle,flags=battle?.flags||{},turn=battle?.turn.flags||{};c={...c,s,flags,turn,once:(id,scope,key)=>once(s,id,scope,key),active:id=>active(s,id),counts:()=>counts(s)};
  for(const h of hooks.get(e.type)||[]){if(h.version===137&&!s.rules137||!h.version&&s.rules137&&data()[h.id]?.mechanics137)continue;if(c.inBattle===false&&['battle','turn'].includes(h.scope))continue;if(c.chain?.active.includes(h.id))continue;if(!active(s,h.id)&&!(e.type==='acquire'&&e.id===h.id))continue;if(e.type==='acquire'&&e.id!==h.id)continue;if(h.condition(e,c)&&once(s,h.id,h.scope,h.key)){c.chain?.active.push(h.id);try{h.effect(e,c)}finally{c.chain?.active.pop()}s.triggerTotals??={};s.triggerTotals[h.id]=(s.triggerTotals[h.id]||0)+1;if(battle)battle.totals[h.id]=(battle.totals[h.id]||0)+1}}
  resonance(s,e,c);return e;
 }
 const add=(e,n)=>{e.mult=(e.mult||0)+n},flag=(key,value)=>((e,c)=>{c.flags[key]=typeof value==='function'?value(e,c):value}),target=e=>!!e.target;
 register('R001','break','battle',e=>e.charge,flag('R001',true));register('R001','attackCard',null,(e,c)=>c.flags.R001,(e,c)=>{add(e,.2);delete c.flags.R001});
 register('R002','damage','turn',e=>e.marked||e.target?.marked,(e,c)=>c.hit(e.target,30,e.damageType));
 register('R003','kill','turn',e=>e.negativeCount>0,(e,c)=>c.draw(1));
 register('R004','damage','battle',e=>e.damageType==='physical'&&e.target.def>0,(e,c)=>c.armor(e.target,20,2,'R004'));
 register('R005','damage',null,(e,c)=>{if(!e.owner||e.owner==='common')return false;const k=e.target.id,owners=c.turn.R005??={};if(!owners[k]){owners[k]=e.owner;return false}return owners[k]!==e.owner&&c.once('R005','turn')},(e,c)=>c.hit(e.target,40,e.damageType));
 register('R006','attackCard','turn',e=>e.targets.some(x=>x.hp/x.max<.4),(e)=>add(e,.15));
 register('R007','battleStart',null,e=>e.kind==='elite',(e,c)=>{const enemy=e.enemies[0];c.flags.R007=enemy.id;c.reveal(enemy,'special')});register('R007','beforeDamage','battle',(e,c)=>e.target.id===c.flags.R007,e=>add(e,.1));
 register('R008','armorBreak','battle',target,(e,c)=>c.hit(e.target,60,'physical'));
 register('R009','break',null,e=>e.interrupt&&e.target.boss,(e,c)=>{c.flags.R009={target:e.target.id,turn:c.turnNumber+1}});register('R009','attackCard',null,(e,c)=>c.flags.R009?.turn===c.turnNumber&&e.targets.some(x=>x.id===c.flags.R009.target),(e,c)=>{add(e,.25);delete c.flags.R009});
 register('R010','break','battle',()=>true,flag('R010',true));register('R010','attackCard',null,(e,c)=>c.flags.R010&&e.cost>=2,(e,c)=>{e.pursuit=.3;delete c.flags.R010});
 register('R011','cardUsed',null,()=>true,(e,c)=>{const a=c.turn.R011??=[];if(!e.owner||e.owner==='common'){a.length=0;return}a.push(e.owner);if(a.length>3)a.shift();if(a.length===3&&new Set(a).size===3&&c.once('R011','turn'))c.draw(1)});
 register('R012','activeDiscard','turn',()=>true,(e,c)=>c.choose('shield',40));
 register('R013','shuffle','battle',()=>true,(e,c)=>c.draw(1));
 register('R014','cardUsed','battle',e=>e.cost===0,flag('R014',true));register('R014','cardEffect',null,(e,c)=>c.flags.R014&&e.cost===1&&(e.damage||e.shield),(e,c)=>{add(e,.1);delete c.flags.R014});
 register('R015','cardUsed','turn',e=>e.vanguardDispatch,(e,c)=>c.choose('retain',1));
 register('R016','activeDiscard','turn',()=>true,(e,c)=>{const enemy=c.randomEnemy();if(enemy)c.hit(enemy,40,'arts')});
 register('R017','cardUsed','battle',e=>e.cost>=2,(e,c)=>c.draw(1));
 register('R018','turnEndChoice','turn',()=>true,(e,c)=>c.choose('retain',1));
 register('R019','cardUsed',null,()=>true,(e,c)=>{const costs=c.turn.R019??={};costs[e.cost]=(costs[e.cost]||0)+1;if(costs[e.cost]>=3&&c.once('R019','battle')){c.draw(2);c.choose('discard',1)}});
 register('R020','activeDiscard','turn',e=>!e.card?.generated,(e,c)=>c.temporaryTactic());
 register('R021','beforeIncoming','battle',e=>e.direct,(e,c)=>c.shield(e.actor,50));
 register('R022','block','turn',e=>e.protectingAlly&&e.blocked>0,(e,c)=>c.shield(e.blocker||e.actor,30));
 register('R023','cardUsed','turn',e=>e.defense,flag('R023',(e)=>e.owner));register('R023','attackCard',null,(e,c)=>c.flags.R023&&e.owner!==c.flags.R023,(e,c)=>{add(e,.1);delete c.flags.R023});
 register('R024','beforeIncoming','battle',e=>e.raw>=150,e=>{e.reduction=(e.reduction||0)+50});
 register('R025','block','turn',e=>e.blocked>0&&target(e),(e,c)=>c.hit(e.target,50,'physical',true));
 register('R026','lowHp','battle',e=>e.actor.hp>0&&e.actor.hp/e.actor.max<.35,(e,c)=>c.shield(e.actor,80));
 register('R027','counter',null,e=>e.target.armorBroken,(e)=>{e.extra=(e.extra||0)+40});
 register('R028','beforeIncoming','turn',e=>e.dot&&e.amount>0,e=>{e.reduction=(e.reduction||0)+Math.min(60,Math.floor(e.amount*.25))});
 register('R029','shieldGiven',null,(e,c)=>{if(!e.owner||e.owner==='common')return false;const owners=c.turn.R029??=[];if(!owners.includes(e.owner))owners.push(e.owner);return owners.length>=2&&c.once('R029','turn')},(e,c)=>c.shield(c.lowest(),40));
 register('R030','block','battle',e=>e.blocked>0&&e.special&&e.elite,(e,c)=>{e.target.curioNextSpecialScale=.8;c.hit(e.target,80,'physical',true)});
 register('R031','environmentPenalty','battle',()=>true,e=>{e.scale=(e.scale??1)*.75});
 register('R032','damage','turn',e=>e.damageType==='arts'&&e.anomalyCount>0,(e,c)=>c.hit(e.target,30,'arts'));
 register('R033','status','battle',e=>e.dot,(e,c)=>c.armor(e.target,20,2,'R033'));
 register('R034','damage',null,(e,c)=>{if(e.damageType!=='arts'||!e.owner||e.owner==='common')return false;const map=c.turn.R034??={},owners=map[e.target.id]??=[];if(!owners.includes(e.owner))owners.push(e.owner);return owners.length>=2&&c.once('R034','turn')},(e,c)=>c.hit(e.target,40,'arts'));
 register('R035','status','battle',e=>e.control,(e)=>{e.target.curioNextAttackScale=.9});
 register('R036','beforeDot','turn',()=>true,e=>{e.amount+=20});
 register('R037','beforeIncoming','battle',e=>e.direct&&!!e.target?.status,e=>{e.reduction=(e.reduction||0)+40});
 register('R038','dispel','battle',e=>e.removed>0,(e,c)=>c.hit(e.target,50,'arts'));register('R038','break','battle',e=>!!e.target,(e,c)=>c.hit(e.target,50,'arts'));
 register('R039','attackCard','turn',e=>e.targets.some(x=>x.negativeCount>=2),e=>add(e,.15));
 register('R040','break','battle',e=>e.interrupt,(e,c)=>c.draw(2));register('R040','acquire','run',()=>true,(e,c)=>c.environment(1));
 register('R041','lowHp','battle',e=>e.actor.hp>0&&e.actor.hp/e.actor.max<.3,(e,c)=>c.shield(e.actor,60));
 register('R042','beforeHeal','turn',e=>e.direct,e=>{e.amount+=20});
 register('R043','beforeIncoming','battle',e=>e.direct,e=>{e.reduction=(e.reduction||0)+30});
 register('R044','cleanse','battle',e=>e.removed>0,(e,c)=>c.heal(e.actor,40));
 register('R045','battleEnd','battle',e=>e.won&&e.noDowned,(e,c)=>c.heal(c.lowest(),50));
 register('R046','afterDot','battle',e=>e.damage>0,(e,c)=>{c.cleanseLayer(e.actor,e.status);c.heal(e.actor,30)});
 register('R047','heal','turn',e=>e.overflow>0,(e,c)=>c.shield(e.actor,Math.min(50,e.overflow)));
 register('R048','supportEffect',null,(e,c)=>{if(!e.owner||e.owner==='common')return false;if(!c.turn.R048){c.turn.R048=e.owner;return false}return c.turn.R048!==e.owner&&c.once('R048','turn')},e=>add(e,.1));
 register('R049','campHeal',null,()=>true,(e,c)=>{for(const actor of c.team.filter(a=>a.hp>0))c.heal(actor,Math.ceil(actor.max*.03),{silent:true})});
 register('R050','lethal','battle',e=>e.protectable&&!e.otherSaveUsed,(e,c)=>{e.saved=true;e.actor.hp=10;c.shield(e.actor,50);c.flags.sharedLethalSave=true});
 register('R051','floorStart',null,e=>e.canExtract,(e,c)=>{c.revealExit();c.revealNodes(1)});
 register('R052','floorStart','floor',()=>true,(e,c)=>c.revealNodes(1));
 register('R053','search','floor',e=>e.committed,(e,c)=>c.probeLoot());
 register('R054','identify','floor',e=>e.unknown,(e,c)=>c.identify(e.item));
 register('R055','specialIntel','run',()=>true,(e,c)=>c.revealNodes(1,true));
 register('R056','acquire','run',()=>true,(e,c)=>c.addSpace(1,2));
 register('R057','environmentMove','floor',e=>e.amount>0&&!e.fixed,e=>{e.amount=Math.max(0,e.amount-1)});
 register('R058','merchant',null,()=>true,(e,c)=>c.revealTrade());
 register('R059','eliteLoot',null,()=>true,e=>{e.valueScale=(e.valueScale??1)*1.1});register('R059','beforeSpecial',null,e=>e.elite,e=>{e.scale=(e.scale??1)*1.1});
 register('R060','specialExitReady','run',()=>true,(e,c)=>{c.s.routes.preview=true;c.previewExit()});register('R060','continueAfterExit',null,(e,c)=>c.s.routes.preview&&!c.s.routes.bonusUsed,(e,c)=>{c.s.routes.declined=true});register('R060','intel',null,(e,c)=>c.s.routes.declined&&!c.s.routes.bonusUsed,(e,c)=>{c.s.routes.bonusUsed=true;c.curioChoice()});
 function resonance(s,e,c){const n=counts(s),use=(family,level)=>(family===5||c.inBattle!==false)&&n[family]>=level&&once(s,'resonance:'+family+':'+level,family===5?(level===3?'floor':'run'):'battle');
  if(e.type==='pursuit'&&use(0,3))e.extra=(e.extra||0)+30;
  if(e.type==='break'&&n[0]>=6&&once(s,'resonance:chase:ready','battle'))c.flags.resonancePursuit=true;
  if(e.type==='pursuit'&&c.flags.resonancePursuit){add(e,.2);delete c.flags.resonancePursuit}
  if(e.type==='activeDiscard'){if(use(1,3))c.draw(1);c.flags.discardCount=(c.flags.discardCount||0)+1;if(c.flags.discardCount>=3&&use(1,6))c.choose('retain',1)}
  if(e.type==='block'){if(use(2,3))c.shield(e.actor,40);if(e.special&&e.elite&&use(2,6))c.hit(e.target,60,'physical',true)}
  if(e.type==='status'&&e.anomalyCount>=2){if(use(3,3))c.hit(e.target,20,'true');if(e.reaction&&use(3,6))c.draw(1)}
  if(e.type==='heal'&&e.effective>0&&use(4,3))c.heal(e.actor,30);
  if(e.type==='cleanse'&&e.removed>0&&use(4,6))c.shield(e.actor,50);
  if(e.type==='floorStart'&&use(5,3))c.revealNodes(1);
  if(e.type==='intel'&&use(5,6))c.revealNodes(1,true);
 }
 function diminish(value){return Math.min(.3,value)+Math.min(.2,Math.max(0,value-.3))*.5+Math.max(0,value-.5)*.25}
 return{registerOriginal:(...args)=>register(...args.slice(0,5),args[5]||'',137),initial,active,counts,activate,gain,valid,dispatch,implemented,once,diminish};
})();
