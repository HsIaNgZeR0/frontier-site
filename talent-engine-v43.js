'use strict';
globalThis.FrontierTalent43=(()=>{
 const gates=[0,10,20,30,40,50,75],branches=['戰術','生存','基建','後勤','探索'];
 const specs=[
 [['攻擊訓練','atk',1],['精準打擊','firstDamage',1],['體能訓練','hp',2],['基本防護','def',1],['貿易標準','baseLmd',1.5],['教材整理','baseExp',1.5],['加工節約','craft',5],['輪班管理','mood',3],['拾荒技巧','searchExtra',6],['初識行商','shop',1]],
 [['攻擊訓練Ⅱ','atk',1],['破韌入門','breakFlat',3],['體能訓練Ⅱ','hp',2],['法術適應','res',1],['貿易改良','baseLmd',1.5],['教材編目','baseExp',1.5],['精簡流程','craft',5],['醫療整備','medical',2],['分級鑑別','searchUpgrade',6],['裝置維護','capture',1]],
 [['戰術整備','firstOrdinary',1],['支援手法','buff',2],['防護訓練Ⅱ','def',1],['包紮技術','heal',1],['材料分揀','baseMaterial',2],['補給管理','supply',4],['外勤路線','dispatch',8],['委託協調','commissionLmd',2],['行商熟客','shop',1],['綠材與情報整理','greenInfo',3]],
 [['攻擊訓練Ⅲ','atk',1],['護盾技巧','shield',1],['應急照護','afterHeal',1],['法術適應Ⅱ','res',1],['貿易優化','baseLmd',1.5],['教材優化','baseExp',1.5],['委託研修','commissionExp',2],['輪班改良','mood',3],['藍材整理','blueExtra',3],['調查歸檔','info',10]],
 [['破韌熟練','breakFollow',1],['集中火力','firstElite',1],['防護訓練Ⅲ','def',1],['醫療熟練','heal',1],['材料精整','baseMaterial',2],['補給協作','supply',5],['外勤規劃','dispatch',10],['加工優化','craft',7],['精密搜尋','silver',.9],['行商議價','shop',2]],
 [['戰術筆記','firstOrdinary',1],['穩健支援','firstShield',1],['整備餘裕','layerHeal',1],['細緻包紮','firstHeal',1],['精益貿易','baseLmd',.5],['精益教材','baseExp',.5],['流程微調','craft',3],['熟練排班','mood',4],['稀有辨識','silver',.3],['長期熟客','shop',1]],
 [['戰術傳承','firstBoss',1],['防護傳承','firstShield',1],['長期鍛鍊','hp',1],['歸途照護','layerHeal',1],['成熟工序','baseMaterial',1],['成熟補給','supply',1],['資深協調','dispatch',2],['任務經驗','commissionBoth',.3],['金階辨識','gold',.6],['珍品檔案','silverInfo',.3]]
 ];
 const text={greenInfo:'戰鬥綠材多一份機率＋3%；調查情報結算＋10%',atk:'出戰幹員攻擊',def:'出戰幹員防禦',res:'出戰幹員法抗',hp:'出戰幹員最大生命',firstDamage:'每場首次直接攻擊傷害',firstOrdinary:'每場第一張普通攻擊牌首次命中傷害',breakFlat:'每場首次破韌計入的傷害',buff:'每場首次由普通牌給予隊友的增傷（百分點）',heal:'普通卡牌直接治療量（%）',shield:'普通卡牌護盾量（%）',afterHeal:'戰後恢復生命比例最低的存活幹員HP',layerHeal:'完成整層後，生命比例最低存活幹員恢復HP',firstHeal:'每場首次普通卡牌直接治療額外HP',firstShield:'每場首次普通卡牌護盾額外值',breakFollow:'每場首次成功破韌後的下一張攻擊牌首次命中傷害',firstElite:'每場首次攻擊精英或首領的傷害',firstBoss:'每場首次對首領造成的傷害',baseLmd:'基建龍門幣產出（%）',baseExp:'基建經驗產出（%）',baseMaterial:'基建素材產量期望值（%）',craft:'素材／裝備加工龍門幣費用降低（%）',mood:'基建工作體力消耗降低（%）',medical:'基建住院恢復時間縮短（%）',supply:'補給站完成時間縮短（%）',dispatch:'外勤時間縮短（%）',commissionLmd:'特別委託龍門幣獎勵（%）',commissionExp:'特別委託經驗獎勵（%）',commissionBoth:'特別委託龍門幣與經驗各增加（%）',searchExtra:'搜尋黑白材料多一份的機率（%）',searchUpgrade:'搜尋黑白材料升一階的機率（%）',greenExtra:'戰鬥綠材多一份的機率（%）',blueExtra:'戰鬥藍材多一份的機率（%）',capture:'每敵首次收容成功率（百分點）',shop:'局內行商售價降低（%）',info:'調查情報結算加成（%）',silver:'戰鬥材料包銀階機率（百分點）',gold:'戰鬥材料包金階機率（百分點，仍受每日上限）',silverInfo:'銀階機率＋0.3個百分點；調查情報額外＋5%'};
 const bigNames=['行商聯絡網Ⅰ','安全收納Ⅰ','背負系統Ⅰ','安全收納Ⅱ','行商聯絡網Ⅱ','安全收納Ⅲ','背負系統Ⅱ'],bigText=['每次行商可刷新全部商品1次','解鎖2×3安全箱，可在基地切換','核心背包擴大為6×7','解鎖2×4安全箱，可自由切換已解鎖尺寸','每次行商刷新上限增加為2次','解鎖3×3安全箱，可自由切換已解鎖尺寸','核心背包擴大為7×7'];
 const nodes=[];for(let t=0;t<7;t++){nodes.push({id:'major'+t,tier:t,level:gates[t],major:true,name:bigNames[t],description:bigText[t],max:1,requires:t?['major'+(t-1)]:[]});for(let i=0;i<10;i++){const [name,key,originalValue]=specs[t][i],value=originalValue*(globalThis.FrontierCombatUnits61?.talentKeys.has(key)?10:1);nodes.push({id:'n'+t+'_'+i,tier:t,index:i,branch:Math.floor(i/2),level:gates[t],name,key,value,max:3,description:text[key],requires:['major'+t,...(i%2?['n'+t+'_'+(i-1)]:[]),...(t?['n'+(t-1)+'_'+(Math.floor(i/2)*2)]:[])]})}}
 for(const n of nodes)if(n.key==='mood')n.retired=true;
 const keyringNodes=[{level:0,tier:0,slots:3},{level:20,tier:2,slots:5},{level:60,tier:5,slots:7}].map((n,i)=>({...n,id:'keyring'+n.slots,major:true,max:1,name:'房卡包 · '+n.slots+' 格',description:'出發時可攜帶 '+n.slots+' 張房卡。',requires:i?['keyring'+(n.slots-2)]:[]}));
 nodes.push(...keyringNodes);
 const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));byId.n3_2.requires.push('n2_6');byId.n4_8.requires.push('n3_6');const integer=n=>Number.isSafeInteger(n)&&n>=0,clone=s=>structuredClone(s);
 function ensure(s){if(!s.talents43){const ranks={},gifts={};for(const [level,id]of [[1,'major1'],[2,'major3'],[3,'major5']])if((s.secureLevel||0)>=level||s.doctor?.research?.includes(['','secure6','secure8','secure9'][level]))ranks[id]=gifts[id]=1;s.talents43={version:43,seq:0,ranks,gifts,paid:{lmd:0,intel:0},shape:(ranks.major5?'3x3':ranks.major3?'2x4':ranks.major1?'2x3':'2x2'),settled:{},lastCommand:null};if(s.run?.result)s.talents43.settled[s.run.number]=0}return s.talents43}
 function cost(n,rank=0){if(n.slots===3)return{lmd:0,intel:0};const lmd=n.major?[1000,3000,6000,9000,12000,16000,20000][n.tier]:Math.round([100,250,500,900,1400,1800,2000][n.tier]*[1,1.5,2][rank]),intel=n.major?[30,60,90,120,150,180,210][n.tier]:Math.round([3,5,8,12,16,18,20][n.tier]*[1,1.5,2][rank]);return{lmd,intel}}
 const effectCache=new WeakMap();
 function effects(s){const q=s.talents43,out={};if(!q)return out;const cached=effectCache.get(q);if(cached?.seq===q.seq)return cached.value;for(const n of nodes.filter(n=>!n.major)){const r=q.ranks[n.id]||0;if(!r||n.retired)continue;const v=['atk','def','res','hp','firstDamage','firstOrdinary','breakFlat','afterHeal','layerHeal','firstHeal','firstShield','breakFollow','firstElite','firstBoss'].includes(n.key)?Math.floor(n.value*r/3):n.value*r/3;if(n.key==='greenInfo'){out.greenExtra=(out.greenExtra||0)+v;out.info=(out.info||0)+10*r/3}else if(n.key==='commissionBoth'){out.commissionLmd=(out.commissionLmd||0)+v;out.commissionExp=(out.commissionExp||0)+v}else if(n.key==='silverInfo'){out.silver=(out.silver||0)+v;out.info=(out.info||0)+5*r/3}else out[n.key]=(out[n.key]||0)+v}for(const key in out)out[key]=Math.round(out[key]*1e6)/1e6;out.refresh=(q.ranks.major0||0)+(q.ranks.major4||0);out.pack=q.ranks.major6?7:q.ranks.major2?6:0;effectCache.set(q,{seq:q.seq,value:out});return out}
 function active(s,key){return (s.run&&!s.run.result?s.run.talent43?.effects:effects(s))?.[key]||0}
 function shapes(s){const q=s.talents43;return ['2x2',...(q?.ranks.major1?['2x3']:[]),...(q?.ranks.major3?['2x4']:[]),...(q?.ranks.major5?['3x3']:[])]}
 function reason(s,n){const q=ensure(s),rank=q.ranks[n.id]||0;if(n.retired)return '工作疲勞機制已移除';if(s.run&&!s.run.result)return '遠征中無法變更天賦';if(rank>=n.max)return '已完成';if((s.doctor?.level||1)<n.level)return '需要博士 Lv.'+n.level;for(const id of n.requires){if(n.major){if(!q.ranks[id])return '先解鎖 '+byId[id].name}else if(id.startsWith('major')&&!q.ranks[id])return '先解鎖本區間大天賦';else if(!id.startsWith('major')){const prev=byId[id];if(prev.tier===n.tier){if(!q.ranks[id])return '先研究 '+prev.name+' 1級';continue}const a='n'+prev.tier+'_'+(prev.branch*2),b='n'+prev.tier+'_'+(prev.branch*2+1);if(!q.ranks[a]&&!q.ranks[b])return '需前一區間同分支任一天賦1級'}}const c=cost(n,rank);if(s.wallet.lmd<c.lmd)return '龍門幣不足';if(s.intel<c.intel)return '調查情報不足';return ''}
 function apply(input,cmd){const s=clone(input),q=ensure(s);if(q.lastCommand?.id===cmd.id){if(JSON.stringify(q.lastCommand)!==JSON.stringify(cmd))throw Error('天賦操作識別不一致');return s}if(typeof cmd.id!=='string'||cmd.id.length<8||cmd.seq!==q.seq+1)throw Error('天賦資料已更新，請重試');if(s.run&&!s.run.result&&cmd.type!=='retireWork136')throw Error('請在遠征結束後研究');if(cmd.type==='retireWork136'){if(!q.retiredWork136){const ranks={},refund={lmd:0,intel:0};for(const n of nodes.filter(n=>n.retired)){const rank=q.ranks[n.id]||0;ranks[n.id]=rank;for(let i=0;i<rank;i++){const c=cost(n,i);refund.lmd+=c.lmd;refund.intel+=c.intel}delete q.ranks[n.id]}refund.lmd=Math.min(refund.lmd,q.paid.lmd);refund.intel=Math.min(refund.intel,q.paid.intel);q.paid.lmd-=refund.lmd;q.paid.intel-=refund.intel;s.wallet.lmd+=refund.lmd;s.intel+=refund.intel;q.retiredWork136={version:136,ranks,refund}}}else if(cmd.type==='buy'){const n=byId[cmd.node];if(!n)throw Error('天賦不存在');const why=reason(s,n);if(why)throw Error(why);const c=cost(n,q.ranks[n.id]||0);s.wallet.lmd-=c.lmd;s.intel-=c.intel;q.paid.lmd+=c.lmd;q.paid.intel+=c.intel;q.ranks[n.id]=(q.ranks[n.id]||0)+1;if(n.id==='major1')q.shape='2x3';if(n.id==='major3')q.shape='2x4';if(n.id==='major5')q.shape='3x3'}else if(cmd.type==='shape'){if(!shapes(s).includes(cmd.shape))throw Error('尚未解鎖此安全箱尺寸');q.shape=cmd.shape}else if(cmd.type==='reset'){s.wallet.lmd+=q.paid.lmd;s.intel+=q.paid.intel;q.paid={lmd:0,intel:0};q.ranks={...q.gifts};q.shape=shapes(s).at(-1)}else throw Error('未知天賦操作');q.seq=cmd.seq;q.lastCommand=clone(cmd);return s}
 function intelAward(r){const eligible=['extract','win'].includes(r?.result)&&r.depth>=3&&r.contract?.mode!=='simulation';const points=eligible&&r.surveyRules27===27?(globalThis.FrontierSurveyEngineV27?.score(r).points||0):0,base=Math.floor(points/100),bonus=Math.max(0,r?.talent43?.effects?.info||0);return{version:44,points,ratio:100,base,bonus,amount:Math.floor(base*(1+bonus/100))}}
 function settle(s){const q=ensure(s),r=s.run;if(!r?.result||Object.hasOwn(q.settled,r.number))return false;const award=intelAward(r),amount=award.amount;q.settled[r.number]=amount;if(s.base151?.rulesVersion===600)s.intel+=amount;else s.intel+=amount-(r.settled?.intel||0);r.talentInfo43=amount;r.talentInfo44=award;const history=s.history?.find(x=>x.number===r.number);if(history)history.intel=amount;return true}
 function finalize(before,next){const r=next.run;if(!r?.result||before.run?.number!==r.number||before.run.result||Object.hasOwn(before.talents43?.settled||{},r.number))return false;const q=ensure(next),previous=Object.hasOwn(q.settled,r.number)?q.settled[r.number]:null;if(previous==null)return settle(next);const award=intelAward(r);if(previous===award.amount&&JSON.stringify(r.talentInfo44)===JSON.stringify(award))return false;next.intel+=award.amount-previous;q.settled[r.number]=award.amount;r.talentInfo43=award.amount;r.talentInfo44=award;const history=next.history?.find(x=>x.number===r.number);if(history)history.intel=award.amount;return true}
 function valid(s){const q=s.talents43;if(!q)return true;return q.version===43&&integer(q.seq)&&q.ranks&&Object.entries(q.ranks).every(([id,r])=>byId[id]&&integer(r)&&r<=byId[id].max)&&q.gifts&&Object.entries(q.gifts).every(([id,r])=>byId[id]?.major&&r===1)&&integer(q.paid?.lmd)&&integer(q.paid?.intel)&&shapes(s).includes(q.shape)&&q.settled&&Object.entries(q.settled).every(([id,v])=>/^\d+$/.test(id)&&integer(v))}
 function equal(a,b){
  if(a===b)return true;
  if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;
  const keys=Object.keys(a);
  return keys.length===Object.keys(b).length&&keys.every(key=>Object.hasOwn(b,key)&&equal(a[key],b[key]));
 }
 function validateTransition(old,next,canonicalizeSettlement=false){
  if(!valid(next))throw Error('天賦資料不完整');
  if(!old)return true;
  const expected=clone(old);
  ensure(expected);
  const priorRun=old.run,run=next.run,sameRun=!!priorRun&&priorRun.number===run?.number;
  const finished=sameRun&&!priorRun.result&&!!run.result;
  if(run&&!run.result&&!sameRun&&!equal(run.talent43?.effects,effects(expected)))throw Error('出發天賦快照不一致');
  if(sameRun&&!priorRun.result&&!equal(priorRun.talent43,run.talent43))throw Error('局內天賦不可變更');
  const cmd=next.talents43?.lastCommand;
  if(cmd&&cmd.id!==old.talents43?.lastCommand?.id){
   const researched=apply(expected,cmd);
   if(!equal(researched.talents43,next.talents43)||researched.wallet.lmd!==next.wallet.lmd||researched.intel!==next.intel)throw Error('天賦扣款／解鎖驗證不一致');
   return true;
  }
  if(!next.talents43){
   if(old.talents43)throw Error('不可移除天賦資料');
   return true;
  }
  // Only a newly completed run may add a settlement to an existing save.
  if(finished){
   expected.run=clone(run);
   settle(expected);
  }
  if(finished&&canonicalizeSettlement&&!Object.hasOwn(old.talents43?.settled||{},run.number)){
   const amount=expected.talents43.settled[run.number],submitted=next.talents43.settled[run.number]??0;
   const legacyIntel=old.base151?.rulesVersion===600?0:(run.settled?.intel||0);
   const baseIntel=expected.intel+legacyIntel-amount;
   if(next.intel===baseIntel+submitted){
    const talents=clone(next.talents43);
    talents.settled[run.number]=amount;
    if(equal(expected.talents43,talents)){
     const changed=submitted!==amount||!Object.hasOwn(next.talents43.settled,run.number)||run.talentInfo43!==amount||!equal(run.talentInfo44,expected.run.talentInfo44);
     if(changed){
      next.talents43=talents;
      next.intel=baseIntel+amount;
      run.talentInfo43=amount;
      run.talentInfo44=expected.run.talentInfo44;
      const history=next.history?.find(x=>x.number===run.number);
      if(history)history.intel=amount;
     }
     return true;
    }
   }
  }
  if(!equal(expected.talents43,next.talents43))throw Error('天賦進度須由正式研究更新');
  if(finished&&next.intel!==expected.intel+(old.base151?.rulesVersion===600?0:(run.settled?.intel||0)))throw Error('調查情報結算不一致');
  return true;
 }
 function carry(s,scope,key,n,percent){if(!percent)return n;const b=s.base151;b.talentRemainders43??={};const id=scope+':'+key,v=n*percent/100+(b.talentRemainders43[id]||0),extra=Math.floor(v+1e-9);b.talentRemainders43[id]=Math.round((v-extra)*1e9)/1e9;return n+extra}
 return{gates,branches,nodes,keyringNodes,byId,ensure,cost,effects,active,shapes,reason,apply,intelAward,settle,finalize,valid,validateTransition,carry};
})();
