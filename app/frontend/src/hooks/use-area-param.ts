import { useCallback } from "react"
import { useSearchParams } from "react-router"

import { AREAS } from "@/lib/dominio"
import type { Area } from "@/lib/tipos"

export const PARAMETRO_AREA = "area"
export const VALOR_TODAS = "TODAS"
export const AREA_PADRAO: Area = "SE"

export function lerArea(valor: string | null): Area | null {
  if (!valor) return null
  const normal = valor.trim().toUpperCase().replace(/[_-]+/g, " ")
  return (AREAS as readonly string[]).includes(normal) ? (normal as Area) : null
}

export interface OpcoesAreaParam {
  permitirTodas?: boolean
}

export function useAreaParam(): [Area, (area: Area) => void]
export function useAreaParam(opcoes: { permitirTodas: true }): [Area | null, (area: Area | null) => void]
export function useAreaParam(opcoes?: OpcoesAreaParam): [Area | null, (area: Area | null) => void]
export function useAreaParam(opcoes: OpcoesAreaParam = {}): [Area | null, (area: Area) => void] {
  const [parametros, setParametros] = useSearchParams()
  const bruto = parametros.get(PARAMETRO_AREA)
  const permitirTodas = Boolean(opcoes.permitirTodas)
  const area: Area | null =
    permitirTodas && bruto?.trim().toUpperCase() === VALOR_TODAS ? null : (lerArea(bruto) ?? AREA_PADRAO)

  const definir = useCallback(
    (nova: Area | null) => {
      setParametros(
        (atuais) => {
          const proximos = new URLSearchParams(atuais)
          proximos.set(PARAMETRO_AREA, nova ?? (permitirTodas ? VALOR_TODAS : AREA_PADRAO))
          return proximos
        },
        { replace: true },
      )
    },
    [setParametros, permitirTodas],
  )
  return [area, definir]
}
