'use strict';
/* 澄閃（char_377_gdglow）設計 v2.4（docs/OPERATOR-GOLDENGLOW-DRAFT.md）。
   面板與固定數值存原始單位（引擎與顯示換算器 ×10）；倍率、法抗、機率不乘。
   本檔在 data/operator-v113.js 之後載入：補進幹員目錄、卡牌註冊、效果與招牌擴充。 */
(()=>{
 const ID='char_377_gdglow',NAME='澄閃';
 const LADDER=[.14,.25,.36,.47,.58,.68],FUSE=[0,0,.12,.24,.40,1],CAP=5;
 const stagesM=['M0','M1','M2','M3A','M3B'];
 const card=(id,name,cost,elite,effects)=>({id,designId:id,name,cost,unlock:{elite,trial:false},sourceEffects:Object.fromEntries(stagesM.map((s,i)=>[s,effects[i]])),implementation:'authored',supportEffect140:Object.fromEntries(stagesM.map(s=>[s,false]))});
 const cards=[
  card('GOLD-01','浮標部署',1,0,[
   '對1名敵人造成80% ATK法術傷害，設為主要鎖定；浮標+1（不超過上限）。',
   '對1名敵人造成95% ATK法術傷害，設為主要鎖定；浮標+1。',
   '對1名敵人造成100% ATK法術傷害，設為主要鎖定；浮標+1；浮標已滿時，本回合末各浮標倍率+10個百分點。',
   '對1名敵人造成115% ATK法術傷害，設為主要鎖定；浮標+1；浮標已滿時，本回合末各浮標倍率+15個百分點。',
   '對1名敵人造成90% ATK法術傷害，設為主要鎖定；浮標+1；轉換鎖定時，原有浮標第一次命中新目標從第2階開始。']),
  card('GOLD-02','靜電放電',1,0,[
   '對1名敵人造成115% ATK法術傷害；本回合末浮標倍率+5個百分點。',
   '對1名敵人造成130% ATK法術傷害；本回合末浮標倍率+5個百分點。',
   '對1名敵人造成140% ATK法術傷害；本回合末浮標倍率+10個百分點；主要浮標已連續命中該敵≥3次時，本牌傷害+10%。',
   '對1名敵人造成165% ATK法術傷害；本回合末浮標倍率+10個百分點；主要浮標已連續命中該敵≥3次時，本牌傷害+15%。',
   '對1名敵人造成125% ATK法術傷害；本回合末浮標倍率+5個百分點；主要浮標本回合末的自爆檢定至少視為第5次（40%）。']),
  card('GOLD-03','偏轉電弧',1,0,[
   '對1名敵人造成90% ATK法術傷害；命令1個浮標再造成50% ATK法術傷害。',
   '對1名敵人造成100% ATK法術傷害；命令1個浮標再造成55% ATK法術傷害。',
   '對1名敵人造成110% ATK法術傷害；命令1個浮標再造成65% ATK法術傷害；該敵下次被浮標普通攻擊時額外受到2點法術傷害。',
   '對1名敵人造成125% ATK法術傷害；命令1個浮標再造成85% ATK法術傷害；該敵下次被浮標普通攻擊時額外受到2點法術傷害。',
   '對1名敵人造成105% ATK法術傷害；命令1個浮標對另一名敵人造成70% ATK法術傷害，並使其法抗-10點至下個己方回合結束。']),
  card('GOLD-04','電流翻湧',2,1,[
   '對1名敵人造成120% ATK法術傷害；浮標上限+1並追加1個追加浮標；1個浮標分流攻擊第二名敵人。',
   '對1名敵人造成130% ATK法術傷害；浮標上限+1並追加1個追加浮標；1個分流浮標倍率+5個百分點。',
   '對1名敵人造成145% ATK法術傷害；浮標上限+1並追加1個追加浮標；1個分流浮標倍率+10個百分點。',
   '對1名敵人造成160% ATK法術傷害；浮標上限+1並追加1個追加浮標；1個分流浮標倍率+15個百分點。',
   '對1名敵人造成130% ATK法術傷害；浮標上限+1並追加1個追加浮標；最多2個浮標各分流不同敵人。']),
  card('GOLD-05','電位協同',1,2,[
   '對1名敵人造成100% ATK法術傷害並施加2層導電；其他兩名不同幹員的普通攻擊牌首次命中時各消耗1層，追加40%澄閃ATK法術傷害。',
   '對1名敵人造成110% ATK法術傷害並施加2層導電；每層追加40%澄閃ATK法術傷害。',
   '對1名敵人造成115% ATK法術傷害並施加2層導電；每層追加50%澄閃ATK法術傷害。',
   '對1名敵人造成135% ATK法術傷害並施加2層導電；每層追加55%澄閃ATK法術傷害。',
   '對1名敵人造成105% ATK法術傷害並施加2層導電；每層追加40%澄閃ATK法術傷害；兩層都被消耗時額外+1破韌。'])
 ];
 const sig={E0:'2行動點。本回合與下回合結束時：臨時浮標+2（從第1階起），浮標普通攻擊傷害+25%；期間澄閃自己的牌直接法傷-25%。',E1:'同E0，浮標普通攻擊傷害+35%。',E2:'同E0，浮標普通攻擊傷害+50%。'};
 const form={operatorId:ID,operatorName:NAME,rarity:6,profession:'術師',id:'standard',designHint:NAME,
  stats:{E0:{hp:44,atk:13,def:2,res:10},E1:{hp:55,atk:16,def:3,res:15},E2:{hp:68,atk:20,def:4,res:20}},statsSource:'goldenglow-v2.4',stages:['E0','E1','E2'],
  signature:{name:'澄淨閃耀',sourceTiers:sig,sourceText:'### 澄閃 — 澄淨閃耀\n\n**充能：** 浮標累計 8 次回合末自主攻擊命中。**行動點：** 2。每場 1 次。\n\n- **E0：** '+sig.E0+'\n- **E1：** '+sig.E1+'\n- **E2：** '+sig.E2},
  eventPatches:{},cards,implementation:'authored',
  abilities:{sourceFormat:'data-arrays',
   mechanic:'浮標：開戰2個，常態上限2。每個己方回合結束，各浮標對鎖定目標自主攻擊1次；連續回合命中同一敵人，倍率依序14／25／36／47／58／68% ATK。GOLD-04追加的浮標在它自爆時移除，上限回到2，其餘追加浮標同時自爆。',
   talents:[
    {unlock:'E1',name:'信標的憤怒',stages:{E0:{sourceText:'未解鎖。'},E1:{sourceText:'浮標每次自主攻擊後檢定自爆（自上次自爆起第1～6次：0／0／12／24／40／100%）。自爆對主目標追加125% ATK法術傷害，另1名隨機敵人50%。每回合最多2次。'},E2:{sourceText:'自爆改為主目標180% ATK、另1名隨機敵人70% ATK法術傷害。'}}},
    {unlock:'E2',name:'精準導流',stages:{E2:{sourceText:'自身卡牌、浮標與自爆忽略目標10點法抗（不低於0）。'}}}],
   signature:{name:'澄淨閃耀',stages:Object.fromEntries(['E0','E1','E2'].map(k=>[k,{sourceText:sig[k]}])),chargeSource:'浮標累計 8 次回合末自主攻擊命中',costSource:'2 行動點',limitSource:'每場 1 次；招牌不算出牌，不能自我充能。'},
   backpack:{rows:['··■■','·■■·','■■··','■···'],cells:7},
   logistics:['基建・幹員補給站：普通戰術補給工單效率 E0 +6%、E2 +10%（同名不疊加）。','基建・外勤調度室（E2）：普通派遣成功率 +5%。']}};
 const catalog=window.FrontierOperatorCatalogV113;
 if(!catalog||catalog.forms.some(f=>f.operatorId===ID))return;
 catalog.forms.push(form);
 const meta={target:'enemy',attack:true,damageType:'arts',maxTargets:1,aoe:false,secondary:null};
 for(const c of cards)window.FrontierOperatorCardMetadataV113[c.id]=Object.fromEntries(stagesM.map(s=>[s,{...meta}]));
 const prog=window.FrontierOperatorProgressionCatalogV113;
 prog.operators.push({id:ID,forms:[{id:'standard',cards:cards.map(c=>({...c,effectiveUnlock:c.unlock}))}]});
 for(const c of cards)prog.effects[c.id]=Object.fromEntries(stagesM.map(s=>[s,true]));
 const d=window.FrontierTacticsData;d.stats??={};d.cards??={};
 d.stats[ID]={...form.stats.E0,type:'arts',skill:form.signature.name,cost:1,cooldown:3,personal:cards.slice(0,3).map(c=>c.id)};
 for(const c of cards)d.cards[c.id]={name:c.name,owner:ID,cost:c.cost,kind:'attack',text:c.sourceEffects.M0,operatorVersion:113};
 const O=window.FrontierOperatorData;if(!O.pool.includes(ID))O.pool.push(ID);
 O.units[ID]={name:NAME,kind:'operator',rarity:6,image:ID,card:'GOLD-01',profession:'CASTER',role:'術師'};
 if(Array.isArray(window.FrontierActiveOperatorIdsV14)&&!window.FrontierActiveOperatorIdsV14.includes(ID))window.FrontierActiveOperatorIdsV14.push(ID);

 /* ---------- 戰鬥規則 ---------- */
 const alive=x=>x&&x.hp>0&&!x.exited;
 const legal=s=>s.enemies.filter(e=>alive(e)&&e.targetable!==false);
 const highest=list=>list.slice().sort((a,b)=>b.hp-a.hp||String(a.uid).localeCompare(String(b.uid)))[0];
 const elite=a=>Math.max(0,Math.min(2,a.elite||0));
 function roll(s,a,f){const key=[s.enemies.map(e=>e.uid).join(','),a.uid,f.id,s.turn,f.checks].join('|');let h=2166136261;for(let i=0;i<key.length;i++){h^=key.charCodeAt(i);h=Math.imul(h,16777619)}return ((h>>>0)%100000)/100000}
 function gg(s,a){if(!a.gg){a.gg={floats:[],cap:2,next:1,lock:null,pp:null,charge:0,sig:null};for(let i=0;i<2;i++)add(a)}sync(a);return a.gg}
 function add(a,extra={}){const g=a.gg,f={id:g.next++,target:null,stage:0,last:null,checks:0,...extra};g.floats.push(f);return f}
 function sync(a){a.resources??={};a.resources.floats=a.gg.floats.length}
 function permanent(g){return g.floats.filter(f=>!f.temp)}
 function ignore(a){return elite(a)===2?10:0}
 function lockOn(s,a,t,m3b){const g=gg(s,a);if(g.lock===t.uid)return;g.lock=t.uid;for(const f of g.floats)if(!f.split&&m3b&&f.stage>0&&f.carryUsed!==t.uid){f.carry2=t.uid;f.carryUsed=t.uid}}
 function percentBonus(s,g,amount){if(g.pp?.turn!==s.turn)g.pp={turn:s.turn,amount:0};g.pp.amount=Math.max(g.pp.amount,amount)}
 function strike(s,a,t,raw,ad,meta){const old=t.res;try{if(ignore(a))t.res=Math.max(0,(t.res||0)-ignore(a));return ad.damage(s,a,t,raw,'arts',{sourceKind:'delayed',goldenglow:meta})}finally{t.res=old}}
 function targetFor(s,a,f){const g=a.gg,enemies=legal(s);if(!enemies.length)return null;
  if(f.split){let t=enemies.find(e=>e.uid===f.target);if(!t||t.uid===g.lock){t=highest(enemies.filter(e=>e.uid!==g.lock))||null}if(t)return t;f.split=false}
  let t=enemies.find(e=>e.uid===g.lock);if(!t){t=highest(enemies);g.lock=t.uid}return t}
 function explode(s,a,t,ad,splash){const lv=elite(a),main=[0,1.25,1.8][lv],side=[0,.5,.7][lv];if(alive(t))strike(s,a,t,a.atk*main,ad,'explosion');if(splash){const others=legal(s).filter(e=>e.uid!==t.uid);if(others.length){const pickIdx=Math.floor(roll(s,a,{id:'splash',checks:others.length})*others.length);strike(s,a,others[pickIdx],a.atk*side,ad,'splash')}}}
 function endPlayerTurn(input,ad){
  const actors=input.team.filter(a=>a.operator===ID&&alive(a));if(!actors.length)return input;
  const s=input;
  for(const a of actors){const g=gg(s,a),lv=elite(a);let booms=0,extraBoom=false;
   for(const f of g.floats.slice()){
    if(!g.floats.includes(f))continue;
    const t=targetFor(s,a,f);if(!t)continue;
    if(f.target!==t.uid||f.last!==s.turn-1){f.stage=f.carry2===t.uid?1:0;}
    delete f.carry2;f.target=t.uid;f.stage=Math.min(6,f.stage+1);f.last=s.turn;
    let pct=LADDER[f.stage-1]+((g.pp?.turn===s.turn?g.pp.amount:0)+(f.split?f.splitBonus||0:0))/100;
    if(g.sig&&g.sig.until>=s.turn)pct*=1+g.sig.bonus;
    let raw=a.atk*pct;if(t.ggMark?.owner===a.uid){raw+=20;delete t.ggMark}
    strike(s,a,t,raw,ad,'float');g.charge++;
    if(lv>=1&&alive(t)&&booms<2){f.checks++;let n=Math.min(6,f.checks);if(f.boost===s.turn)n=Math.max(n,5);
     if(roll(s,a,f)<FUSE[n-1]){booms++;f.checks=0;explode(s,a,t,ad,true);if(f.extra){extraBoom=true;f.gone=true}}}
   }
   if(extraBoom){for(const f of g.floats)if(f.extra&&!f.gone){const enemies=legal(s);const t=enemies.find(e=>e.uid===f.target)||enemies.find(e=>e.uid===g.lock)||highest(enemies);if(t&&lv>=1)explode(s,a,t,ad,false)}g.floats=g.floats.filter(f=>!f.extra);g.cap=2}
   for(const f of g.floats)delete f.boost;
   if(g.sig&&g.sig.until<=s.turn){g.floats=g.floats.filter(f=>!f.temp);g.sig=null}
   g.pp=null;sync(a);
  }
  return s;
 }
 window.FrontierGoldenglowV24={id:ID,endPlayerTurn,state:gg};

 /* 卡牌效果擴充（operator-effects-v113 create() 時呼叫） */
 (window.FrontierOperatorEffectExtensionsV113??=[]).push(({register})=>{
  const opts={damageType:'arts'};
  const hit=(a,c,t,scale)=>c.damage(t,scale,0,'arts',{ignoreRes:ignore(a)});
  register('GOLD-01','enemy',(s,a,t,c)=>{const g=gg(s,a);hit(a,c,t,[.8,.95,1,1.15,.9][c.rank]);lockOn(s,a,t,c.rank===4);const perm=permanent(g).length;if(perm<g.cap)add(a,{target:t.uid});else if(c.rank===2||c.rank===3)percentBonus(s,g,c.rank===2?10:15);sync(a)},opts);
  register('GOLD-02','enemy',(s,a,t,c)=>{const g=gg(s,a),main=g.floats[0],chain=main&&main.target===t.uid&&main.last===s.turn-1&&main.stage>=3;hit(a,c,t,[1.15,1.3,1.4,1.65,1.25][c.rank]*(chain&&c.rank===2?1.1:chain&&c.rank===3?1.15:1));percentBonus(s,g,[5,5,10,10,5][c.rank]);if(c.rank===4&&main)main.boost=s.turn},opts);
  register('GOLD-03','enemy',(s,a,t,c)=>{const g=gg(s,a);hit(a,c,t,[.9,1,1.1,1.25,1.05][c.rank]);g.commands??={};if(g.commands.turn!==s.turn)g.commands={turn:s.turn,count:{}};const f=g.floats.slice().sort((x,y)=>(g.commands.count[x.id]||0)-(g.commands.count[y.id]||0))[0];if(!f||(g.commands.count[f.id]||0)>=2)return;g.commands.count[f.id]=(g.commands.count[f.id]||0)+1;
   let target=t;if(c.rank===4){const others=c.enemies.filter(e=>alive(e)&&e.uid!==t.uid);if(others.length)target=others.slice().sort((x,y)=>x.hp-y.hp)[0]}
   if(!alive(target))return;hit(a,c,target,[.5,.55,.65,.85,.7][c.rank]);
   if((c.rank===2||c.rank===3)&&alive(target))target.ggMark={owner:a.uid};
   if(c.rank===4&&alive(target)){const old=target.resReduction?.amount||0,strong=Math.max(old,10),base=(target.res||0)+(target.resReduction?.applied||0),applied=Math.min(base,strong);target.res=base-applied;target.resReduction={amount:strong,applied,expiresEnemyPhase:s.turn+1};if(applied>0)c.facts.resReduced.push(target.uid)}},opts);
  register('GOLD-04','enemy',(s,a,t,c)=>{const g=gg(s,a);hit(a,c,t,[1.2,1.3,1.45,1.6,1.3][c.rank]);if(!g.lock||!c.enemies.some(e=>e.uid===g.lock&&alive(e)))g.lock=t.uid;
   if(g.floats.length<CAP){g.cap=Math.min(CAP,g.cap+1);add(a,{target:t.uid,extra:true})}
   const others=c.enemies.filter(e=>alive(e)&&e.uid!==g.lock).sort((x,y)=>y.hp-x.hp);const want=c.rank===4?2:1,bonus=[0,5,10,15,0][c.rank];
   const free=g.floats.filter(f=>!f.split&&!f.temp).reverse();for(let i=0;i<want&&i<others.length&&free[i];i++){Object.assign(free[i],{split:true,target:others[i].uid,splitBonus:bonus,stage:0,last:null})}sync(a)},opts);
  register('GOLD-05','enemy',(s,a,t,c)=>{hit(a,c,t,[1,1.1,1.15,1.35,1.05][c.rank]);if(alive(t))t.ggConduct={owner:a.uid,atk:a.atk,layers:2,used:[],per:[.4,.4,.5,.55,.4][c.rank],m3b:c.rank===4,expiresTurn:s.turn+1}},opts);
 });
 /* 其他幹員出牌命中帶導電的敵人時追加法傷 */
 (window.FrontierOperatorAfterCardV113??=[]).push((s,a,def,program,c)=>{
  if(!program.attack||a.operator===ID)return;
  for(const uid of [...new Set(c.facts.hitTargets||[])]){const t=s.enemies.find(e=>e.uid===uid);const m=t?.ggConduct;if(!m||!alive(t))continue;
   if(m.expiresTurn<s.turn){delete t.ggConduct;continue}
   if(m.layers<=0||m.used.includes(a.uid))continue;
   m.layers--;m.used.push(a.uid);
   const owner=s.team.find(x=>x.uid===m.owner);const ad=FrontierOperatorDamageV113.create();
   if(owner)ad.damage(s,owner,t,m.atk*m.per,'arts',{sourceKind:'delayed',goldenglow:'conduct'});
   if(m.layers===0){if(m.m3b&&t.action?.breakable&&t.action?.breakWindow){t.action.breakProgress=Math.min(t.action.breakRequired,(t.action.breakProgress||0)+1);if(t.action.breakProgress>=t.action.breakRequired)t.breakWeakness=.15}delete t.ggConduct}
  }
 });
 /* 招牌 */
 (window.FrontierOperatorSignatureExtensionsV113??=[]).push(definitions=>{
  definitions[ID]={standard:{id:'signature:'+ID+':standard',name:form.signature.name,type:'arts',threshold:8,cost:2,maxBattle:1,
   onBattleEvent(s,a,e){if(e.type!=='playerTurnCompleted'||!a.gg)return 0;const n=a.gg.charge||0;a.gg.charge=0;return n},
   validate(s,a){if(![0,1,2].includes(a.elite||0))throw Error('Invalid elite stage');if(!legal(s).length)throw Error('No enemy for floats')},
   execute(s,a){const g=gg(s,a),lv=elite(a);g.sig={until:s.turn+1,bonus:[.25,.35,.5][lv]};for(let i=0;i<2&&g.floats.length<CAP;i++)add(a,{temp:true});s.cardBuffs??=[];s.cardBuffs.push({source:a.uid,filter:{owner:ID,damageType:'arts'},amount:-.25,remaining:null,expiresTurn:s.turn+1,group:'goldenglow-signature'});sync(a)}
  }};
 });
})();
