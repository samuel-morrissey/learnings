import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { lessonFrontmatter } from "./lib/frontmatter";

// Lessons live outside the default `src/` tree, under courses/<course>/lessons/.
// The glob loader reads only `*.mdx`, so non-Lesson files (learning-records/,
// reference/, .claude/) naturally stay out of the collection. Entry ids look
// like "aws/lessons/0001-intro".
const lessons = defineCollection({
  loader: glob({
    pattern: "*/lessons/*.mdx",
    base: "./courses",
    // Deterministic "<course>/<slug>" ids that match the pure site-model, so
    // routes can look up an entry from the navigation model.
    generateId: ({ entry }) => {
      const [course, , file] = entry.split("/");
      return `${course}/${file.replace(/\.mdx$/, "")}`;
    },
  }),
  schema: lessonFrontmatter,
});

export const collections = { lessons };
