---
status: accepted (supera as ADRs 0001, 0005 e 0006; refina as ADRs 0003 e 0004)
---

# O learnings vira o workspace do Professor; as Aulas vão para o Life OS

As Aulas e os Cursos saem do Firestore e passam a viver no **Life OS**, no
contexto **Aprendizado** ([samuel-morrissey/life-os#184](https://github.com/samuel-morrissey/life-os/issues/184)):
o banco do Life OS guarda os Cursos e as Aulas, o app do Life OS renderiza a Aula
(com o Catálogo e os Esboços portados para React) e o **MCP do Life OS**
(`/api/mcp`) é o caminho de escrita do Professor, com `guide`, `list_courses`,
`get_lesson`, `write_lesson`, `archive_lesson` e `get_catalog`. O learnings deixa
de ser Plataforma e vira só o **workspace do Professor**: ficam a skill
`/professor` com os formatos, o scratch de ensino em `courses/<id>/`, o
`CONTEXT.md` e estas ADRs. Saem `src/`, `scripts/` (o MCP local, o seed, os
geradores de guia, o backup e o exportador), o Astro, o Firebase (`firebase.json`,
`firestore.rules`, `firestore.indexes.json`, `apphosting.yaml`, `.firebaserc`),
`public/`, os testes da Plataforma, o deploy do GitHub Pages, as Aulas de semente
em `courses/*/lessons/*.mdx`, os guias em arquivo (`docs/catalog-guide.md`,
`docs/frontmatter-guide.md`) e a skill `/professor-developer`, que foi para o
Life OS. O `.mcp.json` aponta para o MCP remoto do Life OS, com o token do usuário
lido da variável de ambiente `LIFE_OS_MCP_TOKEN`, nunca gravado no repositório.

**Por quê:** o Life OS já é o app pessoal do usuário, com banco, autenticação,
tema e um MCP com token por usuário. Manter um segundo app (Astro SSR no Firebase
App Hosting, um MCP local com service account e um backup próprio) só para as
Aulas duplicava infraestrutura e deixava o estudo fora do lugar em que o resto da
vida dele já está. Com a fusão, a Aula gravada pelo Professor aparece no Life OS
sem deploy, como já aparecia aqui, e o MCP deixa de depender de uma chave de
service account na máquina.

**Supera a [ADR 0005](./0005-aulas-no-firestore-com-astro-ssr.md) e a
[ADR 0006](./0006-io-da-ia-via-mcp-local-sobre-firestore.md):** o Firestore, o
Astro SSR, o App Hosting e o MCP local sobre o Admin SDK saem. O que elas
decidiram e segue valendo, agora no Life OS: o MDX compilado em runtime com
`@mdx-js/mdx`, o fallback por bloco, e a validação na escrita (erro bloqueia;
Esboço sem deploy só avisa). Supera também a
[ADR 0001](./0001-astro-mdx-em-vez-de-html-artesanal.md): o MDX e os Componentes
ficam, o Astro não.

**Refina a [ADR 0003](./0003-esbocos-como-componentes-astro-em-sketches.md) e a
[ADR 0004](./0004-professor-e-desenvolvedor-como-skills-no-repo.md):** o Esboço é
um componente React em `src/contexts/aprendizado/sketches/` do Life OS, e o
Desenvolvedor é a skill `/professor-developer` de lá; o Professor continua skill
deste repositório e delega ao Desenvolvedor por subagente, com a mesma spec
agnóstica de Plataforma. A Solicitação de Componente vira issue do Life OS. Os
trilhos da [ADR 0002](./0002-catalogo-fechado-com-esbocos-em-trilhos.md) seguem
valendo.

**O que muda para o Professor:**

- Toda sessão começa com `guide`; o Catálogo e o contrato do Frontmatter vêm de
  `get_catalog`, não de arquivo.
- `get_lesson`, `write_lesson` e `archive_lesson` substituem `read_aula`,
  `write_aula` e `delete_aula`. O `course` continua sendo o id da pasta de scratch.
- O pré-requisito que não é uma Aula ativa vira o aviso `prerequisite-missing`, e
  a Aula grava, como no Esboço sem deploy (`sketch-not-deployed`).
- Não se apaga Aula: arquiva-se, e arquivar é definitivo para o Professor, porque
  só o usuário desarquiva, pela tela do Life OS. Aula arquivada e Curso arquivado
  são só leitura.

**Considered options (rejeitadas):**

- **Manter o learnings como Plataforma e só ler as Aulas no Life OS.** Dois apps
  sobre os mesmos dados, ou uma sincronização entre Firestore e Postgres; o custo
  da fusão é menor que o de manter as duas pontas.
- **Mover o scratch para o banco do Life OS junto.** Fica fora desta mudança: o
  scratch (`MISSION.md`, `REVIEW.md`, `learning-records/`, `reference/`…) é de
  uso do Professor na TUI e funciona bem em arquivos. Pode vir depois.
- **Apagar o repositório.** O scratch dos Cursos reais e a skill do Professor
  continuam aqui, e o histórico das decisões (estas ADRs) também.

**Consequências:**

- **A exportação aconteceu antes.** No cutover
  ([life-os#194](https://github.com/samuel-morrissey/life-os/issues/194)), o
  exportador da [issue #48](https://github.com/samuel-morrissey/learnings/issues/48)
  (`scripts/export-firestore.mts`) gravou `courses` e `lessons` do Firestore num
  JSON, que o `import-aprendizado` do Life OS importou. Esse JSON exportado é a
  **cópia histórica** das Aulas do Firestore; o exportador sai junto com o resto da
  Plataforma, e o código dele fica no histórico do git.
- O Firebase (App Hosting, Firestore e o agendamento de backup) é desligado no
  cutover, depois que as Aulas são conferidas no Life OS. Até lá, o Firestore é
  histórico.
- O Professor precisa de um token do MCP do Life OS em `LIFE_OS_MCP_TOKEN` (ver o
  `README.md`). Sem ele, o MCP não conecta e o Professor não lê nem grava Aulas.
- O código da Plataforma (Astro, Preact, Firebase) só existe no histórico do git
  deste repositório.
