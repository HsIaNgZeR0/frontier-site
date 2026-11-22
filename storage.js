'use strict';
// Device-local storage. IndexedDB snapshots and the localStorage fallback share revisions.
window.FrontierStorage = (() => {
  const profile=new URLSearchParams(window.location?.search||'').get('mode')==='developer'?'developer':'main';
  let BASE='rhodes-frontier-v1',KEY=BASE+(profile==='developer'?'-developer':''),META=KEY+'-storage-meta';
  let database=null, cache=new Map(), initialized=false, revision=0, queue=Promise.resolve(true), pending=0;
  let status='loading', error='', conflict=false, fallback=true, mirrorsDiffer=false, observedLocal=null, observedMeta=null, observedStored=null;
  const listeners=new Set();
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)}
  function emit(s,e=''){status=s;error=e;for(const fn of listeners)fn(info())}
  function info(){return{status,error,revision,pending,mirrorsDiffer,mode:database?'indexeddb':'localStorage',fallback,conflict}}
  function localRead(k){try{return localStorage.getItem(k)}catch{fallback=false;return null}}
  function localWrite(k,v){try{localStorage.setItem(k,v);if(localStorage.getItem(k)!==v)throw Error();return true}catch{fallback=false;return false}}
  function transaction(mode,run){return new Promise((resolve,reject)=>{let result;const tx=database.transaction('records',mode);tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(tx.error||Error('IndexedDB transaction failed'));try{run(tx.objectStore('records'),v=>result=v)}catch(e){tx.abort();reject(e)}})}
  function open(){return new Promise(resolve=>{
    if(!window.indexedDB){resolve(null);return}
    let settled=false,request;
    const finish=value=>{if(settled){if(value)value.close();return}settled=true;clearTimeout(timer);resolve(value)};
    const timer=setTimeout(()=>finish(null),2500);
    try{request=window.indexedDB.open('rhodes-frontier',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('records'))request.result.createObjectStore('records')};request.onsuccess=()=>finish(request.result);request.onerror=request.onblocked=()=>finish(null)}catch{finish(null)}
  })}
  async function initialize(){
    if(initialized)return info();
    initialized=true;const local=localRead(KEY);database=await open();let stored=null,meta=null;
    observedMeta=localRead(META);try{meta=JSON.parse(observedMeta||'null')}catch{}
    if(database){
      database.onversionchange=()=>{database.close();database=null;emit('degraded','儲存版本已更新，請重新開啟。')};
      try{stored=await transaction('readonly',(s,done)=>{const r=s.get(KEY);r.onsuccess=()=>done(r.result||null)})}catch{database.close();database=null}
    }
    observedLocal=local;observedStored=stored;mirrorsDiffer=!!stored&&local!==null&&local!==stored.raw;
    if(stored&&(stored.format!==1||typeof stored.raw!=='string'||stored.hash!==hash(stored.raw)||!Number.isSafeInteger(stored.revision))){conflict=true;emit('error','IndexedDB 存檔記錄不完整，已保留原資料。');return info()}
    const localKnown=meta?.format===1&&meta.hash===hash(local||'')&&Number.isSafeInteger(meta.revision);
    if(stored&&local!==null&&(!localKnown||stored.revision!==meta.revision))mirrorsDiffer=true;
    if(stored&&local!==null&&local!==stored.raw&&(!localKnown||meta.revision===stored.revision)){
      cache.set(KEY,local);cache.set(KEY+'-indexeddb-recovery',stored.raw);conflict=true;emit('error','兩份本地存檔內容衝突，已暫停寫入並保留兩份資料。');return info();
    }
    const chooseDB=stored&&(!localKnown||stored.revision>=meta.revision);
    let raw=chooseDB?stored.raw:local;
    if(raw===null&&profile==='developer'){
      if(database){try{const main=await transaction('readonly',(s,done)=>{const r=s.get(BASE);r.onsuccess=()=>done(r.result)});raw=main?.raw??null}catch{}}
      if(raw===null)raw=localRead(BASE);
    }
    revision=chooseDB?stored.revision:localKnown?meta.revision:0;
    if(raw!==null)cache.set(KEY,raw);
    if(database){for(const name of [KEY+'-pre-m01-backup',KEY+'-legacy-backup']){
      try{const record=await transaction('readonly',(s,done)=>{const r=s.get(name);r.onsuccess=()=>done(r.result)});if(record&&typeof record.raw==='string'&&record.hash===hash(record.raw))cache.set(name,record.raw)}catch{}
    }}
    if(!database&&!fallback){emit('error','瀏覽器不允許任何本地儲存。');return info()}
    emit(database?'saved':'degraded');return info();
  }
  function getItem(k){if(cache.has(k))return cache.get(k);const v=localRead(k);if(v!==null)cache.set(k,v);return v}
  function enqueue(k,value,rev){
    pending++;emit('saving');
    queue=queue.then(async()=>{
      if(!database)return fallback;
      try{await transaction('readwrite',s=>s.put({format:1,raw:value,revision:rev,hash:hash(value),at:Date.now()},k));return true}catch{return false}
    }).then(ok=>{pending--;if(!ok&&!fallback)emit('error','儲存失敗，請立即匯出目前進度。');else if(!pending)emit(ok&&database?'saved':'degraded');return ok||fallback});
    return queue;
  }
  // Cloud pulls replace mirrors together. Preserve every displaced snapshot before repairing.
  async function adoptCloud(value){
    const raw=String(value);
    const run=async()=>{
      await queue;
      const local=localRead(KEY),mirrorMeta=localRead(META);
      let meta=null;try{meta=JSON.parse(mirrorMeta||'null')}catch{}
      const stored=database?await transaction('readonly',(s,done)=>{const request=s.get(KEY);request.onsuccess=()=>done(request.result||null)}):null;
      if(local!==observedLocal||mirrorMeta!==observedMeta||stored?.revision!==observedStored?.revision||stored?.raw!==observedStored?.raw)
        throw Error('另一個分頁剛更新本機存檔，請重新開啟。');
      const stamp=crypto.randomUUID();
      for(const [kind,text] of [['local',local],['indexeddb',stored?.raw]]){
        if(typeof text==='string'&&text!==raw)await backup(KEY+'-before-cloud-mirror-'+stamp+'-'+kind,text);
      }
      const next=Math.max(revision,Number.isSafeInteger(stored?.revision)?stored.revision:0,Number.isSafeInteger(meta?.revision)?meta.revision:0)+1;
      if(localRead(KEY)!==local||localRead(META)!==mirrorMeta)throw Error('另一個分頁剛更新本機存檔，請重新開啟。');
      if(database){
        await transaction('readwrite',s=>{
          const request=s.get(KEY);
          request.onsuccess=()=>{
            if(request.result?.revision!==stored?.revision||request.result?.raw!==stored?.raw){s.transaction.abort();return}
            s.put({format:1,raw,revision:next,hash:hash(raw),at:Date.now()},KEY);
          };
        });
      }
      const mirrored=localWrite(KEY,raw)&&localWrite(META,JSON.stringify({format:1,revision:next,hash:hash(raw)}));
      if(!database&&!mirrored)throw Error('本機存檔無法寫入，雲端進度已保留。');
      cache.set(KEY,raw);revision=next;conflict=false;mirrorsDiffer=false;emit(database&&mirrored?'saved':'degraded');
    };
    return window.navigator?.locks?navigator.locks.request('rhodes-frontier-save',run):run();
  }
  function setItem(k,value){
    if(conflict&&k===KEY)throw Error('本機存檔版本有衝突，尚未覆寫。');
    value=String(value);let rev=k===KEY?revision+1:revision;
    const localOK=localWrite(k,value);
    if(!localOK&&!database)throw Error('storage unavailable');
    cache.set(k,value);
    if(k===KEY){revision=rev;if(localOK)localWrite(META,JSON.stringify({format:1,revision:rev,hash:hash(value)}))}
    if(database)enqueue(k,value,rev);else emit('degraded');
  }
  async function backup(k,value){
    // Backups are immutable. Confirm persistence, including IndexedDB when LS is unavailable.
    const existing=getItem(k);if(existing!==null)return existing;
    if(database){let prior=await transaction('readonly',(s,done)=>{const r=s.get(k);r.onsuccess=()=>done(r.result?.raw??null)});if(prior!==null){cache.set(k,prior);return prior}}
    setItem(k,value);if(!await queue)throw Error('backup failed');return getItem(k);
  }
  function write(value){try{setItem(KEY,JSON.stringify(value));return true}catch{return false}}
  async function commit(value, expected=revision){
    await queue;if(conflict)throw Error('存檔有衝突，請重新開啟。');
    const text=JSON.stringify(value),next=expected+1;
    const run=async()=>{
      const local=localRead(KEY);let meta=null;try{meta=JSON.parse(localRead(META)||'null')}catch{}
      const staleMirror=database&&meta?.format===1&&meta.hash===hash(local||'')&&Number.isSafeInteger(meta.revision)&&meta.revision<expected;
      if(local!==null&&!staleMirror&&(local!==cache.get(KEY)||meta&&meta.revision!==expected)){conflict=true;throw Error('另一個分頁已更新進度，這次操作已取消。')}
      emit('saving');
      if(database){
        await new Promise((resolve,reject)=>{
          const tx=database.transaction('records','readwrite'),s=tx.objectStore('records'),r=s.get(KEY);let mismatch=false;
          tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(Error(mismatch?'另一個分頁已更新進度，這次操作已取消。':'IndexedDB 寫入失敗，操作未完成。'));
          r.onsuccess=()=>{const old=r.result;if(old&&old.revision!==expected){mismatch=true;conflict=true;tx.abort();return}s.put({format:1,raw:text,revision:next,hash:hash(text),at:Date.now()},KEY)};
        });
        cache.set(KEY,text);revision=next;
        const mirrored=localWrite(KEY,text);if(mirrored)localWrite(META,JSON.stringify({format:1,revision:next,hash:hash(text)}));
        emit(mirrored?'saved':'degraded');return true;
      }
      if(!localWrite(KEY,text))throw Error('儲存空間不足，操作未完成。');
      cache.set(KEY,text);revision=next;localWrite(META,JSON.stringify({format:1,revision:next,hash:hash(text)}));emit('degraded');return true;
    };
    try{return window.navigator?.locks?await navigator.locks.request('rhodes-frontier-save',run):await run()}catch(e){emit('error',e.message);throw e}
  }
  async function listBackups(accountId){const keys=new Set(cache.keys());if(database){try{const found=await transaction('readonly',(s,done)=>{const r=s.getAllKeys();r.onsuccess=()=>done(r.result)});found.forEach(k=>keys.add(String(k)))}catch{}}try{for(let i=0;i<localStorage.length;i++)keys.add(localStorage.key(i))}catch{}return[...keys].filter(k=>k===KEY+'-pre-m01-backup'||k===KEY+'-legacy-backup'||k.startsWith(KEY+'-before-cloud-')||k.startsWith(KEY+'-before-restart-')||k.startsWith(KEY+'-before-import-')||k.startsWith(KEY+'-before-equipment139-')||k.startsWith(KEY+'-before-base600-')||k===KEY+'-before-base151'||k.startsWith(KEY+'-before-emergency-cancel-')||accountId&&k==='rhodes-frontier-v1-before-account-'+accountId).sort()}async function readRecord(k){if(database){try{const found=await transaction('readonly',(s,done)=>{const r=s.get(k);r.onsuccess=()=>done(r.result?.raw??null)});if(found!==null)return found}catch{}}return getItem(k)}function configureAccount(id){if(initialized||database||pending)throw Error('帳號命名空間必須在載入存檔前選定。');if(id!==null&&!/^[a-zA-Z0-9-]{8,80}$/.test(id))throw Error('帳號ID格式不正確。');BASE='rhodes-frontier-v1'+(id?'-account-'+id:'');KEY=BASE+(profile==='developer'?'-developer':'');META=KEY+'-storage-meta';cache.clear();revision=0}return {profile,get key(){return KEY},configureAccount,readRecord,listBackups,initialize,adoptCloud,getItem,setItem,backup,write,commit,info,hash,flush:()=>queue,subscribe(fn){listeners.add(fn);fn(info());return()=>listeners.delete(fn)}};
})();
