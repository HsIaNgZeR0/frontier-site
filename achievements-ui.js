'use strict';
window.FrontierAchievements=(()=>{
 const A=FrontierAchievementRecords;
 const tabs={basic:'基本數據',combat:'戰鬥數據',explore:'探索紀錄',operator:'幹員數據'};
 const colors=['blue','silver','gold','red'],diff=['普通','突襲','險境','磨難'];
 const endings={normal:'一結局',fate:'二結局',exchange:'三結局',fourth:'四結局',hidden:'舊隱藏'};
 const endingCodes={normal:'01',fate:'02',exchange:'03',fourth:'04',hidden:'舊'};
 function endingMark(ending,rank){
  const label=endings[ending],code=endingCodes[ending],cleared=Number.isInteger(rank)&&rank>=0&&rank<diff.length;
  if(!label)return '';
  const difficulty=cleared?diff[rank]:'未通關';
  return '<span class="ending-record-mark '+(cleared?colors[rank]:'locked')+'" role="img" aria-label="'+label+' '+difficulty+'" title="'+label+' '+difficulty+'"><small>ENDING</small><b>'+code+'</b></span>';
 }
 const fmt=n=>Number.isFinite(n)?n.toLocaleString('zh-TW'):'未記錄';
 const metric=(label,value)=>'<div><dt>'+label+'</dt><dd>'+value+'</dd></div>';
 const tiles=rows=>'<dl class="achievements-metrics">'+rows.map(([k,v])=>metric(k,v)).join('')+'</dl>';
 const escape=FrontierScreen.escape||((s)=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])));
 function basic(){
  const data=A.walletHistory(db),created=FrontierIdentity.account?.createdAt;
  const date=Number.isFinite(created)&&created>0?new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',dateStyle:'medium',timeStyle:'short'}).format(created):'未記錄';
  return '<h3>博士檔案</h3>'+tiles([['帳號創立時間',date],['遠征出發次數',fmt(db.runs)]])+'<h3>累計獲得</h3>'+tiles([['龍門幣',fmt(data.earned.lmd)],['合成玉',fmt(data.earned.synth)],['初期憑證（綠票）',fmt(data.earned.green)],['資深憑證（黃票）',fmt(data.earned.yellow)],['調查點數',fmt(db.survey27?.totalEarned??0)]])+'<p class="tiny muted">貨幣按每筆已保存操作的正向入帳累計。'+(data.partial?'舊帳號只補算仍可查到的流水，顯示的是已知累計。':'')+'</p>';
 }
 function combat(){
  const best=A.combat(db);
  return '<h3>單次最高紀錄</h3>'+tiles([['物理傷害',fmt(best.physical)],['法術傷害',fmt(best.arts)],['真實傷害',fmt(best.true)],['有效治療',fmt(best.maxHealing)],['承受傷害',fmt(best.maxTaken)]])+'<p class="tiny muted">以單次結算的實際生命值變動計算。護盾吸收、溢出治療及未標記類型的舊傷害不計入分項最高值。</p>';
 }
 function score(rows){
  return '<div class="achievements-difficulty">'+rows.map((x,i)=>'<div class="achievement-score '+colors[i]+'"><b>'+diff[i]+'</b><strong>'+x.clears+' <small>通關</small></strong><span>'+(x.attempts?(100*x.clears/x.attempts).toFixed(1)+'%':'—')+' <small>勝率</small></span><small>'+x.attempts+' 次計入</small></div>').join('')+'</div>';
 }
 function badge(ending,rank){
  const label=endings[ending],active=rank!==undefined;
  return '<span class="achievement-badge '+(active?colors[rank]:'locked')+'">'+endingMark(ending,rank)+'<span><b>'+label+'</b><small>'+(active?diff[rank]:'未通關')+'</small></span></span>';
 }
 function explore(){
  const regions=FrontierExpedition.regions,data=A.explore(db,regions.map(r=>r.id));
  return '<h3>全區通關總覽</h3>'+score(data.all)+'<p class="tiny muted">勝率＝完整通關 ÷ 計入遠征。第三層撤離（'+data.early+' 次）、短程偵察及模擬不計入。'+(data.ambiguous?'另有 '+data.ambiguous+' 筆舊紀錄無法區分短程偵察，未計入。':'')+'</p><h3>地區與結局</h3>'+regions.map(r=>{
   const row=data.rows[r.id],badges=['normal','fate','exchange','fourth',...(row.badges.hidden!==undefined?['hidden']:[])];
   return '<details class="achievement-region"><summary><b>'+escape(r.name)+'</b><span>'+row.counts.reduce((n,x)=>n+x.clears,0)+' 次通關</span></summary>'+score(row.counts)+'<div class="achievement-badges">'+badges.map(k=>badge(k,row.badges[k])).join('')+'</div></details>';
  }).join('');
 }
 let selectedOperator='';
 function operatorMetrics(id){
  const {totals,clears,sorties}=A.operator(db,id);
  const combatValue=n=>fmt(Math.round((n||0)*10)/10);
  return '<h3>遠征紀錄</h3>'+tiles([['累計出戰',fmt(sorties)]])
   +'<h3>各難度通關次數</h3>'+tiles(diff.map((label,i)=>[label,fmt(clears[i])]))
   +'<h3>戰鬥與支援</h3>'+tiles([
    ['物理傷害',combatValue(totals.physical)],['法術傷害',combatValue(totals.arts)],
    ['真實傷害',combatValue(totals.true)],['破韌傷害',combatValue(totals.poise)],
    ['承受傷害',combatValue(totals.taken)],['護盾＋有效治療',combatValue(totals.care)],
    ['累計出牌',fmt(totals.cards||0)],['額外抽牌＋行動點',fmt(totals.support||0)]
   ])+'<p class="tiny muted">出戰與通關依可查的遠征紀錄統計。戰鬥與支援從本次更新起累計，傷害以實際扣血計算，抽牌只計成功加入手牌的張數。</p>';
 }
 function operator(){
  const known=new Set([...Object.keys(db.personnel?.units||{}),...(db.squad||[]),...Object.keys(db.operatorMetricsV1||{})]);
  for(const raid of db.statistics?.raids||[])for(const actor of raid.team||[])known.add(actor.id);
  const operators=[...known].filter(id=>FrontierCapture.units[id]?.kind==='operator');
  if(!operators.length)return '<p class="muted">目前沒有可查看的幹員。</p>';
  if(!operators.includes(selectedOperator))selectedOperator=operators[0];
  return '<div class="achievements-operator-grid" role="group" aria-label="選擇幹員">'
   +operators.map(id=>{
    const unit=FrontierCapture.units[id],name=escape(unit.name);
    const src=window.FrontierAppearance80?.src(id)||'assets/'+unit.image+'.png';
    return '<button type="button" data-achievements-operator="'+escape(id)+'" aria-label="'+name+'" aria-pressed="'+(id===selectedOperator)+'"><img src="'+escape(src)+'" alt="" loading="lazy"><span>'+name+'</span></button>';
   }).join('')
   +'</div><h3 data-achievements-selected-name>'+escape(FrontierCapture.units[selectedOperator].name)+'</h3><section data-achievements-operator-results>'+operatorMetrics(selectedOperator)+'</section>';
 }
 function pane(tab){
  const root=document.querySelector('.achievements-panel');if(!root)return;
  root.querySelectorAll('[data-achievements-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.achievementsTab===tab)));
  root.querySelector('.achievements-content').innerHTML={basic,combat,explore,operator}[tab]();
  const scroll=root.closest('.screen-popup-body');if(scroll)scroll.scrollTop=0;
 }
 function open(){
  modal('成就數據','<section class="achievements-panel"><nav aria-label="成就分類">'+Object.entries(tabs).map(([id,name])=>'<button data-achievements-tab="'+id+'">'+name+'</button>').join('')+'</nav><div class="achievements-content"></div></section>','<button onclick="closeModal()">關閉</button>');
  pane('basic');
 }
 document.addEventListener('click',e=>{
  const tab=e.target.closest?.('[data-achievements-tab]')?.dataset.achievementsTab;
  if(tab&&tabs[tab])pane(tab);
  else if(e.target.closest?.('[data-home20-achievements]'))open();
 });
 document.addEventListener('click',e=>{
  const button=e.target.closest?.('[data-achievements-operator]');
  if(!button)return;
  selectedOperator=button.dataset.achievementsOperator;
  const panel=button.closest('.achievements-panel');
  panel.querySelectorAll('[data-achievements-operator]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  panel.querySelector('[data-achievements-selected-name]').textContent=FrontierCapture.units[selectedOperator].name;
  panel.querySelector('[data-achievements-operator-results]').innerHTML=operatorMetrics(selectedOperator);
 });
 return {open,endingMark};
})();
