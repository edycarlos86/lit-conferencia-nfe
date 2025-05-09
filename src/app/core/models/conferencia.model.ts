export interface ConferenciaItem {
  codigo: string;
  descricao?: string;
  quantidade: number;
}

export interface Conferencia {
  id?: number;
  notaId: number;
  numeroNota: string;
  serieNota: string;
  chaveRegistro: string;
  items: ConferenciaItem[];
  data: string; // ISO
}
