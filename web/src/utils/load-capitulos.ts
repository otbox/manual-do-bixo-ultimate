import type { Edicao, EdicaoResumo } from '../types/hq';
import { parseCapitulo } from './parse-capitulo';

const rawModules = import.meta.glob('../content/capitulos/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function slugFromPath(path: string): string {
  const file = path.split('/').pop() ?? path;
  return file.replace(/\.md$/, '');
}

export function loadAllEdicoes(): Edicao[] {
  return Object.entries(rawModules)
    .map(([path, raw]) => parseCapitulo(raw, slugFromPath(path)))
    .sort((a, b) => a.numero - b.numero || a.slug.localeCompare(b.slug));
}

export function loadEdicao(slug: string): Edicao | undefined {
  return loadAllEdicoes().find((e) => e.slug === slug);
}

export function toResumo(edicao: Edicao): EdicaoResumo {
  return {
    slug: edicao.slug,
    numero: edicao.numero,
    titulo: edicao.titulo,
    paginas: edicao.paginas.map((p) => ({ id: p.id, titulo: p.titulo })),
  };
}

export function loadResumos(): EdicaoResumo[] {
  return loadAllEdicoes().map(toResumo);
}
