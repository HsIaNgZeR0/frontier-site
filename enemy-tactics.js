'use strict';
window.FrontierEnemyTactics=(()=>{
 const fragment='frontier_planetary_fragment';
 const fragmentDef={name:'行星碎屑・星環',kind:'enemy',rarity:3,image:fragment,boss:true,archetype:'guard',wiki:'行星碎屑'};
 FrontierEnemyData.units[fragment]=fragmentDef;
 FrontierCapture.units[fragment]=fragmentDef;
 // The effects translate lane, deployment and attack-speed mechanics into card-battle rules.
 // Values here are Frontier balance, while wiki references identify the source enemy.
 const bosses={
  enemy_1500_skulsr:['源石榴彈',{splash:2,weaken:true,damage:'physical'}],
  enemy_1502_crowns:['煙幕轉位',{ward:.35,dodge:true,target:'weakest'}],
  enemy_1505_frstar:['寒潮擴散',{status:'cold',splash:3,damage:'arts'}],
  enemy_1508_faust:['紫箭校準',{target:'strongest',special:1.28,ward:.22}],
  enemy_1509_mousek:['雙向沙暴',{target:'strongest',second:'weakest',status:'corrosion',splash:2,damage:'arts'}],
  enemy_1510_frstar2:['冬痕回生',{status:'cold',splash:2,tax:1,damage:'arts'}],
  enemy_1050_lslime:['熔核噴發',{status:'burn',splash:3,damage:'arts'}],
  enemy_1545_shpkg:['羊群泡泡',{shield:20,recover:6,splash:2,damage:'arts'}],
  enemy_1512_mcmstr:['外殼破裂',{shield:24,ward:.25,splash:2}],
  enemy_1532_minima:['工業過載',{status:'burn',special:1.24,second:'strongest',damage:'arts'}],
  enemy_1558_sgactr:['往昔回音',{status:'corrosion',recover:8,target:'weakest'}],
  enemy_1513_dekght:['雙騎士狂怒',{attack:3,rally:3,special:1.16}],
  enemy_1104_lfkght_3:['左手貫槍',{target:'strongest',weaken:true,special:1.25}],
  enemy_1524_bldkgt:['血刃回流',{status:'bleed',recover:8,shield:14}],
  enemy_1525_blkswb:['破甲突進',{target:'strongest',weaken:true,attack:3}],
  enemy_1549_windoc:['供暖中斷',{status:'cold',splash:2,recover:5,damage:'arts'}],
  enemy_1560_cnvlap:['狂歡升溫',{status:'burn',rally:2,splash:2,damage:'arts'}],
  enemy_1535_wlfmster:['溶血駭懼',{fear:true,target:'weakest',splash:3,damage:'arts'}],
  enemy_1531_bbrain:['裝置再啟',{shield:24,recover:7,damage:'arts'}],
  enemy_1543_cstlrs:['星環與熱寂',{rings:true,splash:2,damage:'arts'}],
  enemy_1516_jakill:['雙形態格鬥',{status:'bleed',attack:2,damage:'physical',weaken:true}],
  enemy_1523_mandra:['石像護殼',{ward:.34,shield:18,damage:'arts'}],
  enemy_1528_manfri:['枯木新枝',{ward:.40,splash:2,damage:'arts',siege:true}],
  enemy_1533_stmkgt:['蒸汽再加壓',{shield:25,status:'burn',special:1.18}],
  enemy_1521_dslily:['大群同化',{status:'corrosion',rally:2,splash:2,damage:'arts'}],
  enemy_1529_dsdevr:['大靜謐',{status:'neural',splash:3,tax:1,damage:'arts'}],
  enemy_2027_syudg2:['深海裁決',{target:'weakest',status:'neural',special:1.20,damage:'arts'}],
  enemy_2054_smdeer:['意志震盪',{splash:3,rally:2,status:'cold',damage:'arts'}],
  enemy_2055_smlead:['木裂追獵',{target:'weakest',status:'bleed',attack:3}],
  enemy_2056_smedzi:['無垠迴盪',{status:'neural',ward:.25,tax:1,damage:'arts'}],
  enemy_1552_mmamiy:['情緒湧流',{damage:'true',splash:2,ward:.20}],
  enemy_1554_lrtsia:['敘事再構',{shield:24,recover:8,splash:2,damage:'arts'}],
  enemy_2089_skzjkl:['王劍重壓',{target:'strongest',weaken:true,tax:1,damage:'arts'}]
 };
 const ailment={burn:'灼燒',cold:'寒冷',bleed:'流血',neural:'神經損傷',corrosion:'腐蝕'};
 const profile=e=>e?.tacticsBoss?bosses[e.species]?.[1]:null;
 for(const [,p]of Object.values(bosses))for(const k of ['shield','recover','rally','attack'])if(typeof p[k]==='number')p[k]*=10;
 const threshold=e=>Math.max(1,Math.ceil(e.max*.5));
 const rings=(battle,boss)=>battle.enemies.filter(e=>e.regionalFragment&&e.fragmentOwner===boss.uid&&e.hp>0);
 const tierNames={physical:'物理',arts:'法術',true:'真實',none:'不攻擊'};
 function describeBoss(id){
  const custom={enemy_1528_manfri:'manfred',enemy_1524_bldkgt:'bloodknight',enemy_1523_mandra:'mandragora',enemy_1532_minima:'minimalist'}[id];
  if(custom&&globalThis.FrontierRegional75)return FrontierRegional75.legacyNotices[custom];
  const data=bosses[id];if(!data)return '';
  const [name,p]=data,parts=['末段首領在生命降至 50% 時切換第二形態。'];
  if(p.rings)parts.push('開場有 2 顆星環，每兩回合補 1 顆，上限 4。每顆使本體減傷 15%。第二形態立即補最多 2 顆，之後停止補充，普攻波及 1 人。第二形態擊破星環會使下回合初始 AP 減 1，最低 1，同一回合最多扣 1。');
  else{
   if(p.shield)parts.push('轉換時取得 '+p.shield+' 點護盾。');
   if(p.attack)parts.push('轉換時攻擊永久 +'+p.attack+'。');
   if(p.rally)parts.push('轉換時在場其他敵人攻擊永久 +'+p.rally+'。');
   if(p.recover)parts.push('第二形態每次自身行動前恢復 '+p.recover+' HP，最多回到半血。');
   if(p.ward)parts.push('第二形態'+(p.dodge?'每回合首次受擊':'')+'受到的物理及法術傷害降低 '+Math.round(p.ward*100)+'%。'+(p.siege?'每次成功破韌後失去減傷，直到下一個出牌回合結束。':''));
   if(p.target)parts.push('第二形態優先瞄準'+(p.target==='weakest'?'生命比例最低':'攻擊最高')+'者，嘲諷可轉移。');
   if(p.splash)parts.push('第二形態普攻波及 '+(p.splash-1)+' 人，副目標原始傷害減半。');
   if(p.second)parts.push('第二形態在偶數回合切換優先目標。');
   if(p.damage)parts.push('第二形態攻擊為'+tierNames[p.damage]+'傷害。');
   if(p.status)parts.push('第二形態攻擊扣除 HP 時施加 1 層'+ailment[p.status]+'。');
   if(p.weaken)parts.push('第二形態特殊攻擊扣除 HP 時，使目標下一張攻擊牌傷害降低 20%。');
   if(p.special)parts.push('第二形態特殊攻擊原始傷害額外提高 '+Math.round((p.special-1)*100)+'%。');
   if(p.tax)parts.push('第二形態成功施放特殊攻擊後，下回合初始 AP 減 1，最低 1。');
   if(p.fear)parts.push('第二形態特殊攻擊造成生命損失時，受傷幹員的卡牌 +1 AP。再對扎羅造成相當於其最大 HP 20% 的傷害後解除全隊恐懼。');
  }
  return name+'：'+parts.join('');
 }
 function addRings(s,boss,count){
  let n=Math.min(count,4-rings(s,boss).length);
  while(n-->0){
   const id='e'+(1000+(s.fragmentSerial=(s.fragmentSerial||0)+1)),hp=[150,190,240,290][boss.mechanicTier||0];
   s.enemies.push({id,uid:id,name:fragmentDef.name,species:fragment,regionRoster:boss.regionRoster,regionalFragment:true,fragmentOwner:boss.uid,icon:'◈',hp,max:hp,atk:0,def:0,res:0,block:0,poison:0,vuln:0,intent:'defend',damageType:'none',action:{kind:'defend',damageType:'none'},captureTries:0,mechanicTier:boss.mechanicTier||0});
  }
 }
 function start(r){
  const s=r?.battle,boss=s?.enemies.find(e=>e.boss);
  if(!r?.expedition||s?.operatorVersion!==113||s.enemyTacticsVersion)return false;
  s.enemyTacticsVersion=1;
  if(r.expedition.layer>=4&&bosses[boss?.species]){boss.tacticsBoss=1;boss.tacticsOpeningDamage=boss.damageType;if(profile(boss).rings)addRings(s,boss,2)}
  return true;
 }
 function limitLoss(e,loss){return e.tacticsBoss===1?Math.min(loss,Math.max(0,e.hp-threshold(e))):loss}
 function phase(e,s){
  if(e.tacticsBoss!==1||e.hp<=0||e.hp>threshold(e))return false;
  const p=profile(e);if(!p)return false;
  e.tacticsBoss=2;
  e.atk+=p.attack||0;
  e.block=(e.block||0)+(p.shield||0);
  if(p.damage)e.damageType=p.damage;
  if(p.status){e.status=p.status;e.statusStacks=1}
  if(p.rally)for(const ally of s.enemies)if(ally!==e&&ally.hp>0&&!ally.regionalFragment)ally.atk+=p.rally;
  if(p.rings)addRings(s,e,2);
  return true;
 }
 function beforeDamage(e,s,raw,type){
  const p=profile(e);
  if(!p||raw<=0)return raw;
  if(p.rings)return Math.floor(raw*(1-rings(s,e).length*.15));
  if(e.tacticsBoss!==2||!p.ward||type==='true')return raw;
  if(p.siege&&e.special?.solved&&e.tacticsWardBreak!==e.special.due){e.tacticsWardBreak=e.special.due;e.tacticsWardDownUntil=s.turn+1}
  if(p.siege&&e.tacticsWardDownUntil>=s.turn)return raw;
  if(p.dodge&&e.tacticsDodgeTurn===s.turn)return raw;
  if(p.dodge)e.tacticsDodgeTurn=s.turn;
  return Math.floor(raw*(1-p.ward));
 }
 function afterDamage(e,s,loss){
  if(e.regionalFragment&&loss>0&&e.hp<=0){
   const boss=s.enemies.find(x=>x.uid===e.fragmentOwner&&x.hp>0);
   if(boss?.tacticsBoss===2)s.regionalApTax=Math.max(1,s.regionalApTax||0);
   return;
  }
  const p=profile(e);
  if(!p)return;
  if(p.fear&&e.fearReleaseHp!==undefined&&(e.hp<=e.fearReleaseHp||e.hp<=0)){
   for(const ally of s.team)if(ally.regionalFear===e.uid)delete ally.regionalFear;
   delete e.fearReleaseHp;
  }
  phase(e,s);
  if(e.hp<=0&&p.rings)for(const ring of rings(s,e)){ring.hp=0;ring.mechanicRemoved=true}
 }
 function beforeEnemy(e,s){
  if(e.regionalFragment)return false;
  const p=profile(e);
  if(!p)return true;
  phase(e,s);
  if(p.rings&&e.tacticsBoss===1&&s.turn%2===0)addRings(s,e,1);
  if(p.recover&&e.tacticsBoss===2)e.hp=Math.min(threshold(e),e.hp+p.recover);
  return true;
 }
 const formationTraits={armor:'護衛陣形',heal:'宿主互援',rally:'掩護指揮',artillery:'交叉砲火'};
 function formationDetail(e){
  const title=formationTraits[e.regionalTrait];if(!title||e.boss)return '';
  if(e.regionalTrait==='heal')return title+'：每個敵方階段結束時，回復另一名受傷敵人 40 HP。';
  if(e.regionalTrait==='artillery')return title+'：第 3 回合起，每 3 回合的普通攻擊多波及 1 人。';
  return title+'：第 1 回合敵方階段結束時，為另一名生命比例最低的敵人提供 50 點護盾。';
 }
 function splash(e,s){return s.enemyTacticsVersion&&!e.boss&&e.regionalTrait==='artillery'&&s.turn%3===0?3:0}
 function afterRound(s){
  if(!s.enemyTacticsVersion)return;
  for(const e of s.enemies.filter(x=>x.hp>0&&!x.boss&&!x.regionalFragment)){
   const trait=e.regionalTrait;
   if(trait!=='heal'&&!(s.turn===1&&['armor','rally'].includes(trait)))continue;
   const ally=s.enemies.filter(x=>x!==e&&x.hp>0&&!x.regionalFragment).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];
   if(!ally)continue;
   if(trait==='heal')ally.hp=Math.min(ally.max,ally.hp+40);
   else ally.block=(ally.block||0)+50;
  }
 }
 function afterHit(e,actor,s,special){
  const p=profile(e);
  if(!special||e.tacticsBoss!==2||!p)return;
  if(p.weaken)actor.regionalAttackWeaken=true;
  if(p.fear){e.fearReleaseHp??=Math.max(0,e.hp-Math.ceil(e.max*.2));actor.regionalFear=e.uid}
 }
 function special(e,s,raw){
  const p=profile(e);
  if(e.tacticsBoss!==2||!p)return raw;
  if(p.tax)s.regionalApTax=Math.max(p.tax,s.regionalApTax||0);
  return Math.round(raw*(p.special||1));
 }
 function target(e,team,turn){
  const p=profile(e);
  if(!p||e.tacticsBoss!==2||!p.target)return null;
  const mode=p.second&&turn%2===0?p.second:p.target;
  return team.filter(a=>a.operator!=='flow').reduce((best,a)=>!best||(mode==='weakest'?a.hp/a.max<best.hp/best.max:a.atk>best.atk)?a:best,null);
 }
 function detail(e){
  if(e.regionalFragment)return '星環：本身不攻擊。存活時替克麗斯騰減傷 15%。第二形態擊破後，下一回合初始 AP 減 1。';
  if(!e.tacticsBoss)return '';
  const p=profile(e);
  return '目前形態 '+e.tacticsBoss+'／2'+(p?.rings?' · 星環 '+rings(R().battle,e).length+'／4':'')+'\n'+describeBoss(e.species);
 }
 function cost(actor){return actor?.regionalFear?1:0}
 return {fragment,bosses,tierNames,describeBoss,start,limitLoss,phase,beforeDamage,afterDamage,beforeEnemy,afterHit,special,target,detail,cost,profile,afterRound,splash,formationDetail};
})();
