// The home page asks one question all the way down: "One, or two?"
// Every big question is drawn on a canvas so the word that names a condition can carry it:
// "Cloudy" is clouded, "Heavy" has a drooping lid over it, "Gritty" is speckled, "Pressure" is squeezed,
// "nerve" is a broken signal. The cursor is a corrective lens: inside it, every word is treated.
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

const qEls = [...document.querySelectorAll('[data-q]')];
if (!qEls.length || reduce) { document.documentElement.classList.add('q-static'); }

// ---------- hero entrance: the aperture opens on her portrait ----------
if (window.gsap && !reduce && document.querySelector('.aperture')) {
  const tl = gsap.timeline({ delay: .2 });
  tl.fromTo('.aperture__img', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.8, ease: 'expo.inOut' }, .1)
    .fromTo('.aperture__blades', { rotate: 0, scale: 1, opacity: 1 }, { rotate: -75, scale: 1.9, opacity: 0, duration: 1.8, ease: 'expo.inOut', onComplete: () => document.querySelectorAll('.aperture__blades').forEach((s) => s.remove()) }, .1)
    .from('[data-in]', { y: 26, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1 }, .5)
    .fromTo('.aperture figcaption', { opacity: 0 }, { opacity: 1, duration: .8 }, 1.6);
} else { document.querySelectorAll('.aperture__blades').forEach((s) => (s.style.display = 'none')); }
if (!qEls.length || reduce) return;

// ---------- the question stage ----------
const cv = document.createElement('canvas'); cv.className = 'qstage'; cv.setAttribute('aria-hidden', 'true');
document.body.appendChild(cv);
const ctx = cv.getContext('2d');
const buf = document.createElement('canvas'), bctx = buf.getContext('2d');
let W = 0, H = 0, DPR = 1;
const Q = qEls.map((el) => ({
  el, sect: el.closest('section'), cs: 0, click: 0, alpha: el.classList.contains('q--hero') ? 0 : 1, hover: 0,
  words: [...el.querySelectorAll('[data-w]')].map((w) => ({ el: w, text: w.textContent, fx: w.dataset.fx || 'none' }))
}));
function bgOf(el) { let n = el; while (n) { const c = getComputedStyle(n).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c; n = n.parentElement; } return '#fcfaf6'; }
function measure() {
  DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
  for (const c of [cv, buf]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }
  Q.forEach((q) => {
    q.bg = bgOf(q.sect || q.el);
    q.words.forEach((w) => {
      const st = getComputedStyle(w.el);
      w.ink = getComputedStyle(q.el).getPropertyValue('--q-ink').trim() || st.color;
      w.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
      w.size = parseFloat(st.fontSize);
      ctx.font = w.font; const m = ctx.measureText(w.text);
      const r = w.el.getBoundingClientRect();
      const asc = m.fontBoundingBoxAscent || w.size * .9, desc = m.fontBoundingBoxDescent || w.size * .25;
      w.base = (r.height - (asc + desc)) / 2 + asc; w.cap = m.actualBoundingBoxAscent || w.size * .66; w.desc = m.actualBoundingBoxDescent || 0; w.w = m.width;
    });
  });
}
document.documentElement.classList.add('q-gl');
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { measure(); });
measure(); addEventListener('resize', measure);

// ---------- drawing a word with its condition ----------
function word(g, w, x, y, k, t) {
  g.font = w.font; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = w.ink; g.strokeStyle = w.ink;
  if (k < .01 || w.fx === 'none') { g.fillText(w.text, x, y); return; }
  const s = w.size;
  switch (w.fx) {
    case 'blur': case 'cloudy': {
      const r = k * s * (w.fx === 'blur' ? .085 : .07), n = 14;
      g.save();
      if (w.fx === 'cloudy') g.fillStyle = mixInk(w.ink, k);
      g.globalAlpha *= .16;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = r * (i % 2 ? 1 : .5); g.fillText(w.text, x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      g.restore();
      if (w.fx === 'cloudy') { g.save(); g.globalAlpha *= .3 * k; const gr = g.createRadialGradient(x + w.w / 2, y - w.cap / 2, 0, x + w.w / 2, y - w.cap / 2, w.w * .7); gr.addColorStop(0, '#f6efd9'); gr.addColorStop(1, 'rgba(246,239,217,0)'); g.fillStyle = gr; g.fillRect(x - s * .3, y - w.cap - s * .4, w.w + s * .6, w.cap + s * .8); g.restore(); }
      return; }
    case 'lid': {
      g.fillText(w.text, x, y);
      const top = y - w.cap - s * .08, d = k * w.cap * .72, x0 = x - s * .12, x1 = x + w.w + s * .12, lid = [];
      for (let i = 0; i <= 40; i++) { const u = i / 40; lid.push([x0 + u * (x1 - x0), top + d * (.45 + .55 * Math.sin(Math.PI * u))]); }
      g.save(); g.fillStyle = w.bg; g.beginPath(); g.moveTo(x0, top - s * .06); lid.forEach(([a, b]) => g.lineTo(a, b)); g.lineTo(x1, top - s * .06); g.closePath(); g.fill();
      g.lineWidth = Math.max(1.2, s * .012); g.beginPath(); lid.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke();
      g.lineWidth = Math.max(.8, s * .007); g.beginPath();
      for (let i = 2; i < lid.length - 2; i += 2) { const [a, b] = lid[i]; const l = s * .07 * k; g.moveTo(a, b); g.quadraticCurveTo(a - l * .2, b + l * .7, a - l * .55, b + l); }
      g.stroke();
      g.globalAlpha *= .5; g.beginPath(); lid.forEach(([a, b], i) => (i ? g.lineTo(a, b - d * .45 - s * .05) : g.moveTo(a, b - d * .45 - s * .05))); g.stroke();
      g.restore(); return; }
    case 'grit': {
      g.fillText(w.text, x, y);
      const n = Math.round(k * w.w * (w.cap + w.desc) / 55), top = y - w.cap;
      g.save();
      for (let i = 0; i < n; i++) {
        const px = x + hash(i + 1) * w.w, py = top + hash(i + 77) * (w.cap + w.desc + s * .05), r = (.6 + hash(i + 33) * 1.7) * Math.max(1, s / 90);
        g.fillStyle = i % 3 ? w.bg : w.ink; g.globalAlpha = i % 3 ? 1 : .55; g.beginPath(); g.arc(px + Math.sin(t * 3 + i) * .6, py, r, 0, Math.PI * 2); g.fill();
      }
      g.restore(); return; }
    case 'press': {
      g.save(); g.textAlign = 'center';
      g.translate(x + w.w / 2 + Math.sin(t * 50) * k * .9, y); g.scale(1 - .42 * k, 1 + .05 * k);
      g.fillText(w.text, 0, 0);
      g.globalAlpha *= .3 * k; g.lineWidth = 1; g.beginPath(); g.moveTo(-w.w / 2 - s * .1, -w.cap * .5); g.lineTo(-w.w * (.5 - .21 * k) + s * .02, -w.cap * .5); g.moveTo(w.w / 2 + s * .1, -w.cap * .5); g.lineTo(w.w * (.5 - .21 * k) - s * .02, -w.cap * .5); g.stroke();
      g.restore(); return; }
    case 'turn': {
      g.save(); g.translate(x, y); g.rotate(k * .11); g.fillText(w.text, 0, 0); g.restore(); return; }
    case 'drip': {
      g.fillText(w.text, x, y);
      g.save(); g.fillStyle = w.ink;
      for (let i = 0; i < 7; i++) {
        const px = x + (i + .5) / 7 * w.w, ph = (t * .5 + hash(i + 9)) % 1, dy = ph * s * .9 * k, r = s * .03 * (1 - ph * .4);
        g.globalAlpha = k * (1 - ph) * .8; g.beginPath(); g.ellipse(px, y + s * .05 + dy, r * .75, r, 0, 0, Math.PI * 2); g.fill();
      }
      g.restore(); return; }
    case 'nerve': {
      g.save(); g.lineWidth = Math.max(1, s * .012); g.setLineDash([s * .09, s * .07]); g.lineDashOffset = -t * s * .4;
      g.globalAlpha *= Math.min(1, k * 1.4); g.strokeText(w.text, x, y); g.restore();
      g.save(); g.globalAlpha *= 1 - k; g.fillText(w.text, x, y); g.restore(); return; }
    default: g.fillText(w.text, x, y);
  }
}
function mixInk(ink, k) {
  const m = ink.match(/\d+(\.\d+)?/g); if (!m) return ink; const [r, g, b] = m.map(Number), to = [176, 162, 128];
  return `rgb(${Math.round(r + (to[0] - r) * k * .75)},${Math.round(g + (to[1] - g) * k * .75)},${Math.round(b + (to[2] - b) * k * .75)})`;
}
function paint(g, treated, t) {
  g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
  Q.forEach((q) => {
    const r = q.el.getBoundingClientRect(); if (r.bottom < -50 || r.top > H + 50 || q.alpha <= 0) return;
    const fade = q.fade === undefined ? (q.fade = q.el.closest('[data-ask]')) : q.fade;
    g.globalAlpha = q.alpha * (fade ? +fade.style.opacity || (fade.style.opacity === '' ? 1 : 0) : 1);
    q.words.forEach((w) => { const wr = w.el.getBoundingClientRect(); w.bg = q.bg; word(g, w, wr.left, wr.top + w.base, treated ? 0 : 1 - q.cs, t); });
  });
  g.globalAlpha = 1;
}

// ---------- the lens ----------
const L = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, v: 0, R: 0 };
let lastMove = 0;
if (fine) addEventListener('pointermove', (e) => { L.tx = e.clientX; L.ty = e.clientY; lastMove = performance.now(); }, { passive: true });

// tap or click a question to treat it
Q.forEach((q) => q.el.addEventListener('click', () => gsap.to(q, { click: q.click > .5 ? 0 : 1, duration: 1.2, ease: 'power2.inOut' })));
// phones: the hero resolves on its own after a moment
if (!fine) Q.filter((q) => q.el.closest('.ohero, .thero')).forEach((q) => gsap.to(q, { click: 1, duration: 1.6, delay: 2.6, ease: 'power2.inOut' }));
// the hero question writes itself in
const hq = Q.find((q) => q.el.classList.contains('q--hero')); if (hq) gsap.to(hq, { alpha: 1, duration: 1.4, delay: .5, ease: 'power2.out' });

function near(q, x, y, pad) { const r = q.el.getBoundingClientRect(); return x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad; }
function frame(now) {
  const t = now / 1000;
  // how far each question has been read: chapters resolve as the reader moves on
  Q.forEach((q) => {
    let auto = 0;
    if (q.sect && !q.el.classList.contains('q--hero')) {
      const r = q.sect.getBoundingClientRect(), p = (H - r.top) / (r.height + H);
      auto = fine ? clamp((p - .52) / .16) : clamp((p - .28) / .14);
    } else auto = clamp(scrollY / (H * .45));
    // holding the lens over the condition treats it for good
    if (fine && L.v > .6) {
      const w = q.words.find((x) => x.fx !== 'none'); if (w) { const r = w.el.getBoundingClientRect();
        if (L.x > r.left && L.x < r.right && L.y > r.top - 10 && L.y < r.bottom + 10) { q.hover += 1 / 60; if (q.hover > .9 && q.click < 1 && !q.tw) q.tw = gsap.to(q, { click: 1, duration: 1.4, ease: 'power2.inOut' }); } }
    }
    const target = Math.max(auto, q.click);
    q.cs += (target - q.cs) * .07;
  });
  paint(ctx, false, t);
  // lens follows the pointer and appears near a question
  if (fine) {
    L.x += (L.tx - L.x) * .2; L.y += (L.ty - L.y) * .2;
    const want = Q.some((q) => near(q, L.tx, L.ty, 90) && !(q.fade && q.fade.style.opacity !== '' && +q.fade.style.opacity < .3)) && now - lastMove < 4000 ? 1 : 0;
    L.v += (want - L.v) * .12; L.R = 112 * L.v;
    document.documentElement.classList.toggle('lens-on', L.v > .5);
    if (L.R > 2) {
      paint(bctx, true, t);
      ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.beginPath(); ctx.arc(L.x, L.y, L.R, 0, Math.PI * 2); ctx.clip();
      ctx.globalCompositeOperation = 'destination-out'; ctx.fill(); ctx.globalCompositeOperation = 'source-over';
      const m = 1.14; ctx.translate(L.x, L.y); ctx.scale(m, m); ctx.translate(-L.x, -L.y);
      ctx.drawImage(buf, 0, 0, W, H);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const g = ctx.createRadialGradient(L.x - L.R * .3, L.y - L.R * .35, L.R * .1, L.x, L.y, L.R);
      g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(.75, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(61,26,92,.10)');
      ctx.fillStyle = g; ctx.fillRect(L.x - L.R, L.y - L.R, L.R * 2, L.R * 2);
      ctx.restore();
      ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.shadowColor = 'rgba(35,26,43,.22)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
      ctx.lineWidth = 1.6; ctx.strokeStyle = '#ad9562'; ctx.beginPath(); ctx.arc(L.x, L.y, L.R, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowColor = 'transparent'; ctx.lineWidth = .8; ctx.strokeStyle = 'rgba(173,149,98,.55)'; ctx.beginPath(); ctx.arc(L.x, L.y, Math.max(1, L.R - 6), 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(L.x, L.y, Math.max(1, L.R - 11), Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
      ctx.fillStyle = '#ad9562'; ctx.beginPath(); ctx.arc(L.x, L.y, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
