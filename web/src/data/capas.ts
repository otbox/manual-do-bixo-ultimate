export type CapaTema = {
  /** Classe CSS `capa--slug` */
  tema: string;
  tagline: string;
  subtitulo: string;
  /** Palavra-estampa estilo HQ (canto) */
  estampa: string;
  /** Motivo decorativo */
  motivo: 'slash' | 'grid' | 'radar' | 'forms' | 'guild' | 'shield' | 'alert' | 'party' | 'megaphone';
};

const capasPorNumero: Record<number, CapaTema> = {
  1: {
    tema: 'boas',
    tagline: 'ORIGEM · CALOURO · UNICAMP',
    subtitulo: 'Você passou. Agora respira — e vira a página.',
    estampa: 'ENTROU!',
    motivo: 'slash',
  },
  2: {
    tema: 'campus',
    tagline: 'LIMEIRA · FT · CAMPUS 1',
    subtitulo: 'Não é Campinas. É FT. Aprende o mapa.',
    estampa: 'MAPA',
    motivo: 'grid',
  },
  3: {
    tema: 'servicos',
    tagline: 'RU · CECOM · CIRCULAR · NET',
    subtitulo: 'Infraestrutura pra continuar vivo entre uma aula e outra.',
    estampa: 'BANDECO',
    motivo: 'radar',
  },
  4: {
    tema: 'burocracia',
    tagline: 'DAC · SIGA · MOODLE · CR/CP',
    subtitulo: 'Formulário com regra. Domina o portal ou ele te atrasa.',
    estampa: 'e-DAC',
    motivo: 'forms',
  },
  5: {
    tema: 'orgs',
    tagline: 'CA · ATLÉTICA · EJ · LIGAS',
    subtitulo: 'Entidades do campus: entra pelo interesse, não pela logo.',
    estampa: 'ENTRA',
    motivo: 'guild',
  },
  6: {
    tema: 'permanencia',
    tagline: 'DEAPE · BOLSAS · SAE · SAPPE',
    subtitulo: 'Permanecer também é política — e edital vigente.',
    estampa: 'FICA',
    motivo: 'shield',
  },
  7: {
    tema: 'sobrevivencia',
    tagline: 'PROG 1 · PAD · PROVA · IC',
    subtitulo: 'A FT proverá tomada. O CR, você proverá.',
    estampa: 'ATENÇÃO',
    motivo: 'alert',
  },
  8: {
    tema: 'calourada',
    tagline: 'GINCANA · SOLIDÁRIO · FESTA',
    subtitulo: 'Integração sim. Humilhação não. Escolhe o lado certo.',
    estampa: 'TROTE+',
    motivo: 'party',
  },
  9: {
    tema: 'movimento',
    tagline: 'CA · DCE · ASSEMBLEIA · PAUTA',
    subtitulo: 'Voz formal dos alunos — e o mapa pra não ser pego de surpresa.',
    estampa: 'INFO',
    motivo: 'megaphone',
  },
  10: {
    tema: 'links',
    tagline: 'DAC · MOODLE · WIFI · ZAP',
    subtitulo: 'Favorita o que salva a semana. O resto fica no inventário.',
    estampa: 'LINKS',
    motivo: 'radar',
  },
};

const fallback: CapaTema = {
  tema: 'default',
  tagline: 'MANUAL DO BIXO ULTIMATE',
  subtitulo: 'A HQ satírica que o DAC não imprimiu',
  estampa: 'HQ',
  motivo: 'slash',
};

export function getCapaTema(numero: number): CapaTema {
  return capasPorNumero[numero] ?? fallback;
}
