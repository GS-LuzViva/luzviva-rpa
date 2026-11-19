import type { ReactNode } from "react"
import { CircleAlert, Inbox, RotateCcw, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { mensagemDeErro } from "@/lib/api"

export interface EstadoErroProps {
  erro?: unknown
  mensagem?: string
  titulo?: string
  aoTentarDeNovo?: () => unknown
  tentando?: boolean
  className?: string
}

export function EstadoErro({
  erro,
  mensagem,
  titulo = "Não foi possível carregar os dados",
  aoTentarDeNovo,
  tentando = false,
  className,
}: EstadoErroProps) {
  const texto = mensagem ?? mensagemDeErro(erro)
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-apagada/30 bg-card p-4 sm:flex-row sm:items-start",
        className,
      )}
    >
      <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-apagada" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-semibold">{titulo}</p>
        <p className="max-w-prose text-sm text-muted-foreground">{texto}</p>
      </div>
      {aoTentarDeNovo && (
        <Button variant="outline" onClick={() => void aoTentarDeNovo()} disabled={tentando} className="max-sm:w-full">
          <RotateCcw aria-hidden="true" className={cn(tentando && "animate-spin")} />
          {tentando ? "Tentando…" : "Tentar de novo"}
        </Button>
      )}
    </div>
  )
}

export interface EstadoVazioProps {
  titulo: string
  descricao?: ReactNode
  icone?: LucideIcon
  acao?: ReactNode
  className?: string
}

export function EstadoVazio({ titulo, descricao, icone: Icone = Inbox, acao, className }: EstadoVazioProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-dashed bg-card p-6 text-left",
        className,
      )}
    >
      <Icone aria-hidden="true" className="size-6 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{titulo}</p>
        {descricao && <div className="max-w-prose text-sm text-muted-foreground">{descricao}</div>}
      </div>
      {acao}
    </div>
  )
}
