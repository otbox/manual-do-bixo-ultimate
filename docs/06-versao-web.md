# Versão Web — Conceito "Manual em Quadrinhos"

## Conceito

A versão web do Manual do Bixo Ultimate será uma página no estilo **revista em quadrinhos (HQ)**: o leitor folheia o manual como quem vira as páginas de um gibi. Cada capítulo markdown vira uma "edição", e cada seção do capítulo vira uma página da HQ.

## Por que esse formato

- Combina com a tradição: os manuais de bixo sempre foram impressos, com diagramação caprichada — a HQ traduz isso pra web.
- A voz do veterano fica natural em balões de fala e caixas de narração.
- Leitura por "virada de página" cria ritmo e senso de descoberta — ideal para revelar macetes página a página.

## Comportamento da página

- **Efeito de folhear**: transição de página realista (page-flip), com som de página opcional.
- **Sumário**: índice clicável com todas as edições (capítulos) e páginas (seções).
- **Navegação**: setas/gestos de próxima e anterior, indicador de progresso ("Página 3 de 12").
- **Modo contínuo**: opção de leitura em scroll para acessibilidade e SEO.
- **Responsivo**: mobile-first — o público lê no celular.

## Estética

- Molduras de quadrinho (gutters/panels) separando as seções.
- Balões de fala para macetes e tiradas; caixas de narração para contexto.
- Tipografia estilo HQ para títulos (ex.: fonte tipo "Bangers") + sans-serif legível no corpo.
- Paleta de revista impressa (papel creme, tinta preta, cores primárias de destaque).

## Mapeamento markdown → HQ

| Markdown | Elemento da página |
|---|---|
| Arquivo em capitulos/ | Edição (capítulo da HQ) |
| # Título | Capa da edição |
| ## Seção | Página da HQ |
| ### Subseção | Quadro/panel |
| Blockquote (fala do veterano) | Balão de fala |
| Listas de macetes | Caixa de destaque estilo "DICA!" |

## Stack sugerida

- Gerador estático com suporte a Markdown/MDX (ex.: Astro).
- Biblioteca de page-flip (ex.: StPageFlip) ou implementação própria em CSS/JS.
- Conteúdo lido direto de capitulos/ em build time.

## Prompt de geração da aplicação

Use este prompt para gerar o esqueleto da aplicação web com uma ferramenta de IA ou como briefing de desenvolvimento:

```
Crie uma aplicação web estática que transforma uma coleção de arquivos
Markdown em um site no estilo de revista em quadrinhos (HQ) folheável.

REQUISITOS

1. Conteúdo
- Os arquivos Markdown ficam em uma pasta `content/` (um arquivo = uma
  "edição" da HQ).
- Cada arquivo usa GFM: 1 `#` (capa/título da edição), `##` (páginas),
  `###` (quadros/panels), blockquotes (falas de um narrador).

2. Renderização como HQ
- O título `#` gera uma capa de edição estilizada como capa de gibi.
- Cada `##` vira uma página; cada `###` vira um quadro com moldura grossa
  preta (panel).
- Blockquotes viram balões de fala com rabicho apontando para cima
  (narração de um "veterano").
- Listas viram caixas de destaque com selo estampado "DICA!/MACETE!".

3. Navegação
- Efeito de virar página realista (page-flip) entre as páginas,
  com biblioteca como StPageFlip ou implementação própria.
- Sumário clicável listando edições e páginas; teclas de seta e gestos
  touch; indicador "Página X de Y".
- Modo alternativo de leitura em rolagem contínua (toggle), mantendo
  âncoras de sumário funcionando, para acessibilidade e SEO.

4. Estética
- Visual de revista impressa: fundo cor de papel (creme), tinta preta,
  cores primárias de destaque (vermelho/amarelo/azul).
- Títulos em fonte estilo quadrinhos (ex.: Bangers via Google Fonts) e
  corpo em sans-serif altamente legível.
- Mobile-first, responsivo.

5. Técnica
- Gerador estático com suporte a Markdown/MDX (preferência: Astro).
- Build lê os arquivos de `content/` automaticamente; adicionar um novo
  capítulo = adicionar um arquivo Markdown.
- Saída otimizada para GitHub Pages.

Entregue: estrutura de pastas, componentes (Capa, Página, Panel,
Balão, Sumário, Controles), exemplo de integração com StPageFlip e um
conteúdo de demonstração com 2 edições.
```

## Roadmap da versão web

1. Finalizar os capítulos em markdown (fase atual).
2. Validar o conceito com um protótipo de 1 edição.
3. Gerar a aplicação a partir do prompt acima.
4. Publicar (GitHub Pages) e apontar a URL no "About" do repositório.
