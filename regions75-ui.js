'use strict';
(()=>{
 const X=FrontierRegional75,T=FrontierEnemyTactics,G=FrontierOperatorGameV113;
 const oldStart=startRun;startRun=function(...args){const before=R(),result=oldStart(...args);if(R()&&R()!==before){R().enemyExpansion75=75;save();}return result};
 const oldBattle=startBattle;startBattle=function(...args){const result=oldBattle(...args);if(T.start(R())||X.start(R())){G.plan();save();render();}return result};
 const start=T.start;T.start=function(r){const changed=start(r);X.start(r);return changed};
 const lossLimit=T.limitLoss;T.limitLoss=(e,n)=>e.device75||R()?.battle&&X.blocked(R().battle,e)?0:lossLimit(e,n);
 const damage=T.beforeDamage;T.beforeDamage=(e,s,n,type)=>X.beforeDamage(s,e,damage(e,s,n,type),type,s.team?.find(a=>a.uid===s.operatorCardHook?.owner));
 function native(e,s,fn){const p=T.bosses[e.species]?.[1];if(!e.mechanic75||!p)return fn();const saved={...p},k=s.region75?.kind;if(k==='duet'){delete p.attack;delete p.rally;}if(['dolly','bloodknight'].includes(k))delete p.recover;if(k==='mouse')delete p.status;if(k==='saint'){p.damage='physical';delete p.status;}try{return fn()}finally{for(const key of Object.keys(p))delete p[key];Object.assign(p,saved);}}
 const after=T.afterDamage;T.afterDamage=(e,s,n,type,a)=>{if(!s.team)s={...s,team:R()?.team||[],events:s.operatorEvents||[],phase:s.operatorPhase};native(e,s,()=>after(e,s,n));const hit=s.events?.findLast(v=>v.type==='directCardDamage'&&v.target===e.uid);X.afterDamage(s,e,n,type||hit?.damageType,a||s.team?.find(a=>a.uid===hit?.source))};
 const enemy=T.beforeEnemy;T.beforeEnemy=(e,s)=>X.beforeEnemy(s,e)&&native(e,s,()=>enemy(e,s));
 const round=T.afterRound;T.afterRound=s=>{round(s);X.afterRound(s)};
 const detail=T.detail;T.detail=e=>[R()?.battle?X.detail(R().battle,e):'',e.mechanic75&&['manfred','dolly','bloodknight','duet','mouse','saint','harold','soul'].includes(R()?.battle?.region75?.kind)?'':detail(e)].filter(Boolean).join('\n');
 const select=FrontierRegionalEnemies.select;FrontierRegionalEnemies.select=function(region,type,i,path,pick,mid){if(region==='sami'&&path==='exchange'&&!R()?.enemyExpansion75)return{id:'enemy_2056_smedzi',trait:'neural'};return select(region,type,i,path,pick,mid)};
 const target=FrontierRegionalEnemies.target;FrontierRegionalEnemies.target=(e,team)=>X.target({...R().battle,events:R().battle.operatorEvents||[]},e,team)||target(e,team);
 const action=FrontierRegionalEnemies.action;FrontierRegionalEnemies.action=(e,a,s,n,special)=>{const old=action(e,a,s,n,special),next=X.incoming(s,e,a,old.raw,special);return{...old,...next,splash:next.hits75?0:next.splash||old.splash}};
 const priorCheck=checkBattle;checkBattle=function(){const r=R();if(r?.battle){const s={...r.battle,team:r.team,events:r.battle.operatorEvents||[]};X.collect(s);X.cleanup(s);}return priorCheck()};
 const priorSolve=FrontierBreaks.solve;FrontierBreaks.solve=function(e,...args){const result=priorSolve(e,...args);if(R()?.battle){const s={...R().battle,team:R().team,events:R().battle.operatorEvents||[]};X.breakEffect(s,e);}return result};
 function use(mode){const s=G.snapshot();X.use(s,mode);G.apply(s);if(mode!=='cannon'||!checkBattle())G.plan();save();render();}
 function planArtifact(r,layer=r.expedition.layer,start=r.expedition.row){const e=r.expedition,rows=[];for(let l=layer;l<5;l++)for(let row=l===layer?start+1:0;row<e.layers[l].rows.length;row++){if(r.endingRoute.slots[l]===row||r.endingRoute.exchangeSlots[l]===row)continue;const nodes=e.layers[l].rows[row];if(nodes.every(n=>n.type==='camp')||nodes.some(n=>n.requiredCombat||n.escortGoal||n.recruitOperator||n.onboardingRescue||n.passage16||n.endingMarket75||['boss','signal'].includes(n.type)))continue;rows.push({layer:l,row});}return rows.slice(0,2);}
 function marketStory(){
  const r=R(),exp=r?.expedition;
  const node=exp?.layers[exp.layer].rows[exp.row]?.find(n=>n.id===exp.current);
  if(r?.event?.type!=='fieldMerchant'||!node?.endingMarket75||!node.storyEvent&&!node.endingMarketCamp)return;
  r.event=node.endingMarketCamp?{type:'camp'}:{type:'frontierEvent',id:node.storyEvent,claimed:false};save();render();
 }
 function keyAvailability(r){
  const s=r?.endingRoute;
  if(!s||typeof s.thirdEndingLead!=='boolean')return '';
  const phase=s.branches.exchange.phase;
  const {layer,row}=r.expedition;
  if(phase==='open'&&(layer<1||layer===1&&row<=s.exchangeSlots[1]))return '先完成失與得的結局選擇。';
  if(!s.thirdEndingLead&&['seeking','fighting','ready'].includes(phase))return '本趟行商沒有可與三結局並行的線索。';
  return '';
 }
 function buyKey(){const r=R(),e=r?.event;if(e?.type!=='fieldMerchant'||e.endingKey75Bought)throw Error('此行商沒有可購買的結局線索');if(keyAvailability(r))throw Error(keyAvailability(r));if(r.fieldPoints<18)throw Error('需要18源石碇');const slots=planArtifact(r);if(slots.length<2)throw Error('剩餘路線不足以完成調查');const b=r.endingRoute.branches.fourth;if(b&&b.phase!=='open')throw Error('已選擇此路線');r.fieldPoints-=18;e.endingKey75Bought=true;r.endingRoute.branches.fourth={phase:'seeking',stage:0,slots};r.endingRoute.artifact75=FrontierRegionDesign75.regions[r.expedition.regionId].key;FrontierAdventure.note('ending_key:fourth','購入「'+r.endingRoute.artifact75+'」，接續兩個調查節點後開啟第四結局；不放棄既有路線。');save();render();}
 function status(b,m){if(m.kind==='bloodknight')return (m.reviveUntil>=b.turn?'復甦中 · 無敵':'形態 '+m.phase+'/2')+' · 血刃 '+b.enemies.filter(e=>e.bloodblade75&&e.hp>0).length;if(m.kind==='manfred')return (m.openUntil>=b.turn?'閃避關閉':'物法閃避 80%')+' · 充能 '+X.cannonCharge(b)+'/2';const alive=b.enemies.filter(e=>e.hp>0);if(m.kind==='sami')return (m.openUntil>=b.turn?'暴露至第'+m.openUntil+'回合':'無敵')+'／充能 '+m.charge+'/6';if(m.kind==='dukare')return (m.throneBroken?'王座已毀':'王座完好')+' · '+(m.throneBroken&&m.openUntil<b.turn?'庇護中':'可輸出');if(m.kind==='soul')return '生命 '+m.phase+'/2 · 門扉 '+alive.filter(e=>e.extra75==='portal').length;if(m.kind==='quilon')return '尼盧火 '+(b.friendly75||[]).length+' · 蓮座 '+alive.filter(e=>e.extra75==='lotus').length;if(m.kind==='dolly')return '絨毛 '+m.fleece+'/4';if(m.kind==='carnival')return '本輪 玩家 '+m.playerScore+'：首領 '+m.bossScore;if(m.kind==='crystals')return '結晶 '+alive.filter(e=>e.extra75==='crystal').length;if(m.kind==='sargon')return '沙盾 '+m.shield+'/3';if(m.kind==='siracusa')return '血債 '+m.debt+'/3';if(m.kind==='victoria')return ['開砲','裝填','瞄準'][b.turn%3];if(m.kind==='columbia')return ['修復回路','屏障回路','火力回路'][b.turn%3];if(m.kind==='iberia')return b.turn%2?'漲潮':'退潮';if(['chernobog','siesta','lungmen'].includes(m.kind))return '壓力 '+m.pressure+'/3';if(['harold','kjerag'].includes(m.kind)){const d=alive.filter(e=>e.device75);return '暖爐 '+d.filter(e=>e.device75.litUntil>=b.turn).length+'/'+d.length+(m.kind==='harold'?' · 生命 '+m.phase+'/2':'');}return '第 '+b.turn+' 回合';}
 window.FrontierRegionStatus75=status;
 function mount(){const r=R(),b=r?.battle;if(page!=='run')return;const host=document.querySelector('.screen-workspace-body')||document.querySelector('#app');if(b?.region75?.bossUid&&!host.querySelector('.region75-panel')){const m=b.region75,d=FrontierRegionDesign75.regions[m.region],section=document.createElement('section');section.className='region75-panel panel';const active=m.openUntil>=b.turn,device=b.enemies.find(e=>e.device75&&e.hp>0);section.innerHTML='<details><summary>'+esc((m.kind==='manfred'?'倫蒂尼姆城防炮':device?.name)||(m.kind==='quilon'?'尼盧火':m.kind==='soul'?'幽影門扉':X.notices[m.kind]?d?.device:'首領機制'))+' · '+esc(status(b,m))+'</summary><p>'+esc(X.detail({...b,turn:b.turn},b.enemies.find(e=>e.uid===m.bossUid)))+'</p></details>';section.querySelector('p').style.whiteSpace='pre-line';
   if(b.friendly75?.length){const fires=document.createElement('p');fires.textContent=b.friendly75.filter(a=>!a.exited).map(a=>'尼盧火 '+a.hp+'/'+a.max+' · 第'+a.expires75+'回合到期').join(' ／ ')+'：拖曳治療牌到火焰頭像即可治滿消除。';section.append(fires);}const button=(text,mode,disabled)=>{const x=document.createElement('button');x.textContent=text;x.disabled=disabled;x.addEventListener('click',()=>FrontierRuntime.perform('region75-device',()=>use(mode)));section.append(x)};
   if(m.kind==='sami'){button('短啟 · 3能量','short',active||m.charge<3);button('穩啟 · 6能量','long',active||m.charge<6);button('校準 · 1 AP','calibrate',m.charge>=6||m.calibratedTurn===b.turn||b.energy<1);}else if(m.kind==='manfred')button('城防炮開火 · 1 AP','cannon',X.cannonCharge(b)<2||b.energy<1);else if(!device&&FrontierRegional75.notices[m.kind])button('操作裝置 · 1 AP','use',m.usedTurn===b.turn||b.energy<1);
   const board=host.querySelector('.v113-battle-board')||host.querySelector('.battle-board'),lane=board?.querySelector('.v113-status-lane');
   if(lane){
    // Mechanism descriptions remain on enemy long-press. Only actionable apparatus get an overlay.
    const buttons=[...section.querySelectorAll('button')];
    if(buttons.length){
     section.classList.add('v133-apparatus');
     const details=section.querySelector('details'),summary=details.querySelector('summary'),contents=document.createElement('div');
     summary.setAttribute('aria-label','戰場裝置操作 · '+status(b,m));summary.title='戰場裝置操作';
     summary.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6v5l5 3v5l-5 3v2H9v-2l-5-3v-5l5-3z"/><path d="M12 8v8M8 12h8"/></svg>';
     contents.className='region75-battle-info';contents.append(...buttons);details.append(contents);section.querySelectorAll('p').forEach(p=>p.remove());
     (board.querySelector('.enemy-line')||board).append(section);
    }
   }else (board||host).prepend(section);
  }
  if(r?.event?.type==='fieldMerchant'&&!host.querySelector('.region75-market-story')){
   const e=r.expedition,n=e.layers[e.layer].rows[e.row]?.find(x=>x.id===e.current);
   if(n?.endingMarket75&&(n.storyEvent||n.endingMarketCamp))host.querySelector('.store-leave')?.insertAdjacentHTML('beforebegin','<button class="region75-market-story" onclick="FrontierRegionsUI75.marketStory()">'+(n.endingMarketCamp?'離開商隊，在此休整':'離開商隊，查看原區域事件')+'</button>');
  }
  if(r?.event?.type==='fieldMerchant'&&r.endingRoute?.version===2&&!host.querySelector('.region75-key')&&host.querySelector('.field-store .store-grid')){const branch=r.endingRoute.branches.fourth,slots=planArtifact(r);if(!branch||branch.phase==='open'){const d=FrontierRegionDesign75.regions[r.expedition.regionId],box=document.createElement('article');box.className='region75-key store-card';box.dataset.fieldProduct='ending-key75';box.innerHTML='<div class="store-picture" oncontextmenu="return false" data-battle-status="'+esc('接續兩個獨立調查節點「'+d.event+'」。是否可與三結局並行，依本趟線索決定。')+'"><img src="assets/regions/'+esc(({chernobog:'ursus',kazdel:'babel'})[r.expedition.regionId]||r.expedition.regionId)+'.png" alt=""></div><b>'+esc(d.key)+'</b><small>18 源石碇 · 結局線索</small>';const button=document.createElement('button');button.textContent='購入劇情藏品';const unavailable=keyAvailability(r);button.disabled=!!unavailable||r.fieldPoints<18||slots.length<2;if(unavailable){const note=document.createElement('small');note.textContent=unavailable;box.append(note);}else if(slots.length<2){const note=document.createElement('p');note.textContent='剩餘路線不足兩個調查節點，請在前段行商提早購入。';box.append(note);}button.addEventListener('click',()=>FrontierRuntime.perform('region75-buy-key',buyKey));box.append(button);host.querySelector('.field-store .store-grid').append(box);}}
  for(const card of host.querySelectorAll('.enemy-card[data-enemy-id]')){const e=b?.enemies.find(e=>e.id===card.dataset.enemyId);if(!e)continue;if(e.device75||e.extra75||e.bloodblade75){const image=card.querySelector('.enemy-figure img');if(image)image.src='assets/battle-'+(e.extra75||(e.bloodblade75?'bloodblade':'device'))+'75.svg';}if(e.device75){card.classList.add('region75-device');card.setAttribute('aria-label',X.detail({...b},e));let tag=card.querySelector('.region75-charge');if(!tag){tag=card.querySelector('.v113-enemy-vital');if(tag)tag.classList.add('region75-charge')}if(tag){const fill=tag.firstElementChild,value=tag.lastElementChild,active=e.device75.litUntil>=b.turn;if(fill){fill.style.width=(active?100:100*e.device75.charge/e.device75.threshold)+'%';fill.style.background='#4baecc';}if(value)value.textContent=active?'啟動至第'+e.device75.litUntil+'回合':(e.device75.kind==='dukare'?'推進 ':'充能 ')+e.device75.charge+'/'+e.device75.threshold;}}if(X.blocked({...b},e))card.dataset.region75Invulnerable='true';}
 }
 const priorRender=render;render=function(...args){const result=priorRender(...args);mount();return result};
 const priorIntent=intentText;intentText=function(e){if(e.device75)return '裝置 · 攻擊充能';if(R()?.battle&&X.blocked(R().battle,e)){const k=R().battle.region75.kind;return k==='sami'?'無敵 · 為穩定設施充能':k==='soul'?'無敵 · 擊破幽影門扉':k==='quilon'?'無敵 · 擊破托生蓮座':'隱匿 · 暫不可攻擊';}return priorIntent(e)};
 globalThis.FrontierRegionsUI75={use,buyKey,planArtifact,keyAvailability,marketStory,mount};
})();
