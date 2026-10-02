export type Bloco =
  | { type: 'texto'; markdown: string }
  | { type: 'balao'; texto: string }
  | { type: 'macete'; itens: string[] };

export type PanelHQ = {
  id: string;
  titulo: string;
  blocos: Bloco[];
};

export type PaginaHQ = {
  id: string;
  titulo: string;
  /** Conteúdo solto na página (antes de qualquer ###). */
  blocos: Bloco[];
  panels: PanelHQ[];
};

export type Edicao = {
  slug: string;
  /** Número extraído do prefixo do arquivo (ex.: 01 → 1). */
  numero: number;
  titulo: string;
  paginas: PaginaHQ[];
};

export type EdicaoResumo = {
  slug: string;
  numero: number;
  titulo: string;
  paginas: { id: string; titulo: string }[];
};

export type ModoLeitura = 'flip' | 'scroll';
