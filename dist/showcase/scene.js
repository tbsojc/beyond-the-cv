
// Original procedural Three.js scenes.
// No company assets or fabricated results.

const stage = document.getElementById('stage');

const title = document.getElementById('title');
const meta = document.getElementById('meta');
const category = document.getElementById('category');
const detail = document.getElementById('detail');

let THREE;

try {
  THREE = await import(
    'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js'
  );
} catch (e) {
  stage.innerHTML =
    '<div class="fallback">3D-Vorschau konnte nicht geladen werden. Internetzugang und Browser-Konsole prüfen.</div>';
  throw e;
}

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06101d, 0.028);

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(7, 5, 10);

let renderer;

try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  stage.append(renderer.domElement);
} catch (e) {
  stage.innerHTML =
    '<div class="fallback">WebGL ist auf diesem Gerät nicht verfügbar.</div>';
  throw e;
}

// Lighting
scene.add(
  new THREE.HemisphereLight(0xa8e9ff, 0x102136, 2.3)
);

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(4, 9, 5);
scene.add(sun);

// Model root
const root = new THREE.Group();
scene.add(root);

// Materials
const mats = {
  cyan: new THREE.MeshStandardMaterial({
    color: 0x42c9f3,
    metalness: 0.35,
    roughness: 0.24,
    emissive: 0x063c58
  }),

  blue: new THREE.MeshStandardMaterial({
    color: 0x245d9c,
    metalness: 0.5,
    roughness: 0.25
  }),

  dark: new THREE.MeshStandardMaterial({
    color: 0x0c2b44,
    metalness: 0.45,
    roughness: 0.4
  }),

  white: new THREE.MeshStandardMaterial({
    color: 0xd9f3ff,
    metalness: 0.2,
    roughness: 0.4
  }),

  gold: new THREE.MeshStandardMaterial({
    color: 0xf8bb67,
    metalness: 0.3,
    roughness: 0.32
  })
};

// Geometry helpers
function box(x, y, z, w, h, d, m = mats.blue) {
  const a = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    m
  );

  a.position.set(x, y, z);
  root.add(a);

  return a;
}

function orb(x, y, z, r = 0.16, m = mats.cyan) {
  const a = new THREE.Mesh(
    new THREE.SphereGeometry(r, 18, 12),
    m
  );

  a.position.set(x, y, z);
  root.add(a);

  return a;
}

function line(a, b, color = 0x56d7ff) {
  const g = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...a),
    new THREE.Vector3(...b)
  ]);

  const l = new THREE.Line(
    g,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.75
    })
  );

  root.add(l);
}

function ring(r, y = 0) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(r, 0.017, 8, 96),
    mats.cyan
  );

  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y;

  root.add(mesh);
}

function ground() {
  box(0, -1.7, 0, 8, 0.08, 6, mats.dark);

  for (let x = -3; x <= 3; x++) {
    line(
      [x, -1.65, -3],
      [x, -1.65, 3],
      0x164d67
    );
  }

  for (let z = -3; z <= 3; z++) {
    line(
      [-4, -1.65, z],
      [4, -1.65, z],
      0x164d67
    );
  }
}

// Five showcase models
const models = {

  // 1. Brand Experience & Messe
  brand() {
    ground();

    box(0, -0.8, -1.5, 6, 1.8, 0.18, mats.blue);

    box(-2.9, -0.2, 0, 0.16, 3, 0.16, mats.white);
    box(2.9, -0.2, 0, 0.16, 3, 0.16, mats.white);

    box(0, 1.25, 0, 6, 0.16, 2.2, mats.cyan);

    box(0, -1.25, 0.3, 3.5, 0.75, 1.3, mats.dark);

    box(-1.65, -0.05, -1.38, 1.2, 1.2, 0.1, mats.cyan);
    box(1.65, -0.05, -1.38, 1.2, 1.2, 0.1, mats.cyan);

    for (const x of [-2, 0, 2]) {
      orb(x, 1.12, 0.8, 0.1, mats.gold);
    }
  },

  // 2. Digital Growth Engine
  growth() {
    ground();

    const pts = [
      [-3, -0.7, 0],
      [-1.5, 0, 0],
      [0, 0.5, 0],
      [1.5, 1, 0],
      [3, 1.5, 0]
    ];

    pts.forEach((p, i) => {
      box(
        p[0],
        -1.1,
        p[2],
        0.8,
        0.2 + i * 0.5,
        0.8,
        i === 4 ? mats.gold : mats.blue
      );

      orb(
        ...p,
        0.25,
        i === 4 ? mats.gold : mats.cyan
      );

      if (i) {
        line(pts[i - 1], p);
      }
    });

    ring(3.4, -1.25);
  },

  // 3. International Scale
  international() {
    ring(2.5, -0.6);

    const points = [];

    for (let i = 0; i < 14; i++) {
      const a = i * 2.4;
      const y = Math.sin(i * 1.7) * 1.5;

      const p = [
        Math.cos(a) * 2.2,
        y,
        Math.sin(a) * 2.2
      ];

      points.push(p);

      orb(
        ...p,
        0.14,
        i % 4 === 0 ? mats.gold : mats.cyan
      );
    }

    points.forEach((p, i) => {
      line(p, points[(i + 5) % points.length]);
    });

    orb(0, 0, 0, 0.65, mats.blue);
  },

  // 4. Digital Product Lab
  product() {
    ground();

    for (let i = 0; i < 5; i++) {
      const p = box(
        (i - 2) * 1.05,
        (i - 2) * 0.3,
        0,
        0.85,
        2.1,
        0.17,
        i % 2 ? mats.blue : mats.cyan
      );

      p.rotation.y = -0.25;

      orb(
        (i - 2) * 1.05,
        (i - 2) * 0.3 + 0.7,
        0.25,
        0.12,
        mats.gold
      );

      if (i) {
        line(
          [(i - 3) * 1.05, (i - 3) * 0.3, 0],
          [(i - 2) * 1.05, (i - 2) * 0.3, 0]
        );
      }
    }
  },

  // 5. Leadership & Transformation
  leadership() {
    ground();

    const levels = [
      [-2.7, -0.7],
      [-1.4, -0.1],
      [0, 0.45],
      [1.4, 0.95],
      [2.7, 1.4]
    ];

    levels.forEach(([x, y], i) => {
      orb(
        x,
        y,
        0,
        0.3,
        i === 4 ? mats.gold : mats.cyan
      );

      box(
        x,
        -1.3,
        0,
        0.09,
        Math.max(0.1, y + 1.3),
        0.09,
        mats.blue
      );

      if (i) {
        line(
          [levels[i - 1][0], levels[i - 1][1], 0],
          [x, y, 0]
        );
      }
    });

    for (let i = 0; i < 4; i++) {
      orb(
        -2 + i * 1.4,
        -1.05,
        1.5,
        0.13,
        mats.white
      );

      line(
        [-2 + i * 1.4, -1.05, 1.5],
        [levels[i][0], levels[i][1], 0]
      );
    }
  }
};

// Showcase data
let moduleName = 'growth';

function setData(d = {}) {
  moduleName = models[d.module]
    ? d.module
    : 'growth';

  // Clear previous geometry
  while (root.children.length) {
    const o = root.children[0];

    root.remove(o);
    o.geometry?.dispose();
  }

  // Build selected model
  models[moduleName]();

  title.textContent =
    d.title || 'Interaktive Showcase-Vorschau';

  meta.textContent =
    [d.company, d.role].filter(Boolean).join(' · ') ||
    'Illustratives 3D-Modul';

  category.textContent = ({
    brand: 'BRAND EXPERIENCE & MESSE',
    growth: 'DIGITAL GROWTH ENGINE',
    international: 'INTERNATIONAL SCALE',
    product: 'DIGITAL PRODUCT LAB',
    leadership: 'LEADERSHIP & TRANSFORMATION'
  })[moduleName];

  // Fixed: valid JavaScript string
  detail.textContent =
    d.visual ||
    'Konzeptmodell.\nReale Projektdaten und Ergebnisse werden ausschließlich aus deiner Case Study übernommen.';
}

// Receive case-study data from Content Studio
window.addEventListener('message', (e) => {
  if (
    e.origin !== location.origin ||
    e.data?.type !== 'beyond-showcase-preview'
  ) {
    return;
  }

  setData(e.data.data);
});

// Initial model
setData();

// Mouse controls
let dragging = false;
let lastX = 0;
let lastY = 0;

let rx = -0.12;
let ry = 0.1;
let distance = 12;

renderer.domElement.addEventListener('pointerdown', (e) => {
  dragging = true;

  lastX = e.clientX;
  lastY = e.clientY;

  renderer.domElement.setPointerCapture(e.pointerId);
});

renderer.domElement.addEventListener('pointerup', () => {
  dragging = false;
});

renderer.domElement.addEventListener('pointermove', (e) => {
  if (!dragging) return;

  ry += (e.clientX - lastX) * 0.006;

  rx = Math.max(
    -0.8,
    Math.min(
      0.8,
      rx + (e.clientY - lastY) * 0.004
    )
  );

  lastX = e.clientX;
  lastY = e.clientY;
});

renderer.domElement.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();

    distance = Math.max(
      7,
      Math.min(
        20,
        distance + e.deltaY * 0.012
      )
    );
  },
  { passive: false }
);

// Responsive canvas
function resize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;

  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();

  renderer.setSize(w, h, false);
}

new ResizeObserver(resize).observe(stage);
resize();

// Animation loop
function animate(t) {
  requestAnimationFrame(animate);

  root.rotation.y =
    ry + Math.sin(t * 0.00022) * 0.07;

  root.rotation.x = rx;

  camera.position.set(0, 3, distance);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);


// Signal to the Content Studio that the scene is ready.
if (window.parent !== window) {
  window.parent.postMessage(
    { type: 'beyond-showcase-ready' },
    window.location.origin
  );
}

