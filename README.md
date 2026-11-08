# learnings

O **workspace do Professor**. Aqui vivem a skill `/professor`, os formatos do
scratch de ensino e o scratch de cada Curso em `courses/<id>/`. As **Aulas** e os
**Cursos** não vivem aqui: estão no **Life OS**, no contexto Aprendizado, e o
Professor os lê e escreve pelo **MCP do Life OS**
([samuel-morrissey/life-os#184](https://github.com/samuel-morrissey/life-os/issues/184),
[ADR 0007](docs/adr/0007-learnings-vira-o-workspace-do-professor.md)).

Até a fusão, este repositório era também a Plataforma (Astro SSR no Firebase App
Hosting, Aulas no Firestore e um MCP local). A Plataforma saiu; as Aulas do
Firestore foram exportadas para JSON antes, e esse JSON é a cópia histórica delas.

## O que tem aqui

| Caminho | O que é |
| --- | --- |
| `.claude/skills/professor/` | A skill `/professor` e os formatos do scratch (`MISSION`, `RESOURCES`, `REVIEW`, `LEARNING-RECORD`, `GLOSSARY`) |
| `courses/<id>/` | O scratch de ensino de cada Curso: `MISSION.md`, `RESOURCES.md`, `REVIEW.md`, `NOTES.md`, `learning-records/`, `reference/`. O `<id>` é o slug do Curso no Life OS |
| `.mcp.json` | O MCP do Life OS (`/api/mcp`), com o token vindo de variável de ambiente |
| `CONTEXT.md` | O vocabulário do domínio: Curso, Aula, Catálogo, Componente, Esboço, Professor |
| `docs/adr/` | As decisões, da Plataforma em Astro até a fusão com o Life OS |
| `tests/workspace.test.mjs` | Guarda o papel de workspace (`npm test`) |

## Configurar o token do MCP

O `.mcp.json` registra o servidor `life-os`, por HTTP, e lê dois valores do
ambiente:

| Variável | O que pôr |
| --- | --- |
| `LIFE_OS_MCP_TOKEN` | Obrigatória. O token de acesso por MCP do Life OS |
| `LIFE_OS_MCP_URL` | A URL do MCP do Life OS, terminada em `/api/mcp`. Sem ela, vale a do `.mcp.json`, que é um marcador (`https://<app>.vercel.app/api/mcp`) até ser trocado pela de produção |

1. No Life OS, em **Configurações > Acesso por MCP**, gere um token. Ele aparece
   uma única vez.
2. Exporte o token no shell em que você abre o Claude Code, sem gravá-lo em
   nenhum arquivo do repositório:

   ```bash
   export LIFE_OS_MCP_TOKEN='<token>'
   export LIFE_OS_MCP_URL='https://<app>/api/mcp'
   ```

3. Abra o Claude Code na raiz deste repositório e aprove o servidor `life-os`.
   O `/mcp` deve mostrá-lo conectado, com as ferramentas `guide`,
   `list_courses`, `get_lesson`, `write_lesson`, `archive_lesson` e
   `get_catalog` (e as do acervo, que o Professor não usa).

## Estudar

```text
/professor aws me ensine sobre VPC
```

O primeiro argumento é o id do Curso. O Professor chama `guide`, lê o Catálogo
por `get_catalog`, orienta-se por `list_courses` e pelo scratch do Curso, e grava
as Aulas com `write_lesson`. A Aula aparece no Life OS na hora. Quando o Catálogo
não cobre um visual, ele delega um Esboço à skill `/professor-developer`, que
vive no Life OS. Detalhes em `.claude/skills/professor/SKILL.md`.

## Testes

```bash
npm test
```

Roda `tests/workspace.test.mjs` com o test runner do Node, sem dependências: a
Plataforma não voltou, as Aulas de semente não voltaram, a skill cita as
ferramentas do MCP do Life OS, o `.mcp.json` lê o token do ambiente e nenhum
token foi commitado.
