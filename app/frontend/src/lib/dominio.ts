import type { Area, CategoriaOcorrencia, Situacao, SituacaoComFalha, StatusChamado } from "@/lib/tipos"

export const AREAS: readonly Area[] = ["SE", "PINHEIROS", "CAMPO LIMPO"]

export const NOMES_AREA: Record<Area, string> = {
  SE: "Sé",
  PINHEIROS: "Pinheiros",
  "CAMPO LIMPO": "Campo Limpo",
}

export function ehArea(valor: unknown): valor is Area {
  return typeof valor === "string" && (AREAS as readonly string[]).includes(valor)
}

export const SITUACOES: readonly Situacao[] = ["apagada", "insuficiente", "ok", "sem_medicao"]

export const NOMES_SITUACAO: Record<Situacao, string> = {
  ok: "Ok",
  insuficiente: "Insuficiente",
  apagada: "Apagada",
  sem_medicao: "Sem medição",
}

export const STATUS_CHAMADO: readonly StatusChamado[] = ["aberto", "em_atendimento", "concluido", "cancelado"]

export const STATUS_EM_ABERTO: readonly StatusChamado[] = ["aberto", "em_atendimento"]

export const NOMES_STATUS: Record<StatusChamado, string> = {
  aberto: "Aberto",
  em_atendimento: "Em atendimento",
  concluido: "Concluído",
  cancelado: "Cancelado",
}

export const TRANSICOES_STATUS: Record<StatusChamado, readonly StatusChamado[]> = {
  aberto: ["em_atendimento", "concluido", "cancelado"],
  em_atendimento: ["concluido", "cancelado"],
  concluido: [],
  cancelado: [],
}

export const CATEGORIAS_RELATO: readonly CategoriaOcorrencia[] = [
  "luminaria_apagada",
  "luminaria_piscando",
  "luminaria_acesa_de_dia",
  "poste_danificado",
  "fiacao_exposta",
]

export const NOMES_CATEGORIA: Record<CategoriaOcorrencia, string> = {
  luminaria_apagada: "Luminária apagada",
  luminaria_acesa: "Luminária acesa",
  luminaria_acesa_de_dia: "Luminária acesa de dia",
  luminaria_piscando: "Luminária piscando",
  poste_danificado: "Poste danificado",
  fiacao_exposta: "Fiação exposta",
}

export const LIMIAR_APAGADA_LUX = 1
export const LIMIAR_INSUFICIENTE_LUX = 5

export const PRAZO_DIAS: Record<SituacaoComFalha, number> = { apagada: 5, insuficiente: 10 }

export const EQUIPES: Record<Area, string> = {
  SE: "EQUIPE-CENTRO",
  PINHEIROS: "EQUIPE-OESTE",
  "CAMPO LIMPO": "EQUIPE-SUL",
}

export const REGEX_PLACA = /^IP\d{7}$/

export function normalizarPlaca(texto: string): string {
  return texto.replace(/\s+/g, "").toUpperCase()
}

export function placaValida(texto: string | null | undefined): boolean {
  return typeof texto === "string" && REGEX_PLACA.test(texto)
}

export const CORES_MAPA: Record<Situacao, string> = {
  ok: "#22A06B",
  insuficiente: "#E8A317",
  apagada: "#D92D20",
  sem_medicao: "#8C96A3",
}

export const BORDA_MAPA = { color: "#FFFFFF", weight: 1.5 } as const
