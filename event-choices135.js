'use strict';
// Present existing event actions; never change their handlers, rewards or saved choices.
window.FrontierEventChoices135=(()=>{
 const enabled=()=>page==='run'&&R()?.event&&!R().battle&&!R().reward&&!R().result;
 const supported=e=>e?.type==='frontierEvent'||['camp','traveler','stash','tower','search'].includes(e?.type)||e?.surveyGate16;
 function text(node){if(!node)return '';const copy=node.cloneNode(true);copy.querySelectorAll('.currency-icon,[role="img"][aria-label]').forEach(n=>n.replaceWith(document.createTextNode(n.getAttribute('aria-label')||n.title||'')));return copy.textContent.trim()}
 function art(node){return [...node.querySelectorAll('img,svg')].find(n=>!n.closest('.currency-icon,.event135-choice-effect,small,:scope>span'))||null}
 function description(button,e){
  const code=button.getAttribute('onclick')||'',r=R();
  if(code==='FrontierEquipmentUI139.manage()')return '安裝或卸下詞條；不消耗本處休整機會。';
  if(code==='FrontierEndings.action(true)'){
   const path=e.endingPath||(e.id==='ending_exchange_entry'?'exchange':'fate'),state=r.endingRoute?.branches?.[path]||r.endingRoute,route=FrontierEndings.definitions[r.expedition.regionId]?.[path];
   if(e.id!=='ending_followup')return '取得「'+(route?.key||'結局證物')+'」，開啟後續結局線索。';
   const step=route?.steps[state?.stage||0];
   return ({fight:'進入強化緊急作戰；勝利推進結局，失敗依遠征規則結算。',pay:'消耗 12 源石碇，推進這條結局線索。',intel:'消耗 5 情報，推進這條結局線索。',report:'交付已取得的證物，推進這條結局線索。'})[step]||'完成當前調查，推進這條結局線索。';
  }
  if(code==='FrontierEndings.action(false)')return '放下這條結局線索；仍可探索其他路線。';
  if(code==='FrontierEndings.scoutInstead()')return '勘探點數 +1；不取得這次的證物，放下這條故事線。';
  if(code==='FrontierEndings.original()'){const destination=e.originalMerchant?'前往原行商':e.originalCamp?'返回營地選項':'返回原本的區域事件';return destination+'；'+(['ending_followup','ending_exchange_entry'].includes(e.id)?'放下這條結局線索。':'不取得這次的結局證物。')}
  if(code==='FrontierEncounters.openPicker()')return '交出一件戰術奇物或詞條，隨機換成同類未持有品項。';
  if(code==='FrontierEncounters.showResult()')return '查看交換結果與物品圖示，再繼續前進。';
  if(/FrontierAdventure\.(?:select\(false|chooseRegional\('leave'|resolveRegional\('skip')/.test(code))return '不領取此選項的收益，繼續探索。';
  if(code==='FrontierAdventure.select(true)')return FrontierAdventure.events[e.id]?.choice||'';
  if(/FrontierSurvey16.enter/.test(code))return '消耗 2 勘探點數，探索短支線後返回這個路口。';
  if(/FrontierSurvey16.leaveGate/.test(code))return '回到主路線繼續探索。';
  return '';
 }

 function sceneFor(e,r){
  const id=e.id||'',region=r.expedition?.regionId;
  if(e.scam139)return window.FrontierScam139?.entries[e.id]?.scene||'desert';
  if(e.recreation139)return window.FrontierRecreationData139?.[e.id]?.scene||'1-16';
  if(e.familiar136)return window.FrontierFamiliar136?.entries[e.id]?.scene||'3-8';
  if(e.type==='camp')return '2-46';
  if(id==='gift_choice')return '3-23';
  if(id==='gift_exchange'||id==='ending_exchange_entry')return '3-21';
  if(id.startsWith('ending_'))return '3-28';
  if(region==='sargon')return 'desert';
  if(['sami','kjerag'].includes(region))return '3-28';
  if(['sargon','kazdel'].includes(region))return 'forest';
  return 'messenger';
 }
 function optionHint(button,e,detail){
  // 參照原作 unknown 選項：取得品項隨機但必得，仍為 relic；能否取得不確定才用 unknown。
  const optionId=(button.getAttribute('onclick')||'').match(/FrontierRecreation139.choose\('([^']+)'/)?.[1];
  const outcome=optionId&&window.FrontierRecreationData139?.[e.id]?.options?.find(o=>o.id===optionId);
  if(outcome?.outcomes?.length>1||/(?:可能|或許|有機會|有機率|機率|幾率|概率|\d+[%％].*(?:獲得|取得|戰鬥|作戰))/.test(detail))return 'unknown';
  if(['battle','gold','hp','leave','relic','sacrifice','unknown','vision','chaos_purify','shield','adventure','key'].includes(button.dataset.familiarHint))return button.dataset.familiarHint;
  const code=button.getAttribute('onclick')||'',r=R(),choice=code.match(/(?:chooseRegional|camp)\('([^']+)'/)?.[1];
  if(/action\(false|select\(false|leaveGate|chooseRegional\('leave'|resolveRegional\('skip'|completeNode|Curios.decline/.test(code))return 'leave';
  if(code==='FrontierEndings.action(true)'){
   if(e.id!=='ending_followup')return 'relic';const path=e.endingPath||r.endingRoute?.path||'fate',state=r.endingRoute?.branches?.[path]||r.endingRoute,step=FrontierEndings.definitions[r.expedition.regionId]?.[path]?.steps[state?.stage||0];return ({fight:'battle',pay:'gold',intel:'vision',report:'key'})[step]||'unknown';
  }
  if(/openPicker/.test(code))return 'sacrifice';
  if(/showResult|Encounters.choose|Curios.claim|takeModule/.test(code))return 'relic';
  if(/Endings.scoutInstead/.test(code))return 'vision';
  if(/Endings.original|Survey16.enter/.test(code))return 'adventure';
  if(button.classList.contains('fd-camp-alert')||/hideAtCamp/.test(code))return 'chaos_purify';
  if(choice){if(['cred','trade','currency'].includes(choice))return 'gold';if(['survey','paidSurvey'].includes(choice))return 'vision';if(['relief','environment','cleanse'].includes(choice))return 'chaos_purify';if(choice==='heal')return 'hp';if(['material','supply','curio','module'].includes(choice))return 'relic';if(choice==='gamble')return 'unknown'}
  if(/遭遇.*(?:作戰|戰鬥)|進入.*(?:作戰|戰鬥)|挑戰.*作戰/.test(detail)&&!/(?:可能|機率|%)/.test(detail))return 'battle';
  if(/源石碇.*[+＋]|取得.*源石碇/.test(detail))return 'gold';
  if(/恢復.*(?:生命|HP)|治療/.test(detail))return 'hp';
  if(/取得|獲得|三選一/.test(detail))return 'relic';
  return 'unknown';
 }
 function fit(panel){
  if(!panel.isConnected)return;
  const host=panel.closest('.screen-workspace-body'),heading=host?.querySelector('.compact-run-summary');if(!host)return;
  const available=Math.max(0,host.clientHeight-(heading?.offsetHeight||0)-18),buttons=[...panel.querySelectorAll('.event135-choice')];panel.style.height=available+'px';
  for(const density of ['normal','compact','tight']){
   panel.dataset.density=density;
   for(const button of buttons){button.style.removeProperty('min-height');const c=getComputedStyle(button),title=button.querySelector('.event135-choice-title'),detail=button.querySelector('.event135-choice-effect');const natural=(title?.offsetHeight||0)+(detail?.offsetHeight||0)+(detail?parseFloat(c.rowGap)||0:0)+parseFloat(c.paddingTop)+parseFloat(c.paddingBottom)+2;button.style.setProperty('min-height',Math.ceil(Math.max(parseFloat(c.minHeight)||44,natural))+'px','important')}
   if(panel.scrollHeight<=available+1&&buttons.every(b=>b.scrollHeight<=b.clientHeight+1))break;
  }
  panel.dataset.fits=String(panel.scrollHeight<=available+1);
 }
 function decorate(){
  if(!enabled()||!supported(R().event))return;
  if(R().event.familiar136?.phase==='offer'||R().event.recreation139?.phase==='offer'||R().event.scam139?.phase==='offer')document.querySelectorAll('#app .curio-offer-entry').forEach(n=>n.remove());
  const host=document.querySelector('#app .compact-action-body');if(!host)return;
  const panel=[...host.children].find(n=>n.matches('.panel,.event-panel,.reward139-stage')&&!n.matches('.compact-run-summary'));if(!panel)return;
  if(panel.dataset.choices135){if(![...panel.querySelectorAll('button')].some(b=>!b.matches('.event135-choice,.event135-tool')))return;panel.querySelector('.event135-emblem')?.remove();const previous=panel.querySelector('.event135-narrative');if(previous)previous.replaceWith(...previous.childNodes);delete panel.dataset.choices135;}
  const e=R().event,buttons=[...panel.querySelectorAll('button')].filter(b=>!b.closest('dialog'));
  if(!buttons.length)return;panel.dataset.choices135='true';panel.classList.add('event135-panel');host.classList.add('event135-workspace');
  const narrative=document.createElement('div');narrative.className='event135-narrative';const options=document.createElement('div');options.className='event135-options';
  const tools=document.createElement('div');tools.className='event135-tools';
  for(const button of buttons){
   if(button.getAttribute('onclick')==='FrontierEquipmentUI139.manage()'){button.textContent='配置詞條';button.classList.add('event135-tool');tools.append(button);continue}
   const article=button.closest('article'),label=button.querySelector('b,strong'),effect=button.querySelector('small,:scope>span');
   const plain=button.cloneNode(true);plain.querySelectorAll('small,:scope>span:not(.currency-icon),img,svg,i').forEach(n=>n.remove());
   let title=text(label)||text(plain)||text(button),detail=text(effect)||description(button,e);
   if(title==='交換收藏品或詞條')title='交換奇物或詞條';
   const parts=title.split(/\s*·\s*/);if(parts.length>1&&!detail){title=parts.shift();detail=parts.join(' · ')}
   const icon=art(button);
   if(article&&e.id==='gift_choice'){const item=e.gifts?.[buttons.indexOf(button)],d=FrontierInventory.definitions[item?.itemId];title=article.querySelector('h3')?.textContent||title;if(d){button.dataset.itemId=d.id;const grade=({2:'白階',3:'綠階',4:'藍階',5:'銀階',6:'金階',7:'紅階'})[d.rarity]||'',category=({material:'素材',equipment:'裝備',medicine:'戰術補給',record:'作戰紀錄',collection:'收藏品'})[d.category]||'物品';detail=grade+category+' ×'+(item.qty||1)+' · '+(d.gridSize?.w||1)+'×'+(d.gridSize?.h||1)+' 格；裝入背包並撤離後保留。'}const image=article.querySelector('img,svg');if(image)button.prepend(image)}

   const image=art(button)||icon;
   const titleNode=document.createElement('b');titleNode.className='event135-choice-title';titleNode.textContent=title;
   const detailNode=document.createElement('small');detailNode.className='event135-choice-effect';detailNode.textContent=detail;
   button.replaceChildren(...(image?[image]:[]),titleNode,...(detail?[detailNode]:[]));button.classList.add('event135-choice');const hint=optionHint(button,e,detail);button.dataset.event136Hint=hint;const mark=document.createElement('i');mark.className='event136-hint';mark.setAttribute('aria-hidden','true');mark.style.backgroundImage='url("assets/events136/option-'+hint+'.png")';button.append(mark);options.append(button);
  }
  for(const node of [...panel.children])if(!node.matches('.row,.cards,.reward139-options,.event135-options,.event135-tools')&&!node.querySelector('button')&&!node.matches('button'))narrative.append(node);
  if(tools.children.length)narrative.append(tools);
  const region=R().expedition?.regionId,factions={chernobog:'ursus',kazdel:'babel'},emblem=document.createElement('img');emblem.className='event135-emblem';emblem.alt='';emblem.setAttribute('aria-hidden','true');emblem.src='assets/regions/'+(factions[region]||region)+'.png';narrative.prepend(emblem);
  panel.style.setProperty('--event136-scene','url("assets/events136/scene-'+sceneFor(e,R())+'.webp")');panel.replaceChildren(narrative,options);fit(panel);
 }
 let fitFrame139=0;const refit139=()=>{cancelAnimationFrame(fitFrame139);fitFrame139=requestAnimationFrame(()=>{fitFrame139=0;const panel=document.querySelector('#app .event135-panel');if(panel){fit(panel);window.dispatchEvent(new Event('frontier:event-fit'))}})};
 addEventListener('resize',refit139);window.visualViewport?.addEventListener('resize',refit139);document.fonts?.addEventListener('loadingdone',refit139);
 const draw=render;render=function(...args){const result=draw.apply(this,args);decorate();return result};
 const observer=new MutationObserver(()=>decorate());observer.observe(document.getElementById('app'),{childList:true,subtree:true});
 let frame=0;addEventListener('resize',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>document.querySelectorAll('.event135-panel').forEach(fit))});
 const style=document.createElement('style');style.textContent=`
 .event135-workspace{overflow-y:auto!important;overscroll-behavior:contain;gap:6px!important}
 .event135-workspace>.event135-panel{display:flex!important;flex-direction:column;gap:14px;flex:none;max-height:none!important;overflow:visible!important;padding:14px!important;border:0;background:linear-gradient(135deg,#182a33,#101b23)}
 .event135-workspace>.compact-run-summary span{display:none}.event135-tools{display:flex;justify-content:flex-end;gap:5px}.event135-tools>.event135-tool{min-height:44px!important;padding:7px 10px!important;font-size:12px!important;background:#1d3039;border:1px solid #4d6873}.event135-narrative:has(.event135-tools)>h1,.event135-narrative:has(.event135-tools)>h2{padding-right:78px}.event135-tools{position:absolute;right:0;top:0}
 .event135-narrative{flex:none;border-bottom:1px solid #56707a;padding-bottom:12px}.event135-narrative h1,.event135-narrative h2{font-size:21px!important;line-height:1.25;margin:5px 0 10px!important}.event135-narrative p{font-size:14px!important;line-height:1.55!important;margin:6px 0!important;color:#d0dee2}.event135-narrative p.tiny{font-size:11px!important;color:#a3bbc3}.event135-narrative>small,.event135-narrative>.eyebrow{font-size:10px;letter-spacing:1px;color:#94bac7}.event135-narrative .event-scene,.event135-narrative .passage16-emblem{display:none}
 .event135-options{display:flex!important;flex-direction:column;gap:8px!important;width:100%;margin:0!important}
 .event135-options>.event135-choice{display:grid!important;grid-template-columns:minmax(0,1fr);align-content:center;gap:5px;position:relative;min-height:66px!important;width:100%;margin:0!important;padding:11px 15px!important;border:1px solid #50666e;border-left:3px solid #97afbb;background:linear-gradient(100deg,#20343f,#15232d);border-radius:0;text-align:left;white-space:normal!important;overflow-wrap:anywhere;box-shadow:none;touch-action:manipulation}
 .event135-options>.event135-choice.primary{border-left-color:#d2df85;background:linear-gradient(100deg,#344337,#1b2d2b);color:#f2f6df}.event135-options>.event135-choice:disabled{opacity:.48}.event135-options>.event135-choice:active{background:#395260}
 .event135-choice-title{font-size:17px!important;font-weight:600!important;line-height:1.25!important;color:#eef5f7}.event135-choice-effect{font-size:12px!important;line-height:1.4!important;color:#b4cbd5;white-space:normal!important}.event135-choice>img,.event135-choice>svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:38px!important;height:38px!important;object-fit:contain}.event135-choice:has(>img),.event135-choice:has(>svg){padding-left:62px!important}
 .event135-workspace>.event135-panel{background:linear-gradient(150deg,#18242c88,#0c151b44)}
 .event135-narrative{position:relative;isolation:isolate}.event135-emblem{position:absolute;right:0;top:0;width:92px;height:92px;object-fit:contain;opacity:.08;z-index:-1;pointer-events:none}
 .event135-narrative:after{content:'';position:absolute;bottom:-1px;left:0;width:42px;height:2px;background:#b9cbd3}
 .event135-options>.event135-choice{padding-right:31px!important;border:0;border-left:2px solid #a9bac3;background:linear-gradient(100deg,#26333bd9 0%,#1b2933ef 72%,#101b24e8 100%);clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%);box-shadow:inset 0 -1px #60737d77}
 .event135-options>.event135-choice:after{content:'';position:absolute;right:14px;top:50%;width:6px;height:6px;border-top:1px solid #b5c7d0;border-right:1px solid #b5c7d0;transform:translateY(-50%) rotate(45deg)}
 .event135-options>.event135-choice.primary{background:linear-gradient(100deg,#394137dd,#25322ded 72%,#14201ee8 100%);border-left-color:#d5df91}
 .event135-choice-effect{font-weight:400!important;letter-spacing:.1px}.event135-choice-title{letter-spacing:.4px}
 .event135-panel[data-density=compact]{gap:10px!important;padding:10px!important}.event135-panel[data-density=compact] .event135-narrative p{font-size:13px!important;line-height:1.4!important}.event135-panel[data-density=compact] .event135-options{gap:6px!important}.event135-panel[data-density=compact] .event135-choice{min-height:58px!important;padding-top:8px!important;padding-bottom:8px!important}.event135-panel[data-density=compact] .event135-choice-title{font-size:16px!important}
 @media(max-height:650px){.event135-workspace>.compact-run-summary{display:none}}
 .event135-panel[data-density=tight]{gap:7px!important;padding:8px!important}.event135-panel[data-density=tight] .event135-narrative{padding-bottom:7px}.event135-panel[data-density=tight] .event135-narrative h1,.event135-panel[data-density=tight] .event135-narrative h2{font-size:18px!important;margin:3px 0 6px!important}.event135-panel[data-density=tight] .event135-narrative p{font-size:12px!important;line-height:1.3!important;margin:4px 0!important}.event135-panel[data-density=tight] .event135-options{gap:5px!important}.event135-panel[data-density=tight] .event135-choice{min-height:48px!important;padding:6px 12px!important;gap:3px!important}.event135-panel[data-density=tight] .event135-choice-title{font-size:15px!important}.event135-panel[data-density=tight] .event135-choice-effect{font-size:11px!important;line-height:1.3!important}.event135-panel[data-density=tight] .event135-choice:has(>img),.event135-panel[data-density=tight] .event135-choice:has(>svg){padding-left:58px!important}

 .event135-workspace>.event135-panel{position:relative;isolation:isolate;box-sizing:border-box;gap:18px;padding:18px!important;background:#0e1920;overflow:hidden!important}
 .event135-workspace>.event135-panel:before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(180deg,#07101880,#0b151d55 35%,#071018a8 100%),var(--event136-scene);background-size:cover;background-position:center;background-repeat:no-repeat}
 .event135-narrative{padding:8px 4px 14px;text-shadow:0 1px 3px #0008}.event135-emblem{display:none}.event135-narrative h1,.event135-narrative h2{font-size:23px!important}.event135-narrative p{font-size:14px!important;color:#edf1f3}
 .event135-options{flex:1;min-height:0;gap:12px!important;justify-content:center;padding-block:22px;box-sizing:border-box}
 .event135-panel .event135-options>button.event135-choice{margin:0!important}
 .event135-options>.event135-choice{flex:1 1 0;min-height:84px!important;max-height:144px;padding:16px 18px!important;gap:7px;background:linear-gradient(100deg,#17252eea,#15212bc9);box-shadow:inset 0 -1px #91a3ad55;isolation:isolate}
 .event135-options>.event135-choice.primary{background:linear-gradient(100deg,#26332be8,#1b2926cc)}.event135-options>.event135-choice:after{display:none}
 .event135-choice-title{font-size:19px!important;position:relative;z-index:1}.event135-choice-effect{font-size:13px!important;line-height:1.45!important;position:relative;z-index:1;color:#c3d0d7}
 .event135-choice>.event136-hint{position:absolute!important;right:12px;top:50%;width:86px;height:86px;max-height:88%;background-color:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;filter:none!important;transform:translateY(-50%);background-size:contain;background-repeat:no-repeat;background-position:center;opacity:.14;pointer-events:none;z-index:0}
 .event135-choice:has(>img),.event135-choice:has(>svg){padding-left:68px!important}
 .event135-panel[data-density=compact]{gap:11px!important;padding:11px!important}.event135-panel[data-density=compact] .event135-options{padding-block:12px;gap:7px!important}.event135-panel[data-density=compact] .event135-choice{min-height:60px!important;padding:10px 13px!important}.event135-panel[data-density=compact] .event135-choice-title{font-size:17px!important}.event135-panel[data-density=compact] .event135-choice-effect{font-size:12px!important}
 .event135-panel[data-density=tight]{gap:6px!important;padding:8px!important}.event135-panel[data-density=tight] .event135-narrative{padding:0 0 6px}.event135-panel[data-density=tight] .event135-options{padding-block:6px;gap:4px!important}.event135-panel[data-density=tight] .event135-choice{min-height:44px!important;padding:5px 11px!important}.event135-panel[data-density=tight] .event135-choice-title{font-size:15px!important}.event135-panel[data-density=tight] .event135-choice-effect{font-size:11px!important;line-height:1.3!important}.event135-panel[data-density=tight] .event136-hint{width:54px;height:54px;opacity:.11}
 `;document.head.append(style);return{decorate,fit};
})();
