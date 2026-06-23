# Catálogo de Componentes com Esboços em trilhos

> **Refinada pela [ADR 0003](./0003-esbocos-como-componentes-astro-em-sketches.md):**
> o Esboço agora é um Componente Astro em `src/sketches/` (não "JS baunilha, não
> island"). Os **trilhos** abaixo — tokens, escopo, sem libs/CDN/rede — seguem
> valendo.

A IA monta cada Aula a partir de um **Catálogo** de Componentes (fonte de verdade
única: as mesmas definições validam o build e instruem o Pedagogo). O Catálogo
cobre ~90% do conteúdo previsível. Para o restante, a IA pode criar **Esboços** —
blocos visuais/interativos únicos da Aula — mas **em trilhos**:

- **Visualmente nos trilhos:** usam os design tokens centralizados (definidos uma
  vez, nunca por Aula), nunca cores soltas.
- **Auto-contidos e offline-safe:** JS baunilha, SVG, Canvas, CSS escopado.
  **Sem** bibliotecas externas, CDN ou requisições de rede — preserva o PWA
  offline e a leveza no celular. (Precisar de uma lib é, ela mesma, uma
  Solicitação que um humano avalia.)
- **Sem JS arbitrário na página:** a interatividade vive escopada no Esboço/island.

**Governança (crescimento do Catálogo):** quando a IA julga um Esboço
reutilizável, ela emite uma **Solicitação de Componente** — registrada como
GitHub Issue (label `component-request`) no issue-tracker existente, correndo pela
triagem. Um humano resolve: promove o Esboço a Componente do Catálogo e refatora
as Aulas que o usavam. O Catálogo cresce por generalização deliberada, não por
fuga descontrolada.

**Por quê (o trade-off):** opção mais permissiva (escotilha de HTML/CSS/JS
irrestrita) daria variedade mas fragmentaria a estética e quebraria o
offline/leveza. Opção mais fechada (catálogo rígido, sem Esboços) garantiria
consistência mas limitaria a criatividade pedagógica, que varia muito entre
cursos. Os trilhos + a Solicitação de Componente reconciliam: criatividade na
_composição_, consistência no _encanamento_, e um humano no laço para promover o
que se provar reutilizável.

**Fora de escopo agora:** a orquestração entre as camadas Pedagogo e Plataforma
(auto-entrega do guia do Catálogo ao Pedagogo, automação do subagente-ponte). O
guia é gerado do Catálogo, mas entregue manualmente ao Pedagogo por enquanto.

> **Revertido pela [ADR 0004](./0004-professor-e-desenvolvedor-como-skills-no-repo.md):**
> a automação do subagente-ponte deixou de ser fora de escopo. O Professor agora
> **delega** ao Desenvolvedor (`/professor-developer`) via a ferramenta de
> subagente, passando uma spec agnóstica de Plataforma; o laço Esboço fecha sem
> humano no meio. Os trilhos acima seguem valendo.
