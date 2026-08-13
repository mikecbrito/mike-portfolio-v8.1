(() => {
  const root = document.documentElement;

  const pageKey = (() => {
    const path = window.location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
    if (path.includes('/cases/survey-builder')) return 'survey-builder';
    if (path.includes('/cases/design-system')) return 'design-system';
    if (path.includes('/cases/processamento-de-dados')) return 'processamento';
    if (path.includes('/cases/ia-questionarios')) return 'ia-questionarios';
    return 'home';
  })();

  const translationFiles = {
    home: ['home.json'],
    'survey-builder': ['survey-builder-1.json', 'survey-builder-2.json'],
    'design-system': ['design-system.json'],
    processamento: ['processamento-1.json'],
    'ia-questionarios': ['ia-questionarios.json']
  };

  const copyFiles = {
    home: ['copy-core.json'],
    'survey-builder': ['copy-core.json', 'copy-survey.json'],
    'design-system': ['copy-core.json'],
    processamento: ['copy-core.json'],
    'ia-questionarios': ['copy-core.json']
  };

  const pageTitles = {
    home: { pt: 'Mike Brito | Product Designer', en: 'Mike Brito | Product Designer' },
    'survey-builder': { pt: 'Survey Builder Proprietário | Mike Brito', en: 'Proprietary Survey Builder | Mike Brito' },
    'design-system': { pt: 'Design System | Mike Brito', en: 'Design System | Mike Brito' },
    processamento: { pt: 'Processamento de Dados | Mike Brito', en: 'Data Processing | Mike Brito' },
    'ia-questionarios': { pt: 'IA na Criação de Questionários | Mike Brito', en: 'AI-assisted Survey Creation | Mike Brito' }
  };

  const loadJson = async (file) => {
    try {
      const response = await fetch(`/i18n/${file}`, { cache: 'no-store' });
      if (!response.ok) return {};
      return await response.json();
    } catch (_) { return {}; }
  };

  const loadMaps = async (files) => Object.assign({}, ...(await Promise.all(files.map(loadJson))));

  const walkTextNodes = (callback) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(callback);
  };

  const replaceTextNode = (node, next) => {
    const current = node.nodeValue;
    const trimmed = current.trim();
    const start = current.indexOf(trimmed);
    const prefix = start >= 0 ? current.slice(0, start) : '';
    const suffix = start >= 0 ? current.slice(start + trimmed.length) : '';
    node.nodeValue = `${prefix}${next}${suffix}`;
  };

  const controlsStyle = document.createElement('style');
  controlsStyle.textContent = `
    .site-controls{display:flex;align-items:center;gap:7px;margin-left:4px}
    .switch-control,.theme-toggle{display:inline-flex!important;align-items:center!important;gap:8px!important;width:auto!important;height:40px!important;padding:4px 9px!important;border:1px solid var(--line)!important;border-radius:999px!important;background:var(--surface)!important;color:var(--fg)!important;font:inherit!important;font-size:12px!important;font-weight:750!important;cursor:pointer!important}
    .switch-control:hover,.theme-toggle:hover{background:var(--soft)!important}
    .theme-icon{display:grid;place-items:center;width:18px;height:18px;font-size:16px;line-height:1;flex:none;transition:transform .2s ease}
    .theme-toggle:hover .theme-icon{transform:rotate(10deg)}
    .switch-track{position:relative;width:34px;height:20px;border-radius:999px;background:var(--line);flex:none;transition:background .2s ease}
    .switch-thumb{position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:var(--surface);box-shadow:0 1px 4px rgba(0,0,0,.2);transition:transform .2s ease,background .2s ease}
    .switch-control[aria-pressed="true"] .switch-track,.theme-toggle[aria-pressed="true"] .switch-track{background:var(--fg)}
    .switch-control[aria-pressed="true"] .switch-thumb,.theme-toggle[aria-pressed="true"] .switch-thumb{transform:translateX(14px);background:var(--bg)}
    .switch-label{min-width:28px;text-align:left;line-height:1}
    .language-toggle .switch-label{min-width:18px}
    @media(max-width:760px){.nav{gap:10px}.nav-links{gap:2px}.nav-links>a{display:none}.site-controls{gap:5px}.switch-control,.theme-toggle{padding:4px 7px!important}.brand{width:96px}}
  `;
  document.head.appendChild(controlsStyle);

  const savedTheme = localStorage.getItem('mike-theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = savedTheme || (prefersDark ? 'dark' : 'light');

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.innerHTML = '<span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span><span class="theme-icon" aria-hidden="true"></span>';
    themeToggle.setAttribute('role', 'switch');
  }

  const languageToggle = document.createElement('button');
  languageToggle.className = 'switch-control language-toggle';
  languageToggle.type = 'button';
  languageToggle.setAttribute('role', 'switch');
  languageToggle.innerHTML = '<span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span><span class="switch-label">PT</span>';

  if (themeToggle?.parentElement) {
    const controls = document.createElement('div');
    controls.className = 'site-controls';
    themeToggle.parentElement.insertBefore(controls, themeToggle);
    controls.append(themeToggle, languageToggle);
  }

  let language = localStorage.getItem('mike-language') || 'pt';
  let originalText = new WeakMap();
  let translations = {};
  let copyMap = {};

  const updateControls = () => {
    const dark = root.dataset.theme === 'dark';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', language === 'en' ? (dark ? 'Use light theme' : 'Use dark theme') : (dark ? 'Usar tema claro' : 'Usar tema escuro'));
      const icon = themeToggle.querySelector('.theme-icon');
      if (icon) icon.textContent = dark ? '☾' : '☀';
    }
    languageToggle.setAttribute('aria-pressed', String(language === 'en'));
    languageToggle.setAttribute('aria-label', language === 'en' ? 'Mudar idioma para português' : 'Switch language to English');
    const langLabel = languageToggle.querySelector('.switch-label');
    if (langLabel) langLabel.textContent = language === 'en' ? 'EN' : 'PT';
  };

  const applyLanguage = (next) => {
    language = next;
    root.lang = language === 'en' ? 'en' : 'pt-BR';
    root.dataset.language = language;
    document.title = pageTitles[pageKey]?.[language] || document.title;

    walkTextNodes((node) => {
      const original = originalText.get(node);
      if (original === undefined) return;
      node.nodeValue = original;
      const raw = original.trim();
      const ptText = copyMap[raw] || raw;
      const target = language === 'en'
        ? (translations[ptText] || translations[raw] || ptText)
        : ptText;
      if (target !== raw) replaceTextNode(node, target);
    });

    document.querySelectorAll('[aria-label]').forEach((el) => {
      if (!el.dataset.originalAria) el.dataset.originalAria = el.getAttribute('aria-label') || '';
      const value = el.dataset.originalAria;
      if (language === 'en') {
        const ariaMap = {
          'Navegação principal': 'Main navigation',
          'Índice do case': 'Case table of contents',
          'Mike Brito, início': 'Mike Brito, home',
          'Destaques do projeto': 'Project highlights',
          'Fluxo de reconciliação de dependências': 'Dependency reconciliation flow',
          'Etapas da prova de conceito': 'Proof of concept steps',
          'Fluxo de criação assistida por inteligência artificial': 'AI-assisted survey creation flow'
        };
        el.setAttribute('aria-label', ariaMap[value] || value);
      } else el.setAttribute('aria-label', value);
    });
    updateControls();
  };

  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mike-theme', root.dataset.theme);
    updateControls();
  });

  languageToggle.addEventListener('click', () => {
    const next = language === 'en' ? 'pt' : 'en';
    localStorage.setItem('mike-language', next);
    applyLanguage(next);
  });

  updateControls();

  const header = document.querySelector('.site-header');
  const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 18);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    revealEls.forEach(el => observer.observe(el));
  } else revealEls.forEach(el => el.classList.add('visible'));

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

  (async () => {
    const [common, pageTranslations, copy] = await Promise.all([
      loadMaps(['common.json']),
      loadMaps(translationFiles[pageKey] || []),
      loadMaps(copyFiles[pageKey] || ['copy-core.json'])
    ]);
    translations = { ...common, ...pageTranslations };
    copyMap = copy;
    originalText = new WeakMap();
    walkTextNodes((node) => originalText.set(node, node.nodeValue));
    applyLanguage(language);
  })();
})();