(() => {
  const root = document.documentElement;
  const path = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  const page = path.includes('/survey-builder') ? 'survey' : path.includes('/design-system') ? 'design' : path.includes('/processamento-de-dados') ? 'processing' : path.includes('/ia-questionarios') ? 'ai' : 'home';

  const files = {
    home: ['home.json'],
    survey: ['survey-builder-1.json','survey-builder-2.json','survey-builder-3.json'],
    design: ['design-system.json','design-system-2a.json','design-system-2b1.json','design-system-2b2.json','design-system-2b3.json'],
    processing: ['processamento-1.json','processamento-2a.json','processamento-2d.json','processamento-2e.json','processamento-2f.json','processamento-2g.json'],
    ai: ['ia-questionarios.json','ia-questionarios-2a.json','ia-questionarios-2b.json','ia-questionarios-2c.json','ia-questionarios-2d1.json','ia-questionarios-2d2a.json']
  };
  const copyFiles = page === 'survey' ? ['copy-core.json','copy-survey.json'] : ['copy-core.json'];

  const load = async names => Object.assign({}, ...(await Promise.all(names.map(async name => {
    try { const r = await fetch(`/i18n/${name}`, {cache:'no-store'}); return r.ok ? r.json() : {}; } catch { return {}; }
  }))));

  const textNodes = () => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {acceptNode(n){
      const p=n.parentElement; return p && !['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName) && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }}), out=[]; while(w.nextNode()) out.push(w.currentNode); return out;
  };
  const replace = (node, value) => {
    const cur=node.nodeValue, t=cur.trim(), i=cur.indexOf(t); node.nodeValue=(i<0?'':cur.slice(0,i))+value+(i<0?'':cur.slice(i+t.length));
  };

  const style=document.createElement('style');
  style.textContent=`
    .site-controls{display:flex;align-items:center;gap:7px;margin-left:4px}
    .switch-control,.theme-toggle{display:inline-flex!important;align-items:center!important;gap:8px!important;width:auto!important;height:40px!important;padding:4px 9px!important;border:1px solid var(--line)!important;border-radius:999px!important;background:var(--surface)!important;color:var(--fg)!important;font:inherit!important;font-size:12px!important;font-weight:750!important;cursor:pointer!important}
    .switch-control:hover,.theme-toggle:hover{background:var(--soft)!important}
    .switch-track{position:relative;width:34px;height:20px;border-radius:999px;background:var(--line);flex:none}
    .switch-thumb{position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:var(--surface);box-shadow:0 1px 4px rgba(0,0,0,.2);transition:transform .2s ease}
    .switch-control[aria-pressed=true] .switch-track,.theme-toggle[aria-pressed=true] .switch-track{background:var(--fg)}
    .switch-control[aria-pressed=true] .switch-thumb,.theme-toggle[aria-pressed=true] .switch-thumb{transform:translateX(14px);background:var(--bg)}
    .theme-icon{display:grid;place-items:center;width:18px;height:18px;font-size:16px;line-height:1}
    .language-toggle .switch-label{min-width:18px}
    .case-guidance{display:flex;flex-direction:column;gap:72px}
    .case-guidance-group{display:flex;flex-direction:column;gap:26px}
    .case-guidance-copy{max-width:900px;margin:0;color:var(--muted);font-size:clamp(19px,2.2vw,28px);line-height:1.35;letter-spacing:-.025em}
    .case-guidance-copy strong{color:var(--fg);font-weight:780}
    .case-guidance-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
    .case-guidance-cards.one{grid-template-columns:1fr}
    .case-guidance-cards .case-card{grid-column:auto!important;width:100%;min-height:480px}
    .case-guidance-cards.one .case-card{min-height:500px}
    .case-guidance-cards .case-card.large,.case-guidance-cards .case-card.half{grid-column:auto!important}
    @media(max-width:900px){.case-guidance{gap:58px}.case-guidance-cards{grid-template-columns:1fr}.case-guidance-cards .case-card,.case-guidance-cards.one .case-card{min-height:0}}
    @media(max-width:760px){.nav{gap:10px}.nav-links{gap:2px}.nav-links>a{display:none}.site-controls{gap:5px}.switch-control,.theme-toggle{padding:4px 7px!important}.brand{width:96px}.case-guidance-copy{font-size:19px}}
  `;
  document.head.appendChild(style);

  const themeBtn=document.querySelector('.theme-toggle');
  const langBtn=document.createElement('button');
  langBtn.className='switch-control language-toggle'; langBtn.type='button'; langBtn.setAttribute('role','switch');
  langBtn.innerHTML='<span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span><span class="switch-label">PT</span>';
  if(themeBtn){
    themeBtn.setAttribute('role','switch');
    themeBtn.innerHTML='<span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span><span class="theme-icon" aria-hidden="true"></span>';
    const wrap=document.createElement('div'); wrap.className='site-controls'; themeBtn.parentElement.insertBefore(wrap,themeBtn); wrap.append(themeBtn,langBtn);
  }

  root.dataset.theme=localStorage.getItem('mike-theme') || (matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light');
  let lang=localStorage.getItem('mike-language') || 'pt', translations={}, copy={}, originals=new WeakMap();

  const recruiterCopy={
    pt:{
      title:'Olá! O que você procura em um Product Designer?',
      product:'Para produto, estratégia e sistemas complexos, comece por <strong>Survey Builder e Processamento de Dados</strong>.',
      ds:'Para Design Systems e escala, veja o <strong>case de Design System</strong>.',
      ai:'Para IA aplicada a produto e engenharia de prompts, vá para <strong>IA na Criação de Questionários</strong>.',
      resume:'Currículo ↗',resumeAria:'Abrir currículo de Mike Brito'
    },
    en:{
      title:'Hi! What are you looking for in a Product Designer?',
      product:'For product, strategy and complex systems, start with <strong>Survey Builder and Data Processing</strong>.',
      ds:'For Design Systems and scale, see the <strong>Design System case</strong>.',
      ai:'For AI applied to product and prompt engineering, go to <strong>AI-assisted Survey Creation</strong>.',
      resume:'Resume ↗',resumeAria:'Open Mike Brito resume'
    }
  };

  const enhanceHome=()=>{
    if(page!=='home') return;
    const c=recruiterCopy[lang==='en'?'en':'pt'];
    const head=document.querySelector('#cases .section-head');
    if(head){ const h2=head.querySelector('h2'); if(h2) h2.textContent=c.title; }

    const grid=document.querySelector('#cases .work-grid');
    if(grid){
      const survey=grid.querySelector('[data-number="01"]');
      const ds=grid.querySelector('[data-number="02"]');
      const processing=grid.querySelector('[data-number="03"]');
      const ai=grid.querySelector('[data-number="04"]');
      if(survey && ds && processing && ai){
        grid.className='work-grid case-guidance';
        grid.innerHTML='';

        const makeGroup=(html,cards,one=false)=>{
          const section=document.createElement('section');
          section.className='case-guidance-group';
          const p=document.createElement('p'); p.className='case-guidance-copy'; p.innerHTML=html;
          const cardsWrap=document.createElement('div'); cardsWrap.className=`case-guidance-cards${one?' one':''}`;
          cards.forEach(card=>cardsWrap.appendChild(card));
          section.append(p,cardsWrap);
          return section;
        };

        grid.append(
          makeGroup(c.product,[survey,processing]),
          makeGroup(c.ds,[ds],true),
          makeGroup(c.ai,[ai],true)
        );
      } else {
        const groups=[...grid.querySelectorAll('.case-guidance-group')];
        if(groups.length===3){
          groups[0].querySelector('.case-guidance-copy').innerHTML=c.product;
          groups[1].querySelector('.case-guidance-copy').innerHTML=c.ds;
          groups[2].querySelector('.case-guidance-copy').innerHTML=c.ai;
        }
      }
    }

    const links=document.querySelector('.contact-links');
    if(links){
      let resume=links.querySelector('.resume-link');
      if(!resume){ resume=document.createElement('a'); resume.className='resume-link'; resume.href='https://drive.google.com/file/d/1hJg-J4_RcVZTJD5kOwaIcldw0RLPvyB9/view?usp=sharing'; resume.target='_blank'; resume.rel='noopener noreferrer'; links.insertBefore(resume,links.firstElementChild); }
      resume.textContent=c.resume; resume.setAttribute('aria-label',c.resumeAria);
    }
  };

  const controls=()=>{
    const dark=root.dataset.theme==='dark';
    if(themeBtn){ themeBtn.setAttribute('aria-pressed',dark); themeBtn.setAttribute('aria-label',lang==='en'?(dark?'Use light theme':'Use dark theme'):(dark?'Usar tema claro':'Usar tema escuro')); themeBtn.querySelector('.theme-icon').textContent=dark?'☾':'☀'; }
    langBtn.setAttribute('aria-pressed',lang==='en'); langBtn.setAttribute('aria-label',lang==='en'?'Mudar idioma para português':'Switch language to English'); langBtn.querySelector('.switch-label').textContent=lang==='en'?'EN':'PT';
  };

  const apply=next=>{
    lang=next; root.lang=lang==='en'?'en':'pt-BR'; root.dataset.language=lang;
    textNodes().forEach(node=>{
      const original=originals.get(node); if(original===undefined)return; node.nodeValue=original;
      const raw=original.trim(), pt=copy[raw]||raw, target=lang==='en'?(translations[pt]||translations[raw]||pt):pt;
      if(target!==raw) replace(node,target);
    });
    enhanceHome(); controls();
  };

  themeBtn?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('mike-theme',root.dataset.theme);controls();});
  langBtn.addEventListener('click',()=>{const next=lang==='en'?'pt':'en';localStorage.setItem('mike-language',next);apply(next);});
  controls();

  const header=document.querySelector('.site-header'); const headerState=()=>header?.classList.toggle('scrolled',scrollY>18); headerState(); addEventListener('scroll',headerState,{passive:true});
  const reveals=document.querySelectorAll('.reveal'); if('IntersectionObserver'in window){const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');o.unobserve(e.target)}}),{threshold:.08});reveals.forEach(e=>o.observe(e));}else reveals.forEach(e=>e.classList.add('visible'));
  const links=[...document.querySelectorAll('.case-toc a')]; if(links.length&&'IntersectionObserver'in window){const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);const o=new IntersectionObserver(es=>{const v=es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(v)links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${v.target.id}`));},{rootMargin:'-20% 0px -60% 0px',threshold:[0,.2,.5,1]});sections.forEach(s=>o.observe(s));}

  (async()=>{[translations,copy]=await Promise.all([load(['common.json',...(files[page]||[])]),load(copyFiles)]); originals=new WeakMap(); textNodes().forEach(n=>originals.set(n,n.nodeValue)); apply(lang);})();
})();