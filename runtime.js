'use strict';
// M03: each player action produces one durable snapshot containing its own receipt.
window.FrontierRuntime = (()=>{
  let active=false,busy=false;const queued=[];const context=()=>[typeof page==='string'?page:'',db.run?.number||0,db.run?.result||'',db.run?.battle?'battle:'+db.run.battle.turn:db.run?.reward?'reward':db.run?.event?.type||'route',db.run?.event?.box?.uid||db.containers?.activeBox||''].join(':');function drain(){const next=queued.shift();if(!next)return;if(next.context!==context()){next.resolve(false);drain();return}queueMicrotask(()=>perform(next.label,next.action,next.id).then(next.resolve))}
  function view(action){try{return action()}catch(e){toast(e.message||'畫面暫時無法開啟。',{level:'error',details:e.stack});return false}}
  function paintSelection(){const b=R()?.battle;if(!b)return;for(const el of document.querySelectorAll('.hand .play-card[data-hand-index]')){const picked=Number(el.dataset.handIndex)===selected;el.classList.toggle('picked',picked);el.setAttribute('aria-pressed',String(picked))}for(const el of document.querySelectorAll('.enemy-card'))el.classList.toggle('targetable',selected!==null&&!el.disabled);const caption=document.querySelector('.hand-caption>span:first-child:not(:only-child)');if(caption)caption.textContent=selected!==null&&b.hand[selected]?'已選：'+cardName(b.hand[selected])+' → 點選上方敵人':'拖攻擊牌到敵人；戰術牌向上拖出。也可點按，長按查看。'}
  const copy=value=>JSON.parse(JSON.stringify(value));
  const balance=()=>({credits:db.credits,intel:db.intel,materials:copy(db.world?.materials||{}),balls:copy(db.world?.balls||{}),stock:copy(db.stock),wallet:copy(db.wallet||{}),trainingMaterials:copy(db.progress?.materials||{}),records:copy(db.progress?.records||{})});
  async function perform(label,action,id){
    if(window.FrontierStorage&&!window.FrontierBootReady)return false;if(busy)return new Promise(resolve=>{if(queued.length>=40){resolve(false);return}queued.push({label,action,id,resolve,context:context()})});if(db.session?.paused&&!/^(FrontierSession\.|exportSave|resume$|system-save$|pause$)/.test(label)){toast('旅程暫停中，請先選擇繼續旅程。');return false;}
    busy=true;let before,beforeRaw,priorPage=page,priorSelected=selected,batched=false;
    try{
      if(window.FrontierCloud?.info().blocked){const recovery=await FrontierCloud.recover();if(!recovery.ready)throw Error(recovery.conflict?'其他裝置有不同進度，已保留本機備份，請勿覆蓋。':'網路仍未連線；恢復連線後直接重試即可，不需反覆重新整理。');if(recovery.state){db=copy(recovery.state);selected=null;render();toast('上次操作已確認並恢復，可以繼續。');return false}}
      if(window.FrontierEquipmentRegistry139?.ready)await FrontierEquipmentRegistry139.ready;
      if(window.FrontierStorage)await FrontierStorage.flush();
      const expected=window.FrontierStorage?.info().revision;
      beforeRaw=JSON.stringify(db);before=JSON.parse(beforeRaw);
      if(id&&db.meta?.receipts?.includes(id))return false;
      const acquisitionContext=window.FrontierAcquisition140?.context();const from=balance();window.FrontierRandom?.setContext(label);active=true;window.FrontierOperatorGameV113?.freezeGrowth();batched=window.FrontierRender32?.begin()||false;const result=await action();active=false;
      globalThis.FrontierCombatMetricsV18?.reconcile(before.run,db.run,db);if(db.run)globalThis.FrontierCombatMetricsV18?.commit(db,db.run,db.run.battle);window.FrontierStatistics?.finalize?.();
      if(beforeRaw===JSON.stringify(db)){
        window.FrontierRender32?.end(batched,true);batched=false;
        if(beforeRaw===JSON.stringify(db))return result??true;
      }
      window.FrontierSearch141?.syncActive();window.FrontierGrid?.sync();window.FrontierPotential?.sync();window.FrontierOperations?.ensure();
      window.FrontierAchievementRecords?.update(before,db);
      const surveyFinalized=window.FrontierSurveyEngineV27?.finalize(before,db);if(window.FrontierTalent43?.finalize(before,db)||surveyFinalized)render();
      window.FrontierRender32?.end(batched,true);batched=false;
      if(!validSave(db))throw Error('操作產生不合法資料，已取消。');
      db.meta??={schema:1,seq:0,ledger:[],receipts:[]};
      const seq=++db.meta.seq,transactionId=id||'action:'+seq;
      db.meta.receipts.push(transactionId);
      db.meta.ledger.push({id:transactionId,seq,at:Date.now(),type:String(label).slice(0,120),run:db.run?.number||null,from,to:balance()});
      // Recent details are bounded; permanent reward IDs remain in receipts.
      if(db.meta.ledger.length>256){if(!db.meta.ledgerArchiveVersion&&window.FrontierStorage){await FrontierStorage.backup(FrontierStorage.key+'-before-cloud-ledger-'+seq,JSON.stringify(before));db.meta.ledgerArchiveVersion=1}db.meta.ledger.splice(0,db.meta.ledger.length-256);}
      const submittedTalentInfo=db.run?.talentInfo44,submittedSurvey=db.run?.surveySettlement27;
      if(window.FrontierStorage)await FrontierStorage.commit(db,expected);
      else if(!FrontierSaveGuard.write(db))throw Error('儲存失敗，操作未完成。');
      if(submittedTalentInfo!==db.run?.talentInfo44||submittedSurvey!==db.run?.surveySettlement27)view(render);
      document.dispatchEvent?.(new CustomEvent('frontier:committed',{detail:{id:transactionId,seq}}));
      try{window.FrontierAcquisition140?.committed(before,db,label,acquisitionContext)}catch(e){console.warn('Acquisition display:',e)}
      if(before.run&&!before.run.result&&db.run?.number===before.run.number&&db.run.result){
        const cloud=window.FrontierCloud?.info();
        const message=cloud?.status==='saved'?'結算已儲存至雲端':cloud?.offline?'結算已儲存至本機，連線後自動同步':'結算已儲存至本機';
        toast('PRTS｜'+message);
      }
      return result??true;
    }catch(e){
      window.FrontierRender32?.end(batched,false);batched=false;if(before)db=before;page=priorPage;selected=priorSelected;closeModal();render();toast(e.message||'操作未完成，進度已回復。',{level:'error',details:e.stack});return false;
    }finally{window.FrontierRender32?.end(batched,false);active=false;busy=false;document.body?.classList.remove('save-busy');drain()}
  }
  function persist(){
    // Module initialization is staged in memory. finish() commits the complete
    // snapshot once; reverting db here discards migrations before boot is ready.
    if(window.FrontierStorage&&!window.FrontierBootReady)return true;
    if(busy)return false;
    const target=copy(db);let previous;
    try{previous=JSON.parse(FrontierSaveGuard.read())}catch{return false}
    if(!previous)return false;
    db=previous;
    perform('system-save',()=>{db=target}).then(()=>render());
    return true;
  }
  function purchaseScroll(element){
    const token=context(),positions=[];
    for(let node=element.parentElement;node&&node!==document.documentElement;node=node.parentElement){
      if(node.scrollHeight<=node.clientHeight)continue;
      const route=[];let current=node;
      while(current&&current!==document.body){route.unshift([...current.parentElement.children].indexOf(current));current=current.parentElement}
      positions.push({node,route,top:node.scrollTop});
    }
    const top=window.scrollY;
    const selector=element.hasAttribute('data-survey-buy')?'[data-survey-buy]':'[onclick]';
    const code=element.getAttribute(selector.slice(1,-1)),offset=element.getBoundingClientRect().top;
    function restore(){
      if(token!==context())return;
      window.scrollTo({top,behavior:'instant'});
      for(const saved of positions){const node=saved.node.isConnected?saved.node:saved.route.reduce((parent,index)=>parent?.children[index],document.body);if(node)node.scrollTop=saved.top}
      const anchor=[...document.querySelectorAll(selector)].find(node=>node.getAttribute(selector.slice(1,-1))===code&&node.getClientRects().length);
      for(let scroller=anchor?.parentElement;scroller;scroller=scroller.parentElement)if(scroller.scrollHeight>scroller.clientHeight&&['auto','scroll'].includes(getComputedStyle(scroller).overflowY)){
        scroller.scrollTop+=anchor.getBoundingClientRect().top-offset;break;
      }
    }
    return ()=>requestAnimationFrame(restore);
  }
  function batchRender(action){
    const draw=render;
    let pending=false;
    render=()=>{pending=true};
    try{return action()}finally{render=draw;if(pending)draw()}
  }
  // Inline UI handlers remain compatible. Capture them once, including confirmation buttons.
  document.addEventListener('click',event=>{
    if(window.FrontierGestures?.suppressClick(event)){event.preventDefault();event.stopImmediatePropagation();return}
    const el=event.target.closest?.('[onclick]');if(!el||el.disabled)return;
    const handler=el.onclick;if(typeof handler!=='function')return;
    event.preventDefault();event.stopImmediatePropagation();
    const code=el.getAttribute('onclick')||'';const pureCall=/^(?:go|closeModal|FrontierScreen\.(?:openTool|closeTool|openEntry|openCatalog|openForecast|openPrep|openSquad|operator|choose|routeLegend)|FrontierPrep149\.(?:openMed|pickMed|device|ticket|clearTicket|confirmTicket|doctor|doctorFilter|toggleDoctor)|FrontierRecruitUI144\.(?:open|ticket|targets|selectCandidate|presets|gear)|FrontierRecruitmentUI\.(?:select|openPublic|setHours|stepHours|setTag)|FrontierOperations\.show|FrontierContainers\.(?:focusSearch|showSearchDoor)|FrontierGrid\.(?:choose|inspect)|FrontierCurios\.(?:view|viewOffer|archive)|FrontierGrowth\.(?:filter|detail|requirements)|FrontierViewZoom\.change|FrontierSupport\.choose|FrontierVisualUI\.(?:details|shelf|filterStorage|sort))\((?:[^'"(){};]|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")*\)\s*;?\s*$/.test(code);if(pureCall||/^selectCard\(\d+\)\s*;?\s*$/.test(code)&&el.classList.contains('attack')){view(()=>handler.call(el,event));return}
    document.body.classList.add('save-busy');
    const restore=/^(?:buyOffer|[\w.]+\.(?:buy|fieldBuy|buyMarket))\(/.test(code)?purchaseScroll(el):null;const aimed=/^targetEnemy\(/.test(code),battle=aimed?R()?.battle:null,card=aimed?battle?.hand[selected]:null;perform(code.split('(')[0],()=>{if(aimed){const current=R()?.battle,index=R()?.operatorSystemVersion===113&&current?.operatorBattleId===battle?.operatorBattleId?current.hand.findIndex(c=>c.uid===card?.uid):current===battle?battle.hand.indexOf(card):-1;if(index<0)return false;selected=index}try{return /^(?:FrontierScreen\.routeClick|FrontierExpedition\.enterNode|FrontierLootGrid\.(?:click|collect)|FrontierContainers\.(?:openBase|openCarried|reveal|take|takeAll))\(/.test(code)?batchRender(()=>handler.call(el,event)):handler.call(el,event)}finally{restore?.()}}).then(ok=>{if(ok===false)restore?.()});
  },true);
  if(typeof window.addEventListener==='function')window.addEventListener('pagehide',()=>{if(busy)document.body.classList.add('save-busy')});
  return {perform,persist,view,paintSelection,purchaseScroll,get active(){return active},get busy(){return busy}};
})();


