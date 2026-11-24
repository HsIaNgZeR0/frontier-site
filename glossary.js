'use strict';
/* 機制詞典：自動替畫面上的機制專有名詞加底線；點擊後在該詞正下方展開說明區塊（非彈窗）。
   來源對象由現有資料（幹員卡牌／天賦／招牌技能／支援技能、敵方特性、收藏品、戰術補給、裝備）即時掃描產生。 */
window.FrontierGlossary=(()=>{
 const T=[
  {id:'burn',name:'灼燒',aliases:['灼燒'],opTwin:'ignite',side:'敵方 → 幹員',desc:'敵人或地區環境施加在幹員身上的持續傷害。',effect:'每層在己方結束出牌時造成 20 點傷害，之後減少 1 層。可被淨化、冷卻噴霧解除或減免。',note:'部分幹員卡牌文字中的「灼燒」指的是施加在敵人身上的「灼燃」，兩者規則不同。'},
  {id:'ignite',name:'灼燃',aliases:['灼燃'],side:'幹員 → 敵人',desc:'幹員施加在敵人身上的燃燒狀態（部分卡牌文字寫作「灼燒」）。',effect:'每名敵人最多 3 層；每次敵方階段結束時逐層結算法術傷害（計算法抗與護盾），各層有到期回合。',note:'與幹員身上的「灼燒」不同。「引燃」也是炎熔支援的技能名，該支援實際施加「殘焰」。'},
  {id:'bleed',name:'流血',aliases:['流血'],side:'敵方 → 幹員',desc:'持續失血。',effect:'己方結束出牌時，每層造成 10 點傷害，之後減少 1 層。可淨化，創傷封合貼可解除。'},
  {id:'poison',name:'中毒',aliases:['中毒'],side:'敵方 → 幹員',desc:'毒霧或敵人造成的持續傷害。',effect:'己方結束出牌時，每層造成 10 點傷害。對應戰術補給可解除中毒，部分階級可轉為治療。'},
  {id:'cold',name:'寒冷',aliases:['寒冷'],side:'敵方 → 幹員',desc:'低溫累積。',effect:'通常累積 3 層轉為「凍結」（保溫毯可提高門檻）。',note:'謝拉格地區的環境數值也叫「寒冷」，那是地區計量，不是幹員狀態。'},
  {id:'freeze',name:'凍結',aliases:['凍結'],side:'敵方 → 幹員',desc:'寒冷達門檻後觸發。',effect:'區域敵人觸發凍結時，封鎖該幹員下一回合的招牌技能。'},
  {id:'neural',name:'神經損傷',aliases:['神經損傷'],side:'敵方 → 幹員',desc:'作用於幹員的神經干擾。',effect:'區域敵人的攻擊使命中幹員達 3 層時，消耗 3 層，使隊伍下回合初始 AP 減少 1（最低 1）。同一次補充 AP 最多扣 1。',note:'與幹員對敵人施加的「精神損傷」不同。'},
  {id:'mental',name:'精神損傷',aliases:['精神損傷'],side:'幹員 → 敵人',desc:'幹員對敵人累積的精神壓力。',effect:'普通敵人 4、精英 6、首領 8 層時崩潰並清零：蓄力期間直接完成破韌，否則下次特殊攻擊傷害 -25%；首領崩潰後下一回合免疫。',note:'與敵人對幹員施加的「神經損傷」不同。'},
  {id:'corrosion',name:'腐蝕',aliases:['腐蝕'],side:'敵方 → 幹員',desc:'裝甲被腐蝕。',effect:'下一次承受物理攻擊時，每層使該擊原始傷害 +10，最多 +30，之後清除。'},
  {id:'venom',name:'毒蝕',aliases:['毒蝕'],side:'幹員 → 敵人',desc:'舊版戰鬥規則中施加在敵人身上的毒。',effect:'敵方回合開始時每層扣血，之後減少 1 層。',note:'與幹員身上的「中毒」是不同狀態。'},
  {id:'embersFire',name:'殘焰',aliases:['殘焰'],side:'幹員 → 敵人',desc:'炎熔支援技能「引燃」造成的燃燒。',effect:'每回合開始時每層造成 10 點真實傷害，之後減少 1 層。',note:'與「灼燒」「灼燃」為不同狀態，不共用層數。'},
  {id:'fear',name:'恐懼',aliases:['恐懼'],side:'敵方 → 幹員',desc:'精神類控制。',effect:'負面狀態，可由穩頻耳罩或淨化解除；特定首領的恐懼會提高卡牌 AP 消耗。'},
  {id:'weak',name:'虛弱',aliases:['虛弱'],side:'雙方',desc:'攻擊力被削弱。',effect:'受影響者造成的傷害降低；可淨化。'},
  {id:'silence',name:'沉默',aliases:['沉默'],side:'雙方',desc:'封鎖技能類行動。',effect:'對敵人：阻止可被沉默的普通敵人施放特殊攻擊（不阻止一般攻擊，精英與首領不受此控制）。對幹員：負面狀態，可淨化。'},
  {id:'entangle',name:'纏繞',aliases:['纏繞','纏結'],side:'幹員 → 敵人',desc:'累積型控制。敵人處於可破韌的蓄力窗口時，施加纏繞可直接增加 1 點破韌進度。',effect:'普通敵人 3 層、精英／首領 5 層時轉為「束縛」。'},
  {id:'bind',name:'束縛',aliases:['束縛'],side:'幹員 → 敵人',desc:'纏繞達門檻後觸發。',effect:'跳過下一次可控制的敵方行動；敵人正在可破韌的蓄力窗口時，改為增加 1 點破韌進度。'},
  {id:'stun',name:'暈眩',aliases:['暈眩','眩暈'],side:'雙方',desc:'行動被打斷。',effect:'敵人：跳過下一次一般攻擊，不直接取消特殊攻擊。幹員：在暈眩回合無法出牌或施放招牌。除了敵方攻擊，幽靈鯊也可能因自身技能在下一回合暈眩。'},
  {id:'vuln',name:'易傷',aliases:['易傷','脆弱'],side:'幹員 → 敵人',desc:'受到的傷害提高。',effect:'有易傷的目標承受傷害提高；層數隨受擊或回合消耗。'},
  {id:'armor',name:'破甲',aliases:['破甲'],side:'幹員 → 敵人',desc:'降低敵人防禦。',effect:'目標 DEF 降低指定數值，各效果到期後恢復。'},
  {id:'weightless',name:'失重',aliases:['失重'],side:'幹員 → 敵人',desc:'條件標記。',effect:'供卡牌增益與破韌效果判定，不等同無法攻擊。'},
  {id:'slow',name:'遲滯',aliases:['遲滯'],side:'幹員 → 敵人',desc:'條件標記。',effect:'供技能條件判定使用。'},
  {id:'suppression',name:'壓制',aliases:['壓制'],side:'幹員 → 敵人',desc:'條件標記。',effect:'供技能條件判定，不會直接取消敵方行動。緘默德克薩斯的對應專精可讓下一次可被壓制的特殊攻擊減傷 10%。'},
  {id:'taunt',name:'嘲諷',aliases:['嘲諷'],side:'幹員',desc:'吸引敵方攻擊。',effect:'改變敵人預告的攻擊目標；部分敵方特性的瞄準規則仍可被嘲諷轉移。'},
  {id:'embers',name:'餘燼',aliases:['餘燼'],side:'幹員自身',desc:'史爾特爾的天賦狀態。',effect:'首次受到致命傷害時進入：2 個完整敵方行動階段內免疫傷害且無法被治療，期滿強制退場；每戰一次。',note:'收藏品「餘燼標本」與敵方特性「餘燼復燃」名稱相近但無關。'},
  {id:'disarm',name:'繳械',aliases:['繳械'],side:'敵方 → 幹員／幹員自身',desc:'限制攻擊牌。部分幹員技能也會自行限制攻擊牌。',effect:'在繳械生效的回合無法使用攻擊牌，仍可使用治療與防護牌。'},
  {id:'control',name:'控制狀態',aliases:['控制狀態'],side:'幹員 → 敵人',desc:'限制敵人行動的狀態總稱。',effect:'包含束縛、暈眩、沉默、凍結等；收藏品與天賦的「施加控制狀態」條件以此判定。'},
 ];
 const byAlias=new Map();for(const t of T)for(const a of t.aliases)byAlias.set(a,t);
 const pattern=new RegExp([...byAlias.keys()].sort((a,b)=>b.length-a.length).join('|'),'g');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let sourceCache=null;
 function collect(){
  const out=new Map(T.map(t=>[t.id,new Set()]));
  // 幹員文字裡的「灼燒」施加在敵人身上，實際是灼燃；歸到 twin 詞條避免誤判。
  const scan=(text,label)=>{if(!text)return;const s=String(text),op=label.startsWith('幹員');for(const t of T)if(!(s.includes('殘焰')&&['burn','ignite'].includes(t.id))&&t.aliases.some(a=>s.includes(a)))out.get(op&&t.opTwin?t.opTwin:t.id).add(label)};
  const deep=(node,label,depth=0)=>{if(depth>6||node==null)return;if(typeof node==='string'){scan(node,label);return}if(typeof node==='object')for(const v of Object.values(node))deep(v,label,depth+1)};
  try{for(const f of window.FrontierOperatorCatalogV113?.forms||[]){const who='幹員 '+f.operatorName;for(const c of f.cards||[])deep(c.sourceEffects,who+'（卡牌「'+c.name+'」）');if(f.signature)deep(f.signature.sourceTiers,who+'（招牌技能「'+f.signature.name+'」）');for(const t of f.abilities?.talents||[])deep(t.stages,who+'（天賦「'+t.name+'」）');scan(f.abilities?.mechanic,who+'（特性）')}}catch{}
  try{const S=window.FrontierSupport175?.skills||{};for(const[id,d]of Object.entries(S)){const who='幹員 '+(window.FrontierCapture?.units?.[id]?.name||window.FrontierOperatorData?.units?.[id]?.name||id);let txt='';try{txt=typeof d.text==='function'?d.text(0)+d.text(1):d.text}catch{}scan(txt,who+'（支援技能「'+d.name+'」）')}}catch{}
  try{for(const d of Object.values(window.FrontierRegionalEnemies?.traits||{}))scan((d.title||'')+d.text,'敵方特性「'+d.title+'」')}catch{}
  try{for(const d of Object.values(window.FrontierCurioData?.entries||{}))scan(d.name+d.effect,'收藏品「'+d.name+'」')}catch{}
  try{for(const d of Object.values(window.FrontierInventory?.definitions||{}))if(d.category==='medicine'&&/t3$/.test(d.id))scan(Object.values(window.FrontierInventory.definitions).filter(x=>x.family===d.family).map(x=>x.description).join(' '),'戰術補給「'+d.name+'」系列')}catch{}
  try{for(const d of window.FrontierEquipmentCatalogV139?.entries||[])scan(d.description+(d.base||''),'裝備「'+d.name+'」')}catch{}
  try{const env={siesta:'灼燒',kjerag:'寒冷',iberia:'神經損傷',chernobog:'中毒'};for(const[r,term]of Object.entries(env)){const t=byAlias.get(term);if(t)out.get(t.id).add('地區環境（'+({siesta:'汐斯塔',kjerag:'謝拉格',iberia:'伊比利亞',chernobog:'切爾諾伯格'})[r]+'）')}}catch{}
  return out;
 }
 const sources=id=>{sourceCache??=collect();return [...(sourceCache.get(id)||[])]};
 let pop=null,anchor=null;
 function close(){pop?.remove();pop=null;anchor?.classList.remove('gl-open');anchor=null}
 function place(){if(!pop||!anchor)return;if(!anchor.isConnected){close();return}const r=anchor.getBoundingClientRect(),vw=document.documentElement.clientWidth,w=Math.min(360,vw-32);pop.style.width=w+'px';pop.style.left=Math.max(16,Math.min(r.left,vw-16-w))+'px';pop.style.top=(r.bottom+6)+'px';pop.style.maxHeight=Math.max(120,window.innerHeight-r.bottom-16)+'px';const got=pop.getBoundingClientRect(),dx=got.left-parseFloat(pop.style.left),dy=got.top-(r.bottom+6);if(Math.abs(dx)>1||Math.abs(dy)>1){pop.style.left=(parseFloat(pop.style.left)-dx)+'px';pop.style.top=(r.bottom+6-dy)+'px'}pop.style.setProperty('--gl-arrow',Math.max(10,Math.min(w-18,r.left+r.width/2-parseFloat(pop.style.left)))+'px')}
 function open(el){const t=T.find(x=>x.id===el.dataset.gl);if(!t)return;if(anchor===el){close();return}close();anchor=el;el.classList.add('gl-open');const groups=new Map();for(const s of sources(t.id)){const m=s.match(/^(幹員 [^（]+)（(.+)）$/),k=m?m[1]:s;if(!groups.has(k))groups.set(k,[]);if(m)groups.get(k).push(m[2])}const list=[...groups].map(([k,parts])=>parts.length?k+'：'+parts.join('、'):k),shown=list.slice(0,60);pop=document.createElement('div');pop.className='gl-pop';pop.setAttribute('role','note');pop.innerHTML='<div class="gl-head"><b>'+esc(t.name)+'</b><span>'+esc(t.side)+'</span></div><p>'+esc(t.desc)+'</p><p><b>效果：</b>'+esc(t.effect)+'</p>'+(t.note?'<p class="gl-note">⚠ '+esc(t.note)+'</p>':'')+'<p><b>提到此效果的資料（'+list.length+'）：</b></p>'+(shown.length?'<ul>'+shown.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>'+(list.length>shown.length?'<p class="gl-note">另有 '+(list.length-shown.length)+' 項未列出。</p>':''):'<p class="gl-note">目前未找到相關描述。</p>');(el.closest('dialog[open]')||document.body).append(pop);place()}
 const SKIP='script,style,textarea,input,select,option,button,[contenteditable],.gl-term,.gl-pop,svg,code';
 function wrap(root){if(!root||root.nodeType!==1&&root.nodeType!==11)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{pattern.lastIndex=0;return n.parentElement&&!n.parentElement.closest(SKIP)&&pattern.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});const nodes=[];while(w.nextNode())nodes.push(w.currentNode);for(const n of nodes){const s=n.nodeValue,frag=document.createDocumentFragment();let last=0;pattern.lastIndex=0;for(const m of s.matchAll(pattern)){if(m.index>last)frag.append(s.slice(last,m.index));const span=document.createElement('span');span.className='gl-term';const term=byAlias.get(m[0]);const operatorText=n.parentElement.closest('.play-card')&&!/受到|承受|解除|淨化|免疫/.test(s);span.dataset.gl=operatorText&&term.opTwin?term.opTwin:term.id;span.tabIndex=0;span.setAttribute('role','button');span.textContent=m[0];frag.append(span);last=m.index+m[0].length}if(last<s.length)frag.append(s.slice(last));n.replaceWith(frag)}}
 let queued=new Set(),scheduled=false;
 function flush(){scheduled=false;const roots=[...queued];queued.clear();observer.disconnect();try{for(const r of roots)if(r.isConnected)wrap(r)}finally{observer.observe(document.body,{childList:true,subtree:true,characterData:true})}if(anchor&&!anchor.isConnected)close()}
 const observer=new MutationObserver(list=>{for(const m of list){if(m.target.closest?.('.gl-pop')||m.target.parentElement?.closest?.('.gl-pop'))continue;queued.add(m.type==='characterData'?m.target.parentElement:m.target)}queued.delete(null);if(queued.size&&!scheduled){scheduled=true;setTimeout(flush,16)}});
 const css=`.gl-term{text-decoration:underline dotted;text-decoration-thickness:1.5px;text-underline-offset:3px;cursor:help;color:inherit}.gl-term:hover,.gl-term.gl-open{text-decoration-style:solid;color:#ffd36b}.gl-term:focus-visible{outline:2px solid #ffd36b;outline-offset:1px}
.gl-pop{position:fixed;z-index:2147483000;box-sizing:border-box;overflow:auto;padding:10px 12px;border:1px solid #ffd36b;border-radius:6px;background:#15181d;color:#e8ecf1;font-size:13px;line-height:1.55;text-align:left;box-shadow:0 8px 24px rgba(0,0,0,.45)}
.gl-pop::before{content:'';position:absolute;top:-6px;left:var(--gl-arrow,16px);width:10px;height:10px;background:#15181d;border-left:1px solid #ffd36b;border-top:1px solid #ffd36b;transform:rotate(45deg)}
.gl-pop p{margin:4px 0}.gl-pop ul{margin:2px 0 0;padding-left:18px}.gl-pop li{margin:1px 0}.gl-head{display:flex;justify-content:space-between;gap:8px;align-items:baseline;border-bottom:1px solid #333a44;padding-bottom:4px;margin-bottom:4px}.gl-head b{font-size:15px;color:#ffd36b}.gl-head span{font-size:12px;color:#9aa5b1}.gl-note{color:#f0b37e;font-size:12px}`;
 function init(){const st=document.createElement('style');st.textContent=css;document.head.append(st);
  document.addEventListener('click',e=>{const t=e.target.closest?.('.gl-term');if(t){e.preventDefault();e.stopPropagation();open(t);return}if(pop&&!e.target.closest('.gl-pop'))close()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pop){close();e.stopPropagation()}else if((e.key==='Enter'||e.key===' ')&&e.target.classList?.contains('gl-term')){e.preventDefault();open(e.target)}},true);
  window.addEventListener('scroll',()=>place(),true);window.addEventListener('resize',()=>place());
  wrap(document.body);observer.observe(document.body,{childList:true,subtree:true,characterData:true})}
 if(document.body)init();else document.addEventListener('DOMContentLoaded',init);
 return{terms:T,sources,open,close,wrap};
})();
