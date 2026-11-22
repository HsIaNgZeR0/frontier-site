'use strict';
window.FrontierOperatorUIV113=(()=>{
 const G=FrontierOperatorGameV113;let choice=null,retainSelection=new Set();
 // Read all combat geometry before changing styles. Repeated callbacks used to
 // force a full layout between the fan, cue, damage numbers and cast animation.
 const frameJobs134=new Map();let frame134=null;
 function measure134(read,write,key=Symbol()){
  frameJobs134.set(key,{read,write});
  if(frame134!=null)return;
  frame134=requestAnimationFrame(()=>{
   frame134=null;const jobs=[...frameJobs134.values()];frameJobs134.clear();
   const measured=jobs.map(job=>({job,value:job.read()}));
   for(const {job,value}of measured)if(value!==undefined)job.write(value);
  });
 }
 let geometry134=null,geometryObserver134=null;
 const viewport134=()=>{const v=window.visualViewport;return [innerWidth,innerHeight,v?.width,v?.height,v?.offsetTop].join('|')};let viewportKey134=viewport134();
 function geometryKey134(){const b=R()?.battle;return [page,b?.operatorBattleId,viewportKey134,document.documentElement.dataset.battleDensity,R()?.team.map(a=>a.uid).join(','),b?.enemies.map(e=>e.uid).join(',')].join('|')}
 function anchorKey134(node){if(node.matches('.v113-actor-row'))return 'actor:'+node.dataset.operatorUid;if(node.matches('.enemy-card'))return 'enemy:'+node.dataset.enemyId;if(node.matches('.avatar')&&node.closest('.v113-actor-row'))return 'avatar:'+node.closest('.v113-actor-row').dataset.operatorUid;if(node.matches('.hand-caption'))return 'caption';return null;}
 function rect134(node){const key=anchorKey134(node);return key&&geometry134?.key===geometryKey134()&&geometry134.rects.has(key)?geometry134.rects.get(key):node.getBoundingClientRect()}
 function rememberGeometry134(fan){
  const rects=new Map();for(const node of document.querySelectorAll('.v113-actor-row,.v113-actor-row .avatar,.enemy-card[data-enemy-id],.v113-hand-controls .hand-caption')){const key=anchorKey134(node);if(key)rects.set(key,node.getBoundingClientRect())}
  geometry134={key:geometryKey134(),fan,rects};watchHand134(fan);
 }
 function watchHand134(fan){geometryObserver134?.disconnect();
  if(window.ResizeObserver){geometryObserver134=new ResizeObserver(entries=>{const size=entries.find(e=>e.target===fan.hand)?.contentRect;if(size&&(Math.abs(size.width-fan.width)>1||Math.abs(size.height-fan.handHeight)>1)){geometry134=null;relayout()}});geometryObserver134.observe(fan.hand)}
 }
 function cachedFan134(){
  const hand=document.querySelector('.v113-hand');if(!hand)return;
  if(geometry134?.key!==geometryKey134())return measureFan134();
  const g=geometry134.fan,cards=[...hand.querySelectorAll('.play-card:not(.v113-staged-draw)')],n=cards.length,totalAngle=Math.min(g.maxAngle,Math.max(0,n-1)*8*Math.PI/180),half=totalAngle/2;
  const next={...g,hand,cards,n,totalAngle,spread:Math.min(62,2*g.maxX/Math.max(1,n-1)),baseY:Math.max(0,g.usable-g.height-Math.sin(half)*g.w/2-g.curve*(1-Math.cos(half))-8)};if(g.hand!==hand){geometry134.fan=next;watchHand134(next)}return next;
 }
 const button=(text,action,kind='')=>{const el=document.createElement('button');el.type='button';el.className=kind;el.textContent=text;el.addEventListener('click',action);return el};
 const name=a=>FrontierCapture.units[a.id]?.name||a.name||a.uid;

 const resourceNames={
  ammo:['彈藥',5],blastProgress:['爆破進度'],powerStrikeReady:['強力擊準備'],flag:['旗幟',3],goods:['貨款',4],
  swordIntent:['劍意'],emotion:['情緒',6],resolve:['決意',5],empathy:['共感',6],intelligence:['情報',3],
  neural:['神經',4],samples:['樣本',3],leadership:['領導力',3],molten:['熔火',5],heat:['熱量',5],
  stance:['架勢'],gravity:['重力',4],momentum:['動能',4],bloodBattle:['血戰'],flowCharge:['流形充能',5],medicine:['藥效',5],
  blood:['血氣',4],charge:['充能',2],formation:['整隊',1],morale:['士氣',2],night:['夜色',2],
  suitCharge:['護服充能'],tide:['潮汐',4],training:['訓練'],vigor:['活力',3]
 };
 const ammoTotal=a=>a.resources?.ammo||0;
 function ammoEnhancement(actor,def,stage){
  if(actor.operator!=='char_103_angel')return null;
  const type=def?.designId?.split('-').at(-1);
  const held=ammoTotal(actor);
  if(type==='1')return {held,cost:1,available:held>=1};
  if(type==='3'&&['M2','M3A','M3B'].includes(stage))return {held,cost:2,available:held>=2};
  if(type==='4'){const cap=stage==='M3B'?3:2;return {held,cost:Math.min(cap,held),available:held>0}}
  return null;
 }
 const enhanceCosts={
  'JAYE-05':['goods',2], 'SILV-04':['leadership',1,true], 'SURT-04':['molten',1],
  'EYJA-02':['heat',1,true], 'EYJA-04':['heat',2], 'HOSH-05':['stance',2,true], 'SKAD-04':['tide',2,true]
 };
 function resourceEnhancement(actor,def,stage){
  const ammo=ammoEnhancement(actor,def,stage);
  if(ammo)return {...ammo,label:resourceNames.ammo[0]};
  const entry=enhanceCosts[def?.designId]||enhanceCosts[def?.id];
  if(!entry)return null;
  const [key,cost,requiresM2]=entry;
  if(requiresM2&&!['M2','M3A','M3B'].includes(stage))return null;
  const held=actor.resources?.[key]||0;
  return {held,cost,available:held>=cost,label:resourceNames[key][0]};
 }
 function attackOptions(card){
  const def=G.effects.definitions.get(card?.id),actor=def&&R()?.team.find(a=>a.operator===def.owner&&a.form===def.form);
  if(!actor)return null;
  const enhancement=resourceEnhancement(actor,def,G.mastery(actor,card));
  return enhancement?.available?enhancement:null;
 }
 function mechanicEntries(actor,battle,includeSignature=true){
  const rule=G.rules[actor.operator]?.[actor.form],resources={...actor.resources};
  if(actor.operator==='char_103_angel')resources.ammo??=0;
  if(includeSignature&&rule?.resource)resources[rule.resource]??=0;
  if(!includeSignature&&rule?.resource)delete resources[rule.resource];
  const entries=Object.entries(resources).filter(([key,value])=>resourceNames[key]&&Number.isFinite(value)).map(([key,value])=>{
   const [label,cap]=resourceNames[key],maximum=key==='suitCharge'?[3,4,5][actor.elite||0]:(key===rule?.resource?rule.resourceCap:undefined)??cap;
   const count=value+(maximum?'/'+maximum:'');
   const summary=(key==='ammo'?'彈':label)+' '+count;
   const detail=key==='ammo'?'彈藥 '+count+'。同回合不同的專屬攻擊牌可補充，每回合最多 '+(actor.elite?2:1)+' 發。裝填也能補充。部分卡牌可選擇消耗彈藥強化，過載模式另外充能。':label+' '+count;
   return {key,summary,detail,value,maximum};
  });
  if(actor.flow){
   const {hp,max,damageType}=actor.flow;
   const status=hp>0?'流形 '+hp+'/'+max:'流形重建中';
   entries.push({key:'flow',summary:status,detail:hp>0?status+' HP，傷害類型 '+({physical:'物理',arts:'法術',true:'真實'}[damageType]||'依模板')+'。':status+(actor.flowRebuildAt?'，第 '+actor.flowRebuildAt+' 回合起可重建。':'。')});
  }
  if(actor.fastDeployReady49===battle?.turn&&actor.operator==='texas_the_omertosa')entries.push({key:'fastDeploy',summary:'急襲就緒',detail:'瞬身急襲已加入手牌，本回合結束時移除。'});
  if(actor.embers?.active)entries.push({key:'embers',summary:'餘燼生效',detail:'餘燼生效，免疫傷害及治療。'});
  // Keep ammo and temporary forms visible ahead of secondary counters.
  const primary=['ammo','embers','fastDeploy','flow'];
  return entries.sort((x,y)=>(primary.includes(x.key)?primary.indexOf(x.key):primary.length)-(primary.includes(y.key)?primary.indexOf(y.key):primary.length));
 }
 // Presentation only: attack colours take precedence over secondary healing/status effects.
 const cardPalette50={physical:'#e9796d',arts:'#428fe3',true:'#f5f8ff',protection:'#58c58b',support:'#f3a34c'};
 function cardTypes50(meta,text='',actor,designId){
  if(meta?.attack){let types=[];const enemyText=String(text).replace(/(?:自身|自己|施術者|施放者)[^。；;\n]*(?:。|；|;|$)/g,'');
   if(/物理|物傷/.test(enemyText))types.push('physical');if(/法術|法傷/.test(enemyText))types.push('arts');if(/真實|真傷/.test(enemyText))types.push('true');
   const mixed={'MIDN-04':['physical','arts'],'LAP-05':['physical','arts'],'阿米婭-CARD-12':['arts','true'],'TEXO-01':['physical','arts'],'TEXO-05':['physical','arts']};
   if(mixed[designId])types=mixed[designId].slice();
   if(designId?.startsWith('繆爾賽思-CARD-')&&['繆爾賽思-CARD-1','繆爾賽思-CARD-4','繆爾賽思-CARD-5'].includes(designId)){const flow=actor?.flow?.hp>0?actor.flow.damageType:null;types=designId==='繆爾賽思-CARD-1'?['arts',...(flow?[flow]:[])]:[flow||meta.damageType]}
   if(!types.length)types=[meta.damageType||'physical'];
   if(actor?.nightSwitch?.remaining>0)types=types.map(t=>t==='physical'?'arts':t);
   return [...new Set(types)].filter(t=>['physical','arts','true'].includes(t));
  }
  const direct=String(text).replace(/(?:下(?:一)?張|下一次)[^。；;]*(?:。|；|;|$)/g,'');return [/(?:護盾|治療|恢復[^。；]*HP|回復[^。；]*HP|恢復[^。；]*生命|回復[^。；]*生命)/.test(direct)?'protection':'support'];
 }
 function paintCard50(card,types){if(!types.length)types=['support'];card.dataset.v31CardType=types.length>1?'mixed':types[0];card.dataset.cardColors=types.join(' ');card.style.setProperty('--card-border50',cardPalette50[types[0]]);if(types.length>1){const stops=types.flatMap((t,i)=>[cardPalette50[t]+' '+i/types.length*100+'%',cardPalette50[t]+' '+(i+1)/types.length*100+'%']);card.style.setProperty('--card-gradient50','linear-gradient(to right,'+stops.join(',')+')')}else card.style.removeProperty('--card-gradient50');}
 function formatText(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])).replace(/^#{1,6}\s+/gm,'').replace(/\*\*([\s\S]+?)\*\*/g,'<strong>$1</strong>').replace(/__([\s\S]+?)__/g,'<strong>$1</strong>').replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*([^*\n]+)\*/g,'<em>$1</em>')}
 function targetPlan(state){
  if(state.virtualOwner)return null;
  const def=G.effects.definitions.get(state.card.id),owner=R()?.team.find(a=>a.operator===def?.owner&&a.form===def?.form);
  if(!owner)return null;
  const meta=G.effects.describe(def.id,G.mastery(owner,state.card));
  return {meta,owner,secondary:meta.secondary};
 }
 function secondaryCandidates(state,primary){const plan=targetPlan(state),rule=plan?.secondary;if(!rule)return [];return R().team.filter(a=>a.hp>0&&!a.exited&&(!rule.otherOwner||a.uid!==plan.owner.uid)&&(!rule.distinctPrimary||a.uid!==primary)&&(!rule.profession||a.profession===rule.profession));}
 function dropSupport(state,target){const b=R()?.battle,actor=state.virtualOwner?R().team.find(a=>a.uid===state.virtualOwner):null;if(state.virtualOwner)return G.cast(actor.uid,{target,secondaryTarget:target,template:target,mode:'normal'});const index=b.hand.findIndex(c=>c.uid===state.card.uid);if(index<0)throw Error('此牌已不在手上。');const def=G.effects.definitions.get(state.card.id);if(!def)return playCard(index,target);const owner=R().team.find(a=>a.operator===def.owner&&a.form===def.form),meta=G.effects.describe(def.id,G.mastery(owner,state.card));const primary=meta.target==='self'?owner.uid:target,secondaryTarget=state.secondaryTarget||(meta.target==='self'?target:undefined);if(meta.secondary&&secondaryCandidates(state,primary).length&&!secondaryCandidates(state,primary).some(a=>a.uid===secondaryTarget)){choose(index,target);return}return G.play(index,{target:primary,secondaryTarget:secondaryTarget||target,template:target,equipment139Choices:state.gearChoices})}
 function secondarySelf(cardId,stage){const id=G.effects.definitions.get(cardId)?.designId;return stage==='M3B'&&['VANI-02','MIDN-05','CARD-02','CARD-05','HOSH-04','TEXO-03','瑪恩納-CARD-1','瑪恩納-CARD-2'].includes(id)||id==='伊桑-CARD-2'&&stage==='M3A'||id==='TEXA-02'&&['M2','M3A','M3B'].includes(stage)}
 function canTargetAllies(state){const b=R()?.battle;if(!b||b.operatorPhase!=='player'||b.operatorPending?.length||FrontierCurios.pending())return false;if(state.virtualOwner){const actor=R()?.team.find(a=>a.uid===state.virtualOwner),skill=R()?.battle?.skills?.find(c=>c.owner===state.virtualOwner);return !['physical','arts','true'].includes(skill?.type)&&['operator_v31_warfarin','operator_v31_aak'].includes(actor?.operator)}const meta=G.effects.describe(state.card.id);if(meta){const def=G.effects.definitions.get(state.card.id),actor=R().team.find(a=>a.operator===def.owner&&a.form===def.form),stage=G.mastery(actor,state.card);return ['ally','otherAlly'].includes(meta.target)||!!G.effects.describe(state.card.id,stage).secondary||secondarySelf(state.card.id,stage)}const d=cardStats(state.card);return !['attack','all'].includes(d.kind)&&!!(d.heal||d.block||d.power)}
 function allyTargets(state){if(!canTargetAllies(state))return null;const old=document.querySelector('.v113-ally-drop-layer');if(old)return old;const enemy=document.querySelector('.enemy-line')?.getBoundingClientRect();if(!enemy)return null;const layer=document.createElement('div');layer.className='v113-ally-drop-layer';layer.setAttribute('aria-label',targetPlan(state)?.secondary?'拖住第一個目標，另一指點選第二位隊友':'拖到頭像施放給該幹員');const def=!state.virtualOwner&&G.effects.definitions.get(state.card.id),meta=def&&G.effects.describe(def.id),owner=state.virtualOwner||R().team.find(a=>a.operator===def?.owner&&a.form===def?.form)?.uid;const fireTargets=def&&/治療|恢復/.test(def.sourceEffects[G.mastery(R().team.find(a=>a.uid===owner),state.card)]||'')?(R().battle.friendly75||[]):[];const plan=targetPlan(state),mixed=!!plan?.secondary&&['enemy','enemies','highestDefEnemy','lowestDefEnemy'].includes(plan.meta.target);if(mixed)layer.classList.add('v113-mixed-targets');const allies=(mixed?secondaryCandidates(state):[...R().team,...fireTargets]).filter(a=>a.hp>0&&!a.exited),spread=Math.min(62,(innerWidth-62)/Math.max(1,allies.length-1)),centerY=Math.max(130,Math.min(innerHeight-230,enemy.top+enemy.height/2-48));allies.forEach((actor,i)=>{const target=document.createElement('div');target.className='v113-ally-drop';target.dataset.allyUid=actor.uid;target.setAttribute('aria-label',name(actor));const image=document.createElement('img');image.src=actor.friendly75?'assets/battle-fire75.svg':(window.FrontierAppearance80?.src(actor.id,'portrait',actor.form)||'assets/'+FrontierCapture.units[actor.id].image+'.png');image.alt=name(actor);target.append(image);const position=i-(allies.length-1)/2;target.style.left=(innerWidth/2-23+position*spread)+'px';target.style.top=(mixed?Math.max(48,enemy.top-54-((allies.length-1)**2/4-position*position)*9):centerY+position*position*14)+'px';if(meta?.target==='otherAlly'&&actor.uid===owner){target.dataset.disabled='true';target.setAttribute('aria-disabled','true')}layer.append(target)});document.body.append(layer);return layer}
 function choose(index,enemy,enhance,equipment139Choices,secondaryTarget){const card=R()?.battle?.hand[index];if(!card)return;const def=G.effects.definitions.get(card.id);if(!def)return;const actor=R().team.find(a=>a.operator===def.owner&&a.form===def.form),stage=G.mastery(actor,card),metadata=G.effects.describe(card.id,stage);if(enemy&&(metadata.attack||['enemy','enemies','highestDefEnemy','lowestDefEnemy'].includes(metadata.target))&&(typeof enhance==='boolean'||!resourceEnhancement(actor,def,stage)?.available)){if(enhance&&!resourceEnhancement(actor,def,stage)?.available)throw Error('強化資源不足，卡牌尚未打出。');const target=R().battle.enemies.find(e=>e.uid===enemy&&e.hp>0&&!e.exited);if(!target)throw Error('目標已無法攻擊。');if(metadata.secondary&&secondaryCandidates({card},enemy).length&&!secondaryCandidates({card},enemy).some(a=>a.uid===secondaryTarget)){choice={card:card.uid,actor:actor.uid,metadata,stage,enemy};showChoice(def.name,def.sourceEffects[stage]);return}return G.play(index,{...G.attackSelection(actor,target,enhance,equipment139Choices),...(secondaryTarget?{secondaryTarget}:{})})}choice={card:card.uid,actor:actor.uid,metadata,stage,enemy};showChoice(def.name,def.sourceEffects[stage])}
 function signaturePreview(uid){if(uid.startsWith('aux49:')){const a=R()?.team.find(a=>a.uid===uid.slice(6));if(!a)return null;const tip=document.createElement('aside');tip.className='v113-actor-tooltip v113-signature-tooltip';tip.setAttribute('role','tooltip');tip.textContent='瞬身急襲｜0行動點｜對指定敵人造成'+[100,125,150][a.elite||0]+'% ATK法術傷害；結算後，本次己方回合後續自身傷害＋'+[10,15,20][a.elite||0]+'%（沿用全域增傷遞減、不疊加；急襲本身不享有）。本回合未使用即消失；不占普通手牌／保留上限，不進牌庫、不充能招牌、不觸發普通出牌連鎖。';FrontierInspector.attach(tip);return tip}const actor=R()?.team.find(a=>a.uid===uid),form=actor&&G.formFor(actor.operator,actor.form),rule=actor&&G.rules[actor.operator]?.[actor.form];if(!form||!rule)return null;const tip=document.createElement('aside');tip.className='v113-actor-tooltip v113-signature-tooltip';tip.setAttribute('role','tooltip');const title=document.createElement('b');title.textContent=form.signature.name;const cost=typeof rule.cost==='function'?rule.cost(G.snapshot(),actor,{mode:'normal'}):rule.cost,caption=document.createElement('p');caption.textContent='E'+actor.elite+' · '+cost+' 行動點';const body=document.createElement('p');body.innerHTML=formatText(form.signature.sourceTiers['E'+actor.elite]);tip.append(title,caption);if(actor.operator==='char_103_angel'&&form.abilities?.signature?.chargeSource){const conditions=document.createElement('p');conditions.textContent=form.abilities.signature.chargeSource;tip.append(conditions);}tip.append(body);FrontierInspector.attach(tip);return tip}
 function signature(uid,enemy){if(uid.startsWith('aux49:')){if(enemy)return G.cast(uid,{target:enemy});toast('將瞬身急襲拖到敵人施放；長按查看詳情。');return}const actor=R()?.team.find(a=>a.uid===uid),form=actor&&G.formFor(actor.operator,actor.form);if(!form)return;if(enemy&&['physical','arts','true'].includes(R().battle.skills?.find(c=>c.owner===uid)?.type)){const target=R().battle.enemies.find(e=>e.uid===enemy&&e.hp>0&&!e.exited);if(!target)throw Error('目標已無法攻擊。');return G.cast(uid,G.attackSelection(actor,target))}choice={signature:true,actor:uid,enemy,metadata:{target:['華法林','阿'].includes(form.operatorName)?'otherAlly':'enemy',aoe:!['華法林','阿'].includes(form.operatorName)}};showChoice(form.signature.name,form.signature.sourceTiers?.['E'+actor.elite]||form.signature.sourceText)}
 function showChoice(title,text){
  modal(title,'<div class="v113-action-form"></div>','<button onclick="closeModal()">取消</button>');const host=document.querySelector('.v113-action-form'),description=document.createElement('p');description.innerHTML=formatText(text);host.append(description);
  const r=R(),actor=r.team.find(a=>a.uid===choice.actor),ally=choice.metadata.target.includes('Ally')||choice.metadata.target==='ally',self=choice.metadata.target==='self';
  const targets=document.createElement('fieldset');targets.innerHTML='<legend>'+ (ally?'選擇友方目標':'選擇敵方目標（多目標牌可複選）')+'</legend>';
  const candidates=ally?r.team.filter(a=>a.hp>0&&!a.exited&&(choice.metadata.target!=='otherAlly'||a.uid!==actor.uid)):r.battle.enemies.filter(e=>e.hp>0&&!e.exited);
  for(const target of candidates){const label=document.createElement('label'),input=document.createElement('input');input.type=choice.metadata.aoe?'checkbox':'radio';input.name='v113-target';input.value=target.uid;input.checked=target.uid===choice.enemy||!choice.enemy&&candidates.indexOf(target)<(choice.metadata.maxTargets||1);if(choice.metadata.maxTargets>1)input.addEventListener('change',()=>{if(targets.querySelectorAll('input:checked').length>choice.metadata.maxTargets){input.checked=false;toast('此牌最多選擇 '+choice.metadata.maxTargets+' 名敵人。')}});label.append(input,document.createTextNode((ally?name(target):target.name)+' · '+target.hp+'/'+target.max));targets.append(label)}if(!self)host.append(targets);
  const secondary=document.createElement('select');secondary.setAttribute('aria-label','第二位支援隊友或流形模板');
  function refreshSecondary(){const prior=secondary.value,primary=targets.querySelector('input:checked')?.value,card=R().battle.hand.find(c=>c.uid===choice.card),rule=choice.metadata.secondary;secondary.replaceChildren();const candidates=rule?secondaryCandidates({card},primary):r.team.filter(a=>a.hp>0&&!a.exited);for(const a of candidates){const o=document.createElement('option');o.value=a.uid;o.textContent=name(a);secondary.append(o)}secondary.value=candidates.some(a=>a.uid===prior)?prior:candidates.find(a=>a.uid!==actor.uid)?.uid||candidates[0]?.uid||'';}
  refreshSecondary();targets.addEventListener('change',refreshSecondary);
  if(choice.metadata.secondary||!self||secondarySelf(R().battle.hand.find(c=>c.uid===choice.card)?.id,choice.stage))host.append(document.createTextNode('支援隊友 '),secondary);
  const enhance=document.createElement('label'),toggle=document.createElement('input');
  toggle.type='checkbox';toggle.name='v113-enhance';
  const selectedCard=r.battle.hand.find(card=>card.uid===choice.card),enhancement=resourceEnhancement(actor,selectedCard&&G.effects.definitions.get(selectedCard.id),choice.stage);
  if(enhancement){
   toggle.disabled=!enhancement.available;
   const count=enhancement.label==='彈藥'?' / 5':'';
   const payment='消耗 '+enhancement.cost+' '+enhancement.label+'強化';
   enhance.append(toggle,document.createTextNode((enhancement.available?payment:'資源不足，可打出基本攻擊')+'（目前 '+enhancement.held+count+'）'));
  }else enhance.append(toggle,document.createTextNode(' 使用卡面所列的額外資源強化'));
  if(enhancement)host.append(enhance);
  let mode=null;if(choice.signature&&actor.operator==='amiya'&&actor.elite===2){mode=document.createElement('select');mode.setAttribute('aria-label','招牌模式');for(const [value,label]of [['normal','普通模式'],['extreme','極限模式（本戰一次）']]){const o=document.createElement('option');o.value=value;o.textContent=label;mode.append(o)}host.append(mode)}
  host.append(button('確認施放',()=>{const selected=[...targets.querySelectorAll('input:checked')].map(x=>x.value),stored={...choice},selection={target:self?actor.uid:selected[0],targets:ally?undefined:selected,secondaryTarget:secondary.value,template:secondary.value,enhance:toggle.checked,mode:mode?.value,stunTargets:[],breakTarget:undefined};if(ally)delete selection.targets;
   const normals=r.battle.enemies.filter(e=>selected.includes(e.uid)&&!e.boss&&!e.elite&&!e.immuneStun);selection.stunTargets=normals.slice(0,actor.operator==='texas_the_omertosa'?(actor.elite===2?2:1):actor.elite?2:1).map(e=>e.uid);selection.breakTarget=selected.find(id=>r.battle.enemies.some(e=>e.uid===id&&e.action?.breakable&&e.action?.breakWindow));
   FrontierRuntime.perform(stored.signature?'operator-signature':'operator-card',()=>{const current=R()?.battle;if(!current)throw Error('戰鬥已更新，請重新選牌。');if(stored.signature)G.cast(stored.actor,selection);else{const index=current.hand.findIndex(c=>c.uid===stored.card);if(index<0)throw Error('此牌已不在手上。');G.play(index,selection)}closeModal()});
  },'primary'));
 }
 function showResolution(panel){panel.classList.add('v113-resolution-portal');Object.assign(panel.style,{position:'fixed',left:'12px',right:'12px',bottom:Math.min(230,Math.max(150,innerHeight*.28))+'px',maxHeight:'min(40vh,320px)',overflowY:'auto',zIndex:'6000',display:'flex',flexWrap:'wrap',gap:'7px',padding:'10px',background:'#132630',border:'1px solid #6e9caf',boxShadow:'0 6px 24px #0009'});document.body.append(panel)}
 function positionDrawDiscard(hand){
  const tray=document.querySelector('.v113-draw-discard');if(!tray||!hand)return;
  const box=hand.getBoundingClientRect(),visual=window.visualViewport;
  const minimum=(visual?.offsetTop||0)+52;
  tray.style.setProperty('--draw-discard-space',Math.max(120,box.top-minimum-42)+'px');
  tray.style.top=Math.max(minimum,box.top-tray.offsetHeight-6)+'px';
 }
 let drawPick135={key:'',selected:new Set()},drawView135=null,mergeDraw135=null,drawnPointer=null,drawSuppress135=0;
 const drawMotionQuery135=matchMedia('(prefers-reduced-motion: reduce)');
 const reducedDraw135=()=>drawMotionQuery135.matches||typeof Element.prototype.animate!=='function';
 drawMotionQuery135.addEventListener?.('change',()=>{if(drawMotionQuery135.matches)document.querySelectorAll('.v135-draw-motion').forEach(el=>{el.getAnimations().forEach(a=>a.cancel());el.remove()})});
 function drawContext135(){
  const b=R()?.battle,p=b?.operatorPending?.[0];if(p?.type!=='drawDiscard')return null;
  const normal=b.hand.filter(c=>!c.virtual&&!c.retainSelected),fresh=normal.filter(c=>(p.drawn||[]).includes(c.uid)),pool=p.stage==='discardFirst'||!fresh.length?normal:fresh;
  const key=[b.operatorBattleId,p.source,p.owner,p.stage,(p.drawn||[]).join(',')].join('|'),keep=Math.max(0,pool.length-p.discard),canKeep=p.stage==='discard'&&!p.draw&&fresh.length>p.discard;
  return {b,p,key,pool,keep,canKeep};
 }
 function syncDrawPick135(ctx){if(drawPick135.key!==ctx.key)drawPick135={key:ctx.key,selected:new Set()};for(const uid of drawPick135.selected)if(!ctx.pool.some(c=>c.uid===uid))drawPick135.selected.delete(uid)}
 const drawArrow135=up=>'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 '+(up?'16V4m-5 5 5-5 5 5':'4v12m-5-5 5 5 5-5')+'"/></svg>';
 function drawHint135(hint,ctx){hint.setAttribute('aria-label',ctx.canKeep?'上滑選入 '+Math.max(0,ctx.keep-drawPick135.selected.size)+' 張，或下滑棄置 '+ctx.p.discard+' 張':'下滑棄置 '+ctx.p.discard+' 張'+(ctx.p.stage==='discardFirst'?'，騰出手牌空間後繼續抽牌':''));hint.innerHTML=(ctx.canKeep?'<span>'+drawArrow135(true)+'<i>'+Math.max(0,ctx.keep-drawPick135.selected.size)+'</i></span><em>／</em>':'')+'<span>'+drawArrow135(false)+'<i>'+ctx.p.discard+'</i></span>';}
 function markDrawPick135(){const ctx=drawContext135();if(!ctx)return;syncDrawPick135(ctx);for(const el of document.querySelectorAll('[data-drawn-discard]')){const picked=drawPick135.selected.has(el.dataset.drawnDiscard);el.classList.toggle('v135-draw-selected',picked);el.setAttribute('aria-pressed',String(picked))}const hint=document.querySelector('.v113-draw-discard>b');if(hint)drawHint135(hint,ctx)}
 function captureDrawPositions135(ctx){if(!drawView135||drawView135.key!==ctx.key)return;drawView135.positions=new Map([...document.querySelectorAll('[data-drawn-discard]')].map(el=>[el.dataset.drawnDiscard,el.getBoundingClientRect()]));}
 function animateDrawCards135(nodes,key){if(reducedDraw135())return;measure134(()=>nodes.filter(x=>x.el.isConnected).map(x=>({...x,rect:x.el.getBoundingClientRect()})),rows=>{if(drawContext135()?.key!==key)return;for(const {el,old,rect,enter}of rows){const dx=old?old.left-rect.left:0,dy=old?old.top-rect.top:14;if(enter||Math.abs(dx)+Math.abs(dy)>1)el.animate([{translate:dx+'px '+dy+'px',opacity:enter?.15:1},{translate:'0 0',opacity:1}],{duration:175,easing:'cubic-bezier(.2,.7,.3,1)'})}})}
 function showDrawDiscard(host,b,p){
  const ctx=drawContext135(),hand=host.querySelector('.v113-hand');if(!ctx||!hand)return;syncDrawPick135(ctx);
  const identity=[b.operatorBattleId,p.source,p.owner].join('|');if(drawView135?.identity!==identity)drawView135={key:ctx.key,identity,seen:new Set(),positions:new Map()};else drawView135.key=ctx.key;
  const tray=document.createElement('section'),row=document.createElement('div'),hint=document.createElement('b'),motion=[];
  tray.className='v113-resolution-portal v113-draw-discard';drawHint135(hint,ctx);hint.setAttribute('role','status');row.className='v113-draw-discard-row';
  for(const source of hand.querySelectorAll('[data-hand-index]')){
   const c=b.hand[Number(source.dataset.handIndex)];if(!ctx.pool.some(x=>x.uid===c?.uid))continue;
   const card=source.cloneNode(true);card.removeAttribute('onclick');card.removeAttribute('data-hand-index');card.removeAttribute('disabled');card.removeAttribute('aria-disabled');card.classList.remove('v113-unaffordable','picked','fan-focused');card.dataset.drawnDiscard=c.uid;
   card.setAttribute('aria-label',cardName(c)+(ctx.canKeep?'，上滑選入手牌，或下滑棄置':'，下滑棄置'));
   card.addEventListener('keydown',event=>{if(event.key==='ArrowUp'&&ctx.canKeep){event.preventDefault();chooseDrawn135(c.uid)}else if(event.key==='ArrowDown'){event.preventDefault();discardDrawn(c.uid)}});
   card.addEventListener('click',event=>{if(event.detail===0){if(ctx.canKeep)chooseDrawn135(c.uid);else discardDrawn(c.uid)}});
   source.classList.add('v113-staged-draw');source.setAttribute('aria-hidden','true');source.tabIndex=-1;row.append(card);
   motion.push({el:card,old:drawView135.positions.get(c.uid),enter:!drawView135.seen.has(c.uid)});drawView135.seen.add(c.uid);
  }
  tray.append(hint);if(row.childElementCount){row.style.setProperty('--drawn-card-count',row.childElementCount);tray.append(row)}document.body.append(tray);markDrawPick135();animateDrawCards135(motion,ctx.key);
 }
 function mergeDrawCards135(){
  const ctx=drawContext135(),merge=mergeDraw135,b=R()?.battle;if(!merge||ctx?.key===merge.key)return;if(!b||b.operatorBattleId!==merge.battle){mergeDraw135=null;return}mergeDraw135=null;
  if(reducedDraw135())return;measure134(()=>{const current=R()?.battle;if(current?.operatorBattleId!==merge.battle)return;return [...document.querySelectorAll('.v113-hand [data-hand-index]:not(.v113-staged-draw)')].filter(el=>merge.kept.includes(current.hand[Number(el.dataset.handIndex)]?.uid))},nodes=>{if(R()?.battle?.operatorBattleId!==merge.battle)return;for(const el of nodes)if(el.isConnected)el.animate([{translate:'0 -18px',opacity:.25},{translate:'0 0',opacity:1}],{duration:190,easing:'ease-out'})},'draw-merge');
 }
 function rememberDrawMerge135(ctx,rejected){mergeDraw135={key:ctx.key,battle:ctx.b.operatorBattleId,kept:ctx.pool.filter(c=>!rejected.includes(c.uid)&&(ctx.p.drawn||[]).includes(c.uid)).map(c=>c.uid)}}
 function drawFailed135(ok,key){if(!ok&&drawPick135.key===key){drawPick135.selected.clear();mergeDraw135=null;markDrawPick135()}return ok}
 function discardDrawn(uid){
  const ctx=drawContext135();if(!ctx||!ctx.pool.some(c=>c.uid===uid))return Promise.resolve(false);captureDrawPositions135(ctx);drawPick135.selected.delete(uid);rememberDrawMerge135(ctx,[uid]);
  return FrontierRuntime.perform('operator-draw-discard-swipe',()=>{const current=drawContext135();if(current?.key!==ctx.key||!current.pool.some(c=>c.uid===uid))return false;return G.discard(uid)}).then(ok=>drawFailed135(ok,ctx.key));
 }
 function chooseDrawn135(uid){
  const ctx=drawContext135();if(!ctx?.canKeep||!ctx.pool.some(c=>c.uid===uid))return Promise.resolve(false);syncDrawPick135(ctx);drawPick135.selected.add(uid);markDrawPick135();
  if(drawPick135.selected.size<ctx.keep)return Promise.resolve(true);
  const rejected=ctx.pool.filter(c=>!drawPick135.selected.has(c.uid)).map(c=>c.uid);captureDrawPositions135(ctx);rememberDrawMerge135(ctx,rejected);
  if(!reducedDraw135())for(const id of rejected){const el=[...document.querySelectorAll('[data-drawn-discard]')].find(e=>e.dataset.drawnDiscard===id),rect=drawView135?.positions.get(id);if(el&&rect)finishDrawMotion135({el,rect,uid:id},false)}
  return FrontierRuntime.perform('operator-draw-discard-swipe',()=>{let applied=0;for(const id of rejected){const current=drawContext135();if(current?.key!==ctx.key||current.p.stage!=='discard'||!current.pool.some(c=>c.uid===id))break;G.discard(id);applied++}return applied===rejected.length}).then(ok=>drawFailed135(ok,ctx.key));
 }
 function drawGhost135(state){
  if(state.ghost||reducedDraw135())return state.ghost;const node=document.createElement('div'),inner=document.createElement('div'),card=state.el.cloneNode(true);node.className='v135-draw-motion';node.setAttribute('aria-hidden','true');node.inert=true;inner.className='v113-draw-discard-row';card.removeAttribute('data-drawn-discard');card.removeAttribute('aria-pressed');card.classList.remove('v135-draw-selected');card.tabIndex=-1;card.style.flex='1 1 100%';inner.append(card);node.append(inner);const r=state.rect;Object.assign(node.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});node.style.setProperty('--draw-discard-space',r.height+'px');document.body.append(node);state.ghost=node;return node;
 }
 function clearDrawPointer135(state,finish=false){clearTimeout(state.hold);cancelAnimationFrame(state.frame);state.tip?.remove();state.el?.classList.remove('v135-draw-dragging');if(!finish)state.ghost?.remove();try{state.el.releasePointerCapture(state.id)}catch{}}
 function finishDrawMotion135(state,up){const ghost=drawGhost135(state);clearDrawPointer135(state,true);if(!ghost)return;const dx=state.dx||0,dy=state.dy||0;const animation=ghost.animate([{transform:'translate('+dx+'px,'+dy+'px)',opacity:.95},{transform:'translate('+dx+'px,'+(up?-100:110)+'px) scale(.93)',opacity:0}],{duration:190,easing:'ease-out'});animation.onfinish=animation.oncancel=()=>ghost.remove();}
 window.addEventListener('pointerdown',event=>{
  if(!drawnPointer)drawSuppress135=0;const card=event.target.closest?.('[data-drawn-discard]');if(!card||event.isPrimary===false||event.button>0)return;
  const ctx=drawContext135();if(!ctx)return;const state={id:event.pointerId,uid:card.dataset.drawnDiscard,x:event.clientX,y:event.clientY,el:card,rect:card.getBoundingClientRect(),key:ctx.key,dx:0,dy:0};drawnPointer=state;
  state.hold=setTimeout(()=>{if(drawnPointer!==state||state.moved)return;const c=R()?.battle?.hand.find(c=>c.uid===state.uid);if(!c)return;const tip=document.createElement('aside');tip.className='v113-actor-tooltip';tip.setAttribute('role','tooltip');const title=document.createElement('b');title.textContent=cardName(c);const text=document.createElement('p');text.textContent=cardText(c);tip.append(title,text);FrontierInspector.attach(tip);state.tip=tip;state.inspected=true},350);
  card.setPointerCapture(event.pointerId);event.preventDefault();
 },true);
 window.addEventListener('pointermove',event=>{
  const state=drawnPointer;if(!state||state.id!==event.pointerId)return;state.dx=event.clientX-state.x;state.dy=event.clientY-state.y;if(Math.hypot(state.dx,state.dy)<8)return;state.moved=true;state.inspected=false;clearTimeout(state.hold);state.tip?.remove();if(Math.abs(state.dx)>Math.abs(state.dy))return;event.preventDefault();if(state.frame)return;
  state.frame=requestAnimationFrame(()=>{state.frame=null;if(drawnPointer!==state)return;const ghost=drawGhost135(state);if(ghost){state.el.classList.add('v135-draw-dragging');ghost.style.transform='translate('+Math.max(-24,Math.min(24,state.dx))+'px,'+Math.max(-95,Math.min(100,state.dy))+'px)';ghost.dataset.direction=state.dy<0?'keep':'discard'}});
 },{capture:true,passive:false});
 window.addEventListener('pointerup',event=>{
  const state=drawnPointer;if(!state||state.id!==event.pointerId)return;drawnPointer=null;const down=event.clientY-state.y,ctx=drawContext135();
  if(state.inspected||ctx?.key!==state.key||Math.abs(down)<35||Math.abs(down)<=Math.abs(event.clientX-state.x)){clearDrawPointer135(state);return}
  event.preventDefault();drawSuppress135=performance.now()+650;if(down<0&&!ctx.canKeep){clearDrawPointer135(state);return}finishDrawMotion135(state,down<0);if(down<0)chooseDrawn135(state.uid);else discardDrawn(state.uid);
 },true);
 window.addEventListener('pointercancel',event=>{if(drawnPointer?.id===event.pointerId){clearDrawPointer135(drawnPointer);drawnPointer=null}},true);
 window.addEventListener('blur',()=>{if(drawnPointer)clearDrawPointer135(drawnPointer);drawnPointer=null});
 document.addEventListener('click',event=>{if(performance.now()<drawSuppress135&&event.target.closest?.('.v113-draw-discard,.v113-hand')){event.preventDefault();event.stopImmediatePropagation()}},true);
 function pending(host,b){const panel=document.createElement('section');panel.className='v113-resolution';const p=b.operatorPending?.[0];if(p?.type==='exuBlessing'){queueMicrotask(()=>{if(R()?.battle===b)FrontierRuntime.perform('operator-opening-blessing',()=>{if(R()?.battle===b)return G.resolve({})})});return}if(p?.type==='equipment139Choice'){window.FrontierEquipmentUI139?.pending(panel,p);showResolution(panel);return}if(p?.type==='peekDraw'&&p.stage==='choose'){const title=document.createElement('b');title.textContent='選擇預覽的牌';panel.append(title);for(const c of b.draw.filter(c=>p.candidates.includes(c.uid)))panel.append(button(cardName(c),()=>FrontierRuntime.perform('operator-peek',()=>G.resolve({peek:c.uid}))));showResolution(panel);return}if(p?.type==='drawDiscard'&&p.stage!=='draw'){showDrawDiscard(host,b,p);return}if(p){const title=document.createElement('b');title.textContent=p.type==='optionalRetainDrawn'?'可保留一張牌':p.type==='drawDiscard'?'請先棄 '+p.discard+' 張牌（可向下滑牌），完成後才能出牌或結束回合':'請完成目前選擇';panel.append(title);for(const c of b.hand.filter(c=>p.type!=='optionalRetainDrawn'||p.cards.includes(c.uid))){panel.append(button(cardName(c),()=>FrontierRuntime.perform('operator-choice',()=>G.resolve(p.type==='optionalRetainDrawn'?{retain:c.uid}:{discard:c.uid}))))}if(p.stage==='draw')panel.append(button('抽牌',()=>FrontierRuntime.perform('operator-choice',()=>G.resolve({}))));if(p.type==='optionalRetainDrawn')panel.append(button('略過',()=>FrontierRuntime.perform('operator-choice',()=>G.resolve({retain:null}))));showResolution(panel);return}
  const q=FrontierCurios.pending();if(q){const title=document.createElement('b');title.textContent={retain:'選擇保留牌（或略過）',discard:'請先棄置一張牌',activeDiscard:'請先棄置一張牌（也可向下滑牌）',shield:'選擇護盾隊友',tactic:'選擇臨時指令'}[q.kind]||'請完成目前選擇';panel.append(title);const resolve=value=>FrontierRuntime.perform('operator-curio-choice',()=>FrontierCurios.resolveChoice(q.id,value));if(['retain','discard','activeDiscard'].includes(q.kind)){const options=b.hand.filter(c=>q.kind!=='retain'||!c.generated&&!c.curioRetain);for(const c of options)panel.append(button(cardName(c),()=>resolve(R().battle.hand.findIndex(x=>x.uid===c.uid))));if(q.kind==='retain'||!options.length)panel.append(button('略過／完成',()=>resolve(null)))}else if(q.kind==='shield'){const allies=R().team.filter(a=>a.hp>0);for(const a of allies)panel.append(button(name(a),()=>resolve(a.id)));if(!allies.length)panel.append(button('完成',()=>resolve(null)))}else if(q.kind==='tactic'){panel.append(button('造成30點傷害',()=>resolve('attack')),button('獲得30點護盾',()=>resolve('shield')))}showResolution(panel);return}
  if(['retain','retain-overflow'].includes(b.operatorPhase)){retainSelection=new Set(b.retainSelection||[]);const title=document.createElement('b');title.textContent='選擇回合保留牌（招牌牌自動保留，不佔名額）';panel.append(title);for(const c of b.hand){const limit=Math.min(5,2+(b.retainBonus||0)),required=b.retainRequired||[],fixed=required.length<=limit&&required.includes(c.uid);const el=button(cardName(c)+(fixed?' · 固有保留':''),()=>{if(fixed){toast('此牌優先保留；若不需要可向下棄置。');return}if(retainSelection.has(c.uid))retainSelection.delete(c.uid);else{if(retainSelection.size>=limit){toast('本回合最多保留 '+limit+' 張，請先取消其他選擇。');return}if(required.length>limit&&!required.includes(c.uid)){toast('請先從固有保留牌中選擇。');return}retainSelection.add(c.uid)}el.setAttribute('aria-pressed',String(retainSelection.has(c.uid)))});el.setAttribute('aria-pressed',String(retainSelection.has(c.uid)));panel.append(el)}if(!(b.retainRequired||[]).length)panel.append(button('不保留，直接結束回合',()=>FrontierRuntime.perform('operator-discard-all-end',()=>G.retain([]))));panel.append(button('返回出牌',()=>FrontierRuntime.perform('operator-return-to-play',()=>G.cancelEndChoice())));panel.append(button('確認並結束回合',()=>FrontierRuntime.perform('operator-retain',()=>G.retain([...retainSelection])),'primary'));showResolution(panel)}
 }
 function buffApplies(buff,actor,turn){const f=buff.filter||{};return buff.remaining!==0&&(buff.expiresTurn==null||buff.expiresTurn>=turn)&&(buff.startsTurn==null||buff.startsTurn<=turn)&&(!f.owner||f.owner===actor.operator)&&(!f.other||buff.source!==actor.uid)&&(!f.form||f.form===actor.form)&&(!f.profession||f.profession===actor.profession)}

 function statusDetails(entity){const out=[],turn=R()?.battle?.turn||0,dict=FrontierOperatorStatusDictionaryV31.definitions,explain={poison:'每次狀態傷害結算，每層造成 10 點傷害。',bleed:'每次狀態傷害結算，每層造成 10 點傷害。',burn:'每次狀態傷害結算，每層造成 20 點傷害。',bind:'跳過本回合可控制的敵方行動；敵人有破韌條時，施加纏結即改為增加 1 點失衡衝擊。',silence:'有效期間阻止可沉默的普通敵人施放特殊攻擊；不阻止一般攻擊，精英與首領不受此控制。',slow:'遲滯：供技能條件判定。若技能附加減傷，依該技能的數值和期限結算。',weightless:'失重；供失重條件的卡牌增益與破韌效果判定，不等同無法攻擊。',suppression:'壓制標記，供技能條件判定，不等同沉默或暈眩。',freeze:'凍結：限制招牌技能，持續依狀態回合數結算。',cold:'達到寒冷門檻後觸發凍結。'};
  for(const x of entity.statuses||[])if(x.stacks>0&&(x.expiresEnemyPhase==null||x.expiresEnemyPhase>=turn))out.push({icon:({poison:'☠',bleed:'🩸',burn:'♨',slow:'⌛',bind:'⛓',silence:'…',weightless:'◌'}[x.id]||'!'),text:(dict[x.id]?.name||({suppression:'壓制',freeze:'凍結',cold:'寒冷'})[x.id]||'戰術標記')+'（'+x.stacks+' 層）：'+(explain[x.id]||'技能附加狀態，持續與效果依施加來源。')+(x.amount!=null?' 效果量 '+Math.round(x.amount*100)+'%。':'')+(x.expiresEnemyPhase!=null?' 至第 '+x.expiresEnemyPhase+' 敵方階段末。':'')});
  for(const [id,n]of Object.entries(entity.status||{}))if(n>0)out.push({icon:({poison:'☠',bleed:'🩸',burn:'♨',cold:'❄',freeze:'❄'}[id]||'!'),text:(dict[id]?.name||({cold:'寒冷',freeze:'凍結',fear:'恐懼',weak:'虛弱',corrosion:'侵蝕',neural:'神經損傷',wound:'傷口',blind:'致盲'}[id])||id)+'（'+n+' 層）：'+(explain[id]||'負面狀態；可用可淨化此狀態的效果解除。')});
  const names={entangle:'纏繞',mentalDamage:'精神損傷',kroosAim:'瞄準',adnaLock:'弱點鎖定',ambrielLock:'遠距鎖定',resonance:'共鳴',shock:'震盪',texasMark:'劍雨印記',hunt:'獵痕',saw:'鋸痕',weakMark:'弱點標記',poise:'失衡'};
  for(const [id,n]of Object.entries(entity.counters||{}))if(n>0){let threshold=null,effect='由對應技能消耗或依已有層數增強效果；不會單憑此標記禁止攻擊。';if(id==='entangle'){threshold=FrontierOperatorStatusDictionaryV31.entangleThreshold(entity);effect='累積達 '+threshold+' 層即消耗 '+threshold+' 層並觸發束縛：跳過下一次一般攻擊，或可被控制的特殊攻擊。已束縛時不重複觸發，剩餘纏繞會保留至到期。'}if(id==='mentalDamage'){threshold=FrontierOperatorStatusDictionaryV31.mentalThreshold(entity);effect='達門檻觸發精神崩潰並清空層數：當前可破韌特殊行動立即破韌；否則下次特殊傷害降低 25%。首領觸發後有短暫再次觸發免疫。'}if(id==='shock')effect='下次攻擊結算會消耗震盪並套用其減傷效果。';out.push({icon:id==='entangle'?'⛓':id==='mentalDamage'?'◈':'◎',text:(names[id]||id)+'（'+n+(threshold?'/'+threshold:' 層')+'）：'+effect})}
  if(entity.ignite?.length)out.push({icon:'♨',text:'灼燃（'+entity.ignite.length+'/3，上限而非觸發門檻）：每次敵方階段結束，逐層結算法術傷害；目前合計 '+entity.ignite.reduce((n,x)=>n+x.amount+(x.firstBonus||0),0)+' 點基礎法術傷害，仍計算法抗與護盾。各層到期回合：'+entity.ignite.map(x=>x.expiresEnemyPhase).join('、')+'。'});if(entity.armorReductions?.length)out.push({icon:'↓',text:'破甲：防禦已降低 '+entity.armorReductions.reduce((n,x)=>n+x.applied,0)+'；各效果到期後恢復。'});if(entity.resReduction)out.push({icon:'↓',text:'法抗已降低 '+entity.resReduction.applied+'；至第 '+entity.resReduction.expiresEnemyPhase+' 敵方階段末。'});if(entity.nextAttackFlatReduction>0)out.push({icon:'↓',text:'下次攻擊額外減少 '+entity.nextAttackFlatReduction+' 點傷害。'});
  if(entity.skipNextOrdinaryAction)out.push({icon:'✦',text:'暈眩／壓制（1/1）：跳過下一次一般攻擊，不會直接取消特殊攻擊。'});if(entity.skipNextControllableAction&&!out.some(x=>x.text.startsWith('束縛')))out.push({icon:'⛓',text:'束縛（1/1）：跳過下一次可控制的攻擊。'});for(const [key,label]of [['nextAttackDamageReduction','下次攻擊'],['nextSpecialDamageReduction','下次特殊傷害'],['nextOrdinaryDamageReduction','下次一般傷害']])if(entity[key]>0)out.push({icon:'↓',text:label+'降低 '+Math.round(entity[key]*100)+'%。'});return out}
 function enemyStatuses(board,b){
  const line=board.querySelector('.enemy-line');
  for(const el of line?.querySelectorAll('.enemy-card[data-enemy-id]')||[]){
   const enemy=b.enemies.find(e=>e.id===el.dataset.enemyId);
   if(!enemy)continue;
   el.dataset.inspectEnemy=enemy.id;
   el.setAttribute('aria-label',enemy.name+' · '+intentText(enemy)+' · 生命 '+enemy.hp+'/'+enemy.max);
   const intent=document.createElement('span');intent.className='v113-enemy-intent';
   const target=R().team.find(a=>a.uid===enemy.operatorTarget||a.flow?.uid===enemy.operatorTarget);
   const unit=FrontierCapture.units[target?.id];
   const charging=enemy.special&&!enemy.special.solved&&FrontierBreaks.telegraph(enemy,b.turn);
   if(enemy.hp>0&&charging){
    intent.classList.add('charging');
    intent.textContent=enemy.special.due>b.turn?'蓄力 '+(enemy.special.due-b.turn+1):'即將施放';
   }else if(enemy.special?.solved&&enemy.hp>0){intent.textContent='已破韌';}else if(enemy.hp>0&&!enemy.regionalFragment){
    if(unit&&enemy.intent==='attack'&&!enemy.skipNextOrdinaryAction&&!enemy.skipNextControllableAction&&!enemy.npcTarget){
     const img=document.createElement('img');img.src=window.FrontierAppearance80?.src(target.id,'portrait',target.form)||'assets/'+unit.image+'.png';img.alt=unit.name;
     const amount=document.createElement('span');amount.textContent=enemy.atk;intent.append(img,amount);
    }else intent.textContent=enemy.npcTarget?'護送目標':enemy.skipNextOrdinaryAction||enemy.skipNextControllableAction?'受控':enemy.intent==='defend'?'防守':'強化';
   }
   const figure=el.querySelector('.enemy-figure');
   const art=figure?.querySelector('.enemy-art');
   art?.removeAttribute('data-inspect-actor');
   const artId=FrontierEnemyData.units[enemy.species]?.image,paths133=window.FrontierEnemyIdleAssets?.[enemy.species]||window.FrontierEnemyIdleAssets?.[artId];
   /* 優先用 Spine 小模型（原地待機）；同一隻已在播放就不重建，失敗退回 webp。 */
   /* 機制單位／召喚物：血刃與裝置靠旗標區分，對應官方模型。 */const flagId=enemy.bloodblade75?'enemy_1186_bldbld':enemy.device75?'enemy_1369_bmbcar1':null,spineId=flagId?(window.FrontierEnemySpine?.has(flagId)?flagId:null):window.FrontierEnemySpine?.has(enemy.species)?enemy.species:window.FrontierEnemySpine?.has(artId)?artId:null;
   const life=FrontierEnemySpine.lifeOf(enemy,b),lifeKey=b.operatorBattleId+':'+enemy.uid,prevLife=FrontierEnemySpine.lastLife.get(lifeKey);FrontierEnemySpine.lastLife.set(lifeKey,life);
   if(figure&&spineId&&FrontierEnemySpine.mount(figure,spineId,enemy.id,life>=2?'B':'A')){if(prevLife&&life>prevLife){const ms=FrontierEnemySpine.transition(spineId,enemy.id,'B');FrontierEnemySpine.lock(ms||1200,enemy.boss||enemy.regionBoss?'第 '+life+' 階段':'再起')}figure.dataset.spine=spineId;figure.addEventListener('spine-failed',()=>{delete figure.dataset.spine;figure.dataset.spineFailed='1'},{once:true})}
   else if(figure&&paths133&&!figure.querySelector('canvas')){
    const paths=paths133,sprite=document.createElement('img');
    sprite.className='enemy-art enemy-idle-model';sprite.alt='';sprite.draggable=false;
    sprite.src=matchMedia('(prefers-reduced-motion: reduce)').matches?paths.still:paths.idle;
    sprite.addEventListener('error',()=>sprite.replaceWith(art||document.createTextNode('◇')),{once:true});
    figure.replaceChildren(sprite);
   }
   const hp=document.createElement('span');hp.className='v113-enemy-vital';
   const total=Math.max(1,actorBarTotal(enemy)),shieldAmount=Math.max(0,enemy.block||0);
   const fill=document.createElement('span');fill.style.width=Math.min(100,Math.max(0,enemy.hp/total*100))+'%';
   const shield=document.createElement('span');shield.className='v113-enemy-shield-fill';shield.style.width=shieldAmount/total*100+'%';shield.setAttribute('aria-hidden','true');
   const value=document.createElement('span');value.textContent=enemy.hp+'/'+enemy.max;hp.append(fill,shield,value);
   hp.setAttribute('aria-label','生命 '+enemy.hp+'／'+enemy.max+(shieldAmount?'，護盾 '+shieldAmount:''));
   const stats=document.createElement('span');stats.className='v113-enemy-stats';
   if(!enemy.device75&&enemy.damageType!=='none')for(const [kind,name,amount,path] of [
    ['attack','攻擊力',enemy.atk,'M5 19 17 7l3-3v6l-11 9M5 14l5 5M5 19l-2 2'],
    ['defense','物理防禦',enemy.def,'m12 3 8 4v5c0 4-4 7-8 9-4-2-8-5-8-9V7z'],
    ['resistance','法術抗性',enemy.res,'m12 2 8 10-8 10-8-10z M12 7v10M9 12h6']
   ]){
    const line=document.createElement('span');line.dataset.enemyStat=kind;
    line.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+path+'"/></svg>';
    line.append(String(amount??0));
    line.setAttribute('aria-label',name+' '+(amount??0)+(kind==='resistance'?'%':''));
    stats.append(line);
   }
   const entries=statusDetails(enemy).map(statusEffect46);if(enemy.block>0)entries.unshift(effect46('shield','護盾：目前'+enemy.block+'點，依傷害結算抵擋。',enemy.block));if(enemy.nextDamageVulnerability>0)entries.push(effect46('vulnerable','下次受傷增加'+Math.round(enemy.nextDamageVulnerability*100)+'%，結算後消耗。',Math.round(enemy.nextDamageVulnerability*100)+'%',true));const icons=effectStrip46(entries);icons.classList.add('v113-enemy-statuses');el.classList.toggle('has-enemy-effects46',entries.length>0);
   const phase=el.querySelector('.enemy-phase-label');
   if(phase){phase.classList.add('v113-phase-tag');intent.append(phase)}
   const toughness=toughnessHead48(enemy);if(toughness)intent.append(toughness);el.replaceChildren(intent,icons,figure||document.createElement('span'),hp,stats);
  }
 }

 const statusPaths46={shield:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z',attack:'m4 20 12-12 4-4-1 6-11 11M3 15l6 6',reduce:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6ZM7 12h10',poison:'M8 3h8M10 3v6L5 18q-1 3 2 3h10q3 0 2-3l-5-9V3M8 15h8',bleed:'M12 2s-7 9-7 13a7 7 0 0 0 14 0c0-4-7-13-7-13Z',burn:'M13 2c2 7-5 7-2 12 3-1 4-4 4-4 9 10-8 16-10 6-1-5 5-8 8-14Z',cold:'M12 2v20M3 7l18 10M3 17 21 7M8 4l4 3 4-3M8 20l4-3 4 3',bind:'m9 15 6-6M8 17l-2 2a4 4 0 0 1-5-5l5-5a4 4 0 0 1 5 0m2-2 2-2a4 4 0 0 1 5 5l-5 5a4 4 0 0 1-5 0',card:'M5 3h14v18H5ZM9 9l3-3 3 3m-3-3v10',heal:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z',mark:'M12 2 22 12 12 22 2 12ZM12 7v7m0 3v1'};
 Object.assign(statusPaths46,{slow:'M5 3h14M5 21h14M7 3v4l10 10v4M17 3v4L7 17v4',silence:'M3 4h18v13H9l-5 4v-4H3ZM4 3l16 18',weightless:'M6 20 18 4M5 14q-3-8 8-11 10-2 4 9-3 6-9 4',stun:'m12 2 2 7 7-2-5 5 5 5-7-2-2 7-2-7-7 2 5-5-5-5 7 2Z',vulnerable:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6ZM13 4l-4 7 6 2-5 7',mental:'M11 4C7 0 2 5 5 9 0 12 5 18 9 16l2 5M13 4c4-4 9 1 6 5 5 3 0 9-4 7l-2 5M12 3v18M6 10l4 2m4-1 4 2',cold:'M10 4a2 2 0 0 1 4 0v11a4 4 0 1 1-4 0ZM12 8v10m6-12h3m-3 4h3',freeze:'M12 2v20M3 7l18 10M3 17 21 7M8 4l4 3 4-3M8 20l4-3 4 3',blind:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM3 3l18 18',weak:'m4 20 8-8-3-3 5-2 6-4-2 6-5 3 3 3-8 8M3 15l6 6',resist:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6ZM9 8l5 4-5 4m6-4h4'});
 function statusEffect46(entry){const text=entry.text,kind=/中毒/.test(text)?'poison':/流血|傷口/.test(text)?'bleed':/灼/.test(text)?'burn':/凍結/.test(text)?'freeze':/寒冷/.test(text)?'cold':/束縛|纏繞/.test(text)?'bind':/精神|神經/.test(text)?'mental':/破甲|侵蝕/.test(text)?'vulnerable':/法抗/.test(text)?'resist':/虛弱/.test(text)?'weak':/沉默/.test(text)?'silence':/遲滯/.test(text)?'slow':/失重/.test(text)?'weightless':/暈眩|壓制|震盪/.test(text)?'stun':/致盲/.test(text)?'blind':/瞄準|鎖定|獵痕/.test(text)?'attack':/降低/.test(text)?'reduce':'mark',number=text.match(/（([^）]+)）/);return effect46(kind,text,number?number[1].split('，')[0].replace(' 層',''):'',true)}

 function toughnessHead48(enemy){const p=FrontierBreaks.progress(enemy);if(!p)return null;const box=document.createElement('span');box.className='v113-toughness48';const values=[['vulnerable',Math.min(p.damage,p.required),p.required,'韌性值／破韌值：傷害進度 '+Math.round(p.damage*10)/10+'/'+p.required+'。經防禦、法抗與減傷後的結算傷害（含護盾吸收）預設以1:1累積；幹員或卡牌可有額外倍率／固定破韌。'],['bind',Math.min(p.control,p.controlRequired),p.controlRequired,'失衡衝擊：控制進度 '+p.control+'/'+p.controlRequired+'。有效控制或卡牌額外失衡衝擊累積達標時，取消這次特殊行動。']];for(const [kind,current,required,label]of values){const tile=document.createElement('span');tile.className='toughness-stat48';tile.dataset.battleStatus=(p.solved?'韌性已擊破；本次特殊行動取消。':'兩項進度任一達標即可打斷；只在這次特殊行動期間累積。')+label;tile.setAttribute('aria-label',tile.dataset.battleStatus);tile.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+statusPaths46[kind]+'"/></svg>';const n=document.createElement('b');n.textContent=(Math.round(current*10)/10)+'/'+required;tile.append(n);box.append(tile)}return box}

 function effect46(kind,label,badge,negative=false,strength){return{kind,label,badge:badge==null?'':String(badge),negative,strength}}
 function liveBuff46(x,turn){return x.remaining!==0&&(x.expiresTurn==null||x.expiresTurn>=turn)}
 function buffEffect46(x,b){const f=x.filter||{},effect={damage:'傷害',shield:'護盾',heal:'治療',damageOrShield:'傷害／護盾'}[f.effect]||(f.attack?'攻擊牌效果':f.support?'支援牌效果':'卡牌效果'),source=R().team.find(a=>a.uid===x.source),parts=[effect+' '+(x.amount>=0?'＋':'')+Math.round(x.amount*100)+'%', '來源：'+(source?name(source):'戰術效果')];if(f.owner)parts.push('僅限此幹員');if(f.other)parts.push('僅限來源以外的幹員');if(f.profession)parts.push('限定職業：'+f.profession);if(f.form)parts.push('限定型態：'+f.form);if(f.cost)parts.push('限定費用：'+f.cost);if(f.aoe)parts.push('僅限範圍卡牌');if(f.damageType)parts.push('限定傷害：'+({arts:'法術',physical:'物理',true:'真實'}[f.damageType]||f.damageType));if(f.target){const e=b.enemies.find(e=>e.uid===f.target);parts.push('限定目標：'+(e?.name||'指定敵人'))}if(f.weightless)parts.push('僅對失重目標生效');if(f.texasMarked)parts.push('僅對德克薩斯標記目標生效');if(x.startsTurn!=null&&x.startsTurn>b.turn)parts.push('第'+x.startsTurn+'回合起生效（目前待生效）');if(x.remaining!=null)parts.push('剩餘'+x.remaining+'次，符合條件並結算時消耗');if(x.expiresTurn!=null)parts.push('至第'+x.expiresTurn+'回合末');if(x.distinctOwners)parts.push('同一幹員不可重複消耗；已使用'+(x.usedOwners?.length||0)+'名');if(x.distinctCards)parts.push('同名卡不可重複消耗；已使用'+(x.usedCards?.length||0)+'種');return effect46(f.effect==='shield'?'shield':f.effect==='heal'?'heal':f.attack?'attack':'card',parts.join('；'),x.remaining!=null?x.remaining+'次':Math.round(x.amount*100)+'%',x.amount<0,Math.abs(x.amount*100))}
 function actorEffects46(a,b){const out=[];if(b.operatorPhase==='player'&&a.texasAmbushDamage49?.turn===b.turn)out.push(effect46('attack','瞬身勢能：本次己方回合後續自身傷害＋'+Math.round(a.texasAmbushDamage49.amount*100)+'%；與全域增傷合併遞減，回合結束失效。','',false,a.texasAmbushDamage49.amount*100));const add=(kind,label,n,neg=false)=>out.push(effect46(kind,label,n,neg));if(a.block>0)add('shield','護盾：目前'+a.block+'點，依實際受傷結算抵擋傷害。',a.block);for(const [key,label]of [['nextIncomingReduction','下次受傷減傷'],['nextSingleIncomingReduction','下次單體受傷減傷']])if(a[key]>0)add('reduce',label+'：'+Math.round(a[key]*100)+'%；符合條件時消耗。',Math.round(a[key]*100)+'%');if(a.nextDamageReductionFlat>0)add('reduce','下次傷害固定減免'+a.nextDamageReductionFlat+'點。',a.nextDamageReductionFlat);if(a.guard)add('shield','護衛：'+name(R().team.find(x=>x.uid===a.guard.source)||{})+'承受下一次可攔截單體攻擊。','1次');if(a.power>0)add('attack','攻擊加成：＋'+a.power+'，依目前卡牌傷害結算套用。',a.power);if(a.thorns>0)add('attack','反擊傷害：'+a.thorns+'，符合反擊條件時觸發。',a.thorns);if(a.nextAttackIgnoreDef>0)add('attack','下一張攻擊牌忽略'+a.nextAttackIgnoreDef+'點防禦，使用後消耗。',a.nextAttackIgnoreDef);if(a.nightSwitch?.remaining>0)add('attack','夜色轉換：攻擊轉為法術傷害，增傷'+Math.round(a.nightSwitch.bonus*100)+'%；剩餘'+a.nightSwitch.remaining+'次。',a.nightSwitch.remaining+'次');if(a.perfectTiming?.remaining>0)add('attack','完美時機：普通攻擊不消耗準星；血量傷害增加'+Math.round(a.perfectTiming.bonus*100)+'%；剩餘'+a.perfectTiming.remaining+'次。',a.perfectTiming.remaining+'次');if(a.duelLink74?.remaining>0&&a.duelLink74.expiresTurn>=b.turn&&b.enemies.some(e=>e.uid===a.duelLink74.target&&e.hp>0))add('attack','決鬥突破：對指定敵人的物理攻擊忽略'+Math.round(a.duelLink74.penetration*100)+'%原有防禦；剩餘'+a.duelLink74.remaining+'張牌，本回合及下個己方回合有效。',a.duelLink74.remaining+'次');if(a.embers?.active)add('burn','餘燼：免疫傷害及治療。','');if(a.duel?.remaining>0)add('attack','決鬥：對指定敵人增傷'+Math.round((a.duel.outBonus||0)*100)+'%；剩餘'+a.duel.remaining+'次。',a.duel.remaining+'次');for(const x of b.cardBuffs||[])if(x.filter?.owner===a.operator&&(!x.filter.other||x.source!==a.uid)&&(!x.filter.profession||x.filter.profession===a.profession)&&(!x.filter.form||x.filter.form===a.form)&&liveBuff46(x,b.turn))out.push(buffEffect46(x,b));for(const entry of statusDetails(a))out.push(statusEffect46(entry));if(a.disarmed75===b.turn)add('mark','繳械：本回合無法使用攻擊牌，仍能治療與防護。','1回',true);if(a.stunnedTurn===b.turn)add('mark','暈眩：本回合無法正常行動。','1回',true);if(a.exhaustedTurn===b.turn)add('mark','力竭：本回合受力竭限制。','1回',true);return out}
 function effectStrip46(entries){const host=document.createElement('span');host.className='battle-effects46';for(const e of entries){const button=document.createElement('button');button.type='button';button.className='battle-effect46 '+(e.negative?'negative':'positive');button.dataset.battleStatus=e.label;button.setAttribute('title',e.label);button.setAttribute('aria-label',e.label);button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(statusPaths46[e.kind]||statusPaths46.mark)+'"/></svg><em>'+(e.negative?'−':'+')+'</em>';if(e.badge.endsWith('%')||Number.isFinite(e.strength)){button.classList.add('percentage');button.style.setProperty('--effect-fill',Math.max(0,Math.min(100,e.strength??Math.abs(parseFloat(e.badge)||0)))+'%')}if(e.badge&&!e.badge.endsWith('%')){const badge=document.createElement('small');badge.textContent=e.badge.replace(/次$/,'');button.append(badge)}host.append(button)}return host}
 function mountCommon46(board,b){const entries=(b.cardBuffs||[]).filter(x=>!x.filter?.owner&&liveBuff46(x,b.turn)).map(x=>buffEffect46(x,b));const flags=R().curios?.battle?.flags||{};const ready=(id,text,badge)=>{if(flags[id])entries.push(effect46('card',(FrontierCurioData.entries[id]?.name||'收藏品')+'：'+text,badge))};ready('R001','下一張攻擊牌增傷20%，觸發後消耗。','20%');ready('R010','下一張費用至少2的攻擊牌追加30%追擊，觸發後消耗。','30%');ready('R014','下一張費用1且有傷害或護盾的卡牌效果增加10%，觸發後消耗。','10%');ready('R023','下一張由先前防禦牌使用者以外的幹員施放的攻擊牌增傷10%，觸發後消耗。','10%');if(flags.R009?.turn>=b.turn){const target=b.enemies.find(e=>e.id===flags.R009.target);entries.push(effect46('attack','收藏品：第'+flags.R009.turn+'回合攻擊'+(target?.name||'指定首領')+'時增傷25%，觸發後消耗。','25%'))}if(flags.resonancePursuit)entries.push(effect46('attack','收藏品共鳴：下一次追擊效果額外增加20%，觸發後消耗。','20%'));if(!entries.length)return;const area=document.createElement('div');area.className='battle-common46';const label=document.createElement('b');label.textContent='通用效果';area.append(label,effectStrip46(entries));board.querySelector('.v113-status-lane')?.prepend(area)}
 let effectHold46=null,effectTip46=null;function clearEffect46(){clearTimeout(effectHold46?.timer);effectHold46=null;effectTip46?.remove();effectTip46=null}
 window.addEventListener('pointerdown',e=>{const button=e.target.closest?.('[data-battle-status]');if(!button)return;e.preventDefault();e.stopImmediatePropagation();clearEffect46();effectHold46={x:e.clientX,y:e.clientY,scroller:button.closest('.battle-effects46'),left:button.closest('.battle-effects46')?.scrollLeft||0,timer:setTimeout(()=>{const tip=document.createElement('aside');tip.className='v113-actor-tooltip battle-effect-tip46';tip.setAttribute('role','tooltip');tip.textContent=button.dataset.battleStatus;FrontierInspector.attach(tip);effectTip46=tip},250)}},true);
 window.addEventListener('pointermove',e=>{if(!effectHold46)return;const dx=e.clientX-effectHold46.x,dy=e.clientY-effectHold46.y;if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){clearTimeout(effectHold46.timer);effectTip46?.remove();effectTip46=null;if(effectHold46.scroller)effectHold46.scroller.scrollLeft=effectHold46.left-dx;e.preventDefault();e.stopImmediatePropagation()}else if(Math.abs(dy)>12)clearEffect46()},{capture:true,passive:false});for(const type of ['pointerup','pointercancel','blur'])window.addEventListener(type,clearEffect46,true);document.addEventListener('click',e=>{if(e.target.closest?.('[data-battle-status]')){e.preventDefault();e.stopImmediatePropagation()}},true);

 function statusIcon(symbol,label){const icon=document.createElement('i');icon.textContent=symbol;icon.setAttribute('aria-label',label);return icon}
 const operatorImpacts={
  char_123_fang:["thrust","#79baff",-19],
  operator_v31_vanilla:["thrust","#b9dd86",-7],
  operator_v31_plume:["thrust","#f1ca87",-26],
  char_208_melan:["rose","#f67da6",0],
  operator_v31_popukar:["saw","#ff9d85",10],
  operator_v31_midnight:["silver-cut","#be9cf0",-4],
  operator_v31_cardigan:["shield-bash","#a7cbe9",8],
  operator_v31_spot:["shield-bash","#e1ba79",-5],
  char_124_kroos:["bolts","#ffd084",0],
  operator_v31_adnachiel:["pierce","#d9c2ff",-9],
  operator_v31_catapult:["blast","#f4a747",-11],
  operator_v31_lava:["blast","#fb8060",-9],
  char_210_stward:["arts","#99cefb",-2],
  hibiscus:["heal","#b99dff",-6],
  operator_v31_ansel:["heal","#82e3bb",7],
  operator_v31_orchid:["arc","#d9b3f2",-13],
  char_151_myrtle:["arc","#c0ec9a",17],
  char_355_ethan:["tether","#92e3c9",-3],
  char_272_strong:["rose","#edc89b",17],
  amiya:["arts-burst","#ad86ff",0],
  operator_v31_ambriel:["pierce","#ff99b4",0],
  operator_v31_vigna:["thrust","#ff7e70",6],
  char_102_texas:["silver-cut","#92acf8",4],
  operator_v31_lapluma:["arc","#e9a4bd",-18],
  char_140_whitew:["arc","#d0e2fb",-10],
  operator_v31_cantabile:["pierce","#86e7e0",11],
  char_128_plosis:["heal","#9ccfff",0],
  operator_v31_projektred:["rose","#ff695b",-19],
  operator_v31_heavyrain:["shield","#c8e3f4",8],
  operator_v31_warfarin:["arts","#ff7498",7],
  char_103_angel:["gun-burst","#ffbd65",0],
  char_202_demkni:["shield-bash","#fed69a",-4],
  char_172_svrash:["silver-cut","#c2e5f9",0],
  operator_v31_surtr:["arc","#ff8454",-6],
  operator_v31_eyjafjalla:["blast","#ff9f6b",0],
  operator_v31_hoshiguma:["shield-bash","#a5ed82",0],
  operator_v31_skadi:["silver-cut","#88cfc7",15],
  operator_v31_angelina:["tether","#ffc993",-12],
  operator_v31_mlynar:["silver-cut","#ffdea0",-12],
  operator_v31_specter:["saw","#ecd6e3",-10],
  operator_v31_muelsyse:["tether","#7ee5f3",9],
  operator_v31_aak:["gun-burst","#d4f08a",8],
  texas_the_omertosa:["rose","#a5a8ff",20]
 };
 const signatureClips={
  "char_123_fang:standard":"assets/signature-preview/char_123_fang.webp",
  "operator_v31_vanilla:standard":"assets/signature-preview/char_240_wyvern.webp",
  "operator_v31_plume:standard":"assets/signature-preview/char_192_falco.webp",
  "char_208_melan:standard":"assets/signature-preview/char_208_melan.webp",
  "operator_v31_popukar:standard":"assets/signature-preview/char_281_popka.webp",
  "operator_v31_midnight:standard":"assets/signature-preview/char_283_midn.webp",
  "operator_v31_cardigan:standard":"assets/signature-preview/char_209_ardign.webp",
  "operator_v31_spot:standard":"assets/signature-preview/char_284_spot.webp",
  "char_124_kroos:standard":"assets/signature-preview/char_124_kroos.webp",
  "operator_v31_adnachiel:standard":"assets/signature-preview/char_211_adnach.webp",
  "operator_v31_catapult:standard":"assets/signature-preview/char_282_catap.webp",
  "operator_v31_lava:standard":"assets/signature-preview/char_121_lava.webp",
  "char_210_stward:standard":"assets/signature-preview/char_210_stward.webp",
  "hibiscus:standard":"assets/signature-preview/char_120_hibisc.webp",
  "operator_v31_ansel:standard":"assets/signature-preview/char_212_ansel.webp",
  "operator_v31_orchid:standard":"assets/signature-preview/char_278_orchid.webp",
  "char_151_myrtle:standard":"assets/signature-preview/char_151_myrtle.webp",
  "char_355_ethan:standard":"assets/signature-preview/char_355_ethan.webp",
  "char_272_strong:standard":"assets/signature-preview/char_272_strong.webp",
  "amiya:caster":"assets/signature-preview/amiya-caster.webp",
  "amiya:guard":"assets/signature-preview/char_1001_amiya2.webp",
  "amiya:medic":"assets/signature-preview/char_1037_amiya3.webp",
  "operator_v31_ambriel:standard":"assets/signature-preview/char_302_glaze.webp",
  "operator_v31_vigna:standard":"assets/signature-preview/char_290_vigna.webp",
  "char_102_texas:standard":"assets/signature-preview/char_102_texas.webp",
  "operator_v31_lapluma:standard":"assets/signature-preview/char_421_crow.webp",
  "char_140_whitew:standard":"assets/signature-preview/char_140_whitew.webp",
  "operator_v31_cantabile:standard":"assets/signature-preview/char_497_ctable.webp",
  "char_128_plosis:standard":"assets/signature-preview/char_128_plosis.webp",
  "operator_v31_projektred:standard":"assets/signature-preview/char_144_red.webp",
  "operator_v31_heavyrain:standard":"assets/signature-preview/char_304_zebra.webp",
  "operator_v31_warfarin:standard":"assets/signature-preview/char_171_bldsk.webp",
  "char_103_angel:standard":"assets/signature-preview/char_103_angel.webp",
  "char_202_demkni:standard":"assets/signature-preview/char_202_demkni.webp",
  "char_172_svrash:standard":"assets/signature-preview/char_172_svrash.webp",
  "operator_v31_surtr:standard":"assets/signature-preview/char_350_surtr.webp",
  "operator_v31_eyjafjalla:standard":"assets/signature-preview/char_180_amgoat.webp",
  "operator_v31_hoshiguma:standard":"assets/signature-preview/char_136_hsguma.webp",
  "operator_v31_skadi:standard":"assets/signature-preview/char_263_skadi.webp",
  "operator_v31_angelina:standard":"assets/signature-preview/char_291_aglina.webp",
  "operator_v31_mlynar:standard":"assets/signature-preview/char_4064_mlynar.webp",
  "operator_v31_specter:standard":"assets/signature-preview/char_143_ghost.webp",
  "operator_v31_muelsyse:standard":"assets/signature-preview/char_249_mlyss.webp",
  "operator_v31_aak:standard":"assets/signature-preview/char_225_haak.webp",
  "texas_the_omertosa:standard":"assets/signature-preview/texas-omertosa.webp"
 };
 const clipCache=new Map(),warmedSignatureArt=new Set();
 const ordinaryClips={
  "char_123_fang:standard":"ordinary-char_123_fang.webp",
  "operator_v31_vanilla:standard":"ordinary-char_240_wyvern.webp",
  "operator_v31_plume:standard":"ordinary-char_192_falco.webp",
  "char_208_melan:standard":"ordinary-char_208_melan.webp",
  "operator_v31_popukar:standard":"ordinary-char_281_popka.webp",
  "operator_v31_midnight:standard":"ordinary-char_283_midn.webp",
  "operator_v31_cardigan:standard":"ordinary-char_209_ardign.webp",
  "operator_v31_spot:standard":"ordinary-char_284_spot.webp",
  "char_124_kroos:standard":"ordinary-char_124_kroos.webp",
  "operator_v31_adnachiel:standard":"ordinary-char_211_adnach.webp",
  "operator_v31_catapult:standard":"ordinary-char_282_catap.webp",
  "operator_v31_lava:standard":"ordinary-char_121_lava.webp",
  "char_210_stward:standard":"ordinary-char_210_stward.webp",
  "hibiscus:standard":"ordinary-hibiscus.webp",
  "operator_v31_ansel:standard":"ordinary-char_212_ansel.webp",
  "operator_v31_orchid:standard":"ordinary-char_278_orchid.webp",
  "char_151_myrtle:standard":"ordinary-char_151_myrtle.webp",
  "char_355_ethan:standard":"ordinary-char_355_ethan.webp",
  "char_272_strong:standard":"ordinary-char_272_strong.webp",
  "amiya:caster":"ordinary-amiya.webp",
  "amiya:guard":"ordinary-char_1001_amiya2.webp",
  "amiya:medic":"ordinary-char_1037_amiya3.webp",
  "operator_v31_ambriel:standard":"ordinary-char_302_glaze.webp",
  "operator_v31_vigna:standard":"ordinary-char_290_vigna.webp",
  "char_102_texas:standard":"ordinary-char_102_texas.webp",
  "operator_v31_lapluma:standard":"ordinary-char_421_crow.webp",
  "char_140_whitew:standard":"ordinary-char_140_whitew.webp",
  "operator_v31_cantabile:standard":"ordinary-char_497_ctable.webp",
  "char_128_plosis:standard":"ordinary-char_128_plosis.webp",
  "operator_v31_projektred:standard":"ordinary-char_144_red.webp",
  "operator_v31_heavyrain:standard":"ordinary-char_304_zebra.webp",
  "operator_v31_warfarin:standard":"ordinary-char_171_bldsk.webp",
  "char_103_angel:standard":"ordinary-char_103_angel.webp",
  "char_202_demkni:standard":"ordinary-char_202_demkni.webp",
  "char_172_svrash:standard":"ordinary-char_172_svrash.webp",
  "operator_v31_surtr:standard":"ordinary-char_350_surtr.webp",
  "operator_v31_eyjafjalla:standard":"ordinary-char_180_amgoat.webp",
  "operator_v31_hoshiguma:standard":"ordinary-char_136_hsguma.webp",
  "operator_v31_skadi:standard":"ordinary-char_263_skadi.webp",
  "operator_v31_angelina:standard":"ordinary-char_291_aglina.webp",
  "operator_v31_mlynar:standard":"ordinary-char_4064_mlynar.webp",
  "operator_v31_specter:standard":"ordinary-char_143_ghost.webp",
  "operator_v31_muelsyse:standard":"ordinary-char_249_mlyss.webp",
  "operator_v31_aak:standard":"ordinary-char_225_haak.webp",
  "texas_the_omertosa:standard":"ordinary-texas.webp"
 };
 function loadClip(path){
  if(!path)return null;
  if(!clipCache.has(path))clipCache.set(path,fetch(path).then(response=>response.ok?response.blob():null).catch(()=>null));
  return clipCache.get(path);
 }
 function signatureClip(actor){return loadClip(signatureClips[actor.operator+':'+actor.form])}
 function ordinaryClip(actor){
  const clip=ordinaryClips[actor.operator+':'+actor.form];
  return clip?loadClip('assets/signature-preview/'+clip):null;
 }
 let ordinaryCueNode=null;
 function ordinaryCue(actor,card,selection={},override){
  if(!matchMedia('(max-width:720px)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const info=G.effects.describe(card),entries=G.effects.definitions.get(card);
  const desc=Object.values(entries?.sourceEffects||{})[0]||G.tacticText(card)||cards[card]?.text||'';
  const healing=!info?.attack&&/治療|恢復.{0,14}(?:HP|生命)|回復.{0,14}(?:HP|生命)/.test(desc);
  const kind=override||(info?.attack||cards[card]?.kind==='attack'||cards[card]?.kind==='all'?'attack':healing?'heal':/護盾|格擋/.test(desc)?'shield':/抽.{0,5}牌|棄.{0,5}牌/.test(desc)?'draw':'support');
  const battle=R()?.battle?.operatorBattleId;
  if(!battle)return;
  measure134(()=>{
   if(page!=='run'||R()?.battle?.operatorBattleId!==battle)return;
   const rows=[...document.querySelectorAll('.v113-actor-row')];
   const chosen=selection.targets?.[0]||selection.target;
   const recipient=rows.find(el=>el.dataset.operatorUid===chosen);
   const row=rows.find(el=>el.dataset.operatorUid===actor?.uid);
   const enemies=[...document.querySelectorAll('.enemy-card[data-enemy-id]')];
   const targetEnemy=enemies.find(el=>el.dataset.enemyId===chosen)||enemies[0];
   const anchor=(kind==='draw'?document.querySelector('.hand-caption'):kind==='heal'||kind==='shield'?recipient||row:kind==='attack'?targetEnemy||row:row)||targetEnemy;
   if(!anchor)return;
   return rect134(anchor);
  },rect=>{
   if(page!=='run'||R()?.battle?.operatorBattleId!==battle)return;
   const node=document.createElement('span');
   node.className='v113-card-cue';node.dataset.effect=kind;
   node.setAttribute('aria-hidden','true');
   node.style.left=Math.min(innerWidth-30,Math.max(30,rect.left+rect.width*(kind==='draw'?.86:.53)))+'px';
   node.style.top=Math.max(8,rect.top+rect.height*.25)+'px';
   ordinaryCueNode?.remove();
   ordinaryCueNode=node;
   document.body.append(node);
   setTimeout(()=>{node.remove();if(ordinaryCueNode===node)ordinaryCueNode=null},550);
  },'ordinary-cue');
 }
 let ordinaryOverlay=null,ordinarySequence=0;
 function ordinaryAnimation(actor){
  if(!actor||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const clip=ordinaryClip(actor);
  if(!clip)return;
  const seq=++ordinarySequence,started=performance.now(),battle=R()?.battle?.operatorBattleId;
  ordinaryOverlay?.remove();
  ordinaryOverlay=null;
  clip.then(blob=>{
   if(!blob||seq!==ordinarySequence||performance.now()-started>150||!battle||R()?.battle?.operatorBattleId!==battle)return;
   measure134(()=>{
   if(seq!==ordinarySequence||R()?.battle?.operatorBattleId!==battle)return;
   const row=document.querySelector('.v113-actor-row[data-operator-uid="'+CSS.escape(actor.uid)+'"]');
   if(!row)return;
   const anchor=rect134(row.querySelector('.avatar')||row),size=Math.min(78,Math.max(60,innerWidth*.19));
   return {anchor,size};
   },({anchor,size})=>{
   if(seq!==ordinarySequence||R()?.battle?.operatorBattleId!==battle)return;
   const node=document.createElement('span'),image=document.createElement('img');
   const url=URL.createObjectURL(blob);
   node.className='v113-ordinary-cast';
   node.dataset.effect=actor.profession==='醫療'?'heal':actor.profession==='術師'?'arts':'strike';
   node.setAttribute('aria-hidden','true');
   node.style.left=Math.min(innerWidth-size-4,anchor.right+2)+'px';
   node.style.top=Math.max(12,anchor.top+(anchor.height-size)*.5)+'px';
   node.style.width=node.style.height=size+'px';
   image.alt='';image.draggable=false;image.src=url;node.append(image);
   ordinaryOverlay=node;document.body.append(node);
   setTimeout(()=>{node.remove();URL.revokeObjectURL(url);if(ordinaryOverlay===node)ordinaryOverlay=null},455);
   },'ordinary-clip');
  });
 }
 let signatureOverlay=null;
 function signatureAnimation(actor,skill){
  if(!actor||!skill||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const unit=FrontierCapture.units[actor.id],appearance=window.FrontierAppearance80;
  if(!unit)return;
  const [,tint,angle]=operatorImpacts[actor.operator]||['hit','#ace6ff',0];
  const overlay=document.createElement('div');
  overlay.className='v113-signature-cut-in';
  overlay.setAttribute('aria-hidden','true');
  overlay.dataset.effect=['physical','arts','true','heal','shield'].includes(skill.type)?skill.type:skill.type==='protection'?'shield':'support';
  overlay.style.setProperty('--cut-in-color',tint);
  overlay.style.setProperty('--cut-in-angle',angle+'deg');
  const art=document.createElement('img');
  art.alt='';art.draggable=false;
  const portrait=appearance?.src(actor.id,'portrait',actor.form)||'assets/'+unit.image+'.png';
  overlay.append(art);
  signatureOverlay?.remove();
  signatureOverlay=overlay;
  let started=false;
  const start=blob=>{
   if(started||signatureOverlay!==overlay)return;
   started=true;
   const clipUrl=blob&&URL.createObjectURL(blob);
   if(clipUrl){
    overlay.classList.add('v113-original-cut-in');
    art.src=clipUrl;
   }else{
    art.src=appearance?.src(actor.id,'full',actor.form)||portrait;
    art.addEventListener('error',()=>{art.src=portrait},{once:true});
    const effect=document.createElement('span');effect.className='v113-signature-cast-wave';
    overlay.append(effect);
   }
   document.body.append(overlay);
   setTimeout(()=>{
    overlay.remove();
    if(clipUrl)URL.revokeObjectURL(clipUrl);
    if(signatureOverlay===overlay)signatureOverlay=null;
   },1260);
  };
  const clip=signatureClip(actor);
  if(clip){
   clip.then(start);
   setTimeout(()=>start(null),150);
  }else start(null);
 }
 function playFeedback(previous,attack={}){
  const [attackImpact,tint,angle]=operatorImpacts[attack.operator]||['hit','#ffd3a0',0];
  const run=R(),battleId=run?.battle?.operatorBattleId;
  if(!battleId)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const detailedImpact=!reduced&&!(attack.ordinary&&matchMedia('(max-width:720px)').matches);
  const jobs=[],fragment=document.createDocumentFragment();
  const hits=new Map();
  if(detailedImpact&&['arts-burst','gun-burst'].includes(attackImpact)&&Number.isInteger(previous.eventCount)){
   const events=run.battle.operatorEvents||[];
   for(let i=previous.eventCount;i<events.length;i++){
    const hit=events[i];
    if(hit.type==='directCardDamage'&&hit.damage>0)hits.set(hit.target,(hits.get(hit.target)||0)+1);
   }
  }
  const colors={damage:'#ffab91',heal:'#a0ffb8',shield:'#a8dcff',absorbed:'#d0d9e4',buff:'#ffe69d'};
  function collect(selector,dataset,id,changes,uid){
   const values=changes.filter(([,n])=>n>0);
   if(!values.length)return;
   jobs.push({selector,dataset,id,values,uid});
  }
  function show({values,rect,uid}){
   const group=document.createElement('span');
   group.setAttribute('aria-hidden','true');group.className='v113-battle-float';
   Object.assign(group.style,{position:'fixed',left:Math.max(32,Math.min(innerWidth-32,rect.left+rect.width*.5))+'px',top:Math.max(52,rect.top+rect.height*.32)+'px',zIndex:'100',pointerEvents:'none',display:'flex',gap:'7px',transform:'translateX(-50%)',font:'700 21px system-ui',whiteSpace:'nowrap',textShadow:'0 1px 4px #000,0 0 5px #000'});
   for(const [type,amount] of values){
    const label=document.createElement('span');
    label.style.color=colors[type];
    label.textContent=type==='buff'?'增益':(type==='damage'?'−':type==='shield'?'+':type==='absorbed'?'−':'+')+amount;
    group.append(label);
   }
   fragment.append(group);
   let impact;
   if(detailedImpact){
    const kind=values.some(([type])=>type==='damage')?attackImpact:values.some(([type])=>type==='heal')?'heal':values.some(([type])=>type==='shield'||type==='absorbed')?'shield':'buff';
    impact=document.createElement('span');
    impact.className='v113-impact';
    impact.dataset.impact=kind;
    if(kind===attackImpact){
     impact.style.setProperty('--impact-tint',tint);
     impact.style.setProperty('--impact-angle',angle+'deg');
    }
    if(kind==='arts-burst'||kind==='gun-burst'){
     const count=Math.min(kind==='gun-burst'?6:4,hits.get(uid)||1);
     for(let i=0;i<count;i++){
      const projectile=document.createElement('i');
      projectile.style.setProperty('--shot',i);
      projectile.style.setProperty('--shot-lane',((i%2?1:-1)*(5+i*3))+'px');
      impact.append(projectile);
     }
    }
    impact.setAttribute('aria-hidden','true');
    impact.style.left=group.style.left;
    impact.style.top=Math.max(52,rect.top+rect.height*.47)+'px';
    impact.style.setProperty('--impact-width',Math.min(140,Math.max(62,rect.width*.83))+'px');
    fragment.insertBefore(impact,group);
    impact.addEventListener('animationend',event=>{if(event.target===impact)impact.remove()},{once:true});
   }
   if(!reduced){
    group.animate?.([{transform:'translate(-50%,4px) scale(.92)',opacity:.85},{transform:'translate(-50%,-10px) scale(1.06)',opacity:1,offset:.22},{transform:'translate(-50%,-19px)',opacity:1,offset:.64},{transform:'translate(-50%,-38px)',opacity:0}],{duration:1270,easing:'ease-out',fill:'forwards'});
   }
   setTimeout(()=>{group.remove();impact?.remove()},reduced?700:1290);
  }
  const actorBuffs=['power','thorns','nextAttackIgnoreDef','nextIncomingReduction','nextSingleIncomingReduction','nextDamageReductionFlat','nextAttackDefense','guard','nightSwitch','perfectTiming','duelLink74','duel','regens','medicalMonitor','slowRelease'];
  const granted=new Set();
  if(previous.cardBuffs){
   const key=b=>JSON.stringify([b.source,b.filter,b.amount,b.expiresTurn,b.startsTurn]);
   const old=new Map();
   for(const buff of previous.cardBuffs){const id=key(buff);old.set(id,(old.get(id)||0)+1)}
   for(const buff of run.battle.cardBuffs||[]){
    if(!(buff.amount>0)||!liveBuff46(buff,run.battle.turn))continue;
    const id=key(buff),count=old.get(id)||0;
    if(count){old.set(id,count-1);continue}
    const filter=buff.filter||{};
    for(const a of run.team)if(a.hp>0&&!a.exited&&(!filter.owner||a.operator===filter.owner)&&(!filter.other||a.uid!==buff.source)&&(!filter.profession||a.profession===filter.profession)&&(!filter.form||a.form===filter.form))granted.add(a.uid);
   }
  }
  function strengthened(before,after){
   return actorBuffs.some(k=>{
    const a=after[k],b=before[k];
    if(!a)return false;
    if(typeof a==='number')return a>(b||0);
    if(Array.isArray(a))return a.length>(b?.length||0);
    return !b||(a.remaining||0)>(b.remaining||0)||(a.amount||0)>(b.amount||0)||
      (a.expiresEnemyPhase||0)>(b.expiresEnemyPhase||0)||(a.expiresTurn||0)>(b.expiresTurn||0);
   });
  }
  function match(selector,previousUnits,currentUnits,key,dataset){
   for(const after of currentUnits){
    const id=String(after[key]),before=previousUnits.find(a=>String(a[key])===id);
    if(!before)continue;
    collect(selector,dataset,id,[['damage',before.hp-after.hp],['heal',after.hp-before.hp],['shield',(after.block||0)-(before.block||0)],['absorbed',(before.block||0)-(after.block||0)],['buff',dataset==='operatorUid'&&previous.cardBuffs&&(granted.has(after.uid)||strengthened(before,after))?1:0]],after.uid);
   }
  }
  match('.enemy-card[data-enemy-id]',previous.enemies,run.battle.enemies,'id','enemyId');
  match('.v113-actor-row',previous.team,run.team,'uid','operatorUid');
  if(!jobs.length)return;
  measure134(()=>{
   if(R()?.battle?.operatorBattleId!==battleId)return;
   const board=document.querySelector('.v113-battle-board');
   if(!board)return;
   const groups=new Map();
   const measured=jobs.map(job=>{
    if(!groups.has(job.selector))groups.set(job.selector,new Map([...board.querySelectorAll(job.selector)].map(node=>[node.dataset[job.dataset],node])));
    const node=groups.get(job.selector).get(job.id);
    return node&&{values:job.values,uid:job.uid,rect:rect134(node)};
   });
   return measured;
  },measured=>{
   if(R()?.battle?.operatorBattleId!==battleId)return;
   for(const job of measured)if(job)show(job);
   document.body.append(fragment);
  });
 }
 let forecastTimer,forecastFrame,forecastIdle,lastBattleInput=performance.now();
 document.addEventListener('pointerdown',event=>{if(event.target.closest?.('.v113-battle-board'))lastBattleInput=performance.now()},{capture:true,passive:true});
 function actorBarTotal(actor){return actor.max+Math.max(0,actor.block||0)}
 function paintForecast(board,battle){
  cancelAnimationFrame(forecastFrame);clearTimeout(forecastTimer);if(forecastIdle!=null)window.cancelIdleCallback?.(forecastIdle);
  /* 狀態一變就先清掉舊預估，避免顯示過時（例如加盾前）的致命預估。 */
  for(const band of board.querySelectorAll('.v113-incoming-grey')){band.style.width='0%';band.removeAttribute('aria-label')}
  function update(){
   if(!board.isConnected||R()?.battle!==battle)return;
   const quiet=performance.now()-lastBattleInput;if(FrontierGestures.active||drawnPointer||FrontierRuntime.busy||quiet<300){forecastTimer=setTimeout(schedule,Math.max(70,300-quiet));return}
   const incoming=G.previewIncoming();
   for(const actor of R().team){
    const band=[...board.querySelectorAll('.v113-actor-row')].find(row=>row.dataset.operatorUid===actor.uid)?.querySelector('.v113-incoming-grey');
    if(!band)continue;
    const amount=Math.min(actor.hp,incoming[actor.uid]||0);
    const total=actorBarTotal(actor);
    band.style.left=(actor.hp-amount)/total*100+'%';band.style.width=amount/total*100+'%';
    band.setAttribute('aria-label','預計受到 '+amount+' 點生命傷害');
   }
  }
  function schedule(){if(!board.isConnected||R()?.battle!==battle)return;if(window.requestIdleCallback)forecastIdle=requestIdleCallback(()=>{forecastIdle=null;update()},{timeout:1000});else forecastFrame=requestAnimationFrame(update)}
  forecastFrame=requestAnimationFrame(()=>{forecastTimer=setTimeout(schedule,300)});
 }
 function specialCard(skill,actor,cost,text){
  const derived=!!skill.auxiliary49,card=document.createElement('button');
  const type=['physical','arts','true'].includes(skill.type)?'attack':'support';
  card.type='button';
  card.className='play-card '+type+' v113-special-card '+(derived?'v113-derived-card':'v113-signature-card');
  card.dataset.signatureUid=skill.owner;
  card.setAttribute('aria-label',skill.name+'，'+cost+' 行動點，長按查看');
  card.innerHTML='<span class="card-cost"></span><span class="card-class"></span><div class="card-art"><img alt=""></div><b></b><p></p><small></small>';
  if(!derived){
   card.style.setProperty('--v113-rim-phase',-(performance.now()%2050)+'ms');
   card.insertAdjacentHTML('beforeend','<svg class="v113-signature-rim" aria-hidden="true" viewBox="0 0 100 160" preserveAspectRatio="none"><rect x="2" y="2" width="96" height="156" rx="5" pathLength="100"/></svg>');
  }
  card.querySelector('.card-cost').textContent=cost;
  card.querySelector('.card-class').textContent=derived?'衍生':'招牌';
  const unit=FrontierCapture.units[actor.id],image=card.querySelector('img');
  image.src=window.FrontierAppearance80?.src(actor.id,'portrait',actor.form)||'assets/'+unit.image+'.png';
  card.querySelector('b').textContent=skill.name;
  card.querySelector('p').innerHTML=formatText(text);
  card.querySelector('small').textContent=derived?'本回合有效':type==='attack'?'指定目標 / TARGET':'招牌技能';
  paintCard50(card,cardTypes50({attack:type==='attack',damageType:skill.type},text,actor));
  card.addEventListener('click',()=>signature(skill.owner));
  return card;
 }
 function actorResource(entry){
  const badge=document.createElement('span');
  badge.className='v113-resource-counter';
  badge.dataset.battleStatus=entry.detail;
  badge.setAttribute('aria-label',entry.summary);
  if(entry.key==='ammo'){
   badge.classList.add('v113-ammo-counter');
   for(let i=0;i<entry.maximum;i++){
    const icon=document.createElement('i');
    icon.className='v113-ammo-round'+(i<entry.value?' loaded':'');
    icon.setAttribute('aria-hidden','true');
    badge.append(icon);
   }
  }else if(Number.isFinite(entry.value)){
   const paths={swordIntent:'M5 19 19 5m-7 2 7-2-2 7M4 15l5 5',samples:'M9 3h6M10 3v6l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M8 14h8'};
   badge.classList.add('v113-icon-resource');
   badge.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[entry.key]||'m12 3 8 5v8l-8 5-8-5V8z M12 9v6')+'"/></svg>';
   badge.append(String(entry.value));
  }else badge.textContent=entry.summary;
  return badge;
 }
 function signatureGauge129(actor,b,rule,snapshot){
  if(!rule)return {value:0,need:0,ratio:0,ready:false,detail:'無招牌技能'};
  const need=typeof rule.threshold==='function'?rule.threshold(snapshot(),actor):rule.threshold;
  const value=rule.resource?actor.resources?.[rule.resource]||0:b.signatureState?.actors?.[actor.uid]?.charge||0;
  const alive=actor.hp>0&&!actor.exited;
  const ready=alive&&value>=need&&b.skills?.some(skill=>!skill.auxiliary49&&skill.owner===actor.uid)&&b.signatureState?.actors?.[actor.uid]?.lastTurn!==b.turn;
  const skill=G.formFor(actor.operator,actor.form)?.signature?.name||'招牌技能';
  const state=!alive?'無法行動':ready?'已就緒':value>=need?'本回合暫不可用':'充能中';
  return {value,need,ratio:Math.max(0,Math.min(1,value/need||0)),ready:!!ready,detail:skill+'：'+Math.min(value,need)+'／'+need+' · '+state};
 }
 function paintActorRow129(row,actor,b,snapshot){
  const definition=FrontierCapture.units[actor.id],rule=G.rules[actor.operator]?.[actor.form];
  const gauge=signatureGauge129(actor,b,rule,snapshot);
  row.replaceChildren();row.classList.add('v113-actor-row','v129-actor-row');row.dataset.operatorUid=actor.uid;row.dataset.inspectActor=actor.id;row.dataset.hpTone=actor.hp/actorBarTotal(actor)>=.97?'dark':'light';
  row.classList.toggle('v129-skill-ready',gauge.ready);row.classList.toggle('v129-incapacitated',actor.hp<=0||!!actor.exited);
  const ready=document.createElement('span');ready.className='v129-ready-gutter';
  ready.setAttribute('aria-label',gauge.ready?'招牌技能已就緒':'招牌技能尚未就緒');
  const mark=document.createElement('img');mark.className='v129-ready-mark';mark.src='assets/ui/skill-ready129.png';mark.alt='';mark.setAttribute('aria-hidden','true');ready.append(mark);
  const frame=document.createElement('div');frame.className='v129-actor-frame';
  const bar=document.createElement('span');bar.className='v113-actor-hp-fill';const total=actorBarTotal(actor);bar.style.width=actor.hp/total*100+'%';
  const shield=document.createElement('span');shield.className='v113-actor-shield-fill';shield.style.left=actor.hp/total*100+'%';shield.style.right='auto';shield.style.width=(total-actor.max)/total*100+'%';shield.hidden=!(actor.block>0);shield.setAttribute('aria-hidden','true');
  const grey=document.createElement('span');grey.className='v113-incoming-grey';grey.style.width='0%';
  const identity=document.createElement('div');identity.className='v113-actor-identity';identity.setAttribute('aria-label',definition.name);
  const img=document.createElement('img');img.className='avatar';img.src=window.FrontierAppearance80?.src(actor.id,'portrait',actor.form)||'assets/'+definition.image+'.png';img.alt=definition.name;
  const resources=mechanicEntries(actor,b,false),icons=effectStrip46(actorEffects46(actor,b));if(resources.length)icons.prepend(...resources.map(actorResource));
  const info=document.createElement('span'),hp=document.createElement('small');hp.textContent=actor.hp+'/'+actor.max;hp.setAttribute('aria-label',actor.hp+'/'+actor.max+' HP'+(actor.block>0?'，護盾 '+actor.block:''));info.append(hp);identity.append(img,icons,info);
  const track=document.createElement('span');track.className='v129-signature-track';track.setAttribute('role','progressbar');track.setAttribute('aria-label',gauge.detail);track.dataset.battleStatus=gauge.detail;track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',String(gauge.need));track.setAttribute('aria-valuenow',String(Math.min(gauge.value,gauge.need)));track.style.setProperty('--signature-progress',gauge.ratio*100+'%');
  const fill=document.createElement('span');fill.className='v129-signature-fill';track.append(fill);
  frame.append(bar,shield,grey,identity,track);row.append(ready,frame);
 }
 function paintActionPoints(b){
  const meter=document.createElement('span');
  meter.className='v113-ap-meter';
  const available=Math.max(0,b.energy),capacity=Math.max(available,b.operatorTurnEnergy??5),visible=Math.min(capacity,12);
  meter.style.setProperty('--ap-slots',visible);
  meter.setAttribute('role','img');
  meter.setAttribute('aria-label','行動點 '+available+'／'+capacity);
  for(let i=0;i<visible;i++){
   const segment=document.createElement('i');
   segment.className='v113-ap-segment'+(i<available?' ready':'');
   meter.append(segment);
  }
  if(capacity>visible){const overflow=document.createElement('small');overflow.className='v113-ap-overflow';overflow.textContent=available+'/'+capacity;meter.append(overflow)}
  return meter;
 }
 function mount(){if(!G.active()||R()?.battle?.operatorVersion!==113){document.querySelectorAll('.v113-resolution-portal').forEach(n=>n.remove());return}let sharedSnapshot;const currentSnapshot=()=>sharedSnapshot??=G.snapshot();const b=R().battle,board=document.querySelector('.card-battle'),hand=board?.querySelector('.hand');if(!board||!hand){document.querySelectorAll('.v113-resolution-portal').forEach(n=>n.remove());return}if(board.dataset.v113Mounted==='1')return;document.querySelectorAll('.v113-resolution-portal').forEach(n=>n.remove());const end=board.querySelector('[onclick="endTurn()"]'),p=b.operatorPending?.[0]||FrontierCurios.pending();if(end){const retaining=['retain','retain-overflow'].includes(b.operatorPhase);end.disabled=retaining||!!p&&p.stage!=='draw';if(end.disabled)end.textContent=retaining?'請確認保留牌':'請先完成選擇'}board.dataset.v113Mounted='1';board.classList.add('v31-battle-board','v113-battle-board');document.querySelector('.screen-workspace-body')?.classList.add('v31-battle-host');for(const old of board.querySelectorAll('.team-actor button[onclick]')){const id=old.getAttribute('onclick')?.match(/\('([^']+)'\)/)?.[1];if(G.formFor(id,id==='amiya'?R().amiyaForm||'caster':'standard'))old.hidden=true}
  if(end){
   const controls=document.createElement('div');
   controls.className='v113-hand-controls';
   const caption=board.querySelector('.hand-caption');
   if(caption){caption.firstElementChild?.remove();controls.append(caption);}
   controls.append(paintActionPoints(b),end);
   hand.before(controls);
  }
  board.querySelector('.combat-hud')?.remove();
  const header=board.querySelector(':scope>.row');
  if(header){
   const lane=document.createElement('div');
   lane.className='v113-status-lane';
   header.after(lane);
   const rules=header.querySelector('button[onclick="help()"]');
   if(rules)(document.querySelector('.v31-tool-menu')||lane).append(rules);
   header.remove();
  }
  const rows=board.querySelectorAll('.team-actor');R().team.forEach((actor,i)=>{if(rows[i])paintActorRow129(rows[i],actor,b,currentSnapshot)});
  for(const actor of R().team){signatureClip(actor);if(matchMedia('(max-width:720px)').matches)ordinaryClip(actor)}
  mountCommon46(board,b);
  for(const skill of b.skills||[]){
   const actor=R().team.find(a=>a.uid===(skill.actorUid||skill.owner));
   if(!actor)continue;
   if(skill.auxiliary49){
    const stage=actor.elite||0;
    hand.append(specialCard(skill,actor,0,'對1名敵人造成'+[100,125,150][stage]+'% ATK法術傷害。本回合後續自身傷害＋'+[10,15,20][stage]+'%。'));
    continue;
   }
   const form=G.formFor(actor.operator,actor.form),rule=G.rules[actor.operator]?.[actor.form];
   if(!form||!rule)continue;
   const cost=typeof rule.cost==='function'?rule.cost(currentSnapshot(),actor):rule.cost;
   const fullArt=signatureClip(actor)?null:window.FrontierAppearance80?.src(actor.id,'full',actor.form);
   if(fullArt&&!warmedSignatureArt.has(fullArt)){warmedSignatureArt.add(fullArt);new Image().src=fullArt}
   hand.append(specialCard(skill,actor,cost,form.signature.sourceTiers['E'+actor.elite]));
  }

  hand.classList.add('v113-hand');FrontierGestures.markPending(hand);for(const card of hand.querySelectorAll('[data-hand-index]')){if(card.disabled){card.disabled=false;card.setAttribute('aria-disabled','true');card.classList.add('v113-unaffordable')}const item=b.hand[Number(card.dataset.handIndex)],metadata=G.effects.describe(item.id);if(item.generated||item.temporaryTurn!=null){card.classList.add('v113-special-card');const label=card.querySelector('.card-class');if(label)label.textContent='臨時';}const owner=cards[item.id]?.owner,image=card.querySelector('.card-art img'),unit=FrontierCapture.units[owner];if(image&&owner==='common'){image.src='assets/doctor-tactics-art.svg';image.alt='博士戰術';image.parentElement.classList.add('doctor-card-art')}else if(image&&unit){const appearanceActor=R().team.find(a=>a.id===owner);image.src=window.FrontierAppearance80?.src(owner,'portrait',appearanceActor?.form)||'assets/'+unit.image+'.png';image.alt=unit.name}const paper=card.querySelector(':scope>p');if(paper)paper.innerHTML=formatText(paper.textContent);const def=G.effects.definitions.get(item.id),actor=def&&R().team.find(a=>a.operator===def.owner&&a.form===def.form),stage=def&&G.mastery(actor,item),stats=cardStats(item);if(window.FrontierMasteryIcons60){const badge=document.createElement('span');badge.className='mastery60-card-badge';badge.innerHTML=FrontierMasteryIcons60.html(stage||'M0');card.querySelector('.mastery60-card-badge')?.remove();card.append(badge)}paintCard50(card,cardTypes50(metadata||{attack:!!stats.damage,damageType:'physical'},def?def.sourceEffects[stage]:G.tacticText(item.id),actor,def?.designId))}enemyStatuses(board,b);pending(board,b);paintForecast(board,b);
 }
 function measureFan134(){
  const hand=document.querySelector('.v113-hand');if(!hand)return;
  const cards=[...hand.querySelectorAll('.play-card:not(.v113-staged-draw)')],n=cards.length,rect=hand.getBoundingClientRect(),width=hand.clientWidth;
  positionDrawDiscard(hand);
  const viewport=window.visualViewport,viewBottom=viewport?viewport.offsetTop+viewport.height:innerHeight;
  const boardBottom=hand.closest('.v113-battle-board').getBoundingClientRect().bottom;
  const handHeight=hand.clientHeight,usable=Math.max(0,Math.min(handHeight,boardBottom-rect.top,viewBottom-rect.top));
  // Use the full fan envelope for card dimensions so drawing/spending cards only changes the spread.
  const w=Math.min(116,Math.max(76,width*.28));
  const maxAngle=(viewBottom<500?30:44)*Math.PI/180,halfAngle=maxAngle/2;
  const totalAngle=Math.min(maxAngle,Math.max(0,n-1)*8*Math.PI/180);
  const corner=Math.sin(halfAngle)*w/2;
  const height=Math.max(24,Math.min(usable-2*corner-14,viewBottom<650?150:216));
  const maxX=Math.max(0,width/2-w*Math.cos(halfAngle)/2-height*Math.sin(halfAngle)-6);
  const spread=Math.min(62,2*maxX/Math.max(1,n-1)),curve=height*.65;
  const actualHalf=totalAngle/2,actualCorner=Math.sin(actualHalf)*w/2;
  const baseY=Math.max(0,usable-height-actualCorner-curve*(1-Math.cos(actualHalf))-8);
  const statusBottom=Math.max(...[...document.querySelectorAll('.v113-enemy-statuses')].map(e=>e.getBoundingClientRect().bottom),0),focusBottom=Math.min(viewBottom,boardBottom)-6,focusTop=Math.min(statusBottom+6,focusBottom-72),focusHeight=Math.max(24,Math.min(height+64,280,(focusBottom-focusTop)/1.08));const fan={hand,cards,n,rect,width,height,w,totalAngle,spread,curve,usable,baseY,focusBottom,focusTop,focusHeight,maxX,maxAngle,handHeight};rememberGeometry134(fan);return fan;
 }
 function paintFan134(g){
  if(!g?.hand.isConnected)return;
  const {hand,cards,n,rect,width,height,w,totalAngle,spread,curve,usable,baseY,focusBottom,focusTop,focusHeight}=g;
  hand.style.setProperty('--focus-card-height',focusHeight+'px');
  hand.style.setProperty('--fan-card-width',w+'px');hand.style.setProperty('--fan-card-height',height+'px');
  cards.forEach((card,i)=>{
   const position=i-(n-1)/2,x=position*spread,angle=position/Math.max(1,n-1)*totalAngle;
   const arc=curve*(1-Math.cos(angle));
   const topSafe=Math.max(0,Math.abs(Math.sin(angle))*w/2-height*(1-Math.cos(angle)));
   const y=Math.min(Math.max(topSafe,baseY+arc),Math.max(0,usable-height-Math.abs(Math.sin(angle))*w/2-10));
   card.style.left=((width-w)/2+x)+'px';card.style.top=y+'px';
   const focusMin=focusTop-rect.top-y+focusHeight*.08,focusMax=focusBottom-rect.top-y-focusHeight;
   card.style.setProperty('--focus-lift',Math.min(focusMax,Math.max(-110,focusMin))+'px');
   card.style.setProperty('--fan-rotation',angle*180/Math.PI+'deg');card.style.zIndex=10+i;
   const center=rect.left+width/2+x,half=w*1.08/2;
   card.style.setProperty('--focus-shift',Math.max(8+half-center,Math.min(0,innerWidth-8-half-center))+'px');
  });
 }
 function layoutFan(){paintFan134(measureFan134());positionDrawDiscard(document.querySelector('.v113-hand'));}
 function focusAtX(x){const hand=document.querySelector('.v113-hand');if(!hand)return;const cards=[...hand.querySelectorAll('.play-card:not(.v113-staged-draw)')];const left=hand.getBoundingClientRect().left,width=cards[0]?.offsetWidth||0;let best=null,distance=Infinity;for(const card of cards){const center=left+parseFloat(card.style.left)+width/2,d=Math.abs(center-x);if(d<distance){distance=d;best=card}}for(const card of cards)card.classList.toggle('fan-focused',card===best);return best}
 const relayout=()=>measure134(cachedFan134,g=>{paintFan134(g);positionDrawDiscard(g.hand)},'fan');
 const invalidateGeometry134=()=>{viewportKey134=viewport134();geometry134=null;relayout()};window.addEventListener('resize',invalidateGeometry134);window.visualViewport?.addEventListener('resize',invalidateGeometry134);window.visualViewport?.addEventListener('scroll',invalidateGeometry134);
 let actorHold=null,actorTip=null;
 function clearActorTip(){if(actorHold){clearTimeout(actorHold.timer);clearTimeout(actorHold.fullTimer)}actorHold=null;actorTip?.remove();actorTip=null}
 window.addEventListener('pointerdown',event=>{const row=event.target.closest?.('.v113-actor-row');if(!row||document.querySelector('#modal')?.open)return;event.preventDefault();event.stopImmediatePropagation();clearActorTip();actorHold={x:event.clientX,y:event.clientY,timer:setTimeout(()=>{const actor=R()?.team.find(a=>a.uid===row.dataset.operatorUid);if(!actor)return;const b=R().battle,tip=document.createElement('aside');tip.className='v113-actor-tooltip';tip.setAttribute('role','tooltip');const title=document.createElement('b');title.textContent=name(actor);tip.append(title);const gauge=signatureGauge129(actor,b,G.rules[actor.operator]?.[actor.form],()=>G.snapshot());const lines=[gauge.detail,'生命 '+actor.hp+'/'+actor.max+' · 攻擊 '+actor.atk+' · 防禦 '+actor.def+' · 法抗 '+actor.res+'%'];lines.push(...mechanicEntries(actor,b).map(entry=>entry.detail));if(actor.block>0)lines.push('⬡ 護盾：'+actor.block);if(actor.nextIncomingReduction)lines.push('🛡 下次受傷降低 '+Math.round(actor.nextIncomingReduction*100)+'%');if(actor.nextDamageReductionFlat)lines.push('🛡 下次傷害減免 '+actor.nextDamageReductionFlat);if(actor.power)lines.push('↑ 攻擊加成 '+actor.power);if(actor.thorns)lines.push('反擊傷害 '+actor.thorns);if(actor.exited)lines.push('已退場');if(actor.embers?.active)lines.push('餘燼：免疫傷害及治療');if(actor.stunnedTurn===b.turn)lines.push('本回合暈眩');if(actor.exhaustedTurn===b.turn)lines.push('本回合力竭');if(actor.nextSingleIncomingReduction)lines.push('🛡 下次單體傷害降低 '+Math.round(actor.nextSingleIncomingReduction*100)+'%');if(actor.guard)lines.push('🛡 護衛：由 '+name(R().team.find(a=>a.uid===actor.guard.source)||{})+' 承受下一次可攔截單體攻擊');for(const buff of b.cardBuffs||[])if(buffApplies(buff,actor,b.turn))lines.push('↑ '+Math.round(buff.amount*100)+'% · 來源 '+name(R().team.find(a=>a.uid===buff.source)||{})+(buff.expiresTurn!=null?' · 至第 '+buff.expiresTurn+' 回合末':'')+(buff.remaining!=null?' · 剩 '+buff.remaining+' 次':''));for(const status of [])if(status.stacks>0)lines.push((FrontierOperatorStatusDictionaryV31.definitions[status.id]?.name||status.id)+' ×'+status.stacks+(status.expiresEnemyPhase!=null?' · 至第 '+status.expiresEnemyPhase+' 敵方階段末':''));lines.push(...statusDetails(actor).map(x=>x.text));for(const line of lines){const p=document.createElement('p');p.textContent=line;tip.append(p)}FrontierInspector.attach(tip);actorTip=tip},250),fullTimer:setTimeout(()=>{const actor=R()?.team.find(a=>a.uid===row.dataset.operatorUid);clearActorTip();if(actor)FrontierOperatorProgressionV113.battleDetail(actor.id)},5000)}},true);
 window.addEventListener('pointermove',event=>{if(actorHold&&Math.hypot(event.clientX-actorHold.x,event.clientY-actorHold.y)>12)clearActorTip()},true);
 window.addEventListener('pointerup',clearActorTip,true);window.addEventListener('pointercancel',clearActorTip,true);window.addEventListener('blur',clearActorTip);
 const mountOriginal=mount;mount=function(){mountOriginal();relayout();mergeDrawCards135()};
 return {cardTypes50,paintCard50,choose,signature,mount,layoutFan,focusAtX,formatText,allyTargets,dropSupport,canTargetAllies,signaturePreview,statusDetails,actorEffects46,buffEffect46,playFeedback,signatureAnimation,preloadSignatureClip:signatureClip,preloadOrdinaryClip:ordinaryClip,ordinaryAnimation,ordinaryCue,mechanicEntries,ammoEnhancement,attackOptions,targetPlan,secondaryCandidates};
})();

FrontierOperatorGameV113.install();

// Right-thumb battle inventory. This owns presentation/gestures only: the
// existing transactional capture and medicine APIs remain the mutation path.
window.FrontierBattleTools132=(()=>{
 let opened=null,selection=null,gesture=null,tip=null,suppressUntil=0;
 const D=()=>FrontierInventory.definitions;
 const kitId='run_medkit132',kit={id:kitId,name:'隨行急救包',description:'本趟一份。對存活且受傷幹員使用時，沿用原本急救包治療量，不消耗 AP；對倒地幹員使用時，消耗 2 AP 並沿用原本救援次數限制。'};
 const definition=id=>id===kitId?kit:D()[id];
 const icon=id=>FrontierIcons.html(id===kitId?'med_aid_t3':id);
 function kitReason(actor){const r=R(),b=battle(),p=phaseReason();if(p)return p;if(!r.medkit)return'急救包已用完';if(actor){if(actor.exited)return'該幹員已退場';if(actor.hp<=0){if(actor.rescueTimer===0)return'救援時限已過';if(b.energy<2)return'救援需要 2 AP';if(Math.max(b.rescues||0,b.medRevives||0)>=(r.team.length===5?2:1))return'本場救援額度已用完'}else if(actor.hp>=actor.max)return'生命已滿'}return'';}
 const label=a=>FrontierCapture.units[a.id]?.name||a.label||a.id;
 const battle=()=>R()?.battle;
 const same=s=>!!s&&R()?.number===s.run&&battle()?.operatorBattleId===s.battleId&&battle()?.turn===s.turn;
 function phaseReason(){const b=battle();return !b||R().result?'目前不在作戰中':b.operatorPhase!=='player'||b.operatorPending?.length||FrontierCurios.pending()?'請先完成目前的戰術選擇':''}
 function inventory(kind){const r=R();if(!r)return[];return kind==='capture'?Object.entries(FrontierContainment.devices).filter(([key])=>r.field.devices?.[key]>0).map(([key])=>({id:'device_'+key,key,qty:r.field.devices[key]})):FrontierMedicine.ids.filter(id=>r.field.materials[id]>0).map(id=>({id,qty:r.field.materials[id]})).concat(r.medkit?[{id:kitId,qty:1}]:[])}
 function supplyReason(id,actor,enemy){if(id===kitId)return kitReason(actor);const r=R(),b=battle(),d=D()[id];if(!d||d.category!=='medicine'||!(r?.field.materials[id]>0))return'道具已用完';const p=phaseReason();if(p)return p;
  if(['stride','stamina','scout'].includes(d.family))return'此道具僅限探索使用';
  if(r.supplyTypeLimit&&!r.quickMeds?.includes(id)&&(r.quickMeds?.length||0)>=r.supplyTypeLimit)return'本趟已配置兩種戰術補給';
  const limit=FrontierContracts.value('medicine',r.team.length===5?4:2),revive=d.family==='revive',energy=revive?2:1;
  if(limit===0)return'合約禁止使用支援道具';if(b.energy<energy)return'需要 '+energy+' AP';
  if((b.medUses||0)>=Math.min(limit,r.team.length===5?4:2))return'本場支援道具次數已用完';
  if((b.medTurn===b.turn?(b.medTurnUses||1):0)>=(r.team.length===5?2:1))return'本回合支援道具次數已用完';
  if(revive&&FrontierContracts.value('revive',1)===0)return'合約禁止救援道具';if(revive&&d.effect.level>0&&Math.max(b.medRevives||0,b.rescues||0)>=(r.team.length===5?2:1))return'本場救援額度已用完';
  if(d.family==='capture'&&r.captureDrugBonus>0)return'已有待觸發的收容加成';
  if(d.family==='capture'&&enemy){const u=FrontierCapture.units[enemy.species];if(enemy.hp<=0||!u||u.boss||enemy.regionBoss||enemy.device75||enemy.targetable===false||(enemy.captureTries||0)>=2)return'此目標不可收容'}
  if(actor){if(actor.exited)return'該幹員已退場';if(revive){if(actor.hp>0)return'需要倒地幹員';if(actor.rescueTimer===0)return'救援時限已過'}else if(actor.hp<=0)return'需要仍可行動的幹員';
   if(d.family==='aid'&&d.effect.level===0&&actor.hp>=actor.max)return'生命已滿';
   if(['assault','focus'].includes(d.family)&&actor.drugBuff)return'已有待觸發的攻擊補給';
  }return'';
 }
 function captureReason(key,enemy){const r=R(),b=battle(),p=phaseReason();if(p)return p;if(!(r.field.devices?.[key]>0))return'裝置已用完';if(FrontierContracts.value('capture',1)===0)return'合約禁止收容';if(b.energy<1)return'需要 1 AP';
  const unit=FrontierCapture.units[enemy?.species];if(!enemy||enemy.hp<=0||!unit||unit.boss||enemy.regionBoss||enemy.device75||enemy.targetable===false)return'不可收容';if((enemy.captureTries||0)>=2)return'收容機會已用完';if(!FrontierGrid.canTake(enemy.species,'live'))return'活體收容空間不足';return'';
 }
 function clearTip(){tip?.remove();tip=null}
 function clearTargets(){document.querySelectorAll('.v132-ally-targets,.v132-capture-preview,.v132-tool-ghost').forEach(e=>e.remove());document.querySelectorAll('.v132-tool-target').forEach(e=>e.classList.remove('v132-tool-target'));document.body.classList.remove('v132-tool-dragging','v132-ally-choosing')}
 function cancel(){if(gesture){clearTimeout(gesture.timer);cancelAnimationFrame(gesture.frame);try{gesture.el.releasePointerCapture(gesture.pointer)}catch{}}gesture=null;selection=null;clearTip();clearTargets();document.querySelectorAll('.v132-tool-shelf.dragging,[data-tool-item].chosen').forEach(e=>e.classList.remove('dragging','chosen'))}
 function close(){cancel();opened=null;document.querySelectorAll('.v132-tool-shelf').forEach(e=>e.hidden=true);document.querySelectorAll('[data-battle-tool]').forEach(e=>e.setAttribute('aria-expanded','false'))}
 function details(id){const d=definition(id);if(!d)return;clearTip();const el=document.createElement('aside');el.className='v113-actor-tooltip';el.setAttribute('role','tooltip');const title=document.createElement('b');title.textContent=d.name;const body=document.createElement('p');body.textContent=d.description;const qty=document.createElement('p');qty.textContent='攜帶 '+(id===kitId?Number(!!R().medkit):id.startsWith('device_')?R().field.devices[id.slice(7)]||0:R().field.materials[id]||0);el.append(title,body,qty);FrontierInspector.attach(el);tip=el}
 function showTargets(s){clearTargets();if(s.kind==='capture'||definition(s.id)?.family==='capture'){
   if(s.kind==='capture')for(const enemy of battle().enemies){const card=document.querySelector('.enemy-card[data-enemy-id="'+CSS.escape(enemy.id)+'"]');if(!card||enemy.hp<=0)continue;const reason=captureReason(s.key,enemy),hint=document.createElement('span');hint.className='v132-capture-preview';hint.dataset.captureEnemy=enemy.id;hint.dataset.legal=String(!reason);hint.textContent=reason?'×':Math.round(FrontierContainment.chance(enemy.species,s.key,enemy.hp/enemy.max,enemy)*100)+'%';hint.setAttribute('aria-label',reason||'收容成功率 '+hint.textContent);card.append(hint)}
   return;
  }
  document.body.classList.add('v132-ally-choosing');const layer=document.createElement('div');layer.className='v132-ally-targets';layer.setAttribute('aria-label','選擇支援幹員');const bounds=document.querySelector('.enemy-line')?.getBoundingClientRect();layer.style.top=Math.max(95,Math.min(innerHeight-150,(bounds?.top||160)+24))+'px';
  for(const actor of R().team){const reason=supplyReason(s.id,actor),target=document.createElement('button');target.type='button';target.className='v132-ally-target';target.dataset.toolAlly=actor.uid;target.dataset.legal=String(!reason);target.setAttribute('aria-label',label(actor)+(reason?'：'+reason:'，可使用'));target.setAttribute('aria-disabled',String(!!reason));const image=document.createElement('img');image.src=FrontierAppearance80.src(actor.id,'portrait',actor.form)||'assets/'+FrontierCapture.units[actor.id].image+'.png';image.alt=label(actor);target.append(image);layer.append(target)}document.body.append(layer);
 }
 function makeSelection(el){const r=R(),b=battle();return{kind:el.dataset.toolKind,id:el.dataset.toolItem,key:el.dataset.toolKey,run:r.number,battleId:b.operatorBattleId,turn:b.turn}}
 function arm(el){cancel();const s=makeSelection(el),reason=s.kind==='support'?supplyReason(s.id):phaseReason();if(reason){toast('PRTS｜'+reason);return null}selected=null;FrontierRuntime.paintSelection();selection=s;el.classList.add('chosen');showTargets(s);return s}
 function pick(s,x,y){const hit=document.elementFromPoint(x,y);if(s.kind==='support'&&definition(s.id)?.family!=='capture'){
   const direct=hit?.closest('[data-tool-ally]');if(direct)return{kind:'ally',id:direct.dataset.toolAlly,el:direct};
   const near=[...document.querySelectorAll('[data-tool-ally]')].map(el=>{const r=el.getBoundingClientRect();return{el,d:Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2)}}).sort((a,b)=>a.d-b.d)[0];return near?.d<=32?{kind:'ally',id:near.el.dataset.toolAlly,el:near.el}:null;
  }
  const direct=hit?.closest('.enemy-card[data-enemy-id]');if(direct)return{kind:'enemy',id:direct.dataset.enemyId,el:direct};return null;
 }
 function commit(s,target){if(!same(s)||!target){cancel();return}const expectedTurn=s.turn;cancel();const enemy=battle().enemies.find(e=>e.id===target.id),actor=R().team.find(a=>a.uid===target.id);if(target.kind==='ally'&&!actor||target.kind==='enemy'&&!enemy)return;const reason=s.kind==='capture'?captureReason(s.key,enemy):supplyReason(s.id,target.kind==='ally'?actor:undefined,enemy);if(reason){toast('PRTS｜'+reason);return}
  const kitRescue=actor?.hp<=0;FrontierRuntime.perform(s.kind==='capture'?'throwAtEnemy':s.id===kitId?(kitRescue?'FrontierPersonnel.rescue':'useMedkit'):'FrontierMedicine.use',()=>{if(!same(s)||battle().turn!==expectedTurn)return false;const enemy=battle().enemies.find(e=>e.id===target.id),actor=R().team.find(a=>a.uid===target.id);if(target.kind==='ally'&&!actor||target.kind==='enemy'&&!enemy)return false;const denied=s.kind==='capture'?captureReason(s.key,enemy):supplyReason(s.id,target.kind==='ally'?actor:undefined,enemy);if(denied){toast('PRTS｜'+denied);return false}if(s.kind==='capture')throwAtEnemy(enemy.id,s.key);else if(s.id===kitId){if((actor.hp<=0)!==kitRescue)return false;if(kitRescue)FrontierPersonnel.rescue(actor.id);else useMedkit(actor.id)}else FrontierMedicine.use(s.id,actor?.uid)});
 }
 const toolIcon=kind=>'<svg aria-hidden="true" viewBox="0 0 24 24">'+(kind==='capture'?'<path d="M7 5V3h10v2M5 7h14v14H5zM4 7h16M9 8v12m6-12v12M5 14h14"/>':'<path d="M4 7h16v14H4zM8 7V3h8v4m-4 4v6m-3-3h6"/>')+'</svg>';
 function toggle(kind){cancel();opened=opened===kind?null:kind;document.querySelectorAll('.v132-tool-shelf').forEach(el=>el.hidden=el.dataset.toolShelf!==opened);document.querySelectorAll('[data-battle-tool]').forEach(el=>el.setAttribute('aria-expanded',String(el.dataset.battleTool===opened)))}
 function mount(){const board=document.querySelector('.v113-battle-board'),line=board?.querySelector('.enemy-line'),b=battle();const active=!!board&&!!b&&R()?.operatorSystemVersion===113&&!R().result;document.body.classList.toggle('v132-tools-active',active);if(!active){close();return}if(line.querySelector('.v132-battle-tools'))return;for(const old of board.querySelectorAll('button[onclick^="FrontierPersonnel.rescue("]')){const panel=old.closest('section.panel');if(panel?.parentElement===board)panel.remove()}if(selection||gesture)cancel();FrontierOperatorBattleUIV31?.close?.();
  const tools=document.createElement('div');tools.className='v132-battle-tools';tools.setAttribute('aria-label','作戰道具');
  for(const [kind,text]of[['capture','收容裝置'],['support','支援道具']]){const group=document.createElement('div');group.className='v132-tool-group';const button=document.createElement('button');button.type='button';button.className='v132-tool-toggle';button.dataset.battleTool=kind;button.setAttribute('aria-label',text);button.setAttribute('aria-expanded',String(opened===kind));button.innerHTML=toolIcon(kind)+'<span>'+text+'</span>';button.addEventListener('click',()=>toggle(kind));const shelf=document.createElement('div');shelf.className='v132-tool-shelf';shelf.dataset.toolShelf=kind;shelf.hidden=opened!==kind;shelf.setAttribute('aria-label',text+'攜帶物');
   const carried=inventory(kind);if(!carried.length){const empty=document.createElement('span');empty.className='v132-tool-empty';empty.textContent='未攜帶';shelf.append(empty)}
   for(const item of carried){const entry=document.createElement('button');entry.type='button';entry.className='v132-tool-item';entry.dataset.toolItem=item.id;entry.dataset.toolKind=kind;if(item.key)entry.dataset.toolKey=item.key;entry.setAttribute('aria-label',definition(item.id).name+' ×'+item.qty);entry.innerHTML=icon(item.id)+'<span class="v132-tool-qty">'+item.qty+'</span>';shelf.append(entry)}group.append(shelf,button);tools.append(group)}line.append(tools);
 }
 window.addEventListener('pointerdown',e=>{const el=e.target.closest?.('[data-tool-item]');if(!el){suppressUntil=0;if(selection&&!e.target.closest?.('[data-tool-ally],.enemy-card,.v132-battle-tools'))cancel();return}if(e.isPrimary===false||e.button>0||document.querySelector('#modal')?.open)return;e.preventDefault();e.stopImmediatePropagation();cancel();gesture={el,pointer:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,shelf:el.parentElement,scroll:el.parentElement.scrollLeft,moving:false,scrolling:false};el.setPointerCapture(e.pointerId);gesture.timer=setTimeout(()=>{if(gesture&&!gesture.moving&&!gesture.scrolling)details(el.dataset.toolItem)},300)},true);
 window.addEventListener('pointermove',e=>{const g=gesture;if(!g||g.pointer!==e.pointerId)return;e.preventDefault();const dx=e.clientX-g.x,dy=e.clientY-g.y;if(!g.moving&&Math.hypot(dx,dy)>7){clearTimeout(g.timer);clearTip();const sr=g.shelf.getBoundingClientRect();if(g.shelf.scrollWidth>g.shelf.clientWidth+1&&e.clientX>=sr.left&&e.clientX<=sr.right&&Math.abs(dx)>Math.abs(dy)*1.3&&Math.abs(dy)<12){g.scrolling=true;g.shelf.scrollLeft=g.scroll-dx;return}const s=makeSelection(g.el),reason=s.kind==='support'?supplyReason(s.id):phaseReason();if(reason){cancel();toast('PRTS｜'+reason);return}selected=null;FrontierRuntime.paintSelection();selection=s;g.moving=true;g.scrolling=false;showTargets(s);document.body.classList.add('v132-tool-dragging');const ghost=document.createElement('div');ghost.className='v132-tool-ghost';ghost.innerHTML=icon(s.id);document.body.append(ghost);g.ghost=ghost;g.shelf.classList.add('dragging')}
  if(!g.moving)return;g.lastX=e.clientX;g.lastY=e.clientY;g.ghost.style.transform='translate3d('+(e.clientX-22)+'px,'+(e.clientY-56)+'px,0)';const target=pick(selection,e.clientX,e.clientY);document.querySelectorAll('.v132-tool-target').forEach(el=>el.classList.remove('v132-tool-target'));target?.el.classList.add('v132-tool-target');g.target=target;
 },{capture:true,passive:false});
 window.addEventListener('pointerup',e=>{const g=gesture;if(!g||g.pointer!==e.pointerId)return;e.preventDefault();e.stopImmediatePropagation();suppressUntil=performance.now()+500;clearTimeout(g.timer);const s=selection,target=s&&pick(s,e.clientX,e.clientY),moving=g.moving,scrolled=g.scrolling,inspected=!!tip,el=g.el;try{el.releasePointerCapture(g.pointer)}catch{}gesture=null;clearTip();if(moving){if(target)commit(s,target);else cancel()}else if(scrolled||inspected)cancel();else arm(el)},true);
 window.addEventListener('pointercancel',cancel,true);window.addEventListener('blur',close);window.addEventListener('keydown',e=>{if(e.key==='Escape')close()});window.addEventListener('touchmove',e=>{if(gesture&&e.cancelable)e.preventDefault()},{capture:true,passive:false});
 window.addEventListener('click',e=>{if(performance.now()<suppressUntil&&(e.target.closest?.('[data-tool-item],[data-tool-ally],.enemy-card'))){e.preventDefault();e.stopImmediatePropagation();return}if(selection){const target=pick(selection,e.clientX,e.clientY);if(target){e.preventDefault();e.stopImmediatePropagation();commit(selection,target);return}}const item=e.target.closest?.('[data-tool-item]');if(item){e.preventDefault();e.stopImmediatePropagation();arm(item)}else if(opened&&!e.target.closest?.('.v132-battle-tools,[data-tool-ally]'))close()},true);
 const draw=render;render=function(...args){const result=draw.apply(this,args);mount();return result};
 return{mount,close,cancel,inventory,supplyReason,captureReason,get active(){return!!selection||!!gesture}};
})();
