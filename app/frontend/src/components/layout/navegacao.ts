import { Camera, ChartColumn, ClipboardList, ListOrdered, Map as IconeMapa, MessageSquareText, type LucideIcon } from "lucide-react"

export interface ItemNavegacao {
  caminho: string
  rotulo: string
  titulo: string
  icone: LucideIcon
  usaArea: boolean
}

export const NAVEGACAO: readonly ItemNavegacao[] = [
  { caminho: "/", rotulo: "Mapa", titulo: "Mapa das luminárias", icone: IconeMapa, usaArea: true },
  { caminho: "/fila", rotulo: "Fila", titulo: "Fila de manutenção", icone: ListOrdered, usaArea: true },
  { caminho: "/chamados", rotulo: "Chamados", titulo: "Chamados de manutenção", icone: ClipboardList, usaArea: true },
  { caminho: "/painel", rotulo: "Painel", titulo: "Painel por subprefeitura", icone: ChartColumn, usaArea: false },
  { caminho: "/relatar", rotulo: "Relatar", titulo: "Relatar problema no poste", icone: Camera, usaArea: false },
  { caminho: "/assistente", rotulo: "Assistente", titulo: "Assistente da fila", icone: MessageSquareText, usaArea: false },
]

export function tituloDaRota(caminho: string): string {
  return NAVEGACAO.find((item) => item.caminho === caminho)?.titulo ?? "Página não encontrada"
}
