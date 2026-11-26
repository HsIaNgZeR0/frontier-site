'use strict';
(()=>{

const roomsByKey = [
  [1,2,3,5], [2,3,4,13], [1,2,5,6,11], [7,8,12,18],
  [5,9,10,15,16], [6,7,11,12,17], [3,4,13,14,17,18],
  [9,10,15,16], [11,12,14,17,18], [19,20]
];
const keyUses = [8,8,6,6,5,5,5,3,3,2];
const coreKeys = {
 3:[2],4:[2,7],5:[3,6],6:[3,6],7:[4,6],8:[4],9:[5],10:[5,8],
 11:[6],12:[6,9],13:[7],14:[7],15:[8],16:[8],17:[9],18:[9],19:[10],20:[10]
};
const coreTools={
 3:['T2'],4:['T3'],5:['T3'],6:['T3'],7:['T3'],8:['T3'],9:['T3'],10:['T3','T4'],
 11:['T3'],12:['T4'],13:['T3'],14:['T3']
};
const tools = {
  T1:{level:1, kinds:['mechanical'], alert:4},
  T2:{level:2, kinds:['mechanical','electronic'], alert:3},
  T3:{level:3, kinds:['mechanical','electronic','military'], alert:2},
  T4:{level:4, kinds:['electronic','research'], alert:4}
};

function keyFits(lock, key) {
  if (!Number.isInteger(key) || !keyUses[key-1]) return false;
  if (lock.core) return false;
  return roomsByKey[key-1].includes(lock.room);
}

function toolFits(lock, id) {
  const tool = tools[id];
  if (!tool) return false;
  // 房內核心依容器鎖的類型及等級使用開鎖裝置。
  if (id === 'T4' && (!lock.t4Allowed || lock.level !== 4)) return false;
  return tool.kinds.includes(lock.kind) && lock.level <= tool.level;
}

function breachPlan({lock, inventory, ledger, sector, actions, targets, device, preferred, roll}) {
  if (!['B1','B2'].includes(device) || !inventory.some(i=>i.id===device && i.uses>0)) return null;
  if (ledger.length>=2 || ledger.some(e=>e.sector===sector || e.lock===lock.id)) return null;
  if (device==='B2' && ledger.some(e=>e.device==='B2')) return null;
  if (lock.open || lock.core || lock.required || actions<1 || targets.length<2) return null;
  if (device==='B1' ? !lock.breachable : !lock.precisionBreachable) return null;
  if (!Number.isFinite(roll) || roll<0 || roll>=1) return null;
  const byRarity = [...targets].sort((a,b)=>b.rarity-a.rarity || a.order-b.order);
  let destroyed;
  if (device==='B1') {
    const survivors=roll<.35?1:2;
    destroyed=byRarity.slice(0,Math.max(1,targets.length-survivors));
  } else {
    const chosen=byRarity.find(x=>x.id===preferred);
    if (!chosen) return null;
    const remaining=byRarity.filter(x=>x.id!==preferred);
    const extra=remaining[Math.min(remaining.length-1,Math.floor(roll/.4*remaining.length))];
    destroyed=remaining.length>1&&roll<.4?[chosen,extra]:[chosen];
  }
  return {destroyed:destroyed.map(x=>x.id), intercept:ledger.length===1,
    cost:1, alert:device==='B1'?(ledger.length?40:25):(ledger.length?30:18), receipt:{sector,lock:lock.id,device}};
}

const keyNames=['物流通行證','醫療作業證','工業維護卡','城市情報密鑰','軍規管制授權','研究設施授權','檢疫總監證','黑庫保管密鑰','封存體監管授權','禁忌祭儀信物'];
const catalog=Object.fromEntries(keyNames.map((name,i)=>['K'+String(i+1).padStart(2,'0'),{name,uses:keyUses[i],rarity:[3,3,4,4,5,5,5,6,6,6][i],size:[1,1],key:i+1}]));
for(const [id,name,uses,rarity,size] of [
 ['T1','基礎機械撬鎖器',1,3,[1,1]],['T2','精密電子破解器',2,4,[1,2]],
 ['T3','軍規破譯儀',2,5,[1,2]],['T4','封印協定解碼組',1,6,[2,2]],
 ['B1','爆破藥包',1,4,[1,3]],['B2','定向切割炸藥',1,5,[2,3]],
 ['S1','多功能偵查儀',1,5,[1,1]]
])catalog[id]={name,uses,rarity,size};
const rooms=[["破損物流調度間","貨架","資料單櫃","分類物資箱","保管櫃"],["舊運輸物資庫","運輸堆棧","冷藏櫃","貨品批次箱","裝卸台"],["失效醫療補給站","藥櫃","病歷櫃","消毒台","急救物資箱"],["隔離藥品封存室","冷鏈設備","藥品櫃","備用冷藏箱","封存保險櫃"],["綜合資源回收中心","分類台","停機裝置","材料堆","核心回收機組"],["機械原型工坊","工作台","材料分類櫃","備品箱","原型機組"],["舊城通訊機房","資料終端","通訊箱","備用收發器","檔案櫃"],["地下情報檔案室","文件櫃","黑盒","封存資料匣","主檔案室"],["武裝補給軍械庫","彈藥架","補給箱","備用藥箱","軍規鎖箱"],["前線軍規裝備庫","原型裝備架","重裝箱","維修箱","軍械主櫃"],["源石實驗試驗間","控制台","樣本設備","安全樣本櫃","研究核心"],["封鎖研究資料中心","終端","文件台","封印資料匣","研究主機"],["緊急檢疫庫","醫療容器","消毒台","檢體匣","檢疫核心"],["感染生物觀測室","生物樣本櫃","觀測器","專用保管箱","隔離室"],["黑庫密押保管室","保管架","附屬側櫃","封存物架","三重封鎖箱"],["原型機密軍備室","資料台","備件櫃","實驗裝備箱","機密庫"],["特殊收容管理站","觀測站","研究簿櫃","安全樣本櫃","監管核心"],["禁區監管觀測所","監測台","樣本索引","封存紀錄櫃","監控主機"],["薩卡茲封印祭室","外圍供桌","儲物櫃","安全封存匣","儀式封印"],["失落源石儀式庫","外圍祭壇","石製保管盒","封存匣","深層封印"]];
function roomLock(room,id){
 const level=[1,1,1,2,2,2,2,2,3,3,3,3,2,3,3,3,3,3,4,4][room-1];
 return {id,room,level,name:rooms[room-1]?.[0],targetNames:rooms[room-1]?.slice(1),kind:['mechanical','electronic','military','research'][level-1],
   t4Allowed:level===4,breachable:room<=18,precisionBreachable:room<=18};
}
const structureNames=['','敞口物資','抽屜與封條','機械鎖','電子鎖','軍械鎖','冷鏈封存','工業機組','高級封印'];
const structureGroups=[
 ['clinic_tray'],
 ['field_bandage','mess_tin','courier_wrap','c1'],
 ['workshop_case','c2'],
 ['signal_case','vault_ledger','night_dispatch','c4'],
 ['demolition_case','armory_reserve','sentinel_stock','c3'],
 ['sample_carrier','expedition_cooler','surgeon_case','quarantine_case','special_medicine'],
 ['relay_parts'],
 ['reliquary','deep_sample','black_archive','last_light','c5']
];
const containerStructures=Object.fromEntries(structureGroups.flatMap((group,index)=>group.map(key=>['container_'+key,index+1])));
const structureRules={
 1:{alert:0},2:{alert:1,force:6},3:{alert:1,force:6,kind:'mechanical',level:1},
 4:{alert:1,force:9,kind:'electronic',level:2,clue:true},
 5:{alert:1,force:10,kind:'military',level:3,guard:true},
 6:{alert:1,force:8,kind:'electronic',level:2},
 7:{alert:1,force:10,kind:'mechanical',level:2,guard:true},
 8:{alert:1,kind:'research',level:4,t4Allowed:true,carrySealed:true}
};
function containerRule(itemId){
 const type=containerStructures[itemId]||2;
 return {...structureRules[type],type,name:structureNames[type]};
}
const recipeInput={
 // v604 價格校正：開鎖裝置合成成本 ≈ 點數商店週售價（價值換算：金材300點＝1、銀0.4、藍0.16，1點≈69龍門幣），
 // 用完全部點數的權限獎勵＝成本×1.5（普通）～×3（高危），見 accessBonusValue。
 T1:[1,4000,[['polyester',4,3],['iron',4,2]]],
 T2:[2,5000,[['device',5,1],['sugar',5,1]]],
 T3:[3,6000,[['rma',5,2],['device',6,1]]],
 T4:[4,6000,[['gel',6,2],['rock',5,1]]],
 B1:[2,3000,[['rock',5,1],['grindstone',4,3]]],/* v609 ≈週價 220 */
 B2:[3,5000,[['ketone',5,1],['manganese',5,1],['manganese',4,3]]],/* v609 ≈週價 360 */
 // v605 偵查儀：成本≈點數商店週售價 320（≈1.07 金材）：3000龍門幣＋銀裝置1＋藍酮凝集3。
 S1:[2,5000,[['device',5,1],['ketone',5,1]]]
};
// 房卡 K01–K10 開探索房間；開鎖裝置 T1–T4 開容器；炸藥 B1/B2 無房卡時破門。
function accessKind(id){return id[0]==='K'?'keycard':id[0]==='T'?'lockpick':id[0]==='S'?'scout':'explosive'}
// 商店刷新權重（稀有度 3綠 4藍 5銀 6金）。房卡比同稀有度物品高一階出現：
// 綠卡＝藍物品權重、藍卡＝銀物品、銀卡＝金物品；尚無紅階，金卡為金物品的一半。
const shopTierWeight={3:45,4:30,5:17,6:8};
function keycardWeight(rarity){return rarity>=6?shopTierWeight[6]/2:shopTierWeight[rarity+1]}
// 依稀有度的相對售價：開鎖裝置與炸藥按自身稀有度；房卡按高一階定價，金卡為金階兩倍。
// 綠票基準價（使用者定案）：開鎖裝置／炸藥 50／100／200／400；房卡 100／300／500／1000。
// 其他商店由此換算：尋訪憑證 綠50＝黃5＝點數基準600，故 1黃≈10綠、1綠≈12點數基準。
const greenPrices={tool:{3:50,4:100,5:200,6:400},keycard:{3:100,4:300,5:500,6:1000}};
// v609：綠票價改由點數基準換算（綠票商店多數商品約 1 綠＝1.5 點數基準），黃票沿用 綠÷10×0.8。
function greenPrice(id){return Math.max(5,Math.round(pointBase(id)/1.5/5)*5)}
// 黃票：綠票換算後約 8 折。
function yellowPrice(id){return Math.max(1,Math.round(greenPrice(id)/10*.8))}
// 調查點數基準（之後由點數商店再套每月／每週倍率）。
// 房卡與開鎖裝置在點數商店半價（使用者定案）；炸藥維持原換算。
// v604：房卡／開鎖裝置在點數商店另有定價（基準；每月×1.2、每週再×1.5），與權限獎勵一起校正。炸藥維持原換算。
// v609 炸藥：單次、會毀容器，原價（月1440／2880）高於金房卡，下修到約兩次房卡開門的價格。
const accessPointBase={3:400,4:585,5:800,6:1000,T1:70,T2:170,T3:300,T4:335,S1:170,B1:120,B2:200};
function pointBase(id){return catalog[id].key?accessPointBase[catalog[id].rarity]:accessPointBase[id]}
// v604 點數制：房卡與開鎖裝置改存「點數」，各難度每次開啟消耗不同點數；炸藥仍是次數。
// 點數取 20 的倍數（1／2／4／5 的公倍數），任何難度都能剛好用完、不留零頭。
const accessPoints={3:40,4:40,5:20,6:20,T1:20,T2:20,T3:20,T4:20,S1:20};
const openCosts={normal:1,hard:2,extreme:4,torment:5,highrisk:5};
const bonusRatios={normal:1.5,hard:1.8,extreme:2.2,torment:2.6,highrisk:3};
const difficultyNames={normal:'普通',hard:'困難',extreme:'極限',torment:'折磨',highrisk:'高危'};
function usesPoints(id){return !!catalog[id]&&(!!catalog[id].key||id[0]==='T'||id[0]==='S')}
function maxPoints(id){return usesPoints(id)?accessPoints[catalog[id].key?catalog[id].rarity:id]:catalog[id]?.uses}
function pointsLeft(item){const id=item?.itemId?.slice(10),d=catalog[id];if(!d)return 0;if(!usesPoints(id))return item.searchUses174??d.uses;if(Number.isInteger(item.searchPoints604))return item.searchPoints604;const max=maxPoints(id);return item.searchUses174==null?max:Math.round(item.searchUses174/d.uses*max)}
function difficultyKey(run){const e=run?.expedition;return e?.mode==='highrisk'?'highrisk':openCosts[e?.difficulty]?e.difficulty:'normal'}
function openCost(id,run){return usesPoints(id)?openCosts[difficultyKey(run)]:1}
// v606 素材比價改依合成鏈：月價 藍15／銀120／金205（金＝銀＋4藍＋龍門幣）。金材當量以金材月價為 1。
const GOLD_POINTS=205,SILVER_VALUE=120/205,BLUE_VALUE=15/205;
function neatPrice(n){const base=Math.floor(n/100)*100;return base+[0,20,25,40,50,60,75,80,100].find(x=>base+x>=n)}
function weeklyPrice(id){const m=Math.ceil(pointBase(id)*1.2/5)*5;return neatPrice(m*1.5)}
// 權限獎勵（金材當量）＝本次消耗點數 × 難度倍率 × 每點價值（週售價÷總點數，金材＝300點）。
function accessBonusValue(id,run){if(id[0]!=='T')return 0;const key=difficultyKey(run);return openCosts[key]*bonusRatios[key]*weeklyPrice(id)/GOLD_POINTS/maxPoints(id)}
function shopPrice(id,ladder){const d=catalog[id];return d.key?(d.rarity>=6?ladder[6]*2:ladder[d.rarity+1]):ladder[d.rarity]}
// unit: 0≤u<1 的決定性亂數。回傳在 minRarity 以上依權重抽中的房卡 ID（排除 exclude）。
function pickKeycard(unit,minRarity=3,exclude=[]){
 const pool=Object.keys(catalog).filter(id=>catalog[id].key&&catalog[id].rarity>=minRarity&&!exclude.includes(id));
 const total=pool.reduce((s,id)=>s+keycardWeight(catalog[id].rarity),0);
 let roll=unit*total;
 for(const id of pool){roll-=keycardWeight(catalog[id].rarity);if(roll<0)return id}
 return pool[pool.length-1]||null;
}
// 週／月保底：count 張不重複房卡，其中至少 premium 張達 premiumRarity。
function keycardStock(seedUnit,{count,floor,premium,premiumRarity}){
 const out=[];let i=0;
 while(out.length<count){
  const min=out.length<premium?premiumRarity:floor,id=pickKeycard(seedUnit(i++),min,out);
  if(!id)break;out.push(id);
 }
 return out;
}
function register(definitions,recipes){
 for(const [id,item] of Object.entries(catalog)){
  const key='search174_'+id;
  const kind=accessKind(id);
  definitions[key]={id:key,name:item.name,category:'searchTool',accessKind:kind,rarity:item.rarity,
   description:{
    scout:'偵查裝置：在開門前使用，顯示門後每個容器需要的開鎖裝置等級，讓你判斷要不要開、有沒有帶對裝置。共 '+maxPoints(id)+' 點，每次使用消耗 普通1／困難2／極限4／折磨5／高危5 點。',
    keycard:'房卡：開啟對應的探索房間，容器全數保全（不另給物資）。共 '+maxPoints(id)+' 點，每次開啟消耗 普通1／困難2／極限4／折磨5／高危5 點。',
    lockpick:'開鎖裝置：開啟上鎖的容器並取得權限獎勵素材。共 '+maxPoints(id)+' 點，每次開啟消耗 普通1／困難2／極限4／折磨5／高危5 點。',
    explosive:id==='B1'?'炸藥：沒有房卡時炸開房門。代價：房內只留下 1～2 個容器，優先炸毀較稀有的，警戒 +25（第二次 +40）。':'炸藥：沒有房卡時切開房門。代價：自選 1 個容器犧牲，40% 機率再多損毀 1 個，警戒 +18（第二次 +30）；每局限用一次。'
   }[kind],effect:{type:'searchAccess',id},
   sources:['container.exploration'],recipe:null,gridSize:{w:item.size[0],h:item.size[1]},stack:1,rv:0,dropDisabled141:true};
  if(recipes&&recipeInput[id]){
   const [level,lmd,inputs]=recipeInput[id],recipe="recipe."+key;
   recipes[recipe]={id:recipe,station:"search",level,lmd,research:null,output:{item:key,qty:1},materials:inputs.map(([family,tier,qty])=>({item:"mat_"+family+"_t"+tier,qty}))};
   definitions[key].recipe=recipe;definitions[key].sources.push("recipe:"+recipe);
  }
 }
}
function validateSceneTransition(prior,run){
 const scene=run.event?.searchScene||run.searchGuard174?.searchScene;
 if(!scene)return;
 if(scene.version!==1||!Array.isArray(scene.targets)||scene.targets.length!==4||
    !Number.isInteger(scene.focus)||scene.focus< -1||scene.focus>=4||
    scene.outerOnly174&&scene.focus>0||scene.active!=null&&(!scene.open||scene.active!==scene.focus||scene.active<0))
  throw Error('搜索現場資料不完整。');
 const priorScene=prior?.event?.searchScene||prior?.searchGuard174?.searchScene;
 const sameScene=priorScene&&prior.expedition?.current===run.expedition?.current;
 if(sameScene&&(priorScene.outerOnly174&&!scene.outerOnly174||priorScene.ritualSignal174!==scene.ritualSignal174||priorScene.ritualTaken174&&!scene.ritualTaken174))
   throw Error('已保存的祭儀信號不可改寫。');
 for(const [index,target] of scene.targets.entries()){
  const sealed=target.box?.sealed;
  if(!sealed||!Array.isArray(sealed.contents)||!Array.isArray(sealed.claimed)||
     sealed.contents.length!==sealed.claimed.length||sealed.surfaceOnly&&sealed.revealed>1||
     !['waiting','searched','left','carried','destroyed'].includes(target.status))
    throw Error('容器搜索資料不完整。');
  if(!sameScene)continue;
  const prev=priorScene.targets[index],oldSeal=prev.box.sealed;
  const directed=target.deepFamily?prev.hiddenVariants?.[target.deepFamily]:null;
  if(target.deepFamily&&(!target.deepDone||!directed)||prev.deepDone&&prev.deepFamily!==target.deepFamily)
    throw Error('暗格材料分支不符。');
  const expected=!prev.deepDone&&target.deepDone?[...oldSeal.contents,directed||prev.hiddenReward]:oldSeal.contents;
  if(prev.box.uid!==target.box.uid||prev.box.itemId!==target.box.itemId||
     JSON.stringify(prev.hiddenReward??null)!==JSON.stringify(target.hiddenReward??null)||
     JSON.stringify(prev.hiddenVariants??null)!==JSON.stringify(target.hiddenVariants??null)||
     JSON.stringify(expected)!==JSON.stringify(sealed.contents)||
     oldSeal.claimed.some((claimed,i)=>claimed&&!sealed.claimed[i])||
     prev.objectOpened174&&prev.objectOpened174!==target.objectOpened174||prev.lostCompartment174&&!target.lostCompartment174||
     prev.deepDone&&!target.deepDone||prev.generalDone&&!target.generalDone||prev.quickDone&&!target.quickDone||
     ['carried','destroyed'].includes(prev.status)&&prev.status!==target.status)
    throw Error('已保存的搜索結果不可改寫。');
 }
}
function keyRingLimit(state){
 const research=state?.doctor?.research||[];
 const ranks=state?.talents43?.ranks||{};
 const legacy=research.includes('keyring174seven')?7:research.includes('keyring174six')?6:0;
 return Math.max(legacy,ranks.keyring7?7:ranks.keyring5?5:ranks.keyring3?3:0);
}
function validateTransition(before,next){
 const run=next?.run;
 if(!run)return;
 const keys=run.searchKeys174||[], ledger=run.breachLedger174||[];
 const prior=before?.run?.number===run.number?before.run:null;
 validateSceneTransition(prior,run);
 const source=before||next;
 if(!Array.isArray(keys)||(!prior&&keys.length>keyRingLimit(source))||new Set(keys).size!==keys.length)throw Error('權限卡匣格式無效。');
 const selected=keys.map(uid=>source.inventory?.items?.find(item=>item.uid===uid));
 if(selected.some(item=>!catalog[item?.itemId?.slice(10)]?.key)||new Set(selected.map(item=>item.itemId)).size!==selected.length)throw Error('權限卡匣須放入不同款的真實房卡。');
 if(prior&&JSON.stringify(prior.searchKeys174||[])!==JSON.stringify(keys))throw Error('出發後不可改換權限卡匣。');
 if(!Array.isArray(ledger)||ledger.length>2||new Set(ledger.map(e=>e.sector)).size!==ledger.length||
   ledger.some(e=>!['B1','B2'].includes(e.device)||!Number.isInteger(e.sector)||typeof e.lock!=='string')||
   ledger.filter(e=>e.device==='B2').length>1)throw Error('本局爆破額度不符。');
 if(prior&&JSON.stringify(prior.breachLedger174||[])!==JSON.stringify(ledger.slice(0,(prior.breachLedger174||[]).length)))throw Error('既有爆破操作不可改寫。');
 if(run.alert!=null&&(!Number.isInteger(run.alert)||run.alert<0||run.alert>100))throw Error('警戒數值無效。');
 for(const item of [...(next.inventory?.items||[]),...(run.itemCargo||[])]){
  const def=catalog[item.itemId?.slice(10)];
  if(def&&item.searchUses174!=null&&(!Number.isInteger(item.searchUses174)||item.searchUses174<0||item.searchUses174>def.uses))throw Error('房卡／開鎖裝置／炸藥剩餘次數不符。');
  if(def&&item.searchPoints604!=null&&(!Number.isInteger(item.searchPoints604)||item.searchPoints604<0||item.searchPoints604>maxPoints(item.itemId.slice(10))))throw Error('房卡／開鎖裝置剩餘點數不符。');
 }
}
function rollAccess(tier, ordinaryCount, random){
 const candidates=Object.entries(catalog).filter(([,d])=>(d.key?Math.min(6,d.rarity+1):d.rarity)===tier);
 if(!candidates.length)return null;
 const weight=d=>d.key&&d.rarity===6?.5:1;
 let roll=random()*(ordinaryCount+candidates.reduce((sum,[,d])=>sum+weight(d),0));
 for(const [id,d] of candidates){
  roll-=weight(d);
  if(roll<0)return 'search174_'+id;
 }
 return null;
}
const FrontierSearchLocks174={GOLD_POINTS,SILVER_VALUE,BLUE_VALUE,accessPoints,openCosts,bonusRatios,difficultyNames,usesPoints,maxPoints,pointsLeft,difficultyKey,openCost,weeklyPrice,accessBonusValue,greenPrices,greenPrice,yellowPrice,pointBase,accessKind,shopTierWeight,keycardWeight,shopPrice,pickKeycard,keycardStock,rollAccess,containerRule,keyRingLimit,register,validateTransition,keyFits,toolFits,breachPlan,keyUses,catalog,roomLock,tools};
globalThis.FrontierSearchLocks174=FrontierSearchLocks174;
if (typeof module!=='undefined') module.exports=FrontierSearchLocks174;

})();
