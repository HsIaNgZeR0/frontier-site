'use strict';
window.FrontierEnvironment=(()=>{
 const definitions={chernobog:{id:'originium_pollution',name:'源石污染',max:6,thresholds:[3,5],counter:'營地去污、淨化戰術補給；污染3以上治療效率降低10%。'},lungmen:{id:'wanted',name:'通緝',max:5,thresholds:[3,5],counter:'情報交涉可降低通緝；3星起盤查，4星起行商限制交易。'},siesta:{id:'heat',name:'火山熱壓',max:6,thresholds:[3,5],counter:'營地冷卻、抗灼戰術補給；熱壓3起戰鬥出現灼熱地形。'},sargon:{id:'water',name:'飲水補給',max:6,thresholds:[2,0],counter:'每3站消耗1份；缺水使部分未知支線暫不可辨識，可在營地補水，不會封死主路。'},kazimierz:{id:'exposure',name:'賽事曝光',max:5,thresholds:[3,5],counter:'可選擇公開挑戰或保持低調；曝光3以上勝利額外外勤點，也吸引挑戰者。'},kjerag:{id:'cold',name:'寒冷',max:6,thresholds:[3,5],counter:'3起首回合少1能量；5起每回合上限少1，最低2。營地取暖與抗寒戰術補給可降低。'},siracusa:{id:'families',name:'家族關係',max:5,thresholds:[3],counter:'幫助家族累積信任、得罪則累積敵意；信任影響行商價格，敵意3起敵方先鋒必定出手，攻擊提高2。'},columbia:{id:'interference',name:'設施干擾',max:3,thresholds:[2,3],counter:'干擾2以上，敵方先鋒開場獲得4點護盾；營地駭入或淨化可解除。'},victoria:{id:'frontline',name:'戰線',max:2,thresholds:[-1,1],counter:'支援物資使戰線前進，撤離危地則後退；戰線影響補給和敵人意圖。'},iberia:{id:'tide',name:'潮汐',max:3,thresholds:[1,3],counter:'每2次探索行動推進潮汐；2～3階段封閉右側可選淺灘，主路保留。高潮戰鬥有神經侵蝕；燈塔、營地可處理，暫停不推進。'},sami:{id:'collapse',name:'坍縮',max:12,thresholds:[4,8,12],counter:'4起未知節點，8起首回合卡牌干擾，12起追擊意圖。營地穩定與淨化可降低。'},kazdel:{id:'echoes',name:'戰場殘響',max:6,thresholds:[2,4],counter:'契約由事件自願接受：獲得15%出牌傷害加成並加入負面牌。普通通關不必簽約。'},yan:{id:'suimeng',name:'歲夢',max:6,thresholds:[3,5],counter:'交戰與未知路線使歲夢加深；營地與明處事件可回落。3起敵方先鋒開場墨痕護盾，5起敵方全體攻擊提高。'}};
 function current(){const r=R(),s=r?.environment;return s&&(!r.expedition||s.region===r.expedition.regionId)?s:undefined}
 function create(region){return{version:1,rulesVersion:3,region,id:definitions[region].id,value:region==='sargon'?4:['chernobog','siesta','kjerag'].includes(region)?1:0,actions:0,trust:0,hostility:0,front:0,forecasts:[],flags:{}}}
 function adjust(n,reason){const s=current();if(!s)return;s.value=Math.max(0,Math.min(definitions[s.region].max,s.value+n));s.forecasts.push({at:Date.now(),action:s.actions,value:s.value,reason});if(s.forecasts.length>40)s.forecasts.shift()}
 const tideNames=['低潮','漲潮','滿潮','退潮'];
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const regionalRules={
  chernobog:'搜查污染物及交戰會累積污染，緊急作戰暴露更高；休整降污染。污染 3 起治療 −10%，5 起接戰時隊伍受到毒霧。',
  lungmen:'交戰和搜查提高通緝，休整或情報交涉可避風頭。3 星起首名敵人攻擊提高；4 星起行商停售容器。',
  siesta:'搜查、緊急作戰和長時間移動會累積熱壓；行商與營地可降溫。3 起接戰時全隊灼燒，5 起每輪增加一名受灼燒的目標。',
  sargon:'每兩次行動耗 1 份水，開箱搜尋額外耗水；營地與行商可補水。缺水時開局少抽 1 張，尚未辨識的路線能見度降低。',
  kazimierz:'交戰提高曝光，緊急作戰增幅較高；休整及情報路線能降低曝光。3 起先鋒更強，勝利多 5 源石碇。',
  kjerag:'長時間移動、搜查和緊急作戰累積寒冷，行商與營地可取暖。3 起首回合少 1 AP，5 起每回合少 1 AP。',
  siracusa:'交戰增加敵意，休整可降低敵意；情報交涉累積信任。信任降低商價，敵意 3 起提高商品價格及首名敵人攻擊。',
  columbia:'作戰及搜查提高干擾；營地、行商和情報路線能緩解。干擾 2 起敵方先鋒有 40 護盾，滿干擾時後方敵人也獲得護盾。',
  victoria:'高強度交戰使戰線後退；情報支援與營地休整讓戰線前進。推進時全隊有開場護盾，勝利額外有物資；退卻時敵方先鋒更強。',
  iberia:'每兩次行動切換潮段；搜查深水、緊急作戰會加速，營地整備或燈塔可回到低潮。低潮我方有開場護盾，滿潮敵方有開場護盾，每輪前排累積神經損傷，3 層使下輪 −1 AP。',
  sami:'緊急作戰、異常節點和長時間探索推高坍縮；休整可回落。4 起前方能見度降低，8 起首手一牌多耗 1 AP，12 起敵方攻擊提高。',
  kazdel:'交戰使殘響升高，緊急作戰增幅更大；情報與營地可平復殘響。4 起敵方先鋒更強，自願簽約仍可換取出牌傷害加成。',
  yan:'交戰、緊急作戰與未知路線使歲夢加深，營地休整與明處事件能讓夢境回落。3 起敵方先鋒開場有 40 墨痕護盾、攻擊＋10；5 起敵方全體攻擊＋10，器倀與墨魎躁動。'
 };
 function travelPlan(s,node){
  const combat=['battle','elite','boss','ambush'].includes(node.type),heavy=['elite','boss','ambush'].includes(node.type);
  const search=node.searchAction||['search','container'].includes(node.type);
  const camp=node.type==='camp',merchant=node.type==='merchant',quiet=node.type==='event'&&!node.hidden;
  const even=(s.actions+1)%2===0;
  switch(s.region){
   case 'chernobog':return {delta:camp?-2:heavy?2:search||combat?1:0};
   case 'lungmen':return {delta:camp||quiet?-1:heavy?2:combat||search?1:0};
   case 'siesta':return {delta:camp||merchant?-2:heavy||search||even?1:0};
   case 'sargon':return {delta:camp||merchant?1:-(Number(even)+Number(!!node.searchAction))};
   case 'kazimierz':return {delta:camp||quiet?-1:heavy?2:combat?1:0};
   case 'kjerag':return {delta:camp?-2:merchant?-1:heavy||search||even?1:0};
   case 'siracusa':return {key:'hostility',delta:camp?-1:heavy?2:combat?1:0};
   case 'columbia':return {delta:camp?-2:merchant||quiet?-1:combat||search?1:0};
   case 'victoria':return {key:'front',delta:camp||quiet&&node.storyEvent!=='battlefield'?1:heavy?-1:0};
   case 'iberia':return {tide:true,tick:camp?0:((s.value===Math.floor((s.tideStep||0)/2)?s.tideStep||0:s.value*2)+1+Number(heavy||!!node.searchAction))%8};
   case 'sami':return {delta:camp?-2:merchant?-1:heavy?2:node.hidden||even?1:0};
   case 'kazdel':return {delta:camp?-2:quiet?-1:heavy?2:combat?1:0};
   case 'yan':return {delta:camp?-2:quiet||merchant?-1:heavy?2:combat||node.hidden?1:0};
  }
 }
 function travelValue(s,plan){
  if(plan.tide)return Math.floor(plan.tick/2);
  if(plan.key==='front')return clamp(s.front+plan.delta,-2,2);
  if(plan.key==='hostility')return clamp(s.hostility+plan.delta,0,5);
  return clamp(s.value+plan.delta,0,definitions[s.region].max);
 }
 const adjustText=(plan,next)=>plan.tide?tideNames[next]:plan.key==='front'?['退卻','僵持','推進'][Math.sign(next)+1]:next;
 function routeImpact(node){
  const s=current();if(!s||s.rulesVersion<3||!node)return '';
  const plan=travelPlan(s,node),now=s[plan.key||'value'],next=travelValue(s,plan);
  if(next===now)return '';
  const name=plan.key==='hostility'?'敵意':definitions[s.region].name;
  const delta=next-now,improves=plan.key==='front'||s.region==='sargon'?delta>0:delta<0;
  return {text:name+' '+adjustText(plan,now)+' → '+adjustText(plan,next),mark:plan.tide?'≈':(delta>0?'+':'−')+Math.abs(delta),tone:plan.tide?'tide':improves?'relief':'pressure'};
 }
 function travelHint(node){
  return routeImpact(node)?.text||'';
 }
 function travel(node,s,r){
  const plan=travelPlan({...s,actions:s.actions-1},node),next=travelValue(s,plan);
  if(plan.tide){s.tideStep=plan.tick;if(next!==s.value)adjust(next-s.value,'海況變化');return}
  if(plan.key){s[plan.key]=next;return}
  if(!plan.delta||next===s.value)return;
  const draining=s.region==='sargon'?plan.delta<0:plan.delta>0&&['chernobog','siesta','kjerag'].includes(s.region);
  if(s.region==='kjerag'&&draining&&s.actions%4===0&&r.story?.relics?.includes('thermal_core'))return;
  if(draining&&r.staminaWard){r.staminaWard=0;adjust(0,'耐力補給抵銷行軍消耗');return}
  adjust(plan.delta,node.type==='camp'?'營地環境緩解':node.searchAction?'開箱搜尋':'路線環境變化');
 }
 function rules(s=current()){return s&&(s.rulesVersion>=3?regionalRules[s.region]:definitions[s.region].counter)||'';}
 function visibilityPenalty(r){
  const s=r?.environment;
  return s?.rulesVersion>=3&&s.region===r.expedition?.regionId&&((s.region==='sami'&&s.value>=4)||(s.region==='sargon'&&!s.value))?1:0;
 }
 function enterBase(node){const s=current();if(!s)return;s.actions++;const r=R(),d=definitions[s.region];if(window.FrontierExplorer?.mitigation(s.region))return;if(bagSize()/capacity()>(window.FrontierExplorer?.has(13)? .935:.85)){if(r.weightWard)r.weightWard=0;else r.alarm++;}if(s.rulesVersion>=3){travel(node,s,r);return}if(['kjerag','siesta','chernobog'].includes(s.region)&&s.actions%2===0){const insulated=s.region==='kjerag'&&R().story?.relics?.includes('thermal_core')&&Math.floor(s.actions/2)%2===0;if(!insulated){if(r.staminaWard){r.staminaWard=0;adjust(0,'耐力補給抵銷暴露')}else adjust(1,'環境暴露')}}if(s.region==='sami'&&(node.hidden||node.type==='elite'||s.actions%2===0))adjust(node.type==='elite'?2:1,'異常接觸');if(s.region==='sargon'&&s.actions%3===0){if(r.staminaWard){r.staminaWard=0;adjust(0,'耐力補給節水')}else adjust(-1,'沙海行軍')}if(s.region==='iberia')s.value=Math.floor(s.actions/2)%4;const combat=['battle','elite','boss','ambush'].includes(node.type);
 if(s.region==='columbia'&&(combat||node.type==='container'))adjust(1,'機械干擾');
 if(s.region==='lungmen'&&combat)adjust(1,'公開交戰');
 if(s.region==='kazimierz'&&combat)adjust(1,'賽事轉播');
 if(s.region==='siracusa'&&combat)s.hostility=Math.min(5,s.hostility+1);
 if(s.region==='victoria'&&['elite','boss'].includes(node.type))s.front=Math.max(-2,s.front-1);if(s.region==='sargon'&&s.value===0){if(r.fatigueConvert){r.fatigueConvert=0;FrontierCombat.heal(20);FrontierMedicine.scout(2)}else r.scoutLevel=Math.min(1,r.scoutLevel||0)}if(s.region==='sami'&&s.value>=4){const e=r.expedition,layer=e.layers[e.layer];for(const row of layer.rows.slice(e.row+1,e.row+2))for(const n of row)n.hidden=true}}
 function routeAccessible(node){const s=current();return !(s?.rulesVersion===2&&s.region==='iberia'&&s.value>=2&&node?.lane===2&&!node.storyEvent&&!node.requiredCombat&&['search','container','merchant'].includes(node.type))}
 function forceMove(reason){const r=R(),e=r?.expedition;if(!e)return false;if(r.forcedMoveShield){r.forcedMoveShield=0;return false}if(window.FrontierDefense?.blockDisplacement()){return false}e.lastLane=e.lastLane===1?0:1;r.alarm++;return true}
 function needsRelief(s=current()){
  if(!s)return false;
  if(s.region==='victoria')return s.front<0;
  if(s.region==='siracusa')return s.hostility>=3;
  if(s.region==='sargon')return s.value<=2;
  if(s.region==='iberia')return s.value===2;
  return s.value>=definitions[s.region].thresholds[0];
 }
 function pressure(){
  const s=current();if(!s)return;
  if(s.region==='victoria')s.front=Math.max(-2,s.front-1);
  else if(s.region==='siracusa')s.hostility=Math.min(5,s.hostility+1);
  else if(s.region==='iberia'){adjust(Math.min(2,s.value+1)-s.value,'不期而遇暴露');s.tideStep=s.value*2;}
  else adjust(s.region==='sargon'?-1:1,'不期而遇暴露');
 }
 function energy(base,turn){const s=current();if(s?.region==='kjerag'&&(s.value>=5||s.value>=3&&turn===1))return Math.max(2,base-1);return base}
 function healing(n){return current()?.region==='chernobog'&&current().value>=3?Math.floor(n*.9):n}
 function battleV3(s,r,b){
  const lead=b.enemies.find(e=>e.hp>0),team=r.team.filter(a=>a.hp>0&&!a.exited);
  if(!lead||!team.length)return;
  if(s.region==='lungmen'&&s.value>=3)lead.atk+=15;
  if(s.region==='kazdel'&&s.value>=4)lead.atk+=15;
  if(s.region==='yan'&&s.value>=3){lead.block=(lead.block||0)+40;lead.atk+=10;}
  if(s.region==='yan'&&s.value>=5)b.enemies.forEach(e=>{if(e!==lead)e.atk+=10});
  if(s.region==='kazimierz'&&s.value>=3)lead.atk+=10;
  if(s.region==='siracusa'&&s.hostility>=3)lead.atk+=20;
  if(s.region==='sargon'&&!s.value&&b.hand.length)b.draw.push(b.hand.pop());
  if(s.region==='columbia'&&s.value>=2)(s.value===3?b.enemies:[lead]).forEach(e=>e.block=(e.block||0)+40);
  if(s.region==='victoria'&&s.front<0)lead.atk+=15;
  if(s.region==='victoria'&&s.front>0||s.region==='iberia'&&!s.value)team.forEach(a=>a.block=(a.block||0)+20);
  if(s.region==='iberia'&&s.value===2)lead.block=(lead.block||0)+60;
  if(s.region==='siesta'&&s.value>=3)for(const a of team)burn(a);
  if(s.region==='chernobog'&&s.value>=5)pollute(team.slice(0,2));
  if(s.region==='sami'&&s.value>=8&&b.hand.length)b.hand.at(-1).environmentCost=1;
  if(s.region==='sami'&&s.value>=12)b.enemies.forEach(e=>e.atk+=10);
 }
 function pollute(team){
  if(FrontierMedicine.poisonFog(team,1))for(const a of team)if(a.status?.poison>0)(a.regionalAilments??={}).poison=true;
 }
 function burn(a){
  FrontierMedicine.inflict(a,'burn',1);
  if(a.status?.burn>0)(a.regionalAilments??={}).burn=true;
 }
 function battleBase(){const s=current(),r=R(),b=r?.battle;if(!s||!b||b.environmentReady||r.expedition&&!b.regionStatsReady||r.operatorSystemVersion===113&&b.operatorVersion!==113)return;b.environmentReady=true;b.energy=energy(b.energy,1);if(s.rulesVersion>=3){battleV3(s,r,b);return}if(s.region==='sami'&&s.value>=8&&b.hand.length){const c=b.hand[b.hand.length-1];c.environmentCost=1}if(s.region==='sami'&&s.value>=12)b.enemies.forEach(e=>{e.intent='attack';e.atk+=10});if(s.region==='lungmen'&&s.value>=3)b.enemies[0].intent='attack';if(s.region==='siracusa'&&s.hostility>=3){b.enemies[0].intent='attack';b.enemies[0].atk+=20}if(s.region==='columbia'&&s.value>=2)b.enemies[0].block+=40;if(s.region==='kazimierz'&&s.value>=3)b.enemies[0].atk+=10;if(s.region==='victoria'&&s.front<0){b.enemies[0].intent='attack';if(s.rulesVersion>=2)b.enemies[0].atk+=10}if(s.region==='victoria'&&s.front>0)r.team.filter(a=>a.hp>0).forEach(a=>a.block+=20)}
 function turnBase(){const s=current(),r=R(),b=r?.battle;if(!s||!b||b.environmentTurn===b.turn)return;b.environmentTurn=b.turn;const alive=r.team.filter(a=>a.hp>0&&!a.exited);
 if(s.rulesVersion>=3){
  const exposed=alive[(b.turn-1)%alive.length];
  if(!exposed)return;
  if(b.turn>1&&s.region==='siesta'&&s.value>=5)burn(exposed);
  if(s.region==='iberia'&&s.value===2){
   const lead=alive[0];
   FrontierMedicine.inflict(lead,'neural',1);
   if(lead.status?.neural>=3){lead.status.neural-=3;b.regionalApTax=Math.max(b.regionalApTax||0,1);}
  }
  if(s.region==='chernobog'&&s.value>=5)pollute([exposed]);
  return;
 }
 if(s.region==='siesta'&&s.value>=3)alive.forEach(a=>FrontierMedicine.inflict(a,'burn',1));if(s.region==='iberia'&&s.value===3&&alive.length)FrontierMedicine.inflict(alive[0],'neural',1);if(s.region==='chernobog'&&s.value>=5&&alive.length)FrontierMedicine.poisonFog([alive[0]],1)}
 function treat(){const s=current();if(!s)return;if(s.region==='sargon')adjust(3,'補水');else if(s.region==='siracusa'){s.hostility=Math.max(0,s.hostility-2);s.trust=Math.min(5,s.trust+1)}else if(s.region==='victoria')s.front=Math.min(2,s.front+1);else if(s.region==='iberia'){s.value=0;s.tideStep=0;}else adjust(-3,'營地環境處理')}
 function attackMultiplier(){return current()?.region==='kazdel'&&R().story?.flags.pact?1.15:1}
 function effect(s){
  if(s.rulesVersion>=3){
   if(s.region==='iberia')return ['我方開場＋20盾','','敵方開場＋60盾 · 神經損傷',''][s.value];
   if(s.region==='sargon'&&!s.value)return '缺水 · 開場少抽1張';
   if(s.region==='yan'&&s.value>=3)return s.value>=5?'先鋒＋40盾 · 敵方全體 ATK＋10':'敵方先鋒＋40盾 · ATK＋10';
   if(s.region==='kazdel'&&s.value>=4)return '敵方先鋒 ATK＋15'+(R().story?.flags.pact?' · 契約已啟用':'');
   if(s.region==='columbia'&&s.value>=2)return (s.value===3?'敵方全隊':'敵方先鋒')+'開場＋40盾';
   if(s.region==='siesta'&&s.value>=3)return s.value>=5?'全隊開場灼燒 · 後續輪流暴露':'全隊開場灼燒';
   if(s.region==='lungmen'&&s.value>=3)return '先鋒 ATK＋15'+(s.value>=4?' · 容器停售':'');
   if(s.region==='siracusa'&&s.hostility>=3)return '先鋒 ATK＋20 · 商價受敵意影響';
   if(s.region==='victoria'&&s.front!==0)return s.front>0?'開場全隊＋20盾':'敵方先鋒 ATK＋15';
  }
  const effects={chernobog:()=>s.value>=5?'毒霧 · 治療−10%':s.value>=3?'治療−10%':'',
   lungmen:()=>s.value>=4?'封存箱停售':s.value>=3?'先鋒盤查':'',
   siesta:()=>s.value>=3?'敵方階段全隊受灼燒':'',
   sargon:()=>s.value===0?'缺水 · 偵察受限':'',
   kazimierz:()=>s.value>=3?'勝利＋5外勤點':'',
   kjerag:()=>s.value>=5?'每回合−1 AP':s.value>=3?'首回合−1 AP':'',
   siracusa:()=>s.hostility>=3?'先鋒攻擊＋2':s.trust>0?'行商折扣':'',
   columbia:()=>s.value>=2?'先鋒開場＋4盾':'',
   victoria:()=>s.front>0?'開場全隊＋2盾':s.front<0?'敵方先鋒強攻':'',
   iberia:()=>s.value===3?'高潮 · 神經侵蝕':s.value===2?'淺灘封鎖':'',
   sami:()=>s.value>=12?'追擊與卡牌干擾':s.value>=8?'首手一張牌＋1 AP':s.value>=4?'後續節點遮蔽':'',
   kazdel:()=>R().story?.flags.pact?'契約 · 出牌傷害＋15%':'',
   yan:()=>s.value>=3?'先鋒墨痕護盾':''};
  return effects[s.region]();
 }
 function label(s=current()){
  if(!s)return '';
  const d=definitions[s.region],state=s.region==='siracusa'?'信任 '+s.trust+'／敵意 '+s.hostility:s.region==='victoria'?['退卻','僵持','推進'][Math.sign(s.front)+1]:s.region==='iberia'&&s.rulesVersion>=3?tideNames[s.value]:s.value+'/'+d.max;
  return d.name+' · '+state;
 }
 function view(){const s=current();if(!s)return'';const active=effect(s);return `<section class="panel environment-panel"><b>${label(s)}${active?' · '+active:''}</b><p class="tiny muted">${rules(s)}</p>${s.region==='sami'&&s.value>=4?'<p>坍縮範式：遮蔽'+(s.value>=8?'／認知干擾':'')+(s.value>=12?'／追擊':'')+'</p>':''}</section>`}
 function forecast(region){const d=definitions[region],level=db.exploration?.regions[region]?.level||0,brief={chernobog:['工業污染','抗毒／淨化戰術補給；持續治療'],lungmen:['都市盤查','降低通緝的情報事件；預留源石碇'],siesta:['火山熱流','抗灼戰術補給；灼傷減免防護'],sargon:['乾燥沙海','耐力補給；降低負重，營地補水'],kazimierz:['公開賽事','穿甲與破盾攻擊；選擇低調路線'],kjerag:['持續降雪','抗寒戰術補給；防凍護具，注意首回合能量'],siracusa:['家族巡查','交涉情報；避免不必要敵意'],columbia:['設施干擾','淨化與技能冷卻管理'],victoria:['交錯戰線','支援物資；防護與續航'],iberia:['週期潮汐','神經穩定戰術補給；留意高潮接敵'],sami:['異常坍縮','淨化與情報工具；預留營地穩定'],kazdel:['戰場殘響','自願契約的負面牌整理與保命戰術補給'],yan:['歲夢侵擾','護盾與灼燒防護；預留營地平復歲夢']}[region];return `<h3>${d.name}</h3><p>${regionalRules[region]}</p>${level>=2?`<section class="forecast-detail"><b>Lv.2 行前詳報</b><p>預測環境：${brief[0]}<br>建議整備：${brief[1]}</p><p class="tiny">環境依實際探索行動推進，開箱搜索也計入；暫停不推進。營地與戰術補給可處理風險，不會加金紅掉率。</p></section>`:'<p class="tiny muted">地區探索Lv.2可讀取整備與行動規則詳報。</p>'}${level>=5?'<p class="tiny">Lv.5：可尋找高階地區調查，完成後保存專屬觀測檔案。</p>':''}<p class="tiny muted">預報提供環境規則，不揭露寶箱內容或完整隱藏結局條件。</p>`}

 function enter(node){return window.FrontierCurios?FrontierCurios.withEnvironment(()=>enterBase(node)):enterBase(node)}

 function battle(){return window.FrontierCurios?FrontierCurios.withEnvironment(()=>battleBase()):battleBase()}

 function turn(){return window.FrontierCurios?FrontierCurios.withEnvironment(()=>turnBase()):turnBase()}
 const oldStart=startRun;startRun=function(){const before=R();oldStart();if(R()&&R()!==before&&R().expedition){R().environment=create(R().expedition.regionId);save();render()}};
 const oldEnter=FrontierExpedition.enterNode;FrontierExpedition.enterNode=function(id){const e=R()?.expedition,n=e?.layers[e.layer].rows[e.row]?.find(n=>n.id===id);if(n&&FrontierExpedition.available(n)&&current())enter(n);return oldEnter(id)};
 const oldPreview=FrontierExpedition.preview;FrontierExpedition.preview=function(id){const exp=R()?.expedition,node=exp?.layers[exp.layer].rows[exp.row]?.find(n=>n.id===id);if(node&&!routeAccessible(node)){modal('高潮封鎖 · 淺灘路線','<p>目前潮汐不適合通行右側可選淺灘。左側與中央主路保持可通行；潮汐隨探索行動改變，原地等待不會退潮。</p>','');return}return oldPreview(id)};
 const oldHeader=runHeader;runHeader=function(){return oldHeader()+view()};
 const oldBattle=battleView;battleView=function(){battle();oldBattle()};
 const oldStats=cardStats;cardStats=function(c){const d=oldStats(c);if(c.environmentCost)d.cost+=c.environmentCost;return d};
 const oldTurn=endTurn;endTurn=function(){const b=R()?.battle;if(b){turn();for(const pile of ['hand','draw','discard','exhaust'])for(const c of b[pile])delete c.environmentCost}return oldTurn()};
 const oldCheck=checkBattle;checkBattle=function(){const r=R(),b=r?.battle,s=current();if(b&&s&&r.hp>0&&b.enemies.every(e=>e.hp<=0)&&!b.envReward){b.envReward=true;if(s.region==='kazimierz'&&s.value>=3)r.fieldPoints+=5;if(s.region==='victoria'&&s.front>0)r.field.materials.mat_iron_t1=(r.field.materials.mat_iron_t1||0)+2}return oldCheck()};
 const oldUse=FrontierMedicine.use;FrontierMedicine.use=function(id,target){const before=R()?.field.materials[id]||0;oldUse(id,target);if(current()&&(R()?.field.materials[id]||0)<before){const family=FrontierInventory.definitions[id]?.family;if(family==='cold'&&current().region==='kjerag'||family==='fire'&&current().region==='siesta'||family==='purify'&&['sami','chernobog','columbia'].includes(current().region))adjust(-2,'環境使用補給');save();render()}};
 const oldPrepare=prepare;prepare=function(){oldPrepare();const select=document.querySelector('#exp-region');if(select){const panel=document.createElement('section');panel.className='panel';panel.id='environment-forecast';panel.innerHTML=forecast(select.value);select.after(panel);select.addEventListener('change',()=>{panel.innerHTML=forecast(select.value)})}};
 const oldMerchant=FrontierTrading.fieldMerchant;FrontierTrading.fieldMerchant=function(node){oldMerchant(node);const s=current(),e=R()?.event;if(s?.region==='siracusa'&&e?.type==='fieldMerchant'){for(const row of e.rows)row.price=Math.max(1,Math.ceil(row.price*(1-Math.min(5,s.trust)*.03+(s.hostility>=3?.10:0))));save();render()}};
 const oldBuy=FrontierTrading.fieldBuy;FrontierTrading.fieldBuy=function(id){const s=current();if(s?.region==='lungmen'&&s.value>=4&&id==='sealed'){toast('通緝4星以上：行商拒絕出售封存箱。可透過區域情報事件降低通緝。');return}return oldBuy(id)};
 const oldSkill=FrontierCombat.skill;FrontierCombat.skill=function(id){const b=R()?.battle,before=b?.energy;oldSkill(id);if(b&&R()?.battle===b&&b.energy<before&&current()?.region==='columbia'&&current().value>=2){const a=R().team.find(a=>a.id===id);if(a)a.cooldown++;save();render()}};
 const oldValid=validSave;validSave=function(v){if(!oldValid(v))return false;const s=v.run?.environment;return !s||s.version===1&&(s.tideStep===undefined||s.region==='iberia'&&Number.isInteger(s.tideStep)&&s.tideStep>=0&&s.tideStep<8)&&definitions[s.region]?.id===s.id&&Number.isInteger(s.value)&&s.value>=0&&s.value<=definitions[s.region].max&&Number.isInteger(s.actions)&&s.actions>=0&&Array.isArray(s.forecasts)&&s.forecasts.length<=40&&Number.isInteger(s.trust)&&Number.isInteger(s.hostility)&&Number.isInteger(s.front)};
 return{effect,label,rules,needsRelief,pressure,routeImpact,travelHint,visibilityPenalty,attackMultiplier,definitions,current,create,adjust,enter,forceMove,energy,healing,battle,turn,treat,view,forecast,routeAccessible};
})();
