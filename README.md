# Mike Brito | Portfolio V8

Versão preparada para deploy estático na Vercel.

## Rotas principais

- `/`
- `/cases/survey-builder`
- `/cases/design-system`
- `/cases/processamento-de-dados`

Os cases são arquivos HTML estáticos em `cases/*.html`. O `vercel.json` faz rewrites explícitos das URLs limpas para esses arquivos. Isso evita depender de pastas com `index.html` para a navegação entre páginas.

## Assets

Todos os HTML usam caminhos absolutos a partir da raiz, como `/styles.css`, `/script.js` e `/assets/...`. Essa versão prioriza funcionamento em produção na Vercel.

## Deploy

Framework Preset: `Other`  
Build Command: vazio  
Output Directory: vazio

Domínio planejado: `mikebrito.com.br`.
