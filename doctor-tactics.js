'use strict';
window.FrontierDoctorTactics=(()=>{
 const groups={draw:'抽牌與牌堆',risk:'應變調度',utility:'戰術支援'};
 const original={recycle:'draw',field_draw:'draw',adrenaline:'utility',brace:'utility',field_guard:'utility',field_silence:'utility',field_break:'utility'};
 const attack=card=>['attack','all'].includes(cardStats(card).kind);
 const personal=card=>cards[card.id]?.owner!=='common'&&!card.generated;
 const support=card=>personal(card)&&!attack(card);
 function from(s,pile,test){
  if(s.hand.length>=10)return 0;
  const index=s[pile].findLastIndex(test);
  if(index<0)return 0;
  s.hand.push(s[pile].splice(index,1)[0]);return 1;
 }
 const filtered=(pile,test)=>(s,draw)=>{
  if(from(s,pile,test))return '已調入手牌';
  draw(1);
  return '無符合卡牌，改抽1張';
 };
 const top=(s,draw)=>{if(s.draw.length>1)s.draw.unshift(s.draw.pop());draw(1)};
 const bottom=(s,draw)=>{if(s.draw.length>1)s.draw.push(s.draw.shift());draw(1)};
 const entries=[
  ['point_attack','火線調閱','draw',0,
   '從抽牌堆調入最靠近頂端的1張幹員攻擊牌；無符合牌時改抽1張。本戰消耗。',
   filtered('draw',c=>personal(c)&&attack(c)),true],
  ['point_support','支援調閱','draw',0,
   '從抽牌堆調入最靠近頂端的1張非攻擊幹員牌；無符合牌時改抽1張。本戰消耗。',
   filtered('draw',support),true],
  ['light_dispatch','輕裝調令','draw',0,
   '從抽牌堆調入最靠近頂端的1張0～1 AP幹員牌；無符合牌時改抽1張。本戰消耗。',
   filtered('draw',c=>personal(c)&&cardStats(c).cost<=1),true],
  ['heavy_dispatch','重裝調令','draw',0,
   '從抽牌堆調入最靠近頂端的1張至少2 AP的幹員牌；無符合牌時改抽1張。本戰消耗。',
   filtered('draw',c=>personal(c)&&cardStats(c).cost>=2),true],
  ['recover_attack','火線回件','draw',1,
   '取回最近棄置的最多2張幹員攻擊牌；不足2張時以抽牌補足。本戰消耗。',
   (s,draw)=>{
    const n=from(s,'discard',c=>personal(c)&&attack(c))+from(s,'discard',c=>personal(c)&&attack(c));
    if(n<2)draw(2-n);
    return '取回'+n+'張攻擊牌';
   },true],
  ['recover_support','支援回件','draw',1,
   '取回最近棄置的最多2張非攻擊幹員牌；不足2張時以抽牌補足。本戰消耗。',
   (s,draw)=>{
    const n=from(s,'discard',support)+from(s,'discard',support);
    if(n<2)draw(2-n);
    return '取回'+n+'張支援牌';
   },true],
  ['top_bypass','情報重整','draw',0,
   '將牌堆頂牌移到底部，再抽1張。本戰消耗。',top,true],
  ['bottom_read','備案啟用','draw',0,
   '將牌堆底牌移到頂部，再抽1張。本戰消耗。',bottom,true],
  ['hand_bottom','重新調度','draw',1,
   '將最早入手的另一張手牌放回牌堆底，再抽3張；沒有其他手牌時直接抽3張。',
   (s,draw)=>{if(s.hand.length)s.draw.unshift(s.hand.shift());draw(3)}],
  ['pair_roles','雙線會報','draw',1,
   '從抽牌堆各調入1張幹員攻擊牌與非攻擊幹員牌；不足2張時以抽牌補足。本戰消耗。',
   (s,draw)=>{
    const n=from(s,'draw',c=>personal(c)&&attack(c))+from(s,'draw',support);
    if(n<2)draw(2-n);
    return '調入'+n+'張指定牌';
   },true],
  ['archive_top','急件回流','draw',0,
   '將最近棄置的1張幹員牌放在抽牌堆頂，再抽1張。本戰消耗。',
   (s,draw)=>{
    const i=s.discard.findLastIndex(personal);
    if(i>=0)s.draw.push(s.discard.splice(i,1)[0]);
    draw(1);
   },true],
  ['next_brief','保留指令','draw',0,
   '最早入手且未標記保留的另一張幹員牌自動保留至下回合，再抽1張；仍受保留上限約束。本戰消耗。',
   (s,draw)=>{
    const c=s.hand.find(card=>personal(card)&&!card.curioRetain&&!card.retain);
    if(c)c.curioRetain=true;
    draw(1);
    return c?'已標記保留':'沒有可標記的牌';
   },true],
  ['refile','牌庫重整','draw',1,
   '將棄牌堆洗回抽牌堆，再抽2張。本戰消耗。',
   (s,draw)=>{
    if(s.discard.length){s.draw=shuffle([...s.draw,...s.discard]);s.discard=[];s.curioShuffleQueued=true}
    draw(2);
   },true],
  ['coin_flip','緊急預案','risk',1,
   '抽2張牌；出牌後其他手牌不超過1張時，改抽3張。本戰消耗。',
   (s,draw)=>draw(s.hand.length<=1?3:2),true],
  ['loaded_case','戰術接續','risk',1,
   '取回最近棄置的1張幹員牌，再抽1張；無幹員棄牌時改抽2張。本戰消耗。',
   (s,draw)=>{const n=from(s,'discard',personal);draw(n?1:2)},true],
  ['roulette','局勢研判','risk',1,
   '抽2張牌；場上至少有3名存活敵人時，改抽3張。本戰消耗。',
   (s,draw)=>draw(s.enemies.filter(e=>e.hp>0&&!e.exited).length>=3?3:2),true],
  ['double_or_fold','餘裕調度','risk',0,
   '抽1張牌；目前至少有3 AP時，額外抽1張。本戰消耗。',
   (s,draw)=>draw(s.energy>=3?2:1),true],
  ['bad_omen','逆境應對','risk',1,
   '抽2張牌；若有存活幹員生命不超過50%，生命比例最低者獲得6護盾。本戰消耗。',
   (s,draw)=>{
    draw(2);
    const ally=s.team.filter(a=>a.hp>0&&!a.exited).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];
    if(ally&&ally.hp/ally.max<=.5)ally.block=(ally.block||0)+60;
   },true],
  ['wash_signal','緊急淨化','utility',1,
   '優先淨化生命比例最低且有可淨化異常的幹員2層，再抽1張；沒有可淨化異常時改抽2張。本戰消耗。',
   (s,draw,enemy,api)=>{
    const allies=s.team.filter(a=>a.hp>0&&!a.exited).sort((a,b)=>a.hp/a.max-b.hp/b.max);
    for(const ally of allies){
     if(api.cleanse(s,ally,ally,2)){draw(1);return '已淨化異常'}
    }
    draw(2);
    return '沒有異常，改抽2張';
   },true],
  ['strip_guard','破障指令','utility',1,
   '指定敵人，移除最多12點現有護盾，再抽1張。',
   (s,draw,enemy)=>{
    const n=Math.min(120,enemy.block||0);
    enemy.block=(enemy.block||0)-n;
    draw(1);
    return '移除'+n+'點護盾';
   },false,true],
  ['delay_signal','壓制指令','utility',1,
   '指定敵人，其下一次一般攻擊的首段傷害降低30%，同牌不疊加；再抽1張。',
   (s,draw,enemy)=>{
    enemy.nextOrdinaryDamageReduction=Math.max(enemy.nextOrdinaryDamageReduction||0,.3);
    draw(1);
   },false,true],
  ['break_signal','破韌指令','utility',1,
   '指定敵人；正在可破韌的蓄力期間時增加2點失衡衝擊並抽1張，否則抽2張。不造成傷害。本戰消耗。',
   (s,draw,enemy)=>{
    if(!enemy.action?.breakWindow||!enemy.action.breakable){draw(2);return '目標未蓄力，改抽2張'}
    enemy.action.breakProgress=Math.min(enemy.action.breakRequired,(enemy.action.breakProgress||0)+2);
    draw(1);
    return '失衡衝擊進度+2';
   },true,true],
  ['capture_probe','收容標定','utility',0,
   '抽1張牌；指定非首領敵人時，其本場下一次收容的基礎成功率增加10個百分點，同牌不疊加。本戰消耗。',
   (s,draw,enemy)=>{
    draw(1);
    if(enemy.boss||enemy.regionBoss)return '首領不受收容標定影響';
    enemy.tacticalCaptureBonus=Math.max(enemy.tacticalCaptureBonus||0,.1);
    return '下次收容機率+10個百分點';
   },true,true]
 ];
 const added=Object.fromEntries(entries.map(([key,name,group,cost,text,play,exhaust=false,target=false])=>['doctor_'+key,{name,group,cost,text,play,exhaust,target}]));
 // The saved-card registry must exist before game.js validates an active raid.
 const registry=window.FrontierTacticsData.cards??={};
 for(const [id,d] of Object.entries(added)){
  const definition={name:d.name,owner:'common',cost:d.cost,text:d.text,kind:d.target?'attack':'draw',exhaust:d.exhaust};
  registry[id]=definition;
  if(typeof cards!=='undefined')cards[id]=definition;
 }
 return {ids:[...Object.keys(original),...Object.keys(added)],groups,group:id=>original[id]||added[id]?.group,play:(id,...args)=>added[id]?.play(...args)};
})();
