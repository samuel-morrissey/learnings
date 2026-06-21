# Os 5 padrões de workflow + correção sobre orquestrador-trabalhadores

O aluno reconstruiu os 5 padrões (encadeamento, roteamento, paralelização, orquestrador-trabalhadores, avaliador-otimizador) com os gatilhos de "quando usar" corretos, demonstrando entendimento do Domínio 1. Estabelece o piso para subir ao nível agente (L03).

## Evidence
Pseudo-cola por voz (sessão 2, 2026-06-20). Pegou os dois sabores da paralelização (sectioning + voting) e teve insight próprio sobre o risco de laço infinito no avaliador-otimizador quando falta critério de sucesso claro.

## Correção registrada (potencial stumbling block futuro)
Descreveu orquestrador-trabalhadores como "escolher entre os trabalhadores disponíveis" — isso é mais **roteamento**. Corrigido: o orquestrador **cria as subtarefas dinamicamente em runtime** (decomposição), não seleciona de um conjunto fixo. Vigiar essa confusão roteamento↔orquestrador em recall futuro.

## Recall mais fraco
Avaliador-otimizador foi o único que não lembrou de imediato ("tive que pescar"). Manter próximo na fila de revisão.
