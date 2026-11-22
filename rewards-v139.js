'use strict';
window.FrontierRewards139=(()=>{
 const oldRewardView=rewardView,oldEvent=eventView,E=FrontierEquipmentRegistry139.E;
 const esc139=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const card=(name,text,action,art='')=>'<button class="reward139-option '+(art?'reward139-with-art':'')+'" onclick="'+action+'">'+art+'<b>'+esc139(name)+'</b><span>'+esc139(text)+'</span><i aria-hidden="true">›</i></button>';
 function material(){const r=R(),difficulty=r.expedition?.difficulty||'normal',node=r.expedition?.layers?.[r.expedition.layer]?.rows?.flat().find(n=>n.id===r.expedition.current),type=r.reward?.combatType59||node?.type||'battle',rank=type==='boss'?2:type==='elite'?1:0,weights=({normal:[12,38,38,11,1],hard:[3,20,44,29,4],extreme:[0,5,29,54,12],torment:[0,0,15,60,25]}[difficulty]||[12,38,38,11,1]),roll=random()*100;let at=roll,tier=2;for(let i=0;i<weights.length;i++){at-=weights[i];if(at<0){tier=i+2;break}}tier=Math.min(6,tier+(rank&&random()<.25*rank?1:0));const families=R().focus27?.families||Object.keys(FrontierProgress.families),id=FrontierProgress.materialId(pick(families),tier),qty=tier>=5?1:rank?3:2;r.field.materials[id]=(r.field.materials[id]||0)+qty;FrontierGrid.sync();toast('額外物資：'+FrontierInventory.definitions[id].name+' ×'+qty)}
 function environmentLabel(){const s=FrontierEnvironment.current();if(!s)return'此地沒有可緩解的地區效果';if(s.region==='sargon')return'補充飲水 +'+Math.min(3,6-s.value)+' 層';if(s.region==='siracusa')return'家族敵意 −'+Math.min(2,s.hostility)+' 層、信任 +'+Math.min(1,5-s.trust)+' 層';if(s.region==='victoria')return'支援戰線 +'+Math.min(1,2-s.front)+' 層';if(s.region==='iberia')return s.rulesVersion>=3?'整備航線 · 回到低潮':'平息潮汐 −'+s.value+' 階段';return'緩解'+FrontierEnvironment.definitions[s.region].name+' −'+Math.min(3,s.value)+' 層'}
 const campKey=(r,kind)=>(kind==='module'?'camp:':'camp139:')+r.number+':'+r.expedition?.current;
 function campOffer(r,kind){
  const offers=kind==='module'?r.equipment139?.offers:r.curios?.offers;
  return offers?.find(o=>o.key===campKey(r,kind));
 }
 function campSpent(r,kind){
  const key=campKey(r,kind);
  return kind==='module'?r.equipment139?.claimed?.includes(key):r.curios?.rewards?.[key]?.completed;
 }
 function recoverCamp(){
  const r=R(),e=r?.event,kind=e?.reward139;
  if(e?.type!=='camp'||!['module','curio'].includes(kind)||campOffer(r,kind))return;
  if(campSpent(r,kind)){completeNode();return}
  delete e.reward139;save();render();
 }
 const campPool=['heal','module','environment','currency','curio','cleanse','survey'];
 function campChoices(r){
  const event=r.event;
  if(!event.campChoices139){
   const survey=FrontierSurveyIndex16;
   const seed=r.number+':'+r.expedition?.current;
   const available=campPool.filter(id=>id!=='survey'||r.survey16?.surveyIndex<6);
      const choices=available.sort((a,b)=>survey.hash(seed+':'+a)-survey.hash(seed+':'+b)).slice(0,3+(survey.hash(seed)%2));
   if(FrontierEnvironment.needsRelief()&&!choices.includes('environment'))choices[choices.length-1]='environment';
   event.campChoices139=choices;
  }
  return event.campChoices139;
 }
 function camp(action){
  const r=R();if(r?.event?.type!=='camp'||!r.equipment139||r.event.reward139||!campChoices(r).includes(action))return;
  if(action==='module'||action==='curio'){
   const key=campKey(r,action);
   if(action==='module')FrontierEquipmentUI139.offer(key);
   else FrontierCurios.offer(key);
   if(!campOffer(r,action)){
    toast(campSpent(r,action)?'PRTS｜本處獎勵已處理，請選擇其他休整項目。':
     action==='curio'?'PRTS｜目前沒有可選收藏品，請選擇其他休整項目。':'PRTS｜目前沒有可選模組，請選擇其他休整項目。');
    save();render();return;
   }
   r.event.reward139=action;save();render();return;
  }
  if(action==='survey'){if(!FrontierSurvey16.gain(1,'安全的角落','camp-survey:'+r.expedition.current))return;toast('PRTS｜勘探點數 +1');}else if(action==='heal')for(const a of r.team.filter(a=>a.hp>0))a.hp=Math.min(a.max,a.hp+(globalThis.FrontierEquipmentTuning15?.runCare(r,null,a,FrontierEnvironment.healing(Math.max(1,Math.ceil(a.max*.23))))??FrontierEnvironment.healing(Math.max(1,Math.ceil(a.max*.23)))));else if(action==='environment')FrontierEnvironment.treat();else if(action==='currency'){const n=18+Math.min(12,(r.expedition?.layer||0)*2);r.fieldPoints=(r.fieldPoints||0)+n;toast('取得 '+n+' 源石碇')}else if(action==='cleanse'){const s={turn:r.battle?.turn||0,team:r.team,events:[]};for(const a of r.team){FrontierOperatorStatusDictionaryV31.cleanse(s,a,a,Number.MAX_SAFE_INTEGER);if(a.status)for(const k of Object.keys(a.status))a.status[k]=0;a.statuses=(a.statuses||[]).filter(x=>x.dispellable===false);for(const k of ['poison','bleed','burn','cold','freeze','neural','weak','silence','corrosion','fear','wound','blind'])if(typeof a[k]==='number')a[k]=0}}else return;FrontierCombat.sync();completeNode()}
 function moduleChoice(offer){const r=R(),o=offer||r.equipment139.offers[0];if(!o)return false;$('#app').innerHTML=runHeader()+'<section class="panel reward139-stage"><small>PRTS / FIELD AMPLIFICATION</small><h1>選擇局內增幅模組</h1><p>僅當趟生效，撤離或戰敗都會消失。'+(r.survey16?'新取得可在下場戰鬥前安裝；舊模組在安全角落或層間配置。':'遠征中可隨時安裝。')+'</p><div class="reward139-options">'+o.ids.map(id=>{const d=E.defs[id];return card(d.name,d.description+' · 占用 '+d.occupancy+' 點',"FrontierRewards139.takeModule('"+o.key+"','"+id+"')",FrontierIcons.html(id))}).join('')+'</div></section>';return true}
 function curioChoice(offer){const r=R(),o=offer||r.curios?.offers?.[0];if(!o)return false;$('#app').innerHTML=runHeader()+'<section class="panel reward139-stage"><small>PRTS / TACTICAL CURIOS</small><h1>選擇一項收藏品</h1><p>本場物資已確認。選擇收藏品後繼續戰術獎勵。</p><div class="reward139-options">'+o.ids.map(id=>card(FrontierCurioData.entries?.[id]?.name||FrontierCurioData[id]?.name||id,FrontierCurioData.entries?.[id]?.effect||FrontierCurioData[id]?.effect||'僅本局生效',"FrontierCurios.claim('"+o.key+"','"+id+"')",FrontierCurios.icon(id))).join('')+'</div><button onclick="FrontierCurios.decline(\''+o.key+'\')">放棄本次收藏品</button></section>';return true}
 rewardView=function(){const r=R();if(!r?.equipment139)return oldRewardView();const review=r.reward?.lootReview;if(review&&!review.acknowledged)return oldRewardView();if(r.curios?.offers?.length)return curioChoice();if(r.reward?.strategy?.stage==='module')return moduleChoice();if(r.reward?.strategy?.stage!=='choose')return oldRewardView();const descriptions={cards:['增加卡牌','從已攜帶的三張卡範圍選擇，允許重複加入。'],remove:['移除卡牌','移除一張局內卡牌，返航後重置，至少保留九張。'],module:['選擇局內增幅模組',r.survey16?'從三種模組選一件，可在下場戰鬥前配置新模組。':'從三種模組選一件，遠征中可隨時安裝。'],material:['獲取額外素材','依目前難度與作戰／緊急作戰／首領節點決定品質和數量，仍須裝入背包。'],heal:['恢復幹員生命','每名存活幹員恢復15%最大HP，不復活倒地幹員。']};$('#app').innerHTML=runHeader()+'<section class="panel reward139-stage"><small>PRTS / POST OPERATION</small><h1>戰後整備</h1><p>選擇一項，為下一段探索做準備。</p><div class="reward139-options">'+r.reward.strategy.choices.map(id=>card(...descriptions[id],"FrontierStrategy.choose('"+id+"')")).join('')+'</div></section>'};
 eventView=function(){const r=R();if(!r?.equipment139||r.event?.type!=='camp')return oldEvent();const kind=r.event.reward139;
 if(kind==='module'||kind==='curio'){
  const offer=campOffer(r,kind);
  if(offer)return kind==='module'?moduleChoice(offer):curioChoice(offer);
  const spent=campSpent(r,kind);
  $('#app').innerHTML=runHeader()+'<section class="panel reward139-stage"><h1>安全的角落</h1><p>'+(spent?'本處休整已完成。':'這項休整沒有可選獎勵。')+'</p><button class="primary" onclick="FrontierRewards139.recoverCamp()">'+(spent?'返回路線':'返回休整選項')+'</button></section>';
  return;
 }const rows=[['heal','恢復幹員生命','存活幹員各恢復23%最大HP。'],['module','選擇局內增幅模組','三選一；可在此處安裝或卸下模組。'],['environment',environmentLabel(),'不改變已完成節點或掉落。'],['currency','獲得局內貨幣','取得 '+(18+Math.min(12,(r.expedition?.layer||0)*2))+' 源石碇，可向詭異行商購物。'],['curio','選擇一項收藏品','從三件尚未持有的戰術收藏品中選擇。'],['survey','勘探點數 +1','辨識前方路線，或通過一條橫向捷徑。'],['cleanse','解除全員異常狀態','清除所有可解除的異常；不重置技能代價或劇情限制。']];$('#app').innerHTML=runHeader()+'<section class="panel event-panel reward139-stage"><small>PRTS / SAFE CORNER</small><h1>安全的角落</h1><p>選擇一項休整後繼續。配置模組本身不消耗此處獎勵。</p><button onclick="FrontierEquipmentUI139.manage()">配置增幅模組</button><div class="reward139-options">'+rows.filter(([id])=>campChoices(r).includes(id)).map(([id,name,text])=>card(name,text,"FrontierRewards139.camp('"+id+"')")).join('')+'</div></section>'};
 function takeModule(key,id){FrontierEquipmentUI139.claim(key,id);if(R().reward?.strategy?.stage==='module')FrontierStrategy.finish();else if(R().event?.reward139==='module'&&(key===campKey(R(),'module')||R().event.surveySupply16&&key.startsWith('camp:'+R().event.room16+':')))completeNode()}
 const claim=FrontierCurios.claim;FrontierCurios.claim=function(...args){const camp=R()?.event?.reward139==='curio';claim(...args);if(camp&&!R().curios.offers.length)completeNode()};const decline=FrontierCurios.decline;FrontierCurios.decline=function(...args){const camp=R()?.event?.reward139==='curio';decline(...args);if(camp&&!R().curios.offers.length)completeNode()};

 const oldMerchant=FrontierTrading.fieldMerchant;
 FrontierTrading.fieldMerchant=function(node){
  oldMerchant(node);
  const r=R(),e=r?.event;
  if(!r?.equipment139||e?.type!=='fieldMerchant'||e.rows.some(row=>row.type==='module'))return;
  const slot=e.rows.findLastIndex(row=>row.type==='material');
  const pool=Object.values(E.defs).filter(d=>d.category==='runModule');
  if(slot<0||!pool.length)return;
  const unowned=pool.filter(d=>!r.equipment139.modules.some(m=>m.id===d.id)),choices=unowned.length?unowned:pool;
  const chosen=choices[E.hash([db.rng.seed,r.number,node.id,'module-stock'].join(':'))%choices.length];
  e.rows[slot]={id:e.rows[slot].id,type:'module',item:chosen.id,qty:1,price:18+12*chosen.occupancy};
  save();render();
 };


 let finished139=null;const priorCheck139=checkBattle;checkBattle=function(...args){const prior=finished139;finished139=R()?.battle||null;try{return priorCheck139(...args)}finally{finished139=prior}};
 const make=makeReward;makeReward=function(...args){const r=R(),battle=r?.battle||finished139,battleId=battle?.operatorBattleId,layer=r?.expedition?.layer||0;const result=make(...args);if(r?.reward&&battle)r.reward.combatType59=battle.type;if(!r?.equipment139||!r.reward||!battleId)return result;const f=r.equipment139.flags;f.awardedBattles139??=[];if(f.awardedBattles139.includes(battleId))return result;f.awardedBattles139.push(battleId);f.autoModuleDrops139??=[];const floorKey='floor:'+layer,eliteKey=battle.type==='elite'?'elite:'+f.autoModuleDrops139.filter(x=>x.startsWith('elite:')).length:null,key=!f.autoModuleDrops139.includes(floorKey)?floorKey:eliteKey&&f.autoModuleDrops139.filter(x=>x.startsWith('elite:')).length<2?eliteKey:null;if(key){FrontierEquipmentUI139.offer('automatic:'+r.number+':'+key);const current=R(),o=current.equipment139.offers.find(o=>o.key==='automatic:'+r.number+':'+key);if(o){const id=o.ids[0];FrontierEquipmentUI139.claim(o.key,id);R().reward.moduleDrops139=[id];R().equipment139.flags.autoModuleDrops139.push(key);save();render()}}return result};
 const drawRewards=render;render=function(){drawRewards();const r=R(),review=r?.reward?.lootReview;if(page!=='run'||!r?.equipment139||r.result||!review||review.acknowledged||!r.reward.moduleDrops139?.length)return;const host=document.querySelector('.reward-stage-items');if(host&&!host.querySelector('.module139-drops'))host.insertAdjacentHTML('beforeend','<div class="module139-drops"><p>當趟增幅模組已放入模組包</p>'+r.reward.moduleDrops139.map(id=>'<span>'+FrontierIcons.html(id)+'<b>'+E.defs[id].name+'</b></span>').join('')+'</div>')};
 return{material,environmentLabel,camp,recoverCamp,moduleChoice,curioChoice,takeModule};
})();
