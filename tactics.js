'use strict';
window.FrontierTactics=(()=>{
 for(const[id,d]of Object.entries(FrontierOperatorData.units))if(!defs.some(x=>x.id===id))defs.push({id,name:d.name,role:d.role,icon:'◆',hp:FrontierCombat.operators[id].hp,atk:FrontierCombat.operators[id].atk,range:2,skill:FrontierCombat.operators[id].skill,detail:'個人卡組與專屬技能'})
 const fallback=['amiya','char_210_stward','hibiscus','char_123_fang','char_124_kroos'];function ensure(){if(!db.squad)db.squad=[...fallback];if(!db.fiveMemberFormation&&(!R()||R().result)){for(const id of [...Object.keys(db.personnel.units),...fallback])if(!FrontierCapture.units[id]?.retired&&db.squad.length<5&&!db.squad.includes(id)&&(FrontierPersonnel.canDeploy(id)||fallback.includes(id)))db.squad.push(id);db.fiveMemberFormation=true}return db.squad}
 function choose(id){if(R()&&!R().result)return;const squad=ensure();if(squad.includes(id)){if(squad.length===1)return;db.squad=squad.filter(x=>x!==id);save();render();return}if(FrontierCapture.units[id]?.retired||!FrontierCombat.operators[id]||!FrontierPersonnel.canDeploy(id)&&!fallback.includes(id))return;if(squad.length<5)squad.push(id);else{toast('先撤下一名幹員，再選擇替換人員。');return}save();render()}
 function effect(id){const r=R(),b=r.battle,a=r.team.find(x=>x.id===id),d=FrontierCombat.operators[id],alive=b.enemies.filter(e=>e.hp>0),target=alive.sort((x,y)=>y.hp-x.hp)[0],n=d.magnitude,hit=(e,raw=n,type=d.type)=>FrontierCombat.hitEnemy(e,raw,id,type);switch(d.skillEffect){
 case'rally':r.team.filter(x=>x.hp>0).forEach(x=>x.block+=n);break;
 case'double':case'triple':for(let i=0;i<(d.skillEffect==='double'?2:3);i++){const e=b.enemies.find(x=>x.hp>0);if(e)hit(e)}break;
 case'power':a.power+=n;break;
 case'pierce':if(target){const old=target.def;target.def=0;hit(target);target.def=old}break;
 case'supply':FrontierCombat.heal(n,undefined,id);a.block+=4;break;
 case'shell':a.block+=n;a.taunt=2;break;
 case'regen':r.team.filter(x=>x.hp>0).forEach(x=>FrontierCombat.heal(n,x.id,id));break;
 case'drone':if(target){hit(target);target.poison+=2}break;
 case'drain':if(target)hit(target);FrontierCombat.heal(5,a.id,id);break;
 case'gravel':a.block+=n;a.taunt=1;break;
 case'spores':for(const e of alive){hit(e);e.poison+=2}FrontierCombat.heal(3,undefined,id);break;
 case'bind':for(const e of alive){hit(e);e.intent='defend';window.FrontierCurios?.control(e,'bind')}break;
 case'slow':for(const e of alive){hit(e);e.atk=Math.max(1,e.atk-1)}break;
 case'swordrain':for(const e of alive){hit(e,8,'arts');if(!e.boss)e.intent='defend';window.FrontierCurios?.control(e,'stun')}break;
 case'silence':if(target){hit(target);target.status=null;target.intent='defend';window.FrontierCurios?.control(target,'silence')}break;
 case'charge':a.block+=n;a.thorns=4;break;
 case'cleanse':for(const x of r.team.filter(x=>x.hp>0)){FrontierCombat.heal(n,x.id,id);if(window.FrontierMedicine?.cleanse)FrontierMedicine.cleanse(x,99);else x.status={}}break;
 case'toxin':for(const e of alive){hit(e);e.poison+=4}break;
 case'silverash':for(const e of alive)hit(e);a.block=0;break;
 case'calcify':for(const x of r.team.filter(x=>x.hp>0)){FrontierCombat.heal(n,x.id,id);x.block+=3}for(const e of alive)e.vuln+=1;break;
 }FrontierCombat.plan()}
 function view(){ensure();return `<section class="panel"><h3>五人出戰小隊 · ${db.squad.length}/5</h3><p class="tiny muted">每人 3 張專屬牌，另可選 0～5 張博士通用牌。基建派駐與外勤派遣皆可同時出戰。缺員可借調初始後勤人員，借調不算永久持有。</p><div class="squad-chosen-strip">${db.squad.map(id=>`<span>${portrait(id)}<b>${FrontierCapture.units[id].name}</b><small>✓ 已選</small></span>`).join('')}</div><div class="staff-palette">${FrontierOperatorData.pool.filter(id=>db.personnel.units[id]||fallback.includes(id)).map(id=>`<button class="${db.squad.includes(id)?'selected':''}" aria-pressed="${db.squad.includes(id)}" onclick="FrontierTactics.choose('${id}')">${portrait(id)}<b>${FrontierCapture.units[id].name}</b><small>${FrontierCapture.units[id].role} · ${FrontierCombat.operators[id].skill}</small><span class="squad-status">${FrontierDutyRulesV17.external(db,db.personnel.units[id]?.uid)?'外派中 · 可出戰':db.squad.includes(id)?'✓ 已編入小隊':'點選加入'}</span></button>`).join('')}</div></section>`}
 const oldPrepare=prepare;prepare=function(){oldPrepare();$('#app').insertAdjacentHTML('afterbegin',view())};
 const oldStart=startRun;startRun=function(){ensure();if(db.squad.length!==5){toast('請先選齊5名幹員。');return}for(const id of db.squad){if(!fallback.includes(id)&&!FrontierPersonnel.canDeploy(id)){toast('選中的幹員目前不能出戰，請調整小隊。');return}}oldStart()};
 const oldValid=validSave;validSave=function(v){return oldValid(v)&&(!v.squad||Array.isArray(v.squad)&&v.squad.length>=1&&v.squad.length<=5&&new Set(v.squad).size===v.squad.length&&v.squad.every(id=>FrontierCombat.operators[id]))};
 ensure();return{ensure,choose,effect,view};
})();
