import { useSyncExternalStore } from "react"

const CONSULTA = "(min-width: 1024px)"

function assinar(aoMudar: () => void) {
  const consulta = window.matchMedia(CONSULTA)
  consulta.addEventListener("change", aoMudar)
  return () => consulta.removeEventListener("change", aoMudar)
}

export function useTelaLarga(): boolean {
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(CONSULTA).matches,
    () => true,
  )
}
