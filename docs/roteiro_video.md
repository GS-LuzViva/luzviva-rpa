# Roteiro do vídeo de RPA

Vídeo no YouTube: https://www.youtube.com/watch?v=vXKNnKf7z1M

O vídeo tem 8 cenas com tempo fixo e é dublado por cima. Fala tranquila, uns 2,5 palavras por
segundo; se a fala passar do tempo da cena, corte uma frase em vez de acelerar.

| Tempo | Cena | O que aparece na tela | Fala |
|---|---|---|---|
| 0:00 a 0:07 | 1. Abertura | Título "LuzViva · Robô de RPA" e integrantes | Olá! Este é o LuzViva. Neste vídeo, mostramos o robô de RPA do nosso grupo. |
| 0:07 a 0:28 | 2. Problema e papel do robô | Slide "O problema" e os 3 passos do robô | Em São Paulo, a cidade só descobre que uma luminária apagou quando alguém reclama. O LuzViva monta uma fila de manutenção por prioridade. O robô faz o trabalho que hoje é manual: abre um chamado por poste, acompanha o prazo da equipe e só encerra quando a medição confirma o conserto. |
| 0:28 a 0:46 | 3. Processo em BPMN | `docs/processo.bpmn` com zoom nas partes citadas | Este é o processo em BPMN. Um temporizador dispara o robô de hora em hora. Ele percorre a fila item por item e depois os chamados abertos. Cada tipo de falha tem um caminho próprio, e tudo fica registrado no log. |
| 0:46 a 1:22 | 4. Execução de ponta a ponta | Terminal do robô à esquerda, site à direita (API local, mesmo código da AWS) | Agora, o robô rodando de ponta a ponta. À esquerda está o terminal, e à direita, o site do LuzViva. Ele lê os 22 itens da fila e decide placa por placa: abre o chamado com a equipe da área, deixa em monitoramento ou marca como duplicado. Foram 15 chamados abertos, e eles aparecem no site na mesma hora. Ao rodar de novo, nada é aberto em dobro. |
| 1:22 a 1:44 | 5. Regra de decisão | `regras.py` (`decidir_item` e `decidir_chamado`) com as linhas destacadas | A regra de decisão fica nesta função. Com prioridade 30 ou mais, luminária apagada ou com luz insuficiente e sem chamado aberto, o robô abre. Abaixo de 30, ele só monitora. No acompanhamento, um chamado aberto há um dia passa para em atendimento, e um prazo vencido é escalado para o gestor. |
| 1:44 a 2:14 | 6. Integração com o MVP na AWS | GitHub Actions, log, site e API publicados (execução de 18/11 às 19:30) | Em produção, o robô roda no GitHub Actions de hora em hora, contra o MVP publicado na AWS. No dia 17 de novembro, ele abriu dez chamados. No dia 18, os dois que passaram de um dia foram para em atendimento. A mudança aparece no site e na API, que é de onde o painel e o pipeline de dados leem. |
| 2:14 a 2:38 | 7. Tratamento de falhas | Terminal com a API fora do ar e depois `pytest -q` | E se a API cair? O robô tenta quatro vezes, com espera crescente, registra o erro no log e grava o resumo, sem travar. Na próxima hora, ele tenta de novo. Os 68 testes automáticos cobrem os cenários de sucesso, decisão e falha. |
| 2:38 a 2:52 | 8. Encerramento | Slide com os resultados e os links | No fim, os chamados são abertos sem intervenção, sem duplicata e com log de auditoria, sem dados pessoais. Esse foi o robô de RPA do nosso grupo. Obrigado! |

## O que o enunciado pede no vídeo

| Pedido | Cena |
|---|---|
| Até 3 minutos | 2min35s no vídeo publicado |
| Problema e papel da automação | 1 e 2 |
| Execução de ponta a ponta | 3 e 4 |
| Regra de decisão | 5 |
| Integração com o MVP | 6 |
| Tratamento de falhas | 7 |
