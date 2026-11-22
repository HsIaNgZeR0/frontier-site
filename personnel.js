'use strict';
window.FrontierPersonnel=(()=>{
 const HOUR=3600000;
 function ensure(){
  if(!db.personnel){db.personnel={version:1,next:1,units:{},lost:[],potential:{},observed:{},rescueProgress:0};for(const[id,u]of Object.entries(db.world.roster)){if(FrontierCapture.units[id]?.kind!=='operator')continue;db.personnel.units[id]={uid:'operator:'+db.personnel.next++,id,status:'ready',recoverAt:0};db.personnel.potential[id]=1;db.personnel.observed[id]=u.copies}}
  const p=db.personnel;
  for(const[id,u]of Object.entries(db.world.roster)){if(FrontierCapture.units[id]?.kind!=='operator')continue;const n=p.observed[id]||0;if(u.copies>n&&!p.units[id]){p.units[id]={uid:'operator:'+p.next++,id,status:'ready',recoverAt:0};u.level=1;p.potential[id]??=1}p.observed[id]=u.copies}
  for(const u of Object.values(p.units))if(!db.base151&&u.status!=='ready'&&u.recoverAt&&Date.now()>=u.recoverAt){u.status='ready';u.recoverAt=0}
  return p;
 }
 function treatmentHours(id){return ({3:12,4:24,5:36,6:48})[FrontierCapture.units[id]?.rarity]||12}
 function admit(){return false}
 function accelerate(){return false}
 function canDeploy(id){
  const definition=FrontierCapture.units[id];
  if(definition?.retired)return false;
  if(definition?.kind==='enemy')return !!db.world.roster[id];
  return !!ensure().units[id];
 }
 const available=canDeploy;
 const oldStart=startRun;startRun=function(){ensure();const previous=R();oldStart();const r=R();if(r&&r!==previous&&r.team){r.lifeVersion=1;r.lifeSettled=false;r.mentalLoad=0;for(const a of r.team){const u=db.personnel.units[a.id];a.instanceId=u?.uid||null;a.borrowed=!canDeploy(a.id);a.rescued=false;if(a.borrowed){a.label={amiya:'後勤術師',beagle:'後勤重裝',hibiscus:'後勤醫療',char_123_fang:'後勤先鋒',char_124_kroos:'後勤狙擊'}[a.id];a.max=Math.floor(FrontierCombat.operators[a.id].hp*.8);a.hp=a.max;a.def=Math.floor(a.def*.75)}}r.hp=r.max=r.teamTotal=r.team.reduce((n,a)=>n+a.hp,0);render()}};
 function revive(id,restoreHand=false){const r=R(),a=r?.team?.find(x=>x.id===id&&x.hp<=0);if(!a||a.rescueTimer===0)return false;a.hp=Math.max(1,Math.ceil(a.max*.25));a.downed=false;a.rescued=true;const b=r.battle;if(b?.downedCards){const own=b.downedCards.filter(x=>cards[x.card.id].owner===id&&x.pile!=='exhaust'&&!cards[x.card.id].exhaust),fallback=restoreHand&&!own.some(x=>x.pile==='hand')?own[0]:null,keep=[];for(const entry of b.downedCards){if(cards[entry.card.id].owner===id){const hand=restoreHand&&entry.pile!=='exhaust'&&!cards[entry.card.id].exhaust&&(entry.pile==='hand'||entry===fallback);b[hand?'hand':entry.pile==='exhaust'?'exhaust':'discard'].push(entry.card);}else keep.push(entry)}b.downedCards=keep}FrontierCombat.sync();return true}
 function rescue(id){const r=R(),b=r?.battle;if(!r?.team||!r.medkit||b&&(b.energy<2||Math.max(b.rescues||0,b.medRevives||0)>=(r.team.length===5?2:1))){toast('救援需要急救包；戰鬥中另需2能量，每戰限一次。');return}if(!revive(id))return;r.medkit=false;if(b){b.energy-=2;b.rescues=(b.rescues||0)+1;b.medRevives=b.rescues}else r.alarm++;save();render()}
 const oldAssign=window.assignUnit;window.assignUnit=function(id,slot){if(!available(id)){toast('這名幹員已失去、重傷或失聯，暫不能派駐。');return}oldAssign(id,slot)};
 const oldTrain=window.trainUnit;window.trainUnit=function(id){if(!available(id)){toast('這名幹員目前不能培育。');return}oldTrain(id)};
 const oldSkill=FrontierCombat.skill;FrontierCombat.skill=function(id){const r=R();if(id==='amiya'&&(r?.mentalLoad||0)>=3){toast('精神負荷已達3，超限技暫時封印。');return}const battle=r?.battle,before=battle?.energy;oldSkill(id);if(id==='amiya'&&battle&&battle.energy<before){r.mentalLoad=Math.min(3,(r.mentalLoad||0)+1);save();render()}};
 const oldBattle=battleView;battleView=function(){oldBattle();const r=R();if(!r?.team)return;for(const a of r.team){if(!a.borrowed)continue;const card=[...document.querySelectorAll('.team-actor')][r.team.indexOf(a)];if(card?.querySelector('b'))card.querySelector('b').textContent=a.label+'（臨時）'}const down=r.team.filter(a=>a.hp<=0);if(down.length){const p=document.createElement('section');p.className='panel';p.innerHTML='<h3>緊急救援</h3><p class="tiny muted">急救包＋2能量，救援共用戰鬥次數。</p>'+down.map(a=>`<button onclick="FrontierPersonnel.rescue('${a.id}')">救援 ${esc(a.label||FrontierCapture.units[a.id].name)}</button>`).join('');document.querySelector('.card-battle').appendChild(p)}};
 function careView(){return ''}
 const priorValid=validSave;validSave=function(v){if(!priorValid(v)||!FrontierDutyRulesV17.valid(v))return false;const p=v.personnel;if(!p)return true;if(p.version!==1||!Number.isInteger(p.next)||p.next<1||!p.units||!Array.isArray(p.lost)||!p.potential||!p.observed||!Number.isInteger(p.rescueProgress)||p.rescueProgress<0)return false;return Object.entries(p.units).every(([id,u])=>FrontierCapture.units[id]?.kind==='operator'&&u.id===id&&typeof u.uid==='string'&&['ready','injured','missing'].includes(u.status)&&Number.isFinite(u.recoverAt)&&u.recoverAt>=0)&&p.lost.every(u=>u.id!=='amiya'&&typeof u.uid==='string')};
 ensure();
 return{ensure,available,canDeploy,revive,rescue,careView,admit,accelerate,treatmentHours};
})();
