// 貼到瀏覽器執行：建立 qaBoss(species, region, turns)
{const b0=structuredClone(R().battle);delete b0.region75;b0.friendly75=[];b0.turn=1;b0.operatorPhase='player';window.qaSnap={battle:b0,team:structuredClone(R().team.filter(a=>!a.friendly75)),exp:{regionId:R().expedition.regionId}};}
window.qaBoss=async function(species,region,turns=7,opts={}){
 const r=R(),G=FrontierOperatorGameV113,T=FrontierEnemyTactics,U=FrontierEnemyData.units,log=[];const snap0=window.qaSnap;
 r.battle=structuredClone(snap0.battle);r.team=structuredClone(snap0.team);r.expedition.regionId=region||snap0.exp.regionId;delete r.reward;delete r.result;
 const b=r.battle,base=b.enemies[0];const u=U[species];
 b.enemies=[{...structuredClone(base),species,name:u?.name||species,boss:true,elite:false,hp:3000,max:3000,atk:30,regionalTrait:undefined}];delete b.region75;
 FrontierRegional75.start(r);try{G.plan()}catch(e){}render();
 const look=()=>{const B=R().battle;return{t:B?.turn,k:B?.region75?.kind,en:(B?.enemies||[]).filter(e=>e.hp>0&&!e.exited).map(e=>{const card=document.querySelector('.enemy-card[data-enemy-id="'+e.id+'"]');return e.name+'|'+['extra75','device75','bloodblade75','summoned75'].filter(k=>e[k]).map(k=>k+(typeof e[k]==='string'?'='+e[k]:'')).join(',')+'|'+e.hp+'/'+e.max+'|'+(card?card.innerText.replace(/\s+/g,' ').slice(0,90):'NOCARD')}),fr:(B?.friendly75||[]).filter(f=>!f.exited&&f.hp>0).map(f=>f.hp+'/'+f.max)}};
 log.push(look());
 for(let t=0;t<turns&&R().battle&&!R().result;t++){const B=R().battle;
  const bb=B.enemies.find(e=>e.uid===B.region75?.bossUid)||B.enemies.find(e=>e.boss);
  if(bb&&bb.hp>0){const n=opts.kill&&t===opts.kill?bb.hp:Math.min(bb.hp-1,Math.floor(bb.max*.11));bb.hp-=n;try{T.afterDamage(bb,B,n,'true',R().team[0])}catch(e){log.push('DMGERR '+String(e).slice(0,80))}}
  for(const a of R().team)if(!a.friendly75)a.hp=a.max||a.hp;
  try{endTurn();await new Promise(q=>setTimeout(q,20));const ph=G.snapshot().phase;if(ph==='retain')G.retain([]);else if(ph==='enemy')G.enemyPhase()}catch(e){log.push('ERR '+String(e).slice(0,100));break}
  for(const a of R().team||[])if(!a.friendly75)a.hp=a.max||a.hp;
  await new Promise(q=>setTimeout(q,20));render();log.push(look())}
 return log};
'ok'
