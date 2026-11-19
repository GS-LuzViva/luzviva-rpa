import { useSyncExternalStore } from "react"
import { CircleHelp, Lightbulb, LightbulbOff, SunDim, type LucideIcon } from "lucide-react"

import type { Situacao } from "@/lib/tipos"

export const VISUAL_SITUACAO: Record<Situacao, { icone: LucideIcon; ponto: string; texto: string }> = {
  apagada: { icone: LightbulbOff, ponto: "bg-apagada-mapa", texto: "text-apagada" },
  insuficiente: { icone: SunDim, ponto: "bg-insuficiente-mapa", texto: "text-insuficiente" },
  ok: { icone: Lightbulb, ponto: "bg-ok-mapa", texto: "text-ok" },
  sem_medicao: { icone: CircleHelp, ponto: "bg-sem-medicao-mapa", texto: "text-sem-medicao" },
}

export const RAIO_SITUACAO: Record<Situacao, number> = { apagada: 8, insuficiente: 7, ok: 5, sem_medicao: 4 }

export const ORDEM_LEGENDA: readonly Situacao[] = ["apagada", "insuficiente", "ok", "sem_medicao"]

export const PLURAL_SITUACAO: Record<Situacao, [string, string]> = {
  apagada: ["apagada", "apagadas"],
  insuficiente: ["insuficiente", "insuficientes"],
  ok: ["ok", "ok"],
  sem_medicao: ["sem medição", "sem medição"],
}

const CONSULTA_MOVIMENTO = "(prefers-reduced-motion: reduce)"

function assinarMovimento(aoMudar: () => void) {
  const consulta = window.matchMedia(CONSULTA_MOVIMENTO)
  consulta.addEventListener("change", aoMudar)
  return () => consulta.removeEventListener("change", aoMudar)
}

export function useMovimentoReduzido(): boolean {
  return useSyncExternalStore(
    assinarMovimento,
    () => window.matchMedia(CONSULTA_MOVIMENTO).matches,
    () => false,
  )
}

const CONSULTA_DESKTOP = "(min-width: 1024px)"

function assinarDesktop(aoMudar: () => void) {
  const consulta = window.matchMedia(CONSULTA_DESKTOP)
  consulta.addEventListener("change", aoMudar)
  return () => consulta.removeEventListener("change", aoMudar)
}

export function useTelaLarga(): boolean {
  return useSyncExternalStore(
    assinarDesktop,
    () => window.matchMedia(CONSULTA_DESKTOP).matches,
    () => true,
  )
}

const CONSULTA_ESTREITA = "(max-width: 359px)"

function assinarEstreita(aoMudar: () => void) {
  const consulta = window.matchMedia(CONSULTA_ESTREITA)
  consulta.addEventListener("change", aoMudar)
  return () => consulta.removeEventListener("change", aoMudar)
}

export function useTelaEstreita(): boolean {
  return useSyncExternalStore(
    assinarEstreita,
    () => window.matchMedia(CONSULTA_ESTREITA).matches,
    () => false,
  )
}
