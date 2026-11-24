// One top-layer inspector, positioned away from the active finger for every consumer.
window.FrontierInspector=(()=>{
 let pointer=null;
 window.addEventListener('pointerdown',e=>{if(e.button>0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY}},true);
 window.addEventListener('pointermove',e=>{if(pointer?.id===e.pointerId){pointer.x=e.clientX;pointer.y=e.clientY}},true);
 for(const type of ['pointerup','pointercancel','blur'])window.addEventListener(type,()=>{pointer=null},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest?.('[data-environment-detail],[data-survey16-indicator]'))e.preventDefault()},true);
 function attach(tip){
  const host=[...document.querySelectorAll('dialog[open]')].at(-1)||document.body,v=window.visualViewport,w=v?.width||innerWidth,h=v?.height||innerHeight,ox=v?.offsetLeft||0,oy=v?.offsetTop||0,edge=12,gap=68;
  const above=pointer?Math.max(0,pointer.y-oy-gap-edge):0,below=pointer?Math.max(0,oy+h-edge-pointer.y-gap):h-80,useAbove=!pointer||above>=below,top=useAbove?oy+edge:Math.min(oy+h-edge,pointer.y+gap),room=pointer?(useAbove?above:below):h-80,width=Math.min(480,w-edge*2),left=ox+(w-width)/2;
  host.append(tip);
  if(!tip.hasAttribute('role'))tip.setAttribute('role','tooltip');
  const topCSS=useAbove?'calc('+top+'px + env(safe-area-inset-top))':top+'px';
  for(const[k,value]of Object.entries({'pointer-events':'none','z-index':'2147483647',position:'fixed',inset:topCSS+' auto auto '+left+'px',margin:'0',transform:'none',width:width+'px','max-width':width+'px','max-height':'max(24px, calc('+Math.max(24,room)+'px - env(safe-area-inset-'+(useAbove?'top':'bottom')+')))','box-sizing':'border-box','overflow-y':'auto'}))tip.style.setProperty(k,value,'important');
  if(typeof tip.showPopover==='function'){tip.setAttribute('popover','manual');tip.showPopover()}
  else if(host!==document.body){const old=host.style.getPropertyValue('overflow'),priority=host.style.getPropertyPriority('overflow'),remove=tip.remove.bind(tip),r=host.getBoundingClientRect();host.style.setProperty('overflow','visible','important');tip.style.setProperty('position','absolute','important');tip.style.setProperty('inset',(top-r.top)+'px auto auto '+(left-r.left)+'px','important');tip.remove=()=>{remove();if(old)host.style.setProperty('overflow',old,priority);else host.style.removeProperty('overflow')}}
  if(tip.querySelector('.equipment-detail58')){
    tip.style.setProperty('max-height','calc('+Math.max(24,h-2*edge)+'px - env(safe-area-inset-top) - env(safe-area-inset-bottom))','important');
    const height=tip.offsetHeight, origin=tip.style.position==='absolute'?host.getBoundingClientRect():{top:0,left:0};
    tip.style.setProperty('inset','calc('+ (oy+Math.max(edge,(h-height)/2)-origin.top) +'px + env(safe-area-inset-top)/2) auto auto '+(left-origin.left)+'px','important');
  }
  fit(tip,h,oy,edge,host);
  return tip;
 }
 // Tooltips can't scroll (pointer-events:none while the finger holds), so long text must fit: shrink type first, then take the whole viewport height.
 function fit(tip,h,oy,edge,host){
  const over=()=>tip.scrollHeight>tip.clientHeight+1;if(!over())return;
  const nodes=[tip,...tip.querySelectorAll('*')],base=nodes.map(n=>parseFloat(getComputedStyle(n).fontSize)||12);
  for(let s=.92;s>=.68&&over();s-=.08)nodes.forEach((n,i)=>n.style.setProperty('font-size',Math.max(9,base[i]*s).toFixed(1)+'px','important'));
  if(!over())return;
  const origin=tip.style.position==='absolute'?host.getBoundingClientRect():{top:0};
  tip.style.setProperty('max-height','calc('+Math.max(24,h-2*edge)+'px - env(safe-area-inset-top) - env(safe-area-inset-bottom))','important');
  tip.style.setProperty('top','calc('+(oy+edge-origin.top)+'px + env(safe-area-inset-top))','important');tip.style.setProperty('bottom','auto','important');
 }
 return{attach};
})();
'use strict';
window.FrontierPresentation=(()=>{
 const names={bleed:'流血',poison:'中毒',burn:'灼燒',cold:'寒冷',freeze:'凍結',neural:'神經損傷',fear:'恐懼',silence:'沉默',wound:'傷口',corrosion:'腐蝕',vuln:'易傷'};
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function statuses(a){const rows=Object.entries(a.status||{}).filter(([,v])=>Number(v)>0).map(([k,v])=>(names[k]||k)+' '+v);if(a.power)rows.push('增傷 +'+a.power);if(a.block)rows.push('護盾 '+a.block);if(a.taunt)rows.push('嘲諷 '+a.taunt);if(a.thorns)rows.push('反傷 '+a.thorns);if(a.regionalFear)rows.push('溶血駭懼：卡牌 +1 AP，攻擊扎羅可解除');if(a.regionalAttackWeaken)rows.push('破勢：下一張攻擊牌傷害降低 20%');if(Object.values(a.drug||{}).some(v=>v===true||typeof v==='number'&&v>0))rows.push('藥效');return rows}
 function polish(){if(!matchMedia('(max-width:720px)').matches)return;const r=R(),board=document.querySelector('.screen-combat-body .card-battle');if(!board||!r?.battle)return;board.classList.add('compact-combat-board');if(r.operatorSystemVersion===113)return;for(const row of board.querySelectorAll('.team-actor')){const id=row.querySelector('button[onclick]')?.getAttribute('onclick')?.match(/(?:skill|choose)\('([^']+)'\)/)?.[1],a=r.team.find(x=>x.id===id);if(!a)continue;const image=row.querySelector('.avatar'),skill=row.querySelector('button'),label=document.createElement('div');label.className='actor-row-identity';if(image)label.append(image);const text=document.createElement('span');text.innerHTML='<b>'+esc(FrontierCapture.units[id].name)+'</b><small>'+a.hp+'/'+a.max+' HP</small>';label.append(text);const fill=document.createElement('span');fill.className='actor-row-health';fill.style.width=Math.max(0,a.hp/a.max*100)+'%';const state=document.createElement('span');state.className='actor-row-status';state.textContent=statuses(a).join(' · ')||'正常';row.dataset.inspectActor=id;row.replaceChildren(fill,label,state);if(skill)row.append(skill)}for(const e of board.querySelectorAll('.enemy-card'))e.dataset.inspectEnemy=e.dataset.enemyId;}
 const previous=render;render=function(){previous();polish()};
 let hold=null,tip=null,suppressUntil=0;
 function hide(){if(hold?.shown)suppressUntil=performance.now()+550;if(hold)clearTimeout(hold.timer);hold=null;tip?.remove();tip=null}
 function skillInfo(id){const d=FrontierCombat.operators[id];if(!d)return '';const map={"rally":"全體存活隊友獲得N格擋","double":"對首個存活敵人連擊2次，每次N傷害","triple":"對首個存活敵人連擊3次，每次N傷害","power":"自身攻擊強化N","pierce":"對最高HP敵人造成N傷害，本擊忽略防禦","supply":"治療隊友NHP，自身獲4盾","shell":"自身獲N盾，嘲諷2回合","regen":"全體存活隊友恢復NHP","drone":"對最高HP敵人造成N傷害並附2中毒","drain":"對最高HP敵人造成N傷害，自身恢復5HP","gravel":"自身獲N盾，嘲諷1回合","spores":"全體敵人受N傷害並附2中毒，治療隊友3HP","bind":"全體敵人受N傷害，本次改為防守","slow":"全體敵人受N傷害，攻擊降低1（至少1）","swordrain":"全體敵人受8法傷，非首領本次改為防守","silence":"最高HP敵人受N傷害並清除命中異常，本次改為防守","charge":"自身獲N盾並獲4荊棘","cleanse":"全體存活隊友恢復NHP並淨化","toxin":"全體敵人受N傷害並附4中毒","silverash":"全體敵人受N傷害，自身格擋歸零","calcify":"全體存活隊友恢復NHP並獲3盾，全體敵人易傷+1"};let text=({amiya:R()?.amiyaForm==='medic'?'全體存活隊友恢復6HP並淨化':R()?.amiyaForm==='guard'?'對最高HP敵人造成17物傷':'對最高HP敵人造成14法傷',beagle:'可指定存活隊友獲10格擋；指定自己時額外嘲諷2回合',hibiscus:'指定隊友恢復8HP並淨化'})[id]||map[d.skillEffect]||'依專屬技能效果施放';text=text.replaceAll('N',String(d.magnitude));return '<h4>額外專屬技能 · '+esc(d.skill)+'</h4><p>'+esc(text)+'。基礎費用 '+d.cost+' 行動點 · 冷卻 '+d.cooldown+' 回合。</p>'}
 function mechanicLines(entries){const lines=entries.flatMap(s=>s.split(/\n|。(?=.)/)).map(s=>s.trim()).filter(Boolean);return (lines.length?lines:['目前無額外機制或狀態']).map(s=>'<p>'+esc(s)+'</p>').join('');}
 function inspect(el){const r=R(),enemy=el.dataset.inspectEnemy&&r?.battle?.enemies.find(e=>e.id===el.dataset.inspectEnemy),id=el.dataset.inspectActor,d=FrontierCombat.operators[id],a=enemy||r?.team?.find(a=>a.id===id)||(d?{...d,id,hp:d.hp,max:d.hp,block:0,status:{},baseStats:true}:null);if(!a){const unit=window.FrontierCapture?.units[id];if(!unit)return;const source=window.FrontierEnemyData?.units[id],base=source?.sourceStats;tip=document.createElement('aside');tip.className='hold-inspection';tip.setAttribute('role','tooltip');tip.innerHTML='<b>'+esc(unit.name)+'</b><p>'+esc(source?.originalDescription||'已收容單位，成功撤離後可加入持有與派駐。')+'</p>'+(base?'<p>原作基礎資料：HP '+base.hp+' · 攻擊 '+base.atk+' · 防禦 '+base.def+' · 法抗 '+base.res+'%</p><small>局內敵人數值依地區與難度調整。</small>':'')+'<p>放開即關閉</p>';FrontierInspector.attach(tip);hold.shown=true;return}const special=enemy?[FrontierRegionalEnemies.detail(enemy),enemy.special?(FrontierBreaks.telegraph(enemy,r.battle.turn)+'。累積傷害達門檻，或用異常、打斷等效果累積失衡衝擊，成功即取消這次特殊攻擊。'):'',enemy.status?'命中施加 '+(names[enemy.status]||enemy.status)+' '+(enemy.statusStacks||1):'',enemy.poison?'毒蝕 '+enemy.poison:'',enemy.vuln?'易傷 '+enemy.vuln:'',r.battle.hiddenCore&&enemy===r.battle.enemies[0]?'冰封核心：開場6盾，每回合恢復4盾':'',enemy.npcTarget?'下一擊攻擊護送NPC':'',...(window.FrontierOperatorUIV113?.statusDetails(enemy)||[]).map(entry=>entry.text)].filter(Boolean):statuses(a);tip=document.createElement('aside');tip.className='hold-inspection';tip.setAttribute('role','tooltip');tip.innerHTML='<b>'+esc(enemy?a.name:FrontierCapture.units[a.id].name)+'</b><p>HP '+a.hp+'/'+a.max+' · 護盾 '+(a.block||0)+'</p><p>攻擊 '+a.atk+' · 防禦 '+a.def+' · 法抗 '+a.res+'%'+(a.baseStats?'（基礎值，培育另計）':'')+'</p>'+(enemy?'':skillInfo(a.id))+(enemy?mechanicLines(special):'<p>'+esc(special.join('／')||'目前無額外機制或狀態')+'</p>')+'<small>放開即關閉</small>';FrontierInspector.attach(tip);hold.shown=true;}
 document.addEventListener('pointerdown',event=>{if(event.button>0)return;const el=event.target.closest?.('[data-inspect-enemy],[data-inspect-actor]');if(!el||event.button>0)return;hide();hold={pointer:event.pointerId,x:event.clientX,y:event.clientY,shown:false};hold.timer=setTimeout(()=>{if(hold)inspect(el)},350)},true);
 document.addEventListener('pointermove',event=>{if(hold&&event.pointerId===hold.pointer&&Math.hypot(event.clientX-hold.x,event.clientY-hold.y)>12)hide()},true);
 document.addEventListener('pointerup',event=>{if(hold?.shown){suppressUntil=performance.now()+550;event.preventDefault()}hide()},true);
 document.addEventListener('pointercancel',hide,true);window.addEventListener('blur',hide);
 window.addEventListener('click',event=>{if(performance.now()<suppressUntil&&event.target.closest?.('[data-inspect-enemy],[data-inspect-actor]')){event.preventDefault();event.stopImmediatePropagation()}},true);
 document.addEventListener('contextmenu',event=>{if(event.target.closest?.('[data-inspect-enemy],[data-inspect-actor]'))event.preventDefault()});
 window.addEventListener('pointerdown',()=>{suppressUntil=0},true);
 return{polish,statuses,skillInfo};
})();

// 手機長按：不選取文字、不跳出圖片儲存／放大選單（輸入框仍可選取）。
(()=>{const st=document.createElement('style');st.textContent='html,body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}input,textarea,select,[contenteditable],[contenteditable] *{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}img{-webkit-user-drag:none;user-drag:none;-webkit-touch-callout:none}';document.head.append(st);
 const editable=t=>t?.closest?.('input,textarea,select,[contenteditable]');
 addEventListener('contextmenu',e=>{if(!editable(e.target))e.preventDefault()},{capture:true});
 addEventListener('dragstart',e=>{if(e.target?.tagName==='IMG')e.preventDefault()},{capture:true});
 addEventListener('selectstart',e=>{if(!editable(e.target))e.preventDefault()},{capture:true});})();