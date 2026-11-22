'use strict';
window.FrontierBestiary=(()=>{
 const enemies=FrontierEnemyData.units,regional=FrontierRegionalEnemies,tactics=FrontierEnemyTactics;
 const roles={common:'普通怪',elite:'菁英怪',boss:'首領',special:'特殊'};
 const ranks={normal:'普通',hard:'突襲',extreme:'險境',torment:'磨難'};
 let region='',role='common',viewed=null;
 function catalogue(state){
  const rows=[];
  for(const [area,spec] of Object.entries(regional.roster)){
   for(const tier of ['common','elite'])for(const id of spec[tier])rows.push({area,tier,id});
   for(const id of new Set(Object.values(spec.bosses).map(x=>x.id)))rows.push({area,tier:'boss',id});
  }
  rows.push({area:'columbia',tier:'special',id:tactics.fragment});
  const tracked=new Set(rows.map(x=>x.id));
  const contained=new Set([...Object.keys(state.capture?.research||{}),...(state.capture?.instances||[]).map(x=>x.species),...Object.keys(state.world?.roster||{})]);
  for(const id of contained)if(!tracked.has(id)&&FrontierCapture.units[id]?.kind==='enemy'){
   const area=state.capture?.instances?.find(x=>x.species===id)?.origin?.region;
   const def=FrontierCapture.units[id];rows.push({area:regional.roster[area]?area:'legacy',tier:def.boss?'boss':def.rarity>=3?'elite':'common',id});
  }
  return rows;
 }
 function captured(state,id){return (state.capture?.research?.[id]?.count||0)>0||state.capture?.instances?.some(x=>x.species===id)||(state.world?.roster?.[id]?.copies||0)>0}
 function record(state,run){
  const rank=run?.expedition?.difficulty,b=run?.battle;
  if(!ranks[rank]||!b||run.contract?.mode==='simulation')return;
  for(const e of b.enemies){
   if(e.hp>0||e.captured||e.mechanicRemoved||e.bestiaryRecorded||!FrontierCapture.units[e.species]||!Number.isSafeInteger(e.max)||e.max<1)continue;
   const archive=state.enemyArchive??={},entry=archive[e.species]??={},row=entry[rank]??={min:e.max,max:e.max,damage:[],traits:[],phase:false,formation:false};
   row.min=Math.min(row.min,e.max);row.max=Math.max(row.max,e.max);
   for(const type of [e.tacticsOpeningDamage,e.damageType])if(tactics.tierNames[type]&&!row.damage.includes(type))row.damage.push(type);
   if(regional.traits[e.regionalTrait]&&!row.traits.includes(e.regionalTrait))row.traits.push(e.regionalTrait);
   row.phase||=!!e.tacticsBoss;
   row.formation||=!!b.enemyTacticsVersion&&!e.boss;
   e.bestiaryRecorded=true;
  }
 }
 function portrait(id){
  const d=FrontierCapture.units[id],src=id===tactics.fragment?'planetary-fragment.svg':d.asset?d.image+'.png':null;
  return src?'<img class="enemy-index-art" src="assets/'+esc(src)+'" alt="" loading="lazy">':'<span class="enemy-index-unknown" aria-hidden="true">◇</span>';
 }
 function names(){return Object.fromEntries([...FrontierExpedition.regions.map(x=>[x.id,x.name]),['legacy','舊版收容檔案']])}
 function html(){
  const all=catalogue(db),areas=names(),available=[...new Set(all.map(x=>x.area))];if(!available.includes(region))region=available[0];
  const rows=all.filter(x=>x.area===region&&x.tier===role);
  const controls='<label>地區 <select data-bestiary-region data-native-select="true">'+available.map(id=>'<option value="'+id+'"'+(id===region?' selected':'')+'>'+esc(areas[id])+'</option>').join('')+'</select></label><div class="enemy-index-tabs" role="group" aria-label="敵人分類">'+Object.entries(roles).map(([id,label])=>'<button data-bestiary-role="'+id+'" aria-pressed="'+(id===role)+'">'+label+'</button>').join('')+'</div>';
  return controls+(rows.length?'<div class="enemy-index-grid">'+rows.map(({id})=>{
   const known=!!Object.keys(db.enemyArchive?.[id]||{}).length,hasCapture=captured(db,id),d=FrontierCapture.units[id];
   return '<button class="enemy-index-tile" data-bestiary-enemy="'+id+'" '+(known||hasCapture?'':'disabled')+'>'+ (known?portrait(id):'<span class="enemy-index-unknown" aria-hidden="true">?</span>')+(hasCapture?'<span class="enemy-index-captured">已收容</span>':'')+'<span>'+esc(known?d.name:'未擊敗')+'</span></button>';
  }).join('')+'</div>':'<p class="muted">本區目前沒有此類單位。</p>');
 }
 function detail(id){
  viewed=id;
  const d=FrontierCapture.units[id],data=db.enemyArchive?.[id]||{},known=Object.keys(data).length>0;
  const types=[...new Set(Object.values(data).flatMap(x=>x.damage))].map(x=>tactics.tierNames[x]).filter(Boolean);
  const traitIds=[...new Set(Object.values(data).flatMap(x=>x.traits))];
  const details=traitIds.map(k=>regional.traits[k]).filter(Boolean).map(t=>t.title+'：'+t.text);
  for(const key of new Set(Object.values(data).filter(x=>x.formation).flatMap(x=>x.traits))){const extra=tactics.formationDetail({regionalTrait:key});if(extra)details.push(extra)}
  if(['enemy_1528_manfri','enemy_1524_bldkgt','enemy_1523_mandra','enemy_1532_minima'].includes(id)||Object.values(data).some(x=>x.phase))details.push(tactics.describeBoss(id));
  if(id===tactics.fragment&&known)details.push(tactics.detail({regionalFragment:true}));
  const rows=Object.entries(ranks).map(([rank,label])=>{const hp=data[rank];return '<div><b>'+label+'</b><span>'+(hp?(hp.min===hp.max?hp.min:hp.min+'–'+hp.max)+' HP':'未擊敗')+'</span></div>'}).join('');
  return '<button data-bestiary-back>‹ 返回圖鑑</button><div class="enemy-index-detail">'+(known?portrait(id):'')+'<div><h3>'+esc(known?d.name:'未擊敗的收容單位')+'</h3><p>'+esc(types.join('／')||'傷害類型未記錄')+(captured(db,id)?' · 已收容':'')+'</p></div></div><div class="enemy-index-hp">'+rows+'</div>'+details.filter(Boolean).flatMap(text=>text.split(/\n|。(?=.)/)).map(text=>'<p>'+esc(text)+'</p>').join('')+'<p class="tiny muted">HP 為實際擊敗時記錄的區間。舊版沒有擊敗紀錄的敵人會在下次擊敗後解鎖。</p>';
 }
 function paint(){const host=document.querySelector('.enemy-index');if(host)host.innerHTML=viewed?detail(viewed):html()}
 function open(){
  viewed=null;modal('敵人圖鑑','<section class="enemy-index"></section>','');
  const host=document.querySelector('.enemy-index');
  host.addEventListener('click',event=>{
   const el=event.target.closest?.('[data-bestiary-role],[data-bestiary-enemy],[data-bestiary-back]');
   if(!el)return;
   if(el.dataset.bestiaryRole)role=el.dataset.bestiaryRole;
   viewed=el.dataset.bestiaryEnemy||null;paint();
  });
  host.addEventListener('change',event=>{
   if(!event.target.matches?.('[data-bestiary-region]'))return;
   region=event.target.value;viewed=null;paint();
  });
  paint();
 }
 document.addEventListener('click',event=>{if(event.target.closest?.('[data-home20-bestiary]'))open()});
 const oldStart=startBattle;startBattle=function(...args){const result=oldStart(...args);if(tactics.start(R())){save();render()}return result};
 const oldCheck=checkBattle;checkBattle=function(){
  const run=R(),b=run?.battle;
  if(b){
   for(const e of [...b.enemies])if(e.boss)tactics.afterDamage(e,b,0);
   record(db,run);
   b.enemies=b.enemies.filter(e=>e.hp>0||!e.regionalFragment&&!e.summoned75&&!e.extra75&&!e.device75);
  }
  return oldCheck();
 };
 const oldView=battleView;battleView=function(){
  oldView();
  const battle=R()?.battle;
  for(const button of document.querySelectorAll('.enemy-card')){
   const e=battle?.enemies.find(x=>x.id===button.dataset.enemyId);
   if(e?.regionalFragment){button.classList.add('enemy-fragment');const name=button.querySelector(':scope>b');if(name)name.textContent='星環';}
   if(e?.tacticsBoss){
    const phase=document.createElement('span');phase.className='enemy-phase-label';
    phase.textContent='形態 '+e.tacticsBoss+'／2';button.prepend(phase);
   }
  }
 };
 const oldValid=validSave;validSave=function(v){
  if(!oldValid(v))return false;
  const archive=v.enemyArchive;
  if(archive===undefined)return true;
  const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
  return object(archive)&&Object.entries(archive).every(([id,entry])=>FrontierCapture.units[id]?.kind==='enemy'&&object(entry)&&Object.entries(entry).every(([rank,h])=>Object.hasOwn(ranks,rank)&&object(h)&&Number.isSafeInteger(h.min)&&Number.isSafeInteger(h.max)&&h.min>0&&h.max>=h.min&&Array.isArray(h.damage)&&h.damage.every(x=>Object.hasOwn(tactics.tierNames,x))&&Array.isArray(h.traits)&&h.traits.every(x=>Object.hasOwn(regional.traits,x))&&typeof h.phase==='boolean'&&typeof h.formation==='boolean'));
 };
 return {open,catalogue,record,captured};
})();
