import { cn } from "@/lib/utils"

import { LIMIAR_APAGADA_LUX, LIMIAR_INSUFICIENTE_LUX } from "@/lib/dominio"
import { formatarLux } from "@/lib/formatar"

const MIN_LUX = 0.1
const MAX_LUX = 40
const LOG_MIN = Math.log10(MIN_LUX)
const LOG_FAIXA = Math.log10(MAX_LUX) - LOG_MIN

function posicaoLux(lux: number): number {
  const limitado = Math.min(MAX_LUX, Math.max(MIN_LUX, lux))
  return ((Math.log10(limitado) - LOG_MIN) / LOG_FAIXA) * 100
}

function faixa(lux: number): { texto: string; cor: string } {
  if (lux < LIMIAR_APAGADA_LUX) return { texto: "abaixo de 1 lux, apagada", cor: "bg-apagada-mapa" }
  if (lux < LIMIAR_INSUFICIENTE_LUX) return { texto: "abaixo de 5 lux, insuficiente", cor: "bg-insuficiente-mapa" }
  return { texto: "5 lux ou mais, ok", cor: "bg-ok-mapa" }
}

export interface LuxMeterProps {
  lux: number | null | undefined
  semValor?: boolean
  className?: string
}

export function LuxMeter({ lux, semValor = false, className }: LuxMeterProps) {
  if (typeof lux !== "number" || !Number.isFinite(lux)) {
    return <span className={cn("text-sm text-muted-foreground", className)}>sem medição</span>
  }
  const posicao = posicaoLux(lux)
  const { texto, cor } = faixa(lux)
  const valorTexto = formatarLux(lux)
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        role="meter"
        aria-label="Iluminação medida"
        aria-valuemin={0}
        aria-valuemax={MAX_LUX}
        aria-valuenow={Math.min(MAX_LUX, Math.max(0, lux))}
        aria-valuetext={`${valorTexto}, ${texto}`}
        className="relative block h-2 w-16 shrink-0 rounded-full bg-muted ring-1 ring-border ring-inset"
      >
        <span className={cn("absolute inset-y-0 left-0 rounded-full", cor)} style={{ width: `${Math.max(posicao, 4)}%` }} />
        <span
          aria-hidden="true"
          className="absolute -inset-y-0.5 w-px bg-foreground/60"
          style={{ left: `${posicaoLux(LIMIAR_APAGADA_LUX)}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute -inset-y-0.5 w-px bg-foreground/60"
          style={{ left: `${posicaoLux(LIMIAR_INSUFICIENTE_LUX)}%` }}
        />
      </span>
      {!semValor && <span className="text-sm whitespace-nowrap tabular-nums">{valorTexto}</span>}
    </span>
  )
}
