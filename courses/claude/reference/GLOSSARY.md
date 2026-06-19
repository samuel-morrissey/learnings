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
