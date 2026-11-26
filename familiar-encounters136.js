'use strict';
// Encounters adapted from IS2/IS3/IS4: stable original slot IDs, complete saved outcomes. Existing active events are never rewritten.
window.FrontierFamiliar136=(()=>{
 const entries={
  'encounter121:victoria:5':{region:'victoria',kind:'puppet',title:'善良的木偶',scene:'1-2',body:'牆角坐著一具快要散架的木偶。胸前的裂縫裡透出微光，看起來並不是普通的木頭。你可以取出裡面的物件，也可以讓它繼續安靜地坐著。',options:[{id:'extract',name:'拆取胸腔中的寶石',effect:'源石碇 +5。',hint:'gold',action:'coins',amount:5},{id:'leave',name:'不打擾它',effect:'不取得物品，繼續探索。',hint:'leave'}]},
  'encounter121:victoria:19':{region:'victoria',kind:'camp',title:'紮營',scene:'1-1',body:'牆垣背風的一角還能避開巡邏。隊員支起小小的火堆，暫時放下裝備；等暖意回到手指，再繼續趕路。',options:[{id:'rest',name:'在火旁休憩',effect:'存活幹員各恢復 8% 最大生命值；不復活倒地者。',hint:'hp',action:'heal',ratio:.08},{id:'leave',name:'立即啟程',effect:'不進行恢復，繼續探索。',hint:'leave'}]},
  'encounter121:iberia:5':{region:'iberia',kind:'singer',title:'海邊的歌者',scene:'2-3',body:'礁石上，一隻衰弱的恐魚撥動著人類的樂器。歌聲與刺耳的琴音一同飄過海面。水邊留下些難以辨認的物件，你可以付出幾枚源石碇，停步聽完這支曲子。',options:[{id:'listen',name:'付費聆聽',effect:'消耗 3 源石碇，從兩件未持有的戰術奇物中選一件。',hint:'relic',action:'gift',cost:3,count:2},{id:'leave',name:'沿岸離開',effect:'不消耗源石碇，不取得奇物。',hint:'leave'}]},
  'encounter121:iberia:19':{region:'iberia',kind:'funeral',title:'懸高之葬',scene:'2-1',body:'海民在懸崖上送別逝者，沒有讓棺木沉入海裡。儀式結束後，他們願意送你一些旅費，並指出海岸附近仍可行走的路。',options:[{id:'pray',name:'向逝者致意',effect:'源石碇 +4；勘探點數 +1（已滿時不再增加）。',hint:'vision',action:'prayer',amount:4},{id:'leave',name:'不再停留',effect:'不領取旅費與路線指引。',hint:'leave'}]},
  'encounter121:sami:5':{kind:'dark',title:'昏黑之室',scene:'3-8',body:'小隊循著雪祀留下的路標走進木屋。探照燈照不透室內的黑暗，門卻在身後闔上了。屋角有幾枚硬幣，深處還有尚未辨明的物件。'},
  'encounter121:sami:19':{kind:'useless',title:'無用之物',scene:'3-20',body:'一位薩滿帶你們走出迷途，接著攤開隨身物件，表示可以分出一些幫助。她腳邊的枝葉正逐漸枯萎；那些饋贈與這片土地的異常，似乎並非毫無關係。'}
 };
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const current=()=>{const r=R(),e=r?.event,f=e?.familiar136,d=entries[e?.id];return d&&r?.expedition?.regionId===(d.region||'sami')&&r.environment?.region===(d.region||'sami')&&f&&f.kind===d.kind?{r,e,f,d}:null};
 const burden=(n)=>{const s=FrontierEnvironment.current();return Math.max(0,Math.min(FrontierEnvironment.definitions.sami.max,s.value+n))-s.value};
 const burdenText=n=>{const actual=burden(n);return actual?'坍縮 '+(actual>0?'+':'−')+Math.abs(actual):'坍縮不變（已達'+(n>0?'上限':'下限')+'）'};
 function options(c=current()){
  if(!c)return[];const {r,f,d}=c,survey=r.survey16?.surveyIndex||0;
  const row=(id,name,effect,hint,disabled=false)=>({id,name,effect,hint,disabled});
  if(f.phase==='result')return[row('finish','繼續前進','本次結果已保存。','leave')];
  if(f.phase==='offer')return r.curios?.offers?.some(o=>o.key===f.key)?[]:[row('finish','繼續前進','奇物選擇已處理，結果不會重抽。','leave')];
  if(f.phase==='search')return[row('deep','深入翻找',burdenText(3)+'；從三件未持有的戰術奇物中選一件。','relic'),row('probe','以設備確認','需要勘探點數 6；不增加坍縮，選擇一件戰術奇物。','relic',survey<6),row('leave','退出內室','不取得物品，不增加坍縮。','leave')];
  if(f.kind==='dark')return[row('look','撿拾屋角硬幣',burdenText(1)+'；源石碇 +5。','gold'),row('explore','走入內室','繼續調查屋內物件；此步尚不增加坍縮。','unknown'),row('leave','推門離開','放棄這次探索。','leave')];
  if(f.kind==='useless')return[row('coins','接受旅費',burdenText(1)+'；源石碇 +3。','gold'),row('knowledge','詢問路線',burdenText(2)+'；勘探點數 +1。','vision',!r.survey16||survey>=6),row('relief','接受祈禱',burdenText(-2)+'。','chaos_purify')];
  return (d.options||[]).map(o=>({...o,effect:o.action==='pressure'?(r.environment.region==='victoria'?'戰線前進 '+Math.abs(o.amount)+'，最高為 1。':r.environment.region==='siracusa'?'敵意降低 '+Math.abs(o.amount)+'，最低為 0。':r.environment.region==='sargon'?'飲水補給增加 '+Math.abs(o.amount)+'，最高為 6。':FrontierEnvironment.definitions[r.environment.region].name+'降低 '+Math.abs(o.amount)+'，最低為 0。'):o.effect,disabled:r.fieldPoints<(o.cost||0)||o.action==='survey'&&(!r.survey16||survey>=6)}));
 }
 function activate(){const r=R(),e=r?.event,d=entries[e?.id];if(!d||e.type!=='frontierEvent'||e.claimed||e.familiar136||r.expedition?.regionId!==(d.region||'sami')||r.environment?.region!==(d.region||'sami'))return false;e.familiar136={version:1,kind:d.kind,phase:'choose',key:'familiar136:'+r.number+':'+r.expedition.current+':'+e.id};return true}
 const enter=FrontierExpedition.enterNode;FrontierExpedition.enterNode=function(id){const before=R()?.event,result=enter(id);if(R()?.event!==before&&activate()){save();render()}return result};
 function applyBurden(n){const before=FrontierEnvironment.current().value;FrontierEnvironment.adjust(n,'不期而遇：'+current().d.title);const change=FrontierEnvironment.current().value-before;return '坍縮 '+(change>=0?'+':'−')+Math.abs(change)}
 function record(text){const {e,f,d}=current();if(f.logged)return;f.logged=true;FrontierAdventure.note(e.id,d.title+'：'+text,{choice:f.choice||'record'})}
 function resolve(text){const {e,f}=current();if(f.phase==='offer'&&f.result)text=f.result+' '+text;e.claimed=true;f.phase='result';f.result=text;record(text);FrontierGrid.sync();FrontierCombat.sync();save();render()}
 function offer(pressure,count=3,cost=0){const {r,e,f}=current();FrontierCurios.offer(f.key,count);const o=r.curios?.offers?.find(x=>x.key===f.key);if(!o){resolve('目前已無尚未持有的戰術奇物；未消耗資源，也未增加地區負擔。');return}r.fieldPoints-=cost;const change=pressure?applyBurden(pressure):(r.expedition.regionId==='sami'?'坍縮不變':'');e.claimed=true;f.phase='offer';f.result=(cost?'消耗 '+cost+' 源石碇；':'')+(change?change+'；':'')+'已找到戰術奇物，請選擇一件。';save();render()}
 function choose(id){const c=current();if(!c||!options(c).some(o=>o.id===id&&!o.disabled))return false;const{r,e,f,d}=c;
  if(id==='finish'){record(f.result||'本次事件已完成。');completeNode();return true}
  f.choice=id;
  if(f.kind==='dark'&&id==='explore'){f.phase='search';save();render();return true}
  if(id==='leave'){resolve(f.kind==='dark'?'你們帶著原有物資退出木屋，沒有增加坍縮。':'你們沒有接受這次的幫助，帶著原有物資繼續趕路。');return true}
  if(f.kind==='dark'&&(id==='deep'||id==='probe')){offer(id==='deep'?3:0);return true}
  if(f.kind==='dark'&&id==='look'||f.kind==='useless'&&id==='coins'){const amount=id==='look'?5:3,change=applyBurden(1);r.fieldPoints+=amount;resolve('收下硬幣後，小隊離開了。源石碇 +'+amount+'；'+change+'。');return true}
  if(f.kind==='useless'&&id==='knowledge'){if(!FrontierSurvey16.gain(1,'無用之物：路線指引',f.key+':knowledge'))return false;const change=applyBurden(2);resolve('薩滿指出一條可以辨識的路。勘探點數 +1；'+change+'。');return true}
  if(f.kind==='useless'&&id==='relief'){const change=applyBurden(-2);resolve('祈禱逐漸平息了隊員的不安。'+change+'。');return true}
  const choice=d.options?.find(o=>o.id===id);
  if(choice?.action==='coins'){r.fieldPoints+=choice.amount;resolve('你取出了可以交換的物件。源石碇 +'+choice.amount+'。');return true}
  if(choice?.action==='gift'){offer(0,choice.count,choice.cost);return true}
  if(choice?.action==='survey'){if(!FrontierSurvey16.gain(1,d.title+'：路線指引',f.key+':route'))return false;r.fieldPoints-=choice.cost||0;resolve('已取得路線資訊。勘探點數 +1。');return true}if(choice?.action==='pressure'){FrontierCurios.environmentCost(choice.amount);resolve('小隊避開了最不穩定的區域，地區負擔已按合法上下限降低。');return true}if(choice?.action==='heal'){r.fieldPoints-=choice.cost||0;let total=0;for(const a of r.team.filter(a=>a.hp>0)){const before=a.hp;a.hp=Math.min(a.max,a.hp+FrontierEnvironment.healing(Math.ceil(a.max*choice.ratio)));total+=a.hp-before}resolve('小隊重新整備後繼續前行。合計恢復 '+total+' HP。');return true}
  if(choice?.action==='prayer'){r.fieldPoints+=choice.amount;const gained=(r.survey16?.surveyIndex||0)<6&&FrontierSurvey16.gain(1,'懸高之葬：海岸指引',f.key+':route');resolve('你們向逝者告別，再度踏上岸邊的小路。源石碇 +'+choice.amount+'；勘探點數 +'+(gained?1:0)+'。');return true}
  return false;
 }
 function take(id){const c=current();if(!c||c.f.phase!=='offer')return false;const {r,f}=c,o=r.curios?.offers?.find(x=>x.key===f.key);if(!o||id!=='skip'&&!o.ids.includes(id))return false;const name=FrontierCurioData.forRun(R())[id]?.name;if(id==='skip')FrontierCurios.decline(f.key);else FrontierCurios.claim(f.key,id);resolve(id==='skip'?'放棄奇物；已支付的代價不會退還。':'取得戰術奇物「'+name+'」，只在本趟遠征生效。');return true}
 const brief=text=>text.length>70?text.slice(0,65)+'…（長按查看完整效果）':text;
 const previous=eventView;eventView=function(){const c=current();if(!c)return previous();const{r,e,f,d}=c;let rows=options(c),body=f.phase==='search'?'燈光只照出一小片空間。更深處可能藏著有用的物件，也可能讓不安繼續累積。':f.phase==='result'?f.result:f.phase==='offer'?f.result:d.body;
  let html='';if(f.phase==='offer'){const o=r.curios?.offers?.find(x=>x.key===f.key);if(o)html=o.ids.map(id=>'<button data-curio="'+id+'" data-familiar-hint="relic" onclick="FrontierFamiliar136.take(\''+id+'\')">'+FrontierCurios.icon(id)+'<b>'+escape(FrontierCurioData.forRun(R())[id].name)+'</b><small>'+escape(brief(FrontierCurioData.forRun(R())[id].effect))+'</small></button>').join('')+'<button data-familiar-hint="leave" onclick="FrontierFamiliar136.take(\'skip\')"><b>放棄奇物</b><small>不取得奇物；已支付的代價不會退還。</small></button>';else{body='本次奇物選擇已處理，可以繼續前進。';rows=[{id:'finish',name:'繼續前進',effect:'奇物選擇已處理，結果不會重抽。',hint:'leave'}];}}
  html+=rows.map(o=>'<button '+(o.disabled?'disabled ':'')+'data-familiar-hint="'+o.hint+'" onclick="FrontierFamiliar136.choose(\''+o.id+'\')"><b>'+escape(o.name)+'</b><small>'+escape(o.effect)+'</small></button>').join('');
  document.getElementById('app').innerHTML=runHeader()+'<section class="panel event-panel"><small>不期而遇</small><h2>'+d.title+'</h2><p>'+escape(body)+'</p><div class="row">'+html+'</div></section>'+bagHtml();
 };
 const priorValid=validSave;validSave=function(v){if(!priorValid(v))return false;const e=v.run?.event,f=e?.familiar136;if(!f)return true;const d=entries[e.id],phases=d?.kind==='dark'?['choose','search','offer','result']:d?.kind==='singer'||d?.options?.some(o=>o.action==='gift')?['choose','offer','result']:['choose','result'];return !!d&&v.run.expedition?.regionId===(d.region||'sami')&&v.run.environment?.region===(d.region||'sami')&&f.version===1&&f.kind===d.kind&&phases.includes(f.phase)&&typeof f.key==='string'&&f.key.length<=200&&(['choose','search'].includes(f.phase)?e.claimed===false:e.claimed===true)&&(f.logged===undefined||typeof f.logged==='boolean')&&(f.choice===undefined||typeof f.choice==='string'&&f.choice.length<40)&&(f.result===undefined&&!['offer','result'].includes(f.phase)||typeof f.result==='string'&&f.result.length<=300)};
 return{entries,activate,options,choose,take};
})();
