'use strict';
/* claude97bp：裝備藍圖。每件戰術／探索裝備（綠藍銀金）各一張藍圖。
   來源只有封存箱內容與首領戰勝利；使用後永久在加工站「裝備製造」解鎖該裝備直造配方，
   消耗＝同階鍛造素材與龍門幣的一半（不需鍛造憑證、不抽獎）。已解鎖者移出掉落池。 */
window.FrontierBlueprints=(()=>{
 const F=FrontierForge141,catalog=FrontierInventory.definitions,recipes=FrontierInventory.recipes;
 const sizes={3:{w:1,h:1},4:{w:1,h:2},5:{w:2,h:2},6:{w:3,h:3}};
 /* 箱子規則：依封存箱主題決定能否開出藍圖與類別。醫療、生物（藥品／樣本）不出藍圖；廢棄盒（品質1）不出。 */
 const boxKinds={armory:['tactical'],industrial:['explore'],intelligence:['explore'],relic:['tactical','explore']};
 const boxChance={1:0,2:.04,3:.07,4:.10,5:.14};
 const boxTier={2:[[3,1]],3:[[3,.7],[4,.3]],4:[[4,.6],[5,.35],[6,.05]],5:[[4,.3],[5,.55],[6,.15]]};
 const bossChance=.35,bossTier=[[3,.25],[4,.40],[5,.25],[6,.10]];
 const bpId=eid=>'bp_'+eid,key=eid=>'blueprint.'+eid,recipeId=eid=>'recipe.bp.'+eid;
 const equipment=()=>Object.values(catalog).filter(d=>d.category==='equipment'&&['tactical','explore'].includes(d.equipmentKind)&&F.tiers[d.rarity]&&!d.retired&&!d.retired139&&!d.id.startsWith('AMY-'));
 /* 直造素材：鍛造為同階主材4＋低一階兩種各3（金階一種）＋龍門幣；藍圖取一半（向上取整）。主材固定用該裝備的養成素材系列。 */
 /* 每合成2次輪換一次素材（第 k 輪）：主材沿系列表依序後移，追加材料以 id+k 重新排序，避免長期只吃同一種素材。 */
 const ROTATE=2;
 function materials(d,k=0){const t=d.rarity,fams=F.families.filter(f=>catalog['mat_'+f+'_t'+t]),start=fams.includes(d.upgrade_material_family)?fams.indexOf(d.upgrade_material_family):F.hash(d.id)%fams.length,main=fams[(start+k)%fams.length];const extras=F.families.filter(f=>f!==main&&catalog['mat_'+f+'_t'+(t-1)]).sort((a,b)=>F.hash(d.id+':'+k+':'+a)-F.hash(d.id+':'+k+':'+b)||a.localeCompare(b)).slice(0,t===6?1:2);return [{item:'mat_'+main+'_t'+t,qty:2},...extras.map(f=>({item:'mat_'+f+'_t'+(t-1),qty:2}))]}
 function register(){FrontierInventory.sources['blueprint.drop']={id:'blueprint.drop',name:'封存箱（軍械／工業／情報／遺跡類）與首領戰掉落',system:'blueprint'};
  for(const d of equipment()){const id=bpId(d.id),rid=recipeId(d.id),lmd=F.tiers[d.rarity].lmd/2;
   catalog[id]={id,name:d.name+'・藍圖',category:'blueprint',rarity:d.rarity,blueprintFor:d.id,equipmentKind:d.equipmentKind,description:'在倉庫點擊即可使用：永久於加工站「裝備製造」解鎖「'+d.name+'」直接製作配方（同階鍛造一半素材與龍門幣，不需憑證；每合成2次輪換一次所需素材）。解鎖後此藍圖不再掉落。',effect:{type:'blueprint',item:d.id},sources:['blueprint.drop'],recipe:null,gridSize:{...sizes[d.rarity]},stack:1,rv:[0,0,0,300,900,2400,6000][d.rarity],dropDisabled141:true,balance:{noRecycle:true,blueprint97:true}};
   recipes[rid]={id:rid,output:{item:d.id,qty:1},materials:materials(d),lmd,station:'blueprint',research:key(d.id),level:d.rarity>=5?4:1,byproductRate:0,noByproduct:true};}}
 register();
 const crafted=(s,eid)=>s?.equipment?.blueprintCrafts97?.[eid]||0;
 /* 依存檔中的合成次數，把配方素材同步為目前輪次。 */
 function sync(s=db){for(const d of equipment()){const r=recipes[recipeId(d.id)];if(r)r.materials=materials(d,Math.floor(crafted(s,d.id)/ROTATE))}}
 const BE=FrontierBaseEngine,applyBase=BE.apply;BE.apply=function(input,cmd,c){const r=cmd?.type==='craft'&&recipes[cmd.args?.recipe];if(!r||r.station!=='blueprint'){const out=applyBase.call(this,input,cmd,c);return out}const eid=r.output.item,n=crafted(input,eid),left=ROTATE-n%ROTATE;sync(input);if(input.base151?.lastCommand?.id===cmd.id)return applyBase.call(this,input,cmd,c);if(cmd.args.qty>left)throw Error('此配方每合成'+ROTATE+'次輪換素材，本輪剩 '+left+' 次；請分批製作。');const out=applyBase.call(this,input,cmd,c);out.equipment.blueprintCrafts97={...(out.equipment.blueprintCrafts97||{}),[eid]:n+cmd.args.qty};sync(out);return out};
 const roundLeft=eid=>ROTATE-crafted(db,eid)%ROTATE;
 if(window.FrontierBase151){const ws=FrontierBase151.workshop,rc=FrontierBase151.recipe;FrontierBase151.workshop=function(...a){sync();return ws.apply(this,a)};FrontierBase151.recipe=function(id,q=1){sync();const r=recipes[id];if(r?.station==='blueprint')q=Math.min(Math.max(1,Math.floor(Number(q)||1)),roundLeft(r.output.item));const out=rc.call(this,id,q);if(r?.station==='blueprint'){const m=document.querySelector('#modal [data-base-recipe-id]');m?.insertAdjacentHTML('afterend','<p class="tiny bp97-round">每合成'+ROTATE+'次輪換一次所需素材 · 本輪剩 '+roundLeft(r.output.item)+' 次</p>')}return out}}
 try{sync()}catch{}
 const learned=(s=db)=>new Set((s?.equipment?.research||[]).filter(x=>x.startsWith('blueprint.')).map(x=>x.slice(10)));
 function pool(tier,kind,s=db){const own=learned(s);return equipment().filter(d=>d.rarity===tier&&d.equipmentKind===kind&&!own.has(d.id)).sort((a,b)=>a.id.localeCompare(b.id))}
 const rand=()=>typeof random==='function'?random():Math.random(),weighted=rows=>{let r=rand(),n=0;for(const[v,p]of rows){n+=p;if(r<n)return v}return rows.at(-1)[0]};
 function roll(tier,kinds){const order=kinds.length>1&&rand()<.5?[...kinds].reverse():kinds;for(const kind of order){const list=pool(tier,kind);if(list.length)return bpId(list[Math.floor(rand()*list.length)].id)}return null}
 /* 封存箱：containers.js create() 在內容固定時呼叫。premium＝無燈港末班密櫃（遺跡類，比照品質5）。 */
 function containerRoll(q,kind,premium){const kinds=boxKinds[kind];q=premium?5:q;if(!kinds||!(rand()<(boxChance[q]||0)))return null;const id=roll(weighted(boxTier[q]),kinds);return id?{itemId:id,qty:1}:null}
 function bossRoll(){if(!(rand()<bossChance))return null;return roll(weighted(bossTier),['tactical','explore'])}
 const check=checkBattle;checkBattle=function(){const r=R(),b=r?.battle;let item=null;if(r?.expedition&&b&&b.type==='boss'&&!b.blueprint97&&r.hp>0&&b.enemies.every(e=>e.hp<=0)&&r.contract?.mode!=='simulation'&&r.expedition.mode!=='scout'){b.blueprint97=true;const id=bossRoll();if(id)item=FrontierInventory.create(id,1,{source:'blueprint.boss:'+r.number+':'+r.depth})}const result=check();if(item&&R()===r){r.itemCargo.push(item);save();toast('首領遺留：'+catalog[item.itemId].name+'（須撤離帶回）');render()}return result};
 /* 使用：倉庫點擊 → 消耗藍圖，寫入 equipment.research，加工站自動出現配方。 */
 async function use(id){const d=catalog[id];if(d?.category!=='blueprint')return false;const eq=catalog[d.blueprintFor];const ok=await FrontierRuntime.perform('blueprint97:use',()=>{const i=db.inventory.items.findIndex(x=>x.itemId===id&&!x.locked);if(i<0)throw Error('倉庫中沒有這張藍圖（局內須先撤離帶回）。');const item=db.inventory.items[i];if(item.qty>1)item.qty--;else db.inventory.items.splice(i,1);db.equipment.research??=[];if(db.equipment.research.includes(key(eq.id))){const refund=Math.floor(recipes[recipeId(eq.id)].lmd/2);db.wallet.lmd+=refund;toast('配方已解鎖，重複藍圖回收為 '+refund.toLocaleString()+' 龍門幣');}else{db.equipment.research.push(key(eq.id));toast('已解鎖加工站配方：'+eq.name)}save()});if(ok){closeModal?.();render()}return ok}
 function confirmUse(id){const d=catalog[id];if(!d)return;const eq=catalog[d.blueprintFor],r=recipes[recipeId(eq.id)],have=learned().has(eq.id);modal(d.name,'<div class="bp97-detail">'+FrontierIcons.html(id)+'<p>'+esc97(d.description)+'</p><h4>解鎖後配方</h4><p>'+r.materials.map(m=>esc97(catalog[m.item].name)+' ×'+m.qty).join('、')+'／龍門幣 '+r.lmd.toLocaleString()+(r.level>1?'／加工站 Lv.'+r.level:'')+'</p>'+(have?'<p class="tiny">此配方已解鎖；再使用會回收為 '+Math.floor(r.lmd/2).toLocaleString()+' 龍門幣。</p>':'')+'</div>','<button onclick="closeModal()">返回</button><button class="primary" onclick="FrontierBlueprints.use(\''+id+'\')">'+(have?'回收':'使用藍圖')+'</button>')}
 const esc97=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 /* 倉庫點擊直接進入使用確認。 */
 if(window.FrontierVisualUI){const details=FrontierVisualUI.details;FrontierVisualUI.details=function(id){if(catalog[id]?.category==='blueprint')return confirmUse(id);return details(id)}}
 /* 圖示：沿用裝備圖示加藍圖網格與角標。 */
 const oldIcon=FrontierIcons.html;FrontierIcons.html=function(id,...rest){const d=catalog[id];if(d?.category!=='blueprint')return oldIcon(id,...rest);return oldIcon(d.blueprintFor,...rest).replace('class="item-icon','class="item-icon bp97-icon').replace(/data-item-id="[^"]*"/,'data-item-id="'+id+'"').replace(/aria-label="[^"]*"/,'aria-label="'+esc97(d.name)+'圖示"').replace(/title="[^"]*"/,'title="'+esc97(d.name)+'"')};
 const style=document.createElement('style');style.textContent='.bp97-icon{position:relative;overflow:hidden;background-image:linear-gradient(rgba(150,205,255,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(150,205,255,.22) 1px,transparent 1px),radial-gradient(circle at 50% 45%,#24578f,#0f2b4c 75%)!important;background-size:12.5% 12.5%,12.5% 12.5%,100% 100%!important;outline:1px dashed rgba(200,230,255,.75);outline-offset:-4px}.bp97-icon.rarity-3{box-shadow:inset 0 0 0 2px #8bc34a}.bp97-icon.rarity-4{box-shadow:inset 0 0 0 2px #39a0ff}.bp97-icon.rarity-5{box-shadow:inset 0 0 0 2px #d0d6dc}.bp97-icon.rarity-6{box-shadow:inset 0 0 0 2px #ffc93c}.bp97-icon img{filter:grayscale(1) contrast(1.6) brightness(1.5) drop-shadow(0 0 1px #cfe8ff);mix-blend-mode:screen;opacity:.95}.bp97-icon::after{content:"";position:absolute;inset:14% 14%;border:1px solid rgba(200,230,255,.35);border-radius:50%;pointer-events:none}.bp97-badge{position:absolute;right:2px;bottom:2px;font:700 9px/1 sans-serif;font-style:normal;color:#0f2b4c;background:#cfe8ff;padding:2px 3px;border-radius:2px;transform:rotate(-8deg);pointer-events:none;z-index:1}.bp97-detail .item-icon{width:72px;height:72px}.b602-sec[data-ws-sec="blueprint"] .b602-hint{margin:6px 0}';document.head.append(style);
 return{register,pool,learned,containerRoll,bossRoll,use,confirmUse,materials,bpId,recipeId,boxKinds,boxChance,boxTier,bossChance,bossTier,equipment};
})();
