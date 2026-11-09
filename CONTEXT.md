# learnings

O **workspace do Professor**: a skill `/professor`, os formatos dela e o scratch
de ensino de cada Curso em `courses/<id>/`. As **Aulas** e os **Cursos** vivem
no Life OS, no contexto Aprendizado, e o Professor os lê e escreve pelo MCP do
Life OS ([ADR 0007](docs/adr/0007-learnings-vira-o-workspace-do-professor.md)).
Este glossário fixa a linguagem do domínio; não é spec nem registro de decisões
técnicas (essas vivem em `docs/adr/`).

## Language

**Aula**:
Um documento de aprendizado auto-contido, gerado por IA, sobre um único tópico.
Criada uma vez e raramente alterada depois; não é dinâmica. Vive no Life OS,
endereçada pelo Curso e por um slug `NNNN-<dash-case>`; não é arquivo deste
repositório. Arquivada, fica só leitura, e só o usuário a desarquiva.
_Avoid_: post, artigo, página, lição (use "Aula").

**Curso**:
Uma coleção ordenada de Aulas sobre um domínio (ex.: `aws`, `claude`). O id
do Curso é o mesmo no Life OS e na pasta de scratch `courses/<id>/`.
_Avoid_: módulo, trilha, disciplina.

**Componente**:
Uma unidade visual/semântica reutilizável que a IA insere no corpo MDX de uma
Aula (ex.: Callout, Quiz, MissionBox). Encoda a identidade pedagógica e visual,
de modo que a IA escolha _significado_, não HTML/CSS.
_Avoid_: widget, bloco, partial, snippet.

**Catálogo**:
O conjunto definido de Componentes disponíveis — suas props e regras de uso. É a
**fonte de verdade única**: o mesmo catálogo valida a escrita da Aula e instrui a
IA que gera as Aulas (o Professor o lê por `get_catalog`).
_Avoid_: biblioteca (ambíguo: reserve para a _implementação_ dos Componentes),
design system.

**Esboço**:
Um Componente de uso único, criado para uma única Aula quando nenhum Componente
do Catálogo serve. Vive fora do Catálogo e não é anunciado no guia; é ligado à
sua Aula (pelos `esbocos` dela) e usado pelo nome, como qualquer Componente.
Continua nos trilhos: usa os tokens do sistema visual, é estático e leve (sem
bibliotecas externas, CDN ou rede).
Quando se prova reutilizável, é promovido a Componente do Catálogo.
_Avoid_: ilha (todo Componente interativo já é uma "island"), widget, snippet.

**Solicitação de Componente**:
O sinal que o Professor emite quando julga que um Esboço é reutilizável e merece
virar Componente do Catálogo. Vira issue do Life OS, aberta pelo Desenvolvedor.
Resolvida por um humano, que promove o Esboço a Componente e refatora as Aulas que
o usavam.
_Avoid_: pedido, request, ticket.

**Professor**:
O agente que gera Aulas: a skill `/professor` deste repositório. Opera no nível
de Cursos, Aulas e Componentes-como-vocabulário; é deliberadamente cego à
Plataforma (o código do Life OS, build, deploy, `gh`). Quando precisa de um visual
que o Catálogo não tem, delega ao Desenvolvedor, sinalizando se quer ou não uma
Solicitação de Componente.
_Avoid_: Pedagogo, autor, gerador (use "Professor"; a skill `/professor` no repo é a implementação, lineage `teach-v2`).

**Desenvolvedor**:
O agente que, a pedido do Professor, cria um Esboço e o entrega pronto para uso.
É o oposto do Professor no eixo do conhecimento: conhece a Plataforma e constrói o
Esboço nos trilhos. Vive no Life OS, como a skill `/professor-developer`. Abre a
Solicitação de Componente quando o Professor sinaliza que o Esboço é reutilizável.
_Avoid_: subagente-ponte, dev, programador.

**Plataforma**:
O Life OS, onde as Aulas vivem: guarda os Cursos e as Aulas, implementa o
Catálogo e os Esboços, valida a escrita pelo MCP e renderiza a Aula. Não está
neste repositório; o Professor nunca a enxerga e só fala com ela pelas
ferramentas do MCP.
_Avoid_: site, app, renderer, frontend.

**Frontmatter**:
Os metadados de primeira classe de uma Aula (título, ordem, domínio, resumo,
pré-requisitos, duração). Indexável e consultável: são os **campos** da Aula no
Life OS, ao lado do corpo MDX. O contrato vem de `get_catalog`.
_Avoid_: cabeçalho, meta, header.
