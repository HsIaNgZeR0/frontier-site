'use strict';
// Exit only the current container interaction. Never bypass save validation.
window.FrontierSearchRecovery158=(()=>{
 let pending=false;
 const eligible=()=>{const r=R();return !!(r&&!r.result&&!r.battle&&!r.reward&&(r.event?.searchScene||r.event?.type==='sealedContainer'||r.boxReturn))};
 function mount(){
  document.querySelectorAll('.search-recovery158').forEach(x=>x.remove());if(!eligible())return;
  const root=document.querySelector('#app .screen-workspace-body');if(!root)return;
  const button=document.createElement('button');button.className='search-recovery158';button.textContent='開箱異常？安全返回地圖';button.style.cssText='display:block;min-height:44px;width:100%;margin:8px 0;font-size:12px;position:sticky;bottom:4px;z-index:30;background:#20323d;border:1px solid #b8c78c';button.addEventListener('click',confirm);root.append(button);
 }
 function confirm(){if(!eligible()||pending)return;modal('離開開箱現場','<p>已取得的物資、房卡消耗及遠征進度保留。尚未取得的內容留在原始備份，不重新發放或重抽。</p>','<button onclick="FrontierSearchRecovery158.exit()">備份現場並返回地圖</button><button onclick="closeModal()">繼續搜索</button>')}
 async function exit(){if(!eligible()||pending)return false;pending=true;
  try{
   const original=JSON.stringify(db),r=R(),key=FrontierStorage.key+'-search-recovery158-'+r.number+'-'+Date.now();
   await FrontierStorage.backup(key,original);
   // Candidate keeps all acquired inventory and resources. Only stale interaction state is closed.
   const candidate=JSON.parse(original);candidate.run.event=null;delete candidate.run.boxReturn;delete candidate.run.searchGuard174;
   if(!validSave(candidate)){toast('PRTS｜其他存檔資料仍有異常，原始備份已保留，未清除物資。請匯出存檔供修復。');return false}
   closeModal();r.event=null;delete r.boxReturn;delete r.searchGuard174;
   if(r.expedition?.current)completeNode();else{save();render()}
   return true;
  }finally{pending=false}
 }
 const draw=render;render=function(...args){const value=draw.apply(this,args);mount();return value};
 const priorToast=toast;toast=function(message,...args){const value=priorToast(message,...args);if(/不合法資料|搜索.*不完整|容器.*不完整/.test(String(message))&&eligible())queueMicrotask(()=>{mount();const b=document.querySelector('.search-recovery158');if(b){b.textContent='PRTS｜開箱已暫停，點此安全返回地圖';b.scrollIntoView({block:'nearest'})}});return value};
 return{exit,confirm,eligible,mount};
})();
