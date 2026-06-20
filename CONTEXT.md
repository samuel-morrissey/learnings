# learnings

Hub estático de cursos/aulas que **uma IA gera**, publicado no GitHub Pages e
consumido como PWA no celular. Este glossário fixa a linguagem do domínio; não é
spec nem registro de decisões técnicas (essas vivem em `docs/adr/`).

## Language

**Aula**:
Um documento de aprendizado auto-contido, gerado por IA, sobre um único tópico.
Criada uma vez e raramente alterada depois; não é dinâmica.
_Avoid_: post, artigo, página, lição (use "Aula").

**Curso**:
Uma coleção ordenada de Aulas sobre um domínio (ex.: `aws`, `claude`).
_Avoid_: módulo, trilha, disciplina.

**Componente**:
Uma unidade visual/semântica reutilizável que a IA insere no corpo MDX de uma
Aula (ex.: Callout, Quiz, MissionBox). Encoda a identidade pedagógica e visual,
de modo que a IA escolha _significado_, não HTML/CSS.
_Avoid_: widget, bloco, partial, snippet.

**Catálogo**:
O conjunto definido de Componentes disponíveis — suas props e regras de uso. É a
**fonte de verdade única**: o mesmo catálogo valida o build e instrui a IA que
gera as Aulas.
_Avoid_: biblioteca (ambíguo: reserve para a _implementação_ dos Componentes),
design system.

**Esboço**:
Um bloco visual/interativo único de uma Aula, inventado pela IA quando nenhum
Componente do Catálogo serve. Vive junto da Aula (não no Catálogo), é visualmente
nos trilhos (usa os design tokens), escopado e auto-contido — JS baunilha, SVG,
Canvas e CSS, sem bibliotecas externas, CDN ou rede (preserva o offline do PWA).
_Avoid_: ilha (todo Componente interativo já é uma "island" do Astro), widget.

**Solicitação de Componente**:
O sinal que a IA emite quando julga que um Esboço é reutilizável e merece virar
Componente do Catálogo. Resolvida por um humano, que promove o Esboço a
Componente e refatora as Aulas que o usavam.
_Avoid_: pedido, request, ticket.

**Pedagogo**:
O agente que gera Aulas (hoje a skill `teach-v2`). Opera no nível de Cursos,
Aulas e Componentes-como-vocabulário; é deliberadamente cego à Plataforma (Astro,
build, repo, `gh`). Quando precisa de um Esboço, delega a um subagente-ponte,
sinalizando se quer ou não uma Solicitação de Componente.
_Avoid_: autor, gerador (use "Pedagogo"; `teach-v2` é a implementação atual).

**Plataforma**:
Este repositório: Astro, a implementação do Catálogo, o build e a publicação no
GitHub Pages. Renderiza e valida o MDX que o Pedagogo escreve; o Pedagogo nunca
a enxerga.
_Avoid_: site, app, renderer, frontend.

**Frontmatter**:
Os metadados de primeira classe de uma Aula (título, ordem, domínio, resumo,
pré-requisitos, duração). Indexável e consultável; é o que, no futuro, viraria
as colunas de uma Aula por usuário num banco.
_Avoid_: cabeçalho, meta, header.
