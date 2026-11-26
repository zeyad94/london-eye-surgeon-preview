// Shared behaviour on every page: menu and dialogs, header state, entrances, treatment search.
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const menu = document.querySelector('#mobile-menu');
const trigger = document.querySelector('[data-menu]');
function release() { document.body.classList.remove('locked'); trigger?.setAttribute('aria-expanded', 'false'); }
trigger?.addEventListener('click', () => { menu.showModal(); document.body.classList.add('locked'); trigger.setAttribute('aria-expanded', 'true'); });
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach((d) => {
  d.addEventListener('close', release);
  d.addEventListener('click', (e) => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } });
});
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.close()));
document.querySelectorAll('[data-dialog]').forEach((b) => b.addEventListener('click', () => { document.getElementById(b.dataset.dialog).showModal(); document.body.classList.add('locked'); }));

// header: light over the dark hero, solid once the page moves on; mobile booking bar after the first screen
const header = document.querySelector('[data-header]');
const hero = document.querySelector('[data-hero]');
const mcta = document.querySelector('.mobile-cta');
if (header && !hero) header.classList.remove('is-dark');
function onScroll() {
  const y = scrollY;
  if (header && header.classList.contains('is-dark') && !hero) header.classList.toggle('is-solid', y > 10);
  if (header && hero && !document.querySelector('[data-phx]') && y > hero.offsetHeight - 80) header.classList.add('is-solid');
  mcta?.classList.toggle('is-on', y > innerHeight * (hero ? 2.2 : 0.6));
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// entrances: content is visible without JS; with JS, blocks rise in once as they arrive
if ('IntersectionObserver' in window && !reduce) {
  const targets = document.querySelectorAll('.meet__text>*, .meet__photo, .anat__list li, .clinics__list li, .cred__row li, details, .treat, .clinic, .fees__list li, .facts div, .approach__text p, .book__lines a, .prose>*');
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  targets.forEach((t, i) => { if (t.getBoundingClientRect().top > innerHeight) { t.classList.add('rv'); t.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(t); } });
}

// treatments hub: search across every treatment page
const tq = document.querySelector('[data-tq]');
if (tq) {
  const cards = [...document.querySelectorAll('.tcard')], groups = [...document.querySelectorAll('.hubg')];
  const count = document.querySelector('[data-tcount]');
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const ALIAS = 'cloudy lens glasses droopy hooded bags baggy lump cyst bump stye gritty sore tears watering glaucoma pressure misty nerve double vision';
  function run() {
    const terms = norm(tq.value).split(' ').filter(Boolean); let n = 0;
    cards.forEach((c) => { const hay = norm(c.dataset.search + ' ' + c.textContent); const show = terms.every((t) => hay.includes(t)); c.parentElement.hidden = !show; if (show) n++; });
    groups.forEach((g) => { g.hidden = !g.querySelector('li:not([hidden])'); });
    count.textContent = terms.length ? (n ? `${n} treatment${n === 1 ? '' : 's'}` : 'Nothing found. Try “cataract”, “eyelid” or “dry eye”.') : '';
  }
  tq.addEventListener('input', run);
  const q = new URLSearchParams(location.search).get('q'); if (q) { tq.value = q.slice(0, 100); run(); }
}

// clinic picker: where you are coming from decides which clinic, and which secretary, to call
document.querySelectorAll('[data-picker]').forEach((pk) => {
  const data = JSON.parse(pk.querySelector('[data-picker-data]').textContent), res = pk.querySelector('[data-picker-res]');
  pk.querySelectorAll('[data-area]').forEach((b) => b.addEventListener('click', () => {
    pk.querySelectorAll('[data-area]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    const list = data[b.dataset.area];
    res.innerHTML = list.map((c) => `<div class="picker__hit"><div><b>${c.name}</b><span>${c.area} · <a href="${c.url}">Clinic page</a></span></div><a class="btn btn--sm" href="tel:${c.tel}">Call ${c.pa} · ${c.ph}</a></div>`).join('');
    if (window.gsap && !reduce) gsap.from(res.children, { y: 14, opacity: 0, duration: .6, stagger: .08, ease: 'expo.out' });
  }));
});

// reviews slider: native horizontal scroll, buttons step one card
document.querySelectorAll('[data-prv]').forEach((rv) => {
  const tr = rv.querySelector('.prv__track');
  const step = () => { const c = tr.querySelector('.prv__card'); return c ? c.getBoundingClientRect().width + 20 : 300; };
  rv.querySelector('[data-prv-prev]').addEventListener('click', () => tr.scrollBy({ left: -step(), behavior: 'smooth' }));
  rv.querySelector('[data-prv-next]').addEventListener('click', () => {
    const end = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4;
    tr.scrollTo({ left: end ? 0 : tr.scrollLeft + step(), behavior: 'smooth' });
  });
});

// referral upload: show the chosen file; on the static preview (no WordPress nonce) explain instead of posting
document.querySelectorAll('[data-refup]').forEach((f) => {
  const file = f.querySelector('[data-refup-file]'), name = f.querySelector('[data-refup-name]'), msg = f.querySelector('[data-refup-msg]');
  file.addEventListener('change', () => {
    const x = file.files[0];
    if (!x) return;
    if (x.size > 10 * 1024 * 1024) { msg.textContent = 'That file is over 10 MB. Please email it to PA@londoneyesurgeon.uk instead.'; file.value = ''; return; }
    name.textContent = x.name; f.querySelector('.refup__drop').classList.add('is-set'); msg.textContent = '';
  });
  f.addEventListener('submit', (e) => {
    if (!f.querySelector('[name=les_referral_nonce]')) { e.preventDefault(); msg.textContent = 'Preview only: on the live website this sends the letter to PA@londoneyesurgeon.uk.'; }
  });
  const st = new URLSearchParams(location.search).get('referral');
  const T = { sent: 'Thank you. The referral letter has been sent to Dr Goawalla’s secretary.', large: 'That file is over 10 MB. Please email it to PA@londoneyesurgeon.uk instead.', type: 'Please upload a PDF, Word document or photo.', error: 'Sorry, the letter could not be sent. Please email it to PA@londoneyesurgeon.uk.' };
  if (st && T[st]) { msg.textContent = T[st]; f.scrollIntoView({ block: 'center' }); }
});
