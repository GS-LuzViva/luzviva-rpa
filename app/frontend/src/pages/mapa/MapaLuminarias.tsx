import "leaflet/dist/leaflet.css"
import "./mapa.css"

import { useEffect, useMemo, useRef, type Ref, type RefObject } from "react"
import { CircleMarker, MapContainer, Popup, TileLayer, ZoomControl, useMap, useMapEvents } from "react-leaflet"
import { latLngBounds, type LeafletEvent, type Map as MapaLeaflet, type Popup as PopupLeaflet } from "leaflet"

import { BORDA_MAPA, CORES_MAPA } from "@/lib/dominio"
import type { Area, Situacao } from "@/lib/tipos"

import { RAIO_SITUACAO, useTelaEstreita } from "./estilo"
import { ATRIBUTO_FOCO_POPUP, PopupPoste } from "./PopupPoste"
import type { Poste } from "./postes"

const CENTRO_INICIAL: [number, number] = [-23.55, -46.63]

export const ZOOM_FOCO = 18

const FOLGA_POPUP = 12

const ESPERA_MAPA_PARADO_MS = 120

const ALTURA_MINIMA_POPUP = 120

const ATRIBUICAO = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export interface PedidoFoco {
  poste: Poste
  moverFoco: boolean
  seq: number
}

export interface MapaLuminariasProps {
  area: Area
  postes: readonly Poste[]
  visiveis: ReadonlySet<Situacao>
  selecionado: Poste | null
  focoInicial: Poste | null
  pedidoFoco: PedidoFoco | null
  aoSelecionar: (poste: Poste) => void
  aoFechar: (id: string | null) => void
  rotulo: string
  movimentoReduzido: boolean
  mapaRef: Ref<MapaLeaflet>
}

function Enquadrar({ area, postes, foco, animar }: { area: Area; postes: readonly Poste[]; foco: Poste | null; animar: boolean }) {
  const mapa = useMap()
  const enquadrada = useRef<Area | null>(null)
  const focoAplicado = useRef<string | null>(null)
  useEffect(() => {
    if (!foco || focoAplicado.current === foco.id) return
    focoAplicado.current = foco.id
    enquadrada.current = area
    mapa.invalidateSize()
    mapa.setView([foco.lat, foco.lon], ZOOM_FOCO, { animate: false })
  }, [mapa, area, foco])
  useEffect(() => {
    if (postes.length === 0 || enquadrada.current === area) return
    enquadrada.current = area
    const limites = latLngBounds(postes.map((p) => [p.lat, p.lon] as [number, number]))
    mapa.invalidateSize()
    mapa.fitBounds(limites, { padding: [24, 24], maxZoom: 17, animate: animar })
  }, [mapa, area, postes, animar])
  return null
}

function deslocamentoParaCaber(mapa: MapaLeaflet, popup: HTMLElement): [number, number] {
  const caixa = mapa.getContainer().getBoundingClientRect()
  const alvo = popup.getBoundingClientRect()
  let topo = caixa.top + FOLGA_POPUP
  const zoom = mapa.getContainer().querySelector(".leaflet-control-zoom")?.getBoundingClientRect()
  const abaixoDoZoom = zoom ? zoom.bottom + FOLGA_POPUP / 2 : topo
  const cabeAbaixoDoZoom = caixa.bottom - FOLGA_POPUP - abaixoDoZoom >= alvo.height
  if (zoom && zoom.right > alvo.left && zoom.left < alvo.right && cabeAbaixoDoZoom) topo = abaixoDoZoom

  let dx = 0
  let dy = 0
  if (alvo.right > caixa.right - FOLGA_POPUP) dx = alvo.right - (caixa.right - FOLGA_POPUP)
  if (alvo.left - dx < caixa.left + FOLGA_POPUP) dx = alvo.left - (caixa.left + FOLGA_POPUP)
  if (alvo.bottom > caixa.bottom - FOLGA_POPUP) dy = alvo.bottom - (caixa.bottom - FOLGA_POPUP)
  if (alvo.top - dy < topo) dy = alvo.top - topo
  return [Math.round(dx), Math.round(dy)]
}

function FocarPoste({
  pedido,
  animar,
  popupRef,
}: {
  pedido: PedidoFoco | null
  animar: boolean
  popupRef: RefObject<PopupLeaflet | null>
}) {
  const mapa = useMap()
  const animarRef = useRef(animar)
  useEffect(() => {
    animarRef.current = animar
  }, [animar])

  useEffect(() => {
    if (!pedido) return
    let ativo = true
    const animacao = animarRef.current
    const { poste, moverFoco } = pedido

    const focarNoPopup = () => {
      if (!ativo || !moverFoco) return
      mapa
        .getContainer()
        .querySelector<HTMLElement>(`.leaflet-popup [${ATRIBUTO_FOCO_POPUP}]`)
        ?.focus({ preventScroll: true })
    }
    let espera = 0
    const desarmar = () => window.clearTimeout(espera)
    const armar = () => {
      desarmar()
      espera = window.setTimeout(enquadrarPopup, ESPERA_MAPA_PARADO_MS)
    }
    const soltar = () => {
      desarmar()
      mapa.off("movestart zoomstart", desarmar)
      mapa.off("moveend", armar)
    }

    function enquadrarPopup() {
      soltar()
      if (!ativo) return
      const popup = mapa.getContainer().querySelector<HTMLElement>(".leaflet-popup")
      if (!popup) return
      const conteudo = popup.querySelector<HTMLElement>(".leaflet-popup-content")
      const sobra = popup.getBoundingClientRect().height + 2 * FOLGA_POPUP - mapa.getContainer().clientHeight
      const instancia = popupRef.current
      if (sobra > 0 && conteudo && instancia) {
        instancia.options.maxHeight = Math.max(ALTURA_MINIMA_POPUP, conteudo.offsetHeight - sobra)
        instancia.update()
      }
      const [dx, dy] = deslocamentoParaCaber(mapa, popup)
      if (dx !== 0 || dy !== 0) mapa.panBy([dx, dy], { animate: animacao })
      focarNoPopup()
    }

    mapa.on("movestart zoomstart", desarmar)
    mapa.on("moveend", armar)
    mapa.stop()
    mapa.invalidateSize({ pan: false })
    mapa.setView([poste.lat, poste.lon], Math.max(mapa.getZoom(), ZOOM_FOCO), { animate: animacao })
    armar()
    return () => {
      ativo = false
      soltar()
    }
  }, [mapa, pedido, popupRef])
  return null
}

function RotuloAcessivel({ rotulo }: { rotulo: string }) {
  const mapa = useMap()
  useEffect(() => {
    const el = mapa.getContainer()
    el.setAttribute("role", "region")
    el.setAttribute("aria-roledescription", "mapa")
    el.setAttribute("aria-label", rotulo)
  }, [mapa, rotulo])
  return null
}

function FecharAoClicar({ aoFechar }: { aoFechar: (id: string | null) => void }) {
  useMapEvents({ click: () => aoFechar(null) })
  return null
}

function FocoAoFecharPopup() {
  const mapa = useMap()
  useMapEvents({
    popupopen: () => mapa.getContainer().classList.add("com-popup"),
    popupclose: (evento) => {
      mapa.getContainer().classList.remove("com-popup")
      const ativo = document.activeElement
      if (!ativo || ativo === document.body || evento.popup.getElement()?.contains(ativo)) {
        mapa.getContainer().focus({ preventScroll: true })
      }
    },
  })
  return null
}

function traduzirFechar(evento: LeafletEvent) {
  const botao = (evento.target as PopupLeaflet).getElement()?.querySelector(".leaflet-popup-close-button")
  botao?.setAttribute("aria-label", "Fechar")
  botao?.setAttribute("title", "Fechar")
}

export function MapaLuminarias({
  area,
  postes,
  visiveis,
  selecionado,
  focoInicial,
  pedidoFoco,
  aoSelecionar,
  aoFechar,
  rotulo,
  movimentoReduzido,
  mapaRef,
}: MapaLuminariasProps) {
  const desenhados = useMemo(() => postes.filter((p) => visiveis.has(p.situacao)), [postes, visiveis])
  const selecionadoId = selecionado?.id ?? null
  const estreita = useTelaEstreita()
  const popupRef = useRef<PopupLeaflet>(null)

  return (
    <MapContainer
      ref={mapaRef}
      center={CENTRO_INICIAL}
      zoom={14}
      preferCanvas
      zoomControl={false}
      closePopupOnClick={false}
      zoomAnimation={!movimentoReduzido}
      fadeAnimation={!movimentoReduzido}
      markerZoomAnimation={!movimentoReduzido}
      inertia={!movimentoReduzido}
      className="mapa-luzviva absolute inset-0 isolate rounded-xl"
    >
      <ZoomControl position="topleft" zoomInTitle="Aproximar" zoomOutTitle="Afastar" />
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution={ATRIBUICAO} />
      <Enquadrar area={area} postes={postes} foco={focoInicial} animar={!movimentoReduzido} />
      <RotuloAcessivel rotulo={rotulo} />
      <FecharAoClicar aoFechar={aoFechar} />
      {desenhados.map((poste) => {
        const ativo = poste.id === selecionadoId
        return (
          <CircleMarker
            key={poste.id}
            center={[poste.lat, poste.lon]}
            radius={RAIO_SITUACAO[poste.situacao] + (ativo ? 3 : 0)}
            pathOptions={{
              fillColor: CORES_MAPA[poste.situacao],
              fillOpacity: 0.92,
              color: BORDA_MAPA.color,
              weight: ativo ? 3 : BORDA_MAPA.weight,
            }}
            bubblingMouseEvents={false}
            eventHandlers={{ click: () => aoSelecionar(poste) }}
          />
        )
      })}
      {selecionado && visiveis.has(selecionado.situacao) && (
        <Popup
          ref={popupRef}
          key={selecionado.id}
          position={[selecionado.lat, selecionado.lon]}
          offset={[0, -(RAIO_SITUACAO[selecionado.situacao] + 2)]}
          minWidth={estreita ? 224 : 256}
          maxWidth={estreita ? 232 : 300}
          autoPanPadding={[16, 16]}
          eventHandlers={{
            add: traduzirFechar,
            remove: () => aoFechar(selecionado.id),
          }}
        >
          <PopupPoste poste={selecionado} area={area} />
        </Popup>
      )}
      <FocarPoste pedido={pedidoFoco} animar={!movimentoReduzido} popupRef={popupRef} />
      <FocoAoFecharPopup />
    </MapContainer>
  )
}
