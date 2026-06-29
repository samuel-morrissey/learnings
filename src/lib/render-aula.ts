import { compile, run } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import * as runtime from "preact/jsx-runtime";

/**
 * The render module — a thin layer over the official MDX engine
 * (`@mdx-js/mdx`), the same one `next-mdx-remote` wraps. It is *not* the
 * build-time `@astrojs/mdx`: it compiles a raw MDX string in runtime and runs
 * it against the **Preact** JSX runtime, so a Lesson stored as text in the
 * database becomes HTML on each request (ADR 0005).
 *
 * `components` is the name→implementation map (the Preact Catalog, plus a
 * Lesson's Esboços in later slices). A `<Callout>` in the MDX is resolved
 * through it; nothing is imported by the content. This tracer bullet is the
 * happy path only — validation and per-block fallback arrive in a later slice.
 */
export async function renderAula(
  mdx: string,
  components: Record<string, unknown>,
): Promise<string> {
  // `function-body` output is what `run` consumes: compiled JS that closes over
  // the runtime we hand it, rather than a self-importing ES module.
  const compiled = String(await compile(mdx, { outputFormat: "function-body" }));

  // `run` is the official "execute compiled MDX" entry point. We feed it the
  // Preact runtime so every JSX node the MDX produces is a Preact element.
  const { default: Content } = await run(compiled, {
    Fragment: runtime.Fragment,
    jsx: runtime.jsx,
    jsxs: runtime.jsxs,
    baseUrl: import.meta.url,
  });

  // The name→component map is heterogeneous by nature (the loose seam shape);
  // narrow it to MDX's component-map type at the single point it is consumed.
  return renderToString(h(Content, { components: components as MDXComponents }));
}
