import { z } from "zod";

/**
 * The Frontmatter schema — the first-class metadata of a Lesson. This is the
 * single definition shared by the Astro Content Collection (build-time
 * validation + rendering) and the pure site-model (navigation). Invalid
 * Frontmatter fails the build, so a broken Lesson never ships.
 *
 * The Course is *not* declared here: it is inferred from the folder/collection.
 */
export const lessonFrontmatter = z.object({
  title: z
    .string()
    .min(1)
    .describe("O título da Aula, exibido no topo da página e na navegação do Curso."),
  order: z
    .number()
    .int()
    .describe(
      "A posição da Aula na trilha do Curso. Deve ser igual ao número NNNN do nome do arquivo (`lessons/NNNN-<slug>.mdx`), para que ordem e arquivo nunca discordem.",
    ),
  domain: z
    .string()
    .min(1)
    .describe(
      'O domínio ou assunto que a Aula cobre (ex.: "Storage", "Security"), usado para situar o aluno e agrupar Aulas.',
    ),
  summary: z
    .string()
    .min(1)
    .describe("Um resumo de uma frase do que a Aula ensina, mostrado no índice do Curso."),
  prerequisites: z
    .array(z.string())
    .default([])
    .describe(
      "Ids das Aulas que o aluno deve ter visto antes (`<curso>/<slug>`). É a única forma de declarar dependência entre Aulas; omita quando não houver.",
    ),
  estMinutes: z
    .number()
    .int()
    .positive()
    .describe("Estimativa de tempo de estudo da Aula, em minutos."),
});

export type LessonFrontmatter = z.infer<typeof lessonFrontmatter>;
