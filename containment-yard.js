'use strict';
/* 收容管理場：所有已收容個體以 Spine 模型在同一張 WebGL 畫布上自由走動。
   同物種共用骨架（各動作 2 組相位），可容納上千隻；支援縮放／平移、點擊資料、改名、長按拖曳。 */
window.FrontierContainmentYard=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const BASE='assets/enemy-spine/',UNIT=.12,ELITE=1.15,HOLD_MS=360,NAME_MAX=12,PHASES=2,MAX_ZOOM=3;
 let mobs=[],raf=0,last=0,yard=null,gl=null,fx=null,shadow=null,bubble=null,focus=null,editing=false,cam={x:0,y:0,z:1},world={w:400,h:700},minZoom=.5;
 const species=new Map(),pointers=new Map(),perf={ms:0,n:0};let gesture=null,assets=null,ctx=null,renderer=null,shader=null,clock=0;
 const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const V=()=>window.FrontierVariants;
 const variantOf=i=>V()?.of(i)||null;
 const instances=()=>(db.capture?.instances||[]).filter(i=>FrontierCapture.units[i.species]?.kind==='enemy');
 const nameOf=i=>(i.nickname||FrontierCapture.units[i.species].name)+(V()?.suffix(variantOf(i))||'');
 /* 沒有模型的個體自動移除（派駐遠征中的等歸隊後再處理） */
 function purge(){
  const c=db.capture;if(!c?.instances||!window.FrontierEnemySpine)return 0;
  const gone=c.instances.filter(i=>!i.assignment&&!FrontierEnemySpine.has(i.species));
  if(!gone.length)return 0;const ids=new Set(gone.map(i=>i.uid));
  c.instances=c.instances.filter(i=>!ids.has(i.uid));if(ids.has(c.support))c.support=null;save();return gone.length;
 }
 function difficulty(i){
  const u=FrontierCapture.units[i.species],r=u.rarity||1,v=variantOf(i);
  const [label,cls]=u.boss?['極高','x']:r>=3?['高','h']:r===2?['中','m']:['低','l'];
  return '<span class="yard-diff yard-diff-'+cls+'">'+label+' '+'★'.repeat(Math.min(6,Math.max(1,r)))+'</span>'+(v?'<span class="yard-diff yard-diff-'+v+'">'+V().label(v)+'</span>':'')+(i.mutation?'<span class="yard-diff yard-diff-x">變異</span>':'');
 }
 function when(t){if(!Number.isFinite(t))return '未知';const d=new Date(t),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'/'+p(d.getMonth()+1)+'/'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())}
 function region(i){const id=i.origin?.region;return FrontierExpedition.regions.find(r=>r.id===id)?.name||'舊收容檔案'}
 function view(){
  const n=instances().length;
  return '<section class="yard" aria-label="收容管理場"><canvas class="yard-shadows" aria-hidden="true"></canvas><canvas class="yard-gl" aria-hidden="true"></canvas><canvas class="yard-fx" aria-hidden="true"></canvas><div class="yard-head"><button class="yard-back" data-yard-back aria-label="返回主頁"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><div class="yard-title"><small>CONTAINMENT YARD</small><b>收容管理場</b></div><span class="yard-count">收容個體 '+n+'</span></div>'+(n?'<p class="yard-hint">點擊查看 · 長按拖曳 · 雙指縮放</p>':'<p class="yard-empty">尚無收容個體。<br>於遠征中削弱敵人並使用收容裝置，成功撤離後會在這裡出現。</p>')+'<div class="yard-zoom"><button data-yard-zoom="1" aria-label="放大">＋</button><button data-yard-zoom="-1" aria-label="縮小">－</button></div><div class="yard-layer"></div></section>';
 }
 /* ---------- Spine 共用渲染 ---------- */
 function makeShader(c){
  const S=spine.webgl.Shader;
  const vs='attribute vec4 '+S.POSITION+';attribute vec4 '+S.COLOR+';attribute vec4 '+S.COLOR2+';attribute vec2 '+S.TEXCOORDS+';uniform mat4 '+S.MVP_MATRIX+';varying vec4 v_light;varying vec4 v_dark;varying vec2 v_texCoords;void main(){v_light='+S.COLOR+';v_dark='+S.COLOR2+';v_texCoords='+S.TEXCOORDS+';gl_Position='+S.MVP_MATRIX+'*'+S.POSITION+';}';
  /* 色違：YIQ 色相旋轉＋微增飽和；閃光：略提亮 */
  const fs='#ifdef GL_ES\nprecision mediump float;\n#endif\nvarying vec4 v_light;varying vec4 v_dark;varying vec2 v_texCoords;uniform sampler2D u_texture;uniform float u_hue;uniform float u_sat;uniform float u_bri;'
  +'void main(){vec4 t=texture2D(u_texture,v_texCoords);vec4 o;o.a=t.a*v_light.a;o.rgb=((t.a-1.0)*v_dark.a+1.0-t.rgb)*v_dark.rgb+t.rgb*v_light.rgb;'
  +'if(u_sat!=1.0||u_hue!=0.0){mat3 a=mat3(0.299,0.596,0.211,0.587,-0.274,-0.523,0.114,-0.322,0.312);mat3 b=mat3(1.0,1.0,1.0,0.956,-0.272,-1.106,0.621,-0.647,1.703);vec3 y=a*o.rgb;float h=atan(y.z,y.y)+u_hue;float ch=length(y.yz)*u_sat;o.rgb=clamp(b*vec3(y.x,ch*cos(h),ch*sin(h)),0.0,1.0);}'
  +'o.rgb=min(o.rgb*u_bri,vec3(o.a));gl_FragColor=o;}';
  return new S(c,vs,fs);
 }
 function loadRuntime(){
  if(window.spine?.webgl)return Promise.resolve(true);
  return new Promise(res=>{let s=document.querySelector('script[src*="spine-webgl-3.8"]');if(!s){s=document.createElement('script');s.src='vendor/spine-webgl-3.8.js';document.head.append(s)}s.addEventListener('load',()=>res(true));s.addEventListener('error',()=>res(false));setTimeout(()=>res(!!window.spine?.webgl),8000)});
 }
 function setupGL(){
  const canvas=yard.querySelector('.yard-gl'),g=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true});if(!g)return false;
  ctx=new spine.webgl.ManagedWebGLRenderingContext(g);renderer=new spine.webgl.SceneRenderer(canvas,ctx,true);shader=makeShader(ctx);renderer.batcherShader=shader;
  assets=new spine.webgl.AssetManager(ctx,BASE);species.clear();return true;
 }
 function resolveId(id){const I=window.FrontierEnemySpineIndex||{};if(I[id])return id;const b=String(id).replace(/_\d+$/,'');return I[b]?b:null}
 function speciesOf(id){
  const sid=resolveId(id);if(!sid)return null;let sp=species.get(sid);
  if(!sp){sp={id:sid,state:'loading'};species.set(sid,sp);assets.loadBinary(sid+'/'+sid+'.skel');assets.loadTextureAtlas(sid+'/'+sid+'.atlas')}
  return sp;
 }
 const animNames=d=>d.animations.map(a=>a.name);
 function idleName(d){const n=animNames(d);return n.find(x=>/^idle$/i.test(x))||n.find(x=>/^(a_)?idle(_a)?$/i.test(x))||n.find(x=>/idle/i.test(x)&&!/die|_b/i.test(x))||n.find(x=>/default/i.test(x))||n[0]}
 function moveName(d){const n=animNames(d);return n.find(x=>/^move_loop$/i.test(x))||n.find(x=>/^move$/i.test(x))||n.find(x=>/^run_loop$/i.test(x))||n.find(x=>/^(a_)?move(_a)?$/i.test(x))||n.find(x=>/move/i.test(x)&&!/begin|start|end|die/i.test(x))||idleName(d)}
 function prepare(sp){
  if(sp.state!=='loading')return;const sid=sp.id,ap=sid+'/'+sid+'.atlas',sk=sid+'/'+sid+'.skel';
  if(assets.isLoadingComplete()||(assets.get(ap)&&assets.get(sk))){
   if(!assets.get(ap)||!assets.get(sk)){sp.state='failed';return}
   try{
    const loader=new spine.AtlasAttachmentLoader(assets.get(ap)),raw=assets.get(sk);
    const data=raw[0]===123?new spine.SkeletonJson(loader).readSkeletonData(new TextDecoder().decode(raw)):new spine.SkeletonBinary(loader).readSkeletonData(raw);
    const probe=new spine.Skeleton(data);probe.setToSetupPose();probe.updateWorldTransform();const off=new spine.Vector2(),size=new spine.Vector2();probe.getBounds(off,size,[]);
    const rig=name=>Array.from({length:PHASES},(_,k)=>{const s=new spine.Skeleton(data),st=new spine.AnimationState(new spine.AnimationStateData(data));st.setAnimation(0,name,true);st.update(k*.37+Math.random()*.2);return{s,st,used:false}});
    Object.assign(sp,{data,bounds:{x:off.x,y:off.y,w:Math.max(1,size.x),h:Math.max(1,size.y)},idle:rig(idleName(data)),move:rig(moveName(data)),state:'ready'});
   }catch(e){console.warn('yard spine',sid,e);sp.state='failed'}
  }else if(assets.hasErrors()&&Object.keys(assets.getErrors?.()||{}).some(k=>k.includes(sid+'/'))){sp.state='failed'}
 }
 /* ---------- 場地 ---------- */
 function layoutWorld(n){
  const r=yard.getBoundingClientRect(),f=clamp(Math.sqrt(n/100),1,3.3);
  world={w:Math.round(r.width*f),h:Math.round(r.height*f),f};
  minZoom=Math.min(.6,1/f);
 }
 function spread(n){
  /* 抖動網格：鬆散且 O(n)，上千隻也不卡 */
  const m=44,w=world.w-m*2,h=world.h-m*2-60,cols=Math.max(1,Math.round(Math.sqrt(n*w/h))),rows=Math.max(1,Math.ceil(n/cols)),cells=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push([c,r]);
  for(let k=cells.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[cells[k],cells[j]]=[cells[j],cells[k]]}
  return cells.slice(0,n).map(([c,r])=>({x:m+(c+rnd(.15,.85))*w/cols,y:m+60+(r+rnd(.2,.95))*h/rows}));
 }
 function mount(){
  stop();yard=document.querySelector('.yard');if(!yard)return;
  const navTop=document.querySelector('#nav')?.getBoundingClientRect().top;if(navTop>0&&navTop<innerHeight)yard.style.bottom=(innerHeight-navTop)+'px';
  const removed=purge();if(removed){yard.querySelector('.yard-count').textContent='收容個體 '+instances().length;toast('已移除 '+removed+' 隻沒有模型的收容個體。')}
  fx=yard.querySelector('.yard-fx');shadow=yard.querySelector('.yard-shadows');
  const list=instances();layoutWorld(list.length);cam={x:world.w/2,y:Math.min(world.h/2,yard.clientHeight/2),z:1};clampCam();
  const pts=spread(list.length);
  mobs=list.map((i,k)=>{const u=FrontierCapture.units[i.species];return{i,v:variantOf(i),sp:null,phase:k%PHASES,x:pts[k].x,y:pts[k].y,tx:pts[k].x,ty:pts[k].y,dir:Math.random()<.5?-1:1,mode:'idle',wait:rnd(.2,4),speed:rnd(9,16)*(u.rarity>=3?.9:1),s:UNIT*(u.rarity>=3?ELITE:1)*(i.mutation?1.05:1),hop:0,lift:0,motion:'idle',seed:Math.random()*10}});
  loadRuntime().then(ok=>{if(!ok||!yard?.isConnected)return;if(!setupGL()){toast('此裝置不支援 WebGL，無法顯示模型。');return}for(const m of mobs)m.sp=speciesOf(m.i.species);last=0;raf=requestAnimationFrame(tick)});
 }
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;mobs=[];focus=null;bubble=null;editing=false;gesture=null;pointers.clear();try{ctx?.gl.getExtension('WEBGL_lose_context')?.loseContext()}catch{}ctx=null;renderer=null;assets=null;species.clear()}
 function clampCam(){
  const vw=yard.clientWidth/cam.z,vh=yard.clientHeight/cam.z;
  cam.x=vw>=world.w?world.w/2:clamp(cam.x,vw/2,world.w-vw/2);cam.y=vh>=world.h?world.h/2:clamp(cam.y,vh/2,world.h-vh/2);
 }
 const toWorld=(cx,cy)=>{const r=yard.getBoundingClientRect();return{x:cam.x+(cx-r.left-r.width/2)/cam.z,y:cam.y+(cy-r.top-r.height/2)/cam.z}};
 const toScreen=(x,y)=>({x:(x-cam.x)*cam.z+yard.clientWidth/2,y:(y-cam.y)*cam.z+yard.clientHeight/2});
 function zoomAt(z,sx,sy){const r=yard.getBoundingClientRect();sx??=r.left+r.width/2;sy??=r.top+r.height/2;const before=toWorld(sx,sy);cam.z=clamp(z,minZoom,MAX_ZOOM);const after=toWorld(sx,sy);cam.x+=before.x-after.x;cam.y+=before.y-after.y;clampCam()}
 /* 個體外框（世界座標）：腳底為 (x,y) */
 function box(m){const b=m.sp?.state==='ready'?m.sp.bounds:{x:-80,y:0,w:160,h:200},w=b.w*m.s,h=(b.y+b.h)*m.s,cx=m.x+(b.x+b.w/2)*m.s*(m.dir>0?-1:1);return{l:cx-w/2,r:cx+w/2,t:m.y-h-m.hop-m.lift,b:m.y+4,cx,w,h}}
 function hit(wx,wy){let best=null;for(const m of mobs){const b=box(m);if(wx>=b.l&&wx<=b.r&&wy>=b.t&&wy<=b.b&&(!best||m.y>best.y))best=m}return best}
 /* ---------- 主迴圈 ---------- */
 function tick(t){
  raf=0;if(!yard?.isConnected||!renderer){stop();return}
  const dt=last?Math.min(.1,(t-last)/1000):0;last=t;clock+=dt;
  for(const sp of species.values())prepare(sp);
  for(const m of mobs)step(m,dt);
  const t0=performance.now();draw(dt);perf.ms=perf.ms*.9+(performance.now()-t0)*.1;perf.n++;if(bubble&&focus)aim();
  raf=requestAnimationFrame(tick);
 }
 function step(m,dt){
  if(m.hop>0)m.hop=Math.max(0,m.hop-dt*50);
  const held=gesture?.type==='drag'&&gesture.m===m;m.lift+=((held?10:0)-m.lift)*Math.min(1,dt*14);
  if(held||focus===m){m.motion='idle';return}
  if(m.mode==='idle'){m.motion='idle';m.wait-=dt;if(m.wait<=0){const far=Math.random()<.25,r=far?rnd(90,200):rnd(25,90),a=rnd(0,Math.PI*2);m.tx=clamp(m.x+Math.cos(a)*r,30,world.w-30);m.ty=clamp(m.y+Math.sin(a)*r*.6,90,world.h-10);m.mode='walk'}}
  else{const dx=m.tx-m.x,dy=m.ty-m.y,d=Math.hypot(dx,dy);if(d<1.5){m.mode='idle';m.wait=rnd(1.5,7)}else{const s=Math.min(d,m.speed*dt);m.x+=dx/d*s;m.y+=dy/d*s;if(Math.abs(dx)>.5)m.dir=dx<0?-1:1;m.motion='move'}}
 }
 function sizeCanvas(c,dpr){const w=Math.round(c.clientWidth*dpr),h=Math.round(c.clientHeight*dpr);if(c.width!==w||c.height!==h){c.width=w;c.height=h}return[w,h]}
 function tone(v,sp){shader.setUniformf('u_hue',v==='color'?V().hue(sp.id)*Math.PI/180:0);shader.setUniformf('u_sat',v==='color'?1.18:v==='shiny'?1.12:1);shader.setUniformf('u_bri',v==='shiny'?1.08:1)}
 /* 遠景模式：把每個物種（含變異色）的待機／移動各烘焙 F 格小圖，之後用 2D drawImage 畫，上千隻也流暢 */
 const F=8,BAKE=1;
 function bake(sp,v){
  const glc=yard.querySelector('.yard-gl'),W=glc.width,H=glc.height,b=sp.bounds,pad=.2;
  let s=UNIT*BAKE*ELITE*Math.min(1.5,devicePixelRatio||1);
  let cw=Math.ceil(b.w*s*(1+pad*2))+2,ch=Math.ceil(b.h*s*(1+pad*2))+2;const fit=Math.min(1,W/(F*cw),H/(2*ch));
  if(fit<1){s*=fit;cw=Math.ceil(b.w*s*(1+pad*2))+2;ch=Math.ceil(b.h*s*(1+pad*2))+2}
  const g=ctx.gl,cam2=renderer.camera;g.viewport(0,0,W,H);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);
  cam2.position.x=W/2;cam2.position.y=H/2;cam2.viewportWidth=W;cam2.viewportHeight=H;
  renderer.begin();tone(v,sp);
  const sk=sp.bakeSk??=new spine.Skeleton(sp.data),ox=cw/2-(b.x+b.w/2)*s,padPx=b.h*s*pad,foot=padPx-b.y*s,durs=[];
  ['idle','move'].forEach((row,r)=>{
   const anim=sp.data.findAnimation(row==='idle'?idleName(sp.data):moveName(sp.data)),D=Math.max(.2,anim?.duration||1);durs.push(D);
   for(let k=0;k<F;k++){sk.setToSetupPose();anim?.apply(sk,0,k*D/F,true,null,1,spine.MixBlend.setup,spine.MixDirection.mixIn);sk.scaleX=s;sk.scaleY=s;sk.x=k*cw+ox;sk.y=H-(r+1)*ch+foot;sk.updateWorldTransform();renderer.drawSkeleton(sk,true)}
  });
  renderer.end();
  const sheet=document.createElement('canvas');sheet.width=F*cw;sheet.height=2*ch;sheet.getContext('2d').drawImage(glc,0,0,F*cw,2*ch,0,0,F*cw,2*ch);
  (sp.sheets??={})[v||'']={sheet,cw,ch,ox,fy:ch-foot,s,durs};
 }
 function draw(dt){
  const dpr=Math.min(2,devicePixelRatio||1),W=yard.clientWidth,H=yard.clientHeight;if(!W||!H)return;
  const vl=cam.x-W/2/cam.z-60,vr=cam.x+W/2/cam.z+60,vt=cam.y-H/2/cam.z-20,vb=cam.y+H/2/cam.z+160;
  const vis=mobs.filter(m=>m.x>vl&&m.x<vr&&m.y>vt&&m.y<vb).sort((a,b)=>a.y-b.y);
  const far=vis.length>60||cam.z<.75;
  const c=yard.querySelector('.yard-gl'),[w,h]=sizeCanvas(c,dpr),g=ctx.gl;
  if(far){let budget=5;for(const m of vis){if(m.sp?.state!=='ready'||m.sp.sheets?.[m.v||''])continue;if(budget--<=0)break;bake(m.sp,m.v)}}
  else{
   /* 近景：同組共用骨架每幀只推進一次 */
   for(const sp of species.values())if(sp.state==='ready')for(const set of [sp.idle,sp.move])for(const r of set)r.used=false;
   for(const m of vis)if(m.sp?.state==='ready')m.sp[m.motion][m.phase].used=true;
   for(const sp of species.values())if(sp.state==='ready')for(const set of [sp.idle,sp.move])for(const r of set){r.st.update(dt);if(r.used)r.st.apply(r.s)}
  }
  // 陰影、光環（遠景時連模型一起畫在這層）
  const [sw,sh]=sizeCanvas(shadow,dpr),s2=shadow.getContext('2d'),k=dpr*cam.z,ox=dpr*(W/2-cam.x*cam.z),oy=dpr*(H/2-cam.y*cam.z);
  s2.setTransform(1,0,0,1,0,0);s2.clearRect(0,0,sw,sh);s2.setTransform(k,0,0,k,ox,oy);
  for(const m of vis){const b=box(m),rw=Math.max(5,b.w*.34)*(1-m.lift/30);s2.fillStyle='rgba(0,0,0,.38)';s2.beginPath();s2.ellipse(m.x,m.y,rw,rw*.28,0,0,Math.PI*2);s2.fill();
   if(m.v){const hh=m.v==='color'?V().hue(m.i.species)+20:46,a=m.v==='shiny'?.32+.12*Math.sin(clock*3+m.seed):.28,gr=s2.createRadialGradient(m.x,m.y,0,m.x,m.y,rw*1.8);gr.addColorStop(0,'hsla('+hh+',95%,68%,'+a+')');gr.addColorStop(1,'hsla('+hh+',95%,68%,0)');s2.fillStyle=gr;s2.beginPath();s2.ellipse(m.x,m.y,rw*1.8,rw*.6,0,0,Math.PI*2);s2.fill()}}
  g.viewport(0,0,w,h);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);
  if(far){
   for(const m of vis){const sh2=m.sp?.sheets?.[m.v||''];if(!sh2)continue;const r=m.motion==='move'?1:0,D=sh2.durs[r],f=Math.floor(clock/D*F+m.seed*F)%F,a=k*m.s/sh2.s,flip=m.dir>0?-1:1;
    s2.setTransform(a*flip,0,0,a,ox+k*m.x,oy+k*(m.y-m.hop-m.lift));s2.drawImage(sh2.sheet,f*sh2.cw,r*sh2.ch,sh2.cw,sh2.ch,-sh2.ox,-sh2.fy,sh2.cw,sh2.ch)}
  }else{
   const camera=renderer.camera;camera.position.x=cam.x;camera.position.y=-cam.y;camera.viewportWidth=W/cam.z;camera.viewportHeight=H/cam.z;
   renderer.begin();let cur='';tone('',null);
   for(const m of vis){
    if(m.sp?.state!=='ready')continue;const sk=m.sp[m.motion][m.phase].s,want=m.v||'';
    if(want!==cur||want==='color'){renderer.batcher.flush();cur=want;tone(want,m.sp)}
    sk.x=m.x;sk.y=-(m.y-m.hop-m.lift);sk.scaleX=m.s*(m.dir>0?-1:1);sk.scaleY=m.s;sk.updateWorldTransform();renderer.drawSkeleton(sk,true);
   }
   renderer.end();
  }
  // 閃光星芒
  const [fw,fh]=sizeCanvas(fx,dpr),f2=fx.getContext('2d');f2.setTransform(1,0,0,1,0,0);f2.clearRect(0,0,fw,fh);f2.setTransform(k,0,0,k,ox,oy);
  for(const m of vis){if(m.v!=='shiny')continue;const b=box(m);for(let q=0;q<4;q++){const p=(clock*.55+m.seed+q*.25)%1,a=Math.sin(p*Math.PI),x=b.cx+Math.sin(m.seed*7+q*2.3)*b.w*.45,y=b.t+b.h*(.1+.75*((q*.37+m.seed)%1))-p*6,sz=(1.6+1.3*a)*Math.max(.6,b.w/30);star(f2,x,y,sz,a)}}
 }
 function star(c,x,y,s,a){c.save();c.globalAlpha=a;c.fillStyle='#fff6cf';c.shadowColor='rgba(255,210,90,.9)';c.shadowBlur=6;c.beginPath();c.moveTo(x,y-s);c.quadraticCurveTo(x,y,x+s,y);c.quadraticCurveTo(x,y,x,y+s);c.quadraticCurveTo(x,y,x-s,y);c.quadraticCurveTo(x,y,x,y-s);c.fill();c.restore()}
 /* ---------- 資料泡泡 ---------- */
 function show(m){focus=m;editing=false;bubble?.remove();bubble=document.createElement('div');bubble.className='yard-bubble';bubble.setAttribute('role','dialog');fill();yard.querySelector('.yard-layer').append(bubble);aim()}
 function fill(){
  const i=focus.i,u=FrontierCapture.units[i.species],v=variantOf(i);
  bubble.innerHTML=(editing?'<form class="yard-rename"><input maxlength="'+NAME_MAX+'" value="'+esc(i.nickname||'')+'" placeholder="'+esc(u.name)+'" aria-label="自訂名稱"><button type="submit">確定</button></form>':'<div class="yard-name"><b>'+esc(nameOf(i))+'</b><button class="yard-pen" data-yard-pen aria-label="自訂名稱"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></button></div>')+(i.nickname?'<small class="yard-species">'+esc(u.name+(V()?.suffix(v)||''))+'</small>':'')+'<dl><dt>收容時間</dt><dd>'+when(i.capturedAt)+'</dd><dt>收容難度</dt><dd>'+difficulty(i)+'</dd><dt>收容地區</dt><dd>'+esc(region(i))+'</dd></dl>';
  if(editing){const input=bubble.querySelector('input');input.focus();input.select()}
 }
 function aim(){const fw=yard.clientWidth,bw=bubble.offsetWidth,bh=bubble.offsetHeight,b=box(focus),top=toScreen(b.cx,b.t),foot=toScreen(b.cx,b.b);let x=top.x-bw/2,y=top.y-bh-10;x=Math.max(8,Math.min(fw-bw-8,x));const below=y<64;if(below)y=foot.y+10;bubble.style.transform='translate3d('+x+'px,'+y+'px,0)';bubble.style.setProperty('--tail',(top.x-x)+'px');bubble.classList.toggle('is-below',below)}
 function close(){bubble?.remove();bubble=null;focus=null;editing=false}
 function rename(value){
  const i=focus?.i;if(!i)return;const name=String(value||'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,NAME_MAX);
  const live=(db.capture?.instances||[]).find(x=>x.uid===i.uid);if(!live)return;
  if(name&&name!==FrontierCapture.units[live.species].name)live.nickname=name;else delete live.nickname;
  focus.i=live;save();editing=false;fill();aim();toast(name?'已命名為「'+name+'」':'已恢復原名');
 }
 /* ---------- 指標：短按查看、長按拖曳、空白處拖曳平移、雙指縮放、滾輪縮放 ---------- */
 function down(e){
  if(!yard?.isConnected||!e.target.closest?.('.yard')||e.target.closest('.yard-bubble,.yard-head,.yard-zoom'))return;
  e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){if(gesture?.timer)clearTimeout(gesture.timer);if(gesture?.type==='drag')gesture.m.hop=6;const [a,b]=[...pointers.values()];gesture={type:'pinch',d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.z};return}
  if(pointers.size>2)return;
  const w=toWorld(e.clientX,e.clientY),m=hit(w.x,w.y);
  gesture={type:'press',id:e.pointerId,x:e.clientX,y:e.clientY,m,cam:{...cam},moved:false};
  if(m)gesture.timer=setTimeout(()=>{if(gesture?.m!==m||gesture.moved)return;gesture.type='drag';gesture.off={x:m.x-w.x,y:m.y-w.y};if(bubble)close();navigator.vibrate?.(15)},HOLD_MS);
 }
 function move(e){
  if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!gesture)return;e.preventDefault();
  if(gesture.type==='pinch'&&pointers.size>=2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt(gesture.z*d/Math.max(1,gesture.d),(a.x+b.x)/2,(a.y+b.y)/2);return}
  if(e.pointerId!==gesture.id)return;
  if(gesture.type==='drag'){const m=gesture.m,w=toWorld(e.clientX,e.clientY);m.x=clamp(w.x+gesture.off.x,20,world.w-20);m.y=clamp(w.y+gesture.off.y,70,world.h-6);if(Math.abs(e.movementX||0)>1)m.dir=e.movementX<0?-1:1;return}
  if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8){gesture.moved=true;clearTimeout(gesture.timer);gesture.type='pan'}
  if(gesture.type==='pan'){cam.x=gesture.cam.x-(e.clientX-gesture.x)/cam.z;cam.y=gesture.cam.y-(e.clientY-gesture.y)/cam.z;clampCam()}
 }
 function up(e){
  if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);const g=gesture;if(!g)return;
  if(g.type==='pinch'){if(pointers.size===0)gesture=null;else{const [id,p]=[...pointers.entries()][0];gesture={type:'pan',id,x:p.x,y:p.y,cam:{...cam},moved:true}}return}
  if(e.pointerId!==g.id)return;clearTimeout(g.timer);gesture=null;
  if(g.type==='drag'){const m=g.m;m.hop=8;m.mode='idle';m.wait=rnd(1,3);m.tx=m.x;m.ty=m.y;return}
  if(g.type!=='press'||e.type==='pointercancel')return;
  if(!g.m){if(bubble)close();return}
  if(focus===g.m){close();return}
  g.m.hop=6;show(g.m);
 }
 document.addEventListener('pointerdown',down,{passive:false});
 document.addEventListener('pointermove',move,{passive:false});
 document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);
 document.addEventListener('wheel',e=>{if(!yard?.isConnected||!e.target.closest?.('.yard'))return;e.preventDefault();zoomAt(cam.z*Math.exp(-e.deltaY*.0015),e.clientX,e.clientY)},{passive:false});
 document.addEventListener('contextmenu',e=>{if(e.target.closest?.('.yard'))e.preventDefault()});
 document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-home20-yard]')){FrontierRuntime.view(()=>go('yard'));return}
  if(e.target.closest?.('[data-yard-back]')){go('home');return}
  const z=e.target.closest?.('[data-yard-zoom]');if(z){zoomAt(cam.z*(z.dataset.yardZoom==='1'?1.4:1/1.4));return}
  if(e.target.closest?.('[data-yard-pen]')&&focus){editing=true;fill();aim()}
 });
 document.addEventListener('submit',e=>{if(!e.target.closest?.('.yard-rename'))return;e.preventDefault();rename(e.target.querySelector('input').value)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&bubble){if(editing){editing=false;fill();aim()}else close()}});
 const prior=render;render=function(){
  document.body.classList.toggle('yard-mode',page==='yard');
  if(page==='yard'){if(yard?.isConnected){nav();return}nav();$('#app').innerHTML=view();mount();return}
  if(yard){stop();yard=null}prior();
 };
 return{perf,view,mount,purge,mobs:()=>mobs,cam:()=>({...cam,minZoom,world}),zoomAt,species:()=>species,rename:(uid,name)=>{const m=mobs.find(x=>x.i.uid===uid);if(m){focus=m;return rename(name)}}};
})();
