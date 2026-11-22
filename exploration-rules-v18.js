'use strict';
globalThis.FrontierExplorationRulesV18=(()=>{
 function normalize(s){const r=s?.run;if(!r||r.result)return false;let changed=false;for(const layer of r.expedition?.layers||[])for(const row of layer.rows||[])for(const node of row){if(node.type==='signal'){r.legacyRecruitNodes18??=[];if(!r.legacyRecruitNodes18.some(n=>n.id===node.id))r.legacyRecruitNodes18.push({id:node.id,type:node.type,operator:node.recruitOperator||null});node.type='search';changed=true}if(node.recruitOperator){delete node.recruitOperator;delete node.toolInfo;changed=true}}
  if(r.event?.type==='signal'){r.legacyRecruitEvent18=structuredClone(r.event);r.event=null;r.signalReplacement18=true;r.node='search';changed=true}if(r.choices?.includes('signal')){r.choices=r.choices.map(t=>t==='signal'?'search':t);changed=true}if(r.node==='signal'){r.node='search';changed=true}if(r.recruitAid){r.legacyRecruitAid18=structuredClone(r.recruitAid);delete r.recruitAid;changed=true}return changed;
 }
 return{normalize};
})();
