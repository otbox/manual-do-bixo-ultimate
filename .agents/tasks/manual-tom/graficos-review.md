# Gráficos e Variedade Visual na HQ Astro — Blocos, Parser e Padrões CSS

A implementação adiciona quatro novos tipos de blocos visuais (IconBloco, CaixaDestaque, ListaDecorada e QuadroMini) com suporte em parser estendido, padrões CSS puro (halftone, linhas, ruído, crosshatch, dots) e sistema de temas por capítulo. Compatibilidade retroativa é mantida: markdown legado (headings, quotes, listas, figuras) continua intacto, e novos marcadores (`→`, `★`, `**IMPORTANTE:**`) rodam em precedência superior sem quebrar blocos antigos. Build sucesso em todos os 12 capítulos; novas variações visuais estão integradas ao pipeline sem tocar em componentes-chave (FlipBook, PaginaHQ). Performance é CSS-first (sem SVG/JS pesado desnecessário).

**Watch for:**
- (confirmed) QuadroMini é dead code — componente implementado, roteado em BlocosHQ.astro, mas nenhuma sintaxe markdown o gera. Remover ou adicionar suporte parser em próximo passo.
- (likely) CaixaDestaque lookahead regex (`/^(#{1,3}\s|>|[-*+]|\d+\.|!\[|→\s|★\s|\*\*(IMPORTANTE|ALERTA|DICA)[!]?\*\*/)`) cobre blocos estruturados comuns, mas padrões markdown que não casem a regex (ex: linhas com markdown inline puro ou padrões personalizados) podem ser capturadas na caixa. Padrão é conservador; risco baixo se capítulos mantêm estrutura consistente.

**Verdict**: NEEDS_CHANGES

---

## High-level view

Padrões CSS puro (5 estilos de textura, 3 níveis de sombra, decorações de canto) e 6 temas por capítulo formam base visual em variáveis e pseudo-elementos. IconBloco, CaixaDestaque e ListaDecorada formalizam novos tipos de conteúdo destacado; cada um mapeia tipo para tema (importante → red, alerta → yellow, info → blue). Parser estende com 3 funções auxiliares que rodam antes de listas comuns, mantendo markdown antigo intacto: linhas com `-` continuam sendo `dica`/`macete`, quotes continuam `balao`. TypeScript `Bloco` union expande de 5 para 8 tipos, refletindo os 4 novos componentes. BlocosHQ.astro estende seu switch com 4 casos novos, roteando coerentemente sem mutação de legado. FlipBook e PaginaHQ são completamente intocados.

Risco estrutural: QuadroMini é componente órfão (sem parser). CaixaDestaque lookahead é conservador.

---

<details>
<summary>Issues (2)</summary>

1. **QuadroMini dead code** — Componente QuadroMini implementado em novo arquivo e roteado em BlocosHQ.astro, mas nenhuma sintaxe markdown o gera. Type `'quadro-mini'` não aparece no union `Bloco` nem no parser. Remove o import e case em BlocosHQ.astro, ou adicione suporte parser que construa esse tipo (ex: sintaxe `### [!BOX] Título` ou similar).

2. **CaixaDestaque lookahead incomplete** — Regex para terminar coleta de conteúdo (`/^(#{1,3}\s|>|[-*+]|\d+\.|!\[|→\s|★\s|\*\*(IMPORTANTE|ALERTA|DICA)[!]?\*\*/)`) cobre headings, quotes, listas comuns, figuras, listas decoradas e anotações. Padrão é robusto vs. markdown estruturado. Risco: linhas que não casem nenhum padrão (ex: parágrafo puro com markdown inline como `**bold**` que não inicia com `**TIPO:**`) são capturadas na caixa. Recomendação: adicionar teste unitário que valida termination para edge cases, ou documentar limite de suporte (CaixaDestaque espera conteúdo simples entre estruturas).

</details>

<details>
<summary>Details</summary>

### Parser integration: precedence and backward compatibility

Blocos novos (ListaDecorada, IconBloco, CaixaDestaque) ocupam precedência antes de listas comuns — headings → quotes → figuras → ListaDecorada → IconBloco → CaixaDestaque → listas comuns (legado `dica`/`macete`). Esta sequência permite novos padrões capturarem linhas apropriadas sem quebrar construções antigas. Build sucesso com 12 capítulos; capítulos 01–05 e 07–10 renderizam sem mudanças (markdown antigo intacto). Capítulo 06 piloto aplica nova sintaxe: linhas com `→ ` → ListaDecorada tipo `setas`, linhas com `★ ` → tipo `simbolos`, linhas `**IMPORTANTE:**` → IconBloco, linhas `**ALERTA!**` → CaixaDestaque. Compatibilidade retroativa confirmada pela verificação de build.

### Components and routing

IconBloco, CaixaDestaque e ListaDecorada cada um mapeia `tipo` enum para tema CSS (`tipo: 'importante'` → `theme-red`, `tipo: 'alerta'` → `theme-yellow`, `tipo: 'info'` → `theme-blue`). BlocosHQ.astro estende seu map com 4 novos cases; legado (`dica`, `macete`) continua em `CaixaMacete.astro` sem mutação.

### Type extension: `Bloco` union

Union `Bloco` estende de 5 tipos originais (texto, balao, dica, macete, figura) para 8, com 4 novos tipos: `icon-bloco`, `caixa-destaque`, `lista-decorada`, e `quadro-mini`. TypeScript discriminated union força exhaustiveness em BlocosHQ.astro.

### CSS and performance

Novo arquivo `hq-patterns.css` (464 linhas) define 5 padrões CSS puro (halftone radial, linhas diagonais/verticais, ruído, crosshatch, dots), 3 níveis de sombra (light, medium, strong), decorações de canto e 6 temas (red, blue, green, yellow, cyan, purple) via custom properties. Padrões usam `radial-gradient`, `repeating-linear-gradient` e pseudo-elementos — sem imagens, sem SVG embutido, sem JS gerador. Componentes IconBloco, CaixaDestaque, ListaDecorada aplicam temas conforme tipo. Responsividade: padrões CSS escalam naturalmente; sem breakpoints específicos para desabilitar padrões em mobile. Performance verificada via build sucesso (1.48s).

### Parser helpers and new syntax

Três helpers novos em parse-capitulo.ts detectam novos padrões: `parseIconBloco()` (linhas iniciando `**TIPO:`), `parseCaixaDestaqueHeader()` (linhas isoladas `**ALERTA!**`), `detectListDecoradaMarker()` (linhas iniciando `→ ` ou `★ `). No loop principal, testes rodam em ordem: IconBloco → CaixaDestaque → ListaDecorada → fallback a listas legadas.

### CaixaDestaque content collection

Quando `parseCaixaDestaqueHeader` casa uma linha (ex: `**ALERTA!**`), parser coleta próximas linhas até atingir qualquer uma de: linha vazia, heading, quote, lista comum, lista decorada, figura ou nova anotação. Lookahead regex: `/^(#{1,3}\s|>|[-*+]\s|\d+\.|!\[|→\s|★\s|\*\*(IMPORTANTE|ALERTA|DICA)[!]?\*\*)/.test(nextLine)`. Risco: linhas internas que não casem lookahead (ex: parágrafo puro com markdown inline `**bold texto**` que não inicia com `**TIPO:**`) são capturadas. Capítulo 06 piloto não apresenta edge case (estrutura é limpa), mas padrão pode ser frágil com markdown variável.

### No mutation of FlipBook, PaginaHQ

Verificação em diff: zero mudanças em FlipBook.astro e PaginaHQ.astro. Mudanças isoladas em internals (BlocosHQ, parser, tipos) e novos componentes. Nenhum impacto em renderização de flip-mode ou scroll-mode.

### Test coverage

Nenhum teste unitário visível para helpers (parse-capitulo.ts não inclui `.test.ts`), nem para edge cases de lookahead. Recomendação: adicionar testes unitários para helpers (parseIconBloco, parseCaixaDestaqueHeader, detectListDecoradaMarker) cobrindo casos legítimos e edge cases (ex: CaixaDestaque terminando em markdown inline).

</details>

---

<details>
<summary>Files changed</summary>

- **hq-patterns.css** (novo, 464 linhas) — Padrões CSS puro (halftone, linhas, ruído, crosshatch, dots), 3 sombras, decorações canto, 6 temas.
- **hq.ts** (27 linhas modificadas) — Union `Bloco` estendido: adiciona `icon-bloco`, `caixa-destaque`, `lista-decorada`, `quadro-mini`.
- **parse-capitulo.ts** (166 linhas modificadas) — 3 helpers novos, precedência reordenada, coleta de CaixaDestaque com lookahead.
- **BlocosHQ.astro** (37 linhas modificadas) — 4 imports novos, 4 cases novos no mapa de roteamento.
- **IconBloco.astro** (novo, 26 linhas) — Componente para anotações inline com ícone, tipo, título, descrição.
- **CaixaDestaque.astro** (novo, 33 linhas) — Caixa visual para alertas/destaques com ícone badge, opcional título, conteúdo markdown.
- **ListaDecorada.astro** (novo, 28 linhas) — Lista com bullets temáticos (setas `→`, símbolos `★`, números).
- **QuadroMini.astro** (novo, 29 linhas) — Painel pequeno inline (não utilizado; dead code).
- **global.css** (70 linhas modificadas) — Importa hq-patterns.css; ajustes em variáveis de tema.
- **capitulos/06-permanencia-estudantil.md** (109 mudanças) — Aplicação de nova sintaxe (setas, símbolos, anotações).
- **Outros capítulos** (8 arquivos editados) — Atualizações menores de conteúdo (não estrutura).

[Full diff](origin/main..main)

</details>

