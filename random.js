'use strict';
window.FrontierRandom=(()=>{
 let context='system';
 function valid(r){return !!r&&r.version===1&&Number.isSafeInteger(r.seed)&&r.seed>=0&&r.seed<=4294967295&&Number.isSafeInteger(r.counter)&&r.counter>=0&&Array.isArray(r.records)&&r.records.every(x=>Number.isSafeInteger(x.n)&&x.n>=0&&Number.isFinite(x.value)&&x.value>=0&&x.value<1&&typeof x.source==='string')}
 function ensure(state){if(!state.rng){const a=new Uint32Array(1);if(window.crypto?.getRandomValues)crypto.getRandomValues(a);else a[0]=(Date.now()^Math.floor(Math.random()*4294967296))>>>0;state.rng={version:1,seed:a[0],counter:0,records:[]}}if(!valid(state.rng))throw Error('隨機紀錄格式不正確，已停止抽選。');return state.rng}
 function value(seed,n){let t=(seed+Math.imul(n+1,0x6D2B79F5))|0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
 function next(state){const r=ensure(state),n=r.counter++,v=value(r.seed,n);r.records.push({n,value:v,source:context,run:state.run?.number||null});if(r.records.length>1000)r.records.splice(0,r.records.length-1000);return v}
 return {ensure,valid,next,value,setContext(label){context=String(label).slice(0,120)}};
})();
