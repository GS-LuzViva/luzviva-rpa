
export type PreferenciaTema = "claro" | "escuro" | "sistema"
export type TemaEfetivo = "claro" | "escuro"

const CHAVE = "luzviva-tema"
const CONSULTA_ESCURO = "(prefers-color-scheme: dark)"

const COR_BARRA: Record<TemaEfetivo, string> = { claro: "#1B2430", escuro: "#0D141C" }

export function lerPreferencia(): PreferenciaTema {
  try {
    const valor = window.localStorage.getItem(CHAVE)
    if (valor === "claro" || valor === "escuro" || valor === "sistema") return valor
  } catch {
  }
  return "sistema"
}

export function salvarPreferencia(preferencia: PreferenciaTema): void {
  try {
    if (preferencia === "sistema") window.localStorage.removeItem(CHAVE)
    else window.localStorage.setItem(CHAVE, preferencia)
  } catch {
  }
}

export function sistemaEscuro(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(CONSULTA_ESCURO).matches
}

export function resolverTema(preferencia: PreferenciaTema): TemaEfetivo {
  if (preferencia === "sistema") return sistemaEscuro() ? "escuro" : "claro"
  return preferencia
}

export function aplicarTema(tema: TemaEfetivo): void {
  const raiz = document.documentElement
  raiz.classList.toggle("dark", tema === "escuro")
  raiz.classList.toggle("light", tema === "claro")
  raiz.style.colorScheme = tema === "escuro" ? "dark" : "light"
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = COR_BARRA[tema]
  }
}

export function observarSistema(aoMudar: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {}
  const consulta = window.matchMedia(CONSULTA_ESCURO)
  consulta.addEventListener("change", aoMudar)
  return () => consulta.removeEventListener("change", aoMudar)
}
