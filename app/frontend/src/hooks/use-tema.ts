import { createContext, useContext } from "react"

import type { PreferenciaTema, TemaEfetivo } from "@/lib/tema"

export interface ContextoTema {
  preferencia: PreferenciaTema
  tema: TemaEfetivo
  definirPreferencia: (preferencia: PreferenciaTema) => void
}

export const TemaContext = createContext<ContextoTema | null>(null)

export function useTema(): ContextoTema {
  const contexto = useContext(TemaContext)
  if (!contexto) throw new Error("useTema precisa estar dentro de <ProvedorTema>.")
  return contexto
}
