import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NOMES_STATUS, TRANSICOES_STATUS } from "@/lib/dominio"
import type { Chamado, StatusChamado } from "@/lib/tipos"

export interface AcaoStatusProps {
  chamado: Chamado
  aoPedir: (chamado: Chamado, status: StatusChamado) => void
  atualizando: boolean
  empilhado?: boolean
}

export function AcaoStatus({ chamado, aoPedir, atualizando, empilhado = false }: AcaoStatusProps) {
  const opcoes = TRANSICOES_STATUS[chamado.status] ?? []
  const [escolhido, setEscolhido] = useState<StatusChamado | "">("")
  const [listaAberta, setListaAberta] = useState(false)

  if (opcoes.length === 0) {
    return <span className="text-sm text-muted-foreground">Status final</span>
  }

  const valido = escolhido && opcoes.includes(escolhido) ? escolhido : ""

  return (
    <div className={cn("flex items-center gap-2", empilhado && "flex-col items-stretch")}>
      <Select
        value={valido}
        onValueChange={(valor) => setEscolhido(valor as StatusChamado)}
        open={listaAberta}
        onOpenChange={setListaAberta}
        disabled={atualizando}
      >
        <SelectTrigger
          size="sm"
          aria-label={`Novo status do chamado ${chamado.id_chamado}`}
          className={cn("bg-card", empilhado ? "w-full" : "w-36")}
        >
          <SelectValue placeholder="Novo status" />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {opcoes.map((status) => (
            <SelectItem key={status} value={status}>
              {NOMES_STATUS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-disabled={atualizando || undefined}
        aria-busy={atualizando || undefined}
        onClick={() => {
          if (atualizando) return
          if (!valido) setListaAberta(true)
          else aoPedir(chamado, valido)
        }}
        className={cn("bg-card aria-disabled:cursor-not-allowed aria-disabled:opacity-50", empilhado && "w-full")}
      >
        {atualizando && <LoaderCircle aria-hidden="true" className="animate-spin" />}
        {atualizando ? "Atualizando…" : "Atualizar status"}
        <span className="sr-only"> do chamado {chamado.id_chamado}</span>
      </Button>
    </div>
  )
}
