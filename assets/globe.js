/* globe.js: ES module, hero 3D globe with three@0.160.0 (spec 03 section 1).
   Draws a textured Earth with animated shipping routes between China and India,
   city markers, and HTML name labels that follow the cities on screen. */
import * as THREE from 'three';

// Find the <canvas id="globe"> in the page. Everything below only runs if that canvas exists.
const canvas=document.getElementById('globe');
const hasWebGL=(()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'))}catch(e){return false}})(); // IMPROVEMENT (not in original): detect WebGL so we can skip the scene instead of throwing
if(canvas&&!hasWebGL){document.documentElement.classList.add('no-webgl');} // IMPROVEMENT (not in original): flag no-WebGL so CSS shows a static fallback
if(canvas&&hasWebGL){ // IMPROVEMENT (not in original): only build the 3D scene when WebGL exists

// "host" is the element the canvas sits in (the hero section); its size drives the canvas size.
// "labelsEl" is the empty div where the city name pills (HTML, not 3D) get added.
const host=canvas.parentElement;
const labelsEl=document.getElementById('glabels');
// True if the visitor's system asks for less animation; we then freeze time and remove the sway.
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Easing curve for the intro: t goes 0..1, result goes 0..1 but starts slow, speeds up, then slows (cubic in/out).
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

// The renderer is the thing that actually draws into the canvas.
// antialias = smooth edges, alpha = transparent background so the page shows through.
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
// Pixel ratio = how many real pixels per CSS pixel; capped at 2 so retina screens stay fast.
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
// Output colours are converted to the sRGB space that screens expect.
renderer.outputColorSpace=THREE.SRGBColorSpace;
// ACES filmic tone mapping squeezes bright values into a natural, cinema-like look; exposure 1.05 = a touch brighter.
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
// The scene is the container for everything we draw.
const scene=new THREE.Scene();

// Camera: fov 35 degrees = a narrow lens so the globe looks less distorted;
// aspect 1 is a placeholder (resize() sets the real one); it sees things from 0.1 to 200 units away.
// It sits 9 units back from the origin and looks straight down -Z. It never moves.
const camera=new THREE.PerspectiveCamera(35,1,.1,200);
camera.position.set(0,0,9);

// R = globe radius in scene units.
// "outer" is a group used for placing/scaling/tilting the whole globe on the page.
// "globe" sits inside it and holds everything that spins with the Earth (spin about the Y axis).
const R=2;
const outer=new THREE.Group();scene.add(outer);
const globe=new THREE.Group();outer.add(globe);
// ll = latitude/longitude to x,y,z on a sphere of radius r.
// phi = angle down from the north pole (90 - lat); th = angle around the axis (lon + 180); both converted from degrees to radians.
// Then the standard sphere formula gives the 3D point.
const ll=(lat,lon,r=R)=>{const phi=(90-lat)*Math.PI/180,th=(lon+180)*Math.PI/180;
  return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(th),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(th))};

// Textures: pictures wrapped around the sphere (from the three.js examples, MIT licence).
// "tex" loads one file; srgb=true marks colour pictures as sRGB (data maps such as normal/specular are left linear).
// Anisotropy = sharper textures when seen at a steep angle (set to the most the GPU supports).
// textures (three.js example planet maps, MIT)
const base='https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/';
const loader=new THREE.TextureLoader();
const aniso=renderer.capabilities.getMaxAnisotropy();
const tex=(f,srgb=true)=>{const t=loader.load(base+f);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=aniso;return t};

// SUN = direction pointing toward the sun (x left/right, y up, z toward the viewer), normalized to length 1.
// It is used for the real light and also passed into shaders so the night side matches the light.
// sun from upper-left-front: China/India in daylight, night falls on the right limb
const SUN=new THREE.Vector3(-.62,.32,.72).normalize();

// Earth material (Phong = shiny, lit surface):
//  map = daytime colours, normalMap = fake bumps (normalScale y is negative to flip its direction),
//  specularMap + specular colour + shininess = oceans give a bright glint, land does not,
//  emissiveMap = the city-lights picture, glowing orange-ish (emissive colour) at 1.6 strength.
const earthMat=new THREE.MeshPhongMaterial({
  map:tex('earth_atmos_2048.jpg'),
  normalMap:tex('earth_normal_2048.jpg',false),normalScale:new THREE.Vector2(.85,-.85),
  specularMap:tex('earth_specular_2048.jpg',false),specular:new THREE.Color(0x5a76a0),shininess:28,
  emissiveMap:tex('earth_lights_2048.png'),emissive:new THREE.Color(0xffc27a),emissiveIntensity:1.6
});
// onBeforeCompile lets us inject extra shader code into three.js's built-in material before it is compiled.
// Vertex part: pass the surface normal in world space (vWN) to the fragment shader.
// Fragment part: multiply the city-light glow by smoothstep(.05,-.28,dot(normal,sun)):
// that is 1 when the surface faces away from the sun and 0 when it faces the sun,
// so city lights only show on the night side.
earthMat.onBeforeCompile=sh=>{
  sh.uniforms.uSun={value:SUN};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWN;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nvWN=normalize(mat3(modelMatrix)*normal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWN;\nuniform vec3 uSun;')
    .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance*=smoothstep(.05,-.28,dot(normalize(vWN),uSun));');
};
// The Earth itself: a sphere of radius R with 128x128 segments (high number = very smooth).
const earth=new THREE.Mesh(new THREE.SphereGeometry(R,128,128),earthMat);
globe.add(earth);

// Clouds: a slightly bigger sphere (1.2% larger than the Earth) with a cloud picture,
// 75% opaque, transparent, and not writing depth so it does not hide things behind it.
// clouds
const clouds=new THREE.Mesh(new THREE.SphereGeometry(R*1.012,96,96),new THREE.MeshPhongMaterial({map:tex('earth_clouds_1024.png'),transparent:true,opacity:.75,depthWrite:false,shininess:4}));
globe.add(clouds);

// Atmosphere rim: a sphere 2% bigger than the Earth with a custom shader.
// Idea (fresnel): the more an edge is turned away from the camera, the brighter it glows (pow(1 - dot(normal, view), 3.2)).
// The colour mixes from deeper blue (night) to light blue (day) using the sun direction, so the day side glows stronger.
// atmosphere: thin rim on the planet + soft halo around it (normal blending, reads on a light page)
const rim=new THREE.Mesh(new THREE.SphereGeometry(R*1.02,96,96),new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  uniforms:{uSun:{value:SUN}},
  vertexShader:`varying vec3 vN;varying vec3 vV;varying vec3 vWN;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vWN=normalize(mat3(modelMatrix)*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform vec3 uSun;varying vec3 vN;varying vec3 vV;varying vec3 vWN;void main(){float f=pow(1.-max(dot(vN,vV),0.),3.2);float day=smoothstep(-.35,.4,dot(vWN,uSun));gl_FragColor=vec4(mix(vec3(.25,.45,.9),vec3(.45,.72,1.),day),f*(.35+.65*day));}`}));
outer.add(rim);
// Halo: a much bigger sphere (11% larger) drawn from the inside (BackSide), so we only see the soft glow
// spreading out around the planet. Its strength depends on how close each point is to the edge as seen from the camera.
const halo=new THREE.Mesh(new THREE.SphereGeometry(R*1.11,96,96),new THREE.ShaderMaterial({side:THREE.BackSide,transparent:true,depthWrite:false,
  vertexShader:`varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vN;void main(){float i=pow(max(.58-dot(vN,vec3(0.,0.,1.)),0.),2.4);gl_FragColor=vec4(.42,.66,1.,i*1.05);}`}));
outer.add(halo);

// Cities: name (n), latitude/longitude, country (cn = China, in = India), and which side of the dot
// the HTML label goes on (side 'l' or 'r'; no side = no label).
// cities
const cities={
  shanghai:{n:'Shanghai',lat:31.23,lon:121.47,c:'cn',side:'r'},
  yiwu:{n:'Yiwu',lat:29.31,lon:120.08,c:'cn',side:'l'},
  guangzhou:{n:'Guangzhou',lat:23.13,lon:113.26,c:'cn',side:'r'},
  shenzhen:{n:'Shenzhen',lat:22.54,lon:114.06,c:'cn'},
  mumbai:{n:'Nhava Sheva',lat:18.95,lon:72.95,c:'in',side:'l'},
  chennai:{n:'Chennai',lat:13.08,lon:80.27,c:'in',side:'r'},
  hyderabad:{n:'Hyderabad',lat:17.39,lon:78.49,c:'in',side:'r'},
  vizag:{n:'Vizag',lat:17.69,lon:83.22,c:'in'},
};
// glowTex draws a small soft glowing dot on a 128x128 canvas (a radial gradient from a white centre
// through orange to fully transparent at the edge) and turns it into a texture for the moving route heads.
function glowTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.22,'rgba(255,190,120,.95)');gr.addColorStop(.5,'rgba(255,110,60,.35)');gr.addColorStop(1,'rgba(255,90,40,0)');
  g.fillStyle=gr;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const glow=glowTex();
// LABEL_ORDER = priority when labels would overlap: earlier names get placed first.
const LABEL_ORDER=['hyderabad','shanghai','guangzhou','mumbai','chennai','yiwu'];
// For every city: work out its 3D position (just above the surface, radius R*1.004), then add
//  - a small solid dot (red for China, white for India),
//  - a flat ring facing outward from the globe (lookAt a point twice as far from the centre) that will pulse,
//  - and, if the city has a side, an HTML label pill with a flag and the name.
// "phase" is a random start offset so the rings do not all pulse in sync.
const markers=[];
for(const k in cities){
  const c=cities[k];const pos=ll(c.lat,c.lon,R*1.004);c.pos=pos;
  const col=c.c==='cn'?0xe3241b:0xffffff;
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.02,16,16),new THREE.MeshBasicMaterial({color:col}));dot.position.copy(pos);globe.add(dot);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.028,.04,40),new THREE.MeshBasicMaterial({color:col,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
  ring.position.copy(pos);ring.lookAt(pos.clone().multiplyScalar(2));globe.add(ring);
  markers.push({ring,phase:Math.random()});
  if(c.side){const el=document.createElement('div');el.className='glabel';el.innerHTML=`<svg class="flag"><use href="#flag-${c.c}"/></svg>${c.n}`;labelsEl.appendChild(el);c.el=el}
}

// Routes: [from city, to city, colour, offset]. The offset (0..1) staggers when each route's moving
// highlight starts so they are not all at the same point of their journey.
// routes: sea lanes (red/orange) + air (blue)
const routes=[['shanghai','chennai',0xe3241b,0],['yiwu','mumbai',0xff3b30,.33],['guangzhou','vizag',0xffffff,.66],['shenzhen','hyderabad',0xffffff,.15],['shanghai','hyderabad',0xe3241b,.5],['guangzhou','chennai',0xff3b30,.82]];
const arcs=[];
// For each route: build a curved path (quadratic Bezier) from city A to city B whose middle control point
// is pushed outward from the globe (distance R + half the straight-line distance d) so it arcs above the surface.
// It becomes a thin tube mesh with a custom shader: a faint line (alpha .35) plus a bright comet trail that
// travels along it (position h repeats over time; the trail is up to .4 of the route long behind it);
// both ends fade out; trail colour blends toward warm white. A glowing sprite "head" rides at the front.
for(const [a,b,color,off] of routes){
  const A=cities[a].pos,B=cities[b].pos,d=A.distanceTo(B);
  const curve=new THREE.QuadraticBezierCurve3(A,A.clone().add(B).normalize().multiplyScalar(R+d*.5),B);
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
    uniforms:{uT:{value:0},uC:{value:new THREE.Color(color)},uO:{value:off}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float uT;uniform vec3 uC;uniform float uO;varying vec2 vUv;void main(){float h=fract(uT*.15+uO);float d=h-vUv.x;float tr=(d>0.&&d<.4)?pow(1.-d/.4,1.6):0.;float a=.35+tr*.65;a*=smoothstep(0.,.03,vUv.x)*smoothstep(1.,.97,vUv.x);gl_FragColor=vec4(mix(uC,vec3(1.,.95,.85),tr*tr*.6),a);}`});
  globe.add(new THREE.Mesh(new THREE.TubeGeometry(curve,96,.0065,8,false),mat));
  const head=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  head.scale.setScalar(.15);globe.add(head);
  arcs.push({curve,mat,head,off});
}

// Lights (added to the scene, so they do not turn with the globe):
// a very dim bluish ambient light (0.12) so the night side is not pure black,
// and a strong white directional "sun" (2.6) placed 10 units away in the SUN direction.
// light
scene.add(new THREE.AmbientLight(0x9fb4d8,.12));
const sunL=new THREE.DirectionalLight(0xffffff,2.6);sunL.position.copy(SUN).multiplyScalar(10);scene.add(sunL);

// Starting orientation: turn the globe so lat 22, lon 96 (between China and India) faces the camera.
// baseY = spin about the vertical axis, baseX = tilt up/down, both from that point's coordinates.
// face China–India toward the camera
const focus=ll(22,96,1);
const baseY=-Math.atan2(focus.x,focus.z), baseX=Math.asin(focus.y);
outer.rotation.x=baseX;globe.rotation.y=baseY;

// resize(): fits the canvas to its host and positions/sizes the globe in the camera view.
// "scale" and "yawOff" are results used by the animation loop (overall size, and extra turn to bring China back into view).
// Wide screens (>820px): hh/hw = half the visible height/width in scene units at the globe's distance (tan of half the fov).
//   The globe is put to the right of the hero text (txt right edge, but at most 62% of the width), sized to the space left.
//   If it would run off the right edge ("bleed"), it is turned a bit so China stays visible.
// Narrow screens: the globe is placed near the top of the visible screen, sized in pixels
//   (rPx = radius, cyPx = centre height) and converted to scene units with k.
let scale=1,yawOff=0;
function resize(){
  const w=host.clientWidth,h=host.clientHeight,asp=w/h;
  renderer.setSize(w,h,false);camera.aspect=asp;camera.updateProjectionMatrix();
  if(w>820){ // place the globe (with its glow) to the right of wherever the hero text ends
    const hh=camera.position.z*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),hw=hh*asp;
    const txt=document.querySelector('.hero-content'),hr=host.getBoundingClientRect();
    const tr=txt?Math.min(txt.getBoundingClientRect().right-hr.left,w*.62):w*.5;
    const trw=(tr/w-.5)*2*hw,avail=hw-trw;
    const r=Math.min(hh*.8,Math.max(avail*.78,hh*.5));
    outer.position.set(trw+.18+r*1.12,-.15,0);scale=r/R;
    const bleed=(outer.position.x+r)-hw;yawOff=bleed>0?-Math.asin(Math.min(1,bleed/r))*.75:0; // turn China back into view
  }
  else{yawOff=0; // phones/tablets: the hero can be taller than the screen, so place the globe in the top of the *visible* screen
    const hh=camera.position.z*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),k=2*hh/h;
    const vh=Math.min(innerHeight,h),rPx=Math.min(vh*.2,w*.42),cyPx=Math.max(vh*.27,rPx+84);
    outer.position.set(0,hh-cyPx*k,0);scale=rPx*k/R;
  }
}
// Re-fit whenever the window changes size, and once right now.
addEventListener('resize',resize);resize();

// Pointer parallax: mx,my = mouse position across the window, from -0.5 (left/top) to +0.5 (right/bottom).
// "visible" is turned off by the IntersectionObserver when the hero is scrolled off screen, so we stop drawing.
// tmp/camDir/center/nrm are reusable vectors for the label maths (avoids making new objects every frame).
// clock measures elapsed time; intro counts 0 -> 1 for the opening animation.
let mx=0,my=0;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
let visible=true;new IntersectionObserver(([e])=>visible=e.isIntersecting).observe(host);
const tmp=new THREE.Vector3(),camDir=new THREE.Vector3(),center=new THREE.Vector3(),nrm=new THREE.Vector3();
const clock=new THREE.Clock();let intro=0;
// The animation loop, run once per screen refresh.
(function frame(){
  requestAnimationFrame(frame);
  if(!visible)return;
  // t = time in seconds (frozen at 3 for reduced motion). intro grows by .012 each frame, eased into ei.
  const t=reduceMotion?3:clock.getElapsedTime();
  intro=Math.min(1,intro+.012);const ei=ease(intro);
  // Slow left/right sway (sine wave, 0.16 radians max), none for reduced motion.
  const sway=reduceMotion?0:Math.sin(t*.22)*.16;
  // Ease the globe toward its target spin/tilt: move 5% of the remaining distance each frame (smooth follow).
  // The spin target includes the pointer (mx*.3) and an extra intro twist that shrinks to 0 as ei reaches 1.
  globe.rotation.y+=((baseY+yawOff+sway+mx*.3-(1-ei)*1.3)-globe.rotation.y)*.05;
  outer.rotation.x+=((baseX+my*.12)-outer.rotation.x)*.05;
  // Size: grows from 82% to 100% of "scale" during the intro. Clouds drift slowly.
  outer.scale.setScalar(scale*(.82+.18*ei));
  clouds.rotation.y=t*.012;
  // Routes: feed time to each shader and move the glowing head along its curve (h = 0..1 progress);
  // the head fades in and out with sin(h*PI).
  for(const a of arcs){a.mat.uniforms.uT.value=t;const h=(t*.15+a.off)%1;a.head.position.copy(a.curve.getPoint(h));a.head.material.opacity=Math.sin(h*Math.PI)}
  // Marker rings: k loops 0..1; the ring grows up to 3.2x its size while fading out, then restarts.
  for(const m of markers){const k=(t*.6+m.phase)%1;m.ring.scale.setScalar(1+k*2.2);m.ring.material.opacity=(1-k)*.9}
  renderer.render(scene,camera);
  const w=host.clientWidth,h=host.clientHeight;outer.getWorldPosition(center);
  // Labels: for each city in priority order, turn its 3D point into screen pixels (project), check it faces
  // the camera (facing > .15 means it is on the visible side) and the intro is nearly done,
  // then try the label at its spot and at a few up/down shifts (dy) until it does not overlap an already
  // placed label or leave the screen; if none fits, hide it (opacity 0).
  // labels: keep on screen and never on top of each other (priority order, nudge up/down, else hide)
  const placed=[];
  for(const k of LABEL_ORDER){const c=cities[k];
    tmp.copy(c.pos);globe.localToWorld(tmp);
    camDir.copy(camera.position).sub(tmp).normalize();nrm.copy(tmp).sub(center).normalize();
    const facing=nrm.dot(camDir);tmp.project(camera);
    const x=(tmp.x*.5+.5)*w,y=(-tmp.y*.5+.5)*h;
    const lw=c.el.offsetWidth,lh=c.el.offsetHeight;
    let lx=c.side==='l'?x-10-lw:x+10;lx=Math.max(6,Math.min(w-lw-6,lx));
    let ly=y-lh/2,ok=false;
    if(facing>.15&&ei>.9)for(const dy of [0,-(lh+3),lh+3,-(lh+3)*2]){const r=[lx-2,ly+dy-2,lx+lw+2,ly+dy+lh+2];
      if(r[1]>4&&r[3]<h-4&&!placed.some(p=>r[0]<p[2]&&r[2]>p[0]&&r[1]<p[3]&&r[3]>p[1])){ly+=dy;placed.push(r);ok=true;break}}
    c.el.style.transform=`translate(${lx}px,${ly}px)`;
    c.el.style.opacity=ok?1:0;
  }
})();
}
