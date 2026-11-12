import { building, crane, bridge, grid } from './drawings.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Hero: blueprint skyline with a cursor that reveals the built city   */
/* ------------------------------------------------------------------ */
function buildHero() {
  const BASE = 860;
  const parts = [
    building({ x: 40, base: BASE, w: 180, floors: 2, fh: 40, type: 'house', seed: 11 }),
    building({ x: 280, base: BASE, w: 170, floors: 4, fh: 28, type: 'office', seed: 8 }),
    building({ x: 490, base: BASE, w: 140, floors: 6, fh: 28, type: 'tower', seed: 4 }),
    building({ x: 690, base: BASE, w: 170, floors: 13, fh: 28, type: 'tower', seed: 21, frameFrom: 9 }),
    crane(890, BASE, 500, 230),
    building({ x: 960, base: BASE, w: 130, floors: 9, fh: 28, type: 'tower', seed: 17 }),
    building({ x: 1130, base: BASE, w: 200, floors: 11, fh: 28, type: 'office', seed: 13 }),
    building({ x: 1385, base: BASE, w: 170, floors: 2, fh: 40, type: 'house', seed: 29 }),
  ];
  const ground = `<line class="bp" x1="0" y1="${BASE}" x2="1600" y2="${BASE}" pathLength="1"/>`;
  document.getElementById('hero-grid').innerHTML = grid(1600, 900, 40);
  const bp = document.getElementById('hero-bp');
  bp.innerHTML = ground + parts.map((p) => p.bp).join('');
  document.getElementById('hero-built').innerHTML =
    `<rect width="1600" height="900" fill="url(#sky)"/>` +
    `<circle cx="1180" cy="300" r="70" fill="#F7E3B5" opacity=".9"/>` +
    parts.map((p) => p.bt).join('') +
    `<rect y="${BASE}" width="1600" height="40" fill="#3A3F46"/>` +
    Array.from({ length: 20 }, (_, i) => `<rect x="${i * 84}" y="${BASE + 18}" width="44" height="4" fill="#F5B700"/>`).join('');

  // stagger the line drawing on load
  bp.querySelectorAll('[pathLength]').forEach((el, i) => { el.classList.add('dr'); el.style.setProperty('--d', `${(i % 60) * 12}ms`); });
  requestAnimationFrame(() => document.querySelector('.hero').classList.add('is-drawn'));
}

function blobs() {
  const svg = document.getElementById('hero-site');
  const host = document.getElementById('blobs');
  const N = 14;
  const pts = Array.from({ length: N }, () => ({ x: 800, y: 600 }));
  const circles = pts.map(() => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    host.appendChild(c);
    return c;
  });
  const target = { x: 1100, y: 560 };
  let lastMove = -1e9;
  let speed = 0;
  let visible = true;
  const pt = svg.createSVGPoint();

  svg.closest('.hero').addEventListener('pointermove', (e) => {
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    target.x = p.x;
    target.y = p.y;
    lastMove = performance.now();
  }, { passive: true });

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(svg);

  let prev = { x: pts[0].x, y: pts[0].y };
  let size = reduced ? 1 : 0;
  function tick(now) {
    requestAnimationFrame(tick);
    if (!visible) return;
    const idle = now - lastMove > 2500;
    if (idle && !reduced) {
      // wander on its own so touch users and first-time visitors see the effect
      const t = now / 1000;
      target.x = 800 + Math.sin(t * 0.45) * 520;
      target.y = 640 + Math.sin(t * 0.9) * 120;
    }
    pts[0].x += (target.x - pts[0].x) * (reduced ? 1 : 0.2);
    pts[0].y += (target.y - pts[0].y) * (reduced ? 1 : 0.2);
    for (let i = 1; i < N; i++) {
      pts[i].x += (pts[i - 1].x - pts[i].x) * 0.38;
      pts[i].y += (pts[i - 1].y - pts[i].y) * 0.38;
    }
    const v = Math.hypot(pts[0].x - prev.x, pts[0].y - prev.y);
    prev = { x: pts[0].x, y: pts[0].y };
    speed += (v - speed) * 0.1;
    size += (1 - size) * 0.03; // grows in after load
    const base = (120 + Math.min(speed * 2.2, 80)) * size;
    for (let i = 0; i < N; i++) {
      circles[i].setAttribute('cx', pts[i].x.toFixed(1));
      circles[i].setAttribute('cy', pts[i].y.toFixed(1));
      circles[i].setAttribute('r', (base * (1 - (i / N) * 0.8)).toFixed(1));
    }
  }
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ */
/* 3D hard hat                                                         */
/* ------------------------------------------------------------------ */
async function hat() {
  const canvas = document.getElementById('hat');
  try {
    const { initHat } = await import('./hero3d.js');
    const state = initHat(canvas, { reduced });
    if (!gsap) { state.drop = 0; state.spin = 0; return; }
    if (!reduced) {
      gsap.to(state, { drop: 0, duration: 1.6, ease: 'bounce.out', delay: 0.5 });
      gsap.to(state, { spin: 0, duration: 2.2, ease: 'power3.out', delay: 0.4 });
    }
    if (ScrollTrigger) {
      gsap.to(state, {
        scroll: 1, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  } catch (err) {
    console.warn('3D hat unavailable:', err);
    canvas.remove();
  }
}

/* ------------------------------------------------------------------ */
/* Process: tower that builds itself as you scroll                     */
/* ------------------------------------------------------------------ */
function buildTower() {
  const svg = document.getElementById('tower');
  const G = 600; // ground line
  const X = 170, W = 210, FL = 11, FH = 38;
  let s = '';
  s += `<g class="bp-grid-wrap">${grid(520, 720, 26)}</g>`;

  // 1 survey
  s += `<g id="st-survey">`;
  s += `<rect class="bp-survey" x="${X - 20}" y="${G - 8}" width="${W + 40}" height="16" pathLength="1"/>`;
  for (let i = 0; i <= 6; i++) {
    const px = X - 20 + ((W + 40) / 6) * i;
    s += `<line class="bp" x1="${px}" y1="${G - 14}" x2="${px}" y2="${G + 6}" pathLength="1"/><circle cx="${px}" cy="${G - 16}" r="3" fill="#F5B700"/>`;
  }
  s += `<g transform="translate(70 ${G})"><line class="bp" x1="0" y1="0" x2="-14" y2="-44" pathLength="1"/><line class="bp" x1="0" y1="0" x2="14" y2="-44" pathLength="1"/><line class="bp" x1="-22" y1="0" x2="0" y2="-44" pathLength="1"/><rect x="-14" y="-58" width="28" height="14" fill="#F5B700"/></g>`;
  s += `</g>`;

  // ground
  s += `<rect x="0" y="${G}" width="520" height="120" fill="#0F2240"/><line class="bp" x1="0" y1="${G}" x2="520" y2="${G}"/>`;

  // 2 foundation
  s += `<g id="st-found">`;
  for (let i = 0; i <= 6; i++) {
    const px = X + 6 + ((W - 22) / 6) * i;
    s += `<rect class="pile" x="${px}" y="${G + 10}" width="10" height="90" fill="#8E8A83"/>`;
  }
  s += `<rect class="raft" x="${X - 10}" y="${G - 4}" width="${W + 20}" height="16" fill="#A9A49A"/></g>`;

  // 3 structure, 4 facade (per floor)
  let frames = '', facades = '';
  const cols = 5;
  for (let i = 0; i < FL; i++) {
    const y = G - (i + 1) * FH;
    let fr = `<rect x="${X}" y="${y}" width="${W}" height="6" fill="#B9B4AA"/>`;
    for (let c = 0; c <= cols; c++) fr += `<rect x="${X + (W - 8) * (c / cols)}" y="${y}" width="8" height="${FH}" fill="#C7C2B8"/>`;
    frames += `<g class="floor">${fr}</g>`;
    let fa = `<rect x="${X}" y="${y}" width="${W}" height="${FH}" fill="#D9D4C9"/><rect x="${X + W * 0.84}" y="${y}" width="${W * 0.16}" height="${FH}" fill="rgba(20,24,30,.16)"/>`;
    for (let c = 0; c < cols; c++) {
      const wx = X + 10 + c * ((W - 20) / cols) + 6;
      const ww = (W - 20) / cols - 12;
      const lit = (i * 7 + c * 3) % 11 === 0;
      if (i === 0 && c === 2) { fa += `<rect x="${wx}" y="${y + 8}" width="${ww}" height="${FH - 8}" fill="#1E2227"/>`; continue; }
      fa += `<rect x="${wx}" y="${y + 9}" width="${ww}" height="${FH - 18}" fill="${lit ? '#F6D58A' : '#4F6E8A'}"/>`;
    }
    fa += `<rect x="${X}" y="${y + FH - 2}" width="${W}" height="2.5" fill="rgba(0,0,0,.12)"/>`;
    facades += `<g class="facade">${fa}</g>`;
  }
  s += `<g id="st-frames">${frames}</g><g id="st-facade">${facades}</g>`;

  // crane
  const cr = crane(410, G, 500, 200);
  s += `<g id="st-crane"><g transform="translate(834 0) scale(-1 1)">${cr.bt}</g></g>`;

  // 5 handover
  const topY = G - FL * FH;
  s += `<g id="st-hand">`;
  s += `<rect x="${X - 4}" y="${topY - 8}" width="${W + 8}" height="8" fill="#B8B2A7"/>`;
  s += `<rect x="${X + 30}" y="${topY - 26}" width="22" height="18" rx="3" fill="#2B3138"/><rect x="${X + 60}" y="${topY - 24}" width="18" height="16" rx="3" fill="#3C5A78"/>`;
  s += `<line x1="${X + W - 30}" y1="${topY - 8}" x2="${X + W - 30}" y2="${topY - 70}" stroke="#E6ECF4" stroke-width="2"/><path d="M${X + W - 30} ${topY - 70} h40 l-10 10 l10 10 h-40z" fill="#F5B700"/>`;
  for (let i = 0; i < 4; i++) {
    const tx = 40 + i * 120 + (i > 1 ? 40 : 0);
    if (tx > X - 30 && tx < X + W + 30) continue;
    s += `<rect x="${tx - 2}" y="${G - 26}" width="4" height="26" fill="#6B4A2E"/><circle cx="${tx}" cy="${G - 36}" r="18" fill="#5E7D4B"/>`;
  }
  s += `<path d="M${X + 70} ${G - 30} q35 14 70 0" stroke="#C0392B" stroke-width="5" fill="none"/>`;
  s += `</g>`;
  svg.innerHTML = s;
}

function processAnim() {
  const steps = [...document.querySelectorAll('.steps__item')];
  const setStep = (n) => steps.forEach((el, i) => {
    el.classList.toggle('is-active', i === n);
    el.classList.toggle('is-done', i < n);
  });

  if (!gsap || !ScrollTrigger || reduced) {
    document.querySelector('.process').classList.add('is-static');
    steps.forEach((el) => el.classList.add('is-active'));
    return;
  }

  const floors = gsap.utils.toArray('#st-frames .floor');
  const facades = gsap.utils.toArray('#st-facade .facade');
  gsap.set('#st-found .pile', { scaleY: 0, transformOrigin: '50% 0%' });
  gsap.set('#st-found .raft', { scaleX: 0, transformOrigin: '50% 50%' });
  gsap.set(floors, { scaleY: 0, transformOrigin: '50% 100%', transformBox: 'fill-box' });
  gsap.set(facades, { opacity: 0 });
  gsap.set('#st-crane', { opacity: 0, y: 40 });
  gsap.set('#st-hand', { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.addLabel('found', 1)
    .to('#st-survey', { opacity: 0.35, duration: 1 }, 'found')
    .to('#st-found .pile', { scaleY: 1, stagger: 0.12, duration: 0.6 }, 'found')
    .to('#st-found .raft', { scaleX: 1, duration: 0.6 }, 'found+=0.8')
    .addLabel('structure', 2.2)
    .to('#st-crane', { opacity: 1, y: 0, duration: 0.5 }, 'structure')
    .to(floors, { scaleY: 1, stagger: 0.2, duration: 0.3 }, 'structure')
    .addLabel('finish', 4.6)
    .to(facades, { opacity: 1, stagger: 0.12, duration: 0.3 }, 'finish')
    .addLabel('hand', 6.3)
    .to('#st-crane', { opacity: 0, x: 120, duration: 0.6 }, 'hand')
    .to('#st-hand', { opacity: 1, duration: 0.6 }, 'hand+=0.3')
    .to({}, { duration: 0.4 });

  const marks = [0, tl.labels.found, tl.labels.structure, tl.labels.finish, tl.labels.hand].map((t) => t / tl.duration());
  let current = 0;
  ScrollTrigger.create({
    trigger: '.process',
    start: 'top top',
    end: () => `+=${window.innerHeight * 3}`,
    pin: '.process__pin',
    scrub: 0.6,
    animation: tl,
    onUpdate(self) {
      let n = 0;
      marks.forEach((m, i) => { if (self.progress >= m - 0.001) n = i; });
      if (n !== current) { current = n; setStep(n); }
    },
  });
}

/* ------------------------------------------------------------------ */
/* Services art + project hall of fame                                 */
/* ------------------------------------------------------------------ */
function services() {
  document.querySelectorAll('[data-draw]').forEach((svg) => {
    const t = svg.dataset.draw;
    const p = t === 'house'
      ? building({ x: 110, base: 236, w: 180, floors: 2, fh: 50, type: 'house', seed: 41 })
      : building({ x: 125, base: 236, w: 150, floors: 6, fh: 32, type: 'office', seed: 43 });
    svg.innerHTML = t === 'house'
      ? `${p.bt}<rect y="236" width="400" height="24" fill="#3A3F46"/>`
      : `${grid(400, 260, 20)}<line class="bp" x1="0" y1="236" x2="400" y2="236"/>${p.bp}`;
  });
}

const PROJECTS = [
  { year: 2026, items: [
    { name: 'Clifton Heights, Block B', place: 'Clifton', meta: '18 floors, 220 apartments', draw: { kind: 'tower', floors: 7, seed: 101 } },
    { name: 'Faisal Trade Centre', place: 'Shahrah-e-Faisal', meta: 'Offices, 9 floors', draw: { kind: 'office', floors: 6, seed: 102 } },
    { name: 'Sea View Villas', place: 'DHA Phase 8', meta: '24 family homes', draw: { kind: 'house', seed: 103 } },
  ] },
  { year: 2025, items: [
    { name: 'Korangi Creek Link Road', place: 'Korangi', meta: '1.4 km road and bridge', draw: { kind: 'bridge', seed: 104 } },
    { name: 'Gulshan Medical Centre', place: 'Gulshan-e-Iqbal', meta: 'Hospital, 120 beds', draw: { kind: 'office', floors: 4, wide: true, seed: 105 } },
    { name: 'Rahman Residence', place: 'Bahria Town', meta: '500 sq yd house', draw: { kind: 'house', seed: 106 } },
  ] },
  { year: 2024, items: [
    { name: 'Saddar Commerce Tower', place: 'Saddar', meta: '14 floors, mixed use', draw: { kind: 'tower', floors: 7, seed: 107 } },
    { name: 'Nazimabad Grammar School', place: 'North Nazimabad', meta: '32 classrooms', draw: { kind: 'office', floors: 3, wide: true, seed: 108 } },
  ] },
];

function projectSVG(d) {
  const B = 262;
  if (d.kind === 'bridge') return bridge(40, B, 320, d.seed);
  if (d.kind === 'house') return building({ x: 120, base: B, w: 160, floors: 2, fh: 46, type: 'house', seed: d.seed });
  if (d.kind === 'office') {
    return d.wide
      ? building({ x: 70, base: B, w: 260, floors: d.floors, fh: 36, type: 'office', seed: d.seed })
      : building({ x: 120, base: B, w: 160, floors: d.floors, fh: 32, type: 'office', seed: d.seed });
  }
  return building({ x: 135, base: B, w: 130, floors: d.floors, fh: 29, type: 'tower', seed: d.seed });
}

function projects() {
  const host = document.getElementById('project-years');
  host.innerHTML = PROJECTS.map((y) => `
    <section class="year" aria-labelledby="y-${y.year}">
      <h3 class="year__label" id="y-${y.year}">${y.year}</h3>
      <ul class="tiles">
        ${y.items.map((p) => {
          const d = projectSVG(p.draw);
          return `<li>
            <article class="tile" tabindex="0" aria-label="${p.name}, ${p.place}">
              <div class="tile__art" aria-hidden="true">
                <svg class="tile__bp" viewBox="0 0 400 300">${grid(400, 300, 20)}<line class="bp" x1="0" y1="262" x2="400" y2="262"/>${d.bp}</svg>
                <svg class="tile__built" viewBox="0 0 400 300"><rect width="400" height="300" fill="url(#tile-sky)"/>${d.bt}<rect y="262" width="400" height="38" fill="#3A3F46"/></svg>
              </div>
              <h4 class="tile__name">${p.name}</h4>
              <p class="tile__meta">${p.place}. ${p.meta}</p>
            </article>
          </li>`;
        }).join('')}
      </ul>
    </section>`).join('');
  // tap / Enter toggles the built view (touch screens have no hover)
  const toggle = (t) => t && t.classList.toggle('is-on');
  host.addEventListener('click', (e) => toggle(e.target.closest('.tile')));
  host.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e.target.closest('.tile')); }
  });
  // shared gradient for all tiles
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.setAttribute('aria-hidden', 'true');
  defs.style.position = 'absolute';
  defs.innerHTML = '<defs><linearGradient id="tile-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9BB3C9"/><stop offset="1" stop-color="#E9DCC4"/></linearGradient></defs>';
  document.body.prepend(defs);
}

/* ------------------------------------------------------------------ */
/* Safety board, nav, form                                             */
/* ------------------------------------------------------------------ */
function safety() {
  const el = document.getElementById('days');
  const days = Math.floor((Date.now() - new Date('2023-02-14T00:00:00+05:00')) / 864e5);
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  if (!gsap || !ScrollTrigger || reduced) { el.textContent = fmt(days); return; }
  const o = { n: 0 };
  ScrollTrigger.create({
    trigger: '.board', start: 'top 75%', once: true,
    onEnter: () => gsap.to(o, { n: days, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.n); } }),
  });
}

function nav() {
  const navEl = document.getElementById('nav');
  const onScroll = () => navEl.classList.toggle('is-solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const btn = navEl.querySelector('.nav__menu');
  const menu = document.getElementById('mobile-menu');
  const set = (open) => { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; btn.textContent = open ? 'Close' : 'Menu'; };
  btn.addEventListener('click', () => set(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });

  // service cards preselect the form
  document.querySelectorAll('.svc[data-type]').forEach((a) => a.addEventListener('click', () => {
    document.getElementById('f-type').value = a.dataset.type;
  }));
  document.getElementById('year').textContent = new Date().getFullYear();
}

function form() {
  const f = document.getElementById('quote-form');
  const done = document.getElementById('form-done');
  const check = (input, errId, ok) => {
    const err = document.getElementById(errId);
    err.hidden = ok;
    input.setAttribute('aria-invalid', String(!ok));
    if (!ok) input.setAttribute('aria-describedby', errId); else input.removeAttribute('aria-describedby');
    return ok;
  };
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = f.elements.name, phone = f.elements.phone;
    const okName = check(name, 'e-name', name.value.trim().length > 1);
    const okPhone = check(phone, 'e-phone', phone.value.replace(/\D/g, '').length >= 10);
    if (!okName) { name.focus(); return; }
    if (!okPhone) { phone.focus(); return; }
    // No backend yet: connect this to Formspree, EmailJS or your own API.
    done.textContent = `Request sent. We'll call ${name.value.trim().split(' ')[0]} within one working day.`;
    done.hidden = false;
    f.reset();
  });
}

/* ------------------------------------------------------------------ */
function intro() {
  if (!gsap || reduced) return;
  gsap.from('.hero__line', { yPercent: 105, duration: 1.1, ease: 'power4.out', stagger: 0.12, delay: 0.15 });
  gsap.from(['.hero__lede', '.hero__actions', '.handover'], { opacity: 0, y: 16, duration: 0.8, ease: 'power2.out', stagger: 0.1, delay: 0.7 });
}

buildHero();
blobs();
buildTower();
services();
projects();
nav();
form();
intro();
processAnim();
safety();
hat();
