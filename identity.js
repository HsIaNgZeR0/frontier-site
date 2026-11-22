'use strict';
window.FrontierIdentity=(()=>{
 let account=null,onReady=()=>{},onLocal=()=>{},busy=false;
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const websiteLogin='/signin-with-chatgpt';
 async function api(route,data){
  const reading=data===undefined;let payload=reading?undefined:JSON.stringify(data);const headers=reading?{Accept:'application/json'}:{'Content-Type':'application/json'};if(route==='save'&&!reading&&payload.length>=32768&&typeof CompressionStream==='function'){try{const packed=await new Response(new Blob([payload]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();if(packed.byteLength<payload.length*.9){payload=packed;headers['Content-Type']='application/octet-stream';headers['X-PRTS-Body']='gzip'}}catch{}}

  const r=await fetch('/api/prts/'+route,{method:reading?'GET':'POST',credentials:'same-origin',cache:'no-store',signal:globalThis.AbortSignal?.timeout?.(8000),headers,body:payload});
  const json=(r.headers.get('content-type')||'').includes('application/json');
  const websiteAuth=r.status===403||(!json&&r.status===401)||(r.redirected&&(/\/signin-with-chatgpt(?:\?|$)/.test(r.url)||r.url.startsWith('https://auth.openai.com/')));
  if(websiteAuth)throw Object.assign(Error('請重新驗證網站身分。'),{status:r.status,websiteAuth:true});
  let value;
  try{value=await r.json()}catch{throw Object.assign(Error('雲端服務目前無法連線。'),{status:r.status})}
  if(!r.ok)throw Object.assign(Error(value.error||'操作未完成。'),{status:r.status,...value,websiteAuth:r.status===401&&(route==='status'||value.error==='請先通過網站身分驗證。')});
  return value;
 }
 function field(id,label,type='text',autocomplete='off'){return `<label>${label}<input id="prts-${id}" type="${type}" ${type==='password'?'inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" class="prts-pin"':'maxlength="128"'} autocomplete="${autocomplete}" required></label>`}
 function mount(content){let host=document.querySelector('#prts-identity');if(!host){host=document.createElement('section');host.id='prts-identity';document.body.append(host)}document.body.classList.add('identity-mode');host.innerHTML='<div class="prts-terminal"><div class="eyebrow">PRTS / IDENTITY REGISTRATION</div><h1>DOCTOR IDENTIFICATION</h1>'+content+'<p id="prts-error" role="alert"></p><p class="tiny muted">登入由伺服器驗證。PIN不會放入本機存檔。</p></div>';host.querySelectorAll('[data-prts-action]').forEach(el=>el.addEventListener('click',()=>show(el.dataset.prtsAction)));return host}
 function error(e){const el=document.querySelector('#prts-error');if(el)el.textContent=e.message+(e.unlockAt?' 可於 '+new Date(e.unlockAt).toLocaleTimeString('zh-TW')+' 後重試。':'')}
 function value(id){return document.querySelector('#prts-'+id)?.value||''}
 function form(mode){const registration=mode==='register',recovery=mode==='recover',label=registration?'建立博士身分':recovery?'重設PIN':'登入';const host=mount(`<form id="prts-form"><label>DOCTOR NAME<div class="prts-name"><span>Dr.</span><input id="prts-name" minlength="2" maxlength="16" autocomplete="username" required></div></label>${recovery?field('recovery','RECOVERY CODE'):''}${field('pin',recovery?'NEW SIX-DIGIT PIN':'SIX-DIGIT PIN','password',registration||recovery?'new-password':'current-password')}${registration||recovery?field('confirm','CONFIRM PIN','password','new-password'):''}<button class="primary" type="submit">${label}</button></form><div class="row"><button data-prts-action="${registration?'login':'register'}">${registration?'已有身分，登入':'首次登錄'}</button><button data-prts-action="recover">使用復原碼</button></div><p class="tiny muted">名稱2～16字；英文不分大小寫。登入保留最多30天，可撤銷裝置。</p>`);host.querySelector('form').addEventListener('submit',async event=>{event.preventDefault();if(busy)return;busy=true;const button=host.querySelector('[type="submit"]');button.disabled=true;try{const name=value('name'),pin=value('pin');if(!/^\d{6}$/.test(pin))throw Error('PIN必須是六位數字。');if((registration||recovery)&&pin!==value('confirm'))throw Error('兩次PIN不一致。');const result=await api(recovery?'recover':mode,{name,pin,confirmPin:value('confirm'),recoveryCode:value('recovery')});if(recovery){recoveryScreen(result.recoveryCode,()=>show('login'))}else{account=result.account;if(registration)recoveryScreen(result.recoveryCode,ready);else ready()}}catch(e){if(e.websiteAuth)connectionScreen(e);else error(e)}finally{host.querySelectorAll('.prts-pin').forEach(el=>el.value='');busy=false;button.disabled=false}})}
 function recoveryScreen(code,done){const host=mount('<h2>保存一次性復原碼</h2><p>忘記PIN時可用此碼重設。伺服器只保存雜湊，此畫面離開後不再顯示原碼。</p><code class="prts-recovery">'+escape(code)+'</code><label><input id="prts-kept" type="checkbox">我已另外安全保存復原碼</label><button id="prts-finish" disabled>完成登錄</button>');host.querySelector('#prts-kept').addEventListener('change',e=>host.querySelector('#prts-finish').disabled=!e.target.checked);host.querySelector('#prts-finish').addEventListener('click',()=>{host.querySelector('.prts-recovery').textContent='';done()})}
 function ready(){document.querySelector('#prts-identity')?.remove();document.body.classList.remove('identity-mode');return onReady(account)}
 function show(mode='login'){form(['register','login','recover'].includes(mode)?mode:'login')}
 function connectionScreen(e){
  const auth=e.websiteAuth;
  const host=mount('<h2>'+(auth?'請重新驗證網站身分':'暫時連不上雲端')+'</h2><p>'+(auth?'使用有本站權限的 ChatGPT 帳號驗證。回到遊戲後，再登入博士帳號。若從主畫面開啟遊戲，請先用 Safari 開啟本網站並完成驗證。':'連線恢復後可重試。')+'</p>'+(auth?'<form action="'+websiteLogin+'?return_to=%2F" method="post" target="_top"><button class="primary" type="submit">使用 ChatGPT 重新驗證</button></form>':'<button class="primary" id="prts-retry">重新連線</button>')+'<button id="prts-local">繼續本機模式</button><p class="tiny muted">本機模式會使用這台裝置的存檔；需要雲端進度時，請先完成登入。</p>');
  const retry=host.querySelector('#prts-retry');
  if(retry)retry.onclick=()=>{retry.disabled=true;boot(onReady,onLocal)};
  host.querySelector('#prts-local').onclick=()=>{host.remove();document.body.classList.remove('identity-mode');onLocal()};
 }
 async function boot(readyCallback,localCallback,resumeOffline){
  onReady=readyCallback||onReady;onLocal=localCallback||onLocal;
  for(let attempt=0;attempt<2;attempt++){
   try{
    await api('status');
    const session=await api('session');
    account=session.account;
    return ready();
   }catch(e){
    if(e.status===401&&!e.websiteAuth){show('login');return}
    if(!attempt&&!e.websiteAuth&&(!e.status||e.status>=500)){
     await new Promise(resolve=>setTimeout(resolve,500));
     continue;
    }
    if(!e.websiteAuth&&(!e.status||e.status>=500)&&resumeOffline?.())return;
    return connectionScreen(e);
   }
  }
 }
 async function logout(){try{await api('logout',{});account=null;show('login')}catch(e){error(e)}}
 return{api,boot,show,logout,get account(){return account},get busy(){return busy}};
})();
