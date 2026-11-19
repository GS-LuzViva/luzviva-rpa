import { ASSISTENTE_INDISPONIVEL } from "@/lib/api"
import type { ItemFila, RespostaAssistente } from "@/lib/tipos"

export interface Turno {
  id: number
  pergunta: string
  placa?: string
  resposta?: RespostaAssistente
}

export function ehIndisponivel(resposta: RespostaAssistente): boolean {
  return resposta.resposta.trim().startsWith(ASSISTENTE_INDISPONIVEL.resposta)
}

export function rotuloConfianca(confianca: number): string {
  if (confianca >= 0.8) return "alta"
  if (confianca >= 0.5) return "média"
  return "baixa"
}

export interface Sugestao {
  texto: string
  placa?: string
}

const SUGESTAO_AREA: Sugestao = { texto: "Quem é responsável pela área Campo Limpo?" }

export function montarSugestoes(fila: readonly ItemFila[] | undefined): Sugestao[] {
  const placas: string[] = []
  for (const item of fila ?? []) {
    if (item.placa && !placas.includes(item.placa)) placas.push(item.placa)
    if (placas.length === 2) break
  }
  const [primeira, segunda = primeira] = placas
  const sugestoes: Sugestao[] = []
  if (primeira) sugestoes.push({ texto: `Por que a ${primeira} está em primeiro na fila?`, placa: primeira })
  if (segunda) sugestoes.push({ texto: `Qual o prazo de reparo da ${segunda}?`, placa: segunda })
  sugestoes.push(SUGESTAO_AREA)
  return sugestoes
}
