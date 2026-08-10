(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem('mike-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = saved || (prefersDark ? 'dark' : 'light');

  const toggle = document.querySelector('.theme-toggle');
  const updateToggle = () => {
    if (!toggle) return;
    const dark = root.dataset.theme === 'dark';
    toggle.setAttribute('aria-label', dark ? 'Usar tema claro' : 'Usar tema escuro');
    toggle.querySelector('span').textContent = dark ? '☀' : '◐';
  };
  updateToggle();
  toggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mike-theme', root.dataset.theme);
    updateToggle();
  });

  const header = document.querySelector('.site-header');
  const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 18);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  const tocLinks = [...document.querySelectorAll('.case-toc a')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const sections = tocLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const tocObs = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-20% 0px -60% 0px', threshold: [0,.2,.5,1] });
    sections.forEach(s => tocObs.observe(s));
  }
})();
