'use strict';
window.FrontierGrid=(()=>{
 let held=null,chosen=null,validationRun=null;
 const current=()=>R()?.grid;

 function qualities(){return db.lootQuality28||[1,2,3,4,5,6,7]}
 function allowed(id){const tier=FrontierInventory.definitions[id]?.rarity;return !tier||qualities().includes(tier)}
 function manual(item){const g=current();if(!g)return;const m=g.manualPickup54??={materials:{},uids:[],relics:{}};if(item.kind==='material')m.materials[item.id]=(R().field.materials[item.id]||0)+(R().secureGrid?.items||[]).filter(i=>i.kind==='material'&&i.id===item.id).reduce((n,i)=>n+i.qty,0)+(item.qty||0);else if(item.kind==='equipment'){if(!m.uids.includes(item.uid))m.uids.push(item.uid)}else if(item.kind==='relic')m.relics[item.id]=(R().bag||[]).filter(id=>id===item.id).length+(R().secureGrid?.items||[]).filter(i=>i.kind==='relic'&&i.id===item.id).length+1;}
 function packedLocked(item){return !!item?.packedLock;}
 function filter(){const r=R(),g=r?.grid;if(!g||r.result)return;g.ground??={};g.groundItems??=[];g.groundRelics??=[];const m=g.manualPickup54||{materials:{},uids:[],relics:{}},remaining={...m.materials},relics={...m.relics},keepPhysical=i=>allowed(i.itemId||i.id)||m.uids.includes(i.uid)||g.items.some(x=>x.uid===i.uid&&packedLocked(x));const lockedMaterials={};for(const i of g.items.filter(packedLocked)){if(i.kind==='material')lockedMaterials[i.id]=(lockedMaterials[i.id]||0)+i.qty;else if(i.kind==='relic')relics[i.id]=Math.max(relics[i.id]||0,g.items.filter(x=>x.id===i.id&&packedLocked(x)).length);}for(const[id,qty]of Object.entries(lockedMaterials))remaining[id]=Math.max(remaining[id]||0,qty);if(r.secureGrid?.items)r.secureGrid.items=r.secureGrid.items.filter(i=>{if(allowed(i.id))return true;if(i.kind==='material'){const keep=Math.min(i.qty,remaining[i.id]||0),drop=i.qty-keep;remaining[i.id]=(remaining[i.id]||0)-keep;if(drop)g.ground[i.id]=(g.ground[i.id]||0)+drop;i.qty=keep;return keep>0}if(i.kind==='equipment'){if(keepPhysical(i))return true;if(!g.groundItems.some(x=>x.uid===i.uid))g.groundItems.push(i.instance)}else if(i.kind==='relic'){if(relics[i.id]>0){relics[i.id]--;return true}g.groundRelics.push(i.id)}else return true;return false});for(const[id,qty]of Object.entries(r.field?.materials||{}))if(qty>0&&!allowed(id)){const keep=Math.min(qty,remaining[id]||0);if(qty>keep)g.ground[id]=(g.ground[id]||0)+qty-keep;r.field.materials[id]=keep;}for(const item of [...r.itemCargo||[]])if(!keepPhysical(item)){if(!g.groundItems.some(i=>i.uid===item.uid))g.groundItems.push(item);r.itemCargo=r.itemCargo.filter(i=>i.uid!==item.uid)}r.bag=r.bag.filter(id=>{if(allowed(id))return true;if(relics[id]>0){relics[id]--;return true}g.groundRelics.push(id);return false});if(r.tools?.locked&&g.items.some(i=>i.uid===r.tools.locked&&!allowed(i.id)&&!m.uids.includes(i.uid)))delete r.tools.locked;g.items=g.items.filter(i=>packedLocked(i)||i.kind==='live'||allowed(i.id)||i.kind==='material'&&(r.field.materials[i.id]||0)>0||i.kind==='equipment'&&m.uids.includes(i.uid)||i.kind==='relic'&&r.bag.includes(i.id));if(g.manualPickup54)for(const id of Object.keys(m.materials))m.materials[id]=(r.field.materials[id]||0)+(r.secureGrid?.items||[]).filter(i=>i.kind==='material'&&i.id===id).reduce((n,i)=>n+i.qty,0)}
 function setQuality(tier,on){const values=new Set(qualities());on?values.add(tier):values.delete(tier);db.lootQuality28=[...values].sort();if(current())delete current().manualPickup54;sync();save();render()}
 function qualityView(){return '<details class="bag-quality28"><summary>品質篩選</summary><div>'+[1,2,3,4,5,6,7].map(t=>'<label><input type="checkbox" '+(qualities().includes(t)?'checked':'')+' onchange="FrontierGrid.setQuality('+t+',this.checked)"><i class="rarity-'+t+'"></i>'+FrontierInventory.qualityNames[t]+'</label>').join('')+'</div></details>'}
 function stackLimit(id,run=validationRun||R()){const base=FrontierInventory.definitions[id]?.stack||10;return window.FrontierExplorer?.stack(id,base,run)??base}
 function shape(item){if(item.kind==='live')return window.FrontierExplorer?.liveShape(item,validationRun||R())||FrontierCapture.units[item.id]?.captureSize||{w:2,h:2};const d=FrontierInventory.definitions[item.id];return window.FrontierCollections?.size(d,validationRun||R())||d?.gridSize||{w:1,h:1}}
 function dimensions(item){const s=shape(item);return item.rotated?{w:s.h,h:s.w}:s}
 function fits(grid,item,x,y,ignore=item.uid,occupied){const zone=item.zone||'main';let mask=zone==='main'?grid.mask:null;if(zone!=='main'&&grid.sidebags){const side=grid.sidebags.find(z=>z.id===zone);if(!side||!side.allowed.includes(item.kind)||side.categories&&!side.categories.includes(FrontierInventory.definitions[item.id]?.category))return false;mask=side.mask;grid={...grid,width:mask[0].length,height:mask.length}}const s=dimensions(item);if(zone!=='main'){const side=grid.sidebags?.find(z=>z.id===zone);if(side?.singleCell139&&s.w*s.h!==1||side?.tradeOnly139&&!((FrontierInventory.definitions[item.id]?.category==='legacyRelic')||(FrontierInventory.definitions[item.id]?.category==='collection'&&FrontierInventory.definitions[item.id]?.kind==='貿')))return false}if(zone==='main'&&grid.blocked?.some(([bx,by])=>bx>=x&&bx<x+s.w&&by>=y&&by<y+s.h))return false;if(mask){for(let row=y;row<y+s.h;row++)for(let col=x;col<x+s.w;col++)if(mask[row]?.[col]!=='#')return false}if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x+s.w>grid.width||y+s.h>grid.height)return false;if(occupied){for(let dy=0;dy<s.h;dy++)for(let dx=0;dx<s.w;dx++)if(occupied.has((y+dy)*grid.width+x+dx))return false;return true}return !grid.items.some(other=>{if(other.uid===ignore||other.x===null||(other.zone||'main')!==zone)return false;const t=dimensions(other);return x<other.x+t.w&&x+s.w>other.x&&y<other.y+t.h&&y+s.h>other.y})}
 function find(grid,item){const zones=[...(grid.sidebags||[]).filter(z=>z.allowed.includes(item.kind)).sort((a,b)=>(a.categories?0:1)-(b.categories?0:1)||a.mask.join('').replaceAll('.','').length-b.mask.join('').replaceAll('.','').length).map(z=>z.id),'main'];for(const zone of zones){const side=grid.sidebags?.find(z=>z.id===zone),width=side?side.mask[0].length:grid.width,height=side?side.mask.length:grid.height;const occupied=new Set(),candidate={...item,zone};
  for(const other of grid.items){
   if(other.uid===item.uid||other.x===null||(other.zone||'main')!==zone)continue;
   const bounds=dimensions(other);
   for(let y=Math.max(0,other.y);y<Math.min(height,other.y+bounds.h);y++)
    for(let x=Math.max(0,other.x);x<Math.min(width,other.x+bounds.w);x++)occupied.add(y*width+x);
  }
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(fits(grid,candidate,x,y,item.uid,occupied))return{x,y,zone}}return null}
 function sync(){filter();window.FrontierExplorer?.syncDevices();const g=current();if(!g)return;const previous=[...g.items].sort((a,b)=>Number(packedLocked(b))-Number(packedLocked(a))),next=[];let used=new Set();const desired=[...R().bag.map(id=>({id,kind:'relic'})),...(R().field?.cargo||[]).map((id,index)=>{const number=R().field.cargo.slice(0,index).filter(x=>x===id).length,instance=R().capturedInstances?.filter(x=>x.species===id)[number];return{id,kind:'live',uid:instance?.uid}}),...(R().itemCargo||[]).map(instance=>({id:instance.itemId,kind:'equipment',uid:instance.uid,qty:1,instance}))];
  for(const wanted of desired){let item=previous.find(x=>!used.has(x.uid)&&(wanted.uid?x.uid===wanted.uid:x.id===wanted.id&&x.kind===wanted.kind));if(item)used.add(item.uid);else item={...wanted,uid:wanted.uid||'grid:'+g.next++,rotated:false,x:null,y:null};next.push(item)}
  for(const [id,total]of Object.entries(R().field?.materials||{})){
    const stacks=previous.filter(x=>x.kind==='material'&&x.id===id).sort((a,b)=>Number(packedLocked(b))-Number(packedLocked(a))).map(x=>({...x}));let remainder=total;
    for(const item of stacks){item.qty=Math.min(item.qty,remainder,stackLimit(id));remainder-=item.qty;if(item.qty>0)next.push(item)}
    for(const item of next.filter(x=>x.kind==='material'&&x.id===id&&!packedLocked(x))){const n=Math.min(stackLimit(id)-item.qty,remainder);item.qty+=n;remainder-=n}
    while(remainder>0){const qty=Math.min(stackLimit(id),remainder);next.push({id,kind:'material',qty,uid:'grid:'+g.next++,rotated:false,x:null,y:null});remainder-=qty}
  }
  g.items=next;g.ground??={};
  for(const item of [...next]){if(item.x!==null&&!fits(g,item,item.x,item.y))item.x=item.y=null;if(item.x===null){const at=find(g,item);if(at)Object.assign(item,at);else if(item.kind==='material'){R().field.materials[item.id]-=item.qty;g.ground[item.id]=(g.ground[item.id]||0)+item.qty;g.items=g.items.filter(x=>x.uid!==item.uid)}else if(item.kind==='equipment'){g.groundItems??=[];if(!g.groundItems.some(x=>x.uid===item.uid))g.groundItems.push(item.instance);R().itemCargo=R().itemCargo.filter(x=>x.uid!==item.uid);g.items=g.items.filter(x=>x.uid!==item.uid)}}}
 }
 function canTake(id,kind='relic',manualPickup=false){if(!manualPickup&&kind!=='live'&&!allowed(id))return false;const g=current();if(!g)return true;sync();return !!find(g,{id,kind,uid:'preview',rotated:false})}
 const oldStart=startRun;startRun=function(){const previous=R();oldStart();if(R()!==previous&&R()&&!R().result){R().grid={version:1,width:6,height:6,next:1,items:[]};sync();render()}};
 const oldCapacity=capacity;capacity=function(){const g=current();return g?(g.mask?g.mask.join('').split('').filter(c=>c==='#').length:g.width*g.height)-(g.blocked?.length||0)+(g.sidebags||[]).reduce((n,z)=>n+z.mask.join('').split('').filter(c=>c==='#').length,0):oldCapacity()};
 const oldSize=bagSize;bagSize=function(){const g=current();if(!g)return oldSize();sync();return g.items.reduce((n,item)=>{const s=shape(item);return n+s.w*s.h},0)};
 const oldTake=takeLoot;takeLoot=function(secure){if(!secure&&R()?.event?.type==='loot'&&!canTake(R().event.id)){toast('找不到可放置的完整空間，請旋轉或整理背包。');return}oldTake(secure)};
 const oldThrow=window.throwAtEnemy;window.throwAtEnemy=function(id,t){if(!canTake(id,'live')){toast('收容需要 2×2 的連續空間。');return}oldThrow(id,t)};
 const oldRecruit=window.recruitTry;window.recruitTry=function(t){if(!canTake(R()?.event?.id,'live')){toast('同行單位需要 2×2 的連續空間。');return}oldRecruit(t)};
 const oldUnsecure=window.unsecureCapture;window.unsecureCapture=function(){if(!canTake(R()?.field?.securedCapture,'live')){toast('需要 2×2 的連續空間。');return}oldUnsecure()};
 const sideShapes={L:['#.','##'],S:['.##','##.'],strip:['###'],verticalStrip:['#','#','#'],curioStrip:['#','#'],square:['##','##']};
 function addSidebag(id,label,shapeName,allowed=['material']){const g=current(),mask=sideShapes[shapeName];if(!g||!mask||g.sidebags?.some(z=>z.id===id))return false;g.sidebags??=[];g.sidebags.push({id,label,mask:[...mask],allowed:[...allowed]});return true}
 function removeSidebag(id){const g=current();if(!g?.sidebags?.some(z=>z.id===id))return true;const before=JSON.parse(JSON.stringify(g));g.sidebags=g.sidebags.filter(z=>z.id!==id);for(const item of g.items.filter(x=>x.zone===id)){item.x=item.y=null;item.zone='main';const at=find(g,item);if(!at){R().grid=before;return false}Object.assign(item,at)}return true}
 function sideViews(g){return (g.sidebags||[]).map(side=>'<h4>'+esc(side.label)+'</h4><p class="tiny muted">限 '+side.allowed.map(x=>({material:'材料',relic:'小型物資',live:'活體'})[x]||x).join('、')+'</p><div class="inventory-grid" data-grid-zone="'+side.id+'" style="--cols:'+side.mask[0].length+';--rows:'+side.mask.length+'">'+side.mask.flatMap((row,y)=>[...row].map((cell,x)=>cell==='#'?'<button class="grid-cell" onclick="FrontierGrid.placeSelected('+x+','+y+',\''+side.id+'\')" style="grid-column:'+(x+1)+';grid-row:'+(y+1)+'"></button>':'')).join('')+g.items.filter(x=>x.zone===side.id&&x.x!==null).map(item=>{const d=dimensions(item);return '<button class="grid-object" data-grid-uid="'+item.uid+'" onclick="FrontierGrid.choose(\''+item.uid+'\')" style="grid-column:'+(item.x+1)+'/span '+d.w+';grid-row:'+(item.y+1)+'/span '+d.h+'">'+face(item)+'</button>'}).join('')+'</div>').join('')}
 function name(item){return (item.kind==='live'?FrontierCapture.units[item.id]?.name:FrontierInventory.definitions[item.id]?.name)+(item.qty?' ×'+item.qty:'')}
 function face(item){const icon=item.kind==='live'?'<img class="bag-live-icon" src="assets/'+esc(FrontierCapture.units[item.id].image)+'.png" alt="'+esc(FrontierCapture.units[item.id].name)+'" loading="lazy">':((item.instance&&FrontierInventory.definitions[item.id]?.category==='searchTool'?window.FrontierIcons?.access(item.instance):window.FrontierIcons?.html(item.id))||'<span aria-hidden="true">◇</span>');return '<span '+(item.kind==='live'?'data-inspect-actor':'data-item-id')+'="'+esc(item.id)+'" class="bag-picture">'+icon+'</span>'+(FrontierInventory.definitions[item.id]?.category==='searchTool'?'':'<span class="bag-item-quantity">'+(item.qty||1)+'</span>')}
 function knownLootValue(run,grid){
  const totals=new Map();
  const departure=run.recoveryDeparture?.refunds;
  const previouslyOwned=new Set((run.recoveryDeparture?.items||[]).map(item=>item.uid));
  for(const item of [...grid.items,...(run.secureGrid?.items||[])]){
   const def=FrontierInventory.definitions[item.id];
   if(item.x==null||item.kind==='live'||!def||def.category==='container'||previouslyOwned.has(item.uid))continue;
   totals.set(item.id,(totals.get(item.id)||0)+(item.qty||1));
  }
  let value=0;
  for(const [id,qty] of totals){
   const def=FrontierInventory.definitions[id];
   const carry=def.category==='medicine'?departure?.['medicine.stock']?.[id]:def.category==='captureDevice'?departure?.['capture.devices']?.[id.replace(/^device_/,'')]:0;
   if(!departure&&['medicine','captureDevice'].includes(def.category))continue;
   value+=Math.max(0,qty-(carry||0))*(def.rv||0);
  }
  return value;
 }
 function view(){const g=current();if(!g)return '';sync();return `<section class="panel grid-panel"><div class="row between"><h3>格子行囊</h3><span class="badge">${g.width}×${g.height} · ${bagSize()}/${capacity()}</span></div><section class="bag-known-rv"><b>本局已知新獲物資總 RV</b><strong>${knownLootValue(R(),g).toLocaleString("zh-TW")}</strong><small>含保險箱。未拆封容器與無法區分的攜入物資未計入。</small></section><p class="tiny muted">拖曳物資拼裝；點選後可旋轉，再點空格放置。活體佔 2×2。舊遠征沿用原容量。</p><div class="inventory-grid" data-grid-zone="main" style="--cols:${g.width};--rows:${g.height}">${Array.from({length:g.width*g.height},(_,i)=>g.mask&&g.mask[Math.floor(i/g.width)]?.[i%g.width]!=='#'?`<span class="grid-hole" style="grid-column:${i%g.width+1};grid-row:${Math.floor(i/g.width)+1}"></span>`:`<button class="grid-cell bag-owner-${g.owners?.[Math.floor(i/g.width)]?.[i%g.width]||0}" data-grid-x="${i%g.width}" data-grid-y="${Math.floor(i/g.width)}" aria-label="背包 ${i%g.width+1},${Math.floor(i/g.width)+1}" onclick="FrontierGrid.placeSelected(${i%g.width},${Math.floor(i/g.width)})" style="grid-column:${i%g.width+1};grid-row:${Math.floor(i/g.width)+1}"></button>`).join('')}${g.items.filter(x=>x.x!==null&&(!x.zone||x.zone==='main')).map(item=>{const d=dimensions(item);return `<button class="grid-object ${chosen===item.uid?'grid-chosen':''} ${item.kind==='live'?'grid-live':''}" data-grid-uid="${item.uid}" onclick="FrontierGrid.choose('${item.uid}')" style="grid-column:${item.x+1}/span ${d.w};grid-row:${item.y+1}/span ${d.h}" aria-label="${esc(name(item))}">${face(item)}</button>`}).join('')}</div>${sideViews(g)}${g.items.some(x=>x.x===null)?'<p class="weather">有物資暫存在溢出保管區；請騰出空間後整理。物品未被刪除。</p>':''}<div class="row"><button onclick="FrontierGrid.rotateSelected()" ${chosen?'':'disabled'}>旋轉選中物品 ↻</button><button onclick="FrontierGrid.sort()">自動整理</button>${chosen?`<button onclick="FrontierGrid.inspect()">查看物品</button><button onclick="FrontierGrid.split()">拆堆</button><button onclick="FrontierGrid.merge()">合堆</button><button onclick="FrontierGrid.drop()">放下</button>${FrontierInventory.definitions[g.items.find(i=>i.uid===chosen)?.id]?.category==='container'?'<button onclick="FrontierContainers.openCarried(FrontierGrid.selected)">開啟選中封存箱</button>':''}`:''}</div>${Object.entries(g.ground||{}).filter(([id,n])=>n>0).map(([id,n])=>`<div class="trade-row"><span>未裝入：${esc(FrontierInventory.definitions[id].name)} ×${n}</span><button onclick="FrontierGrid.takeGround('${id}')">裝入一堆</button></div>`).join('')}<p class="tiny muted">${(g.groundItems||[]).map(item=>`<button onclick="FrontierEquipment.takeGround('${item.uid}')">裝入 ${esc(FrontierInventory.definitions[item.itemId].name)}</button>`).join('')}未裝入的物資不隨撤離結算。材料每堆最多10份，可拆堆、合堆與放下。</p></section>`}
 const oldBag=bagHtml;bagHtml=function(){return view()+oldBag()};
 function choose(uid,redraw=true){chosen=uid;if(redraw)render();}
 function move(uid,x,y,rotated,zone){const g=current(),item=g?.items.find(x=>x.uid===uid);if(!item||packedLocked(item))return false;const preview={...item,rotated:rotated??item.rotated,zone:zone??item.zone??'main'};if(!fits(g,preview,x,y))return false;Object.assign(item,{x,y,rotated:preview.rotated,zone:preview.zone});save();render();return true}
 function placeSelected(x,y,zone='main'){if(!chosen)return;if(!move(chosen,x,y,undefined,zone))toast('此位置放不下，原位置已保留。')}
 function rotateSelected(){const g=current(),item=g?.items.find(x=>x.uid===chosen);if(!item)return;if(!move(item.uid,item.x,item.y,!item.rotated))toast('旋轉後會碰撞或超出背包，請先移動。')}
 function findEither(g,item){
  const placed=find(g,item);if(placed)return {...placed,rotated:item.rotated};
  const dims=shape(item);if(dims.w===dims.h)return null;
  const rotated=!item.rotated,alternate=find(g,{...item,rotated});
  return alternate?{...alternate,rotated}:null;
 }
 function sort(){
  const r=R(),g=current();if(!g||r.result)return;
  sync();
  const fixed=i=>packedLocked(i)||i.uid===r.tools?.locked||i.instance?.locked;
  const merged=new Map();
  for(const item of g.items){
   if(item.kind!=='material'||fixed(item))continue;
   const stacks=merged.get(item.id)||[];
   for(const target of stacks){
    const amount=Math.min(stackLimit(item.id)-target.qty,item.qty);
    target.qty+=amount;item.qty-=amount;
   }
   if(item.qty)stacks.push(item);
   merged.set(item.id,stacks);
  }
  g.items=g.items.filter(i=>i.kind!=='material'||i.qty>0);
  const before=structuredClone(g.items);
  const moving=g.items.filter(i=>!fixed(i)).sort((a,b)=>{
   const x=shape(a),y=shape(b);return y.w*y.h-x.w*x.h;
  });
  g.items=g.items.filter(fixed);
  for(const item of moving){
   const at=findEither(g,item);
   if(!at){g.items=before;break;}
   g.items.push({...item,...at});
  }
  for(const [id,loose] of Object.entries(g.ground||{})){
   if(!loose||!allowed(id))continue;
   let left=loose;
   const limit=stackLimit(id);
   for(const stack of g.items.filter(i=>!fixed(i)&&i.kind==='material'&&i.id===id)){
    const added=Math.min(left,limit-stack.qty);stack.qty+=added;left-=added;
   }
   while(left>0){
    const item={id,kind:'material',uid:'grid:'+g.next,qty:Math.min(limit,left),rotated:false};
    const at=findEither(g,item);if(!at)break;
    g.next++;g.items.push({...item,...at});left-=item.qty;
   }
   g.ground[id]=left;r.field.materials[id]=(r.field.materials[id]||0)+loose-left;
  }
  g.groundItems=(g.groundItems||[]).filter(instance=>{
   const id=instance.itemId;if(!allowed(id))return true;
   const item={id,kind:'equipment',uid:instance.uid,instance,qty:1,rotated:false},at=findEither(g,item);
   if(!at)return true;
   g.items.push({...item,...at});r.itemCargo.push(instance);return false;
  });
  g.groundRelics=(g.groundRelics||[]).filter(id=>{
   if(!allowed(id))return true;
   const item={id,kind:'relic',uid:'grid:'+g.next,rotated:false},at=findEither(g,item);
   if(!at)return true;
   g.next++;g.items.push({...item,...at});r.bag.push(id);return false;
  });
  sync();save();render();
 }
 function toggleLock(uid){const item=current()?.items.find(i=>i.uid===uid&&i.x!==null);if(!item)return false;if(packedLocked(item))delete item.packedLock;else item.packedLock=true;save();render();return true;}
 function split(){const g=current(),item=g?.items.find(x=>x.uid===chosen);if(!item||packedLocked(item)||item.kind!=='material'||item.qty<2){toast('請選擇至少2份的材料堆。');return}const other={...item,uid:'grid:'+g.next,qty:Math.floor(item.qty/2),x:null,y:null};const at=find(g,other);if(!at){toast('需要一個空格才能拆堆。');return}g.next++;item.qty-=other.qty;Object.assign(other,at);g.items.push(other);save();render()}
 function merge(){const g=current(),item=g?.items.find(x=>x.uid===chosen);if(!item||packedLocked(item)||item.kind!=='material')return;const other=g.items.find(x=>x.uid!==item.uid&&!packedLocked(x)&&x.kind==='material'&&x.id===item.id&&item.qty<stackLimit(item.id));if(!other){toast('沒有可合併的同類材料。');return}const qty=Math.min(stackLimit(item.id)-item.qty,other.qty);item.qty+=qty;other.qty-=qty;if(!other.qty)g.items=g.items.filter(x=>x.uid!==other.uid);save();render()}
 function drop(){const g=current(),item=g?.items.find(x=>x.uid===chosen);if(!item)return;if(item.kind==='material'){R().field.materials[item.id]-=item.qty;g.ground[item.id]=(g.ground[item.id]||0)+item.qty;g.items=g.items.filter(x=>x.uid!==item.uid);chosen=null;save();render()}else if(item.kind==='equipment'){g.groundItems??=[];g.groundItems.push(item.instance);R().itemCargo=R().itemCargo.filter(x=>x.uid!==item.uid);g.items=g.items.filter(x=>x.uid!==item.uid);chosen=null;save();render()}else if(item.kind==='relic'){dropItem(R().bag.indexOf(item.id));chosen=null}else{confirmRelease(R().field.cargo.indexOf(item.id));chosen=null}}
 function takeRelic(index){const g=current(),id=g?.groundRelics?.[index];if(!id||!canTake(id,'relic',true))return;manual({kind:'relic',id});g.groundRelics.splice(index,1);R().bag.push(id);sync();save();render()}
 function takeGround(id){const g=current();if(!g)return;sync();const loose=g.ground?.[id]||0,limit=stackLimit(id),space=g.items.filter(i=>i.kind==='material'&&i.id===id).reduce((n,i)=>n+Math.max(0,limit-i.qty),0),slot=find(g,{id,kind:'material',uid:'ground-preview',rotated:false}),qty=Math.min(loose,limit,slot?limit:space);if(!qty){toast(loose?'需要空格或同類未滿堆疊才能拾取。':'此物資已經拾取。');return}manual({kind:'material',id,qty});g.ground[id]-=qty;R().field.materials[id]=(R().field.materials[id]||0)+qty;sync();save();render()}
 function inspect(){const item=current()?.items.find(x=>x.uid===chosen);if(!item)return;if(item.kind!=='live')FrontierInventory.describe(item.id);else modal(name(item),'<p>活體收容物，需佔用連續 2×2 格。成功撤離後正式入庫。</p>','<button onclick="closeModal()">關閉</button>')}
 const priorValid=validSave;validSave=function(v){if(!priorValid(v))return false;if(v.lootQuality28&&(!Array.isArray(v.lootQuality28)||new Set(v.lootQuality28).size!==v.lootQuality28.length||v.lootQuality28.some(t=>!Number.isInteger(t)||t<1||t>7)))return false;const g=v.run?.grid;if(!g)return true;if(g.version!==1||!Number.isInteger(g.width)||g.width<5||g.width>(g.mask?15:7)||!Number.isInteger(g.height)||g.height<5||g.height>(g.mask?15:6)||!Number.isInteger(g.next)||g.next<1||!Array.isArray(g.items))return false;if(g.sidebags&&(!Array.isArray(g.sidebags)||g.sidebags.length>64||g.sidebags.some(z=>typeof z.id!=='string'||typeof z.label!=='string'||!Array.isArray(z.mask)||!Object.values(sideShapes).some(m=>JSON.stringify(m)===JSON.stringify(z.mask))||!Array.isArray(z.allowed)||z.allowed.some(k=>!['material','relic','live','equipment'].includes(k)))))return false;if(g.ground&&Object.entries(g.ground).some(([id,n])=>!FrontierInventory.definitions[id]||!Number.isInteger(n)||n<0))return false;const ids=new Set();for(const item of g.items){if(ids.has(item.uid)||typeof item.uid!=='string'||!['relic','live','material','equipment'].includes(item.kind)||typeof item.rotated!=='boolean'||item.kind!=='live'&&!FrontierInventory.definitions[item.id]||item.kind==='material'&&(!Number.isInteger(item.qty)||item.qty<1||item.qty>stackLimit(item.id,v.run))||item.kind==='live'&&!FrontierCapture.units[item.id])return false;ids.add(item.uid);if(item.x!==null&&!fits(g,item,item.x,item.y))return false}const totals={};for(const item of g.items){const key=item.kind+':'+item.id;totals[key]=(totals[key]||0)+(item.qty||1)}const expected={};for(const key of [...v.run.bag.map(id=>'relic:'+id),...(v.run.field?.cargo||[]).map(id=>'live:'+id),...(v.run.itemCargo||[]).map(x=>'equipment:'+x.itemId)])expected[key]=(expected[key]||0)+1;for(const[id,n]of Object.entries(v.run.field?.materials||{}))if(n)expected['material:'+id]=n;return JSON.stringify(Object.entries(totals).sort())===JSON.stringify(Object.entries(expected).sort())};
 document.addEventListener('pointerdown',e=>{const el=e.target.closest?.('[data-grid-uid]');if(!el||FrontierRuntime.busy||e.button>0)return;const uid=el.dataset.gridUid,item=current()?.items.find(x=>x.uid===uid);if(!item)return;held={uid,el,pointer:e.pointerId,x:e.clientX,y:e.clientY,moving:false};el.setPointerCapture(e.pointerId)}, {passive:false});
 document.addEventListener('pointermove',e=>{if(!held||held.pointer!==e.pointerId)return;if(Math.hypot(e.clientX-held.x,e.clientY-held.y)>8){held.moving=true;held.el.classList.add('grid-dragging');held.el.style.transform=`translate(${e.clientX-held.x}px,${e.clientY-held.y}px)`}},{passive:false});
 document.addEventListener('pointerup',e=>{if(!held||held.pointer!==e.pointerId)return;const h=held;held=null;h.el.style.transform='';h.el.classList.remove('grid-dragging');if(!h.moving)return;const grid=document.elementFromPoint(e.clientX,e.clientY)?.closest('.inventory-grid[data-grid-zone]');if(!grid)return;const r=grid.getBoundingClientRect(),g=current(),zone=grid.dataset.gridZone||'main',side=g.sidebags?.find(z=>z.id===zone),w=side?side.mask[0].length:g.width,height=side?side.mask.length:g.height;const x=Math.floor((e.clientX-r.left)/(r.width/w)),y=Math.floor((e.clientY-r.top)/(r.height/height));FrontierRuntime.perform('grid-move',()=>{if(!move(h.uid,x,y,undefined,zone))toast('放置失敗，物品返回原位。')})});
 document.addEventListener('pointercancel',()=>{if(held){held.el.style.transform='';held.el.classList.remove('grid-dragging');held=null}});
 const validateGrid=validSave;validSave=function(v){const before=validationRun;validationRun=v.run||null;try{return validateGrid(v)}finally{validationRun=before}};
 // 可使用的物資包含背包與保險箱；地面不計入。先消耗背包，再扣保險箱，避免搬移或重複計數。
 function carriedCount(id,run=R()){return Math.max(0,run?.field?.materials?.[id]||0)+(run?.secureGrid?.items||[]).filter(i=>i.kind==='material'&&i.id===id).reduce((n,i)=>n+i.qty,0)}
 function consumeCarried(id,qty=1){const r=R();if(!r||r.result||!Number.isSafeInteger(qty)||qty<1||carriedCount(id,r)<qty)return false;const normal=Math.min(qty,Math.max(0,r.field.materials[id]||0));r.field.materials[id]=(r.field.materials[id]||0)-normal;let left=qty-normal;for(const i of r.secureGrid?.items||[])if(left&&i.kind==='material'&&i.id===id){const n=Math.min(left,i.qty);i.qty-=n;left-=n}if(r.secureGrid)r.secureGrid.items=r.secureGrid.items.filter(i=>i.qty>0);window.FrontierExplorer?.syncDevices();return true}
 return{carriedCount,consumeCarried,packedLocked,toggleLock,manual,takeRelic,allowed,qualities,filter,setQuality,qualityView,shape,dimensions,fits,find,sync,canTake,face,view,choose,move,placeSelected,rotateSelected,sort,inspect,split,merge,drop,takeGround,addSidebag,removeSidebag,sideShapes,get selected(){return chosen}};
})();
