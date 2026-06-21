# CCA-F Glossary

Linguagem canônica deste workspace de estudo para a certificação Claude Certified Architect — Foundations. Toda lição e registro deve usar estes termos.

## Termos

**Régua de autonomia**:
Eixo único que organiza os tipos de sistema LLM pela pergunta "quem controla o caminho de execução?": você → o código → o modelo.
_Avoid_: espectro de IA, níveis de automação

**Chamada única (single call)**:
Uma instrução completa numa única chamada que recebe uma resposta processada pela LLM. Sem laço, sem ferramentas (ou no máximo uma, sem decisão sobre próximos passos).
_Avoid_: prompt simples, one-shot

**Workflow**:
Sistema onde LLMs e ferramentas são orquestrados por **caminhos de código predefinidos** — o caminho é fixo, escrito por você. Dá previsibilidade e consistência.
_Avoid_: pipeline, automação, sequência de prompts

**Agente (agent)**:
Sistema onde a LLM **decide dinamicamente** qual ferramenta usar e, a partir do feedback de cada ação, quais os próximos passos — mantendo controle sobre como realiza a tarefa. Caminho emergente, não roteirizado.
_Avoid_: bot, assistente, IA autônoma

**Action loop**:
O laço que caracteriza a autonomia do agente: **age → recebe o feedback (ground truth) da ação → decide a próxima ação** com base nos resultados anteriores, até concluir ou pedir ajuda ao humano. Sem este laço, não há agente.
_Avoid_: loop de execução, ciclo

**Ground truth (do ambiente)**:
O resultado real de uma ação — saída de uma tool, retorno de código, erro — que o agente observa a cada passo para avaliar progresso. É o que fecha o action loop com informação confiável (vs. o modelo "imaginar" que agiu).
_Avoid_: feedback, resultado

**Sistema conversacional**:
O **formato de interação** (chat multi-turno guiado pelo humano), não uma posição na régua de autonomia. Pode ser chamada única por turno; é independente de o sistema ser ou não agêntico.
_Avoid_: chatbot (como sinônimo de agente)

## Padrões de workflow

Os 5 blocos componíveis de caminho fixo (Anthropic, "Building Effective Agents"). Todos são workflow — quem controla o caminho é o código —, exceto onde o modelo define passos em runtime.

**Encadeamento de prompts (prompt chaining)**:
Sequência fixa de passos onde a saída de cada chamada vira a entrada da próxima; cada passo pensa numa parte pequena. Pode ter um *gate* programático entre passos.
_Avoid_: pipeline genérico

**Roteamento (routing)**:
Um classificador define a categoria da entrada e a direciona para **uma rota especializada** (1 de N predefinidas). Permite prompt/modelo dedicado por categoria.
_Avoid_: filtro, switch

**Paralelização (parallelization)**:
Várias chamadas rodando ao mesmo tempo, depois agregadas. Dois sabores: **sectioning** (subtarefas independentes que *você* predefiniu) e **voting** (mesma tarefa N vezes para consenso/diversidade).
_Avoid_: multithreading, batch

**Orquestrador-trabalhadores (orchestrator-workers)**:
Um LLM central **decompõe a tarefa em subtarefas que ele mesmo cria em runtime** (desconhecidas de antemão), delega a workers e sintetiza. É o degrau entre workflow e agente.
_Avoid_: escolher entre workers fixos (isso é roteamento), paralelização

**Avaliador-otimizador (evaluator-optimizer)**:
Um LLM gera, outro avalia e dá feedback, num **laço fixo** que repete até um critério claro de sucesso. Exige critério bem definido — sem ele, o laço pode nunca convergir.
_Avoid_: self-correction, agente (o laço aqui é fixo, não dirigido pelo modelo)
