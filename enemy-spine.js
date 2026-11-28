'use strict';
/* 敵人 Spine 小模型（直接播放 PRTS 官方 Spine 3.8 素材）。
   只播待機動作、鎖定根骨骼位置，模型原地動、不左右移動。素材 © Hypergryph。
   沒有素材或 WebGL 不可用時回傳 false，由呼叫端退回 webp／靜態圖。 */
window.FrontierEnemySpine=(()=>{
 const base='assets/enemy-spine/',failed=new Set(),live=new Set(),byKey=new Map();let raf=0,last=0;const cost={n:0,ms:0,created:0,reused:0};
 /* 播放程式庫（約 420KB）在第一次需要時才載入；載入前先用原本的圖片，載完再重繪一次。 */
 let loading=null;
 function ensure(){if(window.spine?.webgl)return true;if(!loading){loading=new Promise((res,rej)=>{const s=document.createElement('script');s.src='vendor/spine-webgl-3.8.js';s.onload=res;s.onerror=rej;document.head.append(s)}).then(()=>{if(typeof render==='function')render()}).catch(()=>{loading=null})}return false}
 const ok=()=>!matchMedia('(prefers-reduced-motion: reduce)').matches&&ensure();
 /* 組長／強化型（_2、_4…）沒有獨立素材時沿用基本型。 */
 const resolve=id=>{const I=window.FrontierEnemySpineIndex||{};if(I[id])return id;const base=String(id).replace(/_\d+$/,'');return I[base]?base:null};
 const has=id=>{const r=resolve(id);return !!r&&!failed.has(r)};
 const names=data=>data.animations.map(a=>a.name);
 /* 形態 A／B：B_Idle、Idle_B、Idle_BK 等命名都支援。 */
 const staged=(list,base,stage)=>list.find(n=>new RegExp('^'+stage+'_'+base+'$','i').test(n))||list.find(n=>new RegExp('^'+base+'_'+stage+'K?$','i').test(n));
 function pickIdle(data,stage='A'){const n=names(data);return staged(n,'Idle',stage)||(stage==='A'?null:staged(n,'Idle','A'))||n.find(x=>/^idle$/i.test(x))||n.find(x=>/idle/i.test(x))||n.find(x=>/default/i.test(x))||n[0]}
 /* 轉階段：Revive 系列 → A 形態倒下系列 → 單一 Die。回傳動作序列。 */
 function transitionSeq(data){const n=names(data),pick=re=>n.find(x=>re.test(x));
  const rv=['Begin','Loop','End'].map(s=>pick(new RegExp('^Revive_'+s+'$','i'))).filter(Boolean);if(rv.length)return rv;
  const a=[pick(/^A_Die_Start$/i)||pick(/^Die_Begin_AK?$/i),pick(/^A_Die_Loop$/i)||pick(/^Die_Loop_AK?$/i),pick(/^A_Die_End$/i)||pick(/^Die_End_AK?$/i)].filter(Boolean);if(a.length)return a;
  const d=pick(/^Die_AK?$/i)||pick(/^A_Die$/i);if(d)return [d];const plain=pick(/^Die$/i);return plain?[plain]:[]}
 function mount(host,id,key,stage='A'){
  if(!ok()||!has(id)||!host)return false;id=resolve(id);
  /* 同一個敵人重繪時沿用原畫布，不重建 WebGL、不重新載入。 */
  const k=key?id+'|'+key:null,old=k&&byKey.get(k);if(old&&live.has(old)){cost.reused++;old.detachedAt=0;old.host=host;if(old.canvas.parentNode!==host)host.replaceChildren(old.canvas);return true}
  cost.created++;const canvas=document.createElement('canvas');canvas.className='enemy-art enemy-spine-model';canvas.setAttribute('aria-hidden','true');
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false});if(!gl)return false;
  const ctx=new spine.webgl.ManagedWebGLRenderingContext(gl),renderer=new spine.webgl.SceneRenderer(canvas,ctx,true),assets=new spine.webgl.AssetManager(ctx,base+id+'/');
  const st={id,canvas,ctx,renderer,assets,ready:false,host,stage,width:0,height:0};const size=()=>{const dpr=Math.min(1.5,devicePixelRatio||1);st.width=Math.round(canvas.clientWidth*dpr);st.height=Math.round(canvas.clientHeight*dpr)};size();if(window.ResizeObserver){st.sizeObserver=new ResizeObserver(entries=>{const r=entries[0]?.contentRect;if(r){const dpr=Math.min(1.5,devicePixelRatio||1);st.width=Math.round(r.width*dpr);st.height=Math.round(r.height*dpr)}});st.sizeObserver.observe(canvas)}
  assets.loadBinary(id+'.skel');assets.loadTextureAtlas(id+'.atlas');
  host.replaceChildren(canvas);live.add(st);if(k){st.key=k;byKey.set(k,st)}loop();return true}
 function setup(st){
  const atlas=st.assets.get(st.id+'.atlas'),loader=new spine.AtlasAttachmentLoader(atlas),bin=new spine.SkeletonBinary(loader);bin.scale=1;
  const raw=st.assets.get(st.id+'.skel'),data=raw[0]===123?new spine.SkeletonJson(loader).readSkeletonData(new TextDecoder().decode(raw)):bin.readSkeletonData(raw),sk=new spine.Skeleton(data),anim=pickIdle(data,st.stage);st.data=data;
  const state=new spine.AnimationState(new spine.AnimationStateData(data));if(anim)state.setAnimation(0,anim,true);
  /* 以第 0 格的邊界框置中，之後不再重算，避免動作造成縮放跳動。 */
  sk.setToSetupPose();state.apply(sk);sk.updateWorldTransform();const off=new spine.Vector2(),size=new spine.Vector2();sk.getBounds(off,size,[]);
  Object.assign(st,{sk,state,bounds:{x:off.x,y:off.y,w:Math.max(1,size.x),h:Math.max(1,size.y)},ready:true});if(st.want)applyMotion(st,st.want)}
 /* 收容管理場：在 Idle 與 Move 間切換；沒有 Move 的模型維持 Idle */
 function moveName(data){const n=names(data);return n.find(x=>/^move_loop$/i.test(x))||n.find(x=>/^move$/i.test(x))||n.find(x=>/^run_loop$/i.test(x))||n.find(x=>/^(a_)?move(_a)?$/i.test(x))||n.find(x=>/move/i.test(x)&&!/begin|start|end|die/i.test(x))||null}
 function applyMotion(st,want){const name=want==='move'?moveName(st.data)||pickIdle(st.data,'A'):pickIdle(st.data,'A');if(name&&st.current!==name){st.current=name;st.state.setAnimation(0,name,true)}}
 function motion(id,key,want){const r=resolve(id),st=r&&byKey.get(r+'|'+key);if(!st)return;st.want=want;if(st.ready)applyMotion(st,want)}
 function draw(st,dt){
  if(!st.canvas.isConnected){if(!st.detachedAt)st.detachedAt=performance.now();if(performance.now()-st.detachedAt<500)return;st.sizeObserver?.disconnect();st.ctx.gl.getExtension('WEBGL_lose_context')?.loseContext();live.delete(st);if(st.key)byKey.delete(st.key);return}
  if(!st.ready){if(st.assets.isLoadingComplete()){try{setup(st)}catch(e){console.warn('spine',st.id,e);live.delete(st);(failed.add(st.id),st.host.dispatchEvent(new CustomEvent('spine-failed')));return}}else{if(st.assets.hasErrors()){live.delete(st);(failed.add(st.id),st.host.dispatchEvent(new CustomEvent('spine-failed')))}return}}
  const c=st.canvas,w=st.width,h=st.height;if(!w||!h)return;if(c.width!==w||c.height!==h){c.width=w;c.height=h}
  st.state.update(dt);st.state.apply(st.sk);const root=st.sk.getRootBone();root.x=0;root.y=0;st.sk.x=0;st.sk.y=0;st.sk.updateWorldTransform();
  const b=st.bounds,r=st.renderer,cam=r.camera,pad=1.08,scale=Math.max(b.w/w,b.h/h)*pad;
  cam.position.x=b.x+b.w/2;cam.position.y=b.y+b.h/2;cam.viewportWidth=w*scale;cam.viewportHeight=h*scale;cam.update();
  const gl=st.ctx.gl;gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  r.begin();r.drawSkeleton(st.sk,true);r.end()}
 /* 每秒最多 30 格：待機動作看不出差別，手機負擔約減半。 */
 function frame(t){raf=0;if(last&&t-last<30){loop();return}const dt=last?Math.min(.1,(t-last)/1000):0;last=t;if(document.hidden){last=0}else{const t0=performance.now();for(const st of [...live])draw(st,dt);cost.n++;cost.ms+=performance.now()-t0}if(live.size)loop();else last=0}
 function loop(){if(!raf)raf=requestAnimationFrame(frame)}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)loop()});
 /* 播放轉階段動畫，結束後換成 B 形態待機；回傳毫秒（0 表示沒有可播的動作）。總長超過 4 秒會加速。 */
 function transition(id,key,stage='B'){id=resolve(id);const st=byKey.get(id+'|'+key);if(!st)return 0;st.stage=stage;if(!st.ready)return 0;const seq=transitionSeq(st.data);const idle=pickIdle(st.data,stage);if(!seq.length){st.state.setAnimation(0,idle,true);return 0}
  let total=seq.reduce((s,n)=>s+(st.data.findAnimation(n)?.duration||0),0);const speed=total>4?total/4:1;st.state.timeScale=speed;st.state.setAnimation(0,seq[0],false);for(const n of seq.slice(1))st.state.addAnimation(0,n,false,0);const back=st.state.addAnimation(0,idle,true,0);setTimeout(()=>{st.state.timeScale=1},total/speed*1000);return Math.round(total/speed*1000)}
 /* 第幾條命：精英再起、首領第二階段（tacticsBoss）、地區首領 phase。 */
 const lastLife=new Map();
 function lifeOf(e,b){const m=b?.region75;return 1+(e.mob75?.revived?1:0)+(e.tacticsBoss===2?1:0)+(m?.bossUid===e.uid&&m.phase>1?m.phase-1:0)}
 /* 轉換動畫期間鎖住所有操作。 */
 let lockTimer=0;
 function lock(ms,label){let el=document.querySelector('.fd-phase-lock');if(!el){el=document.createElement('div');el.className='fd-phase-lock';el.setAttribute('role','status');document.body.append(el);for(const ev of ['pointerdown','pointerup','click','touchstart','touchend','keydown','contextmenu'])el.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation()},{capture:true,passive:false})}
  el.innerHTML='<b>'+label+'</b>';el.classList.add('is-on');document.documentElement.classList.add('fd-phase-locked');clearTimeout(lockTimer);lockTimer=setTimeout(()=>{el.classList.remove('is-on');document.documentElement.classList.remove('fd-phase-locked')},Math.max(800,ms))}
 document.addEventListener('keydown',e=>{if(document.documentElement.classList.contains('fd-phase-locked')){e.preventDefault();e.stopPropagation()}},true);
 return{mount,motion,transition,lifeOf,lastLife,lock,has,live:()=>live.size,cost:()=>({created:cost.created,reused:cost.reused,frames:cost.n,avgMs:cost.n?+(cost.ms/cost.n).toFixed(2):0})};
})();
