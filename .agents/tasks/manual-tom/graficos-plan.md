# Plano de Implementação: Gráficos e Variedade Visual nos Painéis da HQ

## Visão Geral

Este plano decompõe a tarefa de melhorar gráficos e adicionar variedade visual nos painéis em quatro fases interdependentes:
1. **CSS avançado** (padrões, texturas, decorações, temas)
2. **Novos componentes Astro** (IconBloco, CaixaDestaque, ListaDecorada, QuadroMini)
3. **Parser estendido** (reconhecer nova sintaxe markdown)
4. **Validação piloto** (aplicar num capítulo, testar, documentar antes/depois)

A implementação **não quebra markdown existente** — blocos legados (texto, balao, dica, macete, figura) continuam funcionando. Novas syntaxes são aditivas.

---

## Fase 1: CSS Avançado e Padrões (novo arquivo + atualização global.css)

### Decisões de Design

**Padrões de texturas**: Criar 5+ padrões CSS puros (sem imagens) que replicam estilos HQ clássicos:
- **Halftone Ben Day**: pontos radiais variados em tamanhos
- **Linhas de velocidade**: repeating-linear-gradient em ângulos diferentes
- **Ruído sutil**: padrão de pontos finos para simular impressão offset
- **Cross-hatch**: linhas cruzadas (45° + 135°)
- **Dot screen**: grid regular de pontos

Rationale: CSS puro reduz peso, é responsivo, e permite composição via classes. Padrões existem (`.panel::before` já usa halftone) — expandir o vocabulário.

**Sombras 3D**: Oferecer três níveis de profundidade via custom properties:
- `--shadow-light`: `2px 2px 0 rgba(0,0,0,0.2)`
- `--shadow-medium`: `4px 4px 0 rgba(0,0,0,0.35)`
- `--shadow-strong`: `6px 6px 0 rgba(0,0,0,0.5)`

Rationale: Reusa o estilo de box-shadow existente. Blocos podem receber classes como `.shadow-medium` para variar profundidade.

**Decorações de canto**: Pequenos elementos visuais nas esquinas dos panels. Implementar via `::before` + `::after` pseudo-elementos com borders/gradients:
- Triângulos (border-width variados)
- Pequenas barras angulares
- "Entalhos" (triangle cutouts)

Rationale: Pseudo-elementos economizam DOM. Cada tipo de bloco pode ativar um estilo de canto diferente via classes.

**Temas por capítulo**: Variáveis de cor por edição (arquivo já tem `.capa--boas`, etc.).
Estender globalmente:
- `--tema-red`, `--tema-blue`, `--tema-green`, `--tema-yellow`
- Cada tema herda da paleta existente (`--hero-red`, etc.)
- Blocos especiais podem usar `data-theme="red"` para tomar cores temáticas

Rationale: Já existe precedente em `.capa--*`. Aplicar ao conteúdo HQ unifica visualmente edições.

### Arquivos a Criar/Modificar

**Novo arquivo**: `web/src/styles/hq-patterns.css`
- Define custom properties para padrões CSS
- Classes reutilizáveis: `.pattern-halftone`, `.pattern-lines`, `.pattern-noise`, `.pattern-crosshatch`, `.pattern-dots`
- Classes de sombra: `.shadow-light`, `.shadow-medium`, `.shadow-strong`
- Decorações de canto: `.corner-triangle`, `.corner-slash`, `.corner-notch`
- Temas por capítulo: `.theme-red`, `.theme-blue`, `.theme-green`, `.theme-yellow`
- Variantes inline para blocos: `.block-thick-border`, `.block-rounded-light`

**Modificar**: `web/src/styles/global.css`
- Importar `hq-patterns.css` no topo
- Adicionar regras temáticas globais que os novos componentes herdam
- Atualizar `.panel` para aceitar `data-theme` e aplicar cores

### Verificação Fase 1

```bash
cd /home/otbox/Documentos/Projetos/manual-do-bixo-ultimate/web
npm run build
# Esperar sucesso sem erros
# Inspecionar web/.dist/client ou build output para confirmar CSS foi incluído
# Rodar manualmente no navegador com dev server e verificar visualmente
npm run dev
# Navegar para http://localhost:3000 e confirmar padrões aparecem em .capa e .panel
```

---

## Fase 2: Novos Componentes Astro

### Decisões de Design

**IconBloco**: Bloco pequeno + compacto com ícone (emoji) + título + descrição. Tipos: `info`, `alerta`, `importante`, `dica`, `macete`.
- Props: `icon` (string, emoji), `tipo` (enum), `titulo` (string), `descricao` (string)
- Renderiza com ícone grande à esquerda, título bold, descrição normal
- Héritier classes de tema (`theme-*`) para variar cor de fundo

Rationale: Blocos rápidos para destaque visual. Diferencia de CaixaMacete (lista vs. inline).

**CaixaDestaque**: Caixa grande colorida com fundo destacado. Tipos: `importante`, `alerta`, `dica`.
- Props: `tipo` (enum), `conteudo` (string markdown), `titulo?` (opcional)
- Similar a CaixaMacete, mas renderiza conteúdo markdown em vez de apenas lista
- Capa colorida com ícone/badge

Rationale: Destaque visual para avisos críticos. Acomoda mais que uma lista.

**ListaDecorada**: Lista com bullets customizados. Tipos: `pontos`, `setas`, `numeros`, `simbolos` (★, →, ◆, ◇).
- Props: `tipo` (enum), `itens` (string[]), `tema?` (para herdar cores)
- Renderiza `<ul>` com pseudo-elemento `::before` customizado por tipo
- Cores variam por tema

Rationale: Visualmente ricas. Diferencia listas normais de listas de macete.

**QuadroMini**: Painel pequeno, inline, com título e conteúdo. Similar a `.panel` mas em versão miniatura.
- Props: `titulo` (string), `conteudo` (string markdown), `tipo?` (ex: 'info', 'alerta', para aplicar `data-type`)
- Renderiza com border, padding reduzido, sombra leve
- Aceita tema

Rationale: Permite "painéis dentro de painéis" — informações laterais ou inline sem quebrar fluxo.

### Arquivos a Criar/Modificar

**Novos arquivos em `web/src/components/`**:
1. `IconBloco.astro` — recebe: `icon`, `tipo`, `titulo`, `descricao`
2. `CaixaDestaque.astro` — recebe: `tipo`, `titulo` (opt), `conteudo`
3. `ListaDecorada.astro` — recebe: `tipo`, `itens`, `tema` (opt)
4. `QuadroMini.astro` — recebe: `titulo`, `conteudo`, `tipo` (opt)

Todos usam `inlineMd()` para renderizar conteúdo markdown.

**Modificar**: `web/src/components/BlocosHQ.astro`
- Adicionar imports dos 4 novos componentes
- Estender switch/map para reconhecer novos tipos de `Bloco`:
  - `'icon-bloco'` → renderizar `<IconBloco />`
  - `'caixa-destaque'` → renderizar `<CaixaDestaque />`
  - `'lista-decorada'` → renderizar `<ListaDecorada />`
  - `'quadro-mini'` → renderizar `<QuadroMini />`

### Verificação Fase 2

```bash
cd /home/otbox/Documentos/Projetos/manual-do-bixo-ultimate/web
npm run build
# Esperar sucesso sem erros
# Verificar que cada componente novo compila sem erros
# Inspecionar que BlocosHQ.astro é válido
```

---

## Fase 3: Parser Estendido (parse-capitulo.ts)

### Decisões de Design

**Sintaxe estendida**:

1. **`**IMPORTANTE:** texto`** → `IconBloco` tipo `importante`
   - Padrão: `**` + palavra-chave + `:` seguida de espaço/quebra
   - Captura a palavra-chave (IMPORTANTE, ALERTA, DICA, etc.) e trata como tipo
   - Resto da linha/parágrafo vira `descricao`

2. **`**ALERTA!** texto`** → `CaixaDestaque` tipo `alerta`
   - Padrão: `**` + palavra-chave com `!` + `:` ou quebra
   - Mapear `ALERTA! → alerta`, `IMPORTANTE! → importante`, `DICA! → dica`

3. **Listas com `→` ou `★`** → `ListaDecorada` tipo correspondente
   - Detectar linha que começa com `→ ` ou `★ ` (em vez de `-`, `*`, `+`)
   - Agrupar sequência de tais linhas como um único `ListaDecorada` bloco
   - Tipo depende do símbolo: `→` → `setas`, `★` → `simbolos`, etc.

4. **`### [!INFO] Título`** → `QuadroMini` ou `IconBloco` inline
   - Padrão: `###` seguido de `[!TIPO]` + título
   - Renderizar como mini-painel com tipo

**Compatibilidade retroativa**:
- Linhas com `-`, `*`, `+` continuam sendo `dica` como antes
- Heading com "macete" continua sendo `macete` como antes
- Conteúdo sem novos marcadores passa intacto

### Arquivos a Modificar

**`web/src/utils/parse-capitulo.ts`**:

1. Estender tipo `Bloco` em `types/hq.ts` (ver Fase 4) com novos tipos
2. Adicionar funções auxiliares:
   ```typescript
   function parseIconBloco(line: string): { tipo: string; titulo: string; descricao: string } | null
   function parseCaixaDestaque(line: string): { tipo: string; conteudo: string } | null
   function detectListDecorada(line: string): { tipo: string; item: string } | null
   ```
3. No loop principal, testar novos padrões **antes** dos padrões legados
4. Se novo padrão corresponder, criar bloco novo; senão, continuar legado

**Ordem de teste importante**:
```
1. Heading (# ## ###) — prioridade alta
2. Quote (>)
3. Imagem (![...](...)
4. Lista decorada (→ ★)
5. Lista normal (- * +) — legado
6. Caixa destacada (**ALERTA!** etc.) — inline em parágrafo
7. Parágrafo normal
```

### Verificação Fase 3

```bash
cd /home/otbox/Documentos/Projetos/manual-do-bixo-ultimate/web
npm run build
# Esperar sucesso sem erros
# Inspecionar tipos gerados no bundle para confirmar novos tipos `Bloco` estão incluídos
```

---

## Fase 4: Extensão do Type `Bloco` e Integração

### Decisões de Design

**Novo union type `Bloco`** (em `web/src/types/hq.ts`):

```typescript
export type Bloco =
  | { type: 'texto'; markdown: string }
  | { type: 'balao'; texto: string }
  | { type: 'dica'; itens: string[] }
  | { type: 'macete'; itens: string[] }
  | { type: 'figura'; src: string; alt: string }
  // NOVOS TIPOS:
  | { type: 'icon-bloco'; icon: string; tipo: 'info' | 'alerta' | 'importante' | 'dica'; titulo: string; descricao: string }
  | { type: 'caixa-destaque'; tipo: 'importante' | 'alerta' | 'dica'; titulo?: string; conteudo: string }
  | { type: 'lista-decorada'; tipo: 'setas' | 'simbolos' | 'numeros'; itens: string[] }
  | { type: 'quadro-mini'; titulo: string; conteudo: string; subtipo?: 'info' | 'alerta' }
```

Rationale: Union type discriminado permite exhaustiveness check em TypeScript e routing claro em BlocosHQ.astro.

### Arquivos a Modificar

**`web/src/types/hq.ts`**:
- Adicionar 4 novos tipos a `Bloco` union (ver acima)

**`web/src/utils/parse-capitulo.ts`**:
- Importar novos tipos
- Implementar helper functions para detectar/parsear nova sintaxe
- Estender lógica no loop para criar instâncias dos novos tipos

**`web/src/components/BlocosHQ.astro`**:
- Já descrito em Fase 2

### Verificação Fase 4

```bash
cd /home/otbox/Documentos/Projetos/manual-do-bixo-ultimate/web
npx tsc --noEmit
# Esperar sucesso (tipos válidos)
npm run build
# Esperar sucesso
```

---

## Fase 5: Validação Piloto e Teste Piloto

### Capítulo Piloto: `06-permanencia-estudantil.md`

**Rationale para escolha**: Capítulo já tem estrutura rica (headings, listas, imagens, balões). Contém tópicos que se beneficiam de destaque visual (avisos, dicas, passo-a-passo).

### Estratégia de Aplicação

1. **Ler arquivo piloto** (`capitulos/06-permanencia-estudantil.md`)
2. **Identificar seções** que cabem em novos tipos:
   - Blocos tipo IMPORTANTE/ALERTA → `CaixaDestaque`
   - Listas de passos → `ListaDecorada` com setas
   - Avisos críticos → `IconBloco` tipo importante
   - Caixas info lateral → `QuadroMini`
3. **Criar versão piloto** com nova sintaxe (sem quebrar legado)
4. **Build e render** piloto
5. **Verificar visualmente** em navegador (flip e scroll mode)
6. **Rodar mobile-first** — confirmar responsividade em mobile
7. **Documentar antes/depois** — screenshots/notas para entrega

### Teste de Build e Responsividade

```bash
cd /home/otbox/Documentos/Projetos/manual-do-bixo-ultimate/web

# Build
npm run build

# Verificar output
test -d .dist && echo "Build sucesso" || echo "Build falhou"

# Rodar dev server para teste manual
npm run dev &
# Abrir http://localhost:3000 no navegador
# Navegar até capítulo 06
# Testar flip mode (mouse/toque)
# Testar scroll mode (menu)
# Redimensionar janela para mobile (F12 → responsive design)
# Confirmar que todos os novos blocos renderizam sem quebrar layout
```

**Checklist de Responsividade**:
- [ ] Desktop (1920px): blocos dentro de pages, sem overflow
- [ ] Tablet (768px): texto legível, imagens escalam
- [ ] Mobile (375px): painéis/blocos stackam vertical, sem sair da borda
- [ ] Flip mode: pages flip sem artefatos visuais
- [ ] Scroll mode: blocos scrollam suave, sem saltos

### Verificação Fase 5

```bash
cd /home/otbox/Documentos/Projetos/manual-do-bixo-ultimate/web
npm run build
# Sucesso sem erros

# Inspeção visual:
# 1. Abrir dev server
# 2. Navegar para capítulo 06
# 3. Confirmar que novos blocos renderizam com cores temáticas
# 4. Testar mobile responsividade (DevTools → Device Toolbar)
# 5. Documentar visual antes/depois (screenshots ou descrição)
```

---

## Resumo de Arquivos a Criar/Modificar

### Criação
- `web/src/styles/hq-patterns.css` — padrões CSS, decorações, temas
- `web/src/components/IconBloco.astro`
- `web/src/components/CaixaDestaque.astro`
- `web/src/components/ListaDecorada.astro`
- `web/src/components/QuadroMini.astro`

### Modificação
- `web/src/types/hq.ts` — estender `Bloco` union com 4 novos tipos
- `web/src/utils/parse-capitulo.ts` — detectar/parsear nova sintaxe
- `web/src/components/BlocosHQ.astro` — renderizar novos tipos
- `web/src/styles/global.css` — importar hq-patterns.css, aceitar data-theme

### Piloto
- `capitulos/06-permanencia-estudantil.md` — aplicar nova sintaxe (versão editada)

---

## Notas Importantes

1. **Compatibilidade retroativa garantida**: Markdown legado (`- item`, `**MACETE!**`) continua funcionando. Novos marcadores (`→`, `★`, `**IMPORTANTE:**`) são aditivos.

2. **Performance**: Padrões CSS, sem imagens. Decorações via pseudo-elementos. Sem JS pesado.

3. **Responsividade mobile-first**: Padrões CSS respondem. Componentes usam flex/grid. Testados em 375px+.

4. **Sem quebra de componentes existentes**: FlipBook.astro, PaginaHQ.astro, Panel.astro continuam intactos. Mudanças apenas em BlocosHQ (interno) e novos tipos.

5. **Tema por capítulo**: Cada edição pode ter uma cor primária (red/blue/green/yellow) definida globalmente. Blocos herdam via `data-theme` ou classe.

6. **Padrões CSS reutilizáveis**: Qualquer elemento pode receber `.pattern-halftone`, `.shadow-strong`, `.corner-triangle` para estilo consistente.

7. **Teste piloto antes de rollout**: Fase 5 valida tudo antes de aplicar a todo o projeto.

---

## Ordem de Execução Recomendada

1. **Fase 1** → CSS (base para tudo)
2. **Fase 4** → Types (define contrato)
3. **Fase 2** → Componentes (implementam contrato)
4. **Fase 3** → Parser (gera novos tipos)
5. **Fase 5** → Piloto (valida tudo)

Cada fase deixa o build em estado válido.
