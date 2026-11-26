// Motion shared by every page: smooth scrolling, lines that rise into place, gentle parallax.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || reduce) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
    // in-page links glide instead of jumping
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return;
      const el = document.querySelector(a.getAttribute('href')); if (!el) return;
      e.preventDefault(); lenis.scrollTo(el, { offset: -80, duration: 1.6 });
    });
    document.querySelectorAll('dialog').forEach((d) => { new MutationObserver(() => (d.open ? lenis.stop() : lenis.start())).observe(d, { attributes: true, attributeFilter: ['open'] }); });
  }
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(() => {
    // paragraphs and headings marked data-split rise line by line
    document.querySelectorAll('[data-split]').forEach((el) => {
      const s = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
      gsap.from(s.lines, { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    // page headings on inner pages
    document.querySelectorAll('.phero h1, .phero .lead').forEach((el, i) => {
      const s = new SplitText(el, { type: 'lines', mask: 'lines' });
      gsap.from(s.lines, { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: .09, delay: .15 + i * .15 });
    });
    document.querySelectorAll('[data-par]').forEach((el) => {
      gsap.fromTo(el, { yPercent: -+el.dataset.par }, { yPercent: +el.dataset.par, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    ScrollTrigger.refresh();
  });
})();
