// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// Static, build-time output: the Platform renders the Lessons once and ships
// plain files, preserving the lightweight, offline-friendly PWA.
//
// `site` + `base` target the project's GitHub Pages URL, which serves under the
// repo subpath (`/learnings/`). Every internal link and asset goes through
// `import.meta.env.BASE_URL`, so they all resolve under that prefix once built.
export default defineConfig({
  site: "https://morrisseybr.github.io",
  // Trailing slash kept so `import.meta.env.BASE_URL` joins cleanly with the
  // `${base}courses/...` links and PWA hrefs (it is used verbatim, not normalized).
  base: "/learnings/",
  output: "static",
  integrations: [mdx()],
});
