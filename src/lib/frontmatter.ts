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
  title: z.string().min(1),
  order: z.number().int(),
  domain: z.string().min(1),
  summary: z.string().min(1),
  prerequisites: z.array(z.string()).default([]),
  estMinutes: z.number().int().positive(),
});

export type LessonFrontmatter = z.infer<typeof lessonFrontmatter>;
