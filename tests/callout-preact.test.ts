import { test, expect } from "vitest";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";

import { Callout } from "../src/components/preact/Callout";

// Seam B (Preact successor of the Container-API Callout cases in render.test.ts):
// render the Component to a string and assert its *semantic* output — the role,
// the variant marker, the accessible label, the body — not its internal form.
// This is the per-Component coverage that survives the move off `.astro`: the
// Catalog is reachable by name from runtime-rendered MDX only as Preact.

test("Callout renders as a note with the variant's semantic role", () => {
  const html = renderToString(
    h(Callout, { variant: "warn" }, "Cuidado com isto."),
  );

  expect(html).toContain('role="note"');
  expect(html).toContain('data-variant="warn"');
  expect(html).toContain("callout--warn");
  expect(html).toContain('aria-label="Atenção"');
  expect(html).toContain("Cuidado com isto.");
});

test("Callout defaults to the info variant", () => {
  const html = renderToString(h(Callout, null, "Uma nota."));

  expect(html).toContain('data-variant="info"');
  expect(html).toContain("callout--info");
});

test("each variant produces its own distinct role marker", () => {
  const variants = ["info", "warn", "ok"] as const;
  for (const variant of variants) {
    const html = renderToString(h(Callout, { variant }, "corpo"));
    expect(html).toContain(`callout--${variant}`);
    expect(html).toContain(`data-variant="${variant}"`);
  }
});
