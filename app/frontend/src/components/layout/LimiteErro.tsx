import { Component, type ErrorInfo, type ReactNode } from "react"

import { EstadoErro } from "@/components/luzviva/Estados"

interface Estado {
  erro: unknown
}

export class LimiteErro extends Component<{ children: ReactNode }, Estado> {
  state: Estado = { erro: null }

  static getDerivedStateFromError(erro: unknown): Estado {
    return { erro }
  }

  componentDidCatch(erro: unknown, info: ErrorInfo) {
    console.error("Erro ao montar a tela", erro, info.componentStack)
  }

  render() {
    if (this.state.erro) {
      return (
        <EstadoErro
          titulo="Esta tela não abriu"
          mensagem="Pode ser uma versão nova do site ou falta de conexão. Recarregue a página para tentar de novo."
          aoTentarDeNovo={() => window.location.reload()}
        />
      )
    }
    return this.props.children
  }
}
