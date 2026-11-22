'use strict';
globalThis.FrontierRecoveryEngine=(()=>{
 const clone=x=>structuredClone(x),keys=['stock','medicine.stock','capture.devices','world.balls','wallet'];
 const get=(s,p)=>p.split('.').reduce((v,k)=>v?.[k],s);
 function departure(before,after){const refunds={};for(const path of keys){const a=get(before,path)||{},b=get(after,path)||{};const values={};for(const[key,n]of Object.entries(a))if(Number.isSafeInteger(n)&&n>(b[key]||0))values[key]=n-(b[key]||0);if(Object.keys(values).length)refunds[path]=values;}const present=new Set((after.inventory?.items||[]).map(i=>i.uid));const items=(before.inventory?.items||[]).filter(i=>!present.has(i.uid));return{version:1,run:after.run.number,refunds,items:clone(items)}}
 function rebaseClock(input,now){const s=clone(input),b=s.base151;if(!b||b.last<=now)return s;const delta=now-b.last;const shift=o=>{if(!o||typeof o!=='object')return;for(const[k,v]of Object.entries(o)){if(['readyAt','availableAt'].includes(k)&&typeof v==='number'&&v>0)o[k]=v+delta;else if(v&&typeof v==='object'&&!['v600Archive','legacyArchive'].includes(k))shift(v)}};shift(b);b.last=now;if(b.lastCommand)b.lastCommand.at=now;for(const u of Object.values(s.personnel?.units||{})){if(u.recoverAt>0)u.recoverAt=Math.max(0,u.recoverAt+delta);if(u.treatment?.base151&&u.treatment.admittedAt>0)u.treatment.admittedAt+=delta;}return s}
 function cancel(input,id){const s=clone(input),r=s.run;if(typeof id!=='string'||id.length<8)throw Error('PRTS｜緊急撤離操作無效。');if(!r||r.result)throw Error('PRTS｜目前沒有進行中的遠征。');const point=r.recoveryDeparture;let refunds,items;
  if(point?.version===1&&point.run===r.number){refunds=point.refunds;items=[...point.items,...(r.recruitment144?r.borrowedEquipment144||[]:[])];}
  else{refunds={};if(r.relic&&r.relic!=='none'&&r.relic!=='compass')refunds.stock={[r.relic]:1};if(r.field?.devices)refunds['capture.devices']=clone(r.field.devices);if(r.field?.balls)refunds['world.balls']=clone(r.field.balls);items=clone(r.equipment?.items||[]);}
  for(const[path,values]of Object.entries(refunds)){if(!keys.includes(path))throw Error('PRTS｜攜入清單格式無效。');const bucket=get(s,path);if(!bucket)throw Error('PRTS｜攜入物資庫存缺失，請保留備份。');for(const[key,n]of Object.entries(values)){if(!Number.isSafeInteger(n)||n<0||!Number.isSafeInteger((bucket[key]||0)+n))throw Error('PRTS｜攜入物資數量無效。');bucket[key]=(bucket[key]||0)+n;}}
  const inventory=s.inventory?.items||[],seen=new Set(inventory.map(i=>i.uid));for(const item of items){// Equipment migration/protection may already have returned this exact instance. Keep its current warehouse state; never mint a second copy.
   if(seen.has(item.uid))continue;const original=clone(item);delete original.owner;delete original.equipped;delete original.defenseStatEffect;inventory.push(original);seen.add(original.uid);}
  for(const unit of s.capture?.instances||[])if(unit.assignment==='expedition:'+r.number)unit.assignment=null;
  for(const[uid,assignment]of Object.entries(s.assignments||{}))if(assignment==='expedition:'+r.number)delete s.assignments[uid];
  s.recovery??={version:1,receipts:[]};s.recovery.receipts.push({id,run:r.number,legacy:!point,at:Date.now()});if(s.recovery.receipts.length>32)s.recovery.receipts.splice(0,s.recovery.receipts.length-32);
  globalThis.FrontierSurveyEngineV27?.cancelFocus(s,r);s.run=null;if(s.session){s.session.paused=false;s.session.screen='home';}return s;
 }
 return{departure,rebaseClock,cancel};
})();
