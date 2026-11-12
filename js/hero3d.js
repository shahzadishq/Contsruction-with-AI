// 3D safety hard hat, built from Three.js primitives (no model file needed).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';

export function initHat(canvas, { reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.6, 7);
  camera.lookAt(0, 0.15, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const key = new THREE.DirectionalLight(0xfff1d6, 2.2);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fc0ff, 1.6);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const yellow = new THREE.MeshPhysicalMaterial({
    color: 0xf0a800, roughness: 0.38, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, side: THREE.DoubleSide,
  });
  const steel = new THREE.MeshStandardMaterial({ color: 0xdfe4ea, metalness: 1, roughness: 0.22 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x23272d, roughness: 0.8 });

  const hat = new THREE.Group();
  const SY = 0.92, SZ = 1.18; // ellipsoid proportions of the shell

  // Shell: upper half of a stretched sphere
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2), yellow);
  shell.scale.set(1, SY, SZ);
  hat.add(shell);

  // Ridges running front to back
  const ridge = (xOff, tube) => {
    const rad = Math.sqrt(1 - xOff * xOff);
    const m = new THREE.Mesh(new THREE.TorusGeometry(rad, tube, 16, 96, Math.PI), yellow);
    m.rotation.y = Math.PI / 2;
    const g = new THREE.Group();
    g.add(m);
    g.position.x = xOff;
    g.scale.set(1, SY, SZ);
    return g;
  };
  hat.add(ridge(0, 0.075), ridge(0.34, 0.045), ridge(-0.34, 0.045));

  // Brim: elliptical ring, longer at the front (peak)
  const outer = new THREE.Shape();
  outer.absellipse(0, 0.2, 1.24, 1.58, 0, Math.PI * 2, false, 0);
  const hole = new THREE.Path();
  hole.absellipse(0, 0, 0.97, 0.97 * SZ, 0, Math.PI * 2, true, 0);
  outer.holes.push(hole);
  const brimGeo = new THREE.ExtrudeGeometry(outer, {
    depth: 0.03, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 4, curveSegments: 96,
  });
  const brim = new THREE.Mesh(brimGeo, yellow);
  brim.rotation.x = Math.PI / 2;
  brim.position.y = 0.04;
  hat.add(brim);

  // Reflective safety band
  const yb = 0.11, yt = 0.25;
  const rB = Math.sqrt(1 - (yb / SY) ** 2) + 0.006;
  const rT = Math.sqrt(1 - (yt / SY) ** 2) + 0.006;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, yt - yb, 96, 1, true), steel);
  band.scale.z = SZ;
  band.position.y = (yb + yt) / 2;
  hat.add(band);

  // Inner suspension harness
  const harness = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.045, 12, 64), dark);
  harness.rotation.x = Math.PI / 2;
  harness.scale.y = SZ;
  harness.position.y = 0.02;
  hat.add(harness);

  // Soft contact shadow
  const sc = document.createElement('canvas');
  sc.width = sc.height = 128;
  const ctx = sc.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 3.6),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.85;
  scene.add(shadow);

  const pivot = new THREE.Group();
  pivot.add(hat);
  scene.add(pivot);
  hat.rotation.x = 0.28;

  // State driven from outside (GSAP / pointer / scroll)
  const state = { drop: reduced ? 0 : 3.2, spin: reduced ? 0 : -Math.PI * 2, scroll: 0 };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const t0 = performance.now();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const t = (performance.now() - t0) / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    const float = reduced ? 0 : Math.sin(t * 1.4) * 0.06;
    pivot.position.y = state.drop + float;
    pivot.rotation.y = state.spin + mouse.x * 0.7 + state.scroll * Math.PI;
    pivot.rotation.x = mouse.y * 0.25 + state.scroll * 0.5;
    pivot.rotation.z = -mouse.x * 0.08;
    const s = 1 - state.scroll * 0.35;
    pivot.scale.setScalar(s);
    shadow.material.opacity = Math.max(0, 1 - state.drop * 0.4) * (0.8 - float * 2);
    shadow.scale.setScalar(1 - float * 0.8);
    renderer.render(scene, camera);
  });

  return state;
}
