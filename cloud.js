'use strict';
window.FrontierCloud=(()=>{
 const serialize=fn=>window.navigator?.locks?navigator.locks.request('frontier-cloud-branch',fn):fn();
 let account=null,revision=0,blocked=false,bound=false,status='local',uncertain=null,baseCommit=null,offline=false,syncing=null;
 const deviceKey='frontier-last-doctor', read=k=>{try{return JSON.parse(window.localStorage.getItem(k))}catch{return null}};
 const branchKey=()=>FrontierStorage.key+'-offline-branch', branch=()=>read(branchKey());
 const write=(k,v)=>window.localStorage.setItem(k,JSON.stringify(v));
 const disconnected=e=>!e.status||e.status>=500;
 function remember(){try{write(deviceKey,{account,revision})}catch{}}
 function startOffline(parent=null){if(!branch())write(branchKey(),{revision,parent});offline=true;notice('offline')}

 const api=(route,data)=>FrontierIdentity.api(route,data),copy=v=>JSON.parse(JSON.stringify(v));
 function info(){return{account,revision,blocked,status,offline,onlineRequired:!!account&&!offline&&FrontierStorage.profile!=='developer'}}
 function notice(message){status=message;document.dispatchEvent(new CustomEvent('frontier:cloud-status',{detail:info()}))}
 async function prepare(person,localOnly=false){if(bound)throw Error('雲端帳號已初始化，切換身分需要重新載入。');account=person;FrontierStorage.configureAccount(person.id);const storageState=await FrontierStorage.initialize();if(storageState.status==='error'&&(FrontierStorage.profile==='developer'||!storageState.conflict))throw Error(storageState.error);if(FrontierStorage.profile==='developer'){bound=true;notice('developer-local');return}let remote;
 if(!localOnly)try{remote=await api('save')}catch(e){if(!disconnected(e))throw e;localOnly=true}
 if(localOnly||branch()){
  const cached=read(deviceKey);
  if(!FrontierStorage.getItem(FrontierStorage.key)||storageState.status==='error'||!branch()&&cached?.account?.id!==person.id)throw Error('這台裝置沒有可安全開啟的離線存檔。');
  revision=branch()?.revision??cached.revision;startOffline();bound=true;bindCommit();return;
 }
 revision=remote.revision;const key=FrontierStorage.key,local=FrontierStorage.getItem(key);if(remote.state){const raw=JSON.stringify(remote.state);if(storageState.conflict||storageState.mirrorsDiffer||local!==raw)await FrontierStorage.adoptCloud(raw)}else if(storageState.conflict){throw Error(storageState.error)}else if(!local){const legacy=await FrontierStorage.readRecord('rhodes-frontier-v1');if(legacy)await chooseLegacy(legacy,key)}bound=true;bindCommit();remember();notice('ready')}
 function chooseLegacy(raw,key){return new Promise(resolve=>{const host=document.createElement('section');host.id='cloud-adoption';host.className='cloud-adoption';host.innerHTML='<div class="prts-terminal"><div class="eyebrow">PRTS / NEW ACCOUNT SAVE</div><h1>為新身分選擇旅程</h1><p>此帳號目前沒有雲端存檔。可沿用這個裝置的原有匿名旅程，或建立全新旅程。原匿名檔會完整保留。</p><button id="cloud-adopt">沿用原有旅程</button><button id="cloud-fresh">建立全新旅程</button><p id="cloud-adopt-error" role="alert"></p></div>';document.body.append(host);document.body.classList.add('identity-mode');async function done(adopt){host.querySelectorAll('button').forEach(b=>b.disabled=true);try{if(adopt){const parsed=JSON.parse(raw);if(![1,2].includes(parsed.version)||parsed.testing)throw Error('原檔格式不相容或是開發者測試檔，請先保留備份。');await FrontierStorage.backup('rhodes-frontier-v1-before-account-'+account.id,raw);FrontierStorage.setItem(key,raw);if(!await FrontierStorage.flush())throw Error('旅程副本尚未保存。')}host.remove();document.body.classList.remove('identity-mode');resolve()}catch(e){host.querySelector('#cloud-adopt-error').textContent=e.message;host.querySelectorAll('button').forEach(b=>b.disabled=false)}}host.querySelector('#cloud-adopt').onclick=()=>done(true);host.querySelector('#cloud-fresh').onclick=()=>done(false)})}
 function bindCommit(){const localCommit=FrontierStorage.commit;baseCommit=localCommit;FrontierStorage.commit=(value,expected=FrontierStorage.info().revision)=>serialize(async()=>{if(offline||!blocked&&(branch()||window.navigator?.onLine===false)){startOffline();return localCommit(value,expected)}if(blocked)throw Error('另一個裝置的進度仍待確認；本機備份已保留，請先處理版本衝突。');if(expected!==FrontierStorage.info().revision)throw Error('本機進度已變更，請重新載入。');const snapshot=copy(value),operationId=crypto.randomUUID(),request={revision,operationId,state:snapshot};notice('saving');const finish=async result=>{revision=result.revision;uncertain=null;const authoritative=result.state||snapshot;await localCommit(authoritative,expected);if(result.state){if(authoritative.operations)value.operations=copy(authoritative.operations);if(value.run?.result&&authoritative.run?.number===value.run.number&&authoritative.run.surveySettlement27){value.survey27=copy(authoritative.survey27);value.run.surveySettlement27=copy(authoritative.run.surveySettlement27);const record=value.statistics?.raids?.find(x=>x.number===value.run.number);if(record)record.surveyPoints27=authoritative.run.surveySettlement27.points;}if(value.run?.result&&authoritative.run?.number===value.run.number&&authoritative.run.talentInfo44){value.talents43=copy(authoritative.talents43);value.intel=authoritative.intel;value.history=copy(authoritative.history);value.run.talentInfo43=authoritative.run.talentInfo43;value.run.talentInfo44=copy(authoritative.run.talentInfo44);}if(value.run&&authoritative.run?.number===value.run.number&&authoritative.run.recoveryDeparture)value.run.recoveryDeparture=copy(authoritative.run.recoveryDeparture);}remember();notice('saved');return true};try{return await finish(await api('save',request))}catch(e){if(!e.status||e.status>=500||e.status===409){try{const remote=await api('save');if(remote.lastOperation===request.operationId||JSON.stringify(remote.state)===JSON.stringify(snapshot))return await finish(remote);if(remote.revision===request.revision&&e.status!==409)return await finish(await api('save',request))}catch(recovery){e=recovery}}if(disconnected(e)){startOffline(request.operationId);return localCommit(value,expected)}const permanent=[400,401,403,413,429].includes(e.status);blocked=!permanent;uncertain=!permanent&&e.status!==409?{request,snapshot}:null;notice(e.status===409?'conflict':permanent?'rejected':'uncertain');if(e.status===409||!permanent)try{await FrontierStorage.backup(FrontierStorage.key+'-before-cloud-recovery-'+Date.now(),JSON.stringify(snapshot))}catch{}throw Error(e.status===409?'偵測到其他裝置的新進度；未覆蓋任何存檔，本次操作已備份。':permanent?(e.message||'雲端未接受本次操作，原進度保留。'):'連線暫時無法確認；本次操作與原進度已保留，不需反覆重新整理。')}})}

 async function recover(){if(syncing){await syncing;return{ready:true}}if(!blocked)return{ready:true};if(status==='conflict'||!uncertain)return{ready:false,conflict:true};try{const remote=await api('save');if(remote.lastOperation===uncertain.request.operationId||JSON.stringify(remote.state)===JSON.stringify(uncertain.snapshot)){if(typeof validSave==='function'&&!validSave(remote.state))throw Error('恢復資料格式不相容。');await baseCommit(remote.state,FrontierStorage.info().revision);revision=remote.revision;blocked=false;uncertain=null;notice('saved');return{ready:true,state:remote.state}}if(remote.revision===uncertain.request.revision){revision=remote.revision;blocked=false;uncertain=null;notice('ready');return{ready:true}}notice('conflict');return{ready:false,conflict:true}}catch{notice('uncertain');return{ready:false}}}

 async function syncOffline(){
  if(!offline||syncing||window.navigator?.onLine===false||window.FrontierRuntime?.busy||!window.FrontierBootReady)return;
  const pending=branch();if(!pending)return;
  const expected=FrontierStorage.info().revision;
  const state=JSON.parse(FrontierStorage.getItem(FrontierStorage.key));
  const operationId=pending.operationId&&pending.localRevision===expected?pending.operationId:crypto.randomUUID();
  blocked=true;
  syncing=serialize(async()=>{try{
   if(!branch()||await FrontierStorage.readRecord(FrontierStorage.key)!==JSON.stringify(state))return;
   const session=await api('session');
   if(session.account.id!==account.id)throw Object.assign(Error('博士帳號已切換'),{status:401});
   const remote=await api('save');
   let result;
   if(remote.lastOperation===operationId)result=remote;
   else {
    const knownOperation=remote.lastOperation&&(remote.lastOperation===pending.operationId||remote.lastOperation===pending.parent);
    const base=knownOperation?remote.revision:pending.revision;
    if(remote.revision!==base)throw Object.assign(Error('雲端進度已變更'),{status:409});
    write(branchKey(),{revision:base,operationId,localRevision:expected,parent:pending.parent});
    result=await api('offline-sync',{revision:base,operationId,state,confirm:'IMPORT'});
   }
   await baseCommit(result.state||state,expected);
   revision=result.revision;remember();window.localStorage.removeItem(branchKey());offline=false;
   if(result.state&&JSON.stringify(result.state)!==JSON.stringify(state)){db=copy(result.state);render()}
   notice('saved');
  }catch(e){notice(e.status===409?'offline-conflict':e.status===401||e.status===403?'offline-auth':e.status===400?'offline-rejected':'offline')}
  });
  try{await syncing}finally{blocked=false;syncing=null}
 }
 window.addEventListener?.('online',syncOffline);
 window.addEventListener('frontier:boot',syncOffline);
 window.setInterval?.(()=>{if(status==='offline')syncOffline()},12000);
 async function restart(pin){if(offline)throw Error('請先連線並同步離線進度。');if(!account||FrontierStorage.profile==='developer')throw Error('請在已登入的正式帳號重啟旅程。');if(FrontierRuntime.busy)throw Error('目前操作仍在保存，請稍後再試。');if(!/^\d{6}$/.test(pin))throw Error('請輸入目前帳號的六位PIN。');const wasBlocked=blocked;blocked=true;let changed=false;try{await FrontierStorage.flush();const remote=await api('save'),key=FrontierStorage.key,at=Date.now(),local=FrontierStorage.getItem(key);if(local)await FrontierStorage.backup(key+'-before-restart-local-'+at,local);if(remote.state)await FrontierStorage.backup(key+'-before-restart-cloud-'+at,JSON.stringify(remote.state));const result=await api('restart',{pin,confirm:'RESTART',revision:remote.revision,operationId:crypto.randomUUID()});changed=true;revision=result.revision;FrontierStorage.setItem(key,JSON.stringify(result.state));if(!await FrontierStorage.flush())throw Error('帳號已重啟，請重新載入以讀取新旅程。');remember();notice('ready');return result}catch(e){blocked=changed||e.status>=500||e.status==null?true:wasBlocked;notice(blocked?'uncertain':'ready');throw e}}
 async function replaceSnapshot(route,data,recovery=false){
  if(!account||offline||FrontierStorage.profile==='developer')throw Error('請先連線並同步離線進度。');if(window.FrontierRuntime?.busy||blocked&&!recovery)throw Error('請先等待目前操作完成，或重新載入確認雲端進度。');
  const expected=FrontierStorage.info().revision,operationId=crypto.randomUUID(),stamp=Date.now()+'-'+operationId,wasBlocked=blocked;let submitted=false;blocked=true;
  const finish=async result=>{if(!result.state)throw Error('伺服器未回傳復原資料，請重新載入。');revision=result.revision;await baseCommit(result.state,expected);remember();blocked=false;uncertain=null;notice('saved');return result.state};
  try{await FrontierStorage.flush();const remote=await api('save');if(remote.revision!==revision){const e=Error('另一個裝置已有新進度，原存檔保留。');e.status=409;throw e}
   const request={...data,revision,operationId};
   if(route==='import'&&!recovery){
    const preview=await api('import-preview',request);
    if(!preview.preview||!preview.state||typeof validSave!=='function'||!validSave(copy(preview.state))){
     const error=Error('PRTS｜這份存檔與目前版本不相容，雲端進度未變更。');error.status=400;throw error;
    }
    request.state=preview.state;
   }
   const key=FrontierStorage.key,local=FrontierStorage.getItem(key);if(local)await FrontierStorage.backup(key+'-before-'+(recovery?'cloud-recovery':route)+'-local-'+stamp,local);if(remote.state)await FrontierStorage.backup(key+'-before-'+(recovery?'cloud-recovery':route)+'-cloud-'+stamp,JSON.stringify(remote.state));
   submitted=true;uncertain={request:{revision,operationId},snapshot:null};return await finish(await api(route,request));
  }catch(error){if(submitted&&uncertain)try{const remote=await api('save');if(remote.lastOperation===operationId)return await finish(remote)}catch{}blocked=submitted?(!error.status||error.status>=500||error.status===409):wasBlocked||error.status===409;notice(blocked?'uncertain':'rejected');if(!blocked)uncertain=null;throw error}
 }
 const importSnapshot=value=>replaceSnapshot('import',{state:copy(value),confirm:'IMPORT'});
 async function restoreImportBackup(){
  if(window.FrontierBootReady||!info().onlineRequired)throw Error('此操作只適用於受保護的雲端存檔。');
  const prefix=FrontierStorage.key+'-before-import-cloud-';
  const key=(await FrontierStorage.listBackups(account.id)).filter(k=>k.startsWith(prefix)).at(-1);
  if(!key)throw Error('這台裝置找不到上次匯入前的雲端備份。請回到執行匯入的裝置。');
  const raw=await FrontierStorage.readRecord(key);
  if(!raw)throw Error('上次匯入前的備份無法讀取。');
  return replaceSnapshot('import',{state:JSON.parse(raw),confirm:'IMPORT'},true);
 }
 const emergencyCancel=()=>replaceSnapshot('emergency-cancel',{confirm:'CANCEL_RUN'});
 return{prepare,info,syncOffline,lastDoctor:()=>read(deviceKey)?.account,forget:()=>window.localStorage.removeItem(deviceKey),chooseLegacy,restart,recover,importSnapshot,restoreImportBackup,emergencyCancel,potentialChange:(type,operator,count)=>replaceSnapshot('potential-'+type,{operator,...(type==='exchange'?{count}:{})}),mailClaim:mailId=>replaceSnapshot('mail-claim',{mailId}),mailRedeem:operator=>replaceSnapshot('mail-redeem',{operator})};
})();
