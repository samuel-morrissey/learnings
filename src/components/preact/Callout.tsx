import { h, type ComponentChildren } from "preact";

// The first Catalog Component, ported to Preact so it is reachable by name from
// MDX rendered at runtime (`@mdx-js/mdx` `run`). The Professor still picks a
// Callout by *meaning* (variant), never by markup or color; variants map to the
// status tokens, so every Callout is on-brand. Authored with `h()` rather than
// JSX so it needs no JSX transform in any environment (Vitest, Astro SSR, Node).
// Styles are global (src/styles/catalog.css) — Astro's per-component scoping
// does not exist off `.astro`; a Catalog-wide scoping strategy is a later slice.

type Variant = "info" | "warn" | "ok";

interface Props {
  variant?: Variant;
  children?: ComponentChildren;
}

const LABEL: Record<Variant, string> = {
  info: "Nota",
  warn: "Atenção",
  ok: "Boa prática",
};

const ICON: Record<Variant, string> = {
  info: "💡",
  warn: "⚠️",
  ok: "✅",
};

export function Callout({ variant = "info", children }: Props) {
  return h(
    "aside",
    {
      class: `callout callout--${variant}`,
      "data-variant": variant,
      role: "note",
      "aria-label": LABEL[variant],
    },
    h("span", { class: "callout__icon", "aria-hidden": "true" }, ICON[variant]),
    h("div", { class: "callout__body" }, children),
  );
}
