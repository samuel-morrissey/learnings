# learnings

Hub de cursos/aulas que uma IA gera. A Plataforma é **Astro SSR** (Firebase App Hosting) e lê as Aulas do **Firestore**, renderizando em runtime o MDX com os Componentes do Catálogo (em **Preact**). A IA (Professor/Desenvolvedor) lê e escreve Aulas por um **servidor MCP local** sobre o Firestore — não mais por arquivos.

## Agent skills

### Professor (`/professor`)

O Professor deste repo, versionado em `.claude/skills/professor/` (fork da `teach-v2` global, lineage teach-v3). Invocado com o nome do Curso (`/professor <curso> …`); lê e escreve as **Aulas pelas ferramentas do MCP local** (`list_courses`, `read_aula`, `write_aula`, `delete_aula`) sobre o Firestore, com `write_aula` validando na hora e devolvendo erros estruturados. O scratch de ensino (`MISSION.md`, `RESOURCES.md`, `learning-records/`, `REVIEW.md`, `reference/`, `NOTES.md`) ainda vive em arquivos sob `courses/<nome>/`. Lê somente leitura `docs/catalog-guide.md` e `docs/frontmatter-guide.md`, e escreve Aulas em MDX escolhendo Componentes do Catálogo por significado. Cego à Plataforma (`src/`, build, `gh`) e aos demais Cursos. Quando o Catálogo não cobre um visual/interação, delega a um subagente que invoca `/professor-developer` (a escotilha orquestrada). See `.claude/skills/professor/SKILL.md`.

### Desenvolvedor (`/professor-developer`)

O Desenvolvedor deste repo (`.claude/skills/professor-developer/`, `disable-model-invocation: true`) — a outra ponta da escotilha orquestrada. A pedido do Professor (via subagente), recebe uma spec agnóstica de Plataforma (id da Aula, intenção, dados, flag `reutilizável`), constrói o Esboço como Componente **Preact** nos trilhos em `src/sketches/preact/`, registra-o no mapa empacotado `src/sketches/preact/index.ts`, valida (`npm run check` + teste Seam B em `tests/sketches-preact.test.ts`), e devolve ao Professor só o snippet de uso (`<Nome … />`), nunca código. Como o Esboço é código, ele só aparece após o deploy (`git push` → App Hosting); o binding vive em `esbocos[]` no documento da Aula (não mais no `registry.ts`) e o fallback cobre a janela até o deploy. Quando `reutilizável`, abre uma Solicitação de Componente. Nunca toca o Catálogo nem promove. See `.claude/skills/professor-developer/SKILL.md`.

### Issue tracker

Issues e PRDs vivem como GitHub Issues do repositório (`gh` CLI); PRs externos não entram na fila de triage. Issues criadas a partir de um PRD são vinculadas como sub-issues nativas do PRD. See `docs/agents/issue-tracker.md`.

### Triage labels

Vocabulário padrão (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Solicitação de Componente

O Desenvolvedor abre uma Issue `component-request` + `needs-triage` quando o Professor julga um Esboço reutilizável; um humano promove (Esboço → Componente). See `docs/agents/component-request.md`.

### Domain docs

Single-context: um `CONTEXT.md` + `docs/adr/` na raiz. See `docs/agents/domain.md`.

## Git Flow

You don't need to create branch for each issue. We will push directly on main after my review.

Do not commit after finish a issue. I want to review uncommitted changes and make the commit myself.
