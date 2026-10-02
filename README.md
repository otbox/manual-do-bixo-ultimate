# 🎓 Manual do Bixo Ultimate

Manual satírico para calouros da Unicamp, escrito em markdown como base para a futura versão web. Herdeiro da tradição dos manuais de bixo da FT/Unicamp (2013, CDI 2024), agora em formato aberto, versionado e pronto pra virar site.

## Sobre o projeto

O Manual do Bixo Ultimate organiza e reescreve o conhecimento acumulado dos manuais históricos da Unicamp em documentos markdown independentes, com voz própria: um veterano contando diretamente pro calouro as coisas como elas são — serviços da universidade, macetes de sobrevivência, burocracias e vida acadêmica — com humor e respeito.

A versão web terá formato de **revista em quadrinhos folheável** (page-flip, sumário, balões de fala). Detalhes em [docs/06-versao-web.md](docs/06-versao-web.md).

## Estrutura do repositório

```
├── docs/         → direcionamento do projeto, guia de estilo, referências e padrões
├── capitulos/    → capítulos do manual (o produto final em markdown)
├── fontes/       → PDFs históricos/base (2013, CDI 2024, edição 2026)
└── web/          → versão HQ folheável (Astro)
```

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/00-visao-geral.md](docs/00-visao-geral.md) | Visão geral, objetivo e escopo |
| [docs/01-estilo-e-tom.md](docs/01-estilo-e-tom.md) | Guia de voz e tom do manual |
| [docs/02-estrutura-do-manual.md](docs/02-estrutura-do-manual.md) | Mapa de capítulos e seções |
| [docs/03-referencias-historicas.md](docs/03-referencias-historicas.md) | Síntese dos manuais históricos (2013, CDI 2024) |
| [docs/04-padrao-markdown-web.md](docs/04-padrao-markdown-web.md) | Convenções de markdown para a versão web |
| [docs/05-fluxo-de-trabalho.md](docs/05-fluxo-de-trabalho.md) | Fluxo de produção dos capítulos |
| [docs/06-versao-web.md](docs/06-versao-web.md) | Conceito da versão web (HQ folheável) + prompt de geração |

## Fontes de referência

PDFs originais em [`fontes/`](fontes/README.md) (sintetizar e reescrever, nunca copiar):

- [Manual do Bixo 2013 (CAT/FT)](fontes/manual-do-bixo-2013-cat-ft.pdf)
- [Manual dos Bixos CDI 2024](fontes/manual-dos-bixos-cdi-2024.pdf)
- [Manual do Bixo 2026 (Canva)](fontes/manual-do-bixo-2026.pdf)

