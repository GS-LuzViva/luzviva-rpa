
export type Area = "SE" | "PINHEIROS" | "CAMPO LIMPO"

export type Situacao = "ok" | "insuficiente" | "apagada" | "sem_medicao"

export type SituacaoComFalha = "apagada" | "insuficiente"

export type StatusChamado = "aberto" | "em_atendimento" | "concluido" | "cancelado"

export type CategoriaOcorrencia =
  | "luminaria_apagada"
  | "luminaria_acesa"
  | "luminaria_acesa_de_dia"
  | "luminaria_piscando"
  | "poste_danificado"
  | "fiacao_exposta"

export type DataHoraIso = string

export interface Envelope<T> {
  view: string
  gerado_em: DataHoraIso
  linhas: number
  dados: T[]
}

export interface Luminaria {
  id_luminaria: number
  placa: string | null
  endereco: string | null
  subprefeitura: Area
  lat: number
  lon: number
  ultima_medicao: DataHoraIso | null
  ultimo_lux: number | null
  situacao: Situacao
  ocorrencias_app: number
}

export interface ItemFila extends Luminaria {
  chamado_aberto: string | null
  status_chamado: StatusChamado | null
  confianca_visao: number | null
  prioridade: number
}

export interface PainelArea {
  subprefeitura: Area
  luminarias_cadastradas: number
  luminarias_inspecionadas: number
  apagadas: number
  insuficientes: number
  pct_com_falha: number
  mediana_horas_ate_reparo: number | null
  chamados_em_aberto: number
}

export interface Chamado {
  id_chamado: string
  placa: string
  area_piloto: Area
  prioridade: number
  situacao_detectada: SituacaoComFalha
  status: StatusChamado
  aberto_em: DataHoraIso
  atualizado_em: DataHoraIso
  concluido_em: DataHoraIso | null
  equipe: string | null
  origem: string
}

export interface ListaChamados {
  linhas: number
  dados: Chamado[]
}

export interface AlteracaoChamado {
  status?: StatusChamado
  equipe?: string
  concluido_em?: DataHoraIso
}

export interface Ocorrencia {
  id_ocorrencia: string
  data_hora: DataHoraIso
  categoria: CategoriaOcorrencia
  origem: "app_foto_cidadao" | "camera_visao"
  confianca_visao: number | null
  modelo_visao: string | null
  foto_id: string
  lat: number
  lon: number
  area_piloto: Area
  placa: string | null
}

export interface NovoRelato {
  foto: File
  categoria?: CategoriaOcorrencia
  placa?: string
  lat?: number
  lon?: number
  area_piloto?: Area
}

export interface Pergunta {
  pergunta: string
  placa?: string
}

export interface FonteAssistente {
  titulo?: string
  trecho?: string
}

export interface RespostaAssistente {
  resposta: string
  fontes: FonteAssistente[]
  recusou: boolean
  confianca: number
}
