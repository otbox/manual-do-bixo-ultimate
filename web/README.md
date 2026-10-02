# Manual do Bixo Ultimate — Web (HQ)

Site estático em Astro que transforma Markdown em revista em quadrinhos folheável (StPageFlip).

## Requisitos

- Node.js **≥ 22.12**

## Desenvolvimento

```bash
cd web
npm install
npm run dev
```

Abra a URL local impressa no terminal. A edição demo está em `/edicao/01-boas-vindas/`.

## Conteúdo

Coloque um arquivo Markdown por edição em `src/content/capitulos/` (ex.: `02-a-ft.md`).
O build lê a pasta automaticamente — sem backend.

Mapeamento: `#` capa · `##` página · `###` panel · `>` balão · listas → **MACETE!**

## Build local

```bash
cd web
npm run build
npm run preview
```

Variáveis opcionais no build (GitHub Pages):

| Variável | Exemplo | Função |
|---|---|---|
| `SITE_URL` | `https://seu-usuario.github.io` | URL canônica |
| `BASE_PATH` | `/manual-do-bixo-ultimate` | Prefixo do Pages (nome do repo) |

## Deploy (GitHub Pages)

1. No repositório: **Settings → Pages → Source = GitHub Actions**.
2. O workflow em `.github/workflows/deploy.yml` (nesta pasta `web/`) — ou o equivalente na raiz do monorepo — faz build de `/web` e publica `web/dist`.
3. Ajuste `SITE_URL` / `BASE_PATH` no workflow para o seu usuário e nome do repo.

Workflow mínimo (se preferir na raiz do monorepo):

```yaml
# .github/workflows/deploy-web.yml
name: Deploy Web HQ
on:
  push:
    branches: [main]
    paths: ['web/**']
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
          cache-dependency-path: web/package-lock.json
      - run: npm ci
      - run: npm run build
        env:
          SITE_URL: https://SEU_USUARIO.github.io
          BASE_PATH: /manual-do-bixo-ultimate
      - uses: actions/upload-pages-artifact@v3
        with:
          path: web/dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Após o primeiro deploy, a HQ fica em `https://SEU_USUARIO.github.io/manual-do-bixo-ultimate/`.
