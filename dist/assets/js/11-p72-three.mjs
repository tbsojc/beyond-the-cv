
/* Three.js is fetched from jsDelivr at runtime. The standalone HTML remains functional offline with its original accessible 2D hub. */
const stage=document.getElementById('stage');
const mount=document.getElementById('p72-webgl');
const status=document.getElementById('p72-status');
const pauseBtn=document.getElementById('p72-motion');
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduce.matches, running=true, renderer, scene, camera, controls, clock, logoGroup, nodes=[], raycaster, pointer, anim=null;
pauseBtn.addEventListener('click',()=>{paused=!paused;pauseBtn.setAttribute('aria-pressed',String(paused));pauseBtn.textContent=paused?'3D-Bewegung fortsetzen':'3D-Bewegung pausieren'});
if(reduce.matches){status.textContent='Reduzierte Bewegung aktiv · 2D-Navigation';pauseBtn.hidden=true;}
else try {
  const THREE=await import('three');
  const {SVGLoader}=await import('three/addons/loaders/SVGLoader.js');
  const {OrbitControls}=await import('three/addons/controls/OrbitControls.js');
  const test=document.createElement('canvas');
  if(!test.getContext('webgl2')&&!test.getContext('webgl')) throw new Error('WebGL nicht verfügbar');
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(38,1,.1,120);
  camera.position.set(0,0,12.5);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.5;
  mount.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Dreidimensionales BS-Logo mit sechs Kompetenzobjekten. Mit Maus oder Finger drehen. Die Schaltflächen um die Szene öffnen die Kompetenzwelten.');
  renderer.domElement.setAttribute('role','img');
  controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.055;
  controls.enablePan=false;controls.enableZoom=false;
  controls.minPolarAngle=Math.PI*.29;controls.maxPolarAngle=Math.PI*.71;
  controls.minAzimuthAngle=-Math.PI*.32;controls.maxAzimuthAngle=Math.PI*.32;
  controls.target.set(0,0,0);
  scene.add(new THREE.AmbientLight(0x9dbfff,1.5));
  const key=new THREE.PointLight(0x69dbff,70,24);key.position.set(3,5,6);scene.add(key);
  const rim=new THREE.PointLight(0x336bff,60,22);rim.position.set(-5,-2,-3);scene.add(rim);
  const parsed=new SVGLoader().parse(JSON.parse(document.getElementById('p72-logo-svg').textContent));
  logoGroup=new THREE.Group();
  const material=new THREE.MeshPhysicalMaterial({color:0xbedff4,metalness:.74,roughness:.19,clearcoat:1,clearcoatRoughness:.12,side:THREE.DoubleSide});
  let count=0;
  for(const path of parsed.paths){
    const shapes=SVGLoader.createShapes(path);
    for(const shape of shapes){
      const geo=new THREE.ExtrudeGeometry(shape,{depth:3.2,bevelEnabled:true,bevelThickness:.65,bevelSize:.35,bevelSegments:3,steps:1,curveSegments:12});
      const mesh=new THREE.Mesh(geo,material);logoGroup.add(mesh);count++;
    }
  }
  if(!count)throw new Error('SVG enthält keine extrudierbaren Pfade');
  const bounds=new THREE.Box3().setFromObject(logoGroup), center=bounds.getCenter(new THREE.Vector3()), size=bounds.getSize(new THREE.Vector3());
  for(const child of logoGroup.children)child.position.sub(center);
  const scale=3.05/Math.max(size.x,size.y);logoGroup.scale.set(scale,-scale,scale);
  logoGroup.rotation.y=-.27;logoGroup.rotation.x=.07;scene.add(logoGroup);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(2.15,.012,8,140),new THREE.MeshBasicMaterial({color:0x5bdcff,transparent:true,opacity:.36}));halo.rotation.x=1.12;scene.add(halo);
  const halo2=new THREE.Mesh(new THREE.TorusGeometry(2.7,.008,8,140),new THREE.MeshBasicMaterial({color:0x468bff,transparent:true,opacity:.22}));halo2.rotation.y=.8;scene.add(halo2);
  const stars=new THREE.BufferGeometry(),positions=[];
  for(let i=0;i<220;i++){const a=Math.random()*Math.PI*2,r=3.2+Math.random()*6.5;positions.push(Math.cos(a)*r,(Math.random()-.5)*10,Math.sin(a)*r-2)}
  stars.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  const particles=new THREE.Points(stars,new THREE.PointsMaterial({color:0x82d6ff,size:.028,transparent:true,opacity:.6}));scene.add(particles);
  const sphereGeometry=new THREE.IcosahedronGeometry(.25,2);
  const locations=[[-3.45,1.65,-.7],[3.45,1.65,-.7],[-3.45,-1.75,-.7],[3.45,-1.75,-.7]];
  locations.forEach((p,i)=>{
    const mat=new THREE.MeshPhysicalMaterial({color:i%2?0x3c90c6:0x61dfff,metalness:.5,roughness:.18,emissive:0x1a82b9,emissiveIntensity:.35,transparent:true,opacity:.9});
    const mesh=new THREE.Mesh(sphereGeometry,mat);mesh.position.set(...p);mesh.userData.world=i;scene.add(mesh);nodes.push(mesh);
    const lineGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(...p)]);
    scene.add(new THREE.Line(lineGeo,new THREE.LineBasicMaterial({color:0x4bb9ef,transparent:true,opacity:.22})));
  });
  raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();
  let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>8)return;
    const rect=renderer.domElement.getBoundingClientRect();pointer.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(nodes)[0];
    if(hit)document.querySelector('#nodes [data-world="'+hit.object.userData.world+'"]')?.click();
  });
  const onResize=()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.position.z=w<450?15:12.5;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};
  const ro=new ResizeObserver(onResize);ro.observe(stage);onResize();
  clock=new THREE.Clock();
  const animate=()=>{
    if(!running)return;
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();
    if(!paused){logoGroup.rotation.y=-.27+Math.sin(t*.37)*.19;logoGroup.position.y=Math.sin(t*.8)*.08;halo.rotation.z=t*.08;halo2.rotation.z=-t*.06;
      nodes.forEach((n,i)=>{n.rotation.y=t*.25;n.scale.setScalar(1+Math.sin(t*1.2+i)*.08)});
    }
    controls.update();renderer.render(scene,camera);
  };
  animate();stage.classList.add('p72-ready');status.textContent='ECHTES 3D · Ziehen zum Drehen · Knoten oder Welt wählen';
  const watch=new MutationObserver(()=>{const overlay=document.querySelector('#layer .overlay');
    if(overlay&&!anim){anim={start:performance.now(),from:camera.position.clone()};}
    if(!overlay)anim=null;
  });watch.observe(document.getElementById('layer'),{childList:true});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();running=false;stage.classList.remove('p72-ready');status.textContent='3D-Kontext verloren · 2D-Navigation verfügbar';});
} catch(error){status.textContent='2D-Ansicht aktiv · 3D benötigt Internet und WebGL';pauseBtn.hidden=true;console.warn('Beyond the CV: 3D-Fallback:',error);}
