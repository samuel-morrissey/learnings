<!-- GERADO de src/lib/frontmatter.ts por `npm run gen:frontmatter-guide` — NÃO edite à mão. -->

# Guia do Frontmatter

Toda Aula começa por um bloco de Frontmatter — os metadados que a Plataforma usa
para validar, ordenar e indexar a Aula. Preencha **todos** os campos obrigatórios
conforme a tabela abaixo, escolhendo os valores por *significado*; um Frontmatter
incompleto ou inválido reprova a Aula no build. O Curso não é declarado aqui: ele
vem da pasta em que a Aula vive.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `title` | `string` | sim | O título da Aula, exibido no topo da página e na navegação do Curso. |
| `order` | `integer` | sim | A posição da Aula na trilha do Curso. Deve ser igual ao número NNNN do nome do arquivo (`lessons/NNNN-<slug>.mdx`), para que ordem e arquivo nunca discordem. |
| `domain` | `string` | sim | O domínio ou assunto que a Aula cobre (ex.: "Storage", "Security"), usado para situar o aluno e agrupar Aulas. |
| `summary` | `string` | sim | Um resumo de uma frase do que a Aula ensina, mostrado no índice do Curso. |
| `prerequisites` | `string[]` | não | Ids das Aulas que o aluno deve ter visto antes (`<curso>/<slug>`). É a única forma de declarar dependência entre Aulas; omita quando não houver. |
| `estMinutes` | `integer` | sim | Estimativa de tempo de estudo da Aula, em minutos. |
