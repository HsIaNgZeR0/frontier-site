'use strict';
/* 大炎地區戰鬥機制（claude57）。包裝 FrontierRegional75 的各個掛點，不改動既有 12 地區。
   首領：歲相（一結局）、「睚」（二結局）、「祟」（三結局）、歲（四結局）。
   敵人：山海眾伏兵、墨痕書生、山海眾窺魅人、小八界。回合卡牌改編，數值為本作平衡。 */
globalThis.FrontierYan=(()=>{
 const X=globalThis.FrontierRegional75;if(!X)return null;
 const KINDS={enemy_1526_sfsui:'suixiang',enemy_1538_ymmons:'ya',enemy_1550_dhnzzh:'chong',frontier75_yan_fourth:'sui'};
 const PART_NAMES={left:'歲・左爪',right:'歲・右爪',tail:'歲・尾'},PART_SPECIES={left:'enemy_1583_suizzh',right:'enemy_1584_suiyzh',tail:'enemy_1585_suiwei'};
 const PILLARS=['鎮歲柱・首','鎮歲柱・爪','鎮歲柱・尾'];
 const units=()=>globalThis.FrontierEnemyData?.units||{};
 const living=e=>e&&e.hp>0&&!e.exited;
 const mine=s=>s?.region75&&['suixiang','ya','chong','sui'].includes(s.region75.kind)?s.region75:null;
 const bossOf=s=>s.enemies.find(e=>e.uid===s.region75?.bossUid);
 const isBoss=(s,e)=>!!e&&e.uid===s.region75?.bossUid;
 const team=s=>(s.team||[]).filter(a=>living(a)&&!a.friendly75);
 const newUid=s=>{let n=(s.serial75||0)+1;while(s.enemies?.some(e=>e.uid==='e'+(9000+n)))n++;s.serial75=n;return 'e'+(9000+n);};
 const hurtOne=(s,a,raw,type='arts')=>{const D=globalThis.FrontierOperatorDamageV113?.create();if(!D||!living(a))return;D.takeDamage(s,a,D.calculate(a,Math.max(1,Math.floor(raw)),type).damage,{sourceKind:'region75'},type);};
 const hurtAll=(s,raw,type='arts')=>{for(const a of team(s))hurtOne(s,a,raw,type);};
 const initMob=e=>{const d=units()[e.species]?.frontier75;if(d&&d.role!=='boss'&&!e.mob75)e.mob75={kind:d.type,round:0};};
 function push(s,e){Object.assign(e,{icon:e.icon||'◇',block:e.block||0,poison:e.poison||0,vuln:e.vuln||0,captureTries:0});initMob(e);s.enemies.push(e);return e;}
 function summon(s,boss,count,cap=3){const m=s.region75,d=globalThis.FrontierRegionDesign75?.regions?.yan;if(!d||!boss)return;const room=cap-s.enemies.filter(e=>e.summoned75&&!e.yan75&&living(e)).length;for(let i=0;i<Math.min(count,room);i++){if(s.enemies.filter(living).length>=6)return;const row=d.mobs[[0,2,1,3][(m.wave||0)%4]],def=units()[row.id],elite=row.role==='elite',hp=Math.max(100,Math.floor(boss.max*(elite?.10:.065))),uid=newUid(s),tier=boss.mechanicTier||0;m.wave=(m.wave||0)+1;push(s,{id:uid,uid,species:row.id,name:def.name,regionRoster:'yan',regionalTrait:'arts',summoned75:true,boss:false,elite,regionBoss:false,hp,max:hp,atk:Math.max(30,Math.floor(boss.baseAtk75*(elite?.5:.35))),def:elite?30+tier*10:0,res:elite?15:0,intent:'attack',damageType:elite?'arts':'physical',action:{kind:'attack',damageType:elite?'arts':'physical',breakable:false,breakWindow:false},mechanicTier:tier});}}
 function extra(s,boss,kind,o){const uid=newUid(s);return push(s,{id:uid,uid,summoned75:true,regionBoss:true,boss:false,elite:false,yan75:kind,owner75:boss.uid,intent:'defend',damageType:'none',atk:0,def:0,res:0,action:{kind:'defend',damageType:'none'},mechanicTier:boss.mechanicTier||0,...o});}
 function resetBoss(t){t.special=null;t.statuses=[];t.ignite=[];t.counters={};t.counterExpiry={};if(t.resReduction){t.res=Math.min(100,t.res+t.resReduction.applied);delete t.resReduction;}for(const r of t.armorReductions||[])t.def+=r.applied;t.armorReductions=[];delete t.skipNextOrdinaryAction;delete t.skipNextControllableAction;}
 const rotation=s=>(Math.max(1,s.turn)-1)%4; // 0 首 1 雙爪 2 尾 3 休整
 const lifted=(s,part)=>{const m=s.region75,r=rotation(s);return m.over?.[part]===s.turn||(r===0&&part==='head')||(r===1&&['left','right'].includes(part))||(r===2&&part==='tail');};
 const partOf=(s,e)=>isBoss(s,e)?'head':e.yan75==='part'?e.part:null;

 /* ---------- start ---------- */
 const baseStart=X.start;
 X.start=function(r){const ok=baseStart(r),s=r?.battle;if(!ok||!s)return ok;const boss=s.enemies.find(e=>e.boss),kind=KINDS[boss?.species];if(!kind)return ok;
  s.region75={version:75,kind,region:r.expedition?.regionId||'yan',layer:r.expedition?.layer||0,bossUid:boss.uid,charge:0,openUntil:0,phase:1,pressure:0,wave:0,round:0,shield:3,debt:0,circuit:0};
  const m=s.region75;Object.assign(boss,{mechanic75:true,tacticsBoss:undefined,regionBoss:true,baseAtk75:boss.atk,baseDef75:boss.def||0,baseRes75:boss.res||0});delete boss.status;delete boss.statusStacks;
  if(kind==='suixiang'){m.form=1;m.forms=(r.expedition?.layer||0)>=4?3:2;m.breath=0;boss.damageType='arts';}
  if(kind==='ya'){m.winter=0;boss.damageType='arts';}
  if(kind==='chong'){m.form='chaos';m.hits=0;m.sheds=0;m.blight=0;m.marks=[];m.marksDown=[];boss.damageType='physical';}
  if(kind==='sui'){s.enemies=[boss];boss.damageType='arts';m.pillars=[false,false,false];m.over={};m.taken={};
   for(const part of ['left','right','tail'])extra(s,boss,'part',{part,species:PART_SPECIES[part],name:PART_NAMES[part],hp:boss.hp,max:boss.max,def:boss.def,res:boss.res});
   PILLARS.forEach((name,index)=>{const uid=newUid(s);s.enemies.push({id:uid,uid,name,species:'frontier75_device',icon:'◇',poison:0,vuln:0,device75:{kind:'suipillar',index,owner:boss.uid,charge:0,threshold:Math.max(100,Math.floor(boss.max*.05)),litUntil:0},hp:1,max:1,atk:0,def:0,res:0,block:0,damageType:'none',intent:'defend',boss:false,regionBoss:true,action:{kind:'defend',damageType:'none'},mechanicTier:boss.mechanicTier||0});});}
  return ok;};

 /* ---------- 無敵／隱匿 ---------- */
 const baseBlocked=X.blocked;
 X.blocked=function(s,t){const m=mine(s);if(m&&t&&!t.device75){
   if(m.kind==='suixiang'&&isBoss(s,t)&&m.hiddenTurn===s.turn)return true;
   if(m.kind==='chong'&&isBoss(s,t)&&m.form==='water')return true;
   if(m.kind==='ya'&&isBoss(s,t)&&m.swapTurn===s.turn&&s.enemies.some(e=>e.yan75==='wangjing'&&living(e)))return true;
   if(m.kind==='sui'){const p=partOf(s,t);if(p&&lifted(s,p))return true;}}
  return baseBlocked(s,t);};

 /* ---------- 直接命中：磷火計次、鎮歲柱充能 ---------- */
 const baseIntercept=X.intercept;
 X.intercept=function(s,a,t,raw,type,meta={}){const m=mine(s);
  if(m&&t?.yan75==='phosphor'){const n=raw>0&&!meta.equipmentDerived139?1:0;t.hp=Math.max(0,t.hp-n);if(t.hp<=0)t.mechanicRemoved=true;return {raw,damage:n,absorbed:0,hpLoss:n,hp:t.hp,block:0,poiseBreakValue:0};}
  if(m?.kind==='sui'&&t?.device75?.kind==='suipillar'){const d=t.device75,n=meta.dot||meta.equipmentDerived139?0:Math.max(0,Math.floor(raw));d.charge=Math.min(d.threshold,d.charge+n);if(d.charge>=d.threshold&&!m.pillars[d.index])raisePillar(s,t);return {raw,damage:0,absorbed:0,hpLoss:0,hp:t.hp,block:0,deviceCharge:n,poiseBreakValue:0};}
  if(m&&X.blocked(s,t))return {raw,damage:0,absorbed:0,hpLoss:0,hp:t.hp,block:t.block||0,poiseBreakValue:0,invulnerable75:true};
  return baseIntercept(s,a,t,raw,type,meta);};
 function raisePillar(s,t){const m=s.region75,b=bossOf(s),i=t.device75.index;m.pillars[i]=true;t.hp=0;t.mechanicRemoved=true;if(!b)return;
  if(i===0){b.atk=Math.floor(b.atk*.75);b.baseAtk75=Math.floor(b.baseAtk75*.75);}
  if(i===1)b.res=Math.max(0,(b.res||0)-20);
  if(i===2){const max=Math.floor(b.max*.85);b.hp=Math.min(b.hp,max);b.max=max;for(const p of s.enemies.filter(e=>e.yan75==='part'&&living(e))){p.max=b.max;p.hp=b.hp;}}}

 /* ---------- 生命保留（形態切換） ---------- */
 const baseLimit=X.limitLoss;
 X.limitLoss=function(s,t,loss){const m=mine(s);if(m&&t){
   if(t.yan75==='phosphor')return Math.min(loss,1,t.hp);
   if(t.yan75==='part')return Math.min(loss,Math.max(0,t.hp-1));
   if(isBoss(s,t)&&loss>=t.hp){if(m.kind==='suixiang'&&m.form<m.forms||m.kind==='chong'&&m.form==='chaos'){m.yanRevive=true;return Math.max(0,t.hp-1);}}}
  return baseLimit(s,t,loss);};

 /* ---------- 受到傷害修正 ---------- */
 const baseBefore=X.beforeDamage;
 X.beforeDamage=function(s,t,raw,type,a){let n=baseBefore(s,t,raw,type,a);const m=mine(s);if(!t||t.device75||n<=0)return n;let f=1;
  if(t.mob75?.kind==='emerge'&&s.turn===1)f*=.4;
  if(!m)return Math.max(0,Math.floor(n*f));
  if(m.kind==='suixiang'&&isBoss(s,t)){const order=team(s);if(a&&order.length>=3&&(a.uid===order[0].uid||a.uid===order.at(-1).uid))f*=.6;}
  if(m.kind==='chong'&&isBoss(s,t)){if(m.washTurn===s.turn)f*=1.3;else if(!m.blight)f*=1.15;}
  if(m.kind==='sui'&&(isBoss(s,t)||t.yan75==='part')&&!m.pillars.some(Boolean)&&type!=='true')f*=.7;
  return Math.max(0,Math.floor(n*f));};

 /* ---------- 受傷後 ---------- */
 const baseAfter=X.afterDamage;
 X.afterDamage=function(s,t,loss,type,a){baseAfter(s,t,loss,type,a);const m=mine(s);if(!t)return;
  const z=t.mob75;if(z&&loss>0){if(z.kind==='scholar'&&!z.healed&&t.hp>0&&t.hp<=t.max/2&&!t.skipNextOrdinaryAction&&!t.skipNextControllableAction){z.healed=true;t.hp=Math.min(t.max,t.hp+Math.floor(t.max*.25));}
   if(z.kind==='eight'){z.hits=(z.hits||0)+1;if(z.hits%5===0&&t.hp>0){hurtAll(s,35,'arts');const top=team(s).sort((x,y)=>y.atk-x.atk)[0];if(top)top.stunnedTurn=Math.max(top.stunnedTurn||0,s.turn+1);}}}
  if(!m)return;const b=bossOf(s);
  if(m.kind==='sui'&&t.yan75==='part'&&loss>0&&b&&living(b)){const n=X.limitLoss(s,b,Math.min(b.hp,loss));b.hp=Math.max(0,b.hp-n);const k=t.part;m.taken[k]=m.taken[k]?.turn===s.turn?{turn:s.turn,n:m.taken[k].n+loss}:{turn:s.turn,n:loss};if(m.taken[k].n>=b.max*.08)m.over[k]=s.turn;if(b.hp<=0)baseAfter(s,b,n,'true',a);}
  if(m.kind==='sui'&&isBoss(s,t)&&loss>0){m.taken.head=m.taken.head?.turn===s.turn?{turn:s.turn,n:m.taken.head.n+loss}:{turn:s.turn,n:loss};if(m.taken.head.n>=t.max*.08)m.over.head=s.turn;}
  if(m.kind==='sui'&&b){for(const p of s.enemies.filter(e=>e.yan75==='part'&&living(e))){p.max=b.max;p.hp=b.hp;}if(living(b)&&!m.allOutDone&&b.hp<=b.max*.35){m.allOutDone=true;m.allOutPending=true;summon(s,b,2,4);}}
  if(m.kind==='suixiang'&&isBoss(s,t)&&m.yanRevive){delete m.yanRevive;m.form++;resetBoss(t);t.hp=Math.floor(t.max*(m.form===2?.75:.6));t.atk=Math.floor(t.baseAtk75*(1+.15*(m.form-1)));t.damageType=m.form===2?'physical':'arts';m.hiddenTurn=s.turn;m.breath=0;}
  if(m.kind==='chong'&&isBoss(s,t)){if(m.yanRevive){delete m.yanRevive;m.form='water';m.waterUntil=s.turn+2;resetBoss(t);t.hp=Math.max(1,t.hp);}
   else if(loss>0&&m.form==='chaos'){m.hits++;if(m.hits%4===0&&m.sheds<4){m.sheds++;t.atk=Math.floor(t.atk*.88);t.def=Math.floor((t.def||0)*.8);t.res=Math.max(0,(t.res||0)-5);m.blight=Math.min(6,m.blight+1);}}
   else if(loss>0&&m.form==='clarity'&&a&&!m.marks.includes(a.uid))m.marks.push(a.uid);}
  if(m.kind==='ya'&&b){if(isBoss(s,t)&&m.phase===1&&t.hp>0&&t.hp<=t.max/2){m.phase=2;for(const e of s.enemies)if(e.yan75==='mirage'){e.hp=0;e.mechanicRemoved=true;}}
   if(t.yan75==='wangjing'&&t.hp<=0&&!t.resolved75){t.resolved75=true;t.mechanicRemoved=true;if(living(b)){const cut=Math.floor(b.max*.15);b.max=Math.max(1,b.max-cut);b.hp=Math.min(b.hp,b.max);}}
   if(t.yan75==='mirage'&&t.hp<=0)t.mechanicRemoved=true;}
  if(m.kind==='suixiang'&&t.yan75==='phosphor'&&t.hp<=0)t.mechanicRemoved=true;};

 /* ---------- 敵方階段開始 ---------- */
 const baseBegin=X.begin;
 X.begin=function(s){const r75=s.region75,fresh=r75&&r75.yanRound!==s.turn;baseBegin(s);if(!fresh)return;r75.yanRound=s.turn;
  for(const e of s.enemies.filter(living)){initMob(e);const z=e.mob75;if(!z)continue;
   if(z.kind==='peeper'&&s.turn%2===0&&!e.skipNextOrdinaryAction){e.special??={id:'yan:'+e.uid+':'+s.turn,kind:'charge',due:s.turn+1,threshold:Math.max(100,Math.floor(e.max*.2)),damage:0,control:0,points:2+(e.mechanicTier||0)*2,solved:false};if(e.action){e.action.breakable=true;e.action.breakWindow=true;}}}
  const m=mine(s),b=m&&bossOf(s);if(!b||!living(b))return;
  if(m.kind==='chong'&&m.form==='clarity'){delete b.skipNextOrdinaryAction;delete b.skipNextControllableAction;b.statuses=(b.statuses||[]).filter(x=>!['bind','stun','silence','freeze','sleep'].includes(x.id));}
  if(m.kind==='suixiang')b.damageType=m.form===2?'physical':'arts';
  if(m.kind==='sui')b.damageType=[1,2].includes(rotation(s))&&!m.allOutPending?'physical':'arts';};
 X.begin.yan=true;

 /* ---------- 敵人行動前 ---------- */
 const baseBeforeEnemy=X.beforeEnemy;
 X.beforeEnemy=function(s,e){const m=mine(s);
  if(e?.yan75&&e.yan75!=='wangjing'&&e.yan75!=='ember')return false;
  if(m&&isBoss(s,e)){
   if(m.kind==='suixiang'&&m.hiddenTurn===s.turn)return false;
   if(m.kind==='chong'&&m.form==='water')return false;
   if(m.kind==='suixiang'&&m.form===3&&m.forms===3){const order=team(s),raw=e.atk*.6*(1+.25*m.breath);order.forEach((a,i)=>{const shields=order.slice(0,i).filter(x=>(x.block||0)>0).length;hurtOne(s,a,raw*Math.max(.4,1-.2*shields),'arts');});m.breath=0;m.lastBreath=s.turn;return false;}}
  return baseBeforeEnemy(s,e);};

 /* ---------- 首領攻擊 ---------- */
 const baseIncoming=X.incoming;
 X.incoming=function(s,e,victim,raw,special=false){const m=mine(s),z=e?.mob75;
  if(z?.kind==='emerge'&&s.turn%2===0)return {raw,splash:2};
  if(z?.kind==='peeper'&&special){z.fired=(z.fired||0)+1;}
  if(!m||!isBoss(s,e))return baseIncoming(s,e,victim,raw,special);
  if(m.kind==='suixiang'){if(m.form===1)return {raw:Math.floor(raw*.9),splash:3};if(m.form===2)return {raw:Math.floor(raw*.75),splash:0,hits75:2};return {raw,splash:0};}
  if(m.kind==='ya')return m.phase===2?{raw:Math.floor(raw*.85),splash:2}:{raw,splash:0};
  if(m.kind==='chong')return m.form==='clarity'?{raw:Math.floor(raw*.7),splash:0,hits75:2}:{raw,splash:0};
  if(m.kind==='sui'){if(m.allOutPending){m.allOutPending=false;return {raw:Math.floor(raw*1.8),splash:5};}const r=rotation(s);
   if(r===0){for(const ember of s.enemies.filter(x=>x.yan75==='ember'&&living(x))){ember.hp=0;ember.mechanicRemoved=true;hurtAll(s,30,'arts');}return {raw:Math.floor(raw*1.2),splash:m.pillars[0]?2:5};}
   if(r===1)return {raw:Math.floor(raw*(m.pillars[1]?1.1:1.6)),splash:3};
   if(r===2)return {raw:Math.floor(raw*(m.pillars[2]?.45:.6)),splash:0,hits75:m.pillars[2]?2:3};
   return {raw,splash:0};}
  return baseIncoming(s,e,victim,raw,special);};

 /* ---------- 命中後 ---------- */
 const baseHit=X.afterHit;
 X.afterHit=function(s,e,a,special,loss){baseHit(s,e,a,special,loss);const m=mine(s),z=e?.mob75;
  if(z?.kind==='peeper'&&special&&!z.boosted){z.boosted=true;z.baseAtk=Math.floor((z.baseAtk??e.atk)*1.2);e.atk=z.baseAtk;}
  if(!m||!isBoss(s,e)||!a)return;
  if(m.kind==='suixiang'&&m.form===2&&loss>0){m.fall=Math.min(3,(m.fall||0)+1);globalThis.FrontierMedicine?.inflict(a,'burn',m.fall);}
  if(m.kind==='sui'){const r=rotation(s);if(r===0&&loss>0)globalThis.FrontierMedicine?.inflict(a,'burn',1);if(r===2&&a.hp<=0&&s.enemies.filter(x=>x.yan75==='ember'&&living(x)).length<2)ember(s,e);}};
 function ember(s,b){const hp=Math.max(100,Math.floor(b.max*.06));return extra(s,b,'ember',{species:'enemy_10172_sheart',name:'「未熄」',hp,max:hp,atk:Math.max(30,Math.floor(b.baseAtk75*.4)),intent:'attack',damageType:'physical',action:{kind:'attack',damageType:'physical'}});}

 /* ---------- 回合結束 ---------- */
 const baseRound=X.afterRound;
 X.afterRound=function(s){const m=mine(s),fresh=m&&m.yanAfter!==s.turn;baseRound(s);if(!fresh)return;m.yanAfter=s.turn;const b=bossOf(s);if(!b||!living(b))return;
  if(m.kind==='suixiang'){
   for(const p of s.enemies.filter(e=>e.yan75==='phosphor'&&living(e)&&e.due75<=s.turn)){p.hp=0;p.mechanicRemoved=true;if(m.form<3)b.hp=Math.min(b.max,b.hp+Math.floor(b.max*.05));else m.breath=Math.min(3,m.breath+1);}
   if(s.turn%2===1&&!s.enemies.some(e=>e.yan75==='phosphor'&&living(e)))extra(s,b,'phosphor',{species:'enemy_1211_msfsui',name:'磷火',hp:3,max:3,due75:s.turn+1});
   if(s.turn>=24)hurtAll(s,30*(s.turn-23),'true');}
  if(m.kind==='ya'){m.winter=Math.min(3,(m.winter||0)+1);if(m.phase===1?s.turn%2===0:s.turn%3===0)summon(s,b,m.phase===1&&m.winter>=3?2:1,m.phase===2?2:3);
   if(m.phase===1){const mirage=s.enemies.find(e=>e.yan75==='mirage'&&living(e));if(mirage&&mirage.due75<=s.turn){mirage.hp=0;mirage.mechanicRemoved=true;b.hp=Math.min(b.max,b.hp+Math.floor(b.max*.06));m.teleports=(m.teleports||0)+1;}else if(!mirage&&s.turn%4===1){const hp=Math.max(100,Math.floor(b.max*.08));extra(s,b,'mirage',{species:'frontier75_yan_mirage',name:'蜃景',hp,max:hp,due75:s.turn+2});}}
   else{let clone=s.enemies.find(e=>e.yan75==='wangjing');if(!clone){const hp=Math.max(100,Math.floor(b.max*.35));clone=extra(s,b,'wangjing',{species:'frontier75_yan_wangjing',name:'妄境',hp,max:hp,atk:Math.max(30,Math.floor(b.baseAtk75*.6)),res:b.res||0,intent:'attack',damageType:'arts',action:{kind:'attack',damageType:'arts'}});}
    if(s.turn%3===0){hurtAll(s,35,'arts');if(living(clone)){m.swapTurn=s.turn+1;m.swaps=(m.swaps||0)+1;}}else hurtAll(s,20,'arts');}}
  if(m.kind==='chong'){
   if(m.form==='water'){summon(s,b,1);if(s.turn>=m.waterUntil){m.form='clarity';resetBoss(b);b.hp=b.max;b.atk=Math.floor(b.baseAtk75*1.3);b.def=b.baseDef75;b.res=b.baseRes75;b.damageType='physical';m.blight=Math.min(6,m.blight+1);}}
   if(m.blight>0)hurtAll(s,m.blight*6,'arts');
   if(m.form==='clarity'){for(const uid of m.marks)if(!m.marksDown.includes(uid)&&!team(s).some(a=>a.uid===uid)){m.marksDown.push(uid);m.blight=Math.min(6,m.blight+3);}
    if(m.blight>=3){const marked=team(s).filter(a=>m.marks.includes(a.uid)),target=(marked.length?marked:team(s)).sort((x,y)=>y.atk-x.atk)[0];if(target)hurtOne(s,target,Math.floor(b.atk*.35)+25*m.blight,'arts');m.blight=0;m.spears=(m.spears||0)+1;}}}
  if(m.kind==='sui'){for(const p of s.enemies.filter(e=>e.yan75==='part'&&living(e))){p.max=b.max;p.hp=b.hp;}}};

 /* ---------- 目標選擇 ---------- */
 const baseTarget=X.target;
 X.target=function(s,e,list){const m=mine(s),z=e?.mob75;
  if(z?.kind==='peeper')return list.slice().sort((a,b)=>b.atk-a.atk)[0];
  if(m?.kind==='sui'&&isBoss(s,e)&&list.length){const r=rotation(s);if(r===0)return list[0];if(r===1)return list.at(-1);if(r===2)return list.slice().sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];}
  if(m?.kind==='chong'&&isBoss(s,e)&&m.form==='clarity'){const marked=list.filter(a=>m.marks.includes(a.uid));if(marked.length)return marked.sort((a,b)=>a.hp-b.hp)[0];}
  return baseTarget(s,e,list);};

 /* ---------- 計畫（意圖顯示） ---------- */
 const basePlan=X.plan;
 X.plan=function(s){basePlan(s);const m=mine(s);for(const e of s.enemies){if(e.yan75&&!['wangjing','ember'].includes(e.yan75)){e.intent='defend';if(e.action)e.action={...e.action,kind:'defend',damageType:'none'};}}
  if(!m)return;const b=bossOf(s);if(!b)return;
  if((m.kind==='suixiang'&&m.hiddenTurn===s.turn)||(m.kind==='chong'&&m.form==='water')){b.intent='defend';if(b.action)b.action={...b.action,kind:'defend',damageType:'none'};}
  else{b.intent='attack';if(m.kind==='suixiang')b.damageType=m.form===2?'physical':'arts';if(m.kind==='sui')b.damageType=[1,2].includes(rotation(s))&&!m.allOutPending?'physical':'arts';}};

 /* ---------- 裝置操作（祟：引水沖刷） ---------- */
 X.notices.chong='病害：每層每回合使全隊受到6法術傷害。1 AP引水沖刷可清除病害，並使「祟」本回合防禦與法抗降低（受到傷害＋30%）；無病害時「祟」受到傷害＋15%。';
 const baseUse=X.use;
 X.use=function(s,mode){const m=mine(s);if(m?.kind==='chong'){const b=bossOf(s);if(!b||!living(b)||s.phase!=='player'||s.pending?.length)throw Error('請先完成目前行動');if(s.energy<1||m.usedTurn===s.turn)throw Error('需要1 AP，每回合限一次');s.energy--;m.usedTurn=s.turn;m.blight=0;m.washTurn=s.turn;return;}
  if(m)throw Error('請以攻擊牌命中場上機制');return baseUse(s,mode);};

 /* ---------- 說明 ---------- */
 const NOTE={
  suixiang:'歲相：三個形態（中段首領兩個）。受到隊伍最前與最後一名幹員（上下兩側）的傷害降低40%。\n第一形態【遠山驚雷】：法術攻擊波及共3名幹員。\n第二形態【天墜】：對單體兩次物理傷害，並附加逐次遞增的灼燒。\n第三形態【十方吐納】：對全隊法術傷害；排在前方且帶護盾的幹員，每名使後方幹員受到的傷害降低20%（最多60%）。\n每次被擊倒後隱去一回合，再以下一形態重現（第二形態75%、第三形態60%生命），攻擊提高。\n磷火：場上沒有磷火時，每兩回合出現一團，需3次命中擊破（任何傷害皆只算1次）；未擊破則在下個敵方階段被吸收，第一／二形態恢復5%最大HP，第三形態使【十方吐納】增強25%。\n久戰：第24回合起，每回合結束全隊受到真實傷害，第24回合30點，之後每回合再加30。',
  ya:'「睚」：經過之處生成無念之冬，第一形態每兩回合召喚增援（冬意滿3層時一次2名），第二形態每三回合召喚1名。\n第一形態【春生】：每四回合留下蜃景，兩回合內未擊破，「睚」便傳送過去並恢復6%最大HP。\n半血起第二形態：遠程法術攻擊波及2名幹員，並召出妄境。妄境被擊破時「睚」失去15%最大生命；「睚」倒下時妄境消散。\n【裁剪春秋】每第三回合全隊受到35法術傷害，「睚」與妄境交換位置：妄境存活時，下一回合「睚」無法被攻擊；其餘回合【天地如自】全隊受到20法術傷害。',
  chong:'「祟」混沌：每受到4次傷害蛻皮一次（最多4次），攻擊、防禦、法抗降低並污染田地，病害＋1。\n首次生命歸零時化入水中兩回合：無敵、不攻擊並持續召喚敵人，之後以明識形態完整重生。\n明識：攻擊提高30%、物理二連擊、免疫控制；標記所有攻擊過它的幹員，被標記者倒下時病害＋3。\n【如梭】病害達3層時凝成長槍，優先擲向被標記的幹員造成大量法術傷害，並清空病害。\n病害每層每回合使全隊受到6法術傷害。1 AP引水沖刷：清除病害，本回合「祟」受到傷害＋30%；田地無病害時受到傷害＋15%。',
  sui:'歲：首、左爪、右爪、尾共享生命，攻擊任何部位都會扣除歲的生命。\n部位依序施放技能，施放的回合會抬起、無法被攻擊：\n①【十方懟怒】首：法術噴火命中最前方幹員並波及全隊（減半），附加灼燒，同時引爆場上「未熄」。\n②【掩月】【蔽日】雙爪：高額物理爪擊最後方幹員並波及共3人。\n③【天傾地陷】尾：對生命比例最低者連續戳擊三次，擊倒幹員會生成「未熄」。\n④休整：普通法術攻擊。\n單一部位一回合內受到超過8%最大生命的傷害，會抬起脫離戰鬥至回合結束。\n鎮歲柱：以攻擊充能。首柱使歲攻擊－25%並縮小噴火範圍；爪柱使法抗－20並削弱爪擊；尾柱使最大生命－15%並減少戳擊。任何柱子立起前，歲處於全盛，受到的傷害降低30%。\n【柱折維絕】生命首次低於35%時召喚增援，下一次攻擊全隊受到強化衝擊。'};
 const MOB={emerge:'山海眾伏兵：首回合自暗處現身，受到的傷害降低60%；偶數回合攻擊波及1名額外幹員。',scholar:'墨痕書生：首次生命低於50%時吸收便符恢復25%最大HP；受控制時不觸發。',peeper:'山海眾窺魅人：每兩回合鎖定攻擊最高的幹員並蓄力，可破韌；蓄力命中後攻擊永久＋20%。',eight:'小八界：每受到5次傷害，對全隊造成35法術傷害，並使攻擊最高的幹員下一回合無法出牌。'};
 const baseDetail=X.detail;
 X.detail=function(s,e){const m=mine(s);
  if(e?.yan75==='phosphor')return '磷火：剩餘 '+e.hp+' 次命中。未擊破會在敵方階段被歲相吸收。';
  if(e?.yan75==='mirage')return '蜃景：第'+e.due75+'回合結束前未擊破，「睚」傳送至此並恢復6%最大HP。';
  if(e?.yan75==='wangjing')return '妄境：與「睚」相似的法術攻擊；擊破使「睚」失去15%最大生命。';
  if(e?.yan75==='ember')return '「未熄」：會攻擊；下一次【十方懟怒】時被引爆，全隊受到30法術傷害。';
  if(e?.yan75==='part')return PART_NAMES[e.part]+'：與歲共享生命。'+(m&&lifted(s,e.part)?'本回合抬起，無法被攻擊。':'');
  if(e?.device75?.kind==='suipillar'){const d=e.device75;return PILLARS[d.index]+'：攻擊原始傷害累積 '+d.charge+'/'+d.threshold+'，充滿後永久削弱歲的對應部位。DoT不充能。';}
  if(e?.mob75&&MOB[e.mob75.kind])return MOB[e.mob75.kind];
  if(m&&isBoss(s,e))return NOTE[m.kind];
  return baseDetail(s,e);};
 function status(b,m){if(!mine(b))return '';const alive=b.enemies.filter(living);
  if(m.kind==='suixiang')return (m.hiddenTurn===b.turn?'隱去 · ':'')+'形態 '+m.form+'/'+m.forms+' · 磷火 '+alive.filter(e=>e.yan75==='phosphor').length+(m.form===3?' · 吐納 '+m.breath:'');
  if(m.kind==='ya')return (m.swapTurn===b.turn&&alive.some(e=>e.yan75==='wangjing')?'換位 · ':'')+(m.phase===1?'春生':'秋榮')+' · 冬意 '+(m.winter||0)+'/3'+(m.phase===2?' · 妄境 '+alive.filter(e=>e.yan75==='wangjing').length:'');
  if(m.kind==='chong')return ({chaos:'混沌',water:'化入水中',clarity:'明識'})[m.form]+' · 病害 '+m.blight+' · 蛻皮 '+m.sheds+'/4';
  if(m.kind==='sui')return ['十方懟怒','掩月・蔽日','天傾地陷','休整'][rotation(b)]+' · 鎮歲柱 '+m.pillars.filter(Boolean).length+'/3';return '';}
 function label(m){return m&&({suixiang:'歲相・三形態',ya:'無念之冬',chong:'田地病害',sui:'鎮歲柱'})[m.kind]||'';}
 return {KINDS,status,label,rotation,lifted};
})();
