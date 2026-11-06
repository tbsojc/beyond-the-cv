// A single fixed Three.js scene, scroll-driven across the entire personalized application.
// Text and navigation remain in semantic HTML; reduced motion and offline fallback remain usable.
const mount=document.getElementById('scene');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced&&mount){
try{
 const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;mount.append(renderer.domElement);
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x050e1b,.024);
 const camera=new THREE.PerspectiveCamera(44,innerWidth/innerHeight,.1,160);camera.position.set(0,1.5,15);
 scene.add(new THREE.AmbientLight(0x83bde0,.65));const key=new THREE.PointLight(0x51d7ff,35,32);key.position.set(6,7,8);scene.add(key);
 const group=new THREE.Group();scene.add(group);const material=new THREE.MeshStandardMaterial({color:0x0b7db0,metalness:.72,roughness:.23,emissive:0x09304a,emissiveIntensity:.6});
 const bright=new THREE.MeshStandardMaterial({color:0x58dfff,metalness:.45,roughness:.25,emissive:0x1689bd,emissiveIntensity:.5});
 const gold=new THREE.MeshStandardMaterial({color:0xb4a06c,metalness:.65,roughness:.3});
 const torus=new THREE.Mesh(new THREE.TorusGeometry(3.5,.027,12,128),bright);torus.rotation.x=1.1;group.add(torus);
 const ring2=new THREE.Mesh(new THREE.TorusGeometry(2.45,.02,10,120),material);ring2.rotation.y=.45;group.add(ring2);
 const nodes=[];for(let i=0;i<13;i++){const a=i*Math.PI*2/13;const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.13+i%3*.035,1),i%4===0?gold:bright);mesh.position.set(Math.cos(a)*3.5,Math.sin(a)*1.45,Math.sin(a)*2.2);group.add(mesh);nodes.push(mesh)}
 const bars=[];for(let i=0;i<6;i++){const h=.7+i*.36;const bar=new THREE.Mesh(new THREE.BoxGeometry(.62,h,.62),i===5?gold:material);bar.position.set(-2.5+i, -2.3+h/2,-1.2);group.add(bar);bars.push(bar)}
 const particles=new THREE.BufferGeometry();const positions=new Float32Array(270*3);for(let i=0;i<270;i++){positions[i*3]=(Math.random()-.5)*28;positions[i*3+1]=(Math.random()-.5)*18;positions[i*3+2]=(Math.random()-.5)*20}particles.setAttribute('position',new THREE.BufferAttribute(positions,3));const stars=new THREE.Points(particles,new THREE.PointsMaterial({color:0x7bc9e5,size:.028,transparent:true,opacity:.48}));scene.add(stars);
 let target={scroll:0,chapter:0,local:0},current=0,active=true;const read=()=>{target=window.__bcv5Progress||target};window.addEventListener('bcv5-scroll',read);read();const clock=new THREE.Clock();
 function frame(){if(!active)return;requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.06);current+=(target.chapter+target.local-current)*Math.min(1,dt*2.4);const t=current;group.rotation.y=t*.35;group.rotation.x=Math.sin(t*.7)*.12;torus.rotation.z=t*.35;ring2.rotation.z=-t*.22;const emphasis=Math.min(1,Math.max(0,t-1));bars.forEach((b,i)=>{b.scale.y=1+emphasis*(.15+i*.09)});camera.position.x=3.4+Math.sin(t*.72)*2.5;camera.position.y=1.3+Math.cos(t*.57)*1.4;camera.position.z=15-Math.min(5,t*.72);camera.lookAt(0,0,0);group.position.x=3.7+Math.sin(t*.5)*.8;renderer.render(scene,camera)}frame();
 window.addEventListener('resize',()=>{camera.aspect=innerWidth/Math.max(innerHeight,1);camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(active){clock.getDelta();frame()}});
}catch(err){console.warn('3D-Hintergrund nicht verfügbar; die Bewerbung bleibt vollständig nutzbar.',err)}
}
