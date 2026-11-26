// Home hero: the message set huge, with Dr Goawalla standing in front of it.
// The type rises line by line, she comes into focus, and the layers drift apart with the pointer and the scroll.
(() => {
  const root = document.querySelector('[data-hero3]'); if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || reduce) { root.classList.add('is-in'); return; }
  const img = root.querySelector('[data-h3-img]'), cut = root.querySelector('.hero3__cut'), type = root.querySelector('.hero3__type'), ring = root.querySelector('.hero3__ring');
  const start = () => {
    root.classList.add('is-in');
    gsap.timeline()
      .from(root.querySelectorAll('.hero3__l > span'), { yPercent: 112, duration: 1.5, ease: 'expo.out', stagger: .11 }, .1)
      .fromTo(type, { filter: 'blur(14px)' }, { filter: 'blur(0px)', duration: 1.6, ease: 'power2.out' }, .1)
      .fromTo(cut, { yPercent: 9, opacity: 0, filter: 'blur(22px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.9, ease: 'power3.out' }, .45)
      .fromTo(ring.querySelectorAll('circle'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', stagger: .15 }, .7)
      .from(root.querySelectorAll('[data-h3]'), { y: 22, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1 }, 1);
    const st = { trigger: root, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(type, { yPercent: -16, ease: 'none', scrollTrigger: st });
    gsap.to(img, { yPercent: 5, scale: 1.05, ease: 'none', scrollTrigger: st });
    gsap.to(ring, { yPercent: -30, rotate: 40, ease: 'none', scrollTrigger: st });
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const q = (el, k) => [gsap.quickTo(el, 'x', { duration: 1.3, ease: 'power3.out' }), gsap.quickTo(el, 'y', { duration: 1.3, ease: 'power3.out' }), k];
      const layers = [q(root.querySelector('.hero3__type'), 12), q(cut, -20), q(ring, -8)];
      root.addEventListener('pointermove', (e) => { const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5; layers.forEach(([x, y, k]) => { x(dx * k); y(dy * k * .6); }); });
    }
  };
  Promise.all([document.fonts ? document.fonts.ready : 0, img.decode ? img.decode().catch(() => 0) : 0]).then(start);
  setTimeout(() => root.classList.add('is-in'), 4000);
})();
