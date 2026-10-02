# Padrão de Markdown (visando a versão web)

- GitHub Flavored Markdown, limpo e portável
- Hierarquia bem definida: 1 `#` por arquivo (título do capítulo), `##` seções, `###` subseções
- Listas simples, sem aninhamento profundo
- Tabelas em sintaxe padrão GFM quando comparar itens
- Imagens por caminho relativo ao repo: `![legenda](../assets/hq/arquivo.jpg)` nos markdowns de `capitulos/`.
- Um arquivo por capítulo em `capitulos/`, nomeado com zero-padding: `01-boas-vindas.md`, `02-a-ft-e-a-unicamp.md`...
- Slugs/links relativos entre capítulos quando houver referência cruzada

## Dica vs Macete (HQ)

- Lista sob heading normal → selo **DICA!** (orientação geral, checklist).
- Lista sob heading cujo título contém a palavra **Macete** (ex.: `### Macete`) → selo **MACETE!** (procedimento específico, “faça X assim”).
- Prefira poucas caixas **MACETE!** por capítulo; o restante vai como dica ou prosa.
- Blockquote `>` continua sendo balão do veterano.

## Figuras / tirinhas

- Sintaxe: `![Legenda da tirinha](../assets/hq/tirinha-dorme-banco.jpg)` em linha própria.
- Na web, vira quadro com moldura preta (estilo HQ). Arquivos-fonte em `assets/hq/` (espelhados em `web/public/assets/hq/`).
- Origem atual: ilustrações extraídas do Manual do Bixo 2026.
