'use strict';
window.FrontierRegionalEnemies=(()=>{
 const roster=window.FrontierRegionalRoster,units=window.FrontierEnemyData.units;
 const traits={
  fast:{title:'搶攻',opening:3,text:'本場第一次普通攻擊的原始傷害 +30。'},
  brace:{title:'迎擊甲片',mitigate:5,physical:true,text:'本場首次受到物理攻擊時，將該擊原始傷害減少 5。'},
  veil:{title:'掩護',mitigate:5,text:'本場首次受到物理或法術攻擊時，將該擊原始傷害減少 5。'},
  reflect:{title:'折射護層',mitigate:8,artsOnly:true,text:'本場首次受到法術攻擊時，將該擊原始傷害減少 8。'},
  heal:{title:'宿主再生',heal:3,text:'每次開始自己的敵方行動時，恢復 3 HP，不超過最大生命。'},
  artillery:{title:'範圍砲擊',splash:true,arts:true,text:'普通攻擊另波及一名存活幹員，副目標承受一半原始法術傷害。'},
  frostShooter:{title:'凍結獵手',frostBonus:4,text:'攻擊遭凍結、招牌技能目前被封鎖的幹員時，原始傷害 +4。'},
  frostArts:{title:'冰原術法',status:'cold',arts:true,text:'以法術攻擊。攻擊造成生命損失時，施加 1 層寒冷；通常 3 層會封鎖下一個出牌回合的招牌技能。'},
  flare:{title:'狂歡熱浪',splash:true,arts:true,status:'burn',text:'普通攻擊另波及一名幹員，副目標承受一半原始傷害。造成生命損失時施加 1 層灼燒，結束出牌時每層扣 2 HP 並消退一層。'},
  debt:{title:'血債',deathRally:1,text:'遭攻擊擊倒時，其他存活敵人攻擊永久提高 1 點。收容成功不會觸發。'},
  alert:{title:'警報',woundedRally:2,text:'首次受傷且存活時，其他存活敵人的攻擊永久提高 2 點。'},
  titus:{title:'破勢長槍',special:1.15,target:'strongest',weaken:true,text:'優先瞄準攻擊最高的存活幹員，嘲諷可轉移。特殊攻擊原始傷害 +15%；命中造成生命損失時，受傷幹員下一張攻擊牌的傷害降低 20%。可破韌取消。'},
  armor:{title:'裝甲護衛',start:6,text:'開戰時取得 6 點護盾。'},
  barrier:{title:'階段屏障',start:8,phase:10,text:'開戰時取得 8 點護盾。第一次在半血以下進入回合時，再取得 10 點護盾。'},
  rush:{title:'負傷反撲',phaseAttack:3,text:'第一次在半血以下進入回合時，攻擊永久提高 3 點。'},
  ambush:{title:'隱匿突進',phaseAttack:2,text:'第一次在半血以下進入回合時，攻擊永久提高 2 點。'},
  snipe:{title:'精準狙擊',target:'weakest',text:'優先瞄準存活幹員中生命比例最低者；嘲諷仍可改變目標。'},
  charge:{title:'強力蓄擊',special:1.15,text:'未被破解的特殊攻擊原始傷害提高 15%。低難度仍適用多目標傷害上限。'},
  bleed:{title:'血刃',status:'bleed',text:'攻擊造成生命損失時，施加 1 層流血。下一次結束出牌時，每層扣 1 HP，之後減少 1 層；可提前淨化。'},
  burn:{title:'灼熱',status:'burn',text:'攻擊造成生命損失時，施加 1 層灼燒。下一次結束出牌時，每層扣 2 HP，之後減少 1 層；可提前淨化。'},
  cold:{title:'極寒',status:'cold',text:'攻擊造成生命損失時，施加 1 層寒冷。通常累積 3 層會凍結，封鎖下一個出牌回合的招牌技能；可用抗寒藥。'},
  neural:{title:'神經侵蝕',status:'neural',text:'攻擊造成生命損失時，施加 1 層神經損傷。每累積 3 層即消耗 3 層，使下回合初始 AP 減少 1，最低 1。'},
  corrosion:{title:'腐蝕',status:'corrosion',text:'攻擊造成生命損失時，施加 1 層腐蝕。下一次承受物理攻擊時，每層使該擊原始傷害 +1，最多 +3，隨後清除。'},
  foam:{title:'泡沫屏障',phase:12,arts:true,text:'造成法術傷害。第一次在半血以下進入回合時，取得 12 點護盾。'},
  arts:{title:'源石技藝',arts:true,text:'攻擊造成法術傷害，由法抗減免。'},
  jailbreak:{title:'越獄號令',phaseAttack:2,rally:2,text:'第一次在半血以下進入回合時，自己和其他存活敵人的攻擊永久提高 2 點。'},
  rally:{title:'集結號令',rally:2,text:'第一次在半血以下進入回合時，其他存活敵人的攻擊永久提高 2 點。'},
  tax:{title:'狼群威壓',tax:1,text:'特殊攻擊未被破解並施放後，隊伍下回合初始 AP 減少 1，最低 1。'},
  gravity:{title:'重力擾動',tax:1,arts:true,text:'造成法術傷害。特殊攻擊未被破解並施放後，隊伍下回合初始 AP 減少 1，最低 1。'},
  redBlade:{title:'紅刃狂怒',phaseAttack:6,text:'首次在半血以下行動時，攻擊永久提高 60。'},
  iceCast:{title:'蓄積寒氣',arts:true,status:'cold',statusEvery:3,text:'以法術攻擊。每第三次攻擊造成生命損失時，追加 1 層寒冷。'},
  packFang:{title:'群獵',pack:10,text:'場上每多一名存活同伴，普通攻擊原始傷害 +10，最多 +30。先清掉其他敵人可削弱牠。',combatText61:'場上每多一名存活同伴，普通攻擊原始傷害 +10，最多 +30。'},grayTail:{title:'破盾突進',start:8,artsBreakShield:true,text:'開戰取得 80 護盾。首次法術命中帶盾的灰尾會移除剩餘護盾，灰尾同時獲得 25 攻擊。'},
  longShot:{title:'狙擊壓制',target:'weakest',stunEvery:3,text:'瞄準生命比例最低的幹員。每第三次攻擊造成生命損失時，使受傷幹員下一回合無法出牌。'},
  volleyCar:{title:'連續扣殺',ramp:15,text:'連續回合攻擊時，每次原始傷害再加 15，最多加 45。中斷一回合後歸零。'},
  unlitArcher:{title:'暗處弩矢',artsUntil:2,text:'前兩回合發射法術弩矢，第 3 回合起改為物理傷害。'},
  bloodKnight:{title:'沸血競技',rallyFromDefeat:15,text:'其他敵人被攻擊擊倒時，攻擊永久提高 15，本場最多三次。'},
  iceHunter:{title:'獵人索敵',target:'lowestDef',text:'優先瞄準防禦最低的存活幹員。嘲諷仍可轉移。'},
  frostDrone:{title:'抗寒機體',start:4,mitigate:6,artsOnly:true,text:'開戰取得 40 護盾，首次受到法術攻擊時減少 60 點原始傷害。'},
  bloodDebtShot:{title:'清算弩矢',debtArts:true,text:'敘拉古敵意達 3 時改用法術弩矢，否則造成物理傷害。'},
  debtAssassin:{title:'伏擊清算',mitigate:5,debtBonus:true,text:'首次受物理或法術攻擊時減少 50 點原始傷害。敘拉古敵意達 3 時，普通攻擊原始傷害增加 25%。'},
  armorRepair:{title:'裝甲維修',arts:true,repair:true,text:'以法術攻擊。每次行動前，修復一台受傷的動力裝甲，回復其 6% 最大生命。控制工程員可阻止當輪維修。'},
  overloadArmor:{title:'超負載',special:1.2,stunSpecial:true,text:'特殊攻擊原始傷害提高 20%，若造成生命損失，受傷幹員下一回合無法出牌。可破韌取消。'},
  decayingDrone:{title:'隱匿與衰減',mitigate:5,decay:.08,text:'首次受物理或法術攻擊時減少 50 點原始傷害。每次行動前流失 8% 最大生命，最低保留 1 HP。'},
  emberReturn:{title:'餘燼復燃',status:'burn',revive:.25,text:'首次被傷害擊倒時，以 25% 最大生命復燃一次。攻擊造成生命損失時施加 1 層灼燒。'},
  nutrientDodge:{title:'溟痕閃避',dodge:.3,text:'本回合首次受到物理或法術傷害時減少 30%；受束縛、暈眩或沉默時失效。'},
  neuralChoir:{title:'神經共鳴',status:'neural',splash:3,arts:true,text:'普通攻擊波及最多 2 名額外幹員，副目標承受一半原始法術傷害。造成生命損失時附加 1 層神經損傷。'},
  taintedAdvance:{title:'染污躁動',phaseAttack:3,text:'首次在半血以下行動時，攻擊永久提高 30。'},
  unladenGolem:{title:'卸載後加速',phaseAttack:5,text:'半血以下首次行動時卸下負重，攻擊永久提高 50。'},
  lancer:{title:'穿刺衝鋒',opening:4,text:'本場首次普通攻擊原始傷害增加 40。'},
  casterChains:{title:'術式枷鎖',arts:true,stunSpecial:true,text:'以法術攻擊；特殊攻擊造成生命損失時，受傷幹員下一回合無法出牌。可破韌取消。'}
 };
 for(const t of Object.values(traits))for(const k of ['opening','mitigate','heal','frostBonus','phase','phaseAttack','rally','start','deathRally','woundedRally'])if(typeof t[k]==='number')t[k]*=10;
 // These descriptions are already in live combat units; never apply the legacy prose scaler again.
 const text61={fast:t=>'本場首次普通攻擊的原始傷害 +'+t.opening+'。',debt:t=>'遭攻擊擊倒時，其他存活敵人的攻擊永久 +'+t.deathRally+'；收容不觸發。',alert:t=>'首次受傷且存活時，其他存活敵人的攻擊永久 +'+t.woundedRally+'。',rush:t=>'首次在半血以下進入回合時，攻擊永久 +'+t.phaseAttack+'。',ambush:t=>'首次在半血以下進入回合時，攻擊永久 +'+t.phaseAttack+'。',jailbreak:t=>'首次在半血以下進入回合時，自己攻擊永久 +'+t.phaseAttack+'，其他存活敵人攻擊永久 +'+t.rally+'。',rally:t=>'首次在半血以下進入回合時，其他存活敵人攻擊永久 +'+t.rally+'。',corrosion:()=> '造成生命損失時施加 1 層腐蝕。下一次承受物理攻擊時，每層增加 10 原始傷害，最多 30，之後清除。'};
 for(const[id,t]of Object.entries(traits))if(text61[id]||['redBlade','iceCast','grayTail','longShot','volleyCar','unlitArcher','bloodKnight','iceHunter','frostDrone','bloodDebtShot','debtAssassin','armorRepair','overloadArmor','decayingDrone','emberReturn','nutrientDodge','neuralChoir','taintedAdvance','unladenGolem','lancer','casterChains'].includes(id)){t.combatText61=text61[id]?text61[id](t):t.text;}
 const specialTraits={
  enemy_1000_gopro_2:'fast',enemy_1011_wizard:'arts',enemy_1032_katar:'brace',enemy_1006_shield:'armor',enemy_1034_laxe:'rush',
  enemy_1043_zomsbr:'heal',enemy_1038_lunmag:'arts',enemy_1057_gansho:'snipe',enemy_1066_snbow:'frostShooter',enemy_1045_hammer:'charge',enemy_1069_icebrk:'frostShooter',
  enemy_1046_agent:'reflect',enemy_1047_sagent:'snipe',enemy_1004_mslime:'corrosion',enemy_1344_ddlamb:'burn',enemy_1345_tplamb:'burn',enemy_1348_rllamb:'flare',enemy_1346_ynshp_2:'veil',enemy_1048_hirman:'reflect',enemy_1347_fyshp:'foam',
  enemy_1093_ccsbr:'brace',enemy_1094_ccspm:'fast',enemy_1095_ccripr:'corrosion',enemy_1258_durman:'brace',enemy_1259_durwar:'barrier',enemy_1098_cchmpn:'corrosion',enemy_1264_durgrd:'rush',enemy_10016_sggint_2:'rally',
  enemy_1101_plkght:'veil',enemy_1100_scorpn:'fast',enemy_1178_dscorp:'fast',enemy_1102_sdkght:'armor',enemy_1103_wdkght:'rush',enemy_1104_lfkght_2:'titus',enemy_1104_lfkght_3:'titus',enemy_1182_flasrt:'corrosion',enemy_1185_nmekgt:'snipe',
  enemy_1188_krgdrn:'veil',enemy_1192_krgscr:'frostArts',enemy_1382_winbal:'arts',enemy_1385_winbom:'frostArts',enemy_1387_winshd:'armor',enemy_1388_wingnt:'artillery',enemy_1388_wingnt_2:'artillery',
  enemy_1277_sgman:'debt',enemy_1278_sgbow:'snipe',enemy_1279_sgbdg:'armor',enemy_1280_sgmag:'artillery',enemy_10031_cnvsld:'veil',enemy_10037_cnvpcar:'flare',enemy_1281_sgcar:'armor',enemy_1282_sgelder:'rally',enemy_1283_sgkill:'bleed',enemy_10034_cnvsax:'flare',
  enemy_1249_lysdb:'veil',enemy_1250_lyengs:'arts',enemy_1325_cbgpro:'fast',enemy_1329_cbshld:'veil',enemy_1116_liprr:'rush',enemy_1117_liiprr:'arts',enemy_1253_lysytc:'veil',enemy_1328_cbjedi:'arts',enemy_1256_lyacpa:'artillery',enemy_1255_lybgpa:'charge',enemy_1330_cbrush:'fast',enemy_1118_lidbox:'fast',enemy_1119_vofsd:'heal',
  enemy_1165_duhond:'reflect',enemy_1166_dusbr:'reflect',enemy_1167_dubow:'reflect',enemy_1222_dpvt:'rush',enemy_1223_dmech:'alert',enemy_1168_dumage:'arts',enemy_1229_darmy:'neural',enemy_1170_dushld:'reflect',enemy_1272_nhtank:'corrosion',
  enemy_1147_dshond:'fast',enemy_1148_dssbr:'neural',enemy_1150_dsjely:'neural',enemy_1231_dsrunr:'veil',enemy_1233_dsshtr:'artillery',enemy_1153_dsexcu:'snipe',enemy_1232_dssalr:'barrier',enemy_1230_dsbudr:'reflect',enemy_1235_dsbskr:'corrosion',
  enemy_2043_smsbr:'rush',enemy_2044_smwiz:'arts',enemy_2045_smdrn:'veil',enemy_1187_krghd:'packFang',enemy_2046_smwar:'rush',enemy_2059_smbox:'barrier',
  enemy_1071_dftman:'reflect',enemy_1073_dscout:'alert',enemy_1410_mmelee:'brace',enemy_1411_mmrnge:'snipe',enemy_1412_mmjump:'veil',enemy_1074_dbskar:'artillery',enemy_1075_dmgswd:'arts',enemy_1076_bsthmr:'artillery',enemy_1413_mmstck:'fast',enemy_1429_lrwzrd:'artillery'
 };
 function profile(id,entry){const d=units[id];return entry||window.FrontierRegionalReinforcementTraits?.[id]||specialTraits[id]||(d?.archetype==='guard'?'armor':d?.ranged?'snipe':'fast');}

 function select(region,type,index,path,pick,mid=false){
  const spec=roster[region];
  if(!spec)throw Error('PRTS｜找不到地區敵方配置。');
  if(type==='boss'&&index===0)return spec.bosses[mid?'normal':path]||spec.bosses.normal;
  const id=pick(type==='elite'&&(index===0||spec.common.length<2)?spec.elite:spec.common);
  return {id,trait:profile(id)};
 }
 function setup(enemy,entry,region,role){
  const def=units[entry.id],trait=traits[entry.trait];
  Object.assign(enemy,{
   species:entry.id,name:def.name,regionRoster:region,regionalTrait:entry.trait,
   captureTries:0,boss:role==='boss',regionBoss:role==='boss',elite:role==='elite',
   def:def.archetype==='guard'?50:def.sourceStats.def>300?20:0,
   res:Math.min(35,Math.round(def.sourceStats.res/2)),
   damageType:trait?.artsUntil?'arts':trait?.debtArts?debtActive()?'arts':'physical':trait?.arts||def.ranged&&def.sourceStats.res>0?'arts':'physical'
  });
  enemy.block=(enemy.block||0)+(trait?.start||0);
  if(trait?.status&&!trait.statusEvery){enemy.status=trait.status;enemy.statusStacks=1;}
  else{delete enemy.status;delete enemy.statusStacks;delete enemy.element;}
 }
 function phase(enemy,battle){
  const trait=traits[enemy.regionalTrait];
  if(!trait||enemy.regionalPhase||enemy.hp<=0||enemy.hp>enemy.max/2||!(trait.phase||trait.phaseAttack||trait.rally))return false;
  enemy.regionalPhase=true;
  if(trait.phase)enemy.block=(enemy.block||0)+trait.phase;
  if(trait.phaseAttack)enemy.atk+=trait.phaseAttack;
  if(trait.rally)for(const other of battle.enemies)if(other!==enemy&&other.hp>0)other.atk+=trait.rally;
  return true;
 }
 function special(enemy,battle,raw){
  const trait=traits[enemy.regionalTrait];
  if(trait?.tax&&battle.operatorVersion===113)battle.regionalApTax=Math.max(battle.regionalApTax||0,trait.tax);
  return window.FrontierEnemyTactics?.special(enemy,battle,Math.round(raw*(trait?.special||1)))??Math.round(raw*(trait?.special||1));
 }
 function afterHit(enemy,actor,battle,specialAttack=false){
  if(!enemy.regionRoster)return;
  const trait=traits[enemy.regionalTrait];
  if(specialAttack&&trait?.weaken)actor.regionalAttackWeaken=true;
  if(specialAttack&&trait?.stunSpecial||trait?.stunEvery&&enemy.regionalStrikes%trait.stunEvery===0)
   actor.stunnedTurn=Math.max(actor.stunnedTurn||0,battle.turn+1);
  const status=enemy.status,stacks=actor.status?.[status]||0;
  if(!stacks)return;
  actor.regionalAilments??={};
  actor.regionalAilments[status]=true;
  if(status==='cold'&&actor.status.freeze>0){
   actor.drug??={};
   actor.drug.freezeSkillLockedUntil=battle.turn+1;
   actor.status.cold=0;actor.status.freeze=0;
  }
  if(status==='neural'&&stacks>=3){
   actor.status.neural-=3;
   battle.regionalApTax=Math.max(battle.regionalApTax||0,1);
  }
 }
 function corrosion(actor,type,raw){
  if(type!=='physical'||!actor.regionalAilments?.corrosion||!actor.status?.corrosion)return raw;
  const bonus=Math.min(3,actor.status.corrosion);
  actor.status.corrosion=0;
  return raw+bonus*10;
 }
 function refill(battle){
  if(!battle.regionalApTax)return;
  battle.energy=Math.max(1,battle.energy-battle.regionalApTax);
  delete battle.regionalApTax;
 }
 function target(enemy,alive){
  const alternative=window.FrontierEnemyTactics?.target(enemy,alive,R()?.battle?.turn||0);if(alternative)return alternative;
  const mode=traits[enemy.regionalTrait]?.target;
  if(!mode)return null;
  const score=mode==='weakest'?a=>-a.hp/a.max:mode==='lowestDef'?a=>-a.def:a=>a.atk;
  return alive.filter(a=>a.operator!=='flow').reduce((chosen,a)=>!chosen||score(a)>score(chosen)?a:chosen,null);
 }
 function beforeDamage(enemy,raw,type,battle){
  const trait=traits[enemy.regionalTrait];
  if(raw>0&&trait?.artsBreakShield&&type==='arts'&&enemy.block>0&&!enemy.regionalShellBroken){
   enemy.block=0;enemy.atk+=25;enemy.regionalShellBroken=true;
  }
  if(raw>0&&battle&&type!=='true'&&trait?.dodge&&enemy.regionalDodgeTurn!==battle.turn
     &&!enemy.skipNextOrdinaryAction&&!enemy.skipNextControllableAction
     &&!enemy.statuses?.some(status=>['bind','stun','silence'].includes(status.id))){
   enemy.regionalDodgeTurn=battle.turn;return Math.round(raw*(1-trait.dodge));
  }
  if(raw<=0||!trait?.mitigate||enemy.regionalWardSpent||type==='true'||trait.physical&&type!=='physical'||trait.artsOnly&&type!=='arts')return raw;
  enemy.regionalWardSpent=true;
  return Math.max(0,raw-trait.mitigate);
 }
 function afterDamage(enemy,battle,hpLoss){
  if(hpLoss<=0)return;
  const trait=traits[enemy.regionalTrait];
  if(enemy.hp<=0&&trait?.revive&&!enemy.regionalRevived&&!enemy.captured){
   enemy.hp=Math.max(1,Math.ceil(enemy.max*trait.revive));enemy.regionalRevived=true;
  }
  if(enemy.hp<=0&&!enemy.regionalDefeatCounted){
   for(const ally of battle.enemies){
    const rally=traits[ally.regionalTrait]?.rallyFromDefeat;
    if(ally===enemy||ally.hp<=0||!rally||(ally.regionalRallies||0)>=3)continue;
    enemy.regionalDefeatCounted=true;
    ally.atk+=rally;ally.regionalRallies=(ally.regionalRallies||0)+1;
   }
  }
  const bonus=enemy.hp<=0?trait?.deathRally:trait?.woundedRally;
  if(!bonus||enemy.regionalAlert||hpLoss<=0)return;
  enemy.regionalAlert=true;
  for(const ally of battle.enemies)if(ally!==enemy&&ally.hp>0)ally.atk+=bonus;
 }
 const debtActive=()=>(R()?.environment?.hostility||0)>=3;
 function action(enemy,victim,battle,raw,specialAttack){
  const trait=traits[enemy.regionalTrait];
  if(!trait&&!enemy.tacticsBoss)return {raw};
  if(trait?.statusEvery||trait?.stunEvery){
   enemy.regionalStrikes=(enemy.regionalStrikes||0)+1;
   if(trait.statusEvery){
    if(enemy.regionalStrikes%trait.statusEvery===0){enemy.status=trait.status;enemy.statusStacks=1}
    else{delete enemy.status;delete enemy.statusStacks}
   }
  }
  /* 爪獸「群獵」：場上每多一名存活同伴，普通攻擊原始傷害 +10，最多 +30。 */
  if(trait?.pack&&!specialAttack){const mates=(battle.enemies||[]).filter(e=>e!==enemy&&e.hp>0&&!e.exited&&!e.device75&&!e.bloodblade75).length;raw+=Math.min(trait.pack*3,mates*trait.pack)}
  if(trait?.ramp&&!specialAttack){
   enemy.regionalRamp=enemy.regionalLastAttack===battle.turn-1?Math.min(3,(enemy.regionalRamp||0)+1):0;
   enemy.regionalLastAttack=battle.turn;raw+=enemy.regionalRamp*trait.ramp;
  }
  const highDebt=(trait?.debtBonus||trait?.debtArts)&&debtActive();
  if(trait?.debtBonus&&highDebt&&!specialAttack)raw=Math.round(raw*1.25);
  if(trait?.artsUntil||trait?.debtArts){
   enemy.damageType=trait.debtArts?highDebt?'arts':'physical':battle.turn<=trait.artsUntil?'arts':'physical';
   if(enemy.action)enemy.action.damageType=enemy.damageType;
  }
  if(trait?.frostBonus&&victim.drug?.freezeSkillLockedUntil>=battle.turn)raw+=trait.frostBonus;
  if(!specialAttack&&!enemy.regionalOpened&&trait?.opening){
   enemy.regionalOpened=true;raw+=trait.opening;
  }
  const extra=enemy.tacticsBoss===2?window.FrontierEnemyTactics?.profile(enemy)?.splash:0;
  return {raw,splash:!specialAttack&&(extra||window.FrontierEnemyTactics?.splash(enemy,battle)||splashCount(trait))||0};
 }
 const splashCount=trait=>trait?.splash===true?2:trait?.splash||0;
 function ordinaryIntent(enemy){const count=(enemy.tacticsBoss===2?window.FrontierEnemyTactics?.profile(enemy)?.splash:0)||splashCount(traits[enemy.regionalTrait]);return count?' · 波及 '+(count-1)+' 名隊友':'';}
 function prepareAction(enemy,battle){
  const trait=traits[enemy.regionalTrait];
  if(trait?.decay)enemy.hp=Math.max(1,enemy.hp-Math.ceil(enemy.max*trait.decay));
  if(trait?.repair){
   const armor=battle.enemies.find(e=>e.hp>0&&e.hp<e.max&&/^enemy_125[4-6]_/.test(e.species));
   if(armor)armor.hp=Math.min(armor.max,armor.hp+Math.ceil(armor.max*.06));
  }
 }
 function healBeforeAction(enemy){
  const amount=traits[enemy.regionalTrait]?.heal;
  if(amount)enemy.hp=Math.min(enemy.max,enemy.hp+amount);
 }
 function detail(enemy){
  const trait=traits[enemy.regionalTrait];
  const extra=[window.FrontierEnemyTactics?.detail(enemy),R()?.battle?.enemyTacticsVersion&&window.FrontierEnemyTactics?.formationDetail(enemy)].filter(Boolean).join('\n');
  if(!trait)return extra;
  return (extra?extra+'\n':'')+trait.title+'：'+trait.text+(enemy.regionalPhase||enemy.regionalWardSpent||enemy.regionalAlert||enemy.regionalOpened||enemy.regionalRevived?'（已觸發）':'');
 }
 return {roster,traits,profile,select,setup,phase,special,afterHit,corrosion,refill,target,detail,beforeDamage,afterDamage,action,ordinaryIntent,healBeforeAction,prepareAction};
})();
