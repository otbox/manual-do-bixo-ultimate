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

function flushList(alvo: Alvo, itens: string[]) {
  if (itens.length === 0) return;
  alvo.blocos.push({ type: 'macete', itens: [...itens] });
  itens.length = 0;
}

function flushParagraph(alvo: Alvo, lines: string[]) {
  const text = lines.join('\n').trim();
  if (!text) return;
  alvo.blocos.push({ type: 'texto', markdown: text });
  lines.length = 0;
}

/**
 * Converte Markdown GFM do capítulo no modelo tipado da HQ.
 * `#` capa · `##` página · `###` panel · `>` balão · listas → MACETE!
 * Conteúdo entre `#` e o primeiro `##` é anexado à primeira página.
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

  const paraLines: string[] = [];
  const listItens: string[] = [];
  const quoteLines: string[] = [];

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

  const flushPending = () => {
    endQuote();
    const a = getAlvo();
    flushList(a, listItens);
    flushParagraph(a, paraLines);
  };

  const takePreamble = (): Bloco[] => {
    if (preamble.length === 0) return [];
    const copy = [...preamble];
    preamble.length = 0;
    return copy;
  };

  for (const line of lines) {
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

      // ### — se ainda não há ##, cria página a partir do título do panel
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
      flushList(getAlvo(), listItens);
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

    const listItem = /^(?:[-*+]|\d+\.)\s+(.+)$/.exec(line);
    if (listItem) {
      flushParagraph(getAlvo(), paraLines);
      listItens.push(listItem[1].trim());
      continue;
    }

    if (listItens.length > 0 && line.trim() === '') {
      flushList(getAlvo(), listItens);
      continue;
    }
    if (listItens.length > 0) {
      flushList(getAlvo(), listItens);
    }

    if (line.trim() === '') {
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
