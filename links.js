'use strict';
window.FrontierLinks=(()=>{
 const definitions=[{id:'guard_opening',name:'掩護射界',trigger:'任一幹員以護盾成功吸收傷害',effect:'下一名隊友攻擊+2傷，每回合一次。'},{id:'urgent_care',name:'急救接力',trigger:'治療生命低於30%的隊友',effect:'另一名存活隊友獲得3盾，每回合一次。'},{id:'breach',name:'破盾追擊',trigger:'攻擊擊破敵方護盾',effect:'下一名不同幹員攻擊附加2傷，每回合一次。'},{id:'reserve_a',name:'預備行動',trigger:'小隊中包含任一三星幹員，連續使用兩名不同幹員的支援牌',effect:'生命最低存活幹員恢復2HP，每回合一次。'}];
 function state(){const b=R()?.battle;if(!b)return null;return b.links??={version:1,turn:b.turn,used:[],opening:null,breach:null,lastSupport:null,log:[]}}
 function turnState(){const s=state(),b=R()?.battle;if(s&&s.turn!==b.turn){s.turn=b.turn;s.used=[];s.opening=null;s.breach=null;s.lastSupport=null}return s}
 function trigger(id,text){const s=turnState();if(!s||s.used.includes(id))return false;s.used.push(id);s.log.push({turn:s.turn,id,text});if(s.log.length>24)s.log.shift();log('連攜 · '+text);return true}
 function blocked(a,before,damage){const s=turnState();if(s&&before>0&&before>a.block&&trigger('guard_opening',a.id+' 掩護射界'))s.opening=a.id}
 function bonus(owner){const s=turnState();if(!s)return 0;let n=0;if(s.opening&&s.opening!==owner){n+=20;s.opening=null}if(s.breach&&s.breach!==owner){n+=20;s.breach=null}return n}
 function hit(e,owner,oldBlock){const s=turnState();if(s&&oldBlock>0&&e.block===0&&trigger('breach','破盾追擊'))s.breach=owner}
 function healed(a,before){if(!a||a.hp<=before||before>=a.max*.3||!trigger('urgent_care','急救接力'))return;const ally=R().team.find(x=>x.id!==a.id&&x.hp>0);if(ally)ally.block+=30}
 function card(d){const s=turnState();if(!s||d.owner==='common'||['attack','all'].includes(d.kind))return;if(s.lastSupport&&s.lastSupport!==d.owner&&R().team.some(a=>FrontierCapture.units[a.id].rarity===3)&&trigger('reserve_a','預備行動')){const a=R().team.filter(x=>x.hp>0).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];if(a)a.hp=Math.min(a.max,a.hp+20)}s.lastSupport=d.owner}
 const oldBattle=battleView;battleView=function(){oldBattle();if(R()?.environment){const s=turnState();$('#app').insertAdjacentHTML('beforeend','<details class="panel"><summary>條件連攜 · 每回合有限觸發</summary>'+definitions.map(d=>'<p><b>'+d.name+'</b>：'+d.trigger+'。'+d.effect+'</p>').join('')+'<p class="tiny muted">'+(s?.log.slice(-5).map(x=>'T'+x.turn+' '+x.text).join('／')||'尚未觸發')+'</p></details>')}};
 return{definitions,state,turnState,trigger,blocked,bonus,hit,healed,card};
})();
