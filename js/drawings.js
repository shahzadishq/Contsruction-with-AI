// Procedural building drawings.
// Every drawing comes in two versions: a blueprint (`bp`, line work)
// and a built version (`bt`, filled colours). The site swaps between them.

export function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const C = {
  glass: '#4F6E8A',
  glassHi: '#86A3BC',
  warm: '#F6D58A',
  yellow: '#F5B700',
  ink: '#1E2227',
  shade: 'rgba(20,24,30,.16)',
};

const BODY = ['#D9D4C9', '#CFC8BB', '#E4DFD5', '#C7C2B8', '#D8CBB6'];
const f = (n) => Math.round(n * 10) / 10;

function dim(x1, y1, x2, y2, label, vertical) {
  // Architectural dimension line with end ticks and a label.
  let s = `<line class="bp-dim" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" pathLength="1"/>`;
  if (vertical) {
    s += `<line class="bp-dim" x1="${f(x1 - 5)}" y1="${f(y1)}" x2="${f(x1 + 5)}" y2="${f(y1)}"/>`;
    s += `<line class="bp-dim" x1="${f(x2 - 5)}" y1="${f(y2)}" x2="${f(x2 + 5)}" y2="${f(y2)}"/>`;
    const cy = (y1 + y2) / 2;
    s += `<text class="bp-text" x="${f(x1 - 7)}" y="${f(cy)}" transform="rotate(-90 ${f(x1 - 7)} ${f(cy)})" text-anchor="middle">${label}</text>`;
  } else {
    s += `<line class="bp-dim" x1="${f(x1)}" y1="${f(y1 - 5)}" x2="${f(x1)}" y2="${f(y1 + 5)}"/>`;
    s += `<line class="bp-dim" x1="${f(x2)}" y1="${f(y2 - 5)}" x2="${f(x2)}" y2="${f(y2 + 5)}"/>`;
    s += `<text class="bp-text" x="${f((x1 + x2) / 2)}" y="${f(y1 + 16)}" text-anchor="middle">${label}</text>`;
  }
  return s;
}

function tanks(x, top, w, r, bp) {
  // Karachi rooftops: water tanks on every roof.
  let s = '';
  const n = 1 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const tx = x + w * (0.15 + r() * 0.6);
    const tw = 12 + r() * 8;
    const th = 10 + r() * 6;
    s += bp
      ? `<rect class="bp-thin" x="${f(tx)}" y="${f(top - th - 6)}" width="${f(tw)}" height="${f(th)}" rx="3" pathLength="1"/>`
      : `<rect x="${f(tx)}" y="${f(top - th - 6)}" width="${f(tw)}" height="${f(th)}" rx="3" fill="${r() < 0.5 ? '#2B3138' : '#3C5A78'}"/><rect x="${f(tx + 2)}" y="${f(top - 6)}" width="${f(tw - 4)}" height="6" fill="#5A6068"/>`;
  }
  return s;
}

export function building(o) {
  const { x, base, w, floors, fh = 30, type = 'tower', seed = 1, frameFrom = Infinity } = o;
  const r = rng(seed);
  const h = floors * fh;
  const top = base - h;
  const body = BODY[Math.floor(r() * BODY.length)];
  let bp = '';
  let bt = '';

  // Outline
  bp += `<rect class="bp" x="${x}" y="${top}" width="${w}" height="${h}" pathLength="1"/>`;

  const done = Math.min(floors, frameFrom); // floors finished with facade
  const doneTop = base - done * fh;
  bt += `<rect x="${x}" y="${f(doneTop)}" width="${w}" height="${f(done * fh)}" fill="${body}"/>`;
  bt += `<rect x="${f(x + w * 0.84)}" y="${f(doneTop)}" width="${f(w * 0.16)}" height="${f(done * fh)}" fill="${C.shade}"/>`;

  // Floor slabs
  for (let i = 1; i < floors; i++) {
    const y = base - i * fh;
    bp += `<line class="bp-thin" x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" pathLength="1"/>`;
    if (i <= done) bt += `<rect x="${x}" y="${y - 1}" width="${w}" height="2.5" fill="rgba(0,0,0,.10)"/>`;
  }

  // Windows / facade
  if (type === 'office') {
    const pad = 8;
    const mull = Math.max(3, Math.round(w / 24));
    const gx = x + pad, gw = w - pad * 2;
    bt += `<rect x="${gx}" y="${f(doneTop + 6)}" width="${gw}" height="${f(done * fh - fh)}" fill="${C.glass}"/>`;
    bt += `<polygon points="${gx},${f(doneTop + 6)} ${f(gx + gw * 0.45)},${f(doneTop + 6)} ${gx},${f(doneTop + 6 + (done * fh - fh) * 0.7)}" fill="${C.glassHi}" opacity=".35"/>`;
    for (let i = 1; i < mull; i++) {
      const mx = gx + (gw / mull) * i;
      bp += `<line class="bp-thin" x1="${f(mx)}" y1="${top + 6}" x2="${f(mx)}" y2="${base - fh}" pathLength="1"/>`;
      bt += `<rect x="${f(mx - 0.8)}" y="${f(doneTop + 6)}" width="1.6" height="${f(done * fh - fh)}" fill="rgba(230,236,244,.55)"/>`;
    }
    for (let i = 1; i < done; i++) {
      if (r() < 0.25) {
        const c = Math.floor(r() * mull);
        bt += `<rect x="${f(gx + (gw / mull) * c + 1)}" y="${f(base - (i + 1) * fh + 2)}" width="${f(gw / mull - 2)}" height="${fh - 4}" fill="${C.warm}" opacity=".85"/>`;
      }
    }
  } else {
    const cols = Math.max(2, Math.round(w / 34));
    const cw = (w - 16) / cols;
    const ww = cw * (type === 'house' ? 0.62 : 0.5);
    const wh = fh * (type === 'house' ? 0.48 : 0.46);
    for (let i = 0; i < floors; i++) {
      const fy = base - (i + 1) * fh;
      for (let c = 0; c < cols; c++) {
        const wx = x + 8 + c * cw + (cw - ww) / 2;
        const wy = fy + (fh - wh) / 2 - 1;
        if (i === 0 && c === Math.floor(cols / 2)) {
          // entrance
          bp += `<rect class="bp-thin" x="${f(wx)}" y="${f(base - fh * 0.78)}" width="${f(ww)}" height="${f(fh * 0.78)}" pathLength="1"/>`;
          if (i < done) bt += `<rect x="${f(wx)}" y="${f(base - fh * 0.78)}" width="${f(ww)}" height="${f(fh * 0.78)}" fill="${C.ink}"/>`;
          continue;
        }
        bp += `<rect class="bp-thin" x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" pathLength="1"/>`;
        if (i < done) {
          const lit = r() < 0.16;
          bt += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" fill="${lit ? C.warm : C.glass}"/>`;
          if (!lit) bt += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww * 0.4)}" height="${f(wh)}" fill="${C.glassHi}" opacity=".35"/>`;
          if (type === 'house') bt += `<rect x="${f(wx - 3)}" y="${f(wy + wh)}" width="${f(ww + 6)}" height="3" fill="rgba(0,0,0,.25)"/>`;
        }
      }
      // balconies on towers
      if (type === 'tower' && i > 0 && i % 2 === 0 && i < done) {
        bt += `<rect x="${f(x - 4)}" y="${f(fy + fh - 4)}" width="${f(w * 0.35)}" height="4" fill="#B5AFA4"/>`;
      }
    }
  }

  // Under construction: bare concrete frame above `frameFrom`
  if (frameFrom < floors) {
    const cols = Math.max(3, Math.round(w / 40));
    for (let i = done; i < floors; i++) {
      const y = base - (i + 1) * fh;
      bt += `<rect x="${x}" y="${f(y)}" width="${w}" height="5" fill="#9C978E"/>`;
      for (let c = 0; c <= cols; c++) {
        bt += `<rect x="${f(x + (w - 6) * (c / cols))}" y="${f(y)}" width="6" height="${fh}" fill="#A9A49A"/>`;
      }
    }
    // rebar sticking out
    for (let c = 0; c <= cols; c++) {
      bt += `<rect x="${f(x + 2 + (w - 6) * (c / cols))}" y="${f(top - 10)}" width="1.5" height="10" fill="#7A3E22"/>`;
    }
  }

  // Roof
  if (frameFrom >= floors) {
    bt += `<rect x="${x - 3}" y="${top - 6}" width="${w + 6}" height="6" fill="#B8B2A7"/>`;
    bt += tanks(x, top, w, rng(seed + 7), false);
    bp += tanks(x, top, w, rng(seed + 7), true);
  }

  if (type === 'house') {
    // boundary wall and gate, the most Karachi detail there is
    const bx = x - 22, bw = w + 44, bh = 26;
    bp += `<rect class="bp-thin" x="${bx}" y="${base - bh}" width="${bw}" height="${bh}" pathLength="1"/>`;
    bt += `<rect x="${bx}" y="${base - bh}" width="${bw}" height="${bh}" fill="#E8E2D6"/>`;
    bt += `<rect x="${bx}" y="${base - bh - 3}" width="${bw}" height="3" fill="#A65A36"/>`;
    bt += `<rect x="${f(bx + bw * 0.62)}" y="${base - bh + 3}" width="${f(bw * 0.22)}" height="${bh - 3}" fill="#2B3138"/>`;
    bt += `<rect x="${f(bx + bw * 0.62)}" y="${base - bh + 3}" width="${f(bw * 0.22)}" height="2" fill="${C.yellow}"/>`;
  }

  // Dimension line
  bp += dim(x - 14, top, x - 14, base, `${(floors * 3.2).toFixed(1)} m`, true);

  return { bp, bt, top };
}

export function crane(x, base, height, jib, seed = 3) {
  const top = base - height;
  let bp = '';
  let bt = '';
  const mw = 14;
  // mast
  bp += `<rect class="bp" x="${x}" y="${top}" width="${mw}" height="${height}" pathLength="1"/>`;
  bt += `<rect x="${x}" y="${top}" width="2.4" height="${height}" fill="${C.yellow}"/><rect x="${x + mw - 2.4}" y="${top}" width="2.4" height="${height}" fill="${C.yellow}"/>`;
  for (let y = top; y < base; y += 16) {
    bp += `<line class="bp-thin" x1="${x}" y1="${y}" x2="${x + mw}" y2="${y + 16}" pathLength="1"/>`;
    bt += `<line x1="${x}" y1="${y}" x2="${x + mw}" y2="${y + 16}" stroke="${C.yellow}" stroke-width="1.6"/>`;
  }
  // jib + counter jib
  const jy = top - 4;
  bp += `<rect class="bp" x="${x - jib * 0.3}" y="${jy - 10}" width="${jib * 1.3}" height="10" pathLength="1"/>`;
  bt += `<rect x="${x - jib * 0.3}" y="${jy - 10}" width="${jib * 1.3}" height="2.4" fill="${C.yellow}"/><rect x="${x - jib * 0.3}" y="${jy - 2.4}" width="${jib * 1.3}" height="2.4" fill="${C.yellow}"/>`;
  for (let i = x - jib * 0.3; i < x + jib; i += 14) {
    bt += `<line x1="${f(i)}" y1="${jy}" x2="${f(i + 7)}" y2="${jy - 10}" stroke="${C.yellow}" stroke-width="1.4"/><line x1="${f(i + 7)}" y1="${jy - 10}" x2="${f(i + 14)}" y2="${jy}" stroke="${C.yellow}" stroke-width="1.4"/>`;
  }
  // apex + ties
  bp += `<line class="bp-thin" x1="${x + mw / 2}" y1="${jy - 40}" x2="${x + jib}" y2="${jy - 10}" pathLength="1"/><line class="bp-thin" x1="${x + mw / 2}" y1="${jy - 40}" x2="${x - jib * 0.3}" y2="${jy - 10}" pathLength="1"/>`;
  bt += `<polygon points="${x},${jy - 10} ${x + mw / 2},${jy - 40} ${x + mw},${jy - 10}" fill="none" stroke="${C.yellow}" stroke-width="2"/>`;
  bt += `<line x1="${x + mw / 2}" y1="${jy - 40}" x2="${x + jib}" y2="${jy - 10}" stroke="${C.ink}" stroke-width="1"/><line x1="${x + mw / 2}" y1="${jy - 40}" x2="${x - jib * 0.3}" y2="${jy - 10}" stroke="${C.ink}" stroke-width="1"/>`;
  // counterweight + cab
  bt += `<rect x="${x - jib * 0.3}" y="${jy}" width="26" height="16" fill="#3A4048"/>`;
  bt += `<rect x="${x + mw}" y="${jy}" width="14" height="12" fill="#3A4048"/><rect x="${x + mw + 3}" y="${jy + 3}" width="8" height="5" fill="${C.glassHi}"/>`;
  // hook
  const hx = x + jib * 0.72;
  const hy = jy + height * 0.35;
  bp += `<line class="bp-thin" x1="${hx}" y1="${jy}" x2="${hx}" y2="${hy}" pathLength="1"/>`;
  bt += `<line x1="${hx}" y1="${jy}" x2="${hx}" y2="${hy}" stroke="${C.ink}" stroke-width="1"/><rect x="${hx - 22}" y="${hy}" width="44" height="7" fill="#7A3E22"/>`;
  return { bp, bt };
}

export function bridge(x, base, w, seed = 5) {
  const r = rng(seed);
  let bp = '';
  let bt = '';
  const deckY = base - 70;
  const spans = 3;
  const sw = w / spans;
  bp += `<rect class="bp" x="${x}" y="${deckY}" width="${w}" height="12" pathLength="1"/>`;
  bt += `<rect x="${x}" y="${deckY}" width="${w}" height="12" fill="#C9C3B8"/><rect x="${x}" y="${deckY + 12}" width="${w}" height="4" fill="rgba(0,0,0,.2)"/>`;
  bt += `<rect x="${x}" y="${deckY - 6}" width="${w}" height="3" fill="#8B939C"/>`;
  for (let i = 0; i <= spans; i++) {
    const px = x + sw * i - (i === spans ? 18 : 0);
    if (i > 0 && i < spans) {
      bp += `<rect class="bp" x="${f(px - 9)}" y="${deckY + 12}" width="18" height="${base - deckY - 12}" pathLength="1"/>`;
      bt += `<rect x="${f(px - 9)}" y="${deckY + 12}" width="18" height="${base - deckY - 12}" fill="#B9B3A8"/><rect x="${f(px + 3)}" y="${deckY + 12}" width="6" height="${base - deckY - 12}" fill="${C.shade}"/>`;
    }
  }
  for (let i = 0; i < spans; i++) {
    const ax = x + sw * i;
    bp += `<path class="bp-thin" d="M${f(ax + 10)} ${deckY + 12} Q ${f(ax + sw / 2)} ${deckY + 60} ${f(ax + sw - 10)} ${deckY + 12}" fill="none" pathLength="1"/>`;
  }
  // lamp posts + cars
  for (let i = 0; i < 6; i++) {
    const lx = x + 20 + (w - 40) * (i / 5);
    bt += `<rect x="${f(lx)}" y="${deckY - 26}" width="2" height="20" fill="#5A6068"/><rect x="${f(lx - 3)}" y="${deckY - 28}" width="8" height="3" fill="${C.warm}"/>`;
  }
  for (let i = 0; i < 3; i++) {
    const cx = x + 30 + r() * (w - 80);
    bt += `<rect x="${f(cx)}" y="${deckY - 12}" width="26" height="9" rx="3" fill="${['#A65A36', '#2B3138', C.yellow][i]}"/>`;
  }
  bp += dim(x, base + 10, x + w, base + 10, '1.4 km', false);
  // water
  bt += `<rect x="${x - 40}" y="${base - 8}" width="${w + 80}" height="30" fill="#5E7F93" opacity=".55"/>`;
  return { bp, bt };
}

export function grid(w, h, step = 40) {
  let s = '';
  for (let x = 0; x <= w; x += step) s += `<line class="bp-grid" x1="${x}" y1="0" x2="${x}" y2="${h}"/>`;
  for (let y = 0; y <= h; y += step) s += `<line class="bp-grid" x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
  return s;
}
