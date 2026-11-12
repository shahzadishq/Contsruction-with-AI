// Illustrated scenes for the "Life on site" carousel (800 x 600).
// Replace any of them with a real photo by setting `photo` in SLIDES (main.js).
import { building, crane, grid } from './drawings.js';

function hat(x, y, s, color, stripe = '#DFE4EA') {
  // simple side-view hard hat at (x,y) = centre of brim, scale s
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="6" rx="118" ry="14" fill="rgba(0,0,0,.25)"/>
    <path d="M-80 0 A80 78 0 0 1 80 0 Z" fill="${color}"/>
    <path d="M-80 0 A80 78 0 0 1 80 0 Z" fill="url(#hat-shade)"/>
    <path d="M-8 -77 Q0 -80 8 -77 L10 0 L-10 0 Z" fill="rgba(255,255,255,.18)"/>
    <rect x="-80" y="-22" width="160" height="12" fill="${stripe}" opacity=".9"/>
    <path d="M-112 0 Q0 -14 112 0 Q118 8 104 10 L-104 10 Q-118 8 -112 0Z" fill="${color}"/>
    <path d="M-104 10 L104 10 Q118 8 112 0 Q60 4 0 4 Q-60 4 -112 0 Q-118 8 -104 10Z" fill="rgba(0,0,0,.18)"/>
    <ellipse cx="-30" cy="-48" rx="22" ry="10" fill="#fff" opacity=".28" transform="rotate(-28 -30 -48)"/>
  </g>`;
}

const DEFS = `<defs>
  <linearGradient id="hat-shade" x1="0" y1="0" x2="1" y2="0"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
  <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E4A73"/><stop offset=".6" stop-color="#C98B5E"/><stop offset="1" stop-color="#F0C27A"/></linearGradient>
  <linearGradient id="day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FB0CC"/><stop offset="1" stop-color="#E9DCC4"/></linearGradient>
  <pattern id="hazard" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="20" height="40" fill="#1E2227"/><rect x="20" width="20" height="40" fill="#F5B700"/></pattern>
</defs>`;

const wrap = (body) => `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${DEFS}${body}</svg>`;

export const SCENES = {
  // Hard hats lined up on a bench, hazard stripe on the wall
  safety: () => wrap(`
    <rect width="800" height="600" fill="#B9B4AA"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="0" y="${i * 46}" width="800" height="2" fill="rgba(0,0,0,.06)"/>`).join('')}
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${i * 120 + (i % 2) * 60}" y="0" width="2" height="420" fill="rgba(0,0,0,.05)"/>`).join('')}
    <rect y="120" width="800" height="36" fill="url(#hazard)"/>
    <rect y="420" width="800" height="180" fill="#6B4A2E"/><rect y="420" width="800" height="14" fill="#8A6142"/>
    ${hat(175, 420, 0.95, '#F5B700')}
    ${hat(400, 420, 1.15, '#F2F0EA')}
    ${hat(628, 420, 0.95, '#E8692C')}
  `),

  // Blueprint, scale ruler and pencil on a site table
  training: () => wrap(`
    <rect width="800" height="600" fill="#5B4632"/>
    <g transform="rotate(-6 400 300)">
      <rect x="110" y="70" width="600" height="440" fill="#13294B"/>
      <g opacity=".9">${grid(600, 440, 30).replace(/x1="(\d+)"/g, (m, a) => `x1="${+a + 110}"`).replace(/x2="(\d+)"/g, (m, a) => `x2="${+a + 110}"`).replace(/y1="(\d+)"/g, (m, a) => `y1="${+a + 70}"`).replace(/y2="(\d+)"/g, (m, a) => `y2="${+a + 70}"`)}</g>
      <g>${building({ x: 240, base: 470, w: 150, floors: 9, fh: 38, type: 'tower', seed: 61 }).bp}${building({ x: 450, base: 470, w: 150, floors: 6, fh: 38, type: 'office', seed: 62 }).bp}</g>
      <line class="bp" x1="140" y1="470" x2="680" y2="470"/>
    </g>
    <g transform="rotate(14 560 470)"><rect x="380" y="455" width="360" height="34" fill="#F2F0EA"/>${Array.from({ length: 36 }, (_, i) => `<rect x="${384 + i * 10}" y="455" width="1.5" height="${i % 5 ? 9 : 16}" fill="#1E2227"/>`).join('')}</g>
    <g transform="rotate(-30 200 520)"><rect x="90" y="510" width="220" height="16" fill="#F5B700"/><polygon points="310,510 340,518 310,526" fill="#E9C9A0"/><rect x="80" y="510" width="12" height="16" fill="#C0392B"/></g>
  `),

  // Concrete cube tests on a lab shelf
  quality: () => wrap(`
    <rect width="800" height="600" fill="#DAD7D0"/>
    <rect y="360" width="800" height="18" fill="#8B939C"/><rect y="378" width="800" height="222" fill="#C9C5BC"/>
    ${[110, 260, 410, 560].map((x, i) => `
      <rect x="${x}" y="${250 - (i % 2) * 6}" width="120" height="${110 + (i % 2) * 6}" fill="#A9A49A"/>
      <polygon points="${x},${250 - (i % 2) * 6} ${x + 26},${226 - (i % 2) * 6} ${x + 146},${226 - (i % 2) * 6} ${x + 120},${250 - (i % 2) * 6}" fill="#C2BDB3"/>
      <polygon points="${x + 120},${250 - (i % 2) * 6} ${x + 146},${226 - (i % 2) * 6} ${x + 146},${336} ${x + 120},360" fill="#8E897F"/>
      ${Array.from({ length: 6 }, (_, k) => `<circle cx="${x + 15 + ((k * 37) % 95)}" cy="${270 + ((k * 23) % 75)}" r="${1.5 + (k % 3)}" fill="#8E897F"/>`).join('')}
      <rect x="${x + 22}" y="${290}" width="76" height="30" fill="#F2F0EA"/><text x="${x + 60}" y="311" text-anchor="middle" font-family="Public Sans, sans-serif" font-weight="700" font-size="15" fill="#1E2227">${['28 day', '7 day', '28 day', '14 day'][i]}</text>
    `).join('')}
    <rect x="80" y="430" width="640" height="90" rx="6" fill="#F2F0EA"/>
    <text x="110" y="470" font-family="Public Sans, sans-serif" font-size="20" font-weight="700" fill="#1E2227">Pour 46, Level 9 slab</text>
    <text x="110" y="500" font-family="Public Sans, sans-serif" font-size="18" fill="#3E454E">Target 35 MPa  ·  Result 38.2 MPa</text>
    <rect x="600" y="450" width="90" height="50" rx="25" fill="#5E7D4B"/><text x="645" y="482" text-anchor="middle" font-family="Public Sans, sans-serif" font-weight="800" font-size="18" fill="#fff">Pass</text>
  `),

  // Karachi skyline at dusk with a crane
  community: () => {
    const B = 520;
    const p = [
      building({ x: 40, base: B, w: 140, floors: 7, fh: 34, type: 'tower', seed: 71 }),
      building({ x: 210, base: B, w: 180, floors: 4, fh: 34, type: 'office', seed: 72 }),
      building({ x: 420, base: B, w: 150, floors: 11, fh: 34, type: 'tower', seed: 73, frameFrom: 8 }),
      crane(600, B, 430, 160),
      building({ x: 640, base: B, w: 140, floors: 5, fh: 34, type: 'tower', seed: 74 }),
    ];
    return wrap(`
      <rect width="800" height="600" fill="url(#dusk)"/>
      <circle cx="620" cy="300" r="60" fill="#F7D9A0" opacity=".85"/>
      ${p.map((x) => x.bt).join('')}
      <rect y="${B}" width="800" height="80" fill="#2B3138"/>
      ${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 90}" y="${B + 36}" width="46" height="5" fill="#F5B700"/>`).join('')}
    `);
  },

  // Drone survey over a site plan
  tech: () => wrap(`
    <rect width="800" height="600" fill="url(#day)"/>
    <polygon points="0,600 120,330 680,330 800,600" fill="#B7A27E"/>
    <polygon points="160,560 230,370 570,370 640,560" fill="none" stroke="#F5B700" stroke-width="4" stroke-dasharray="14 10"/>
    ${[0, 1, 2, 3].map((i) => `<polygon points="${250 + i * 70},520 ${282 + i * 50},400 ${322 + i * 50},400 ${300 + i * 70},520" fill="#8E897F" opacity="${0.5 + i * 0.1}"/>`).join('')}
    <g transform="translate(400 170)">
      <polygon points="-150,40 150,40 260,330 -260,330" fill="#F5B700" opacity=".14"/>
      <rect x="-60" y="-12" width="120" height="24" rx="10" fill="#2B3138"/>
      <rect x="-20" y="12" width="40" height="18" rx="5" fill="#1E2227"/><circle cx="0" cy="34" r="8" fill="#4F6E8A"/>
      ${[-110, 110].map((x) => `<rect x="${x > 0 ? 60 : x}" y="-4" width="50" height="8" fill="#2B3138"/><ellipse cx="${x}" cy="-14" rx="46" ry="5" fill="#1E2227" opacity=".6"/><rect x="${x - 3}" y="-14" width="6" height="12" fill="#2B3138"/>`).join('')}
      <circle cx="-40" cy="0" r="3" fill="#F5B700"/>
    </g>
  `),
};
