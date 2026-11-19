import { Suspense, useEffect, useRef, type MouseEvent } from "react"
import { Outlet, useLocation } from "react-router"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"

import { BarraLateral } from "./BarraLateral"
import { CarregandoTela } from "./Esqueleto"
import { LimiteErro } from "./LimiteErro"
import { MarcaLuzViva } from "./MarcaLuzViva"
import { tituloDaRota } from "./navegacao"

const ID_CONTEUDO = "conteudo"

function focarConteudo() {
  const principal = document.getElementById(ID_CONTEUDO)
  principal?.focus({ preventScroll: false })
}

function LinkPular() {
  const pular = (evento: MouseEvent<HTMLAnchorElement>) => {
    evento.preventDefault()
    focarConteudo()
  }
  return (
    <a
      href={`#${ID_CONTEUDO}`}
      onClick={pular}
      className="sr-only rounded-md bg-primary font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-3 focus:outline-2 focus:outline-offset-2 focus:outline-sidebar-ring"
    >
      Pular para o conteúdo
    </a>
  )
}

function BarraSuperior() {
  const { openMobile, setOpenMobile } = useSidebar()
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 bg-sidebar px-2 text-sidebar-foreground md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Abrir menu"
        aria-expanded={openMobile}
        aria-haspopup="dialog"
        data-sidebar="trigger"
        onClick={() => setOpenMobile(true)}
        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring"
      >
        <Menu aria-hidden="true" className="size-5" />
      </Button>
      <MarcaLuzViva compacta />
    </header>
  )
}

function useEfeitosDeRota() {
  const { pathname } = useLocation()
  const anterior = useRef(pathname)
  useEffect(() => {
    document.title = `${tituloDaRota(pathname)} | LuzViva`
    if (anterior.current !== pathname) {
      anterior.current = pathname
      window.scrollTo({ top: 0 })
      focarConteudo()
    }
  }, [pathname])
  return pathname
}

export function AppShell() {
  const pathname = useEfeitosDeRota()
  return (
    <SidebarProvider>
      <LinkPular />
      <BarraLateral />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <BarraSuperior />
        <main
          id={ID_CONTEUDO}
          tabIndex={-1}
          className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-1 flex-col gap-4 px-4 py-4 outline-none md:gap-6 md:px-6 md:py-6"
        >
          <LimiteErro key={pathname}>
            <Suspense fallback={<CarregandoTela />}>
              <Outlet />
            </Suspense>
          </LimiteErro>
        </main>
      </div>
    </SidebarProvider>
  )
}
