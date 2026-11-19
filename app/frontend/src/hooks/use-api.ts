import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useChaveGestor } from "@/hooks/use-chave-gestor"
import { api } from "@/lib/api"
import { TEMPO_FRESCO_CHAMADOS_MS, chaves } from "@/lib/consulta"
import type { AlteracaoChamado, Area, NovoRelato, Pergunta, StatusChamado } from "@/lib/tipos"

export function useLuminarias(area: Area | null) {
  return useQuery({
    queryKey: chaves.luminarias(area),
    queryFn: ({ signal }) => api.luminarias({ area: area ?? undefined }, signal),
  })
}

export function useFila(area?: Area | null) {
  return useQuery({
    queryKey: chaves.fila(area),
    queryFn: ({ signal }) => api.fila(area ?? undefined, signal),
  })
}

export function usePainel() {
  return useQuery({
    queryKey: chaves.painel(),
    queryFn: ({ signal }) => api.painel(signal),
  })
}

export function useChamados(
  statusList?: readonly StatusChamado[],
  filtros: { area?: Area | null; placa?: string | null } = {},
) {
  return useQuery({
    queryKey: chaves.chamados({ status: statusList, area: filtros.area, placa: filtros.placa }),
    queryFn: ({ signal }) =>
      api.chamados(
        { status: statusList ? [...statusList] : undefined, area: filtros.area ?? undefined, placa: filtros.placa ?? undefined },
        signal,
      ),
    staleTime: TEMPO_FRESCO_CHAMADOS_MS,
  })
}

export interface VariaveisAtualizarChamado {
  id: string
  alteracao: AlteracaoChamado
}

export function useAtualizarChamado() {
  const cliente = useQueryClient()
  const { chave } = useChaveGestor()
  return useMutation({
    mutationFn: ({ id, alteracao }: VariaveisAtualizarChamado) => api.atualizarChamado(id, alteracao, chave ?? undefined),
    onSuccess: () =>
      Promise.all([
        cliente.invalidateQueries({ queryKey: chaves.todosChamados() }),
        cliente.invalidateQueries({ queryKey: chaves.todasFilas() }),
      ]),
  })
}

export function useEnviarRelato() {
  return useMutation({
    mutationFn: (relato: NovoRelato) => api.enviarRelato(relato),
  })
}

export function usePerguntar() {
  return useMutation({
    mutationFn: (pergunta: Pergunta) => api.perguntar(pergunta),
  })
}
