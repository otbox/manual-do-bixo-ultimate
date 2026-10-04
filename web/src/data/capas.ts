export type CapaIconeId =
  | 'portao'
  | 'mapa'
  | 'bandeja'
  | 'carimbo'
  | 'brasao'
  | 'chave'
  | 'alerta'
  | 'festa'
  | 'megafone'
  | 'elos'
  | 'volume';

export type CapaTema = {
  /** Classe CSS `capa--slug` */
  tema: string;
  tagline: string;
  subtitulo: string;
  /** Palavra-estampa estilo HQ (canto) */
  estampa: string;
  /** Motivo decorativo */
  motivo: 'slash' | 'grid' | 'radar' | 'forms' | 'guild' | 'shield' | 'alert' | 'party' | 'megaphone';
  icone: CapaIconeId;
};

const capasPorNumero: Record<number, CapaTema> = {
  1: {
    tema: 'boas',
    tagline: 'FT · LIMEIRA · CALOURO',
    subtitulo: 'Você passou. A tempestade fica do outro lado do portão.',
    estampa: 'ENTROU!',
    motivo: 'slash',
    icone: 'portao',
  },
  2: {
    tema: 'campus',
    tagline: 'CIDADE · CAMPUS 1 · NÃO É CAMPINAS',
    subtitulo: 'Dois endereços. O seu é a FT. GPS mente; o mapa não.',
    estampa: 'LIMEIRA',
    motivo: 'grid',
    icone: 'mapa',
  },
  3: {
    tema: 'servicos',
    tagline: 'RU · CECOM · ÔNIBUS · NET',
    subtitulo: 'Poucos reais, fé e Pix. A FT proverá — o juízo, não.',
    estampa: 'BANDECO',
    motivo: 'radar',
    icone: 'bandeja',
  },
  4: {
    tema: 'burocracia',
    tagline: 'DAC · SIGA · MOODLE · CR',
    subtitulo: 'O portal não tem pressa. A tua rematrícula tem.',
    estampa: 'e-DAC',
    motivo: 'forms',
    icone: 'carimbo',
  },
  5: {
    tema: 'orgs',
    tagline: 'CA · ATLÉTICA · EJ · LIGA',
    subtitulo: 'Uma organização. Entrega. Depois expande.',
    estampa: 'GUILD',
    motivo: 'guild',
    icone: 'brasao',
  },
  6: {
    tema: 'permanencia',
    tagline: 'BOLSA · EDITAL · SAE · SAPPE',
    subtitulo: 'Permanecer também é dinheiro. Edital manda; PDF velho mente.',
    estampa: 'FICA',
    motivo: 'shield',
    icone: 'chave',
  },
  7: {
    tema: 'sobrevivencia',
    tagline: 'PROG 1 · PAD · PROVA · IC',
    subtitulo: 'A FT proverá a tomada. O CR continua sendo teu.',
    estampa: 'CR',
    motivo: 'alert',
    icone: 'alerta',
  },
  8: {
    tema: 'calourada',
    tagline: 'GINCANA · SOLIDÁRIO · FESTA',
    subtitulo: 'Integração sim. Humilhação não. Escolhe o lado certo.',
    estampa: 'TROTE+',
    motivo: 'party',
    icone: 'festa',
  },
  9: {
    tema: 'movimento',
    tagline: 'CA · DCE · ASSEMBLEIA',
    subtitulo: 'Voz formal dos alunos. Não seja pego de surpresa.',
    estampa: 'PAUTA',
    motivo: 'megaphone',
    icone: 'megafone',
  },
  10: {
    tema: 'links',
    tagline: 'DAC · WIFI · ZAP · 23h59',
    subtitulo: 'O link que o grupo nunca manda. Favorita agora.',
    estampa: 'SALVA',
    motivo: 'radar',
    icone: 'elos',
  },
};

const fallback: CapaTema = {
  tema: 'default',
  tagline: 'MANUAL DO BIXO ULTIMATE',
  subtitulo: 'A HQ satírica que o DAC não imprimiu.',
  estampa: 'HQ',
  motivo: 'slash',
  icone: 'volume',
};

export function getCapaTema(numero: number): CapaTema {
  return capasPorNumero[numero] ?? fallback;
}
