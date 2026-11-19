import { SITUACOES } from "@/lib/dominio"
import type { Luminaria, Situacao } from "@/lib/tipos"

export interface Poste {
  id: string
  placa: string | null
  endereco: string | null
  lat: number
  lon: number
  situacao: Situacao
  ultimo_lux: number | null
  ultima_medicao: string | null
  ocorrencias_app: number
  luminarias: number
}

export type Contagem = Record<Situacao, number>

export function contagemVazia(): Contagem {
  return { apagada: 0, insuficiente: 0, ok: 0, sem_medicao: 0 }
}

const temCoordenada = (l: Luminaria) => Number.isFinite(l.lat) && Number.isFinite(l.lon)

export function agruparPostes(luminarias: readonly Luminaria[]): { postes: Poste[]; contagem: Contagem; total: number } {
  const porChave = new Map<string, Poste>()
  const contagem = contagemVazia()
  let total = 0
  for (const l of luminarias) {
    if (!temCoordenada(l)) continue
    const situacao: Situacao = SITUACOES.includes(l.situacao) ? l.situacao : "sem_medicao"
    contagem[situacao] += 1
    total += 1
    const chave = `${l.placa ?? `sem-placa-${l.id_luminaria}`}|${l.lat}|${l.lon}|${situacao}`
    const existente = porChave.get(chave)
    if (!existente) {
      porChave.set(chave, {
        id: chave,
        placa: l.placa,
        endereco: l.endereco,
        lat: l.lat,
        lon: l.lon,
        situacao,
        ultimo_lux: l.ultimo_lux,
        ultima_medicao: l.ultima_medicao,
        ocorrencias_app: l.ocorrencias_app ?? 0,
        luminarias: 1,
      })
      continue
    }
    existente.luminarias += 1
    if (l.ultimo_lux !== null && (existente.ultimo_lux === null || l.ultimo_lux < existente.ultimo_lux)) {
      existente.ultimo_lux = l.ultimo_lux
    }
    if (l.ultima_medicao && (!existente.ultima_medicao || l.ultima_medicao > existente.ultima_medicao)) {
      existente.ultima_medicao = l.ultima_medicao
    }
    existente.ocorrencias_app = Math.max(existente.ocorrencias_app, l.ocorrencias_app ?? 0)
    if (!existente.endereco && l.endereco) existente.endereco = l.endereco
  }
  return { postes: [...porChave.values()], contagem, total }
}

const ORDEM_DESENHO: Record<Situacao, number> = { sem_medicao: 0, ok: 1, insuficiente: 2, apagada: 3 }

export function ordenarParaDesenho(postes: readonly Poste[]): Poste[] {
  return [...postes].sort((a, b) => ORDEM_DESENHO[a.situacao] - ORDEM_DESENHO[b.situacao])
}

export function postesComFalha(postes: readonly Poste[]): Poste[] {
  return postes
    .filter((p) => p.situacao === "apagada" || p.situacao === "insuficiente")
    .sort((a, b) => {
      if (a.situacao !== b.situacao) return a.situacao === "apagada" ? -1 : 1
      const la = a.ultimo_lux ?? Number.POSITIVE_INFINITY
      const lb = b.ultimo_lux ?? Number.POSITIVE_INFINITY
      return la - lb
    })
}
