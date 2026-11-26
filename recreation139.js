'use strict';
// Entertainment occupies optional encounter slots only. Graph edits are confined to new runs.
window.FrontierRecreation139=(()=>{
 const data=window.FrontierRecreationData139,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function bounds(layer,lateral=[]){
  let previous=new Map(),normal=new Map();
  for(let row=0;row<layer.rows.length;row++){
   const next=new Map(),plain=new Map();
   for(const node of layer.rows[row]){
    const sources=row===0?[0]:layer.rows[row-1].filter(p=>p.links.includes(node.id)).map(p=>normal.get(p.id)).filter(Number.isFinite);
    if(sources.length)plain.set(node.id,Math.min(...sources)+Number(!!node.recreation139));
    const incoming=row===0?[{min:0,max:0}]:layer.rows[row-1].filter(p=>p.links.includes(node.id)||lateral.some(pair=>pair.includes(p.id)&&layer.rows[row-1].some(a=>pair.includes(a.id)&&a.id!==p.id&&a.links.includes(node.id)))).map(p=>previous.get(p.id)).filter(Boolean);
    if(incoming.length)next.set(node.id,{min:Math.min(...incoming.map(x=>x.min))+Number(!!node.recreation139),max:Math.max(...incoming.map(x=>x.max))+Number(!!node.recreation139)});
   }previous=next;normal=plain;
  }
  const ends=[...previous.values()];return{min:normal.size?Math.min(...normal.values()):Infinity,max:ends.length?Math.max(...ends.map(x=>x.max)):Infinity};
 }
 const allowed=b=>b.max<=2&&(b.max<2||b.min<=1);
 function eligible(r,n){
  const e=r.expedition,s=r.endingRoute,layer=n.layer;
  return n.type==='event'&&!n.storyEvent&&!n.requiredCombat&&!n.passage16&&!n.earlySpecial&&!n.recruitOperator&&!n.escortGoal&&!n.onboardingRescue&&!n.endingMarket75&&!n.routeStory118&&!n.recreation139&&
   ![s?.slots?.[layer],s?.exchangeSlots?.[layer]].includes(n.row)&&!s?.branches?.fourth?.slots?.some(p=>p.layer===layer&&p.row===n.row)&&!r.endingRoute?.fourthReservations?.some?.(p=>p.layer===layer&&p.row===n.row);
 }
 function install(r,random=()=>rnd(1000000)/1000000){
  const e=r?.expedition;if(window.FrontierRecreation139Enabled===false||!e||e.mode!=='standard'||e.recreationVersion139)return false;
  const ids=Object.keys(data).filter(id=>!data[id].regions||data[id].regions.includes(e.regionId)),seen=[];
  for(const layer of e.layers.slice(0,5)){
   const candidates=layer.rows.flat().filter(n=>eligible(r,n)).map(n=>({n,sort:random()})).sort((a,b)=>a.sort-b.sort);
   let added=0;for(const {n}of candidates){if(added>=3)break;const unused=ids.filter(id=>!seen.includes(id)),pool=unused.length?unused:ids;n.recreation139=pool[Math.floor(random()*pool.length)];if(!allowed(bounds(layer,e.lateralRoutes||[]))){delete n.recreation139;continue}seen.push(n.recreation139);added++;}
  }e.recreationVersion139=1;return true;
 }
 for(const [id,d]of Object.entries(data))FrontierAdventure.events[id]={id,title:d.title,choice:'娛樂事件；可以隨時離開。'};
 const kind=FrontierTrail.nodeKind,name=FrontierTrail.nodeName;
 FrontierTrail.nodeKind=n=>n.recreation139&&!FrontierEndings.slot(n)&&kind(n)==='event'?'recreation':kind(n);
 FrontierTrail.nodeName=n=>FrontierTrail.nodeKind(n)==='recreation'?'興致盎然':name(n);
 FrontierNodeAssets.recreation={path:'assets/events139/node-recreation.png'};
 const legend=FrontierScreen.routeLegend;FrontierScreen.routeLegend=function(){legend();document.querySelector('.route-legend-list')?.insertAdjacentHTML('beforeend','<div>'+FrontierTrail.icon('recreation')+'<span>興致盎然 · 可選娛樂與資源交換</span></div>')};
 const start=startRun;startRun=function(){const before=R();start();if(R()&&R()!==before&&install(R())){save();render()}};
 function current(){const r=R(),e=r?.event,f=e?.recreation139,d=data[e?.id];return f&&d?{r,e,f,d}:null}
 const enter=FrontierExpedition.enterNode;FrontierExpedition.enterNode=function(id){
  const r=R(),n=r?.expedition?.layers.flatMap(l=>l.rows.flat()).find(n=>n.id===id);
  if(!n?.recreation139||n.storyEvent||FrontierEndings.slot(n))return enter(id);
  const before=r.event,story=n.storyEvent;let result;
  // Route through the existing fixed-event path: an entertainment visit must not
  // draw and silently mark an ordinary encounter as seen before replacing it.
  n.storyEvent=n.recreation139;
  try{result=enter(id)}finally{if(story)n.storyEvent=story;else delete n.storyEvent}
  if(R()?.event!==before&&R()?.event?.type==='frontierEvent'&&R().event.id===n.recreation139){R().event={type:'frontierEvent',id:n.recreation139,claimed:false,recreation139:{version:1,phase:'choose',attempts:0,key:'recreation139:'+r.number+':'+id,rolls:Array.from({length:3},()=>rnd(100))}};save();render()}
  return result;
 };
 function options(c=current()){
  if(!c)return[];const{r,f,d}=c;
  if(f.phase==='offer')return r.curios?.offers?.some(o=>o.key===f.key+':gift')?[]:[{id:'finish',name:'繼續前進',effect:'奇物選擇已處理，返回路線圖。',hint:'leave'}];
  if(f.phase==='result')return[{id:'finish',name:'繼續前進',effect:'返回路線圖；本次結果已保存，不會重新抽取。',hint:'leave'}];
  const env=FrontierEnvironment.current(),pressureAllowed=n=>env.region==='sargon'?env.value>=n:env.region==='siracusa'?env.hostility+n<=5:env.region==='victoria'?env.front-n>=-1:env.value+n<=FrontierEnvironment.definitions[env.region].max;
  const pressureText=n=>env.region==='sargon'?'飲水補給 −'+n:env.region==='siracusa'?'敵意 +'+n:env.region==='victoria'?'戰線後退 '+n:FrontierEnvironment.definitions[env.region].name+' +'+n;
  const rows=d.options.map(o=>({...o,effect:o.pressure?pressureText(o.pressure)+'；從兩件奇物中選一件。無法完整支付地區代價時不能選。':o.effect,disabled:f.attempts>=d.limit||r.fieldPoints<(o.cost||0)||(o.survey||0)>(r.survey16?.surveyIndex||0)||o.hp&&r.team.filter(a=>a.hp>0).some(a=>a.hp<=Math.ceil(a.max*o.hp))||o.pressure&&!pressureAllowed(o.pressure)}));
  rows.push({id:'leave',name:'離開這裡',effect:'不再參與；保留已取得的結果。',hint:'leave'});return rows;
 }
 function resolve(text){const{e,f}=current();e.claimed=true;f.phase='result';f.result=text;FrontierGrid.sync();FrontierCombat.sync();save();render()}
 function choose(id){const c=current();if(!c)return false;const{r,e,f,d}=c;
  if(id==='finish'&&(f.phase==='result'||f.phase==='offer'&&!r.curios?.offers?.some(o=>o.key===f.key+':gift'))){FrontierAdventure.note(e.id,d.title+'：'+f.result);completeNode();return true}
  const o=options(c).find(o=>o.id===id&&!o.disabled);if(!o)return false;
  if(id==='leave'){resolve(f.last||'小隊沒有繼續參與，收拾行裝離開了。');return true}
  const roll=f.rolls[f.attempts++];r.fieldPoints-=o.cost||0;
  if(o.survey)FrontierSurvey16.gain(-o.survey,d.title,f.key+':cost:'+f.attempts);
  if(o.hp)for(const a of r.team.filter(a=>a.hp>0))a.hp-=Math.ceil(a.max*o.hp);
  if(o.pressure)FrontierCurios.environmentCost(o.pressure);
  const outcome=o.outcomes.find(x=>roll<x.until),parts=[];
  if(o.cost)parts.push('消耗 '+o.cost+' 源石碇');if(o.survey)parts.push('消耗 '+o.survey+' 勘探點數');if(o.hp)parts.push('存活隊員各失去 '+Math.round(o.hp*100)+'% 最大 HP');if(o.pressure)parts.push(o.effect.split('；')[0]);
  if(outcome.coins){r.fieldPoints+=outcome.coins;parts.push('獲得 '+outcome.coins+' 源石碇')}
  if(outcome.heal){for(const a of r.team.filter(a=>a.hp>0))a.hp=Math.min(a.max,a.hp+FrontierEnvironment.healing(Math.ceil(a.max*outcome.heal)));parts.push('存活隊員恢復 '+Math.round(outcome.heal*100)+'% 最大 HP（受地區治療效果影響）')}
  if(outcome.survey){const before=r.survey16.surveyIndex;FrontierSurvey16.gain(outcome.survey,d.title,f.key+':survey:'+f.attempts);parts.push('勘探點數 +'+(r.survey16.surveyIndex-before))}
  if(outcome.gift){const key=f.key+':gift';FrontierCurios.offer(key,2);if(r.curios.offers?.some(x=>x.key===key)){f.phase='offer';e.claimed=true;f.result=parts.join('；')+'；選擇一件戰術奇物。';save();render();return true}r.fieldPoints+=3;parts.push('奇物已無可用候選，改得 3 源石碇')}
  if(!outcome.coins&&!outcome.heal&&!outcome.survey&&!outcome.gift)parts.push('這次沒有得到回報');
  f.last=parts.join('；')+'。';if(f.attempts>=d.limit){resolve(f.last);return true}save();render();return true;
 }
 function take(id){const c=current();if(!c||c.f.phase!=='offer')return false;const key=c.f.key+':gift',offer=c.r.curios.offers?.find(o=>o.key===key);if(!offer||id!=='skip'&&!offer.ids.includes(id))return false;if(id==='skip')FrontierCurios.decline(key);else FrontierCurios.claim(key,id);resolve(id==='skip'?'放棄了奇物；支付的代價不退還。':'取得戰術奇物「'+FrontierCurioData.forRun(R())[id].name+'」。');return true}
 const view=eventView;eventView=function(){const c=current();if(!c)return view();const{r,f,d}=c;let html=options(c).map(o=>'<button '+(o.disabled?'disabled ':'')+'data-familiar-hint="'+(o.hint||'unknown')+'" onclick="FrontierRecreation139.choose(\''+o.id+'\')"><b>'+esc(o.name)+'</b><small>'+esc(o.effect)+'</small></button>').join('');if(f.phase==='offer'&&r.curios?.offers?.some(o=>o.key===f.key+':gift')){const offer=r.curios.offers?.find(x=>x.key===f.key+':gift');html=(offer?.ids||[]).map(id=>'<button data-curio="'+id+'" data-familiar-hint="relic" onclick="FrontierRecreation139.take(\''+id+'\')">'+FrontierCurios.icon(id)+'<b>'+esc(FrontierCurioData.forRun(r)[id].name)+'</b><small>'+esc(FrontierCurioData.forRun(r)[id].effect.length>70?FrontierCurioData.forRun(r)[id].effect.slice(0,65)+'…（長按查看）':FrontierCurioData.forRun(r)[id].effect)+'</small></button>').join('')+'<button data-familiar-hint="leave" onclick="FrontierRecreation139.take(\'skip\')"><b>放棄奇物</b><small>已支付的代價不退還。</small></button>';}document.getElementById('app').innerHTML=runHeader()+'<section class="panel event-panel"><small>興致盎然 · '+(f.attempts+'／'+d.limit)+'</small><h2>'+esc(d.title)+'</h2><p>'+esc(f.phase==='offer'&&!r.curios?.offers?.some(o=>o.key===f.key+':gift')?'本次奇物選擇已處理，可以繼續前進。':f.phase==='result'||f.phase==='offer'?f.result:d.body+(f.last?' '+f.last:''))+'</p><div class="row">'+html+'</div></section>'+bagHtml()};
 const valid=validSave;validSave=function(v){if(!valid(v))return false;const r=v.run,e=r?.expedition,f=r?.event?.recreation139;if(e?.recreationVersion139!==undefined&&e.recreationVersion139!==1)return false;if(e?.layers.some(l=>l.rows.flat().some(n=>n.recreation139&&(!data[n.recreation139]||n.type!=='event'))))return false;if(!f)return true;const d=data[r.event.id];return !!d&&f.version===1&&['choose','offer','result'].includes(f.phase)&&Number.isInteger(f.attempts)&&f.attempts>=0&&f.attempts<=d.limit&&Array.isArray(f.rolls)&&f.rolls.length===3&&f.rolls.every(n=>Number.isInteger(n)&&n>=0&&n<100)&&typeof f.key==='string'&&f.key.length<200&&(!f.last||typeof f.last==='string'&&f.last.length<400)&&(!f.result||typeof f.result==='string'&&f.result.length<400)&&(['offer','result'].includes(f.phase)===r.event.claimed)};
 return{data,bounds,allowed,eligible,install,current,options,choose,take};
})();
