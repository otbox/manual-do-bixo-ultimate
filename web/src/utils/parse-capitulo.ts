import type { Bloco, Edicao, PaginaHQ, PanelHQ } from '../types/hq';

type Alvo = { blocos: Bloco[] };

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith('---')) return raw;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return raw;
  return raw.slice(end + 4).replace(/^\s+/, '');
}

function flushList(alvo: Alvo, itens: string[], kind: 'dica' | 'macete') {
  if (itens.length === 0) return;
  alvo.blocos.push({ type: kind, itens: [...itens] });
  itens.length = 0;
}

function flushParagraph(alvo: Alvo, lines: string[]) {
  const text = lines.join('\n').trim();
  if (!text) return;
  alvo.blocos.push({ type: 'texto', markdown: text });
  lines.length = 0;
}

/**
 * Detecta padrão de IconBloco: **TIPO:** descrição ou **TIPO!** descrição
 * Retorna { tipo, titulo, descricao } ou null
 */
function parseIconBloco(text: string): { tipo: string; titulo: string; descricao: string } | null {
  const match = /^\*\*(IMPORTANTE|ALERTA|DICA|INFO)[!:]?\*\*\s+(.+)$/i.exec(text);
  if (!match) return null;
  const tipoRaw = match[1].toLowerCase();
  const tipoMap: Record<string, string> = {
    importante: 'importante',
    alerta: 'alerta',
    dica: 'dica',
    info: 'info',
  };
  const tipo = tipoMap[tipoRaw] || 'info';
  const descricao = match[2].trim();
  return {
    tipo,
    titulo: match[1].replace(/!$/, ''),
    descricao,
  };
}

/**
 * Detecta padrão de CaixaDestaque: **ALERTA!** ou **IMPORTANTE!** em linha separada
 * (presume que tem conteúdo que segue)
 */
function parseCaixaDestaqueHeader(text: string): { tipo: string } | null {
  const match = /^\*\*(IMPORTANTE|ALERTA|DICA)[!]?\*\*$/i.exec(text.trim());
  if (!match) return null;
  const tipoRaw = match[1].toLowerCase();
  const tipoMap: Record<string, string> = {
    importante: 'importante',
    alerta: 'alerta',
    dica: 'dica',
  };
  return { tipo: tipoMap[tipoRaw] || 'importante' };
}

/**
 * Detecta padrão de ListaDecorada: linhas começando com → ou ★
 */
function detectListDecoradaMarker(line: string): { tipo: string; item: string } | null {
  const setas = /^→\s+(.+)$/;
  const simbolos = /^★\s+(.+)$/;

  if (setas.test(line)) {
    const match = setas.exec(line);
    return { tipo: 'setas', item: match![1].trim() };
  }
  if (simbolos.test(line)) {
    const match = simbolos.exec(line);
    return { tipo: 'simbolos', item: match![1].trim() };
  }
  return null;
}

/**
 * Converte Markdown GFM do capítulo no modelo tipado da HQ.
 * `#` capa · `##` página · `###` panel · `>` balão
 * Listas → DICA! (padrão). Heading com "macete" → MACETE! (só o específico).
 * Conteúdo entre `#` e o primeiro `##` é anexado à primeira página.
 *
 * Novos padrões:
 * - **IMPORTANTE:** ... → IconBloco
 * - **ALERTA!** ... → CaixaDestaque
 * - → item / ★ item → ListaDecorada
 */
export function parseCapitulo(raw: string, fileSlug: string): Edicao {
  const body = stripFrontmatter(raw);
  const lines = body.split(/\r?\n/);

  const numeroMatch = fileSlug.match(/^(\d+)/);
  const numero = numeroMatch ? Number(numeroMatch[1]) : 0;

  let titulo = fileSlug;
  const paginas: PaginaHQ[] = [];
  const preamble: Bloco[] = [];
  const preambleAlvo: Alvo = { blocos: preamble };

  let paginaAtual: PaginaHQ | null = null;
  let panelAtual: PanelHQ | null = null;
  /** Listas herdam o tipo do último heading (##/###). */
  let listKind: 'dica' | 'macete' = 'dica';

  const paraLines: string[] = [];
  const listItens: string[] = [];
  const quoteLines: string[] = [];
  const listaDecoradaItens: Array<{ tipo: string; items: string[] }> = [];
  let listaDecoradaTipo: string | null = null;

  const getAlvo = (): Alvo => {
    if (!paginaAtual) return preambleAlvo;
    return panelAtual ?? paginaAtual;
  };

  const endQuote = () => {
    if (quoteLines.length === 0) return;
    const texto = quoteLines.join('\n').trim();
    if (texto) getAlvo().blocos.push({ type: 'balao', texto });
    quoteLines.length = 0;
  };

  const flushListaDecorada = () => {
    if (!listaDecoradaTipo || listaDecoradaItens.length === 0) return;
    getAlvo().blocos.push({
      type: 'lista-decorada' as const,
      tipo: listaDecoradaTipo as 'setas' | 'simbolos' | 'numeros',
      itens: listaDecoradaItens,
    });
    listaDecoradaItens.length = 0;
    listaDecoradaTipo = null;
  };

  const flushPending = () => {
    endQuote();
    flushListaDecorada();
    const a = getAlvo();
    flushList(a, listItens, listKind);
    flushParagraph(a, paraLines);
  };

  const takePreamble = (): Bloco[] => {
    if (preamble.length === 0) return [];
    const copy = [...preamble];
    preamble.length = 0;
    return copy;
  };

  const setListKindFromHeading = (text: string) => {
    listKind = /macete/i.test(text) ? 'macete' : 'dica';
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushPending();

      const level = heading[1].length;
      const text = heading[2].trim();

      if (level === 1) {
        titulo = text;
        continue;
      }

      if (level === 2) {
        setListKindFromHeading(text);
        paginaAtual = {
          id: slugify(text) || `pagina-${paginas.length + 1}`,
          titulo: text,
          blocos: takePreamble(),
          panels: [],
        };
        paginas.push(paginaAtual);
        panelAtual = null;
        continue;
      }

      // ###
      setListKindFromHeading(text);
      if (!paginaAtual) {
        paginaAtual = {
          id: 'abertura',
          titulo: 'Abertura',
          blocos: takePreamble(),
          panels: [],
        };
        paginas.push(paginaAtual);
      }

      panelAtual = {
        id: slugify(text) || `panel-${paginaAtual.panels.length + 1}`,
        titulo: text,
        blocos: [],
      };
      paginaAtual.panels.push(panelAtual);
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushListaDecorada();
      flushList(getAlvo(), listItens, listKind);
      flushParagraph(getAlvo(), paraLines);
      quoteLines.push(line.replace(/^>\s?/, ''));
      continue;
    }

    if (quoteLines.length > 0 && line.trim() === '') {
      endQuote();
      continue;
    }
    if (quoteLines.length > 0) {
      endQuote();
    }

    const imagem = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line.trim());
    if (imagem) {
      flushListaDecorada();
      flushList(getAlvo(), listItens, listKind);
      flushParagraph(getAlvo(), paraLines);
      getAlvo().blocos.push({
        type: 'figura',
        alt: imagem[1].trim() || 'Ilustração',
        src: imagem[2].trim(),
      });
      continue;
    }

    // Teste IconBloco (inline em parágrafo)
    const iconBlocoMatch = parseIconBloco(line.trim());
    if (iconBlocoMatch && line.trim().startsWith('**')) {
      flushListaDecorada();
      flushList(getAlvo(), listItens, listKind);
      flushParagraph(getAlvo(), paraLines);
      getAlvo().blocos.push({
        type: 'icon-bloco' as const,
        icon: '📌',
        tipo: iconBlocoMatch.tipo as 'info' | 'alerta' | 'importante' | 'dica',
        titulo: iconBlocoMatch.titulo,
        descricao: iconBlocoMatch.descricao,
      });
      continue;
    }

    // Teste CaixaDestaque (header line)
    const caixaDestHeader = parseCaixaDestaqueHeader(line);
    if (caixaDestHeader) {
      flushListaDecorada();
      flushList(getAlvo(), listItens, listKind);
      flushParagraph(getAlvo(), paraLines);

      // Coleta próximas linhas até linha vazia como conteúdo
      const conteudoLines: string[] = [];
      for (let jdx = idx + 1; jdx < lines.length; jdx++) {
        const nextLine = lines[jdx];
        if (nextLine.trim() === '' || /^(#{1,3}\s|>|[-*+]|\d+\.|!\[)/.test(nextLine)) {
          break;
        }
        conteudoLines.push(nextLine);
      }

      if (conteudoLines.length > 0) {
        idx += conteudoLines.length;
        getAlvo().blocos.push({
          type: 'caixa-destaque' as const,
          tipo: caixaDestHeader.tipo as 'importante' | 'alerta' | 'dica',
          conteudo: conteudoLines.join('\n').trim(),
        });
      }
      continue;
    }

    // Teste ListaDecorada (→ ou ★)
    const decoratedItem = detectListDecoradaMarker(line.trim());
    if (decoratedItem) {
      if (!listaDecoradaTipo) {
        flushList(getAlvo(), listItens, listKind);
        flushParagraph(getAlvo(), paraLines);
        listaDecoradaTipo = decoratedItem.tipo;
      }

      if (listaDecoradaTipo === decoratedItem.tipo) {
        listaDecoradaItens.push(decoratedItem.item);
        continue;
      } else {
        // Tipo mudou, finalize e inicie novo
        flushListaDecorada();
        listaDecoradaTipo = decoratedItem.tipo;
        listaDecoradaItens.push(decoratedItem.item);
        continue;
      }
    } else if (listaDecoradaTipo && line.trim() !== '') {
      // Fim da lista decorada se tiver outro conteúdo
      if (!/^(#{1,3}\s|>|-\s|\*\s|\+\s|\d+\.)/.test(line)) {
        flushListaDecorada();
      }
    }

    // Listas comuns (legado - mantém compatibilidade)
    const listItem = /^(?:[-*+]|\d+\.)\s+(.+)$/.exec(line);
    if (listItem) {
      flushListaDecorada();
      flushParagraph(getAlvo(), paraLines);
      listItens.push(listItem[1].trim());
      continue;
    }

    if (listItens.length > 0 && line.trim() === '') {
      flushList(getAlvo(), listItens, listKind);
      continue;
    }
    if (listItens.length > 0) {
      flushList(getAlvo(), listItens, listKind);
    }

    if (line.trim() === '') {
      flushListaDecorada();
      flushParagraph(getAlvo(), paraLines);
      continue;
    }

    paraLines.push(line);
  }

  flushPending();

  if (preamble.length > 0 && paginas.length === 0) {
    paginas.push({
      id: 'abertura',
      titulo: 'Abertura',
      blocos: takePreamble(),
      panels: [],
    });
  } else if (preamble.length > 0 && paginas[0]) {
    paginas[0].blocos = [...takePreamble(), ...paginas[0].blocos];
  }

  return {
    slug: fileSlug,
    numero,
    titulo,
    paginas,
  };
}
