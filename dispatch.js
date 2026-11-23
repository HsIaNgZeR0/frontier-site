'use strict';
// v180 外勤委託：地區 × 四難度 × 戰力值。舊版 templates 保留供既有存檔的進行中任務與歷史紀錄使用。
window.FrontierDispatch=(()=>{
 const HOUR=3600000;
 const templates={transport:{name:'補給運輸',hours:4,members:1,roles:['PIONEER','DEFENDER'],lmd:3500,tier:2},survey:{name:'邊境勘察',hours:12,members:2,roles:['SNIPER','SPECIAL'],lmd:9000,tier:3},expedition:{name:'深區調查',hours:24,members:2,roles:['MEDIC','CASTER'],lmd:17500,tier:4},hazard:{name:'危險區回收',hours:48,members:3,roles:['WARRIOR','SUPPORT'],lmd:30000,tier:5}};
 const roleNames={PIONEER:'先鋒',WARRIOR:'近衛',DEFENDER:'重裝',SNIPER:'狙擊',CASTER:'術師',MEDIC:'醫療',SUPPORT:'輔助',SPECIAL:'特種'};
 const difficulties=[
  {id:'normal',name:'普通',code:'NORMAL',hours:4,members:1,threshold:40,lmd:1000},
  {id:'hard',name:'突襲',code:'RAID',hours:8,members:2,threshold:110,lmd:2600},
  {id:'extreme',name:'險境',code:'PERIL',hours:12,members:3,threshold:220,lmd:5200},
  {id:'torment',name:'磨難',code:'ORDEAL',hours:24,members:3,threshold:380,lmd:9600}
 ];
 const kinds={material:'作戰素材',capture:'收容裝置',equipment:'戰術裝備',supply:'戰術補給',container:'封存補給箱',carbon:'碳與基建建材',mastery:'技能專精教材',record:'作戰記錄',lmd:'龍門幣'};
 const regions=[
  {id:'lungmen',name:'龍門',mission:'近衛局物流協查',kind:'material',families:['rock','device'],roles:['PIONEER','DEFENDER'],img:'lungmen'},
  {id:'ursus',name:'烏薩斯',mission:'移動城市殘骸回收',kind:'material',families:['iron','ketone'],roles:['WARRIOR','SNIPER'],img:'ursus'},
  {id:'siesta',name:'汐斯塔',mission:'火山觀測站補給線',kind:'material',families:['sugar','polyester'],roles:['SUPPORT','MEDIC'],img:'siesta'},
  {id:'kazimierz',name:'卡西米爾',mission:'騎士競技後勤支援',kind:'material',families:['manganese','grindstone'],roles:['WARRIOR','DEFENDER'],img:'kazimierz'},
  {id:'siracusa',name:'敘拉古',mission:'家族工坊原料押運',kind:'material',families:['rma','gel'],roles:['SPECIAL','CASTER'],img:'siracusa'},
  {id:'kjerag',name:'謝拉格',mission:'雪境異常生態收容',kind:'capture',roles:['SPECIAL','SNIPER'],img:'kjerag'},
  {id:'victoria',name:'維多利亞',mission:'蒸汽騎士軍械回收',kind:'equipment',roles:['DEFENDER','SNIPER'],img:'victoria'},
  {id:'iberia',name:'伊比利亞',mission:'審判庭沿岸補給調度',kind:'supply',roles:['MEDIC','SPECIAL'],img:'iberia'},
  {id:'sargon',name:'薩爾貢',mission:'沙海遺跡封存箱發掘',kind:'container',roles:['PIONEER','WARRIOR'],img:'sargon'},
  {id:'sami',name:'薩米',mission:'冰原林地碳材伐取',kind:'carbon',roles:['SUPPORT','PIONEER'],img:'sami'},
  {id:'babel',name:'巴別塔遺址',mission:'舊時代戰術檔案整理',kind:'mastery',roles:['CASTER','SUPPORT'],img:'babel'},
  {id:'chernobog',name:'切爾諾伯格',mission:'廢墟作戰記錄復原',kind:'record',roles:['MEDIC','WARRIOR'],img:null},
  {id:'columbia',name:'哥倫比亞',mission:'特雷西斯商路護航',kind:'lmd',roles:['SNIPER','PIONEER'],img:'columbia'}
 ];
 const LMD_ONLY=5;
 let selected=[],focus=null;
 const region=id=>regions.find(r=>r.id===id),difficulty=id=>difficulties.find(d=>d.id===id);
 function ensure(){FrontierBase.ensure();if(!db.dispatch){db.dispatch={version:1,next:1,jobs:[],history:[]};if(db.base151?.rulesVersion!==600)db.basev2.dispatch++}return db.dispatch}
 function eligible(){return Object.values(db.personnel.units).filter(u=>!FrontierCapture.units[u.id]?.retired&&u.status==='ready'&&!ensure().jobs.some(job=>job.uids.includes(u.uid)))}
 function capacity(){if(db.base151?.rulesVersion===600)return Math.max(1,FrontierBaseEngine.dispatchSlots(db));return Math.min(3,1+Math.floor((db.basev2.facilities.commission.level-1)/2))}
 // 戰力值：星級×10、潛能每級+1(最多+5)、精一+10/精二+20、每張卡專精 M1+5 M2+10 M3+20；職業符合×1.5
 function masteryPower(uid){let n=0;const forms=db.masteryV31?.byUid?.[uid]||{};for(const form of Object.values(forms))for(const rank of Object.values(form||{})){const m=Number(String(rank).replace(/^M/,''))||0;n+=m>=3?20:m*5}return n}
 function breakdown(uid,roles){const u=Object.values(db.personnel.units).find(x=>x.uid===uid);if(!u)return null;const c=FrontierCapture.units[u.id]||{},star=Number(c.rarity)||1,elite=Number(db.progress?.operators?.[u.id]?.elite)||0,pot=Math.max(1,Number(db.potentials?.levels?.[u.id])||1),base=star*10,potential=Math.min(5,pot-1),eliteBonus=elite>=2?20:elite>=1?10:0,mastery=masteryPower(uid),match=!!roles&&roles.includes(c.profession),raw=base+potential+eliteBonus+mastery;return{uid,id:u.id,name:c.name||u.id,profession:c.profession,star,elite,pot,base,potential,eliteBonus,mastery,match,power:Math.round(match?raw*1.5:raw)}}
 function chance(ratio){if(ratio>=1.5)return 1;if(ratio>1)return Math.min(.999,.91+(ratio-1)/.5*.09);return Math.max(.05,Math.min(.9,.1+.8*ratio))}
 function outcome(ratio){return ratio>=2?'收益翻倍':ratio>=1.5?'必定成功':ratio>1?'穩定':'風險偏高'}
 function key(r,d){return r+':'+d}
 function parse(type){const[r,d]=String(type).split(':');return region(r)&&difficulty(d)?{region:region(r),difficulty:difficulty(d)}:null}
 function plan(type,uids){const m=parse(type);if(!m){const t=templates[type];return t?{legacy:true,power:0,success:0,hours:t.hours}:null}const{region:r,difficulty:d}=m;if(!Array.isArray(uids)||uids.length!==d.members||new Set(uids).size!==uids.length)return null;const people=uids.map(uid=>breakdown(uid,r.roles));if(people.some(p=>!p))return null;const power=people.reduce((n,p)=>n+p.power,0),ratio=power/d.threshold,cut=(globalThis.FrontierTalent43?.effects(db).dispatch||0)/100;return{power,threshold:d.threshold,ratio,success:chance(ratio),double:ratio>=2,people,hours:d.hours*(1-cut)}}
 function lmdRange(r,d){const base=d.lmd*(r.kind==='lmd'?LMD_ONLY:1);return[Math.round(base*.8/10)*10,Math.round(base*1.2/10)*10]}
 const pickOne=list=>list[Math.floor(random()*list.length)%list.length];
 const idsOf=(category,test)=>Object.entries(FrontierInventory.definitions).filter(([id,d])=>d.category===category&&test(id,d)).map(([id])=>id);
 function drops(r,i){const out=[],add=(id,qty)=>{if(qty>0&&FrontierInventory.definitions[id])out.push({id,qty})};
  if(r.kind==='material'){const tiers=[[1,2],[2,3],[3,4],[4,4]][i],qty=[[4,6],[3,5],[3,4],[2,3]][i];for(const f of r.families)add(FrontierProgress.materialId(f,tiers[0]+Math.floor(random()*(tiers[1]-tiers[0]+1))),qty[0]+Math.floor(random()*(qty[1]-qty[0]+1)));if(i===3&&random()<.25)add(FrontierProgress.materialId(pickOne(r.families),5),1)}
  if(r.kind==='capture'){add(['device_white','device_green','device_blue','device_silver'][i],[3,2,2,1][i]);if(i===3&&random()<.15)add('device_gold',1)}
  if(r.kind==='equipment'){const band=[[2,3],[3,4],[4,5],[5,6]][i],pool=idsOf('equipment',(id,d)=>/^CAND-EQ-/.test(id)&&d.rarity>=band[0]&&d.rarity<=band[1]);for(let n=[1,1,2,2][i];n>0&&pool.length;n--)add(pickOne(pool),1)}
  if(r.kind==='supply'){const pool=idsOf('medicine',id=>id.endsWith('_t'+(i+3)));for(let n=0;n<2&&pool.length;n++)add(pickOne(pool),1+(i<2?1:0))}
  if(r.kind==='container'){add('container_c'+(i+1),1);if(i===3&&random()<.2)add('container_c5',1)}
  if(r.kind==='carbon')for(const[id,q]of[[['base_carbon',4]],[['base_carbon_stick',3],['base_reinforce_1',2]],[['base_carbon_pack',2],['base_reinforce_2',2]],[['base_carbon_pack',3],['base_reinforce_3',2],['base_gold',3]]][i])add(id,q);
  if(r.kind==='mastery')for(const[id,q]of[[['mastery_manual_1',1]],[['mastery_manual_1',2]],[['mastery_manual_2',1]],[['mastery_manual_3',1],['mastery_manual_2',1]]][i])add(id,q);
  if(r.kind==='record')for(const[id,q]of[[['record_basic',4]],[['record_primary',4]],[['record_mid',4]],[['record_high',3],['record_mid',2]]][i])add(id,q);
  return out}
 function grant(id,qty){const d=FrontierInventory.definitions[id];if(!d||!qty)return;if(['record','material','medicine'].includes(d.category))return FrontierProgress.deposit(id,qty);if(d.category==='captureDevice'){db.capture.devices[id.slice(7)]=(db.capture.devices[id.slice(7)]||0)+qty;return}if(d.category==='container'&&/^container_c[1-5]$/.test(id)&&window.FrontierContainers?.create){for(let n=0;n<qty;n++)db.inventory.items.push(FrontierContainers.create(Number(id.slice(11)),'industrial',{source:'base151',at:Date.now()},id));return}for(let left=qty;left>0;){const n=Math.min(left,d.stack||1);db.inventory.items.push({uid:'item:'+db.inventory.next++,itemId:id,qty:n,origin:{source:'base151',at:Date.now()},durability:d.category==='equipment'?100:null,locked:false});left-=n}}
 function choose(uid,limit=3){if(selected.includes(uid))selected=selected.filter(x=>x!==uid);else if(selected.length<limit&&eligible().some(u=>u.uid===uid))selected=[...selected,uid]}
 function clearSelection(){selected=[]}
 function start(type){const d=ensure(),m=parse(type),uids=[...selected],p=m&&plan(type,uids),available=eligible();if(!p||d.jobs.length>=capacity()||db.base151?.rulesVersion!==600&&db.basev2.dispatch<1||uids.some(uid=>!available.some(u=>u.uid===uid))){toast('請選擇符合人數的幹員並確認有空閒隊位。舊版基建仍需外勤整備。');return}
  const{region:r,difficulty:df}=m,i=difficulties.indexOf(df),id='dispatch:'+d.next++,success=random()<p.success,mult=p.double?2:1,range=lmdRange(r,df);let lmd=range[0]+Math.round(random()*(range[1]-range[0])/10)*10,rewards=[];
  if(success){lmd*=mult;if(r.kind!=='lmd')rewards=drops(r,i).map(x=>({id:x.id,qty:x.qty*mult}))}else lmd=Math.floor(range[0]*.2);
  d.jobs.push({id,type,v:180,uids,people:uids.map(uid=>({...FrontierBase.entity(uid)})),started:Date.now(),ends:Date.now()+Math.round(p.hours*HOUR),plan:{power:p.power,threshold:p.threshold,success:p.success,double:p.double,hours:p.hours},result:{success,lmd,rewards}});
  if(db.base151?.rulesVersion!==600)db.basev2.dispatch--;selected=[];save();render()}
 function title(type){const m=parse(type);return m?m.region.mission+'（'+m.difficulty.name+'）':templates[type]?.name||'外勤委託'}
 function report(job){const result=job.result,rewards=[...(result.lmd?[{id:'lmd',qty:result.lmd}]:[]),...result.rewards];
  const lines=rewards.map(({id,qty})=>{const name=id==='lmd'?'龍門幣（LMD）':FrontierInventory.definitions[id]?.name||id,icon=id==='lmd'?window.FrontierCurrencyIcons?.html(id):window.FrontierIcons?.html(id);return '<li class="row between" style="min-height:44px"><span class="row">'+(icon||'◇')+'<span>'+esc(name)+'</span></span><b>×'+qty.toLocaleString('zh-TW')+'</b></li>'}).join('');
  modal(result.success?'外派成功':'外派失敗','<p>'+esc(title(job.type))+(job.plan?.double&&result.success?' · 收益翻倍':'')+'</p>'+(lines?'<h3>'+(result.success?'獲得物資':'獲得補償')+'</h3><ul style="list-style:none;padding:0;margin:0">'+lines+'</ul>':'<p>本次沒有取得物資。</p>'),'<button class="primary" onclick="closeModal()">確認</button>')}
 function claim(id){const d=ensure(),j=d.jobs.find(x=>x.id===id);if(!j||Date.now()<j.ends)return;for(const person of j.people){const u=db.personnel.units[person.id];if(db.assignments[person.uid]===j.id)delete db.assignments[person.uid];if(!u||u.uid!==person.uid)continue;if(u.assignment===j.id)delete u.assignment}db.wallet.lmd+=j.result.lmd;for(const reward of j.result.rewards)grant(reward.id,reward.qty);d.history.unshift({...j,claimed:Date.now()});d.history=d.history.slice(0,200);d.jobs=d.jobs.filter(x=>x.id!==id);save();render();report(j)}
 // ---------- UI ----------
 const fmt=n=>Number(n).toLocaleString('zh-TW'),hrs=h=>Number(h.toFixed(1))+'h';
 function dropLabel(r){if(r.kind==='material')return r.families.map(f=>FrontierProgress.families[f]?.[2]||f).join('／');return kinds[r.kind]}
 function thumb(r){return r.img?'style="--d180-img:url(assets/regions/'+r.img+'.png)"':''}
 function lmdText(r,d){const[a,b]=lmdRange(r,d);return fmt(a)+'–'+fmt(b)}
 function jobCard(j){const done=Date.now()>=j.ends,left=Math.max(0,j.ends-Date.now()),p=j.plan||{};return '<article class="d180-job'+(done?' ready':'')+'"><div><b>'+esc(title(j.type))+'</b><small>'+esc(j.people.map(x=>x.name).join('、'))+'</small><small>'+(done?'小隊已歸艦，等待結算':'預計 '+Math.ceil(left/HOUR)+' 小時後歸艦')+(p.power?' · 戰力 '+fmt(p.power)+'／'+fmt(p.threshold):'')+'</small></div><button '+(done?'class="primary"':'disabled')+' onclick="FrontierDispatch.claim(\''+j.id+'\')">接收外勤報告</button></article>'}
 function regionCard(r){const a=difficulties[0],z=difficulties[3];return '<button class="d180-region" data-d180-region="'+r.id+'" '+thumb(r)+' onclick="FrontierDispatch.openRegion(\''+r.id+'\')"><span class="d180-region-head"><b>'+esc(r.name)+'</b><em class="d180-kind k-'+r.kind+'">'+esc(kinds[r.kind])+'</em></span><strong>'+esc(r.mission)+'</strong><dl><div><dt>預估時間</dt><dd>'+a.hours+'–'+z.hours+'h</dd></div><div><dt>幹員數量</dt><dd>'+a.members+'–'+z.members+' 名</dd></div><div><dt>偏好職業</dt><dd>'+r.roles.map(x=>roleNames[x]).join('・')+'</dd></div><div><dt>預估收益</dt><dd>'+fmt(lmdRange(r,a)[0])+'–'+fmt(lmdRange(r,z)[1])+' LMD</dd></div><div><dt>掉落類別</dt><dd>'+esc(r.kind==='lmd'?'僅龍門幣（大量）':dropLabel(r)+' ＋ 龍門幣')+'</dd></div><div><dt>戰力要求</dt><dd>'+a.threshold+'–'+z.threshold+'</dd></div></dl></button>'}
 function diffRow(r,d){const busy=ensure().jobs.length>=capacity();return '<article class="d180-diff d-'+d.id+'"><header><span class="d180-diff-code">'+d.code+'</span><b>'+d.name+'</b><span class="d180-req">戰力要求 <strong>'+d.threshold+'</strong></span></header><dl><div><dt>任務名稱</dt><dd>'+esc(r.mission)+'</dd></div><div><dt>預估時間</dt><dd>'+d.hours+' 小時</dd></div><div><dt>幹員數量</dt><dd>'+d.members+' 名</dd></div><div><dt>偏好職業</dt><dd>'+r.roles.map(x=>roleNames[x]).join('・')+'（戰力×1.5）</dd></div><div><dt>預估收益</dt><dd>'+lmdText(r,d)+' LMD</dd></div><div><dt>預估掉落</dt><dd>'+esc(r.kind==='lmd'?'僅龍門幣':dropLabel(r))+'</dd></div></dl><p class="d180-tiers">戰力 &gt; '+d.threshold+' 失敗率 &lt;10% · ≥'+Math.ceil(d.threshold*1.5)+' 必定成功 · ≥'+d.threshold*2+' 收益翻倍</p><button class="primary" '+(busy?'disabled':'')+' onclick="FrontierDispatch.openPicker(\''+key(r.id,d.id)+'\')">'+(busy?'外勤隊位已滿':'編成外勤小隊')+'</button></article>'}
 function view(){const d=ensure(),r=focus&&region(focus),cover='<section class="d180-cover"><div class="d180-cover-text"><div class="eyebrow">RHODES ISLAND · FIELD COMMISSIONS</div><h1>外勤委託</h1><p>派遣幹員前往泰拉各地執行委託。小隊戰力值越高，任務越穩定；超出要求兩倍時收益翻倍。</p></div><div class="d180-slots"><span>外勤隊位</span><b>'+d.jobs.length+'／'+capacity()+'</b>'+(db.base151?.rulesVersion===600?'':'<small>整備 '+db.basev2.dispatch+'</small>')+'</div></section>';
  const jobs=d.jobs.length?'<section class="d180-section"><h2>外勤小隊動態</h2>'+d.jobs.map(jobCard).join('')+'</section>':'';
  const body=r?'<section class="d180-section d180-detail" '+thumb(r)+'><button class="d180-back" onclick="FrontierDispatch.openRegion(null)">‹ 返回委託地區</button><div class="d180-detail-head"><div class="eyebrow">'+esc(kinds[r.kind])+'</div><h2>'+esc(r.name)+' · '+esc(r.mission)+'</h2></div><h3>選擇委託等級</h3>'+difficulties.map(x=>diffRow(r,x)).join('')+'</section>':'<section class="d180-section"><h2>委託地區</h2><div class="d180-regions">'+regions.map(regionCard).join('')+'</div></section>';
  const history='<details class="d180-history"><summary>外勤報告存檔（'+d.history.length+'）</summary>'+d.history.slice(0,30).map(j=>'<p>'+esc(title(j.type))+' · '+(j.result.success?'成功':'受阻')+' · '+fmt(j.result.lmd)+' LMD</p>').join('')+'</details>';
  return '<div class="d180">'+cover+jobs+body+history+'</div>'}
 function openRegion(id){focus=id&&region(id)?id:null;render();document.querySelector('.visual-dispatch')?.scrollTo?.(0,0)}
 let pickType=null;
 function openPicker(type){const m=parse(type);if(!m)return;pickType=type;selected=[];const{region:r,difficulty:d}=m;
  const people=eligible().map(u=>breakdown(u.uid,r.roles)).filter(Boolean).sort((a,b)=>b.power-a.power);
  const cards=people.map(p=>'<button class="d180-op'+(p.match?' match':'')+'" data-dispatch-uid="'+esc(p.uid)+'" aria-label="'+esc(p.name)+'" aria-pressed="false" onclick="FrontierDispatch.pick(this.dataset.dispatchUid)">'+portrait(p.id)+'<span class="d180-op-power">'+p.power+'</span>'+(p.match?'<i class="d180-op-match" aria-hidden="true">適性</i>':'')+'<b class="d180-op-check" aria-hidden="true">✓</b></button>').join('');
  modal(r.mission+' · '+d.name,'<p class="d180-pick-req">需要 '+d.members+' 名幹員 · 戰力要求 '+d.threshold+' · 偏好 '+r.roles.map(x=>roleNames[x]).join('・')+'</p><div class="d180-ops">'+(cards||'<p>目前沒有可外派的幹員。</p>')+'</div><div class="d180-meter"><div class="d180-meter-bar"><i></i><span style="left:33.3%"></span><span style="left:50%"></span><span style="left:66.6%"></span></div><p data-dispatch-preview aria-live="polite"></p></div>','<button class="primary visual-dispatch-launch d180-launch" disabled onclick="FrontierDispatch.launch()">開始外勤</button>');
  preview()}
 function preview(){const m=parse(pickType),dialog=document.querySelector('#modal[open]');if(!m||!dialog)return;const d=m.difficulty,p=plan(pickType,selected),jobs=ensure().jobs.length,cap=capacity(),ready=jobs<cap&&(db.base151?.rulesVersion===600||db.basev2.dispatch>0),power=selected.map(uid=>breakdown(uid,m.region.roles)?.power||0).reduce((a,b)=>a+b,0),ratio=power/d.threshold;
  const out=dialog.querySelector('[data-dispatch-preview]');if(out)out.textContent='已選 '+selected.length+'／'+d.members+' 名 · 戰力 '+power+'／'+d.threshold+' · '+(p?'成功率 '+Math.round(p.success*1000)/10+'% · '+outcome(ratio)+' · 約 '+hrs(p.hours):'隊位 '+jobs+'／'+cap);
  const bar=dialog.querySelector('.d180-meter-bar i');if(bar){bar.style.width=Math.min(100,ratio/3*100)+'%';bar.dataset.tier=ratio>=2?'double':ratio>=1.5?'sure':ratio>1?'ok':'low'}
  for(const b of dialog.querySelectorAll('[data-dispatch-uid]')){const on=selected.includes(b.dataset.dispatchUid);b.setAttribute('aria-pressed',String(on));b.disabled=!on&&selected.length>=d.members}
  const go=dialog.querySelector('.d180-launch');if(go)go.disabled=!p||!ready}
 function pick(uid){const m=parse(pickType);if(!m)return;choose(uid,m.difficulty.members);preview()}
 function launch(){const before=ensure().jobs.length,type=pickType;start(type);if(ensure().jobs.length>before){closeModal();pickType=null;focus=null;render()}else preview()}
 (()=>{if(document.querySelector('link[data-d180]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='dispatch180.css?v=claude53';l.dataset.d180='1';document.head.append(l)})();
 const oldHome=home;home=function(){oldHome();$('#app').innerHTML+='<section class="panel"><h3>外勤委託</h3><button onclick="go(\'dispatch\')">前往外勤委託</button></section>'};
 const oldRender=render;render=function(){if(page==='dispatch'){nav();$('#app').innerHTML=view()}else oldRender()};
 const oldValid=validSave;validSave=function(v){if(!oldValid(v))return false;const d=v.dispatch;if(!d)return true;const occupied=new Set();return d.version===1&&Number.isSafeInteger(d.next)&&d.next>0&&Array.isArray(d.jobs)&&d.jobs.length<=6&&Array.isArray(d.history)&&d.history.length<=200&&d.jobs.every(j=>{const m=parse(j.type),t=templates[j.type],members=m?m.difficulty.members:t?.members;return members&&Array.isArray(j.uids)&&j.uids.length===members&&j.people.length===members&&Number.isFinite(j.started)&&Number.isFinite(j.ends)&&j.ends>j.started&&typeof j.result.success==='boolean'&&Number.isSafeInteger(j.result.lmd)&&j.result.lmd>=0&&(!j.result.casualty||j.uids.includes(j.result.casualty))&&j.result.rewards.every(r=>FrontierInventory.definitions[r.id]&&Number.isSafeInteger(r.qty)&&r.qty>0)&&j.uids.every(uid=>{if(occupied.has(uid))return false;occupied.add(uid);return Object.values(v.personnel.units).some(u=>u.uid===uid)})})};
 ensure();
 return{templates,regions,difficulties,roleNames,kinds,ensure,eligible,capacity,breakdown,plan,chance,lmdRange,drops,choose,clearSelection,start,claim,view,openRegion,openPicker,pick,launch,key,get selected(){return [...selected]}};
})();
