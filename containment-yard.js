'use strict';
/* 收容管理場：所有已收容個體以 Spine 模型在同一張 WebGL 畫布上自由走動。
   同物種共用骨架（各動作 2 組相位），可容納上千隻；支援縮放／平移、點擊資料、改名、長按拖曳。 */
window.FrontierContainmentYard=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const BASE='assets/enemy-spine/',UNIT=.12,ELITE=1.15,HOLD_MS=360,NAME_MAX=12,PHASES=2,MAX_ZOOM=3;
 /* 收容區畫面（標題列下方），與上方按鈕分開不重疊 */let stage=null,srcArr=null,mobs=[],raf=0,last=0,yard=null,gl=null,fx=null,shadow=null,bubble=null,focus=null,editing=false,cam={x:0,y:0,z:1},world={w:400,h:700},minZoom=.5;
 const feedUi={open:false,selected:null,busy:false},foodNodes=new Map(),foodPoints=new Map(),arrivals=new Map(),claims=new Set(),emptyFoods=[];let foodSource=null,foodRetry=0,mountEpoch=0;
 const affinityIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="6" cy="7" rx="2" ry="3"/><ellipse cx="12" cy="5" rx="2" ry="3"/><ellipse cx="18" cy="7" rx="2" ry="3"/><path d="M5 17c0-3 4-7 7-7s7 4 7 7c0 5-4 2-7 2s-7 3-7-2z"/></svg>';
 const feedToolIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 12h18l-2 7H5zM2 12h20M8 8l1-3m4 3 1-4m3 4 1-2"/></svg>';
 const thrown=new Map();let throwGesture=null,feedClickUntil=0;
 const fallbackImages=new Map();
 const species=new Map(),pointers=new Map(),perf={ms:0,n:0};
 /* 篩選：一區 普通／菁英，二區 普通／閃光／色違，三區 已命名／喜愛（勾了才限制，符合任一即可） */
 const filt={common:true,elite:true,normal:true,shiny:true,color:true,named:false,fav:false};
 function shown(m){const el=(FrontierCapture.units[m.i.species]?.rarity||1)>=3;if(el?!filt.elite:!filt.common)return false;if(!filt[m.v||'normal'])return false;if(filt.named||filt.fav)return(filt.named&&!!m.i.nickname)||(filt.fav&&!!m.i.favorite);return true}
 const FILTER_GROUPS=[['類型',[['common','普通敵人'],['elite','菁英敵人']]],['型態',[['normal','普通'],['shiny','閃光'],['color','色違']]],['標記',[['named','已自定名字'],['fav','已加愛心']]]];
 function filterHtml(){return '<div class="yard-filter-panel" hidden>'+FILTER_GROUPS.map(([t,items])=>'<fieldset><legend>'+t+'</legend>'+items.map(([k,l])=>'<label><input type="checkbox" data-yard-filter="'+k+'"'+(filt[k]?' checked':'')+'><span>'+l+'</span></label>').join('')+'</fieldset>').join('')+'<p class="yard-filter-note">標記區不勾＝不限制</p></div>'}
 function updateCount(){const el=yard?.querySelector('.yard-count');if(!el)return;const n=mobs.length,s=mobs.filter(shown).length;el.textContent=s===n?'收容個體 '+n:'顯示 '+s+' / '+n;yard.querySelector('[data-yard-filter-open]')?.classList.toggle('is-on',s!==n)}let gesture=null,assets=null,ctx=null,renderer=null,shader=null,clock=0;
 const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const V=()=>window.FrontierVariants;
 const variantOf=i=>V()?.of(i)||null;
 const instances=()=>(db.capture?.instances||[]).filter(i=>FrontierCapture.units[i.species]?.kind==='enemy');
 const nameOf=i=>(i.nickname||FrontierCapture.units[i.species].name)+(V()?.suffix(variantOf(i))||'');
 /* 缺少模型仍保留收容資料，以官方靜態圖暫代，禁止因素材缺失刪除個體。 */
 function purge(){return 0}
 function difficulty(i){
  const u=FrontierCapture.units[i.species],r=u.rarity||1,v=variantOf(i);
  const [label,cls]=u.boss?['極高','x']:r>=3?['高','h']:r===2?['中','m']:['低','l'];
  return '<span class="yard-diff yard-diff-'+cls+'">'+label+' '+'★'.repeat(Math.min(6,Math.max(1,r)))+'</span>'+(v?'<span class="yard-diff yard-diff-'+v+'">'+V().label(v)+'</span>':'')+(i.mutation?'<span class="yard-diff yard-diff-x">變異</span>':'');
 }
 function when(t){if(!Number.isFinite(t))return '未知';const d=new Date(t),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'/'+p(d.getMonth()+1)+'/'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())}
 function region(i){const id=i.origin?.region;return FrontierExpedition.regions.find(r=>r.id===id)?.name||'舊收容檔案'}
 function view(){
  const n=instances().length;
  return '<section class="yard" aria-label="收容管理場"><div class="yard-stage"><canvas class="yard-shadows" aria-hidden="true"></canvas><canvas class="yard-gl" aria-hidden="true"></canvas><canvas class="yard-fx" aria-hidden="true"></canvas><div class="yard-food-layer" aria-label="地面飼料"></div><div class="yard-layer"></div></div><div class="yard-head"><button class="yard-back" data-yard-back aria-label="返回主頁"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><button class="yard-back yard-filter-btn" data-yard-filter-open aria-label="篩選" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/></svg></button>'+filterHtml()+'<div class="yard-title"><small>CONTAINMENT YARD</small><b>收容管理場</b></div><span class="yard-count">收容個體 '+n+'</span></div>'+(n?'<p class="yard-hint">點擊查看 · 長按拖曳 · 左右滑動 · 雙指縮放</p>':'<p class="yard-empty">尚無收容個體。<br>於遠征中削弱敵人並使用收容裝置，成功撤離後會在這裡出現。</p>')+feedToolbar()+'</section>';
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
 function resolveId(id){const I=window.FrontierEnemySpineIndex||{};for(const key of [id,FrontierCapture.units[id]?.image]){if(!key)continue;if(I[key])return key;const b=String(key).replace(/_\d+$/,'');if(I[b])return b}return null}
 function speciesOf(id){
  const sid=resolveId(id);if(!sid)return null;let sp=species.get(sid);
  if(!sp){sp={id:sid,state:'loading'};species.set(sid,sp);assets.loadBinary(sid+'/'+sid+'.skel');assets.loadTextureAtlas(sid+'/'+sid+'.atlas')}
  return sp;
 }
 const animNames=d=>d.animations.map(a=>a.name);
 function idleName(d){const n=animNames(d);return n.find(x=>/^idle$/i.test(x))||n.find(x=>/^(a_)?idle(_a)?$/i.test(x))||n.find(x=>/idle/i.test(x)&&!/die|_b/i.test(x))||n.find(x=>/default/i.test(x))||n[0]}
 function moveName(d){const n=animNames(d);return n.find(x=>/^move_loop$/i.test(x))||n.find(x=>/^move$/i.test(x))||n.find(x=>/^run_loop$/i.test(x))||n.find(x=>/^(a_)?move(_a)?$/i.test(x))||n.find(x=>/move|walk|run|fly|riding/i.test(x)&&!/begin|start|end|die/i.test(x))||idleName(d)}
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
 /* 十個分區 A～J 橫向排列。由 A 開始填，每區先放滿 15～30 隻（數量多時每區平均分擔）才往下一區，避免散布到後段 */
 const ZONES=10;
 function layoutWorld(n){
  const r=stage.getBoundingClientRect(),caps=[];let left=n;
  for(let z=0;z<ZONES&&left>0;z++){const cap=z===ZONES-1?left:Math.max(15+Math.floor(Math.random()*16),Math.ceil(n/ZONES));caps.push(Math.min(cap,left));left-=caps[z]}
  const peak=Math.max(30,...caps),s=clamp(Math.sqrt(peak/60),1,1.6),zw=Math.round(r.width*s);
  world={w:zw*ZONES,h:Math.round(r.height*s),f:s,zw,caps,used:Math.max(1,caps.length)};
  /* 最多縮到剛好看見一區的上下高度，其他分區用左右滑動查看 */minZoom=Math.min(1,r.height/world.h);
 }
 function spread(n){
  const m=30,pts=[],h=world.h-m-40;
  world.caps.forEach((cap,z)=>{
   const x0=z*world.zw+m,w=world.zw-m*2,cols=Math.max(1,Math.round(Math.sqrt(cap*w/h))),rows=Math.max(1,Math.ceil(cap/cols)),cells=[];
   for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push([c,r]);
   for(let k=cells.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[cells[k],cells[j]]=[cells[j],cells[k]]}
   for(const [c,r] of cells.slice(0,cap))pts.push({x:x0+(c+rnd(.15,.85))*w/cols,y:40+(r+rnd(.2,.95))*h/rows,zone:z});
  });
  return pts;
 }
 const zoneOf=x=>clamp(Math.floor(x/world.zw),0,ZONES-1); function mount(){
  stop();const epoch=mountEpoch;yard=document.querySelector('.yard');if(!yard)return;
  const navTop=document.querySelector('#nav')?.getBoundingClientRect().top;if(navTop>0&&navTop<innerHeight)yard.style.bottom=(innerHeight-navTop)+'px';
  const removed=purge();if(removed){yard.querySelector('.yard-count').textContent='收容個體 '+instances().length;toast('已移除 '+removed+' 隻沒有模型的收容個體。')}
  stage=yard.querySelector('.yard-stage');fx=yard.querySelector('.yard-fx');shadow=yard.querySelector('.yard-shadows');
  const list=instances();layoutWorld(list.length);const pts=spread(list.length);cam={x:0,y:world.h/2,z:1,vx:0,vy:0};clampCam();
  mobs=list.map((i,k)=>{const u=FrontierCapture.units[i.species];return{i,v:variantOf(i),sp:null,phase:k%PHASES,zone:pts[k].zone,x:pts[k].x,y:pts[k].y,tx:pts[k].x,ty:pts[k].y,dir:Math.random()<.5?-1:1,mode:'idle',wait:rnd(.2,4),speed:rnd(9,16)*(u.rarity>=3?.9:1),s:UNIT*(u.rarity>=3?ELITE:1)*(i.mutation?1.05:1),hop:0,lift:0,motion:'idle',seed:Math.random()*10}});
  updateCount();updateFeedToolbar();syncFood();loadRuntime().then(ok=>{if(!ok||epoch!==mountEpoch||!yard?.isConnected)return;if(!setupGL()){toast('此裝置不支援 WebGL，無法顯示模型。');return}for(const m of mobs)m.sp=speciesOf(m.i.species);last=0;raf=requestAnimationFrame(tick)});
 }
 function stop(){mountEpoch++;if(raf)cancelAnimationFrame(raf);raf=0;mobs=[];cancelFeedThrow();for(const flight of thrown.values()){flight.node.remove();flight.shadow.remove()}thrown.clear();foodNodes.clear();foodPoints.clear();arrivals.clear();foodSource=null;feedUi.open=false;feedUi.selected=null;focus=null;bubble=null;editing=false;gesture=null;pointers.clear();try{ctx?.gl.getExtension('WEBGL_lose_context')?.loseContext()}catch{}ctx=null;renderer=null;assets=null;species.clear()}
 function clampCam(){
  const vw=stage.clientWidth/cam.z,vh=stage.clientHeight/cam.z;
  cam.x=vw>=world.w?world.w/2:clamp(cam.x,vw/2,world.w-vw/2);cam.y=vh>=world.h?world.h/2:clamp(cam.y,vh/2,world.h-vh/2);
 }
 const toWorld=(cx,cy)=>{const r=stage.getBoundingClientRect();return{x:cam.x+(cx-r.left-r.width/2)/cam.z,y:cam.y+(cy-r.top-r.height/2)/cam.z}};
 const toScreen=(x,y)=>({x:(x-cam.x)*cam.z+stage.clientWidth/2,y:(y-cam.y)*cam.z+stage.clientHeight/2});
 function zoomAt(z,sx,sy){const r=stage.getBoundingClientRect();sx??=r.left+r.width/2;sy??=r.top+r.height/2;const before=toWorld(sx,sy);cam.z=clamp(z,minZoom,MAX_ZOOM);const after=toWorld(sx,sy);cam.x+=before.x-after.x;cam.y+=before.y-after.y;clampCam()}
 /* 個體外框（世界座標）：腳底為 (x,y) */
 function box(m){const b=m.sp?.state==='ready'?m.sp.bounds:{x:-80,y:0,w:160,h:200},w=b.w*m.s,h=(b.y+b.h)*m.s,cx=m.x+(b.x+b.w/2)*m.s*(m.dir>0?-1:1);return{l:cx-w/2,r:cx+w/2,t:m.y-h-m.hop-m.lift,b:m.y+4,cx,w,h}}
 function hit(wx,wy){let best=null;for(const m of mobs){if(!shown(m))continue;const b=box(m);if(wx>=b.l&&wx<=b.r&&wy>=b.t&&wy<=b.b&&(!best||m.y>best.y))best=m}return best}
 /* ---------- 主迴圈 ---------- */
 function tick(t){
  raf=0;if(!yard?.isConnected||!renderer){stop();return}
  const dt=last?Math.min(.1,(t-last)/1000):0;last=t;clock+=dt;
  for(const sp of species.values())prepare(sp);
  /* 存檔物件可能被重新載入替換；以 uid 重新連結，名牌／愛心／篩選才會跟上 */
  if(db.capture?.instances!==srcArr){srcArr=db.capture?.instances;const map=new Map((srcArr||[]).map(i=>[i.uid,i]));for(const m of mobs){const i=map.get(m.i.uid);if(i){m.i=i;m.v=variantOf(i)}}updateCount()}
  syncFood();arrivals.clear();
  for(const m of mobs)step(m,dt);
  claimFood();
  if(!gesture&&(Math.abs(cam.vx)>5||Math.abs(cam.vy)>5)){cam.x-=cam.vx*dt/cam.z;cam.y-=cam.vy*dt/cam.z;const k=Math.exp(-dt*4);cam.vx*=k;cam.vy*=k;const bx=cam.x,by=cam.y;clampCam();if(cam.x!==bx)cam.vx=0;if(cam.y!==by)cam.vy=0}
  animateThrows(t);positionFood();const t0=performance.now();draw(dt);perf.ms=perf.ms*.9+(performance.now()-t0)*.1;perf.n++;if(bubble&&focus)aim();
  raf=requestAnimationFrame(tick);
 }
 function step(m,dt){
  if(m.hop>0)m.hop=Math.max(0,m.hop-dt*50);
  const held=gesture?.type==='drag'&&gesture.m===m;m.lift+=((held?10:0)-m.lift)*Math.min(1,dt*14);
  if(held){m.foodArrival=null;m.motion='idle';return}
  const food=nearestFood(m);
  if(food){const p=foodPoint(food),dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy),travel=Math.min(d,m.speed*3.8*dt);m.food=food.id;if(d>5){m.x+=dx/d*travel;m.y+=dy/d*travel;if(Math.abs(dx)>.5)m.dir=dx<0?-1:1;m.motion='move'}else m.motion='idle';const remaining=Math.max(0,d-travel);if(remaining<=6){if(m.foodArrival?.id!==food.id)m.foodArrival={id:food.id,at:clock-dt+Math.max(0,d-6)/(m.speed*3.8)};const prior=arrivals.get(food.id);if(!prior||m.foodArrival.at<prior.at||m.foodArrival.at===prior.at&&m.i.uid<prior.m.i.uid)arrivals.set(food.id,{m,at:m.foodArrival.at})}else m.foodArrival=null;return}
  if(m.food){m.mode='idle';m.wait=.45;m.tx=m.x;m.ty=m.y}m.food=null;m.foodArrival=null;
  if(focus===m){m.motion='idle';return}
  if(m.mode==='idle'){m.motion='idle';m.wait-=dt;if(m.wait<=0){const far=Math.random()<.25,r=far?rnd(90,200):rnd(25,90),a=rnd(0,Math.PI*2);m.tx=clamp(m.x+Math.cos(a)*r,m.zone*world.zw+24,(m.zone+1)*world.zw-24);m.ty=clamp(m.y+Math.sin(a)*r*.6,50,world.h-10);m.mode='walk'}}
  else{const dx=m.tx-m.x,dy=m.ty-m.y,d=Math.hypot(dx,dy);if(d<1.5){m.mode='idle';m.wait=rnd(1.5,7)}else{const s=Math.min(d,m.speed*dt);m.x+=dx/d*s;m.y+=dy/d*s;if(Math.abs(dx)>.5)m.dir=dx<0?-1:1;m.motion='move'}}
 }
 function sizeCanvas(c,dpr){const w=Math.round(c.clientWidth*dpr),h=Math.round(c.clientHeight*dpr);if(c.width!==w||c.height!==h){c.width=w;c.height=h}return[w,h]}
 function tone(v,sp){shader.setUniformf('u_hue',v==='color'?V().hue(sp.id)*Math.PI/180:0);shader.setUniformf('u_sat',v==='color'?1.18:v==='shiny'?1.12:1);shader.setUniformf('u_bri',v==='shiny'?1.08:1)}
 /* 遠景模式：把每個物種（含變異色）的待機／移動各烘焙 F 格小圖，之後用 2D drawImage 畫，上千隻也流暢 */
 const F=16,COLS=8,BAKE=1;
 function bake(sp,v){
  const glc=yard.querySelector('.yard-gl'),W=glc.width,H=glc.height,b=sp.bounds,key=v||'';
  let job=sp.sheets?.[key];
  if(!job){
   let scale=UNIT*BAKE*ELITE*Math.min(1.5,devicePixelRatio||1),cw=Math.ceil(b.w*scale*1.4)+2,ch=Math.ceil(b.h*scale*1.4)+2;
   const fit=Math.min(1,W/(COLS*cw),H/(4*ch));if(fit<1){scale*=fit;cw=Math.ceil(b.w*scale*1.4)+2;ch=Math.ceil(b.h*scale*1.4)+2}
   const sheet=document.createElement('canvas');sheet.width=COLS*cw;sheet.height=4*ch;
   const animations=[sp.data.findAnimation(idleName(sp.data)),sp.data.findAnimation(moveName(sp.data))],foot=b.h*scale*.2-b.y*scale;
   job={sheet,cw,ch,ox:cw/2-(b.x+b.w/2)*scale,fy:ch-foot,foot,s:scale,durs:animations.map(a=>Math.max(.2,a?.duration||1)),animations,frames:F,cols:COLS,rows:2,validFrames:0};
   (sp.sheets??={})[key]=job;
  }
  if(job.validFrames>=F)return;
  const frame=job.validFrames,g=ctx.gl,camera=renderer.camera;
  g.viewport(0,0,W,H);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);
  camera.position.x=W/2;camera.position.y=H/2;camera.viewportWidth=W;camera.viewportHeight=H;
  renderer.begin();tone(v,sp);const sk=sp.bakeSk??=new spine.Skeleton(sp.data);
  for(let row=0;row<2;row++){sk.setToSetupPose();job.animations[row]?.apply(sk,0,frame*job.durs[row]/F,true,null,1,spine.MixBlend.setup,spine.MixDirection.mixIn);sk.scaleX=job.s;sk.scaleY=job.s;sk.x=job.ox;sk.y=H-(row+1)*job.ch+job.foot;sk.updateWorldTransform();renderer.drawSkeleton(sk,true)}
  renderer.end();
  const target=job.sheet.getContext('2d');
  for(let row=0;row<2;row++)target.drawImage(glc,0,row*job.ch,job.cw,job.ch,frame%COLS*job.cw,(row*2+Math.floor(frame/COLS))*job.ch,job.cw,job.ch);
  job.validFrames++;
 }
 function draw(dt){
  const dpr=Math.min(2,devicePixelRatio||1),W=stage.clientWidth,H=stage.clientHeight;if(!W||!H)return;
  const vl=cam.x-W/2/cam.z-60,vr=cam.x+W/2/cam.z+60,vt=cam.y-H/2/cam.z-20,vb=cam.y+H/2/cam.z+160;
  const vis=mobs.filter(m=>shown(m)&&m.x>vl&&m.x<vr&&m.y>vt&&m.y<vb).sort((a,b)=>a.y-b.y);
  const far=vis.length>60||cam.z<.75;
  const c=yard.querySelector('.yard-gl'),[w,h]=sizeCanvas(c,dpr),g=ctx.gl;
  if(far){
   const pending=new Map();let fresh=false;
   for(const m of vis){if(m.sp?.state!=='ready')continue;const key=m.v||'';if(!m.sp.sheets?.[key]){bake(m.sp,m.v);fresh=true}if(m.sp.sheets[key].validFrames<F)pending.set(m.sp.id+':'+key,m)}
   if(!fresh){const jobs=[...pending.values()].sort((a,b)=>a.sp.sheets[a.v||''].validFrames-b.sp.sheets[b.v||''].validFrames);for(const m of jobs.slice(0,2))bake(m.sp,m.v)}
  }
  else{
   // Only animate rigs actually visible; off-screen species need no pose work.
   const activeRigs=new Set();for(const m of vis)if(m.sp?.state==='ready')activeRigs.add(m.sp[m.motion][m.phase]);
   for(const r of activeRigs){r.st.update(dt);r.st.apply(r.s)}
  }
  // 陰影、光環（遠景時連模型一起畫在這層）
  const [sw,sh]=sizeCanvas(shadow,dpr),s2=shadow.getContext('2d'),k=dpr*cam.z,ox=dpr*(W/2-cam.x*cam.z),oy=dpr*(H/2-cam.y*cam.z);
  s2.setTransform(1,0,0,1,0,0);s2.clearRect(0,0,sw,sh);s2.setTransform(k,0,0,k,ox,oy);floor(s2);
  for(const m of vis){const b=box(m),rw=Math.max(5,b.w*.34)*(1-m.lift/30);s2.fillStyle='rgba(0,0,0,.38)';s2.beginPath();s2.ellipse(m.x,m.y,rw,rw*.28,0,0,Math.PI*2);s2.fill();
   if(m.v){const hh=m.v==='color'?V().hue(m.i.species)+20:46,a=m.v==='shiny'?.32+.12*Math.sin(clock*3+m.seed):.28,gr=s2.createRadialGradient(m.x,m.y,0,m.x,m.y,rw*1.8);gr.addColorStop(0,'hsla('+hh+',95%,68%,'+a+')');gr.addColorStop(1,'hsla('+hh+',95%,68%,0)');s2.fillStyle=gr;s2.beginPath();s2.ellipse(m.x,m.y,rw*1.8,rw*.6,0,0,Math.PI*2);s2.fill()}}
  g.viewport(0,0,w,h);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);
  if(far){
   for(const m of vis){const sh2=m.sp?.sheets?.[m.v||''];if(!sh2)continue;const r=m.motion==='move'?1:0,D=sh2.durs[r],f=Math.floor(clock/D*sh2.validFrames+m.seed*sh2.validFrames)%sh2.validFrames,a=k*m.s/sh2.s,flip=m.dir>0?-1:1;
    s2.setTransform(a*flip,0,0,a,ox+k*m.x,oy+k*(m.y-m.hop-m.lift));s2.drawImage(sh2.sheet,f%sh2.cols*sh2.cw,(r*sh2.rows+Math.floor(f/sh2.cols))*sh2.ch,sh2.cw,sh2.ch,-sh2.ox,-sh2.fy,sh2.cw,sh2.ch)}
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
  for(const m of vis)if(m.sp?.state!=='ready'){const id=FrontierCapture.units[m.i.species]?.image;let img=fallbackImages.get(id);if(!img){img=new Image();img.src='assets/'+id+'.png';img.onerror=()=>{if(!img.dataset?.fallback){img.onerror=null;img.src='assets/rhodes-logo.png'}};fallbackImages.set(id,img)}if(img.complete&&img.naturalWidth){const b=box(m),w=Math.max(26,b.w),h=w*img.naturalHeight/img.naturalWidth;f2.drawImage(img,m.x-w/2,m.y-h,w,h)}}
  for(const m of vis){if(m.v!=='shiny')continue;const b=box(m);for(let q=0;q<4;q++){const p=(clock*.55+m.seed+q*.25)%1,a=Math.sin(p*Math.PI),x=b.cx+Math.sin(m.seed*7+q*2.3)*b.w*.45,y=b.t+b.h*(.1+.75*((q*.37+m.seed)%1))-p*6,sz=(1.6+1.3*a)*Math.max(.6,b.w/30);star(f2,x,y,sz,a)}}
  /* 已命名個體常駐名牌（固定字級，不隨縮放） */
  f2.setTransform(dpr,0,0,dpr,0,0);
  for(const m of vis){if((!m.i.nickname&&!m.i.unread143)||focus===m)continue;const b=box(m),p=toScreen(b.cx,b.t);if(p.x<-90||p.x>W+90||p.y<-20||p.y>H+30)continue;tag(f2,p.x,p.y-9,m)}
 }
 /* 收容設施地板：金屬地磚圖樣＋分區標線＋邊界警示帶，全部在世界座標，會跟著滑動 */
 let tile=null;
 function makeTile(){const t=document.createElement('canvas'),S=160;t.width=t.height=S;const c=t.getContext('2d');
  c.fillStyle='#141d23';c.fillRect(0,0,S,S);
  for(const [x,y] of [[0,0],[80,0],[0,80],[80,80]]){const g=c.createLinearGradient(x,y,x+80,y+80);g.addColorStop(0,'#1a252c');g.addColorStop(1,'#121a1f');c.fillStyle=g;c.fillRect(x+2,y+2,76,76);c.fillStyle='rgba(140,180,200,.06)';c.fillRect(x+2,y+2,76,1)}
  c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,79,S,2);c.fillRect(79,0,2,S);c.fillRect(0,0,S,1);c.fillRect(0,0,1,S);
  c.fillStyle='rgba(150,190,210,.18)';for(const [x,y] of [[6,6],[74,6],[6,74],[74,74],[86,6],[154,6],[86,74],[154,74],[6,86],[74,86],[6,154],[74,154],[86,86],[154,86],[86,154],[154,154]]){c.beginPath();c.arc(x,y,1.4,0,7);c.fill()}
  return t}
 function floor(c){
  tile??=makeTile();const W=world.w,H=world.h;
  c.fillStyle=c.createPattern(tile,'repeat');c.fillRect(0,0,W,H);
  /* 分區：每個螢幕寬一區，畫地面標線與區號 */
  const zw=world.zw;let n=0;
  for(let x=0;x<W-1;x+=zw){c.strokeStyle='rgba(242,194,48,.22)';c.lineWidth=3;c.setLineDash([18,12]);if(x>0){c.beginPath();c.moveTo(x,70);c.lineTo(x,H-10);c.stroke()}c.setLineDash([]);
   c.save();c.globalAlpha=.07;c.fillStyle='#bfe3f2';c.font='900 '+Math.round(zw*.38)+'px system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String.fromCharCode(65+n%26),x+zw/2,H/2);c.restore();
   c.strokeStyle='rgba(127,164,182,.14)';c.lineWidth=2;c.beginPath();c.ellipse(x+zw/2,H*.62,zw*.32,zw*.12,0,0,7);c.stroke();n++}
  /* 邊界警示帶 */
  c.save();c.beginPath();c.rect(0,0,W,H);c.rect(10,10,W-20,H-20);c.clip('evenodd');for(let i=-H;i<W+H;i+=28){c.fillStyle=(i/28)%2?'#f2c230':'#16130a';c.beginPath();c.moveTo(i,0);c.lineTo(i+14,0);c.lineTo(i+14-H,H);c.lineTo(i-H,H);c.fill()}c.restore();
  c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=2;c.strokeRect(10,10,W-20,H-20);
 }
 function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath()}
 function tag(c,x,y,m){
  const name=(m.i.unread143?'新  ':'')+(m.i.favorite?'♥ ':'')+(m.i.nickname||''),v=m.v,lab=v?V().label(v):'';
  c.font='600 11px system-ui,sans-serif';const nw=c.measureText(name).width;c.font='700 9px system-ui,sans-serif';const lw=lab?c.measureText(lab).width+8:0;
  const w=nw+12+(lab?lw+4:0),h=18,x0=Math.round(x-w/2),y0=Math.round(y-h);
  c.fillStyle='rgba(10,15,19,.82)';rr(c,x0,y0,w,h,3);c.fill();c.strokeStyle=v==='shiny'?'rgba(255,215,106,.8)':v==='color'?'rgba(213,155,255,.8)':'rgba(127,164,182,.6)';c.lineWidth=1;c.stroke();
  c.textBaseline='middle';c.font='600 11px system-ui,sans-serif';c.fillStyle='#fff';c.fillText(name,x0+6,y0+h/2+.5);
  if(m.i.unread143){c.fillStyle='#e8ec98';c.fillText('新',x0+6,y0+h/2+.5)}
  if(m.i.favorite){c.fillStyle='#ff6f91';c.fillText('♥',x0+6+(m.i.unread143?c.measureText('新  ').width:0),y0+h/2+.5)}
  if(lab){const lx=x0+6+nw+4;c.fillStyle=v==='shiny'?'#ffd76a':'#d59bff';rr(c,lx,y0+3,lw,h-6,2);c.fill();c.fillStyle='#14181c';c.font='700 9px system-ui,sans-serif';c.fillText(lab,lx+4,y0+h/2+.5)}
 }
 function star(c,x,y,s,a){c.save();c.globalAlpha=a;c.fillStyle='#fff6cf';c.shadowColor='rgba(255,210,90,.9)';c.shadowBlur=6;c.beginPath();c.moveTo(x,y-s);c.quadraticCurveTo(x,y,x+s,y);c.quadraticCurveTo(x,y,x,y+s);c.quadraticCurveTo(x,y,x-s,y);c.quadraticCurveTo(x,y,x,y-s);c.fill();c.restore()}
 /* ---------- 資料泡泡 ---------- */
 function show(m){if(m.i.unread143){FrontierRuntime.perform("yard143-read",()=>{const i=db.capture?.instances.find(x=>x.uid===m.i.uid);if(i){i.unread143=false;save();window.FrontierNewCaptures143?.refresh()}return true})}focus=m;editing=false;bubble?.remove();bubble=document.createElement('div');bubble.className='yard-bubble';bubble.setAttribute('role','dialog');fill();yard.querySelector('.yard-layer').append(bubble);aim()}
 function fill(){
  const i=focus.i,u=FrontierCapture.units[i.species],v=variantOf(i);
  bubble.innerHTML=(editing?'<form class="yard-rename"><input maxlength="'+NAME_MAX+'" value="'+esc(i.nickname||'')+'" placeholder="'+esc(u.name)+'" aria-label="自訂名稱"><button type="submit">確定</button></form>':'<div class="yard-name"><button class="yard-heart'+(i.favorite?' is-on':'')+'" data-yard-heart aria-pressed="'+!!i.favorite+'" aria-label="喜愛"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-9-9.2C2 7.4 4.3 4.5 7.4 4.5c2 0 3.6 1.1 4.6 2.7 1-1.6 2.6-2.7 4.6-2.7 3.1 0 5.4 2.9 4.4 6.3-1.5 4.6-9 9.2-9 9.2z"/></svg></button><b>'+esc(nameOf(i))+'</b><button class="yard-pen" data-yard-pen aria-label="自訂名稱"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></button></div>')+(i.nickname?'<small class="yard-species">'+esc(u.name+(V()?.suffix(v)||''))+'</small>':'')+'<dl><dt>收容時間</dt><dd>'+when(i.capturedAt)+'</dd><dt>收容難度</dt><dd>'+difficulty(i)+'</dd><dt>收容地區</dt><dd>'+esc(region(i))+'</dd></dl><div class="yard-affinity" aria-label="好感度 '+FrontierBaseEngine.affinityOf(i)+'" title="好感度">'+affinityIcon+'<b>'+FrontierBaseEngine.affinityOf(i)+'</b></div>';
  if(editing){const input=bubble.querySelector('input');input.focus();input.select()}
 }
 function aim(){const fw=stage.clientWidth,bw=bubble.offsetWidth,bh=bubble.offsetHeight,b=box(focus),top=toScreen(b.cx,b.t),foot=toScreen(b.cx,b.b);let x=top.x-bw/2,y=top.y-bh-10;x=Math.max(8,Math.min(fw-bw-8,x));const below=y<8;if(below)y=foot.y+10;bubble.style.transform='translate3d('+x+'px,'+y+'px,0)';bubble.style.setProperty('--tail',(top.x-x)+'px');bubble.classList.toggle('is-below',below)}
 function close(){bubble?.remove();bubble=null;focus=null;editing=false}

 function feedToolbar(){return '<div class="yard-feed-tools"><button class="yard-feed-toggle" type="button" data-yard-feed-toggle aria-label="投餵" aria-expanded="false">'+feedToolIcon+'</button><div class="yard-feed-options" role="group" aria-label="選擇飼料" hidden></div><p class="yard-feed-help" role="status" hidden></p></div>'}
 function updateFeedToolbar(){
  if(!yard?.isConnected)return;
  const tools=yard.querySelector('.yard-feed-tools'),row=tools?.querySelector('.yard-feed-options');if(!row)return;
  const E=FrontierBaseEngine;if(feedUi.selected&&!E.feedStock(db,feedUi.selected))feedUi.selected=null;
  tools.classList.toggle('is-open',feedUi.open);tools.classList.toggle('is-busy',feedUi.busy);
  tools.querySelector('[data-yard-feed-toggle]').setAttribute('aria-expanded',String(feedUi.open));
  row.hidden=!feedUi.open;
  if(!throwGesture)row.innerHTML=E.feedTypes.map(d=>{const n=E.feedStock(db,d.id);return '<button type="button" data-yard-feed-pick="'+d.id+'" class="'+(feedUi.selected===d.id?'is-selected':'')+'" aria-pressed="'+(feedUi.selected===d.id)+'" aria-label="'+d.name+'，'+n+'份，好感增加'+d.affinity+'" '+(!n?'disabled':'')+'>'+E.feedIcon(d.id)+'<b>'+n+'</b></button>'}).join('');
  const hint=tools.querySelector('.yard-feed-help');hint.hidden=!feedUi.open;hint.textContent=feedUi.busy?'正在保存投餵':feedUi.selected?'點個體／空地 · 長按飼料拋出':'點選投餵 · 長按上滑拋出';
 }
 async function offerFeed(m,point){
  const type=feedUi.selected;if(!type||feedUi.busy||!FrontierBaseEngine.feedStock(db,type))return;
  feedUi.busy=true;updateFeedToolbar();
  try{
   const ok=await FrontierBase151.execute(m?'feedGive':'feedPlace',m?{uid:m.i.uid,feed:type}:{id:crypto.randomUUID(),feed:type,x:clamp(point.x/world.w,0,1),y:clamp(point.y/world.h,0,1)});
   if(ok){if(m){m.hop=9;flashAffinity(m,type)}syncFood();if(focus&&bubble){focus.i=db.capture.instances.find(i=>i.uid===focus.i.uid)||focus.i;fill();aim()}}
  }finally{feedUi.busy=false;updateFeedToolbar()}
 }
 const foodPoint=f=>{let p=foodPoints.get(f.id);if(!p||p.w!==world.w||p.h!==world.h){p={x:f.x*world.w,y:f.y*world.h,w:world.w,h:world.h};foodPoints.set(f.id,p)}return p};
 function syncFood(){
  const foods=db.capture?.yardFood||emptyFoods;
  if(foods===foodSource)return;
  foodSource=foods;const ids=new Set(foods.map(f=>f.id));
  for(const[id,node]of foodNodes)if(!ids.has(id)){node.remove();foodNodes.delete(id);foodPoints.delete(id)}
  const layer=yard?.querySelector('.yard-food-layer');if(!layer)return;
  for(const food of foods)if(!foodNodes.has(food.id)){const node=document.createElement('div');node.className='yard-ground-feed';node.hidden=true;node.dataset.yardFood=food.id;node.setAttribute('role','img');node.setAttribute('aria-label',(FrontierBaseEngine.feedTypes.find(d=>d.id===food.type)?.name||'飼料')+'，附近個體會靠近進食');node.innerHTML='<img src="assets/feed-'+food.type+'.png" alt="" draggable="false">';layer.append(node);foodNodes.set(food.id,node)}
 }
 function nearestFood(m){
  if(!shown(m))return null;const radius=clamp(world.zw*.65,140,260);let best=null,distance=Infinity;
  for(const food of db.capture?.yardFood||emptyFoods){if(thrown.has(food.id))continue;const p=foodPoint(food),d=Math.hypot(m.x-p.x,m.y-p.y);if(d<=radius&&d<distance){best=food;distance=d}}
  return best;
 }
 function positionFood(){for(const food of db.capture?.yardFood||emptyFoods){const p=foodPoint(food),screen=toScreen(p.x,p.y),node=foodNodes.get(food.id);if(node){node.style.transform='translate3d('+screen.x+'px,'+screen.y+'px,0) translate(-50%,-70%) scale('+clamp(cam.z,.65,1.5)+')';node.hidden=thrown.has(food.id)||screen.x<-40||screen.x>stage.clientWidth+40||screen.y<-40||screen.y>stage.clientHeight+40}}}
 function flashAffinity(m,type){
  const p=toScreen(m.x,m.y-24),node=document.createElement('span');node.className='yard-affinity-gain';node.innerHTML=affinityIcon+'+'+(FrontierBaseEngine.feedTypes.find(d=>d.id===type)?.affinity||0);node.style.left=clamp(p.x,24,stage.clientWidth-50)+'px';node.style.top=clamp(p.y,24,stage.clientHeight-60)+'px';yard.querySelector('.yard-layer').append(node);setTimeout(()=>node.remove(),1100);
 }
 function claimFood(){
  if(feedUi.busy||claims.size||FrontierRuntime.busy||performance.now()<foodRetry)return;
  for(const food of db.capture?.yardFood||emptyFoods){
   if(claims.has(food.id))continue;
   const winner=arrivals.get(food.id)?.m;if(!winner)continue;claims.add(food.id);const origin=yard;
   FrontierBase151.execute('feedEat',{food:food.id,uid:winner.i.uid}).then(ok=>{if(ok&&yard===origin&&yard?.isConnected){winner.hop=9;winner.zone=zoneOf(winner.x);winner.mode='idle';winner.wait=2;flashAffinity(winner,food.type);syncFood();if(focus===winner&&bubble){focus.i=db.capture.instances.find(i=>i.uid===winner.i.uid)||focus.i;fill();aim()}}else if(!ok)foodRetry=performance.now()+4000}).finally(()=>claims.delete(food.id));
   break;
  }
 }

 const THROW_DT=1/120;
 function throwPath(x,y,vx,vy,z,up,gravity){
  const points=[{t:0,x,y,z}];let vz=up,bounces=0,t=0;
  for(let step=0;step<180;step++){
   t+=THROW_DT;x+=vx*THROW_DT;y+=vy*THROW_DT;z+=vz*THROW_DT;vz-=gravity*THROW_DT;
   const drag=Math.exp(-1.8*THROW_DT);vx*=drag;vy*=drag;
   if(x<18||x>world.w-18){x=clamp(x,18,world.w-18);vx*=-.4}
   if(y<45||y>world.h-12){y=clamp(y,45,world.h-12);vy*=-.4}
   if(z<=0){z=0;if(!bounces&&Math.abs(vz)>50/cam.z){bounces++;vz=-vz*.16;vx*=.35;vy*=.35}else{points.push({t,x,y,z});break}}
   points.push({t,x,y,z});
  }
  const end=points[points.length-1];end.z=0;return{points,duration:end.t,x:end.x,y:end.y};
 }
 function cancelFeedThrow(){
  const g=throwGesture;if(!g)return;clearTimeout(g.timer);cancelAnimationFrame(g.frame);g.ghost?.remove();g.el.classList.remove('is-throwing');try{g.el.releasePointerCapture(g.pointer)}catch{}throwGesture=null;
 }
 function holdFeed(e){
  feedClickUntil=0;const el=e.target.closest?.('[data-yard-feed-pick]');if(!el||el.disabled||e.button>0||feedUi.busy||!yard?.isConnected||throwGesture)return;
  const g=throwGesture={el,pointer:e.pointerId,type:el.dataset.yardFeedPick,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,samples:[],armed:false};
  g.timer=setTimeout(()=>{
   if(throwGesture!==g||!el.isConnected)return;
   g.armed=true;g.armedAt=performance.now();g.samples=[{x:g.x,y:g.y,t:g.armedAt}];feedUi.selected=g.type;
   for(const b of yard.querySelectorAll('[data-yard-feed-pick]')){b.classList.toggle('is-selected',b===el);b.setAttribute('aria-pressed',String(b===el))}
   el.classList.add('is-throwing');g.ghost=document.createElement('div');g.ghost.className='yard-throw-held';g.ghost.innerHTML='<img src="assets/feed-'+g.type+'.png" alt="">';document.body.append(g.ghost);g.ghost.style.transform='translate3d('+g.x+'px,'+g.y+'px,0) translate(-50%,-130%)';
   yard.querySelector('.yard-feed-help').textContent='向上滑動，放開拋出';try{el.setPointerCapture(e.pointerId)}catch{}navigator.vibrate?.(12);
  },300);
 }
 function moveFeedThrow(e){
  const g=throwGesture;if(!g||g.pointer!==e.pointerId)return;
  if(!g.el.isConnected){cancelFeedThrow();return}
  if(!g.armed){if(Math.hypot(e.clientX-g.x,e.clientY-g.y)>12)cancelFeedThrow();return}
  e.preventDefault();e.stopImmediatePropagation();g.lastX=e.clientX;g.lastY=e.clientY;
  const now=performance.now();g.samples.push({x:e.clientX,y:e.clientY,t:now});while(g.samples.length>2&&g.samples[1].t<now-100)g.samples.shift();
  if(!g.frame)g.frame=requestAnimationFrame(()=>{g.frame=0;if(throwGesture===g)g.ghost.style.transform='translate3d('+g.lastX+'px,'+g.lastY+'px,0) translate(-50%,-130%)'});
 }
 async function launchFeed(g,x,y){
  if(feedUi.busy||!FrontierBaseEngine.feedStock(db,g.type)||!yard?.isConnected)return;
  const now=performance.now(),sample=g.samples[0]||{x:g.x,y:g.y,t:g.armedAt},elapsed=Math.max(.025,(now-sample.t)/1000);
  let vx=(x-sample.x)/elapsed,vy=(y-sample.y)/elapsed,speed=Math.hypot(vx,vy);
  if(speed<120){const dx=x-g.x,dy=y-g.y,d=Math.max(1,Math.hypot(dx,dy));vx=dx/d*120;vy=dy/d*120;speed=120}
  if(speed>1200){vx*=1200/speed;vy*=1200/speed;speed=1200}
  const start=toWorld(x,y),path=throwPath(clamp(start.x,18,world.w-18),clamp(start.y,45,world.h-12),vx/cam.z*.45,vy/cam.z*.35,18/cam.z,(160+Math.min(100,speed*.1))/cam.z,650/cam.z),id=crypto.randomUUID();
  const layer=yard.querySelector('.yard-food-layer'),node=document.createElement('div'),shadow=document.createElement('i');
  node.className='yard-thrown-feed';node.hidden=true;shadow.hidden=true;node.dataset.yardFlight=id;node.innerHTML='<img src="assets/feed-'+g.type+'.png" alt="">';shadow.className='yard-throw-shadow';shadow.dataset.yardFlightShadow=id;layer.append(shadow,node);
  const flight={...path,id,type:g.type,node,shadow,started:performance.now(),committed:false,spin:Math.sign(vx||1)*480};thrown.set(id,flight);feedUi.busy=true;updateFeedToolbar();
  try{
   const ok=await FrontierBase151.execute('feedPlace',{id,feed:g.type,x:path.x/world.w,y:path.y/world.h});
   if(ok){flight.committed=true;syncFood()}else{thrown.delete(id);node.remove();shadow.remove()}
  }finally{feedUi.busy=false;updateFeedToolbar()}
 }
 function releaseFeedThrow(e){
  const g=throwGesture;if(!g||g.pointer!==e.pointerId)return;const armed=g.armed;
  if(armed){e.preventDefault();e.stopImmediatePropagation();feedClickUntil=performance.now()+650}
  cancelFeedThrow();
  if(armed&&e.type==='pointerup'&&e.clientY-g.y<-18)launchFeed(g,e.clientX,e.clientY);else if(armed)updateFeedToolbar();
 }
 function animateThrows(t){
  for(const [id,f]of thrown){
   const elapsed=Math.max(0,(t-f.started)/1000),index=Math.min(f.points.length-1,Math.floor(elapsed/THROW_DT)),a=f.points[index],b=f.points[Math.min(index+1,f.points.length-1)],mix=b.t===a.t?0:clamp((elapsed-a.t)/(b.t-a.t),0,1),x=a.x+(b.x-a.x)*mix,y=a.y+(b.y-a.y)*mix,z=a.z+(b.z-a.z)*mix,p=toScreen(x,y);
   f.node.hidden=false;f.shadow.hidden=false;f.node.style.transform='translate3d('+p.x+'px,'+(p.y-z*cam.z)+'px,0) translate(-50%,-70%) rotate('+(Math.sign(f.spin)*360*(1-Math.pow(1-clamp(elapsed/f.duration,0,1),2)))+'deg) scale('+(1+(clamp(cam.z,.65,1.5)-1)*clamp(elapsed/f.duration,0,1))+')';
   f.shadow.style.transform='translate3d('+p.x+'px,'+p.y+'px,0) translate(-50%,-50%) scale('+(.6+.4/(1+z*cam.z/50))+')';
   if(elapsed>=f.duration&&f.committed){f.node.remove();f.shadow.remove();thrown.delete(id)}
  }
 }
 document.addEventListener('pointerdown',holdFeed,true);
 document.addEventListener('pointermove',moveFeedThrow,{capture:true,passive:false});
 document.addEventListener('pointerup',releaseFeedThrow,true);document.addEventListener('pointercancel',releaseFeedThrow,true);
 window.addEventListener('blur',()=>{cancelFeedThrow();updateFeedToolbar()});
 function rename(value){
  const i=focus?.i;if(!i)return;const name=String(value||'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,NAME_MAX);
  const live=(db.capture?.instances||[]).find(x=>x.uid===i.uid);if(!live)return;
  if(name&&name!==FrontierCapture.units[live.species].name)live.nickname=name;else delete live.nickname;
  focus.i=live;save();editing=false;fill();aim();updateCount();toast(name?'已命名為「'+name+'」':'已恢復原名');
 }
 /* ---------- 指標：短按查看、長按拖曳、空白處拖曳平移、雙指縮放、滾輪縮放 ---------- */
 function down(e){
  if(!yard?.isConnected||!e.target.closest?.('.yard')||e.target.closest('.yard-bubble,.yard-head,.yard-filter-panel,.yard-feed-tools'))return;
  e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){if(gesture?.timer)clearTimeout(gesture.timer);if(gesture?.type==='drag')gesture.m.hop=6;const [a,b]=[...pointers.values()];gesture={type:'pinch',d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.z};return}
  if(pointers.size>2)return;
  const w=toWorld(e.clientX,e.clientY),m=hit(w.x,w.y);
  cam.vx=0;cam.vy=0;gesture={type:'press',id:e.pointerId,x:e.clientX,y:e.clientY,m,cam:{...cam},moved:false};
  if(m&&!feedUi.selected)gesture.timer=setTimeout(()=>{if(gesture?.m!==m||gesture.moved)return;gesture.type='drag';gesture.off={x:m.x-w.x,y:m.y-w.y};if(bubble)close();navigator.vibrate?.(15)},HOLD_MS);
 }
 function move(e){
  if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!gesture)return;e.preventDefault();
  if(gesture.type==='pinch'&&pointers.size>=2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt(gesture.z*d/Math.max(1,gesture.d),(a.x+b.x)/2,(a.y+b.y)/2);return}
  if(e.pointerId!==gesture.id)return;
  if(gesture.type==='drag'){const m=gesture.m,w=toWorld(e.clientX,e.clientY);m.x=clamp(w.x+gesture.off.x,20,world.w-20);m.y=clamp(w.y+gesture.off.y,40,world.h-6);if(Math.abs(e.movementX||0)>1)m.dir=e.movementX<0?-1:1;return}
  if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8){gesture.moved=true;clearTimeout(gesture.timer);gesture.type='pan'}
  if(gesture.type==='pan'){const now=performance.now(),dtp=Math.max(1,now-(gesture.lt||now-16));gesture.vx=(e.clientX-(gesture.lx??gesture.x))/dtp*1000;gesture.vy=(e.clientY-(gesture.ly??gesture.y))/dtp*1000;gesture.lx=e.clientX;gesture.ly=e.clientY;gesture.lt=now;cam.x=gesture.cam.x-(e.clientX-gesture.x)/cam.z;cam.y=gesture.cam.y-(e.clientY-gesture.y)/cam.z;clampCam()}
 }
 function up(e){
  if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);const g=gesture;if(!g)return;
  if(g.type==='pinch'){if(pointers.size===0)gesture=null;else{const [id,p]=[...pointers.entries()][0];gesture={type:'pan',id,x:p.x,y:p.y,cam:{...cam},moved:true}}return}
  if(e.pointerId!==g.id)return;clearTimeout(g.timer);gesture=null;
  if(g.type==='pan'){const fresh=performance.now()-(g.lt||0)<80;cam.vx=fresh?clamp(g.vx||0,-2500,2500):0;cam.vy=fresh?clamp(g.vy||0,-2500,2500):0;return}
  if(g.type==='drag'){const m=g.m;m.zone=zoneOf(m.x);m.hop=8;m.mode='idle';m.wait=rnd(1,3);m.tx=m.x;m.ty=m.y;return}
  if(g.type!=='press'||e.type==='pointercancel')return;
  if(feedUi.selected){offerFeed(g.m,toWorld(e.clientX,e.clientY));return}
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
  if(performance.now()<feedClickUntil&&e.target.closest?.('.yard-feed-tools')){e.preventDefault();e.stopImmediatePropagation();return}
  if(e.target.closest?.('[data-home20-yard]')){FrontierRuntime.view(()=>go('yard'));return}
  if(e.target.closest?.('[data-yard-back]')){go('home');return}
  if(e.target.closest?.('[data-yard-pen]')&&focus){editing=true;fill();aim()}
  if(e.target.closest?.('[data-yard-feed-toggle]')){feedUi.open=!feedUi.open;if(!feedUi.open)feedUi.selected=null;close();updateFeedToolbar();return}
  const pick=e.target.closest?.('[data-yard-feed-pick]');
  if(pick){feedUi.selected=feedUi.selected===pick.dataset.yardFeedPick?null:pick.dataset.yardFeedPick;close();updateFeedToolbar();return}
  if(e.target.closest?.('[data-yard-heart]')&&focus){const live=(db.capture?.instances||[]).find(x=>x.uid===focus.i.uid);if(live){if(live.favorite)delete live.favorite;else live.favorite=true;focus.i=live;save();fill();aim();updateCount();toast(live.favorite?'已加入喜愛名單':'已移出喜愛名單')}}
  const fb=e.target.closest?.('[data-yard-filter-open]');if(fb){const p=yard.querySelector('.yard-filter-panel');p.hidden=!p.hidden;fb.setAttribute('aria-expanded',String(!p.hidden));return}
  if(yard?.isConnected&&!e.target.closest?.('.yard-filter-panel,[data-yard-filter-open]')){const p=yard.querySelector('.yard-filter-panel');if(p&&!p.hidden){p.hidden=true;yard.querySelector('[data-yard-filter-open]')?.setAttribute('aria-expanded','false')}}
 });
 document.addEventListener('frontier:committed',()=>{if(yard?.isConnected){syncFood();updateFeedToolbar()}});
 document.addEventListener('change',e=>{const k=e.target.dataset?.yardFilter;if(!k||!(k in filt))return;filt[k]=e.target.checked;if(focus&&!shown(focus))close();updateCount()});
 document.addEventListener('submit',e=>{if(!e.target.closest?.('.yard-rename'))return;e.preventDefault();rename(e.target.querySelector('input').value)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&bubble){if(editing){editing=false;fill();aim()}else close()}});
 const prior=render;render=function(){
  document.body.classList.toggle('yard-mode',page==='yard');
  if(page==='yard'){if(yard?.isConnected){nav();return}nav();$('#app').innerHTML=view();mount();return}
  if(yard){stop();yard=null}prior();
 };
 return{perf,view,mount,purge,modelFor:resolveId,mobs:()=>mobs,cam:()=>({...cam,minZoom,world}),zoomAt,species:()=>species,rename:(uid,name)=>{const m=mobs.find(x=>x.i.uid===uid);if(m){focus=m;return rename(name)}}};
})();
