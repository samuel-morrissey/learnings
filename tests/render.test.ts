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
import Quiz from "../src/components/Quiz.astro";
import BucketObjectKey from "../src/sketches/BucketObjectKey.astro";

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

// --- Quiz: the first interactive island (Seam B: semantic output) ---

const QUIZ_QUESTIONS = [
  {
    prompt: "Onde guardar uploads de usuários atrás de um Auto Scaling Group?",
    options: [
      "No disco EBS da instância",
      "No Amazon S3 (armazenamento de objetos)",
      "Em variáveis de ambiente",
    ],
    answer: 1,
    explanation: "O EBS morre com a instância; o S3 é independente da computação.",
  },
  {
    prompt: "Em que escopo o nome de um bucket S3 precisa ser único?",
    options: ["Na sua conta", "No mundo inteiro", "Na região"],
    answer: 1,
  },
];

test("Quiz exposes every alternative as a selectable option", async () => {
  const html = await container.renderToString(Quiz, {
    props: { questions: QUIZ_QUESTIONS },
  });

  // One option per alternative across both questions (3 + 3 = 6).
  expect((html.match(/class="quiz__opt"/g) ?? []).length).toBe(6);
  expect(html).toContain("No Amazon S3 (armazenamento de objetos)");
  expect(html).toContain("No mundo inteiro");
});

test("Quiz marks the correct alternative in the markup", async () => {
  const html = await container.renderToString(Quiz, {
    props: { questions: QUIZ_QUESTIONS },
  });

  // Exactly one correct option per question; the rest marked false.
  expect((html.match(/data-correct="true"/g) ?? []).length).toBe(2);
  expect((html.match(/data-correct="false"/g) ?? []).length).toBe(4);
  // The correct answer to Q1 carries the marker.
  expect(html).toMatch(
    /data-correct="true"[^>]*>\s*No Amazon S3 \(armazenamento de objetos\)/,
  );
});

test("Quiz renders the prompts, explanation and the data the island grades on", async () => {
  const html = await container.renderToString(Quiz, {
    props: { questions: QUIZ_QUESTIONS },
  });

  expect(html).toContain("Onde guardar uploads de usuários");
  expect(html).toContain("Em que escopo o nome de um bucket S3 precisa ser único?");
  // The correct-answer index travels with each question for the island to read.
  expect((html.match(/data-answer="1"/g) ?? []).length).toBe(2);
  // The explanation ships in the markup so feedback is offline-ready.
  expect(html).toContain("O EBS morre com a instância");
  // A score region exists for the end-of-quiz tally.
  expect(html).toContain("data-score");
});

test("Quiz is a scoped island — no inline JS leaks into the page", async () => {
  const html = await container.renderToString(Quiz, {
    props: { questions: QUIZ_QUESTIONS, title: "Teste de S3" },
  });

  expect(html).toContain("Teste de S3");
  // Interactivity lives in the bundled island script, never inline handlers.
  expect(html).not.toContain("onclick");
});

// --- Esboço: the bucket → objeto → key diagram (the escape hatch on rails) ---

test("BucketObjectKey renders the bucket and one row per object key", async () => {
  const html = await container.renderToString(BucketObjectKey, {
    props: {
      bucket: "caravela-uploads-prod",
      objects: [
        { icon: "📄", key: "faturas/2026/06/nf-1837.pdf", meta: "objeto · 240 KB" },
        { icon: "🖼️", key: "avatars/user-42.png", meta: "objeto · 18 KB" },
      ],
    },
  });

  expect(html).toContain("caravela-uploads-prod");
  // One row per object.
  expect((html.match(/class="bok__obj"/g) ?? []).length).toBe(2);
  expect(html).toContain("faturas/2026/06/nf-1837.pdf");
  expect(html).toContain("avatars/user-42.png");
  // The model's two scope rules travel as text the Aula can teach against.
  expect(html).toContain("nome único no mundo");
  expect(html).toContain("vive em 1 região");
});

test("BucketObjectKey ships defaults so the Aula references it bare", async () => {
  const html = await container.renderToString(BucketObjectKey);

  expect(html).toContain("caravela-uploads-prod");
  expect(html).toMatch(/namespace é/);
});

test("BucketObjectKey is a scoped Esboço — its styles cannot leak to the page", async () => {
  const html = await container.renderToString(BucketObjectKey);

  // Astro binds the Esboço's styles to one component scope: every element gets
  // the same `data-astro-cid` marker and the CSS rules are emitted suffixed with
  // it, so no rule can ever match an element outside this subtree. A single
  // distinct scope id across the whole render is the proof there is no leak.
  const cids = new Set(
    [...html.matchAll(/data-astro-cid-([a-z0-9]+)/g)].map((m) => m[1]),
  );
  expect(cids.size).toBe(1);
  // The root itself carries the scope, so the entire Esboço is contained by it.
  expect(html).toMatch(/<figure class="bok"[^>]*data-astro-cid-/);
});

test("BucketObjectKey is a static Esboço — it ships no script", async () => {
  const html = await container.renderToString(BucketObjectKey);

  // This Esboço is a faithful static diagram: no island, no inline handlers.
  expect(html).not.toContain("onclick");
  expect(html).not.toContain("<script");
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
