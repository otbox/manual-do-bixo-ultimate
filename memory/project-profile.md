---
name: manual-do-bixo-ultimate
updated: 2026-10-02
---

# Project profile

- Repo: manual satírico Unicamp (markdown) + versão web HQ folheável
- Stack web: Astro 7 + TypeScript + page-flip (StPageFlip), deploy GitHub Pages
- App root: `/web` — Node ≥ 22.12
- Conteúdo HQ: `web/src/content/capitulos/` (1 md = 1 edição; lido via `import.meta.glob`)
- Capítulos fonte do manual (texto): `/capitulos` na raiz
- Fontes PDF: `/fontes` (2013 CAT/FT, CDI 2024, edição Canva 2026)
- Guia auxiliar: https://guia-sobrevivencia-ft.vercel.app (sintetizar)
- Capítulos: `/capitulos/01`–`09` espelhados em `web/src/content/capitulos/`
- Listas HQ: padrão **DICA!**; heading com "Macete" → **MACETE!** (raro/específico)
- Parse: `web/src/utils/parse-capitulo.ts` — `#` capa, `##` página, `###` panel, `>` balão, listas → dica|macete

- Componentes HQ em `web/src/components/` (CapaEdicao, PaginaHQ, Panel, BalaoFala, CaixaMacete, Sumario, ControlesNavegacao, FlipBook)
- Modos: flip (default) + scroll (toggle); workflow `.github/workflows/deploy-web.yml`
- Sem backend; 100% estático
- Estética: papel creme, Bangers + Inter, vermelho/amarelo/azul (pedido explícito do produto)
