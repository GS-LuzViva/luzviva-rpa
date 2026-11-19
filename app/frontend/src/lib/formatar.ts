import { NOMES_AREA, NOMES_SITUACAO, NOMES_STATUS, PRAZO_DIAS, STATUS_EM_ABERTO } from "@/lib/dominio"
import type { Area, Chamado, DataHoraIso, Situacao, StatusChamado } from "@/lib/tipos"

export const VAZIO = "—"

const NBSP = " "

const UM_DIA_MS = 86_400_000
const FUSO_SP = "America/Sao_Paulo"

const numero1 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 })
const numero0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 })
const percentual1 = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 })
const percentual0 = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 })

const ehNumero = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n)

export function formatarNumero(n: number | null | undefined, casas: 0 | 1 = 1): string {
  if (!ehNumero(n)) return VAZIO
  return (casas === 0 ? numero0 : numero1).format(n)
}

export function formatarLux(lux: number | null | undefined): string {
  if (!ehNumero(lux)) return "sem medição"
  return `${numero1.format(lux)}${NBSP}lux`
}

export function formatarPercentual(valor0a100: number | null | undefined): string {
  if (!ehNumero(valor0a100)) return VAZIO
  return percentual1.format(valor0a100 / 100)
}

export function formatarConfianca(valor0a1: number | null | undefined): string {
  if (!ehNumero(valor0a1)) return VAZIO
  return percentual0.format(valor0a1)
}

export function formatarHoras(horas: number | null | undefined): string {
  if (!ehNumero(horas)) return VAZIO
  return `${numero1.format(horas)}${NBSP}h`
}

export function nomeArea(area: Area | string | null | undefined): string {
  if (!area) return VAZIO
  return NOMES_AREA[area as Area] ?? area
}

const PALAVRAS_MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e", "a", "o"])
const SIGLAS = new Set(["SP", "II", "III", "IV"])

export function formatarEndereco(endereco: string | null | undefined): string | null {
  const limpo = (endereco ?? "").replace(/[\s,]+$/u, "").replace(/\s+/gu, " ").trim()
  if (!limpo) return null
  return limpo
    .split(" ")
    .map((palavra, indice) => {
      if (/\d/u.test(palavra) || SIGLAS.has(palavra.replace(/[^\p{L}]/gu, ""))) return palavra
      const minuscula = palavra.toLocaleLowerCase("pt-BR")
      if (indice > 0 && PALAVRAS_MINUSCULAS.has(minuscula)) return minuscula
      return minuscula.replace(/^(\p{L})/u, (letra) => letra.toLocaleUpperCase("pt-BR"))
    })
    .join(" ")
}

export function nomeSituacao(situacao: Situacao | string | null | undefined): string {
  if (!situacao) return VAZIO
  return NOMES_SITUACAO[situacao as Situacao] ?? situacao
}

export function nomeStatus(status: StatusChamado | string | null | undefined): string {
  if (!status) return VAZIO
  return NOMES_STATUS[status as StatusChamado] ?? status
}


const REGEX_ISO = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/

export function lerRelogio(iso: DataHoraIso | null | undefined): number | null {
  const m = REGEX_ISO.exec(iso ?? "")
  if (!m) return null
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0))
}

export function agoraSaoPaulo(agora: Date = new Date()): number {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_SP,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora)
  const valor = (tipo: Intl.DateTimeFormatPartTypes) => Number(partes.find((p) => p.type === tipo)?.value ?? 0)
  return Date.UTC(valor("year"), valor("month") - 1, valor("day"), valor("hour"), valor("minute"), valor("second"))
}

export function relogioParaIso(ms: number): DataHoraIso {
  return new Date(ms).toISOString().slice(0, 19)
}

const p2 = (n: number) => String(n).padStart(2, "0")

export function formatarDataHora(iso: DataHoraIso | null | undefined): string {
  const m = REGEX_ISO.exec(iso ?? "")
  if (!m) return iso ? String(iso) : VAZIO
  const dia = `${m[3]}/${m[2]}/${m[1]}`
  return m[4] ? `${dia} ${m[4]}:${m[5]}` : dia
}

export function formatarData(iso: DataHoraIso | null | undefined): string {
  const m = REGEX_ISO.exec(iso ?? "")
  if (!m) return iso ? String(iso) : VAZIO
  return `${m[3]}/${m[2]}/${m[1]}`
}

export function formatarRelogio(ms: number): string {
  const d = new Date(ms)
  return `${p2(d.getUTCDate())}/${p2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`
}


export interface Prazo {
  prazo: DataHoraIso | null
  atrasado: boolean
  diasAtraso: number
  diasRestantes: number
}

export function calcularPrazo(
  chamado: Pick<Chamado, "aberto_em" | "situacao_detectada" | "status">,
  agora: Date = new Date(),
): Prazo {
  const dias = PRAZO_DIAS[chamado.situacao_detectada]
  const aberto = lerRelogio(chamado.aberto_em)
  if (!dias || aberto === null) return { prazo: null, atrasado: false, diasAtraso: 0, diasRestantes: 0 }
  const limite = aberto + dias * UM_DIA_MS
  const diferenca = agoraSaoPaulo(agora) - limite
  const emAberto = STATUS_EM_ABERTO.includes(chamado.status)
  const atrasado = emAberto && diferenca > 0
  return {
    prazo: relogioParaIso(limite),
    atrasado,
    diasAtraso: atrasado ? Math.floor(diferenca / UM_DIA_MS) : 0,
    diasRestantes: diferenca < 0 ? Math.floor(-diferenca / UM_DIA_MS) : 0,
  }
}

export function textoAtraso(diasAtraso: number): string {
  if (diasAtraso < 1) return "Atrasado há menos de 1 dia"
  return diasAtraso === 1 ? "Atrasado há 1 dia" : `Atrasado há ${diasAtraso} dias`
}

export function plural(n: number, singular: string, pluralTexto: string, zero?: string): string {
  if (n === 0 && zero) return zero
  return `${formatarNumero(n, 0)} ${n === 1 ? singular : pluralTexto}`
}
