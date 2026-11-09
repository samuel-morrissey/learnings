# learnings

O **workspace do Professor**. As Aulas e os Cursos vivem no **Life OS**, no contexto Aprendizado, e o Professor os lê e escreve pelo **MCP do Life OS** (servidor `life-os` do `.mcp.json`, token em `LIFE_OS_MCP_TOKEN`). Aqui ficam só a skill `/professor`, os formatos dela e o scratch de ensino em `courses/<id>/`. A Plataforma (Astro, Firebase, MCP local) saiu na fusão com o Life OS: [samuel-morrissey/life-os#184](https://github.com/samuel-morrissey/life-os/issues/184), [ADR 0007](docs/adr/0007-learnings-vira-o-workspace-do-professor.md). Como configurar o token: `README.md`.

## Agent skills

### Professor (`/professor`)

O Professor deste repo, versionado em `.claude/skills/professor/` (fork da `teach-v2` global, lineage teach-v3). Invocado com o id do Curso (`/professor <curso> …`), que é o slug do Curso no Life OS e o nome da pasta de scratch. Chama `guide` no início da sessão, lê o Catálogo e o Frontmatter por `get_catalog` e as Aulas por `list_courses` e `get_lesson`; grava com `write_lesson`, que valida na hora (erro bloqueia; `sketch-not-deployed` e `prerequisite-missing` só avisam) e arquiva com `archive_lesson`, que para ele é definitivo (só o usuário desarquiva, pela tela do Life OS). O scratch de ensino (`MISSION.md`, `RESOURCES.md`, `learning-records/`, `REVIEW.md`, `reference/`, `NOTES.md`) vive em arquivos sob `courses/<id>/`. Cego à Plataforma e aos demais Cursos. Quando o Catálogo não cobre um visual, delega a um subagente que invoca `/professor-developer` no clone do Life OS. See `.claude/skills/professor/SKILL.md`.

### Desenvolvedor (`/professor-developer`)

Não vive mais aqui: é a skill `.claude/skills/professor-developer/` do Life OS (`samuel-morrissey/life-os`), que constrói o Esboço em React e abre a Solicitação de Componente como issue de lá.

### Issue tracker

Issues e PRDs vivem como GitHub Issues do repositório (`gh` CLI); PRs externos não entram na fila de triage. Issues criadas a partir de um PRD são vinculadas como sub-issues nativas do PRD. See `docs/agents/issue-tracker.md`.

### Triage labels

Vocabulário padrão (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: um `CONTEXT.md` + `docs/adr/` na raiz. See `docs/agents/domain.md`.

## Testes

`npm test` roda `tests/workspace.test.mjs` (test runner do Node, sem dependências): guarda que a Plataforma não volta, que a skill usa as ferramentas do MCP do Life OS e que nenhum token entra no repositório. Rode-o antes de commitar uma mudança na skill, no `.mcp.json` ou nesta documentação.

## Git Flow

Uma branch por issue, com o nome `<tipo>-<numero>` (`docs-52`, `sub-task-49`), e um PR para a `main`; o merge é meu, depois da revisão. Commits semânticos em português, como os do histórico (`docs(professor): …`, `refactor(workspace): …`).

O scratch em `courses/<id>/` é escrito pelo Professor durante as sessões de estudo; commitá-lo é decisão minha, não do agente.

Nunca commite um token do MCP: ele vem só de `LIFE_OS_MCP_TOKEN`.
