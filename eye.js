// London Eye Surgeon: the eye-chart hero, the lens simulator and the clinic map.
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ---------- hero: the small print of the eye chart comes into focus as you scroll ----------
const chart = document.querySelector('[data-chart]');
if (chart) {
  const lines = [...chart.querySelectorAll('.chart__line')], hint = chart.querySelector('[data-hint]');
  const BASE = lines.map((_, i) => Math.max(0, i - 2) * 1.5);
  let raf = 0, auto = 0;
  // on phones the chart leaves the screen quickly, so the small print also settles by itself, like eyes adjusting
  if (matchMedia('(max-width: 960px)').matches && !reduce) { const t0 = performance.now() + 900; const tick = (now) => { auto = clamp((now - t0) / 2600); update(); if (auto < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
  const update = () => {
    raf = 0;
    const p = reduce ? 1 : Math.max(clamp(scrollY / (innerHeight * .8)), auto);
    lines.forEach((l, i) => { const start = Math.max(0, i - 3) * .17; l.style.setProperty('--b', (BASE[i] * (1 - clamp((p - start) / .32))).toFixed(2)); });
    if (hint) hint.style.opacity = String(1 - clamp(p * 2));
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}

// ---------- lens simulator ----------
const sim = document.querySelector('[data-sim]');
if (sim) {
  const sc = sim.querySelector('.sim__scene'), far = sc.querySelector('.sim__far'), note = sim.querySelector('[data-sim-note]');
  const LAMPS = [[14.4, 22.2], [73.8, 22.2], [91.9, 22.2]];
  const halos = LAMPS.map(([x, y]) => { const h = document.createElement('i'); h.className = 'halo'; h.style.left = x + '%'; h.style.top = y + '%'; far.appendChild(h); return h; });
  const MODES = {
    cataract: { far: 3.2, mid: 3.4, near: 3.8, haze: .28, tint: .6, glare: [.3, .95], halo: 0, bars: [.25, .3, .3], note: 'A cloudy lens scatters light. Everything softens, colours turn yellow and lights glare. Surgery replaces it with a clear artificial lens.' },
    mono: { far: 0, mid: 2.2, near: 4.2, haze: 0, tint: 0, glare: [0, 0], halo: 0, bars: [.2, .45, 1], note: 'Set for one main distance, usually far. Glasses are usually needed for reading, and often for screens. Night-time haloes are less of an issue than with multifocal designs.' },
    edof: { far: 0, mid: .35, near: 2.4, haze: .04, tint: 0, glare: [0, .12], halo: .35, bars: [.5, .9, 1], note: 'A broader range of focus, particularly distance and screens. Reading glasses may still be needed, and some people notice mild glare or haloes at night.' },
    multi: { far: .3, mid: .6, near: .45, haze: .1, tint: 0, glare: [0, .15], halo: .85, bars: [.85, .8, .9], note: 'Designed to reduce reliance on glasses at more than one distance. Trade-offs can include haloes around lights at night and lower contrast, so suitability needs careful assessment.' } };
  let mode = 'cataract', night = false;
  function apply() {
    const m = MODES[mode], k = sc.clientWidth / 900;
    sc.style.setProperty('--far', m.far * k + 'px'); sc.style.setProperty('--mid', m.mid * k + 'px'); sc.style.setProperty('--near', m.near * k + 'px');
    sc.style.setProperty('--haze', m.haze); sc.style.setProperty('--tint', m.tint); sc.style.setProperty('--glare', m.glare[night ? 1 : 0]);
    sc.classList.toggle('is-night', night); sc.dataset.mode = mode;
    halos.forEach((h) => { const s = (night ? m.halo : 0) * 60 * k; h.style.width = h.style.height = Math.max(0, s) + 'px'; h.style.opacity = night && m.halo ? Math.min(1, m.halo + .1) : 0; });
    ['near', 'mid', 'far'].forEach((d, i) => sim.querySelector(`[data-bar=${d}]`).style.setProperty('--v', m.bars[i]));
    note.textContent = m.note;
    sim.querySelectorAll('[data-mode]').forEach((b) => { if (b.tagName === 'BUTTON') b.setAttribute('aria-checked', String(b.dataset.mode === mode)); });
  }
  sim.querySelectorAll('button[data-mode]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode; apply(); }));
  sim.querySelector('[data-night]').addEventListener('click', (e) => { night = !night; e.currentTarget.setAttribute('aria-pressed', String(night)); apply(); });
  addEventListener('resize', apply); apply();
}

// ---------- clinic map ----------
document.querySelectorAll('[data-map]').forEach((fig) => {
  const svg = fig.querySelector('svg'), NS = 'http://www.w3.org/2000/svg';
  const LON0 = -0.225, LON1 = -0.095, LAT0 = 51.4795, LAT1 = 51.5361;
  const P = (lat, lon) => [((lon - LON0) / (LON1 - LON0)) * 600, ((LAT1 - lat) / (LAT1 - LAT0)) * 420];
  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const THAMES = [[51.4875, -0.2350], [51.4840, -0.2270], [51.4700, -0.2190], [51.4660, -0.2120], [51.4650, -0.1980], [51.4648, -0.1876], [51.4720, -0.1800], [51.4815, -0.1735], [51.4840, -0.1620], [51.4845, -0.1500], [51.4865, -0.1360], [51.4880, -0.1272], [51.4945, -0.1230], [51.5008, -0.1219], [51.5065, -0.1200], [51.5087, -0.1170], [51.5097, -0.1040], [51.5080, -0.0877], [51.5055, -0.0754], [51.5050, -0.0550]].map(([a, b]) => P(a, b));
  let d = `M${THAMES[0]}`; for (let i = 1; i < THAMES.length; i++) { const p0 = THAMES[i - 1], p1 = THAMES[i]; d += ` Q${p0[0]},${p0[1]} ${(p0[0] + p1[0]) / 2},${(p0[1] + p1[1]) / 2}`; } d += ` L${THAMES[THAMES.length - 1]}`;
  const [hx0, hy0] = P(51.5120, -0.1880), [hx1, hy1] = P(51.5020, -0.1520);
  svg.append(el('rect', { class: 'map-park', x: hx0, y: hy0, width: hx1 - hx0, height: hy1 - hy0, rx: 6 }));
  const [rx, ry] = P(51.5290, -0.1570); svg.append(el('ellipse', { class: 'map-park', cx: rx, cy: ry, rx: 34, ry: 24 }));
  svg.append(el('path', { class: 'map-water', d }), el('path', { class: 'map-water-in', d }));
  const lab = (x, y, t) => { const e = el('text', { class: 'map-label', x, y }); e.textContent = t; svg.append(e); };
  lab(hx0 + 8, hy0 + (hy1 - hy0) / 2 + 4, 'Hyde Park'); lab(rx - 44, ry - 32, "Regent's Park"); { const [x, y] = P(51.4900, -0.2150); lab(x, y, 'River Thames'); }
  { const [x, y] = P(51.5033, -0.1196); const g = el('g', { class: 'map-eye' }); g.append(el('circle', { cx: x, cy: y - 11, r: 10 })); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.append(el('line', { x1: x, y1: y - 11, x2: x + Math.cos(a) * 10, y2: y - 11 + Math.sin(a) * 10 })); } svg.append(g); lab(x + 14, y - 8, 'London Eye'); }
  const CL = { cromwell: [51.4946, -0.1925, 'The Cromwell Hospital', 'KENSINGTON', 1], 'london-clinic': [51.5225, -0.1495, 'The London Clinic', 'HARLEY STREET', 1], lips: [51.4818, -0.1445, 'LIPS Healthcare', 'BATTERSEA', 1], 'western-eye': [51.5215, -0.1625, 'Western Eye Hospital', 'MARYLEBONE', -1] };
  const pins = {};
  Object.entries(CL).forEach(([id, [la, lo, name, area, side]]) => {
    const [x, y] = P(la, lo), g = el('g', { class: 'map-pin', 'data-pin': id, tabindex: 0, role: 'link', 'aria-label': name });
    g.append(el('circle', { class: 'ring', cx: x, cy: y, r: 14 }), el('circle', { class: 'dot', cx: x, cy: y, r: 6 }));
    const t1 = el('text', { x: x + 12 * side, y: y - 4, 'text-anchor': side > 0 ? 'start' : 'end' }); t1.textContent = name;
    const t2 = el('text', { class: 'sub', x: x + 12 * side, y: y + 11, 'text-anchor': side > 0 ? 'start' : 'end' }); t2.textContent = area;
    g.append(t1, t2); svg.append(g); pins[id] = g;
  });
  const items = [...document.querySelectorAll('[data-clinics] a, .clinic')];
  const key = (n) => n.dataset.pin || n.id;
  const on = (id) => { Object.entries(pins).forEach(([k, g]) => g.classList.toggle('is-on', k === id)); items.forEach((n) => n.classList.toggle('is-on', key(n) === id)); };
  items.forEach((n) => { n.addEventListener('pointerenter', () => on(key(n))); n.addEventListener('focusin', () => on(key(n))); });
  Object.entries(pins).forEach(([id, g]) => {
    g.addEventListener('pointerenter', () => on(id));
    const go = () => { const a = document.querySelector('a[data-pin="' + id + '"]') || document.querySelector('#' + id + ' h3 a'); if (a) location.href = a.href; else location.href = (document.querySelector('.page-home') ? '' : '../') + 'locations/index.html#' + id; };
    g.addEventListener('click', go); g.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });
  on(fig.dataset.focus && pins[fig.dataset.focus] ? fig.dataset.focus : Object.keys(pins)[0]);
});
})();
