'use strict';
window.FrontierPotential=(()=>{
 const E=FrontierPotentialEngineV16,catalog={units:FrontierCapture.units};let lastReward=null;
 function ensure(){return E.ensure(db,catalog)}
 function reward(id,full){return E.reward(FrontierCapture.units[id].rarity,full?7:2,full)}
 function sync(){return E.sync(db,catalog)}
 function resolve(choiceId,option){const p=ensure(),choice=p.choices.find(x=>x.id===choiceId&&!x.resolved);if(!choice||!['voucher','candidate'].includes(option))return;if(option==='voucher'){const r=reward(choice.operator,true);db.wallet.green+=r.green;db.wallet.yellow+=r.yellow}else p.candidates[choice.operator]=(p.candidates[choice.operator]||0)+1;choice.resolved=option;save();render()}
 function receive(id){lastReward=E.receive(db,id,catalog);return !!lastReward}
 function useCandidate(id){const p=ensure();if(!(p.candidates[id]>0)||db.personnel.units[id]){toast('候補資格只可在該幹員已失去時使用。');return}p.candidates[id]--;const u=db.world.roster[id];u.copies++;p.counts[id]=u.copies;FrontierPersonnel.ensure();FrontierProgress.ensure();save();render()}
 const oldStart=startRun;startRun=function(){sync();return oldStart()};
 function view(){const p=ensure();return `<section class="panel"><h3>永久潛能與候補</h3><p class="tiny muted">同名只有一個可用個體。P階不隨死亡消失；新版重複取得立即發放憑證與1個對應信物；點幹員潛能圖示手動提升，滿潛後可兌換多餘信物。已存在的舊二選一與候補資格保留。黃票為本家兩倍，首次取得不變。</p>${Object.entries(p.levels).map(([id,level])=>`<p class="tiny">${FrontierCapture.units[id].name} · P${level}/6${p.candidates[id]?' · 候補 '+p.candidates[id]:''}${p.candidates[id]&&!db.personnel.units[id]?` <button class="small" onclick="FrontierPotential.useCandidate('${id}')">啟用Lv1候補</button>`:''}</p>`).join('')}${p.choices.filter(x=>!x.resolved).map(choice=>{const r=reward(choice.operator,true);return `<div class="panel"><p>${FrontierCapture.units[choice.operator].name} 已滿潛</p><button onclick="FrontierPotential.resolve('${choice.id}','voucher')">綠票${r.green}＋黃票${r.yellow}</button><button onclick="FrontierPotential.resolve('${choice.id}','candidate')">保留重招候補資格</button></div>`}).join('')}</section>`}
 const oldRoster=window.rosterView;window.rosterView=function(){oldRoster();$('#app').innerHTML=view()+$('#app').innerHTML};
 const priorValid=validSave;validSave=function(v){if(!priorValid(v)||!E.valid(v))return false;const p=v.potentials;if(!p)return true;const n=x=>Number.isInteger(x)&&x>=0;return p.version===1&&p.levels&&p.counts&&p.candidates&&Array.isArray(p.choices)&&Object.entries(p.levels).every(([id,level])=>FrontierCapture.units[id]?.kind==='operator'&&Number.isInteger(level)&&level>=1&&level<=6)&&Object.values(p.counts).every(n)&&Object.values(p.candidates).every(n)&&new Set(p.choices.map(x=>x.id)).size===p.choices.length&&p.choices.every(x=>typeof x.id==='string'&&FrontierCapture.units[x.operator]?.kind==='operator'&&[null,'voucher','candidate'].includes(x.resolved))};
 ensure();
 return{ensure,sync,reward,resolve,receive,useCandidate,view,openArchive:()=>modal('潛能與舊候補',view(),'<button onclick="closeModal()">關閉</button>'),get lastReward(){return lastReward}};
})();
