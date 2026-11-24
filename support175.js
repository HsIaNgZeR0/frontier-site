'use strict';
/* v175 支援欄位：遠征名單中標為「支援」的幹員（最多 3 名）不上場，只提供支援技能。
   主動技能：每個技能每回合最多 1 次，另有冷卻（施放後第 CD 個己方回合可再用）或每場次數。
   數值以支援幹員自身基礎 ATK／DEF（含潛能、不含裝備）計算。 */
window.FrontierSupport175=(()=>{
 const G=()=>window.FrontierOperatorGameV113;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pct=n=>Math.round(n*100)+'%';
 const v=(list,e)=>Array.isArray(list)?list[Math.min(e,list.length-1)]:list;
 const alive=a=>a&&a.hp>0&&!a.exited;
 const foes=s=>s.enemies.filter(e=>alive(e)&&e.targetable!==false);
 const allies=s=>s.team.filter(a=>alive(a)&&!a.friendly75&&a.operator!=='flow');
 const rnd=()=>typeof random==='function'?random():Math.random();
 const name=a=>a?.name||FrontierCapture.units[a?.id]?.name||'幹員';

 /* ---------- 技能資料（鍵：幹員 id；阿米婭依型態） ---------- */
 const S={
  char_123_fang:{name:'先遣調度',type:'P',text:e=>'第 1 回合 +1 行動點'+(e?'；第 2 回合再 +1 行動點':'')+'。'},
  operator_v31_vanilla:{name:'節約部署',type:'P',cap:[1,2],text:e=>'回合結束時剩餘的行動點，至多保留 '+v([1,2],e)+' 點到下回合。'},
  operator_v31_plume:{name:'衝鋒號令',type:'P',text:e=>'每回合首張先鋒專屬牌打出後，'+(e?'手牌中費用最高的':'隨機 1 張')+'手牌本回合費用 -1（最低 0）。'},
  char_208_melan:{name:'決鬥宣告',type:'A',ap:1,cd:3,target:'enemy',val:[.15,.2],text:e=>'指定 1 名敵人：本回合我方對它的傷害 +'+pct(v([.15,.2],e))+'，對其他敵人傷害 -10%。'},
  operator_v31_popukar:{name:'電鋸橫掃',type:'P',text:e=>'每回合首次以群體攻擊牌命中 2 名以上敵人時抽 1 張'+(e?'，並使每名命中者失衡衝擊 +1':'')+'。'},
  operator_v31_midnight:{name:'夜場魅惑',type:'A',ap:1,cd:3,target:'enemy',val:[.3,.4],text:e=>'指定 1 名敵人：它本次敵方行動的攻擊有 '+pct(v([.3,.4],e))+' 機率落空。'},
  operator_v31_cardigan:{name:'營養便當',type:'P',val:[.05,.08],text:e=>'戰鬥勝利後，存活的出戰幹員恢復 '+pct(v([.05,.08],e))+' 最大 HP。'},
  operator_v31_spot:{name:'掩護換位',type:'A',ap:[1,0],cd:3,target:'ally2',text:e=>'選擇 2 名出戰幹員，交換敵人預告要攻擊他們的目標。'},
  char_124_kroos:{name:'偵查射擊',type:'P',text:e=>'敵人意圖額外顯示之後 '+(e?2:1)+' 回合的行動。'},
  operator_v31_adnachiel:{name:'連射標定',type:'A',ap:1,cd:3,target:'enemy',val:[10,20],text:e=>'指定 1 名敵人被標定 2 回合：我方每段攻擊對它額外 +'+v([10,20],e)+' 傷害。'},
  operator_v31_catapult:{name:'爆破回收',type:'P',val:[4,6],text:e=>'單張牌擊倒 2 名以上敵人時，獲得 '+v([4,6],e)+' 源石碇（每場 1 次）。'},
  operator_v31_lava:{name:'引燃',type:'A',ap:1,cd:3,target:'enemy',val:[3,5],text:e=>'指定 1 名敵人：下次受到法術傷害時附加 '+v([3,5],e)+' 層灼燒（每回合開始受 10 點真實傷害／層，並減少 1 層）。'},
  char_210_stward:{name:'法術解析',type:'P',val:[5,10],text:e=>'每回合我方對法抗最高敵人的第一擊法術傷害，忽略 '+v([5,10],e)+' 點法抗。'},
  hibiscus:{name:'預防處方',type:'A',ap:1,cd:2,target:'ally',val:[.4,.6],text:e=>'指定 1 名出戰幹員：本次敵方行動中下一次受到的異常無效，並改為恢復 '+pct(v([.4,.6],e))+' ATK 的 HP。'},
  operator_v31_ansel:{name:'遠程後送',type:'P',runUses:[1,2],val:[0,.2],text:e=>'戰鬥勝利後，倒地的出戰幹員'+(e?'以 20% HP':'以最低 HP')+'歸隊（整趟遠征 '+v([1,2],e)+' 次）。'},
  operator_v31_orchid:{name:'遲滯咒',type:'A',ap:1,cd:2,uses:2,target:'enemy',text:e=>'指定 1 名敵人：跳過它下一次普通行動（首領與精英'+(e?'可':'不可')+'；預告的特殊技能不受影響）。每場 2 次。'},
  char_151_myrtle:{name:'治癒之歌',type:'P',th:[4,3,3],uses:[3,4,5],text:e=>'回合結束時若本回合花費 ≥'+v([4,3,3],e)+' 行動點，下回合 +1 行動點'+(e===2?'，並恢復 HP 比例最低者 10% ATK':'')+'（每場 '+v([3,4,5],e)+' 次）。'},
  char_355_ethan:{name:'誘捕',type:'A',ap:1,cd:3,target:'enemy',val:[2,3,3],text:e=>'指定 1 名敵人附加 '+v([2,3,3],e)+' 層纏繞'+(e===2?'；若因此束縛，返還 1 行動點':'')+'。'},
  char_272_strong:{name:'行商',type:'P',val:[.15,.2,.25],text:e=>'戰鬥勝利時有 '+pct(v([.15,.2,.25],e))+' 機率額外獲得 3 源石碇。'},
  operator_v31_ambriel:{name:'高點觀測',type:'A',ap:1,cd:4,target:'none',val:[.5,.6,.75],text:e=>'本回合我方物理攻擊無視目標 '+pct(v([.5,.6,.75],e))+' 防禦。'},
  operator_v31_vigna:{name:'衝鋒號',type:'P',val:[1,1,2],text:e=>'每回合首張先鋒或近衛攻擊牌，使命中的敵人失衡衝擊 +'+v([1,1,2],e)+'。'},
  'amiya:caster':{name:'情緒共鳴',type:'A',ap:1,cd:2,uses:2,target:'none',val:[.15,.2,.25],text:e=>'本回合全隊下一張術師攻擊牌傷害 +'+pct(v([.15,.2,.25],e))+'。每場 2 次。'},
  'amiya:guard':{name:'破勢指揮',type:'P',val:[.08,.1,.12],text:e=>'敵人陷入破勢時，全隊下一張攻擊牌 +'+pct(v([.08,.1,.12],e))+'（每回合 1 次）。'},
  'amiya:medic':{name:'淨化祈願',type:'A',ap:1,cd:3,target:'none',val:[.05,.08,.1],text:e=>'全隊各淨化 1 層負面；每淨化 1 層，該幹員下一張牌 +'+pct(v([.05,.08,.1],e))+'。'},
  char_102_texas:{name:'企鵝物流',type:'P',text:e=>'第 1 回合 +1 行動點'+(e?'並額外抽 '+(e===2?2:1)+' 張':'')+'。'},
  operator_v31_lapluma:{name:'收割',type:'P',val:[.05,.08,.1],heal:[.1,.12,.15],text:e=>'本回合連續攻擊同一敵人時，第 2 張起每張 +'+pct(v([.05,.08,.1],e))+'；擊倒敵人時打出者恢復 '+pct(v([.1,.12,.15],e))+' ATK（每回合 1 次）。'},
  char_140_whitew:{name:'狼群威嚇',type:'A',ap:1,cd:3,target:'none',val:[1,1,2],text:e=>'全體敵人 +'+v([1,1,2],e)+' 精神損傷'+(e?'；若觸發精神崩潰，返還 1 行動點':'')+'。'},
  operator_v31_cantabile:{name:'迅捷號角',type:'A',ap:0,cd:1,uses:[2,2,3],target:'none',text:e=>'手牌中費用最高的先鋒專屬牌本回合費用 -'+(e===2?2:1)+(e===1?'，並抽 1 張':'')+'。每場 '+v([2,2,3],e)+' 次。'},
  char_128_plosis:{name:'隨機援護',type:'P',val:[.15,.2,.25],text:e=>'每回合開始，隨機 1 名受傷的出戰幹員恢復 '+pct(v([.15,.2,.25],e))+' ATK'+(e===2?'，並淨化 1 層負面':'')+'。'},
  operator_v31_projektred:{name:'狩獵',type:'A',ap:1,cd:2,uses:[1,1,2],target:'enemy',val:[.3,.35,.4],text:e=>'指定 HP ≤'+pct(v([.3,.35,.4],e))+' 的普通／精英敵人：我方下一擊必定擊倒；首領改為下一次受到傷害 +30%。每場 '+v([1,1,2],e)+' 次。'},
  operator_v31_heavyrain:{name:'雨幕',type:'P',val:[.1,.15,.2],text:e=>'敵人的多目標攻擊對我方傷害 -'+pct(v([.1,.15,.2],e))+'。'},
  operator_v31_warfarin:{name:'緊急輸血',type:'A',ap:1,cd:3,target:'ally',val:[.2,.25,.3],text:e=>'指定 1 名出戰幹員失去 20% 當前 HP，本回合其攻擊牌 +'+pct(v([.2,.25,.3],e))+(e===2?'；本回合其擊倒敵人時回復失去的 HP':'')+'。'},
  operator_v31_specter:{name:'不死之軀',type:'P',runUses:[1,2,3],text:e=>'每場第一位將倒下的出戰幹員保留最低 HP、攻擊 +20%，於下個己方回合結束時倒下'+(e===2?'（期間擊倒敵人則不倒下）':'')+'。整趟遠征 '+v([1,2,3],e)+' 次。'},
  char_103_angel:{name:'彈藥補給',type:'P',val:[.3,.35,.4],text:e=>'每回合首張多段攻擊牌結算後，追加一發 '+pct(v([.3,.35,.4],e))+' ATK 物理傷害。'},
  char_202_demkni:{name:'鈣化弱點',type:'A',ap:1,cd:3,uses:2,target:'none',val:[.1,.12,.15],text:e=>'全體敵人 2 回合內受到的法術傷害 +'+pct(v([.1,.12,.15],e))+'，且無法保留護盾。每場 2 次。'},
  char_172_svrash:{name:'喀蘭號令',type:'A',ap:1,cd:2,uses:[1,1,2],target:'none',text:e=>'本回合我方物理攻擊無視防禦，但手中攻擊牌費用 +1'+(e?'；本回合每擊倒 1 名敵人獲得 2 源石碇':'')+'。每場 '+v([1,1,2],e)+' 次。'},
  operator_v31_surtr:{name:'熔核餘燼',type:'A',ap:2,cd:3,target:'enemy',val:[.9,1.1,1.4],text:e=>'對 1 名敵人造成 '+pct(v([.9,1.1,1.4],e))+' ATK 法術傷害；若擊倒，返還 2 行動點。'},
  operator_v31_eyjafjalla:{name:'火山加速',type:'P',val:[0,.05,.1],text:e=>'每回合第一張術師牌結算後，手牌中 1 張術師牌本回合費用 -1'+(e?'，下一張術師牌 +'+pct(v([0,.05,.1],e)):'')+'。'},
  operator_v31_hoshiguma:{name:'鬼門挑撥',type:'A',ap:1,cd:3,target:'none',val:[.2,.25,.3],text:e=>'本回合敵人的單體攻擊改為指向防禦最高的出戰幹員，其防禦 +'+pct(v([.2,.25,.3],e))+'。'},
  operator_v31_skadi:{name:'深海獵手',type:'P',val:[.1,.15,.2],text:e=>'我方擊倒敵人時 +1 層（最多 3）；下一張攻擊牌每層 +'+pct(v([.1,.15,.2],e))+'，打出後清除。'},
  operator_v31_angelina:{name:'失重',type:'A',ap:1,cd:3,target:'enemy',val:[.25,.3,.35],text:e=>'指定 1 名敵人：清除它的護盾，它下一次攻擊傷害 -'+pct(v([.25,.3,.35],e))+'。'},
  operator_v31_mlynar:{name:'未竟之業',type:'P',val:[.08,.1,.15],text:e=>'HP 低於 50% 的出戰幹員攻擊 +'+pct(v([.08,.1,.15],e))+'；同時 3 人以上低於 50% 時加倍。'},
  operator_v31_muelsyse:{name:'水流分身',type:'A',ap:1,cd:1,uses:[2,2,3],target:'none',val:[.3,.4,.5],text:e=>'抽 1 張，下一張普通牌的主效果 +'+pct(v([.3,.4,.5],e))+'。每場 '+v([2,2,3],e)+' 次。'},
  operator_v31_aak:{name:'隨機配方',type:'A',ap:1,cd:2,target:'ally',val:[.25,.3,.3],text:e=>'指定 1 名出戰幹員隨機獲得'+(e===2?'兩':'一')+'種：本回合攻擊 +'+pct(v([.25,.3,.3],e))+'／本回合其手牌費用 -1／下一次受到的傷害無效。'},
  char_377_gdglow:{name:'靜電附著',type:'A',ap:1,cd:3,target:'enemy',th:[5,4,4],text:e=>'指定 1 名敵人附著靜電 2 回合：我方卡牌每命中它 1 次 +1 層，達 '+v([5,4,4],e)+' 層時放電，它下一次攻擊傷害 -50%（首領 -25%）'+(e===2?'；放電時返還 1 行動點':'')+'。'},
  texas_the_omertosa:{name:'劍雨・預告',type:'A',ap:1,cd:3,uses:[1,1,2],target:'none',val:[0,.1,.2],text:e=>'打斷全體敵人可打斷的蓄力特殊技能'+(e?'，被打斷者下一次受到傷害 +'+pct(v([0,.1,.2],e)):'')+'。每場 '+v([1,1,2],e)+' 次。'}
 };

 /* ---------- 名單 ---------- */
 function members(r=R()){if(!r?.support175?.length)return [];return r.support175.map(id=>{const a=(r.reserve144||[]).find(x=>x.id===id);if(!a)return null;const key=id==='amiya'?'amiya:'+(a.form||'caster'):id,def=S[key];if(!def)return null;const e=Math.max(0,Math.min(2,a.elite||0)),stats=FrontierGrowth.stats(id,e);return{id,key,def,e,form:a.form,atk:stats.atk,def0:stats.def,unit:FrontierCapture.units[id]}}).filter(Boolean)}
 const has=(key,r)=>members(r).find(m=>m.key===key);
 const state=b=>b.sp175??={turnSeen:0,cd:{},used:{},uses:{},spent:0,lastEnergy:null,flags:{}};
 const runState=()=>R().support175Run??={};
 function apCost(m){return v(m.def.ap??0,m.e)}
 function usesLeft(m,sp){const cap=m.def.uses==null?Infinity:v(m.def.uses,m.e);return cap-(sp.uses[m.key]||0)}
 function status(m,b=R()?.battle){if(!b)return{ok:false};const sp=state(b),turn=b.turn,ready=sp.cd[m.key]||0,remaining=Math.max(0,ready-turn),cd=m.def.cd||0;const left=usesLeft(m,sp),used=sp.used[m.key]===turn,phase=(b.operatorPhase||'player')==='player'&&!b.operatorPending?.length&&!FrontierCurios.pending?.();const cost=apCost(m);return{remaining,cd,left,used,cost,afford:b.energy>=cost,ok:phase&&!used&&!remaining&&left>0&&b.energy>=cost}}

 /* ---------- 共用工具 ---------- */
 function draw(s,n){let k=0;for(;k<n;k++){if(!s.draw.length){if(!s.discard.length)break;s.draw=shuffle(s.discard);s.discard=[]}s.hand.push(s.draw.pop())}return k}
 function heal(t,n){if(!alive(t))return 0;const before=t.hp;t.hp=Math.min(t.max,t.hp+Math.max(0,Math.floor(n)));return t.hp-before}
 function buff(s,filter,amount,extra={}){s.cardBuffs??=[];if(extra.group)s.cardBuffs=s.cardBuffs.filter(b=>b.group!==extra.group);s.cardBuffs.push({source:'support175',filter,amount,remaining:1,...extra})}
 function costMod(card,turn,delta){card.sp175Cost={turn,delta:(card.sp175Cost?.turn===turn?card.sp175Cost.delta:0)+delta}}
 function cardInfo(c){const d=G().effects.definitions.get(c?.id);return d?{owner:d.owner,form:d.form,cost:d.cost}:null}
 function professionOf(s,c){const i=cardInfo(c);return i&&s.team.find(a=>a.operator===i.owner&&a.form===i.form)?.profession}
 function pseudo(m){return{uid:'support175:'+m.id,id:m.id,operator:'support175',atk:m.atk,def:m.def0,hp:1,max:1,elite:m.e,profession:FrontierCapture.units[m.id]?.role}}
 function gainAP(s,n,why){s.energy+=n;state(s).gained=(state(s).gained||0)+n;if(why)log(why)}
 function fieldPoints(n,why){const r=R();r.fieldPoints=(r.fieldPoints||0)+n;log(why+' · 源石碇 +'+n)}

 /* ---------- 主動技能 ---------- */
 const actives={
  char_208_melan(s,m,t){state(s).duel={turn:s.turn,uid:t.uid,amp:v(m.def.val,m.e)};return '決鬥 · '+name(t)},
  operator_v31_midnight(s,m,t){t.sp175Miss={turn:s.turn,chance:v(m.def.val,m.e)};return '魅惑 · '+name(t)},
  operator_v31_spot(s,m,a,b){for(const e of s.enemies){if(e.operatorTarget===a.uid)e.operatorTarget=b.uid;else if(e.operatorTarget===b.uid)e.operatorTarget=a.uid;const x=s.team.find(q=>q.uid===e.operatorTarget);if(x){e.target=x.id;if(e.action)e.action.target=x.uid}}return '掩護換位 · '+name(a)+' ⇄ '+name(b)},
  operator_v31_adnachiel(s,m,t){t.sp175Mark={until:s.turn+1,flat:v(m.def.val,m.e)};return '標定 · '+name(t)},
  operator_v31_lava(s,m,t){t.sp175Ignite=v(m.def.val,m.e);return '引燃 · '+name(t)},
  hibiscus(s,m,a){a.sp175Prevent={turn:s.turn,heal:Math.floor(m.atk*v(m.def.val,m.e))};return '預防處方 · '+name(a)},
  operator_v31_orchid(s,m,t){if((t.boss||t.elite)&&!m.e)throw Error('E1 前無法對首領或精英使用。');t.skipNextOrdinaryAction=true;t.skipSource='support175';return '遲滯 · '+name(t)},
  char_355_ethan(s,m,t){const before=!!t.skipNextControllableAction;FrontierOperatorStatusDictionaryV31.entangle(s,pseudo(m),t,v(m.def.val,m.e));if(m.e===2&&!before&&t.skipNextControllableAction)gainAP(s,1,'誘捕束縛 · 返還 1 行動點');return '誘捕 · '+name(t)},
  operator_v31_ambriel(s,m){state(s).ignoreDef={turn:s.turn,pct:v(m.def.val,m.e)};return '高點觀測'},
  'amiya:caster'(s,m){buff(s,{profession:'術師',attack:true},v(m.def.val,m.e),{group:'sp175-amiya'});return '情緒共鳴'},
  'amiya:medic'(s,m){const amp=v(m.def.val,m.e);for(const a of allies(s)){const n=FrontierOperatorStatusDictionaryV31.cleanse(s,pseudo(m),a,1);if(n)buff(s,{owner:a.operator},amp*n,{group:'sp175-pray-'+a.uid})}return '淨化祈願'},
  char_140_whitew(s,m){let collapsed=false;for(const e of foes(s))if(FrontierOperatorStatusDictionaryV31.mental(s,pseudo(m),e,v(m.def.val,m.e)).collapsed)collapsed=true;if(collapsed&&m.e)gainAP(s,1,'精神崩潰 · 返還 1 行動點');return '狼群威嚇'},
  operator_v31_cantabile(s,m){const card=s.hand.filter(c=>professionOf(s,c)==='先鋒').sort((x,y)=>(cardInfo(y).cost)-(cardInfo(x).cost))[0];if(!card)throw Error('手牌中沒有先鋒專屬牌。');costMod(card,s.turn,-(m.e===2?2:1));if(m.e===1)draw(s,1);return '迅捷號角'},
  operator_v31_projektred(s,m,t){if(t.boss){t.nextDamageVulnerability=Math.max(t.nextDamageVulnerability||0,.3);return '狩獵 · 首領易傷'}if(t.hp>t.max*v(m.def.val,m.e))throw Error('目標 HP 需在 '+pct(v(m.def.val,m.e))+' 以下。');t.sp175Execute=true;return '狩獵 · '+name(t)},
  operator_v31_warfarin(s,m,a){const loss=Math.floor(a.hp*.2);a.hp=Math.max(1,a.hp-loss);buff(s,{owner:a.operator,attack:true},v(m.def.val,m.e),{group:'sp175-warf',remaining:null,expiresTurn:s.turn});if(m.e===2)a.sp175Transfusion={turn:s.turn,loss};return '緊急輸血 · '+name(a)},
  char_202_demkni(s,m){const amount=v(m.def.val,m.e);for(const e of foes(s)){(e.calcification??=[]).push({amount,expiresEnemyPhase:s.turn+1,source:'support175'});e.sp175NoShield=s.turn+1}return '鈣化弱點'},
  char_172_svrash(s,m){state(s).ignoreDef={turn:s.turn,pct:1};if(m.e)state(s).silverKill=s.turn;for(const c of s.hand){const d=G().effects.describe(c.id);if(d?.attack)costMod(c,s.turn,1)}return '喀蘭號令'},
  operator_v31_surtr(s,m,t){const r=G().adapters().damage(s,pseudo(m),t,Math.floor(m.atk*v(m.def.val,m.e)),'arts',{sourceKind:'support175'});if(t.hp<=0)gainAP(s,2,'熔核餘燼擊倒 · 返還 2 行動點');return '熔核餘燼 · '+(r?.damage||0)+' 傷害'},
  operator_v31_hoshiguma(s,m){const tank=allies(s).sort((a,b)=>(b.def||0)-(a.def||0))[0];if(!tank)throw Error('沒有可承受攻擊的幹員。');const add=Math.ceil((tank.def||0)*v(m.def.val,m.e));tank.def=(tank.def||0)+add;tank.taunt=Math.max(tank.taunt||0,1);tank.sp175Taunt={turn:s.turn,def:add};for(const e of foes(s)){e.operatorTarget=tank.uid;e.target=tank.id;if(e.action)e.action.target=tank.uid}return '鬼門挑撥 · '+name(tank)},
  operator_v31_angelina(s,m,t){t.block=0;t.sp175Weight=v(m.def.val,m.e);return '失重 · '+name(t)},
  operator_v31_muelsyse(s,m){draw(s,1);buff(s,{},v(m.def.val,m.e),{group:'sp175-flow'});return '水流分身'},
  operator_v31_aak(s,m,a){const pool=['atk','cost','guard'];const picks=[];while(picks.length<(m.e===2?2:1))picks.push(pool.splice(Math.floor(rnd()*pool.length),1)[0]);const labels=[];for(const p of picks){if(p==='atk'){buff(s,{owner:a.operator,attack:true},v(m.def.val,m.e),{group:'sp175-aak',remaining:null,expiresTurn:s.turn});labels.push('攻擊提升')}if(p==='cost'){for(const c of s.hand)if(cardInfo(c)?.owner===a.operator)costMod(c,s.turn,-1);labels.push('費用 -1')}if(p==='guard'){a.sp175Guard=true;labels.push('傷害無效 1 次')}}return '隨機配方 · '+name(a)+'：'+labels.join('、')},
  char_377_gdglow(s,m,t){t.sp175Static={until:s.turn+1,layers:0,th:v(m.def.th,m.e),e:m.e};return '靜電附著 · '+name(t)},
   texas_the_omertosa(s,m){let n=0;for(const e of foes(s))if(e.action?.breakable&&e.action?.breakWindow&&e.special&&!e.special.solved){e.action.breakProgress=e.action.breakRequired;n++;if(m.e)e.nextDamageVulnerability=Math.max(e.nextDamageVulnerability||0,v(m.def.val,m.e))}return '劍雨・預告 · 打斷 '+n+' 名'}
 };

 function cast(key,targetUid,second){
  const m=members().find(x=>x.key===key),b=R()?.battle;if(!m||!b||m.def.type!=='A')return false;
  const st=status(m,b);if(!st.ok){toast(st.used?'本回合已使用。':st.remaining?'冷卻中，還需 '+st.remaining+' 回合。':st.left<=0?'本場次數已用完。':!st.afford?'行動點不足。':'目前無法施放。');return false}
  const tgt=m.def.target;
  if((tgt==='enemy'||tgt==='ally')&&!targetUid)return pick(m);
  if(tgt==='ally2'&&(!targetUid||!second))return pick(m,targetUid);
  const s=G().snapshot(),sp=state(s);let note;
  try{
   const t=tgt==='enemy'?foes(s).find(e=>e.uid===targetUid):tgt==='ally'||tgt==='ally2'?allies(s).find(a=>a.uid===targetUid):null,t2=tgt==='ally2'?allies(s).find(a=>a.uid===second):null;
   if((tgt==='enemy'||tgt==='ally')&&!t||tgt==='ally2'&&(!t||!t2||t===t2))throw Error('目標無效。');
   note=actives[key](s,m,t,t2);
  }catch(e){toast(e.message);return false}
  s.energy-=st.cost;sp.used[m.key]=s.turn;if(m.def.cd)sp.cd[m.key]=s.turn+m.def.cd;sp.uses[m.key]=(sp.uses[m.key]||0)+1;
  G().apply(s);log('支援 · '+note);closeModal?.();
  if(!checkBattle()){save();render()}
  return true;
 }
 function pick(m,first){
  const b=R().battle,tgt=m.def.target,enemy=tgt==='enemy';
  const list=enemy?b.enemies.filter(e=>alive(e)&&e.targetable!==false):R().team.filter(a=>alive(a)&&a.uid!==first);
  const label=x=>enemy?esc(x.name)+' · '+x.hp+'/'+x.max:esc(FrontierCapture.units[x.id]?.name)+' · '+x.hp+'/'+x.max;
  const call=x=>tgt==='ally2'&&first?"FrontierSupport175.cast('"+m.key+"','"+first+"','"+x.uid+"')":tgt==='ally2'?"FrontierSupport175.cast('"+m.key+"','"+x.uid+"')":"FrontierSupport175.cast('"+m.key+"','"+x.uid+"')";
  modal(m.def.name+' · '+(enemy?'選擇敵人':tgt==='ally2'?(first?'選擇第二名幹員':'選擇第一名幹員'):'選擇幹員'),'<p>'+esc(m.def.text(m.e))+'</p><div class="sp175-targets">'+list.map(x=>'<button type="button" onclick="'+call(x)+'">'+label(x)+'</button>').join('')+'</div>','<button onclick="closeModal()">取消</button>');
  return false;
 }

 /* ---------- 傷害／承傷掛鉤 ---------- */
 function outgoing(t,raw,op,type){
  const r=R(),s=r?.battle;if(!s?.sp175||!members().length||!s.enemies?.includes(t)||op==='support175')return raw;
  const a=r.team.find(x=>x.operator===op||x.id===op);if(!a)return raw;const sp=s.sp175,turn=s.turn;
  if(t.sp175Execute){delete t.sp175Execute;return raw+t.hp+(t.block||0)+(t.def||0)+1000}
  if(sp.duel?.turn===turn)raw*=t.uid===sp.duel.uid?1+sp.duel.amp:.9;
  if(t.sp175Mark?.until>=turn)raw+=t.sp175Mark.flat;
  if(type==='physical'&&sp.ignoreDef?.turn===turn)raw+=(t.def||0)*sp.ignoreDef.pct;
  const stw=has('char_210_stward');if(stw&&type==='arts'&&sp.stwTurn!==turn){const top=foes(s).sort((x,y)=>(y.res||0)-(x.res||0))[0];if(top?.uid===t.uid&&(t.res||0)>0){sp.stwTurn=turn;const res=Math.min(95,t.res||0),cut=Math.max(0,res-v(stw.def.val,stw.e));raw*=(1-cut/100)/(1-res/100)}}
  if(sp.chainBonus)raw*=1+sp.chainBonus;
  const ml=has('operator_v31_mlynar');if(ml&&a.hp<a.max*.5){const low=r.team.filter(x=>alive(x)&&x.hp<x.max*.5).length;raw*=1+v(ml.def.val,ml.e)*(low>=3?2:1)}
  if(a.sp175Undying)raw*=1.2;
  return raw;
 }
 function incoming(ev){
  const enemy=ev?.target,actor=ev?.actor;if(!enemy||!actor||!members().length)return;
  const turn=R().battle?.turn,amount=ev.amount||0;let cut=0;
  if(actor.sp175Guard){delete actor.sp175Guard;cut=amount}
  if(enemy.sp175Miss?.turn===turn&&!enemy.sp175MissRolled){enemy.sp175MissRolled=true;enemy.sp175MissHit=rnd()<enemy.sp175Miss.chance}
  if(enemy.sp175MissHit)cut=amount;
  if(enemy.sp175Weight){cut=Math.max(cut,Math.floor(amount*enemy.sp175Weight));delete enemy.sp175Weight}
  const hr=has('operator_v31_heavyrain');if(hr&&enemy.sp175Multi)cut=Math.max(cut,Math.floor(amount*v(hr.def.val,hr.e)));
  if(cut)ev.reduction=(ev.reduction||0)+cut;
 }
 function limitLoss(t,loss){
  if(!t?.operator||t.operator==='support175'||!R()?.team?.some(x=>x.uid===t.uid))return loss;
  if(t.sp175Undying&&loss>=t.hp)return Math.max(0,t.hp-10);
  const sp=has('operator_v31_specter');if(!sp||loss<t.hp)return loss;
  const run=runState(),battleId=R().battle?.operatorBattleId;if(run.specterBattle===battleId||(run.specterUses||0)>=v([1,2,3],sp.e))return loss;
  run.specterBattle=battleId;run.specterUses=(run.specterUses||0)+1;t.sp175Undying={until:(R().battle?.turn||1)+1,elite:sp.e};log('不死之軀 · '+name(t)+' 暫不倒下');return Math.max(0,t.hp-10);
 }
 function inflict(a){const p=a?.sp175Prevent;if(p&&p.turn===R()?.battle?.turn){delete a.sp175Prevent;heal(a,p.heal);log('預防處方 · 異常無效');return true}return false}

 /* ---------- 回合開始 ---------- */
 function turnStart(){
  const b=R()?.battle;if(!b||b.operatorVersion!==113||R().result)return;const sp=state(b);
  if(sp.turnSeen===b.turn||(b.operatorPhase||'player')!=='player'||b.operatorPending?.length)return;
  const list=members();const prev=sp.turnSeen;const prevEnd=sp.lastEnergy,prevSpent=sp.spent;sp.turnSeen=b.turn;
  if(!list.length){sp.spent=0;sp.lastEnergy=b.energy;return}
  const s=G().snapshot(),st=state(s);st.turnSeen=b.turn;st.gained=0;st.chain=null;delete st.chainBonus;st.flags={};
  for(const a of s.team){if(a.sp175Taunt&&a.sp175Taunt.turn<s.turn){a.def=Math.max(0,(a.def||0)-a.sp175Taunt.def);a.taunt=0;delete a.sp175Taunt}if(a.sp175Undying&&s.turn>a.sp175Undying.until+1){if(!(a.sp175Undying.elite===2&&a.sp175Undying.killed)){a.hp=0;a.downed=true;a.rescueTimer??=3;log('不死之軀結束 · '+name(a)+' 倒下')}delete a.sp175Undying}if(a.sp175Prevent&&a.sp175Prevent.turn<s.turn)delete a.sp175Prevent;if(a.sp175Transfusion&&a.sp175Transfusion.turn<s.turn)delete a.sp175Transfusion}
  for(const e of s.enemies){delete e.sp175Multi;delete e.sp175MissRolled;delete e.sp175MissHit;if(e.sp175NoShield>=s.turn)e.block=0;if(e.sp175Mark&&e.sp175Mark.until<s.turn)delete e.sp175Mark;if(e.sp175Burn>0&&alive(e)){G().adapters().damage(s,{uid:'support175:burn',operator:'support175',atk:0},e,e.sp175Burn*10,'true',{dot:true,sourceKind:'support175'});e.sp175Burn--}}
  for(const m of list){const e=m.e;switch(m.key){
   case 'char_123_fang':if(s.turn===1||e&&s.turn===2)gainAP(s,1,'先遣調度 · +1 行動點');break;
   case 'char_102_texas':if(s.turn===1){gainAP(s,1,'企鵝物流 · +1 行動點');if(e)draw(s,e===2?2:1)}break;
   case 'operator_v31_vanilla':if(prev&&prevEnd>0){const n=Math.min(v(m.def.cap,e),prevEnd);gainAP(s,n,'節約部署 · +'+n+' 行動點')}break;
   case 'char_151_myrtle':if(prev&&prevSpent>=v(m.def.th,e)&&(st.uses[m.key]||0)<v(m.def.uses,e)){st.uses[m.key]=(st.uses[m.key]||0)+1;gainAP(s,1,'治癒之歌 · +1 行動點');if(e===2){const t=allies(s).sort((x,y)=>x.hp/x.max-y.hp/y.max)[0];heal(t,m.atk*.1)}}break;
   case 'char_128_plosis':{const hurt=allies(s).filter(a=>a.hp<a.max);if(hurt.length){const t=hurt[Math.floor(rnd()*hurt.length)];heal(t,m.atk*v(m.def.val,e));if(e===2)FrontierOperatorStatusDictionaryV31.cleanse(s,pseudo(m),t,1);log('隨機援護 · '+name(t))}break}
  }}
  st.spent=0;st.lastEnergy=s.energy;
  G().apply(s);if(!checkBattle())save();
 }
 function nextBonus(b){
  const sp=b?.sp175;if(!sp)return 0;let n=0;
  for(const m of members()){const e=m.e;
   if(m.key==='char_123_fang'&&e&&b.turn===1)n++;
   if(m.key==='operator_v31_vanilla')n+=Math.min(v(m.def.cap,e),Math.max(0,b.energy));
   if(m.key==='char_151_myrtle'&&(sp.spent||0)>=v(m.def.th,e)&&(sp.uses[m.key]||0)<v(m.def.uses,e))n++;
  }return n;
 }
 function track(){const b=R()?.battle;if(!b?.sp175||(b.operatorPhase||'player')!=='player'||b.sp175.turnSeen!==b.turn)return;const sp=b.sp175;if(sp.lastEnergy!=null&&b.energy<sp.lastEnergy)sp.spent=(sp.spent||0)+sp.lastEnergy-b.energy;sp.lastEnergy=b.energy}

 /* ---------- 出牌後被動 ---------- */
 function afterPlay(ctx){
  const r=R(),b=r?.battle,list=members();if(!list.length)return;
  const kills=ctx.before.filter(e=>{const now=b?.enemies.find(x=>x.uid===e.uid);return e.hp>0&&(!now||now.hp<=0)});
  if(!b){if(kills.length>=2){const c=has('operator_v31_catapult');if(c&&!r.sp175Catapult?.includes(ctx.battleId)){(r.sp175Catapult??=[]).push(ctx.battleId);fieldPoints(v(c.def.val,c.e),'爆破回收')}}return}
  const s=G().snapshot(),sp=state(s),turn=s.turn,actor=ctx.actor&&s.team.find(a=>a.uid===ctx.actor.uid);let touched=false;
  const hits=(b.operatorEvents||[]).slice(ctx.eventCount).filter(e=>e.type==='directCardDamage'&&e.source===ctx.actor?.uid);
  const targets=[...new Set(hits.map(h=>h.target))].map(id=>s.enemies.find(e=>e.uid===id)).filter(Boolean);
  for(const m of list){const e=m.e;switch(m.key){
   case 'operator_v31_plume':if(ctx.profession==='先鋒'&&sp.flags.plume!==turn&&s.hand.length){sp.flags.plume=turn;const pool=s.hand.filter(c=>cardInfo(c));const card=e?pool.sort((x,y)=>cardInfo(y).cost-cardInfo(x).cost)[0]:pool[Math.floor(rnd()*pool.length)];if(card){costMod(card,turn,-1);touched=true;log('衝鋒號令 · 1 張手牌費用 -1')}}break;
   case 'operator_v31_popukar':if(ctx.aoe&&targets.length>=2&&sp.flags.popukar!==turn){sp.flags.popukar=turn;draw(s,1);if(e)for(const t of targets)FrontierOperatorStatusDictionaryV31.breakStatus(t);touched=true;log('電鋸橫掃 · 抽 1 張')}break;
   case 'operator_v31_vigna':if(ctx.attack&&['先鋒','近衛'].includes(ctx.profession)&&sp.flags.vigna!==turn){sp.flags.vigna=turn;for(const t of targets)for(let i=0;i<v(m.def.val,e);i++)FrontierOperatorStatusDictionaryV31.breakStatus(t);touched=true}break;
   case 'operator_v31_catapult':if(kills.length>=2&&!r.sp175Catapult?.includes(ctx.battleId)){(r.sp175Catapult??=[]).push(ctx.battleId);fieldPoints(v(m.def.val,e),'爆破回收')}break;
   case 'char_172_svrash':if(e&&sp.silverKill===turn&&kills.length)fieldPoints(2*kills.length,'喀蘭號令');break;
   case 'char_377_gdglow':for(const h of hits){const t=s.enemies.find(x=>x.uid===h.target);const st=t?.sp175Static;if(!st)continue;if(st.until<turn||!alive(t)){delete t.sp175Static;touched=true;continue}st.layers++;touched=true;if(st.layers>=st.th){delete t.sp175Static;t.nextAttackDamageReduction=Math.max(t.nextAttackDamageReduction||0,t.boss?.25:.5);log('靜電放電 · '+name(t)+' 下次攻擊減傷');if(st.e===2)gainAP(s,1,'靜電放電 · 返還 1 行動點')}}break;
    case 'operator_v31_lava':for(const h of hits)if(h.damageType==='arts'){const t=s.enemies.find(x=>x.uid===h.target);if(t?.sp175Ignite){t.sp175Burn=(t.sp175Burn||0)+t.sp175Ignite;delete t.sp175Ignite;touched=true;log('引燃 · '+name(t)+' 灼燒')}}break;
   case 'operator_v31_lapluma':{const target=ctx.selection?.target;if(ctx.attack&&target){if(sp.chain?.target===target&&sp.chain.turn===turn)sp.chain.count++;else sp.chain={turn,target,count:1};touched=true}if(actor&&kills.length&&sp.flags.lapluma!==turn){sp.flags.lapluma=turn;heal(actor,m.atk*v(m.def.heal,e));touched=true}break}
   case 'operator_v31_skadi':if(kills.length){sp.skadi=Math.min(3,(sp.skadi||0)+kills.length);touched=true}else if(ctx.attack&&sp.skadi){sp.skadi=0;touched=true}if(sp.skadi)buff(s,{attack:true},sp.skadi*v(m.def.val,e),{group:'sp175-skadi'});else s.cardBuffs=(s.cardBuffs||[]).filter(x=>x.group!=='sp175-skadi');break;
   case 'operator_v31_eyjafjalla':if(ctx.profession==='術師'&&sp.flags.eyja!==turn){sp.flags.eyja=turn;const card=s.hand.filter(c=>professionOf(s,c)==='術師'&&cardInfo(c).cost>0).sort((x,y)=>cardInfo(y).cost-cardInfo(x).cost)[0];if(card)costMod(card,turn,-1);if(e)buff(s,{profession:'術師'},v(m.def.val,e),{group:'sp175-eyja'});touched=true}break;
   case 'char_103_angel':if(ctx.attack&&hits.length>=2&&sp.flags.angel!==turn){const t=targets.find(alive);if(t){sp.flags.angel=turn;G().adapters().damage(s,pseudo(m),t,Math.floor(m.atk*v(m.def.val,e)),'physical',{sourceKind:'support175'});touched=true;log('彈藥補給 · 追加射擊')}}break;
   case 'operator_v31_warfarin':if(actor?.sp175Transfusion?.turn===turn&&kills.length){heal(actor,actor.sp175Transfusion.loss);delete actor.sp175Transfusion;touched=true}break;
   case 'operator_v31_specter':if(actor?.sp175Undying&&kills.length){actor.sp175Undying.killed=true;touched=true}break;
  }}
  if(touched){G().apply(s);if(!checkBattle()){save();render()}}
 }
 function beforePlay(index,selection){
  const b=R()?.battle;if(!b?.sp175)return;const lap=has('operator_v31_lapluma');delete b.sp175.chainBonus;
  if(lap&&b.sp175.chain?.turn===b.turn&&b.sp175.chain.target===selection?.target)b.sp175.chainBonus=v(lap.def.val,lap.e);
 }

 /* ---------- 勝利後 ---------- */
 function victory(team){
  const list=members();if(!list.length)return;const r=R();
  for(const m of list){const e=m.e;switch(m.key){
   case 'operator_v31_cardigan':for(const a of r.team)if(a.hp>0)heal(a,a.max*v(m.def.val,e));log('營養便當 · 出戰幹員恢復');break;
   case 'operator_v31_ansel':{const run=runState();for(const a of r.team){if(a.hp>0||(run.anselUses||0)>=v(m.def.runUses,e))continue;run.anselUses=(run.anselUses||0)+1;a.hp=Math.max(10,Math.floor(a.max*v(m.def.val,e)));a.downed=false;delete a.rescueTimer;log('遠程後送 · '+name(a)+' 歸隊')}break}
   case 'char_272_strong':if(rnd()<v(m.def.val,e))fieldPoints(3,'行商');break;
  }}
  r.hp=r.teamTotal=r.team.reduce((n,a)=>n+a.hp,0);
 }

 /* ---------- 介面 ---------- */
 let hold=null,tip=null;
 function describe(m){const a=m.def.type==='A',st=a?status(m):null;return '<b>'+esc(m.unit?.name)+' · '+esc(m.def.name)+'</b><p>'+(a?'主動 · '+apCost(m)+' 行動點'+(m.def.cd?' · 冷卻 '+m.def.cd+' 回合':'')+(m.def.uses!=null?' · 每場 '+v(m.def.uses,m.e)+' 次':''):'被動')+' · E'+m.e+'</p><p>'+esc(m.def.text(m.e))+'</p>'+(st?.remaining?'<p>冷卻中：還需 '+st.remaining+' 回合</p>':'')+(st&&st.left<=0?'<p>本場次數已用完</p>':'')+'<small>放開即關閉</small>'}
 function rail(){
  const b=R()?.battle,list=members();document.querySelectorAll('.sp175-rail').forEach(x=>x.remove());
  const first=document.querySelector('.team-actor.v113-actor-row');if(!b||!list.length||!first)return;
  const host=first.parentElement;host.classList.add('sp175-host');
  const el=document.createElement('div');el.className='sp175-rail';el.setAttribute('aria-label','支援幹員');
  for(const m of list){const active=m.def.type==='A',st=active?status(m,b):null;const btn=document.createElement('button');btn.type='button';btn.className='sp175-unit '+(active?'is-active':'is-passive');btn.dataset.sp175=m.key;
   const cooling=active&&(st.remaining>0||st.left<=0),img=window.FrontierAppearance80?.src(m.id,'portrait',m.form)||'assets/'+m.unit.image+'.png';
   if(cooling||active&&st.used)btn.classList.add('is-cooling');
   btn.setAttribute('aria-label',m.unit.name+' · '+m.def.name+(active?' · 主動 '+st.cost+' 行動點':' · 被動'));
   let html='<span class="sp175-face"><img src="'+esc(img)+'" alt="" draggable="false"></span>';
   if(active&&st.remaining>0){const deg=Math.round((st.cd-st.remaining)/st.cd*360);html+='<span class="sp175-color" style="--done:'+deg+'deg"><img src="'+esc(img)+'" alt="" draggable="false"></span><span class="sp175-clock"><i class="sp175-hand"></i><i class="sp175-hand" style="transform:rotate('+deg+'deg)"></i></span><b class="sp175-cd">'+st.remaining+'</b>'}
   else if(active&&st.left<=0)html+='<b class="sp175-cd">0</b>';
   else if(active&&st.used)html+='<b class="sp175-cd sp175-used">已用</b>';
   if(active)html+='<em class="sp175-ap'+(st.afford?'':' is-short')+'">'+st.cost+'</em>';else html+='<em class="sp175-passive">被動</em>';
   btn.innerHTML=html;el.append(btn)}
  host.append(el);
 }
 function hide(){if(hold)clearTimeout(hold.timer);hold=null;tip?.remove();tip=null}
 document.addEventListener('pointerdown',e=>{const el=e.target.closest?.('[data-sp175]');if(!el||e.button>0)return;hide();hold={key:el.dataset.sp175,x:e.clientX,y:e.clientY,id:e.pointerId,shown:false};hold.timer=setTimeout(()=>{const m=members().find(x=>x.key===hold?.key);if(!m)return;tip=document.createElement('aside');tip.className='hold-inspection sp175-tip';tip.innerHTML=describe(m);FrontierInspector.attach(tip);hold.shown=true},350)},true);
 document.addEventListener('pointermove',e=>{if(hold&&hold.id===e.pointerId&&Math.hypot(e.clientX-hold.x,e.clientY-hold.y)>12)hide()},true);
 document.addEventListener('pointerup',e=>{if(!hold||hold.id!==e.pointerId)return;const h=hold;hide();if(h.shown)return;const m=members().find(x=>x.key===h.key);if(m?.def.type==='A')cast(m.key)},true);
 document.addEventListener('pointercancel',hide,true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest?.('[data-sp175]'))e.preventDefault()});
 function meter(){const b=R()?.battle,el=document.querySelector('.v113-ap-meter');if(!b||!el)return;el.querySelector('.sp175-next')?.remove();const n=nextBonus(b);if(n>0){const tag=document.createElement('b');tag.className='sp175-next';tag.textContent='+'+n;tag.setAttribute('aria-label','下回合額外行動點 '+n);el.prepend(tag)}}
 function intentExtra(e){const k=has('char_124_kroos'),b=R()?.battle;if(!k||!b||e.hp<=0)return '';const i=b.enemies.indexOf(e),out=[];for(let d=1;d<=(k.e?2:1);d++){const T=b.turn+d,x=e.boss?(T%3===0?'強化':'攻擊'):(T+i)%3===0?'防禦':'攻擊';out.push('+'+d+' '+x)}return ' ｜'+out.join(' ')}

 /* ---------- 安裝 ---------- */
 function install(){
  const g=G();
  const play=g.play;g.play=function(index,selection={}){const b=R()?.battle,card=b?.hand[index],info=cardInfo(card),actor=info&&R().team.find(a=>a.operator===info.owner&&a.form===info.form),meta=card&&actor?g.effects.describe(card.id,g.mastery(actor,card)):null;beforePlay(index,selection);const ctx={before:(b?.enemies||[]).map(e=>({uid:e.uid,hp:e.hp})),eventCount:b?.operatorEvents?.length||0,actor,profession:actor?.profession,attack:!!meta?.attack,aoe:!!meta?.aoe,selection,battleId:b?.operatorBattleId};const out=play.apply(this,arguments);if(R()?.battle?.sp175)delete R().battle.sp175.chainBonus;try{if(card)afterPlay(ctx)}catch(e){console.error(e)}return out};
  const old=cardStats;cardStats=function(c){const d=old(c),m=c?.sp175Cost,b=R()?.battle;if(m&&b&&m.turn===b.turn)d.cost=Math.max(0,d.cost+m.delta);return d};
  const bd=FrontierCurios.beforeDamage;FrontierCurios.beforeDamage=function(t,raw,op,type){const out=bd.apply(this,arguments);return outgoing(t,out??raw,op,type)};
  const em=FrontierCurios.emit;FrontierCurios.emit=function(type,payload){let out=em.apply(this,arguments);if(type==='beforeIncoming'){out=out||payload;incoming(out)}if(type==='break'){const m=has('amiya:guard'),b=R()?.battle;if(m&&b?.sp175&&b.sp175.flags.amiyaGuard!==b.turn){b.sp175.flags.amiyaGuard=b.turn;buff(b,{attack:true},v(m.def.val,m.e),{group:'sp175-amiya-guard'})}}return out};
  const ll=window.FrontierEnemyTactics?.limitLoss;if(window.FrontierEnemyTactics)FrontierEnemyTactics.limitLoss=function(t,loss){const base=ll?ll.apply(this,arguments):loss;return limitLoss(t,base??loss)};
  const inf=FrontierMedicine.inflict;FrontierMedicine.inflict=function(a){if(inflict(a))return;return inf.apply(this,arguments)};
  const act=FrontierRegionalEnemies.action;FrontierRegionalEnemies.action=function(enemy){const out=act.apply(this,arguments);if(out?.splash||out?.hits75>1)enemy.sp175Multi=true;return out};
  const bi=FrontierBreaks.incoming;if(bi)FrontierBreaks.incoming=function(enemy){const out=bi.apply(this,arguments);if(out?.targets>1)enemy.sp175Multi=true;return out};
  const cb=checkBattle;checkBattle=function(){const b=R()?.battle,out=cb.apply(this,arguments);if(b&&!R()?.battle&&b.enemies?.every(e=>e.hp<=0)&&R()&&!R().result){try{victory()}catch(e){console.error(e)}}return out};
  const ui=window.FrontierOperatorUIV113;if(ui?.statusDetails){const sd=ui.statusDetails;ui.statusDetails=function(e){const list=sd.apply(this,arguments)||[],extra=intentExtra(e);return extra?[...list,{text:'偵查射擊（支援）：之後行動'+extra.replace(' ｜','　')}]:list}}
  const rd=render;render=function(){try{turnStart()}catch(e){console.error(e)}track();rd.apply(this,arguments);if(R()?.battle){rail();meter()}};
 }
 install();
 return{skills:S,members,status,cast,nextBonus};
})();
