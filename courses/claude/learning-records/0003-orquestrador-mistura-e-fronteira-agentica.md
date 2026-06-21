# Orquestrador como mistura roteamento+paralelismo, e a fronteira com o agente

O aluno produziu uma síntese sofisticada por conta própria: orquestrador-trabalhadores compartilha com o **roteamento** a análise/decisão dinâmica dos próximos passos, e com a **paralelização** o fan-out para workers + síntese final — indo além de ambos ao decompor a tarefa em subtarefas que ele mesmo cria. Evidência de engajamento profundo, não só memorização.

## Confusão surfaçada (parcialmente resolvida; resolver de vez na L03)
"Onde o orquestrador difere do agêntico?" Esclarecido: a linha não é a decomposição dinâmica, é o **laço de feedback aberto** — orquestrador-workflow faz UMA passada (decompõe→delega→sintetiza→fim); agente observa resultados e re-planeja em laço até o próprio modelo decidir parar. A intuição do aluno ("orquestrador 'em up' vira agente") está correta: é o último degrau antes do agente, por isso "beira" o agêntico.

## Implications
- L03 deve abrir exatamente daqui: workflow→agente via o laço de feedback, e depois multi-agente (orquestrador agêntico = coordinator + subagentes).
- Vigiar em recall: o aluno NÃO deve "achatar" o agente para "só decomposição dinâmica".
