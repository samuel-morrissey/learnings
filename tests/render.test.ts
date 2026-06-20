import { test, expect, beforeAll } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

import Callout from "../src/components/Callout.astro";
import LessonLayout from "../src/layouts/LessonLayout.astro";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

test("Callout renders as a note with the variant's semantic role", async () => {
  const html = await container.renderToString(Callout, {
    props: { variant: "warn" },
    slots: { default: "Cuidado com isto." },
  });

  expect(html).toContain('role="note"');
  expect(html).toContain('data-variant="warn"');
  expect(html).toContain("callout--warn");
  expect(html).toContain('aria-label="Atenção"');
  expect(html).toContain("Cuidado com isto.");
});

test("Callout defaults to the info variant", async () => {
  const html = await container.renderToString(Callout, {
    slots: { default: "Uma nota." },
  });

  expect(html).toContain('data-variant="info"');
  expect(html).toContain("callout--info");
});

test("each variant produces its own distinct role marker", async () => {
  const variants = ["info", "warn", "ok"] as const;
  for (const variant of variants) {
    const html = await container.renderToString(Callout, {
      props: { variant },
      slots: { default: "corpo" },
    });
    expect(html).toContain(`callout--${variant}`);
    expect(html).toContain(`data-variant="${variant}"`);
  }
});

test("LessonLayout renders the kicker, title, lead and slotted body", async () => {
  const html = await container.renderToString(LessonLayout, {
    props: {
      title: "Olá, MDX",
      domain: "Plataforma",
      summary: "A bala traçadora.",
      estMinutes: 5,
      courseTitle: "Exemplo",
      courseHref: "/courses/exemplo/",
    },
    slots: { default: "<p>Corpo da Aula.</p>" },
  });

  // Semantic shell: a back link to the Course, the title as an <h1>, the lead.
  expect(html).toMatch(/<h1[^>]*>\s*Olá, MDX\s*<\/h1>/);
  expect(html).toContain("Plataforma");
  expect(html).toContain("~5 min");
  expect(html).toContain("A bala traçadora.");
  expect(html).toContain('href="/courses/exemplo/"');
  expect(html).toContain("Corpo da Aula.");
});
