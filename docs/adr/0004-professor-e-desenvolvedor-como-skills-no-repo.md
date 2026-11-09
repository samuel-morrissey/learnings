---
status: accepted (traz para o escopo a orquestração adiada pela ADR 0002)
---

# Professor e Desenvolvedor como skills no repo, com a escotilha orquestrada

> **Refinada pela [ADR 0007](./0007-learnings-vira-o-workspace-do-professor.md):** o Professor continua skill deste repositório, mas lê e
> escreve as Aulas pelo MCP do Life OS e tira o Catálogo e o Frontmatter de
> `get_catalog`, não de `docs/`. O Desenvolvedor (`/professor-developer`) foi
> para o Life OS, e a Solicitação de Componente virou issue de lá. A escotilha
> orquestrada e o seam de conhecimento seguem valendo.

O **Professor** e o **Desenvolvedor** passam a viver como skills versionadas no
próprio repo, em `.claude/skills/`: `/professor` (a evolução da skill global
`teach-v2`, lineage "teach-v3") e `/professor-developer`. São um **fork** da
`teach-v2` global — a global permanece intacta para ensino fora deste repo; a do
repo diverge para falar a linguagem da Plataforma (Catálogo, MDX, Esboços).

## O Professor (`/professor`)

- É invocado com o **nome da pasta do Curso** como argumento (ex.: `/professor aws …`).
  Sem argumento, lista as pastas em `courses/` e pergunta; nome inexistente
  oferece **criar um Curso novo** (scaffolding de `MISSION.md`, `RESOURCES.md`, etc.).
- **Escopo fechado:** todo o estado de ensino (`MISSION`, `RESOURCES`, `REVIEW`,
  `NOTES`, `learning-records/`, `reference/`, `lessons/`) é lido e escrito **só**
  sob `courses/<nome>/`. Fora dela, lê **exatamente dois** arquivos, somente
  leitura: `docs/catalog-guide.md` (o Catálogo) e `docs/frontmatter-guide.md` (o
  contrato do Frontmatter). É cego às demais pastas de Curso e à Plataforma
  (`src/`, build, `gh`) — nunca roda comandos da Plataforma.
- **Escreve Aulas em MDX**, não em HTML: `lessons/NNNN-<slug>.mdx`, com `order` ===
  o número `NNNN`; Frontmatter completo; Componentes do Catálogo por significado,
  **sem `import`**; Markdown puro para prosa/tabelas/código. Proibido HTML cru,
  `<script>`, `<style>` inline, CDN. Conexões entre Aulas só via `prerequisites`
  e os Componentes `Nav`/`Sources` — nunca URLs escritas à mão.
- Toda a pedagogia da `teach-v2` (missão, ZPD, revisão espaçada, pseudo
  cheat-sheets, learning records) permanece igual.

## A escotilha, agora orquestrada (refina ADR 0002 e 0003)

A ADR 0002 deixou "a automação do subagente-ponte" **fora de escopo**. Isso é
revertido: quando o Catálogo não expressa algo, o Professor **delega**, via a
ferramenta de subagente, a um agente que invoca `/professor-developer` (o
Desenvolvedor). O seam de conhecimento é preservado:

- **Professor → Desenvolvedor** (spec agnóstica de Plataforma): o **id da Aula**
  (`<curso>/<slug>`), o que o visual/interação deve transmitir, os dados, e se o
  Professor o julga **reutilizável**. Nada de Astro/markup.
- O **Desenvolvedor** constrói o **Esboço** (`src/sketches/<Nome>.astro`, nos
  trilhos da ADR 0002/0003), **vincula-o à Aula** em `src/sketches/registry.ts`
  (passo obrigatório — Esboço não vinculado é invisível), e **valida antes de
  devolver**: `npm run check`, um **teste Seam B obrigatório** do Esboço (escopo
  de estilo isolado, sem libs/CDN/rede, dados renderizam) e `tests/sketches.test.ts`
  verdes. Se `reutilizável`, abre uma **Solicitação de Componente** (`gh`, labels
  `component-request` + `needs-triage`) — sem promover (humano promove).
- **Desenvolvedor → Professor:** um snippet de uso *orientado a significado*
  (`<Nome … />` + props/slots), nunca código. O Professor escreve a referência no
  MDX como se fosse um Componente do Catálogo, sem ver o `.astro`.

## Contrato do Frontmatter como guia gerado

Paralelo ao guia do Catálogo (issue #13), o `docs/frontmatter-guide.md` é
**gerado** do esquema Zod (`src/lib/frontmatter.ts`) via `z.toJSONSchema`, com a
prosa de cada campo vinda de um `.describe()` no próprio esquema. Editar o
Frontmatter (campo ou descrição) regenera o guia; um teste guarda a paridade
arquivo↔esquema. Fonte de verdade única, sem divergência manual.

## Carve-out: reference docs continuam HTML

Os cheat-sheets em `reference/*.html` **não** são Aulas (a coleção Astro ignora
`reference/`). Ficam como HTML auto-contido — a única exceção à regra "o Professor
não escreve HTML", justamente por não passarem pela Plataforma. Trazê-los para uma
coleção renderizada da Plataforma fica para uma issue futura.

## Por quê (o trade-off)

Manter o Professor como skill global e a escotilha manual (ADR 0002) era mais
simples, mas (a) o Professor global não conhece o Catálogo/MDX deste repo, e (b)
a escotilha manual obriga o humano a virar ponte a cada Esboço. Versionar as duas
skills no repo e automatizar a delegação custa duas skills a manter e uma label
nova, mas dá ao Professor contexto correto e fecha o laço Esboço sem humano no
meio — preservando o seam de conhecimento (Professor cego à Plataforma,
Desenvolvedor dono dela) que as ADRs 0001–0003 vêm protegendo.
