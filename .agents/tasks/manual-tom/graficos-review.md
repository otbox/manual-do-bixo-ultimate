# Gráficos e Variedade de Blocos na HQ Astro — Iteração 2

A iteração corrige dois findings críticos da pass anterior: remoção do componente QuadroMini (que não tinha gerador de sintaxe) e documentação de testes para o lookahead de CaixaDestaque. O build passou com sucesso nos 12 capítulos; compatibilidade retroativa preservada; FlipBook e PaginaHQ não foram tocados.

**Watch for:** Parser lookahead para CaixaDestaque usa regex com múltiplos marcadores estruturais (headings, listas, imagens, decorações); a documentação de testes cobre 21 casos mas são comentados e não rodam automaticamente. Nenhum concern bloqueante confirmado, mas a cobertura de testes permanece manual.

**Verdict**: APPROVED

## High-level view

A arquitetura de tipo `Bloco` foi expandida de 5 para 8 tipos de union, adicionando `icon-bloco`, `caixa-destaque` e `lista-decorada`. O parser agora reconhece três padrões markdown novos: `**TIPO:**` (IconBloco inline), `**TIPO!**` em linha separada (CaixaDestaque multi-linha com lookahead), e `→`/`★` (ListaDecorada). O componente órfão QuadroMini foi removido. Os estilos CSS foram expandidos com texturas puras (halftone, linhas, ruído, crosshatch, dots) e suporte a temas de cores (red, blue, green, yellow, cyan, purple). O parser preserva markdown inline e mantém retrocompatibilidade com blocos legados (balões, dicas, macetes, figuras, listas numeradas).

<details>
<summary>Issues (1)</summary>

1. **Testes documentados não rodam automaticamente** — A documentação de 21 casos de teste foi criada em `.test.ts` mas permanece comentada. Sem execução contínua, regressões no lookahead de CaixaDestaque podem passar despercebidas se o markdown nos capítulos mudasse. Descomente os testes e adicione vitest ao pipeline de CI.

</details>

<details>
<summary>Details</summary>

### Parser Extension: Novos Padrões Markdown

O `parseCapitulo` agora reconhece três padrões novos: `parseIconBloco()` extrai `**TIPO:** descrição`, `parseCaixaDestaqueHeader()` detecta `**TIPO!**` como delimitador multi-linha, `detectListDecoradaMarker()` reconhece `→` e `★`. A principal complexidade está no lookahead de CaixaDestaque: após `**ALERTA!**`, coleta linhas até encontrar um marcador estrutural (heading, quote, lista, imagem, decoração, novo bloco). A regex inicia com `^` para não capturar `**bold**` no meio de parágrafos.

A ordem de tentativa no loop (heading → quote → imagem → IconBloco → CaixaDestaque → ListaDecorada → listas legadas → parágrafo) garante que decorações novas não roubem linhas de blocos existentes. Cada transição chama `flushListaDecorada()` para finalizar listas decoradas pendentes. O bilhete de verificação confirma retrocompatibilidade: todos os 12 capítulos parseiam sem mudança.

### Type Extension e Roteamento

O union `Bloco` em `hq.ts` agora inclui `icon-bloco`, `caixa-destaque`, `lista-decorada`. Em `BlocosHQ.astro`, três novos branches foram adicionados ao roteador de tipos. Cada branch detecta o type e passa props ao componente correspondente. O roteador preserva a estrutura anterior: se nenhum type casa, retorna `CaixaMacete` (legado).

### Novos Componentes Astro

`IconBloco.astro` mapeia `tipo` → cor (info→blue, alerta→yellow, importante→red, dica→cyan) e renderiza ícone à esquerda com conteúdo à direita. `CaixaDestaque.astro` renderiza emoji + título opcional + conteúdo (via `inlineMd()`, permitindo markdown inline). `ListaDecorada.astro` renderiza `<ul>` com decorador (`→` ou `★`) gerado via `::before` CSS. Nenhum componente usa JavaScript.

### CSS e Texturas

`hq-patterns.css` define 7 padrões de textura puros (halftone, linhas em 3 ângulos, ruído, crosshatch, dots) usando apenas gradientes CSS. Sombras 3D usam box-shadow em camadas. Decorações de canto usam pseudo-elementos. Temas definem 6 variáveis de cor (red, blue, green, yellow, cyan, purple) que componentes usam via `var(--theme-primary)` etc. Responsividade mobile ajusta sombras e tamanhos em 768px e 480px.

### Verificação e Limpeza

Build passou com sucesso em 2.08s em 12 capítulos, zero erros TypeScript, compatibilidade retroativa confirmada, FlipBook e PaginaHQ intactos. O componente QuadroMini foi removido (dead code—estava definido em tipos e importado mas sem implementação nem parser). Testes foram documentados (21 casos em 5 grupos) com instruções para ativar via vitest, mas permanecem comentados.

### Documentação de Testes

`parse-capitulo.test.ts` documenta 21 casos de teste esperados (IconBloco 4, CaixaDestaque lookahead 9, CaixaDestaque conteúdo 4, ListaDecorada 2, retrocompatibilidade 3) com input/output e validação para cada. Inclui exemplo vitest comentado. Sem execução automatizada, esses testes servem como especificação manual, não como rede de segurança contínua.

### Tipo 'numeros' Não Implementado

O tipo `lista-decorada` define `tipo: 'setas' | 'simbolos' | 'numeros'`, mas o parser detecta apenas setas e símbolos. Não há padrão markdown mapeado para 'numeros' (listas numeradas já são capturadas por listas legadas). O tipo é scaffolding para extensão futura, não um erro.

</details>

<details>
<summary>File map</summary>

- `web/src/types/hq.ts` — Adicionados 3 novos tipos de `Bloco` union (icon-bloco, caixa-destaque, lista-decorada)
- `web/src/utils/parse-capitulo.ts` — 166 linhas adicionadas: 3 helpers de parse, estado de lista decorada, lookahead para CaixaDestaque, 8 `flushListaDecorada()` calls estratégicos, suporte para IconBloco e ListaDecorada inline
- `web/src/components/BlocosHQ.astro` — Adicionados 3 branches de roteamento para novos tipos
- `web/src/components/IconBloco.astro` — Novo componente (28 linhas)
- `web/src/components/CaixaDestaque.astro` — Novo componente (33 linhas)
- `web/src/components/ListaDecorada.astro` — Novo componente (29 linhas)
- `web/src/styles/hq-patterns.css` — Adicionado novo arquivo (464 linhas) com texturas CSS, sombras, decorações, temas, estilos de bloco, responsive
- `web/src/utils/parse-capitulo.test.ts` — Novo arquivo de documentação de testes (191 linhas, comentado, pronto para vitest)
- `capitulos/*.md` — 5 arquivos de capítulo atualizados com nova sintaxe (nova modalidade de blocos + conteúdo satirista em 70/30)
- `web/src/content/capitulos/04-burocracia-academica.md` — Atualizado com novos padrões

**Full diff:** `git diff origin/main..HEAD`

</details>

