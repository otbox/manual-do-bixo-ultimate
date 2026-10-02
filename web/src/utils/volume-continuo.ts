import type { Edicao, EdicaoResumo, PaginaHQ } from '../types/hq';

export type FolhaContinua =
  | { kind: 'capa-geral'; index: number }
  | { kind: 'sumario'; index: number }
  | { kind: 'divisor'; index: number; edicao: Edicao }
  | { kind: 'pagina'; index: number; edicao: Edicao; pagina: PaginaHQ };

export type VolumeContinuo = {
  folhas: FolhaContinua[];
  totalFolhas: number;
  sumarioPageIndex: number;
  /** Índices para o sumário: slug → id da página → índice no flipbook */
  indicePaginas: Record<string, Record<string, number>>;
  /** Índice da página-divisor de cada edição */
  indiceDivisor: Record<string, number>;
};

/** Monta o volume único: capa geral + sumário + (divisor + páginas) de cada edição. */
export function buildVolumeContinuo(edicoes: Edicao[]): VolumeContinuo {
  const folhas: FolhaContinua[] = [];
  const indicePaginas: Record<string, Record<string, number>> = {};
  const indiceDivisor: Record<string, number> = {};

  folhas.push({ kind: 'capa-geral', index: 0 });
  folhas.push({ kind: 'sumario', index: 1 });

  let index = 2;
  for (const edicao of edicoes) {
    indiceDivisor[edicao.slug] = index;
    folhas.push({ kind: 'divisor', index, edicao });
    index += 1;

    indicePaginas[edicao.slug] = {};
    for (const pagina of edicao.paginas) {
      indicePaginas[edicao.slug][pagina.id] = index;
      folhas.push({ kind: 'pagina', index, edicao, pagina });
      index += 1;
    }
  }

  return {
    folhas,
    totalFolhas: folhas.length,
    sumarioPageIndex: 1,
    indicePaginas,
    indiceDivisor,
  };
}

export function totalPaginasConteudo(edicoes: Edicao[]): number {
  return edicoes.reduce((acc, e) => acc + e.paginas.length, 0);
}

export function resumosComIndices(
  edicoes: Edicao[],
  volume: VolumeContinuo,
): (EdicaoResumo & { divisorIndex: number; paginaIndices: number[] })[] {
  return edicoes.map((e) => ({
    slug: e.slug,
    numero: e.numero,
    titulo: e.titulo,
    paginas: e.paginas.map((p) => ({ id: p.id, titulo: p.titulo })),
    divisorIndex: volume.indiceDivisor[e.slug] ?? 0,
    paginaIndices: e.paginas.map((p) => volume.indicePaginas[e.slug]?.[p.id] ?? 0),
  }));
}
