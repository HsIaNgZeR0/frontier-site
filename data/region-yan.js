'use strict';
/* 第 13 地區「大炎」（claude57）：敵人名冊、單位資料與第四結局設計。
   原作數值與圖像來源：ArknightsGameData enemy_handbook_table / enemy_database、PRTS Spine、ArknightsGameResource 頭像。
   回合卡牌改編：機制轉譯見 regional-yan.js，數值為本作平衡。 */
(()=>{
 const E=window.FrontierEnemyData,RO=window.FrontierRegionalRoster,D=window.FrontierRegionDesign75;if(!E||!RO||!D)return;
 const P='https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/main/enemy/';
 const unit=(id,name,wiki,rarity,stats,o={})=>({name,wiki,kind:'enemy',rarity,image:o.image||id,card:o.ranged?'pierce':'strike',boss:!!o.boss,sourceId:o.source||id,prefab:o.prefab||o.source||id,originalDescription:o.text||'',archetype:o.archetype||(o.ranged?'ranged':stats[2]>=400?'guard':'fighter'),sourceStats:{hp:stats[0],atk:stats[1],def:stats[2],res:stats[3]},captureSize:{w:2,h:2},asset:true,sourceStage:o.stage||'PRTS 敵人圖鑑',ranged:!!o.ranged,portraitSource:P+(o.image||id)+'.png',...(o.frontier75?{frontier75:o.frontier75}:{})});
 const u={
  enemy_1298_ymmonk:unit('enemy_1298_ymmonk','山海眾冒矢者','山海众冒矢者',1,[12000,600,800,35],{text:'身披重甲的山海眾前鋒，頂著箭雨推進。',stage:'將進酒'}),
  enemy_1123_spsbr:unit('enemy_1123_spsbr','「阿咬」','“阿咬”',1,[3000,290,120,10],{text:'受歲相影響化作器倀的雜物，撲咬路過的人。',stage:'畫中人'}),
  enemy_1124_spbow:unit('enemy_1124_spbow','「匕現」','“匕现”',1,[4800,300,240,20],{ranged:true,text:'優先攻擊與自身屬性相反的目標。',stage:'畫中人'}),
  enemy_1195_sfyin:unit('enemy_1195_sfyin','磨礱','磨砻',1,[2000,310,0,20],{text:'被擊倒後散落木製瑞印。',stage:'登臨意'}),
  enemy_2103_dykens:unit('enemy_2103_dykens','平劍客','平剑客',1,[14000,500,400,30],{text:'攜帶便符的劍客，攻擊使目標附著便符，造成法術傷害。',stage:'界園志異'}),
  enemy_2104_dycast:unit('enemy_2104_dycast','靳天師','靳天师',1,[16000,300,150,30],{ranged:true,text:'從超遠距離選擇目標造成法術傷害，並發出便符。',stage:'界園志異'}),
  enemy_10053_cjman:unit('enemy_10053_cjman','丑言','丑言',1,[4300,330,150,0],{ranged:true,text:'以遠程武器攻擊，常在宴席外圍游走。',stage:'相見歡'}),
  enemy_1299_ymkilr:unit('enemy_1299_ymkilr','山海眾頭目','山海众头目',3,[8500,800,250,20],{text:'隱匿；隱匿解除後的下一次攻擊造成更高傷害。',stage:'將進酒'}),
  enemy_1205_sfpin:unit('enemy_1205_sfpin','青花','青花',3,[7000,400,350,50],{ranged:true,text:'數次攻擊後使目標受持續遞增的法術傷害。',stage:'登臨意'}),
  enemy_1209_sfden:unit('enemy_1209_sfden','清明','清明',3,[14000,550,850,20],{ranged:true,text:'每隔一段時間使周圍其他敵人暫時隱匿。',stage:'登臨意'}),
  enemy_10054_cjhot:unit('enemy_10054_cjhot','鼎沸','鼎沸',3,[15000,140,250,60],{ranged:true,text:'持續對周圍造成法術傷害與灼燃損傷。',stage:'相見歡'}),
  enemy_1128_spmage:unit('enemy_1128_spmage','「妒」','“妒”',3,[10000,500,200,60],{ranged:true,text:'蓄力攻擊未被打斷時造成法術傷害並使目標屬性變化。',stage:'畫中人'}),
  enemy_10052_cjshld:unit('enemy_10052_cjshld','「果腹」','“果腹”',3,[5000,550,4000,90],{text:'厚實得難以撼動，卻更容易被攻擊命中要害。',stage:'相見歡'}),
  enemy_1526_sfsui:unit('enemy_1526_sfsui','歲相','岁相',4,[55000,1400,550,30],{boss:true,text:'歲獸陰影，古奧巍峨。三個形態，受來自上下兩側的傷害降低，吸收磷火恢復。',stage:'登臨意'}),
  enemy_1538_ymmons:unit('enemy_1538_ymmons','「睚」','“睚”',4,[65000,600,450,50],{boss:true,ranged:true,text:'巨獸「睚」的代理人，「裁錯春秋」；經過之處生成無念之冬。',stage:'將進酒'}),
  enemy_1550_dhnzzh:unit('enemy_1550_dhnzzh','「祟」','“祟”',4,[40000,3000,4000,80],{boss:true,text:'自甦醒的巨獸之心中誕生的化物；混沌時蛻皮污染田地，化入水中後重生為明識。',stage:'懷黍離'}),
  enemy_1583_suizzh:unit('enemy_1583_suizzh','歲・左爪','岁·左爪',4,[300000,800,2000,60],{boss:true,text:'與歲共享生命；【掩月】高額物理爪擊。',stage:'歲的界園志異'}),
  enemy_1584_suiyzh:unit('enemy_1584_suiyzh','歲・右爪','岁·右爪',4,[300000,800,2000,60],{boss:true,text:'與歲共享生命；【蔽日】高額物理爪擊。',stage:'歲的界園志異'}),
  enemy_1585_suiwei:unit('enemy_1585_suiwei','歲・尾','岁·尾',4,[300000,800,2000,60],{boss:true,text:'與歲共享生命；【天傾地陷】連續戳擊三次。',stage:'歲的界園志異'}),
  enemy_1211_msfsui:unit('enemy_1211_msfsui','磷火','磷火',1,[10,0,0,0],{text:'無法被阻擋；需要多次傷害擊倒（本作3次）；與歲相接觸後使其恢復或為【十方吐納】充能。',stage:'登臨意'}),
  enemy_10172_sheart:unit('enemy_10172_sheart','「未熄」','“未熄”',2,[10000,700,550,20],{text:'被【十方懟怒】引爆後，對周圍造成法術傷害。',stage:'歲的界園志異'}),
  frontier75_yan_emerge:unit('frontier75_yan_emerge','山海眾伏兵','山海众散兵',2,[4500,400,200,20],{image:'enemy_1296_ymknif',source:'enemy_1296_ymknif',stage:'邊境紀行・大炎',text:'首回合自戰場暗處現身，受到的傷害降低60%；偶數回合佔據天災工事，攻擊波及1名額外幹員。',frontier75:{region:'yan',type:'emerge',role:'common'}}),
  frontier75_yan_scholar:unit('frontier75_yan_scholar','墨痕書生','皮书生',2,[13000,350,50,10],{image:'enemy_2102_dytmbr',source:'enemy_2102_dytmbr',stage:'邊境紀行・大炎',text:'首次生命低於50%時吸收便符，恢復25%最大HP；先控制可阻止。',frontier75:{region:'yan',type:'scholar',role:'common'}}),
  frontier75_yan_peeper:unit('frontier75_yan_peeper','山海眾窺魅人','山海众窥魅人',3,[10000,400,200,40],{image:'enemy_1300_ymmir',source:'enemy_1300_ymmir',ranged:true,stage:'邊境紀行・大炎',text:'每兩回合鎖定攻擊最高的幹員並蓄力，可破韌；蓄力命中後攻擊永久＋20%。',frontier75:{region:'yan',type:'peeper',role:'elite'}}),
  frontier75_yan_eight:unit('frontier75_yan_eight','小八界','小八界',3,[25000,500,200,30],{image:'enemy_2125_dylnpp',source:'enemy_2125_dylnpp',stage:'邊境紀行・大炎',text:'近地懸浮；每受到5次傷害，對全隊造成法術傷害並暈眩攻擊最高的幹員一回合。',frontier75:{region:'yan',type:'eight',role:'elite'}}),
  frontier75_yan_fourth:unit('frontier75_yan_fourth','歲','岁',4,[300000,800,1600,50],{image:'enemy_1582_suisho',source:'enemy_1582_suisho',boss:true,ranged:true,stage:'歲的界園志異',text:'大炎最後射落的神明。首、左爪、右爪、尾四部位共享生命並依序施放技能；鎮歲柱可削弱對應部位。',frontier75:{region:'yan',type:'fourth',role:'boss'}}),
  frontier75_yan_mirage:unit('frontier75_yan_mirage','蜃景','“睚”',1,[1,0,0,0],{image:'enemy_1538_ymmons',source:'enemy_1538_ymmons',text:'【春生】留下的蜃景；兩回合內未擊破，「睚」便傳送至此並恢復6%最大HP。'}),
  frontier75_yan_wangjing:unit('frontier75_yan_wangjing','妄境','“睚”',3,[1,0,0,0],{image:'enemy_1538_ymmons',source:'enemy_1538_ymmons',ranged:true,text:'【秋榮】召出的妄境，與「睚」相似；「睚」倒下時消散，妄境被擊破時「睚」失去部分最大生命。'})
 };
 for(const[k,v]of Object.entries(u))E.units[k]=v;
 RO.yan={source:'將進酒 / 登臨意 / 懷黍離 / 歲的界園志異',
  common:['enemy_1298_ymmonk','enemy_1123_spsbr','enemy_1124_spbow','enemy_1195_sfyin','enemy_2103_dykens','enemy_2104_dycast','enemy_10053_cjman'],
  elite:['enemy_1299_ymkilr','enemy_1205_sfpin','enemy_1209_sfden','enemy_10054_cjhot','enemy_1128_spmage','enemy_10052_cjshld'],
  bosses:{normal:{id:'enemy_1526_sfsui',trait:'arts'},fate:{id:'enemy_1538_ymmons',trait:'arts'},exchange:{id:'enemy_1550_dhnzzh',trait:'rush'}}};
 const T=window.FrontierRegionalReinforcementTraits||(window.FrontierRegionalReinforcementTraits={});
 Object.assign(T,{enemy_1298_ymmonk:'armor',enemy_1123_spsbr:'rush',enemy_1124_spbow:'snipe',enemy_1195_sfyin:'debt',enemy_2103_dykens:'arts',enemy_2104_dycast:'artillery',enemy_10053_cjman:'snipe',enemy_1299_ymkilr:'ambush',enemy_1205_sfpin:'burn',enemy_1209_sfden:'veil',enemy_10054_cjhot:'flare',enemy_1128_spmage:'casterChains',enemy_10052_cjshld:'barrier'});
 D.regions.yan={label:'大炎',boss:'歲',bossId:'frontier75_yan_fourth',key:'鎮歲柱拓片',event:'歲陵外的祭場',trial:'重立鎮歲柱',device:'鎮歲柱',mobs:[
  {id:'frontier75_yan_emerge',type:'emerge',role:'common',text:u.frontier75_yan_emerge.originalDescription},
  {id:'frontier75_yan_scholar',type:'scholar',role:'common',text:u.frontier75_yan_scholar.originalDescription},
  {id:'frontier75_yan_peeper',type:'peeper',role:'elite',text:u.frontier75_yan_peeper.originalDescription},
  {id:'frontier75_yan_eight',type:'eight',role:'elite',text:u.frontier75_yan_eight.originalDescription}]};
 for(const m of D.regions.yan.mobs)if(!RO.yan[m.role].includes(m.id))RO.yan[m.role].push(m.id);
 RO.yan.bosses.fourth={id:'frontier75_yan_fourth',trait:'arts'};
 E.pools=Object.fromEntries(Object.entries(RO).map(([id,r])=>[id,[...r.common,...r.elite]]));
 E.bosses=Object.fromEntries(Object.entries(RO).map(([id,r])=>[id,[...new Set(Object.values(r.bosses).map(b=>b.id))]]));
})();
