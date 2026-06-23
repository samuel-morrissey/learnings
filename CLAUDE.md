# learnings

Hub estático auto-indexado de cursos/aulas em HTML, publicado no GitHub Pages, com PWA para estudo no celular.

## Agent skills

### Professor (`/professor`)

O Professor deste repo, versionado em `.claude/skills/professor/` (fork da `teach-v2` global, lineage teach-v3). Invocado com o nome da pasta do Curso (`/professor <pasta> …`); escopa todo o estado de ensino a `courses/<nome>/`, lê somente leitura `docs/catalog-guide.md` e `docs/frontmatter-guide.md`, e escreve Aulas em MDX escolhendo Componentes do Catálogo por significado. Cego à Plataforma (`src/`, build, `gh`) e aos demais Cursos. Quando o Catálogo não cobre um visual/interação, delega a um subagente que invoca `/professor-developer` (a escotilha orquestrada). See `.claude/skills/professor/SKILL.md`.

### Desenvolvedor (`/professor-developer`)

O Desenvolvedor deste repo (`.claude/skills/professor-developer/`, `disable-model-invocation: true`) — a outra ponta da escotilha orquestrada. A pedido do Professor (via subagente), recebe uma spec agnóstica de Plataforma (id da Aula, intenção, dados, flag `reutilizável`), constrói o Esboço como Componente Astro nos trilhos em `src/sketches/`, vincula-o à Aula em `src/sketches/registry.ts`, valida (`npm run check` + teste Seam B + `tests/sketches.test.ts`), e devolve ao Professor só o snippet de uso (`<Nome … />`), nunca código. Quando `reutilizável`, abre uma Solicitação de Componente. Nunca toca o Catálogo nem promove. See `.claude/skills/professor-developer/SKILL.md`.

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
