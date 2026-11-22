'use strict';
window.FrontierEmergency=(()=>{
 const E=FrontierRecoveryEngine;let busy=false;
 const oldStart=startRun;
 startRun=function(){const before=structuredClone(db),prior=R();oldStart();if(R()&&R()!==prior&&!R().result){R().recoveryDeparture=E.departure(before,db);save();render()}};
 function open(){if(!R()||R().result)return;const legacy=!R().recoveryDeparture;
  modal('緊急撤離並重設對局？','<p>取消目前遠征，回到基地重新準備。這不是成功撤離：不帶回本局戰利品、收容個體或待撤離龍門幣，也不發通關獎勵。</p><p>'+(legacy?'這是舊版對局：歸還能確認的攜入裝備、遺物及剩餘裝置；已消耗而未記錄原始數量的物品不猜測補發。':'歸還本局出發時扣除的物資及攜入裝備，裝備依出發時耐久恢復。')+'</p><p>確認前會先保存完整備份；基地、倉庫與帳號不重設。</p>','<button class="primary" onclick="FrontierEmergency.confirm()">備份並緊急撤離</button><button onclick="closeModal()">保留目前對局</button>');
 }
 async function confirm(){if(busy)return;busy=true;try{
  if(FrontierRuntime.busy)throw Error('目前操作仍在保存，請稍後再試。');
  if(window.FrontierCloud?.info().onlineRequired){db=await FrontierCloud.emergencyCancel();selected=null;closeModal();page='home';render();}
  else{const raw=JSON.stringify(db);await FrontierStorage.backup(FrontierStorage.key+'-before-emergency-cancel-'+Date.now(),raw);const ok=await FrontierRuntime.perform('FrontierSession.emergency-cancel',()=>{db=E.cancel(db,crypto.randomUUID());selected=null;closeModal();page='home';save();render()});if(!ok)return;}
  toast('已取消本局，攜入資產已歸還；可以重新準備遠征。');
 }catch(error){toast(error.message,{level:'error',details:error.stack})}finally{busy=false}}
 function mount(){if(!R()||R().result)return;const make=()=>{const b=document.createElement('button');b.className='emergency-escape';b.textContent='緊急撤離';b.style.minHeight='44px';b.setAttribute('onclick','FrontierEmergency.open()');return b};
  if(page==='home'&&!document.querySelector('#app .emergency-escape')){const anchor=[...document.querySelectorAll('#app button[onclick]')].find(b=>b.getAttribute('onclick')==="go('run')");if(anchor){const row=document.createElement('div');row.className='row emergency-actions';row.style.cssText='display:flex;gap:8px;flex-wrap:wrap';anchor.before(row);row.append(anchor,make())}}
  const pause=document.querySelector('#pause-overlay .panel');if(pause&&!pause.querySelector('.emergency-escape'))pause.append(make());
 }
 const oldRender=render;render=function(){oldRender();mount()};
 window.addEventListener('click',event=>{const code=event.target.closest?.('[onclick]')?.getAttribute('onclick');if(!['FrontierEmergency.open()','FrontierEmergency.confirm()'].includes(code))return;event.preventDefault();event.stopImmediatePropagation();if(code.endsWith('open()'))open();else confirm()},true);
 mount();return{open,confirm,mount,get busy(){return busy}};
})();
