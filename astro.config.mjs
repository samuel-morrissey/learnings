// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";

// Wrap every Markdown/MDX `<table>` in a `.table-scroll` container so wide
// comparison tables scroll horizontally inside the Lesson card instead of
// overflowing it on mobile (see LessonLayout's `.table-scroll` styles).
// Dependency-free hast walk so it adds no npm dependency to the offline PWA.
function rehypeTableScroll() {
  return (tree) => {
    const wrap = (node) => {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === "element" && child.tagName === "table") {
          node.children[i] = {
            type: "element",
            tagName: "div",
            properties: { className: ["table-scroll"] },
            children: [child],
          };
        }
        wrap(child);
      }
    };
    wrap(tree);
  };
}

// SSR output: the Platform now renders Lessons per request, reading them from
// Firestore (ADR 0005). The Node adapter (standalone) is the server Firebase
// App Hosting runs, and what `astro build && node ./dist/server/entry.mjs`
// serves locally. The existing static catalog pages opt back into build-time
// rendering with `export const prerender = true`, so this tracer-bullet slice
// adds one SSR Lesson route without re-rendering the rest of the site per hit.
//
// `site` + `base` are kept from the GitHub Pages era for now; the migration of
// the static pages and the host swap land in later slices of the parent PRD.
export default defineConfig({
  site: "https://morrisseybr.github.io",
  // Trailing slash kept so `import.meta.env.BASE_URL` joins cleanly with the
  // `${base}courses/...` links and PWA hrefs (it is used verbatim, not normalized).
  base: "/learnings/",
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [mdx()],
  // `@astrojs/mdx` extends this Markdown config by default, so the table-scroll
  // wrapper applies to the `.mdx` Lessons too.
  markdown: {
    rehypePlugins: [rehypeTableScroll],
  },
});
