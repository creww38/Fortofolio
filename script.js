/* ================================================================
   GSAP REGISTER
================================================================ */
gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   LOADER
================================================================ */
(function(){
  const bar   = document.getElementById('loader-bar');
  const pct   = document.getElementById('loader-pct');
  const loader= document.getElementById('loader');
  let prog = 0;
  const iv = setInterval(()=>{
    prog += Math.random()*18;
    if(prog>=100){ prog=100; clearInterval(iv); }
    bar.style.width = prog+'%';
    pct.textContent = Math.floor(prog)+'%';
    if(prog===100){
      setTimeout(()=>{
        gsap.to(loader,{opacity:0,duration:.8,ease:'power2.in',onComplete:()=>{
          loader.style.display='none';
          initAll();
        }});
      },400);
    }
  },60);
})();

/* ================================================================
   CURSOR
================================================================ */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let cx=0,cy=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  cx=e.clientX; cy=e.clientY;
  cursor.style.left=cx+'px';
  cursor.style.top=cy+'px';
});
(function loop(){
  rx+=(cx-rx)*.12;
  ry+=(cy-ry)*.12;
  cursorRing.style.left=rx+'px';
  cursorRing.style.top=ry+'px';
  requestAnimationFrame(loop);
})();

/* ================================================================
   NAV
================================================================ */
const nav     = document.getElementById('main-nav');
const hamburger=document.getElementById('hamburger');
const navLinks =document.getElementById('nav-links');
window.addEventListener('scroll',()=>{
  nav.classList.toggle('scrolled', window.scrollY>60);
});
hamburger.addEventListener('click',()=>{
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
}));

/* ================================================================
   CONTACT FORM FLOAT LABELS
================================================================ */
['name','email','msg'].forEach(id=>{
  const inp = document.getElementById('f-'+id);
  const wrap= document.getElementById('ff-'+id);
  if(!inp||!wrap) return;
  inp.addEventListener('input',()=>{
    wrap.classList.toggle('has-val', inp.value.length>0);
  });
});

/* ================================================================
   MAIN INIT (after loader)
================================================================ */
function initAll(){
  initHeroCanvas();
  initAboutCanvas();
  initMidCanvas();
  initProjPreview();
  initGSAP();
  initProjectHover();
}

/* ================================================================
   HERO THREE.JS — Abstract ribbon & floating orbs
================================================================ */
function initHeroCanvas(){
  const canvas = document.getElementById('hero-canvas');
  const W = window.innerWidth, H = window.innerHeight;
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(65, W/H, 0.1, 200);
  camera.position.set(0, 0, 14);
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Lights
  const al = new THREE.AmbientLight(0xffffff,0.4); scene.add(al);
  const pl1= new THREE.PointLight(0xB8955A,3,60); pl1.position.set(8,6,4); scene.add(pl1);
  const pl2= new THREE.PointLight(0xC8C8D0,2,60); pl2.position.set(-8,-4,2); scene.add(pl2);
  const pl3= new THREE.PointLight(0xD4B07A,1.5,40); pl3.position.set(0,0,10); scene.add(pl3);

  // Gold material helper
  function goldMat(rough=0.15){
    return new THREE.MeshStandardMaterial({
      color:0xB8955A, metalness:1, roughness:rough
    });
  }
  function platinumMat(rough=0.2){
    return new THREE.MeshStandardMaterial({
      color:0xC8C8D0, metalness:0.9, roughness:rough
    });
  }

  const shapes = [];

  // Large torus — signature shape
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(3.5,0.18,32,160),
    goldMat(0.1)
  );
  torus.rotation.x = Math.PI*0.3;
  torus.position.set(6,0,-2);
  scene.add(torus);
  shapes.push({mesh:torus, rx:0.003, ry:0.005, float:0.8, phase:0});

  // Icosahedron wireframe
  const icoGeo = new THREE.IcosahedronGeometry(2,1);
  const icoMesh= new THREE.Mesh(icoGeo, new THREE.MeshStandardMaterial({
    color:0xC8C8D0, metalness:0.95, roughness:0.05, wireframe:false, transparent:true, opacity:0.12
  }));
  const icoWire= new THREE.Mesh(icoGeo, new THREE.MeshStandardMaterial({
    color:0xB8955A, metalness:1, roughness:0.1, wireframe:true
  }));
  const icoGroup=new THREE.Group();
  icoGroup.add(icoMesh,icoWire);
  icoGroup.position.set(-7,2,-4);
  scene.add(icoGroup);
  shapes.push({mesh:icoGroup, rx:0.004, ry:0.003, float:0.6, phase:1.2});

  // Octahedron
  const octa=new THREE.Mesh(
    new THREE.OctahedronGeometry(1.2,0),
    goldMat(0.05)
  );
  octa.position.set(-3,-4,-1);
  scene.add(octa);
  shapes.push({mesh:octa, rx:0.006, ry:0.004, float:0.5, phase:2.1});

  // Sphere
  const sphere=new THREE.Mesh(
    new THREE.SphereGeometry(0.8,64,64),
    platinumMat(0.05)
  );
  sphere.position.set(4,3,-3);
  scene.add(sphere);
  shapes.push({mesh:sphere, rx:0.002, ry:0.006, float:0.7, phase:0.7});

  // Particles
  const partCount=1200;
  const pos=new Float32Array(partCount*3);
  for(let i=0;i<partCount;i++){
    pos[i*3]  =(Math.random()-.5)*40;
    pos[i*3+1]=(Math.random()-.5)*30;
    pos[i*3+2]=(Math.random()-.5)*20-5;
  }
  const partGeo=new THREE.BufferGeometry();
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const partMat=new THREE.PointsMaterial({
    color:0xB8955A, size:0.05, transparent:true, opacity:0.4
  });
  scene.add(new THREE.Points(partGeo,partMat));

  // Grid
  const gridHelper=new THREE.GridHelper(40,40,0x1a1a2e,0x1a1a2e);
  gridHelper.position.y=-6;
  scene.add(gridHelper);

  let mx=0,my=0, t=0;
  document.addEventListener('mousemove',e=>{
    mx=(e.clientX/window.innerWidth)*2-1;
    my=-(e.clientY/window.innerHeight)*2+1;
  });

  function animate(){
    requestAnimationFrame(animate);
    t+=0.008;
    shapes.forEach((s,i)=>{
      s.mesh.rotation.x+=s.rx;
      s.mesh.rotation.y+=s.ry;
      s.mesh.position.y+=Math.sin(t*1.3+s.phase)*s.float*0.008;
    });
    camera.position.x+=(mx*1.5-camera.position.x)*0.04;
    camera.position.y+=(my*1.0-camera.position.y)*0.04;
    camera.lookAt(scene.position);
    renderer.render(scene,camera);
  }
  animate();

  window.addEventListener('resize',()=>{
    const w=window.innerWidth,h=window.innerHeight;
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  });
}

/* ================================================================
   ABOUT THREE.JS — Rotating crystal / gem
================================================================ */
function initAboutCanvas(){
  const canvas=document.getElementById('about-canvas');
  const wrap=canvas.parentElement;
  const W=wrap.clientWidth||400, H=wrap.clientHeight||560;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,W/H,0.1,100);
  camera.position.set(0,0,8);
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;

  const al=new THREE.AmbientLight(0xffffff,0.3); scene.add(al);
  const pl1=new THREE.PointLight(0xB8955A,4,30); pl1.position.set(5,5,5); scene.add(pl1);
  const pl2=new THREE.PointLight(0xE8E4DC,2,30); pl2.position.set(-5,-3,3); scene.add(pl2);

  // Central gem — compound geometry
  const group=new THREE.Group();

  // Core
  const coreGeo=new THREE.OctahedronGeometry(2.2,0);
  const coreMat=new THREE.MeshStandardMaterial({
    color:0xB8955A,metalness:1,roughness:0.05,
    transparent:true, opacity:0.85
  });
  group.add(new THREE.Mesh(coreGeo,coreMat));

  // Inner wireframe
  const wireMat=new THREE.MeshStandardMaterial({
    color:0xD4B07A,metalness:1,roughness:0,wireframe:true,transparent:true,opacity:0.4
  });
  group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.6,1),wireMat));

  // Outer shell rings
  for(let i=0;i<3;i++){
    const t=new THREE.Mesh(
      new THREE.TorusGeometry(2.8+i*0.3, 0.02, 16, 80),
      new THREE.MeshStandardMaterial({color:0xC8C8D0,metalness:1,roughness:0})
    );
    t.rotation.x=Math.PI/3*i;
    t.rotation.z=Math.PI/5*i;
    group.add(t);
  }

  scene.add(group);

  // Small orbiting spheres
  const orbiters=[];
  [0xB8955A,0xC8C8D0,0xE8E4DC].forEach((col,i)=>{
    const m=new THREE.Mesh(
      new THREE.SphereGeometry(0.15,16,16),
      new THREE.MeshStandardMaterial({color:col,metalness:1,roughness:0.1})
    );
    scene.add(m);
    orbiters.push({mesh:m,angle:(Math.PI*2/3)*i,speed:0.012,r:3.8,phase:i});
  });

  let t=0;
  function animate(){
    requestAnimationFrame(animate);
    t+=0.008;
    group.rotation.y=t*0.5;
    group.rotation.x=Math.sin(t*0.3)*0.3;
    orbiters.forEach(o=>{
      o.angle+=o.speed;
      o.mesh.position.x=Math.cos(o.angle)*o.r;
      o.mesh.position.y=Math.sin(o.angle*0.7+o.phase)*1.5;
      o.mesh.position.z=Math.sin(o.angle)*o.r;
    });
    renderer.render(scene,camera);
  }
  animate();

  // Resize
  const ro=new ResizeObserver(()=>{
    const w=wrap.clientWidth,h=wrap.clientHeight;
    if(!w||!h) return;
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  });
  ro.observe(wrap);
}

/* ================================================================
   MID SECTION — Particle flow field
================================================================ */
function initMidCanvas(){
  const canvas=document.getElementById('mid-canvas');
  const W=window.innerWidth,H=600;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,W/H,0.1,200);
  camera.position.set(0,0,20);
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  // Flow particles
  const N=2000;
  const positions=new Float32Array(N*3);
  const velocities=[];
  for(let i=0;i<N;i++){
    positions[i*3]  =(Math.random()-.5)*30;
    positions[i*3+1]=(Math.random()-.5)*12;
    positions[i*3+2]=(Math.random()-.5)*10;
    velocities.push({
      x:(Math.random()-.5)*0.01,
      y:(Math.random()-.5)*0.01,
      z:0
    });
  }
  const geo=new THREE.BufferGeometry();
  const posAttr=new THREE.BufferAttribute(positions,3);
  geo.setAttribute('position',posAttr);
  const mat=new THREE.PointsMaterial({color:0xB8955A,size:0.08,transparent:true,opacity:0.6});
  const pts=new THREE.Points(geo,mat);
  scene.add(pts);

  // Gold rings
  for(let i=0;i<5;i++){
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(3+i*1.5,0.015,8,80),
      new THREE.MeshStandardMaterial({color:0xB8955A,metalness:1,roughness:0})
    );
    ring.rotation.x=Math.random()*Math.PI;
    ring.rotation.z=Math.random()*Math.PI;
    scene.add(ring);
  }
  const al=new THREE.AmbientLight(0xB8955A,0.5); scene.add(al);

  let t=0;
  function animate(){
    requestAnimationFrame(animate);
    t+=0.005;
    const pos=posAttr.array;
    for(let i=0;i<N;i++){
      pos[i*3]  +=velocities[i].x+Math.sin(t+pos[i*3+1]*0.3)*0.008;
      pos[i*3+1]+=velocities[i].y+Math.cos(t+pos[i*3]*0.3)*0.008;
      if(Math.abs(pos[i*3])>15)   velocities[i].x*=-1;
      if(Math.abs(pos[i*3+1])>6)  velocities[i].y*=-1;
    }
    posAttr.needsUpdate=true;
    pts.rotation.y=t*0.05;
    scene.children.forEach((c,idx)=>{
      if(c.isMesh) c.rotation.x+=0.002+idx*0.0005;
    });
    renderer.render(scene,camera);
  }
  animate();

  window.addEventListener('resize',()=>{
    const w=window.innerWidth;
    camera.aspect=w/H;
    camera.updateProjectionMatrix();
    renderer.setSize(w,H);
  });
}

/* ================================================================
   PROJECT PREVIEW CANVAS (mini 3D on hover)
================================================================ */
function initProjPreview(){
  const preview=document.getElementById('proj-preview');
  const canvas=document.getElementById('prev-canvas');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,340/220,0.1,100);
  camera.position.z=5;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setSize(340,220);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  const colors=[0xB8955A,0xC8C8D0,0x9b8060];
  let mesh=null;
  const al=new THREE.AmbientLight(0xffffff,0.5); scene.add(al);
  const pl=new THREE.PointLight(0xB8955A,3,30); pl.position.set(3,3,3); scene.add(pl);

  function setProj(idx){
    if(mesh){scene.remove(mesh);}
    const geos=[
      new THREE.TorusKnotGeometry(1,0.35,80,16),
      new THREE.IcosahedronGeometry(1.4,1),
      new THREE.DodecahedronGeometry(1.3,0)
    ];
    mesh=new THREE.Mesh(geos[idx%3],new THREE.MeshStandardMaterial({
      color:colors[idx%3],metalness:0.95,roughness:0.05
    }));
    scene.add(mesh);
  }
  setProj(0);

  let t=0;
  function animate(){
    requestAnimationFrame(animate);
    t+=0.02;
    if(mesh){ mesh.rotation.x=t*0.5; mesh.rotation.y=t*0.8; }
    renderer.render(scene,camera);
  }
  animate();

  let mouseX=0,mouseY=0;
  document.addEventListener('mousemove',e=>{ mouseX=e.clientX; mouseY=e.clientY; });

  window._setPreviewProj=setProj;
  window._getPreviewPos=()=>({x:mouseX,y:mouseY});
}

/* ================================================================
   PROJECT HOVER
================================================================ */
function initProjectHover(){
  const preview=document.getElementById('proj-preview');
  document.querySelectorAll('.project-item').forEach((item,i)=>{
    item.addEventListener('mouseenter',()=>{
      window._setPreviewProj && window._setPreviewProj(i);
      preview.classList.add('active');
    });
    item.addEventListener('mousemove',e=>{
      preview.style.left=(e.clientX+30)+'px';
      preview.style.top =(e.clientY-110)+'px';
    });
    item.addEventListener('mouseleave',()=>{
      preview.classList.remove('active');
    });
  });
}

/* ================================================================
   GSAP SCROLL ANIMATIONS
================================================================ */
function initGSAP(){
  // Hero entrance
  const tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.to('.hero-headline .line span',{
    y:0, duration:1.2, stagger:.15, delay:.2
  })
  .to('.hero-eyebrow',{opacity:1,y:0,duration:.8},'-=.8')
  .to('.hero-sub',{opacity:1,y:0,duration:.8},'-=.6')
  .to('.hero-actions',{opacity:1,y:0,duration:.8},'-=.6')
  .to('.hero-scroll-hint',{opacity:1,duration:.6},'-=.3')
  .to('.hero-stats',{opacity:1,duration:.6},'-=.3')
  .fromTo('.scroll-line',{scaleX:0},{scaleX:1,duration:1.2,ease:'power2.out'},'-=.6');

  // Scroll reveal
  document.querySelectorAll('.reveal').forEach(el=>{
    gsap.to(el,{
      opacity:1,y:0,duration:1,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 88%',once:true}
    });
  });
  document.querySelectorAll('.reveal-left').forEach(el=>{
    gsap.to(el,{
      opacity:1,x:0,duration:1.1,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 85%',once:true}
    });
  });
  document.querySelectorAll('.reveal-right').forEach(el=>{
    gsap.to(el,{
      opacity:1,x:0,duration:1.1,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 85%',once:true}
    });
  });
  document.querySelectorAll('.reveal-scale').forEach(el=>{
    gsap.to(el,{
      opacity:1,scale:1,duration:1,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 85%',once:true}
    });
  });

  // Hero parallax on scroll
  gsap.to('.hero-headline',{
    yPercent:-30,ease:'none',
    scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}
  });
  gsap.to('#hero-canvas',{
    yPercent:20,ease:'none',
    scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}
  });
  gsap.to('.hero-sub',{
    yPercent:-20,opacity:0,ease:'none',
    scrollTrigger:{trigger:'.hero',start:'40% top',end:'bottom top',scrub:true}
  });

  // Skill pills stagger
  gsap.from('.skill-pill',{
    opacity:0,y:20,stagger:.06,duration:.6,ease:'power2.out',
    scrollTrigger:{trigger:'.skills-row',start:'top 88%',once:true}
  });

  // Project items stagger
  gsap.from('.project-item',{
    opacity:0,y:30,stagger:.1,duration:.8,ease:'power2.out',
    scrollTrigger:{trigger:'.projects-list',start:'top 85%',once:true}
  });

  // Scene section parallax
  gsap.to('.scene-big-text',{
    yPercent:-20,ease:'none',
    scrollTrigger:{trigger:'.scene-section',start:'top bottom',end:'bottom top',scrub:true}
  });

  // 3D tilt on project cards
  document.querySelectorAll('.project-item').forEach(item=>{
    item.addEventListener('mousemove',e=>{
      const rect=item.getBoundingClientRect();
      const x=((e.clientX-rect.left)/rect.width-.5)*6;
      const y=((e.clientY-rect.top)/rect.height-.5)*-4;
      gsap.to(item,{rotateX:y,rotateY:x,duration:.4,ease:'power2.out',transformPerspective:800});
    });
    item.addEventListener('mouseleave',()=>{
      gsap.to(item,{rotateX:0,rotateY:0,duration:.6,ease:'power2.out'});
    });
  });

  // Skill pills tilt
  document.querySelectorAll('.skill-pill').forEach(pill=>{
    pill.addEventListener('mousemove',e=>{
      const r=pill.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width-.5)*16;
      const y=((e.clientY-r.top)/r.height-.5)*-10;
      gsap.to(pill,{rotateX:y,rotateY:x,duration:.3,ease:'power1.out',transformPerspective:400});
    });
    pill.addEventListener('mouseleave',()=>{
      gsap.to(pill,{rotateX:0,rotateY:0,duration:.5,ease:'power2.out'});
    });
  });

  // Scroll line pulse
  gsap.to('.scroll-line',{
    scaleX:.5,yoyo:true,repeat:-1,duration:1.5,ease:'sine.inOut'
  });
}
