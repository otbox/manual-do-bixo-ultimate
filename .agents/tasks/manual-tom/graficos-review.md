# Variação visual da HQ: blocos temáticos, padrões CSS e novo parser

O diferencial neste commit é a expansão da abstração de blocos da HQ para suportar 4 novos tipos visuais — IconBloco, CaixaDestaque, ListaDecorada e QuadroMini — com padrões CSS subjacentes (halftone, linhas, ruído, crosshatch, dots) e suporte em temas por capítulo. O parser estende-se para reconhecer sintaxe inline (`**IMPORTANTE:**`, `**ALERTA!**`) e bullets decorados (`→`, `★`), tudo preservando compatibilidade regressiva com markdown legado (headings, quotes, listas comuns, figuras). TypeScript types extendem o union `Bloco` coerentemente; roteamento em BlocosHQ.astro se multiplica para os 4 novos componentes sem tocar em FlipBook ou PaginaHQ.

**Watch for:**
- (likely) CaixaDestaque coleta conteúdo multilinhas com lookahead até linha vazia, mas regra de parada `/^(#{1,3}\s|>|[-*+]|\d+\.|!\[)/` pode não capturar todas as construções markdown. Padrão incompletamente especificado.
- (confirmed) QuadroMini componente implementado mas sem suporte parser — nenhuma sintaxe markdown o gera, deixando dead code.

**Verdict**: NEEDS_CHANGES

---

## High-level view

Padrões CSS (halftone, linhas, ruído, sombras 3D) e 6 temas formam base visual em CSS puro. IconBloco e CaixaDestaque formalizam destaque inline/boxed; ListaDecorada muda bullets para `→`/`★`. Parser estende com 3 helpers que rodam antes de listas comuns, mantendo markdown antigo intacto: `-` continua sendo `dica`/`macete`. TypeScript types e BlocosHQ.astro roteiam coerentemente; FlipBook e PaginaHQ intocados.

Risco estrutural: CaixaDestaque lookahead regex incompletamente especificado; QuadroMini é dead code (sem parser).


---

<details>
<summary>Issues (2)</summary>

1. **CaixaDestaque lookahead incomplete** — Regex para detectar fim de conteúdo (`/^(#{1,3}\s|>|[-*+]|\d+\.|!\[)/`) não cobre todas as markdown construções. Linhas com parágrafos puros ou markdown inline (`**bold** text`) que não casem com padrão são capturadas na caixa; risco de conteúdo inesperado se estrutura markdown muda entre drafts.

2. **QuadroMini dead code** — Componente implementado e roteado em BlocosHQ.astro mas sem suporte em parser. Nenhuma sintaxe markdown o gera. Remove ou adicione parser em próximo passo.

</details>

<details>
<summary>Details</summary>

### Parser integration: precedence and backward compatibility

Blocos novos (ListaDecorada, IconBloco, CaixaDestaque) ocupam precedência antes de listas comuns. Order: headings → quotes → figuras → **ListaDecorada** → **IconBloco** → **CaixaDestaque** → listas comuns. Isto permite novos padrões (`→`, `★`, `**TIPO:**`) ganhar prioridade sem quebrar `-` listas legadas. Build sucesso com 12 capítulos ✅; markdown antigo (headings, quotes, listas, figuras) continua intacto.

### Components and routing

IconBloco, CaixaDestaque, ListaDecorada cada um mapeia tipo para tema, renderiza com `inlineMd()`, e usa role/aria apropriados (`role="note"`, `role="list"`). BlocosHQ.astro estende mapa `bloco.type` com 4 novos cases; legado (`dica`, `macete`) continua em `CaixaMacete.astro`. Roteamento sem mutação de código antigo.

### CSS and performance

hq-patterns.css: 5 padrões CSS (halftone, linhas, ruído, crosshatch, dots), 3 sombras, decorações canto. Tudo CSS puro (gradients, pseudo-elementos) — sem SVG/JS pesado, performance ✅. 6 temas via custom properties, aplicam-se globalmente. Responsividade declarada em verificação (sombras/padrões reduzem em tablets/mobile); breakpoints em nível de componente ou global.css.

### CaixaDestaque lookahead concern

Coleta conteúdo com regex `/^(#{1,3}\s|>|[-*+]|\d+\.|!\[)/` para detectar fim. Cobre headings, quotes, listas comuns, figuras. Risco: parágrafos markdown puros ou inline syntax que não casem regex são capturados — sem exemplo prático de quebra, mas padrão é conservador não robusto.

### QuadroMini unused

Implementado mas nenhuma sintaxe markdown o gera. Componente é dead code em BlocosHQ.astro. Remover ou adicionar parser em próximo pass.

</details>

---

<details>
<summary>Files changed</summary>

- **hq-patterns.css** (novo, 464 linhas) — Padrões CSS: halftone, linhas, ruído, crosshatch, dots, sombras 3D, decorações canto, temas.
- **global.css** (70 mudanças) — Importa hq-patterns.css; ajustes em variáveis e estilos globais.
- **hq.ts** (27 mudanças) — Union `Bloco` estendido com 4 tipos: icon-bloco, caixa-destaque, lista-decorada, quadro-mini.
- **parse-capitulo.ts** (155 mudanças) — Parser estendido: 3 helpers novos, priorização reordenada, suporte a IconBloco, CaixaDestaque, ListaDecorada, mantém listas legadas.
- **BlocosHQ.astro** (37 mudanças) — 4 imports novos, roteamento estendido no mapa `bloco.type`.
- **IconBloco.astro** (novo, 26 linhas) — Componente para anotações inline com ícone e tipo temático.
- **CaixaDestaque.astro** (novo, 33 linhas) — Caixa visual para alertas/destaques com ícone e conteúdo markdown.
- **ListaDecorada.astro** (novo, 28 linhas) — Lista com bullets temáticos (→, ★, números).
- **QuadroMini.astro** (novo, 29 linhas) — Painel pequeno inline (não utilizado em parser).
- **Capítulos modificados** (9 arquivos) — Alguns capítulos recebem blocos novos; maioria legado mantida.

[Full diff](../../.git/refs/heads/main)

</details>
