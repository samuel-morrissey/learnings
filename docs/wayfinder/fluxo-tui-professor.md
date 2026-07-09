# Fluxo interativo atual da TUI (Professor ↔ aluno)

Asset do ticket [#39](https://github.com/samuel-morrissey/learnings/issues/39) do mapa
[#36](https://github.com/samuel-morrissey/learnings/issues/36). Mapeia em detalhe cada etapa em que o
Professor conversa com o aluno na TUI hoje, com entradas, saídas e artefatos tocados — insumo para
escolher o primeiro passo fora da TUI ([#46](https://github.com/samuel-morrissey/learnings/issues/46)).

Fontes: `.claude/skills/professor/SKILL.md`, os cinco `*-FORMAT.md` da skill, e
`courses/aws/NOTES.md` (log de ~9 sessões reais do curso aws, 06/2026–07/2026).

## Visão geral de uma sessão

Toda sessão segue o mesmo esqueleto, observado consistentemente no log real:

```
/professor <curso> <pedido>
  → 0. Orientação (ler scratch + list_courses)
  → 1. Abertura com revisão espaçada (itens vencidos de REVIEW.md)
  → 2. Corpo da sessão (uma ou mais das etapas 3–7 abaixo)
  → 3. Fechamento (atualizar NOTES.md, REVIEW.md, learning-records)
```

O ciclo de vida de **uma Aula** atravessa várias sessões:

```
CRIADA/ENTREGUE (write_aula + entrega na conversa)
  → quiz/teach-back na conversa
  → APRENDIDA (produção ativa: pseudo cheat sheet)     ← pode ser noutra sessão (ex.: Lição 08: entregue 22/06, aprendida 08/07)
  → entra em REVIEW.md
  → revisões espaçadas em sessões futuras (estágios 1→4)
```

## Etapas em detalhe

### 0. Invocação e orientação

- **Conversa:** nenhuma (ou mínima — o Professor pergunta qual Curso se o argumento faltar).
- **Entradas:** `/professor <curso> <pedido>`; `list_courses` (MCP) para ver a trilha e o próximo `NNNN`.
- **Leituras:** `courses/<id>/MISSION.md`, `NOTES.md`, `REVIEW.md`, `learning-records/*`,
  `reference/GLOSSARY.md`; guias somente-leitura (`docs/catalog-guide.md`, `docs/frontmatter-guide.md`).
- **Saídas/escritas:** nenhuma.
- **Observação operacional:** o MCP às vezes precisa de reconexão manual (`/mcp`) — registrado na
  sessão de 09/07.

### 1. Onboarding / entrevista de missão (curso novo)

- **Gatilho:** Curso inexistente, ou `MISSION.md` vazio/vago.
- **Conversa (HITL forte):** entrevista sobre o *porquê* — o Professor deve "push back on vagueness";
  uma missão ruim é pior que nenhuma. Também colhe restrições (tempo, prazo) e escopo negativo.
- **Entradas:** respostas do aluno em texto livre.
- **Escritas:** scaffolding de `courses/<id>/` — `MISSION.md` (Why / Success looks like / Constraints /
  Out of scope), `RESOURCES.md` (fontes de alta confiança, seções Knowledge/Wisdom/Gaps); demais
  arquivos nascem preguiçosamente. Preferências ditas na entrevista vão para `NOTES.md`
  (ex.: "idioma PT-BR", "lições curtas e densas", perfil do aluno).
- **Nota:** o documento de Curso no banco **não** é criado aqui — nasce sozinho no primeiro
  `write_aula`. O onboarding é 100% arquivos + conversa.
- **Recorrência:** a missão pode mudar; a mudança exige **confirmação do aluno** na conversa, atualiza
  `MISSION.md` e gera um learning record.

### 2. Abertura com revisão espaçada (toda sessão)

- **Gatilho:** início de qualquer sessão, antes de ensinar algo novo (regra da skill: "Abra toda
  sessão com revisão").
- **Conversa (HITL, laço apertado):** o Professor varre `REVIEW.md` por itens vencidos e faz 2–3
  perguntas de **recuperação** — o aluno responde de memória primeiro; só depois o Professor aponta o
  reference doc. Nunca releitura.
- **Entradas:** `REVIEW.md` (itens com `Next due` vencido); respostas de memória do aluno.
- **Saídas na conversa:** veredicto por item (acertou/falhou), correção imediata quando falha.
- **Escritas:**
  - `REVIEW.md`: sucesso → `Last reviewed` atualizado, estágio +1, novo `Next due`
    (≈3d → ≈10d → ≈25d → mensal); falha → estágio −1, due próximo, possível reensino.
  - `learning-records/`: recordação a frio bem-sucedida é "a evidência mais forte de todas" — pode
    gerar/reforçar registro.
  - `NOTES.md`: resumo da rodada (ex.: sessão 22/06 — "4 itens vencidos… corretos, promovidos";
    sessão 08/07 — "6 vantagens falhou+RECUPEROU (verificar a frio 11/07)").
- **Padrão real observado:** itens com falha recorrente ganham tratamento especial anotado em
  `NOTES.md` (ex.: "EC2: raciocínio ótimo mas NOMES não fixam → tratar nomes como item próprio").

### 3. Criação e entrega da Aula

- **Gatilho:** pedido explícito do aluno ("me ensine X") ou escolha do Professor pela zona de
  desenvolvimento proximal (missão + learning-records + resultados de revisão).
- **Conversa (HITL leve):** negociação do escopo ("uma coisa só" por Aula), entrega e comentário da
  Aula no chat; o aluno lê a Aula renderizada no app (SSR lê o Firestore — aparece na hora, sem deploy).
- **Entradas:** `MISSION.md` (ancoragem), `learning-records/*` (piso), `RESOURCES.md` (fontes — nunca
  conhecimento paramétrico), `docs/catalog-guide.md` + `docs/frontmatter-guide.md` (autoria MDX).
- **Escritas:**
  - **Firestore via MCP:** `write_aula(course, slug, frontmatter, mdx, esbocos?)` — validação na hora
    (erro bloqueia; aviso de Esboço sem deploy grava com fallback). Frequentemente também um segundo
    `write_aula` para **costurar o `<Nav>`** da Aula anterior (padrão real: "Nav 09→10 costurado").
  - `NOTES.md`: registro de "CRIADA + ENTREGUE" com escopo e fontes.
- **Sub-fluxo (não toca o aluno):** quando o Catálogo não cobre um visual, o Professor delega por
  subagente ao `/professor-developer` (spec de 4 itens) e recebe só o snippet `<Nome />` — assíncrono,
  a Aula grava antes do deploy do Esboço.
- **Desacoplamento observado:** entrega ≠ estudo — a Lição 10 foi criada "a pedido dele, para estudar
  depois". O estado "entregue mas não estudada" hoje só existe como prosa em `NOTES.md`.

### 4. Teste rápido (quiz)

Duas formas coexistem, com propriedades muito diferentes:

- **`<Quiz>` dentro da Aula (no app):** interativo, feedback imediato, mas **100% client-side, sem
  persistência**. O resultado só chega ao Professor se o aluno **reportar verbalmente na TUI**
  ("quiz 5/5") — a conversa é o único canal de volta.
- **Quiz no chat:** perguntas de cenário feitas pelo Professor na própria TUI; correção imediata,
  laço mais apertado.
- **Entradas:** respostas do aluno (no app, auto-relatadas; no chat, diretas).
- **Saídas na conversa:** feedback por questão; identificação de equívocos.
- **Escritas:** nenhuma direta — o resultado vira insumo das etapas 5/6 (aprendizado, registro) e é
  logado em `NOTES.md` (ex.: "quiz 5/5 + teach-back forte"). Não há banco de questões nem histórico.
- **Relevância para o mapa:** este é o elo mais frágil do fluxo — resultado de quiz não atualiza nada
  automaticamente (nem `REVIEW.md`, nem status da Aula). É exatamente o fog item "efeito de
  quiz/simulado sobre a fila de revisão".

### 5. Pedido e correção do pseudo cheat sheet (produção ativa)

- **Gatilho:** após o estudo da Aula — é o que separa **entregue** de **aprendida**. Regra dura:
  nunca começar Aula nova sem a anterior praticada.
- **Conversa (HITL, o coração pedagógico):**
  1. O Professor pede a compressão **nas palavras do aluno** (teach-back, resumo, definição própria) —
     nunca entrega compressão pronta.
  2. O aluno produz (às vezes de memória, dias depois — ex.: Lição 08 aprendida 16 dias após entregue).
  3. O Professor corrige equívocos **na hora** (ex.: "billing do Lambda = requisições + GB-segundos,
     NÃO tráfego de dados"); quando precisa memorizar, o aluno inventa o próprio mnemônico.
  4. Às vezes há um **fechamento em sessão posterior**: o aluno recomprime a correção e o Professor
     valida (padrão real: "Fechamento GB-segundos (09/07): ele recomprimiu correto").
- **Entradas:** a compressão escrita do aluno no chat.
- **Escritas (em cascata — é a etapa que mais toca artefatos):**
  - `reference/GLOSSARY.md`: verbete criado/atualizado **com a redação do aluno** polida ("the user
    drafts, the agent polishes").
  - `reference/*.html`: cheat sheet imprimível crescida do rascunho do aluno (único HTML que o
    Professor escreve).
  - `learning-records/NNNN-*.md`: registro da evidência de aprendizado e das correções.
  - `REVIEW.md`: nova linha — o item entra na fila espaçada.
  - `NOTES.md`: "APRENDIDA em DD/MM" + resumo das correções.
- **Estado implícito:** "AGUARDANDO produção ativa → ainda NÃO aprendida" (Lição 10) vive só como
  prosa em `NOTES.md`.

### 6. Registro de learning-records

- **Gatilho:** evidência, nunca cobertura — (a) entendimento demonstrado por produção, (b) conhecimento
  prévio declarado ("já sei X"), (c) equívoco corrigido, (d) missão mudou.
- **Conversa:** nenhuma dedicada — a etapa é consequência das etapas 2, 4 e 5; no máximo o Professor
  confirma o entendimento antes de registrar.
- **Escritas:** `learning-records/NNNN-slug.md` (numeração sequencial, formato mínimo: título +
  1–3 frases; opcionais Status/Evidence/Implications; supersessão em vez de deleção); linha
  correspondente em `REVIEW.md` quando registra material novo; cross-link com `MISSION.md` quando a
  missão muda.
- **Uso a jusante:** os records são a memória de longo prazo do Professor — calculam a zona de
  desenvolvimento proximal da etapa 3.

### 7. Sessão só de revisão

- **Gatilho:** aluno com poucos minutos, ou fila vencida grande. É "sessão de primeira classe".
- **Conversa e escritas:** idênticas à etapa 2, sem corpo de ensino depois.

## Matriz artefato × etapa

| Artefato | Meio | Escrito em | Lido em |
|---|---|---|---|
| Aula (`courses/{c}/lessons/{slug}`) | Firestore (MCP `write_aula`) | 3 (criação + costura de Nav) | 0, 3 (`read_aula`) |
| `MISSION.md` | arquivo | 1 (e mudanças de missão) | 0, 3 |
| `RESOURCES.md` | arquivo | 1 (e quando acha fonte nova) | 3 |
| `REVIEW.md` | arquivo | 2, 5, 6, 7 | 0, 2, 7 |
| `learning-records/*.md` | arquivo | 2, 5, 6 | 0, 3 |
| `reference/GLOSSARY.md` | arquivo | 5 | 0, 3 |
| `reference/*.html` (cheat sheets) | arquivo | 5 | 2 (apontado após recuperação) |
| `NOTES.md` | arquivo | todas (fechamento) | 0 |
| Resultado de quiz | **nenhum** (efêmero) | — | — |

## Observações para escolher o primeiro passo fora da TUI

1. **A TUI é o único canal de retorno do aluno.** Tudo que o app mostra (Aula, `<Quiz>`) é mão única;
   qualquer sinal de volta (resposta, dúvida, compressão) passa pela conversa. Sair da TUI significa
   criar o primeiro canal de escrita fora dela.
2. **O estado de progresso hoje é prosa em `NOTES.md`.** Status por Aula (criada/entregue/estudada/
   aprendida), pendências e "próximas lições" vivem em texto corrido — é o dado que os tickets
   [Modelo de dados de progresso e status da Aula (#38)](https://github.com/samuel-morrissey/learnings/issues/38)
   e [Modelo de dados do scratch de ensino no Firestore (#37)](https://github.com/samuel-morrissey/learnings/issues/37)
   precisam estruturar. A matriz acima diz quem escreve o quê e quando.
3. **Quiz é o elo sem persistência** — resultado auto-relatado, nenhum efeito automático sobre
   `REVIEW.md`. Menor laço conversacional entre as etapas: candidato natural a primeiro passo.
4. **As etapas 2 e 5 são as mais conversacionais** (recuperação de memória e correção de compressão) —
   as mais difíceis de tirar da TUI; exigem o "componente de conversa no app" que ainda é fog.
5. **Cadência real:** sessões curtas, às vezes com 16 dias de intervalo; a abertura com revisão e o
   fechamento em sessão posterior dependem de o estado sobreviver entre sessões — hoje garantido pelos
   arquivos de scratch, amanhã pelo Firestore (cutover por artefato).
