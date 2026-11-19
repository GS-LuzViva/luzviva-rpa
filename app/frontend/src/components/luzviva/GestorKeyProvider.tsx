import { useMemo, useState, type ReactNode } from "react"

import { ChaveGestorContext } from "@/hooks/use-chave-gestor"

export function GestorKeyProvider({ children }: { children: ReactNode }) {
  const [chave, setChave] = useState<string | null>(null)
  const valor = useMemo(
    () => ({ chave, definirChave: (nova: string | null) => setChave(nova?.trim() || null) }),
    [chave],
  )
  return <ChaveGestorContext.Provider value={valor}>{children}</ChaveGestorContext.Provider>
}
