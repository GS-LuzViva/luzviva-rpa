import { formatarConfianca, plural } from "@/lib/formatar"
import type { SortingState } from "@tanstack/react-table"

import type { ItemFila } from "@/lib/tipos"

export const PONTOS_SITUACAO: Partial<Record<ItemFila["situacao"], number>> = { apagada: 60, insuficiente: 30 }
export const PONTOS_POR_RELATO = 10
export const MAXIMO_RELATOS = 30
export const PONTOS_VISAO = 10
export const LIMIAR_VISAO = 0.8

export interface ParcelaPrioridade {
  rotulo: string
  detalhe: string
  pontos: number
}

export interface DecomposicaoPrioridade {
  parcelas: ParcelaPrioridade[]
  total: number
  confere: boolean
}

export function confiancaVisao(item: Pick<ItemFila, "confianca_visao">): number | null {
  const valor = item.confianca_visao
  return typeof valor === "number" && valor > 0 ? valor : null
}

export function decomporPrioridade(item: ItemFila): DecomposicaoPrioridade {
  const base = PONTOS_SITUACAO[item.situacao] ?? 0
  const relatos = item.ocorrencias_app ?? 0
  const pontosRelatos = Math.min(MAXIMO_RELATOS, relatos * PONTOS_POR_RELATO)
  const confianca = confiancaVisao(item)
  const visaoConfirmou = typeof confianca === "number" && confianca >= LIMIAR_VISAO

  const parcelas: ParcelaPrioridade[] = [
    {
      rotulo:
        item.situacao === "apagada"
          ? "Luminária apagada"
          : item.situacao === "insuficiente"
            ? "Iluminação insuficiente"
            : item.situacao === "ok"
              ? "Medição dentro do normal"
              : "Sem medição do robô",
      detalhe: "apagada 60, insuficiente 30, demais 0",
      pontos: base,
    },
    {
      rotulo: plural(relatos, "relato de cidadão", "relatos de cidadãos", "Nenhum relato de cidadão"),
      detalhe: "10 por relato, até 30",
      pontos: pontosRelatos,
    },
    {
      rotulo:
        typeof confianca !== "number"
          ? "Nenhuma foto analisada pela visão"
          : visaoConfirmou
            ? `Visão confirmou com ${formatarConfianca(confianca)} de confiança`
            : `Visão com ${formatarConfianca(confianca)} de confiança`,
      detalhe: "10 quando a confiança é de 80% ou mais",
      pontos: visaoConfirmou ? PONTOS_VISAO : 0,
    },
  ]
  const total = Math.min(100, base + pontosRelatos + (visaoConfirmou ? PONTOS_VISAO : 0))
  return { parcelas, total, confere: total === Math.round(item.prioridade) }
}

export function normalizarBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/gu, " ")
    .trim()
}

export function filtrarFila(itens: readonly ItemFila[], busca: string): readonly ItemFila[] {
  const termo = normalizarBusca(busca)
  if (!termo) return itens
  const termoPlaca = termo.replace(/\s/gu, "")
  return itens.filter(
    (item) =>
      normalizarBusca(item.placa ?? "").includes(termoPlaca) ||
      normalizarBusca(item.endereco ?? "").includes(termo),
  )
}

export interface PosicaoNoPoste {
  posicao: number
  total: number
}

export function posicoesNoPoste(itens: readonly ItemFila[]): ReadonlyMap<number, PosicaoNoPoste> {
  const porPoste = new Map<string, number[]>()
  for (const item of itens) {
    if (!item.placa) continue
    const chave = `${item.subprefeitura}|${item.placa}`
    const ids = porPoste.get(chave)
    if (ids) ids.push(item.id_luminaria)
    else porPoste.set(chave, [item.id_luminaria])
  }
  const posicoes = new Map<number, PosicaoNoPoste>()
  for (const ids of porPoste.values()) {
    if (ids.length < 2) continue
    ids.sort((a, b) => a - b).forEach((id, indice) => posicoes.set(id, { posicao: indice + 1, total: ids.length }))
  }
  return posicoes
}

export function textoPosicaoNoPoste(idLuminaria: number, posicao: PosicaoNoPoste | undefined): string | null {
  if (!posicao) return null
  return `Luminária ${idLuminaria} · ${posicao.posicao} de ${posicao.total} no poste`
}

export type ColunaOrdenavel = "prioridade" | "lux" | "ocorrencias_app"

const VALOR_ORDEM: Record<ColunaOrdenavel, (item: ItemFila) => number | null> = {
  prioridade: (item) => item.prioridade,
  lux: (item) => item.ultimo_lux,
  ocorrencias_app: (item) => item.ocorrencias_app,
}

export function ehColunaOrdenavel(id: string): id is ColunaOrdenavel {
  return id in VALOR_ORDEM
}

export function ordenarFila(itens: readonly ItemFila[], id: ColunaOrdenavel, desc: boolean): ItemFila[] {
  const valor = VALOR_ORDEM[id]
  return itens
    .map((item, indice) => ({ item, indice, v: valor(item) }))
    .sort((a, b) => {
      if (a.v === null && b.v === null) return a.indice - b.indice
      if (a.v === null) return 1
      if (b.v === null) return -1
      const diferenca = desc ? b.v - a.v : a.v - b.v
      return diferenca || a.indice - b.indice
    })
    .map(({ item }) => item)
}

export const ORDEM_PADRAO: SortingState = [{ id: "prioridade", desc: true }]

export function lerOrdem(texto: string | null): SortingState {
  const [id, sentido] = (texto ?? "").split(":")
  if (!id || !ehColunaOrdenavel(id) || (sentido !== "asc" && sentido !== "desc")) return ORDEM_PADRAO
  return [{ id, desc: sentido === "desc" }]
}

export function escreverOrdem(ordem: SortingState): string {
  const atual = ordem[0] ?? ORDEM_PADRAO[0]
  return `${atual.id}:${atual.desc ? "desc" : "asc"}`
}

const NOMES_ORDEM: Record<string, { desc: string; asc: string }> = {
  prioridade: { desc: "da maior para a menor prioridade", asc: "da menor para a maior prioridade" },
  lux: { desc: "do maior para o menor lux", asc: "do menor para o maior lux" },
  ocorrencias_app: { desc: "do maior para o menor número de relatos", asc: "do menor para o maior número de relatos" },
}

export function descreverOrdem(ordem: SortingState): string {
  const atual = ordem[0]
  if (!atual) return ""
  const nomes = NOMES_ORDEM[atual.id]
  return nomes ? (atual.desc ? nomes.desc : nomes.asc) : ""
}
