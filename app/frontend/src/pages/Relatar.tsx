import { useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { tituloDaRota } from "@/components/layout/navegacao"
import { ehArea } from "@/lib/dominio"
import type { Ocorrencia } from "@/lib/tipos"

import { FormularioRelato } from "./relatar/FormularioRelato"
import { RelatoEnviado } from "./relatar/RelatoEnviado"

export default function Relatar() {
  const [busca, setBusca] = useSearchParams()
  const [ocorrencia, setOcorrencia] = useState<Ocorrencia | null>(null)
  const [versao, setVersao] = useState(0)

  const placaInicial = busca.get("placa") ?? ""
  const areaParam = busca.get("area")
  const areaInicial = ehArea(areaParam) ? areaParam : undefined

  const relatarOutro = () => {
    setOcorrencia(null)
    setVersao((v) => v + 1)
    if (busca.has("placa")) {
      const proxima = new URLSearchParams(busca)
      proxima.delete("placa")
      setBusca(proxima, { replace: true })
    }
    requestAnimationFrame(() => document.getElementById("relato-placa")?.focus())
  }

  return (
    <>
      <PageHeader
        titulo={tituloDaRota("/relatar")}
        descricao="Luminária apagada, piscando, acesa de dia ou poste danificado: fotografe o poste e informe a placa amarela pintada nele. O relato ajuda a decidir o que consertar primeiro."
      />
      {ocorrencia ? (
        <RelatoEnviado ocorrencia={ocorrencia} aoRelatarOutro={relatarOutro} />
      ) : (
        <FormularioRelato
          key={versao}
          placaInicial={versao === 0 ? placaInicial : ""}
          areaInicial={areaInicial}
          aoEnviar={(nova) => {
            setOcorrencia(nova)
            toast.success("Relato enviado")
            window.scrollTo({ top: 0 })
          }}
        />
      )}
    </>
  )
}
