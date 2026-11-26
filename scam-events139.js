'use strict';
window.FrontierScam139=(()=>{
 const entries=FrontierScamData139,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const current=()=>{const r=R(),e=r?.event,f=e?.scam139,d=entries[e?.id];return f&&d?{r,e,f,d}:null};
 function activate(){if(window.FrontierScam139Enabled===false)return false;const r=R(),e=r?.event,d=entries[e?.id];if(!d||e.type!=='frontierEvent'||e.claimed||e.scam139||r.expedition.regionId!==d.region)return false;e.scam139={version:1,kind:d.kind,phase:'choose',payments:0,key:'scam139:'+r.number+':'+r.expedition.current+':'+e.id,tier:'normal'};return true}
 const enter=FrontierExpedition.enterNode;FrontierExpedition.enterNode=function(id){const before=R()?.event,out=enter(id);if(R()?.event!==before&&activate()){save();render()}return out};
 const battleText=tier=>'緊急作戰；敵方最大 HP 額外 +'+(tier==='strong'?20:8)+'%，不額外增加攻擊。勝利正常戰利品外，再得 '+(tier==='strong'?8:4)+' 源石碇；失敗依遠征規則結算。';
 function options(c=current()){
  if(!c)return[];const{r,f,d}=c,row=(id,name,effect,hint='unknown',disabled=false)=>({id,name,effect,hint,disabled}),leave=row('leave','離開這裡',f.payments?'已支付的 '+f.payments+' 源石碇不退還；不再取得本次獎勵。':'不取得獎勵，也不進入作戰。','leave');
  if(f.phase==='offer')return r.curios?.offers?.some(o=>o.key===f.key+':gift')?[]:[row('finish','繼續前進','回贈選擇已處理，返回路線圖。','leave')];
  if(f.phase==='result')return[row('finish','繼續前進','本次結果已保存，返回路線圖。','leave')];
  if(f.phase==='warning')return[row('fight','進入作戰',battleText(f.tier),'battle')];
  if(f.phase==='approach'||f.phase==='tribute')return[row('pay',f.payments?'繼續拿出誠意':'拿出一點誠意','消耗 1 源石碇；累計支付 3 枚後，可選奇物或挑戰更強的伏兵。','gold',r.fieldPoints<1),row('accuse','休想騙我','停止支付，準備一場伏擊作戰。','battle'),leave];
  if(f.phase==='decision')return[row('gift','收下最後的回贈','從兩件未持有的戰術奇物中選一件；不再參與此事件。','relic'),row('hard','揭穿湖面的偽裝',battleText('strong'),'battle'),leave];
  if(d.kind==='fairy')return[row('approach',d.accept,'靠近湖邊，聽聽她的請求；此步不支付源石碇。'),leave];
  if(d.kind==='witch')return[row('help',d.accept,'觸碰房中物件，會引來一場緊急作戰。','battle'),row('rest','乖乖照做','需要勘探點數 6（不消耗）；得 6 源石碇，存活幹員恢復 8% 最大 HP。','hp',(r.survey16?.surveyIndex||0)<6),leave];
  if(d.kind==='statue')return[row('help',d.accept,'冒犯供奉，接續一場伏擊作戰。','battle'),row('crown','伸手摘取頭冠','須持有至少 20 源石碇（不扣除）；接續更強的伏擊作戰。','battle',r.fieldPoints<20),row('pray','依禮致意','不觸碰供品，不取得獎勵，安全離開。','leave')];
  return[row('help',d.accept,'靠近後將接續一場緊急作戰；請先確認隊伍狀態。','battle'),leave];
 }
 function resolve(text){const{e,f}=current();e.claimed=true;f.phase='result';f.result=text;FrontierCombat.sync();save();render()}
 function warning(tier='normal'){const{f}=current();f.phase='warning';f.tier=tier;save();render()}
 function choose(id){const c=current();if(!c||!options(c).some(o=>o.id===id&&!o.disabled))return false;const{r,e,f,d}=c;
  if(id==='finish'){FrontierAdventure.note(e.id,d.title+'：'+(f.result||'回贈選擇已處理。'));completeNode();return true}
  if(id==='leave'||id==='pray'){resolve(f.payments?'小隊沒有繼續交易。已支付 '+f.payments+' 源石碇，沒有追加消耗。':'小隊保持距離，平安回到原來的道路。');return true}
  if(id==='help'||id==='accuse'||id==='hard'||id==='crown'){warning(id==='hard'||id==='crown'?'strong':'normal');return true}
  if(id==='approach'){f.phase='approach';save();render();return true}
  if(id==='pay'){r.fieldPoints--;f.payments++;f.phase=f.payments===3?'decision':'tribute';save();render();return true}
  if(id==='rest'){r.fieldPoints+=6;for(const a of r.team.filter(a=>a.hp>0))a.hp=Math.min(a.max,a.hp+FrontierEnvironment.healing(Math.ceil(a.max*.08)));resolve('小隊沒有碰屋內的物件，休息後得 6 源石碇；存活幹員恢復 8% 最大 HP（受地區治療效果影響）。');return true}
  if(id==='gift'){const key=f.key+':gift';FrontierCurios.offer(key,2);if(!r.curios?.offers?.some(o=>o.key===key)){r.fieldPoints+=3;resolve('已無可用奇物候選，改為獲得 3 源石碇。');return true}e.claimed=true;f.phase='offer';save();render();return true}
  if(id==='fight'){const tier=f.tier,marker={version:1,eventId:e.id,key:f.key,tier,bonus:tier==='strong'?8:4};startBattle('elite');if(!r.battle){r.event=e;return false}const scale=tier==='strong'?1.20:1.08;for(const enemy of r.battle.enemies){enemy.max=Math.round(enemy.max*scale);enemy.hp=enemy.max;enemy.scam139Text='伏擊作戰：最大 HP 額外 +'+(tier==='strong'?20:8)+'%；攻擊不另加成。'}if(r.battle.balance)r.battle.balance.totalBodyHp=r.battle.enemies.reduce((n,x)=>n+x.max,0);r.battle.scam139=marker;r.battle.log.push(d.title+'：伏擊已展開。');save();render();return true}
  return false;
 }
 function take(id){const c=current();if(!c||c.f.phase!=='offer')return false;const key=c.f.key+':gift',offer=c.r.curios.offers.find(o=>o.key===key);if(!offer||id!=='skip'&&!offer.ids.includes(id))return false;if(id==='skip')FrontierCurios.decline(key);else FrontierCurios.claim(key,id);resolve(id==='skip'?'放棄了回贈，已支付的 3 源石碇不退還。':'收下了戰術奇物「'+FrontierCurioData.forRun(R())[id].name+'」。');return true}
 const check=checkBattle;checkBattle=function(...args){const r=R(),b=r?.battle,m=b?.scam139,win=m&&r.hp>0&&b.enemies.every(e=>e.hp<=0),out=check(...args);if(win&&R()===r&&r.reward){r.scam139Receipts??=[];if(!r.scam139Receipts.includes(m.key)){r.scam139Receipts.push(m.key);r.fieldPoints+=m.bonus;r.reward.ingotEarned145=(r.reward.ingotEarned145||0)+m.bonus;FrontierAdventure.note(m.eventId,entries[m.eventId].title+'：擊退伏擊，額外取得 '+m.bonus+' 源石碇。');save();render()}}return out};
 const detail=FrontierRegionalEnemies.detail;FrontierRegionalEnemies.detail=e=>[detail(e),e.scam139Text].filter(Boolean).join('\n');
 const view=eventView;eventView=function(){const c=current();if(!c)return view();const{r,f,d}=c;let body=f.phase==='warning'?d.warning:f.phase==='result'?f.result:f.phase==='approach'?'她請你先拿出一枚源石碇，才肯繼續說話。你仍可以離開。':f.phase==='tribute'?(f.payments===1?'她拿出一塊普通磁鐵，又說還需要一點誠意。':'她展示一只破舊懷錶，仍不肯說清最後的回贈。')+'這些物件沒有加入背包；已支付 '+f.payments+' 源石碇。':f.phase==='decision'?'三枚源石碇已經付清。她終於願意交出真正的回贈，湖面倒影卻仍顯得不對勁。你可以收下物件，也可以揭穿偽裝。':f.phase==='offer'?'從以下兩件戰術奇物選一件；它不佔用背包，只在本局生效。':d.body;
  let html=options(c).map(o=>'<button '+(o.disabled?'disabled ':'')+'data-familiar-hint="'+o.hint+'" onclick="FrontierScam139.choose(\''+o.id+'\')"><b>'+esc(o.name)+'</b><small>'+esc(o.effect)+'</small></button>').join('');if(f.phase==='offer'&&r.curios?.offers?.some(o=>o.key===f.key+':gift')){const offer=r.curios.offers.find(o=>o.key===f.key+':gift');html=(offer?.ids||[]).map(id=>'<button data-curio="'+id+'" data-familiar-hint="relic" onclick="FrontierScam139.take(\''+id+'\')">'+FrontierCurios.icon(id)+'<b>'+esc(FrontierCurioData.forRun(r)[id].name)+'</b><small>'+esc(FrontierCurioData.forRun(r)[id].effect.slice(0,65))+'（長按詳情）</small></button>').join('')+'<button data-familiar-hint="leave" onclick="FrontierScam139.take(\'skip\')"><b>放棄回贈</b><small>已支付的源石碇不退還。</small></button>'}
  document.getElementById('app').innerHTML=runHeader()+'<section class="panel event-panel"><small>不期而遇</small><h2>'+esc(d.title)+'</h2><p>'+esc(body)+'</p><div class="row">'+html+'</div></section>'+bagHtml();
 };
 const valid=validSave;validSave=function(v){if(!valid(v))return false;const r=v.run,f=r?.event?.scam139,d=entries[r?.event?.id],m=r?.battle?.scam139;if(r?.scam139Receipts&&(!Array.isArray(r.scam139Receipts)||r.scam139Receipts.length>100||new Set(r.scam139Receipts).size!==r.scam139Receipts.length||r.scam139Receipts.some(x=>typeof x!=='string'||x.length>200)))return false;if(m&&(!entries[m.eventId]||entries[m.eventId].region!==r.expedition.regionId||m.version!==1||!['normal','strong'].includes(m.tier)||(m.tier==='strong'?![6,8].includes(m.bonus):m.bonus!==4)||typeof m.key!=='string'||m.key.length>200))return false;if(!f)return true;return !!d&&d.region===r.expedition.regionId&&r.environment?.region===d.region&&f.version===1&&f.kind===d.kind&&['choose','warning','approach','tribute','decision','offer','result'].includes(f.phase)&&(d.kind==='fairy'||!['approach','tribute','decision','offer'].includes(f.phase)&&f.payments===0)&&Number.isInteger(f.payments)&&f.payments>=0&&f.payments<=3&&(!['decision','offer'].includes(f.phase)||f.payments===3)&&typeof f.key==='string'&&f.key.length<200&&['normal','strong'].includes(f.tier)&&(f.tier==='normal'||['statue','fairy'].includes(d.kind))&&(['offer','result'].includes(f.phase)===r.event.claimed)&&(!f.result||typeof f.result==='string'&&f.result.length<400)};
 return{entries,activate,current,options,choose,take,battleText};
})();
