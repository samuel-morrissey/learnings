import { test, expect, beforeAll } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

import Callout from "../src/components/Callout.astro";
import LessonLayout from "../src/layouts/LessonLayout.astro";
import Kicker from "../src/components/Kicker.astro";
import Nav from "../src/components/Nav.astro";
import MissionBox from "../src/components/MissionBox.astro";
import AskBox from "../src/components/AskBox.astro";
import CompareCards from "../src/components/CompareCards.astro";
import Sources from "../src/components/Sources.astro";

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

// --- Catalog v1 Components (Seam B: semantic output, not internal form) ---

test("Kicker renders the seal with its content and brand tone", async () => {
  const html = await container.renderToString(Kicker, {
    slots: { default: "Plataforma · Catálogo v1" },
  });

  expect(html).toContain("Plataforma · Catálogo v1");
  expect(html).toContain('data-tone="aws"');
});

test("MissionBox frames the body as a note and shows the meta slot", async () => {
  const html = await container.renderToString(MissionBox, {
    slots: {
      default: "Por que esta Aula importa.",
      meta: "~6 min",
    },
  });

  expect(html).toContain('role="note"');
  expect(html).toContain("Por que esta Aula?"); // default title
  expect(html).toContain("Por que esta Aula importa.");
  expect(html).toContain("~6 min");
});

test("MissionBox omits the meta line when no meta slot is given", async () => {
  const html = await container.renderToString(MissionBox, {
    slots: { default: "Só o corpo." },
  });

  expect(html).toContain("Só o corpo.");
  expect(html).not.toContain("mission__meta");
});

test("AskBox closes with the production-task role and title", async () => {
  const html = await container.renderToString(AskBox, {
    props: { title: "Sua vez" },
    slots: { default: "Descreva com suas palavras." },
  });

  expect(html).toContain('role="note"');
  expect(html).toContain("Sua vez");
  expect(html).toContain("Descreva com suas palavras.");
});

test("CompareCards renders one card per option and marks the highlight", async () => {
  const html = await container.renderToString(CompareCards, {
    props: {
      cards: [
        { tag: "EBS · block", label: "Bloco", description: "Um HD cru." },
        { tag: "EFS · file", label: "Arquivo", description: "Compartilhado." },
        { tag: "S3 · object", label: "Objeto", description: "Por key.", highlight: true },
      ],
    },
  });

  // N options → N list items.
  expect((html.match(/role="listitem"/g) ?? []).length).toBe(3);
  expect(html).toContain("Bloco");
  expect(html).toContain("Arquivo");
  expect(html).toContain("Objeto");
  expect(html).toContain("EBS · block");
  // Exactly the third card is highlighted.
  expect((html.match(/data-highlight="true"/g) ?? []).length).toBe(1);
  expect((html.match(/data-highlight="false"/g) ?? []).length).toBe(2);
});

test("CompareCards is not tied to three — it renders any N", async () => {
  const html = await container.renderToString(CompareCards, {
    props: {
      cards: [
        { label: "A" },
        { label: "B" },
      ],
    },
  });

  expect((html.match(/role="listitem"/g) ?? []).length).toBe(2);
});

test("Nav renders prev/next links with their semantic rel", async () => {
  const html = await container.renderToString(Nav, {
    props: {
      prev: { href: "/a/", label: "Anterior", sub: "Aula 1" },
      next: { href: "/c/", label: "Próxima", sub: "Aula 3" },
    },
  });

  expect(html).toContain('rel="prev"');
  expect(html).toContain('href="/a/"');
  expect(html).toContain("Anterior");
  expect(html).toContain('rel="next"');
  expect(html).toContain('href="/c/"');
  expect(html).toContain("Próxima");
});

test("Nav omits the missing end (first Lesson has no prev)", async () => {
  const html = await container.renderToString(Nav, {
    props: { next: { href: "/c/", label: "Próxima" } },
  });

  expect(html).toContain('rel="next"');
  expect(html).not.toContain('rel="prev"');
});

test("Sources renders footnotes with derived numbering and ids", async () => {
  const html = await container.renderToString(Sources, {
    props: {
      items: [
        { label: "Sem link" },
        { label: "Com link", href: "https://example.com/" },
      ],
    },
  });

  // Ordered list → numbering derived from order, not hand-typed.
  expect(html).toContain("<ol");
  // Derived ids the prose can link to.
  expect(html).toContain('id="r1"');
  expect(html).toContain('id="r2"');
  expect(html).toContain("Sem link");
  expect(html).toContain('href="https://example.com/"');
});
