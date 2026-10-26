export type Bloco =
  | { type: 'texto'; markdown: string }
  | { type: 'balao'; texto: string }
  | { type: 'dica'; itens: string[] }
  | { type: 'macete'; itens: string[] }
  | { type: 'figura'; src: string; alt: string }
  // Novos tipos para variedade visual
  | {
    type: 'icon-bloco';
    icon: string;
    tipo: 'info' | 'alerta' | 'importante' | 'dica';
    titulo: string;
    descricao: string;
  }
  | {
    type: 'caixa-destaque';
    tipo: 'importante' | 'alerta' | 'dica';
    titulo?: string;
    conteudo: string;
  }
  | {
    type: 'lista-decorada';
    tipo: 'setas' | 'simbolos' | 'numeros';
    itens: string[];
  }
  | {
    type: 'quadro-mini';
    titulo: string;
    conteudo: string;
    subtipo?: 'info' | 'alerta';
  };

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
