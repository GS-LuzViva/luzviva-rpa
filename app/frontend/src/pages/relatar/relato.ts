import { Construction, LightbulbOff, Sun, Zap, type LucideIcon } from "lucide-react"

import { NOMES_CATEGORIA, placaValida } from "@/lib/dominio"
import type { Area, CategoriaOcorrencia } from "@/lib/tipos"

export const OPCOES_PROBLEMA: readonly { valor: CategoriaOcorrencia; rotulo: string; icone: LucideIcon }[] = [
  { valor: "luminaria_apagada", rotulo: "Luminária apagada", icone: LightbulbOff },
  { valor: "luminaria_piscando", rotulo: "Luminária piscando", icone: Zap },
  { valor: "luminaria_acesa_de_dia", rotulo: "Acesa durante o dia", icone: Sun },
  { valor: "poste_danificado", rotulo: "Poste danificado", icone: Construction },
]

export function nomeProblema(categoria: CategoriaOcorrencia | string): string {
  return (
    OPCOES_PROBLEMA.find((opcao) => opcao.valor === categoria)?.rotulo ??
    NOMES_CATEGORIA[categoria as CategoriaOcorrencia] ??
    categoria
  )
}

export const TIPOS_FOTO = ["image/jpeg", "image/png"] as const
export const LIMITE_FOTO_BYTES = 5 * 1024 * 1024

export function erroDaFoto(arquivo: File): string | null {
  if (!(TIPOS_FOTO as readonly string[]).includes(arquivo.type)) {
    return "Esse arquivo não é JPEG nem PNG. Tire a foto com a câmera ou escolha uma imagem JPEG ou PNG."
  }
  if (arquivo.size > LIMITE_FOTO_BYTES) {
    return "A foto passa de 5 MB. Tire outra com resolução menor ou escolha uma imagem mais leve."
  }
  return null
}

export function formatarTamanho(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024))} MB`
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function placaDigitada(texto: string): string {
  const limpo = texto.replace(/[\s-]+/g, "").toUpperCase()
  const comPrefixo = /^\d/.test(limpo) ? `IP${limpo}` : limpo
  return comPrefixo.slice(0, 9)
}

export function algarismosQueFaltam(placa: string): number {
  const algarismos = placa.startsWith("IP") ? placa.slice(2).replace(/\D/g, "").length : 0
  return Math.max(0, 7 - algarismos)
}

export interface Localizacao {
  lat: number
  lon: number
}

export interface DadosRelato {
  placa: string
  foto: File | null
  categoria: CategoriaOcorrencia | ""
  area: Area | ""
  localizacao: Localizacao | null
}

export type CampoRelato = "placa" | "foto" | "categoria" | "area"

export const ORDEM_CAMPOS: readonly CampoRelato[] = ["placa", "foto", "categoria", "area"]

export type ErrosRelato = Partial<Record<CampoRelato, string>>

export function validarRelato(dados: DadosRelato): ErrosRelato {
  const erros: ErrosRelato = {}
  if (dados.placa) {
    if (!placaValida(dados.placa)) erros.placa = "A placa tem IP e 7 números, por exemplo IP0723371."
  } else if (!dados.localizacao) {
    erros.placa = "Informe a placa do poste ou use sua localização mais abaixo."
  }
  if (!dados.foto) erros.foto = "Tire ou escolha uma foto do poste."
  if (!dados.categoria) erros.categoria = "Escolha o que está acontecendo."
  if (!dados.placa && !dados.area) {
    erros.area = "Sem a placa, escolha a área para a equipe achar o poste."
  }
  return erros
}
