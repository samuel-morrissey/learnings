import { test, expect } from "vitest";

import { renderAula } from "../src/lib/render-aula";
import { Callout } from "../src/components/preact/Callout";

// Seam A (successor of render.test.ts): renderAula(mdx, components) → HTML.
// Fed a raw MDX string and a name→Component map, it compiles the MDX at runtime
// (`@mdx-js/mdx`) over the Preact runtime and returns semantic HTML. No browser,
// no Firestore, no server — the whole render contract, exercised in isolation.

test("renders plain Markdown to semantic HTML", async () => {
  const html = await renderAula(
    "# Olá\n\nUm parágrafo com **negrito**.",
    {},
  );

  expect(html).toMatch(/<h1[^>]*>Olá<\/h1>/);
  expect(html).toContain("<strong>negrito</strong>");
});

test("maps a Component name in the MDX to its implementation", async () => {
  const mdx = [
    "Antes do aviso.",
    "",
    '<Callout variant="warn">Cuidado com isto.</Callout>',
    "",
    "Depois do aviso.",
  ].join("\n");

  const html = await renderAula(mdx, { Callout });

  // The Component rendered with its semantic output…
  expect(html).toContain('role="note"');
  expect(html).toContain('data-variant="warn"');
  expect(html).toContain("callout--warn");
  expect(html).toContain("Cuidado com isto.");
  // …embedded in the surrounding prose.
  expect(html).toContain("Antes do aviso.");
  expect(html).toContain("Depois do aviso.");
});

test("passes child Markdown through the Component", async () => {
  const html = await renderAula(
    "<Callout>Uma nota com **ênfase**.</Callout>",
    { Callout },
  );

  expect(html).toContain('data-variant="info"');
  expect(html).toContain("<strong>ênfase</strong>");
});
