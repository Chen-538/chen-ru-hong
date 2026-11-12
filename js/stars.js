// 23:59 章節：捷運夜景照片轉成星點，捲進來時聚合，滑鼠靠近會推開
import * as THREE from '../vendor/three.module.min.js';

const VERT = `
attribute vec3 aTarget;
attribute vec3 aScatter;
attribute vec3 aColor;
attribute float aSeed;
uniform float uForm;
uniform float uTime;
uniform vec2 uMouse;
uniform float uSize;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float t = smoothstep(0.0, 1.0, clamp(uForm * 1.25 - aSeed * 0.25, 0.0, 1.0));
  vec3 p = mix(aScatter, aTarget, t);
  p.xy += vec2(sin(uTime * 0.5 + aSeed * 40.0), cos(uTime * 0.4 + aSeed * 30.0)) * (1.2 + 6.0 * (1.0 - t));
  vec2 d = p.xy - uMouse;
  float dist = length(d);
  if (dist > 0.001) p.xy += d / dist * max(0.0, 80.0 - dist) * 0.8;
  vColor = aColor;
  vAlpha = (0.55 + 0.45 * sin(uTime * 1.4 + aSeed * 60.0)) * (0.35 + 0.65 * t);
  gl_PointSize = uSize * (0.7 + 0.6 * fract(aSeed * 7.0));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const FRAG = `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  gl_FragColor = vec4(vColor, (1.0 - r * 2.0) * vAlpha);
}`;

function loadImage(src) {
  return new Promise((ok, bad) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = () => bad(new Error('stars: 圖片載入失敗 ' + src));
    im.src = src;
  });
}

export default async function stars(section, canvas, gsap) {
  const img = await loadImage('assets/img/me-mrt.webp');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const uniforms = {
    uForm: { value: 0 }, uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(9999, 9999) }, uSize: { value: 2.4 }
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, uniforms,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  let points = null, w = 0, h = 0;

  function build() {
    w = section.clientWidth; h = section.clientHeight;
    renderer.setSize(w, h, false);
    camera.left = -w / 2; camera.right = w / 2; camera.top = h / 2; camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    const narrow = w < 800;
    const sw = narrow ? 96 : 150, sh = Math.round(sw * img.height / img.width);
    const c = document.createElement('canvas');
    c.width = sw; c.height = sh;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, sw, sh);
    const px = ctx.getImageData(0, 0, sw, sh).data;
    const fitH = h * (narrow ? 0.7 : 0.86);
    const step = fitH / sh;
    const ox = narrow ? 0 : w * 0.25;
    const target = [], scatter = [], color = [], seed = [];
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const i = (y * sw + x) * 4;
        const r = px[i] / 255, g = px[i + 1] / 255, b = px[i + 2] / 255;
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const ex = Math.min(x, sw - 1 - x) / (sw * 0.18), ey = Math.min(y, sh - 1 - y) / (sh * 0.12);
        if (lum < 0.3 || Math.random() > Math.min(1, ex, ey)) continue;
        target.push(ox + (x - sw / 2 + Math.random() - 0.5) * step, (sh / 2 - y + Math.random() - 0.5) * step, 0);
        const a = Math.random() * Math.PI * 2, d = (0.6 + Math.random() * 0.8) * Math.max(w, h) * 0.6;
        scatter.push(Math.cos(a) * d, Math.sin(a) * d, 0);
        color.push(Math.min(1, r * 1.5), Math.min(1, g * 1.4), Math.min(1, b * 1.3));
        seed.push(Math.random());
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(target, 3));
    geo.setAttribute('aTarget', new THREE.Float32BufferAttribute(target, 3));
    geo.setAttribute('aScatter', new THREE.Float32BufferAttribute(scatter, 3));
    geo.setAttribute('aColor', new THREE.Float32BufferAttribute(color, 3));
    geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
    if (points) { scene.remove(points); points.geometry.dispose(); }
    points = new THREE.Points(geo, material);
    scene.add(points);
    uniforms.uSize.value = step * 1.35 * renderer.getPixelRatio();
  }
  build();

  gsap.to(uniforms.uForm, {
    value: 1, ease: 'none',
    scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 15%', scrub: 0.8 }
  });

  section.addEventListener('pointermove', e => {
    const r = section.getBoundingClientRect();
    uniforms.uMouse.value.set(e.clientX - r.left - w / 2, h / 2 - (e.clientY - r.top));
  });
  section.addEventListener('pointerleave', () => uniforms.uMouse.value.set(9999, 9999));

  let visible = false, raf = 0, timer = 0;
  const clock = new THREE.Clock();
  const loop = () => {
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    raf = visible ? requestAnimationFrame(loop) : 0;
  };
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  }).observe(section);
  addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(build, 200); });
  return points.geometry.getAttribute('aTarget').count;
}
