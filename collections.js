'use strict';
window.FrontierCollections=(()=>{
 const entries=window.FrontierCollectionData,catalog=FrontierInventory.definitions;
 const sizes={5:{w:2,h:2},6:{w:3,h:2},7:{w:3,h:3}},priorSizes={5:{w:3,h:2},6:{w:2,h:2},7:sizes[7]},legacySizes={5:{w:1,h:1},6:{w:1,h:2},7:{w:2,h:2}};
 function size(d,run){if(!d?.collection_id||!run||run.collectionSizeVersion===2)return d?.gridSize;return (run.collectionSizeVersion===1?priorSizes:legacySizes)[d.rarity]}
 const previousStart=startRun;startRun=function(){const before=R();previousStart();if(R()&&R()!==before){R().collectionSizeVersion=2;save()}};
 for(const d of entries){const source='collection.region.'+d.region;FrontierInventory.sources[source]={id:source,name:FrontierExpedition.regions.find(r=>r.id===d.region).name+'：當地作戰、區域首領或收藏封存箱',system:'collection'};catalog[d.id]={...d,category:'collection',set_id:'regional_'+d.region,source_id:source,collection_id:d.id,description:({紀:'首次安全帶回永久登錄紀念；可放入展示櫃，遺失仍保留圖鑑。',研:'首次安全帶回取得研究線索；可保留實體並完成區域研究套組。',貿:'可保留實體紀念，或自願提交一次地區商人委託，換取有限憑證。'})[d.kind],effect:{type:'collection',kind:d.kind,firstResearch:d.rarity-4},sources:[source],recipe:null,gridSize:sizes[d.rarity],stack:1,rv:d.rarity===7?25000:d.rarity===6?7000:1800,balance:{oneTime:true,globalRed:d.rarity===7,tradeGreen:d.rarity===5?12:25,tradeYellow:d.rarity>=6?2:0}}}
 function ensure(){if(!db.collections)db.collections={version:1,archive:{},display:[],trades:{},sets:{}};return db.collections}
 function dropInfo(d){
  const footprint=size(catalog[d.id],page==='run'?R():null);
  return {size:footprint.w+'×'+footprint.h,rarity:{5:'銀階',6:'金階',7:'紅階'}[d.rarity],text:(d.rarity===7?'可從抽中紅階的銀階或金階封存箱取得，沿用紅階掉落上限。':'作戰補給及封存箱抽中對應階級時，與同階物資共用掉落池。')+' 遠征中只出現當地收藏，重複收藏大幅降低抽中機會。'};
 }
 function eligible(d,region){return !d.collection_id||!region||d.region===region}
 function select(choices){
  let d=pick(choices);
  if(d?.collection_id&&window.FrontierTrail?.seenCollection(d.id)&&random()<.96){
   const other=choices.filter(x=>!x.collection_id||!FrontierTrail.seenCollection(x.id));
   if(other.length)d=pick(other);else return null;
  }
  return d;
 }
 function battleSlot(r,tier,families){
  if(r.expedition?.mode!=='standard'||r.contract?.mode==='simulation'||tier<5)return false;
  const materials=families.map(f=>catalog[FrontierProgress.materialId(f,tier)]);
  const d=select([...materials,...entries.filter(x=>x.rarity===tier&&eligible(catalog[x.id],r.expedition.regionId)).map(x=>catalog[x.id])]);
  if(!d?.collection_id)return false;
  (r.itemCargo??=[]).push(FrontierInventory.create(d.id,1,{source:'collection.battle',region:r.expedition.regionId,run:r.number,difficulty:r.expedition.difficulty}));
  return true;
 }
 function scan(){const c=ensure();for(const item of FrontierInventory.ensure().items){const d=catalog[item.itemId];if(!d?.collection_id||c.archive[d.id])continue;c.archive[d.id]={at:Date.now(),region:item.origin.region||d.region,difficulty:item.origin.difficulty||'unknown',uid:item.uid};}for(const region of FrontierExpedition.regions){const set=entries.filter(d=>d.region===region.id&&d.rarity===5);if(!c.sets[region.id]&&set.every(d=>c.archive[d.id])){c.sets[region.id]=Date.now();}}return c}
 const oldDeposit=FrontierEquipment.deposit;FrontierEquipment.deposit=function(instance){oldDeposit(instance);if(catalog[instance.itemId]?.collection_id)scan()};
 function exhibit(uid){const c=scan(),item=db.inventory.items.find(x=>x.uid===uid&&catalog[x.itemId]?.collection_id);if(!item)return;if(c.display.includes(uid))c.display=c.display.filter(x=>x!==uid);else{const limit=2+(db.base151?.hub||1)+(db.doctor.research.includes('gallery90')?1:0);if(c.display.length>=limit){toast('展示位置已滿，可撤下一件或提升指揮中樞。');return}c.display.push(uid);item.locked=true}save();render()}
 function trade(uid){const c=scan(),item=db.inventory.items.find(x=>x.uid===uid),d=item&&catalog[item.itemId];if(!d?.collection_id||d.kind!=='貿'||item.locked||c.trades[d.id]||c.display.includes(uid))return;modal('提交收藏委託？','<p>'+esc(d.name)+' 的這件實體將交付商隊，永久圖鑑仍然保留。此委託每種收藏一生一次。</p>','<button onclick="FrontierCollections.confirmTrade(\''+uid+'\');closeModal()">確認交付</button><button onclick="closeModal()">保留紀念</button>')}
 function confirmTrade(uid){const c=scan(),item=db.inventory.items.find(x=>x.uid===uid),d=item&&catalog[item.itemId];if(!d?.collection_id||d.kind!=='貿'||item.locked||c.trades[d.id]||c.display.includes(uid))return;c.trades[d.id]=Date.now();db.inventory.items=db.inventory.items.filter(x=>x.uid!==uid);db.wallet.green+=Math.floor(d.balance.tradeGreen*(1+(item.tradeMarkup139?.bonus||0)));db.wallet.yellow+=Math.floor(d.balance.tradeYellow*(1+(item.tradeMarkup139?.bonus||0)));save();render()}
 function unlock(uid){const item=db.inventory.items.find(x=>x.uid===uid);if(!item||ensure().display.includes(uid))return;item.locked=!item.locked;save();render()}
 function view(){const c=scan(),items=db.inventory.items.filter(x=>catalog[x.itemId]?.collection_id);return `<div class="eyebrow">ARCHIVE / ${Object.keys(c.archive).length} OF ${entries.length}</div><h1>每次帶回，都留下一段故事。</h1><p class="muted">首次安全帶回永久登錄。收藏實體可遺失、展示或自願交付，圖鑑與首次研究獎勵只結算一次。銀階套組永久記錄完成狀態；舊研究情報與展示資源已退場。</p><section class="panel"><h3>展示櫃 ${c.display.length}/${2+(db.base151?.hub||1)+(db.doctor.research.includes('gallery90')?1:0)}</h3>${c.display.map(uid=>`<p>▣ ${esc(catalog[items.find(i=>i.uid===uid)?.itemId]?.name||'已不存在')} <button onclick="FrontierCollections.exhibit('${uid}')">撤下展示</button></p>`).join('')||'<p>將喜歡的收藏擺上展示櫃。</p>'}</section><h2>持有的收藏</h2>${items.map(i=>{const d=catalog[i.itemId];return `<section class="panel rarity-${d.rarity}"><h3>${d.name}</h3><p>${d.kind} · ${d.gridSize.w}×${d.gridSize.h}</p><button onclick="FrontierCollections.exhibit('${i.uid}')">${c.display.includes(i.uid)?'撤下':'擺放展示'}</button><button onclick="FrontierCollections.unlock('${i.uid}')">${i.locked?'解除保護':'保護收藏'}</button>${d.kind==='貿'?`<button ${i.locked||c.trades[d.id]?'disabled':''} onclick="FrontierCollections.trade('${i.uid}')">一次委託：${Math.floor(d.balance.tradeGreen*(1+(i.tradeMarkup139?.bonus||0)))}綠／${Math.floor(d.balance.tradeYellow*(1+(i.tradeMarkup139?.bonus||0)))}黃</button>`:''}</section>`}).join('')}<h2>區域圖鑑</h2>${FrontierExpedition.regions.map(r=>`<details><summary>${r.name} ${entries.filter(d=>d.region===r.id&&c.archive[d.id]).length}/${entries.filter(d=>d.region===r.id).length}${c.sets[r.id]?' · 銀階套組完成':''}</summary>${entries.filter(d=>d.region===r.id).map(d=>`<article class="panel"><h3>${c.archive[d.id]?'◆':'◇'} ${d.name}</h3><p class="tiny muted">${d.kind} · ${['','','','','','銀','金','紅'][d.rarity]} · ${c.archive[d.id]?new Date(c.archive[d.id].at).toLocaleDateString('zh-TW')+' 首次帶回':'尚未帶回'}</p><button onclick="FrontierInventory.describe('${d.id}')">效果與來源</button></article>`).join('')}</details>`).join('')}`}
 const oldHome=home;home=function(){oldHome();$('#app').innerHTML+='<section class="panel"><h3>收藏館</h3><button onclick="go(\'collections\')">查看收藏與展示</button></section>'};
 const oldRender=render;render=function(){if(page==='collections'){nav();$('#app').innerHTML=view()}else oldRender()};
 const oldValid=validSave;validSave=function(v){if(!oldValid(v))return false;const c=v.collections;if(!c)return true;return c.version===1&&c.archive&&Object.keys(c.archive).every(id=>catalog[id]?.collection_id&&Number.isFinite(c.archive[id].at))&&Array.isArray(c.display)&&new Set(c.display).size===c.display.length&&c.display.every(uid=>v.inventory.items.some(i=>i.uid===uid&&catalog[i.itemId]?.collection_id&&i.locked))&&c.trades&&Object.keys(c.trades).every(id=>catalog[id]?.kind==='貿')};
 ensure();FrontierInventory.validateCatalog();return{entries,ensure,dropInfo,size,eligible,select,battleSlot,scan,exhibit,trade,confirmTrade,unlock,view};
})();
