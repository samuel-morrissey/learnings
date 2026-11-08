import { expect, test } from "vitest";

import { exportFirestore, exportSummary } from "../src/lib/firestore-export";
import { fakeFirestore, sampleFirestore } from "./fake-firestore";

// The Firestore exporter (issue #48): every Course and every Aula read from
// Firestore into the JSON the Life OS importer consumes (life-os#184). Tested
// against a simulated, read-only Firestore (`fake-firestore.ts`), so the
// contract — shape, order, absent fields left out — is pinned without a real
// database or a credential.

const NOW = new Date("2026-11-08T12:00:00.000Z");

test("exports every Course and Aula in the contract, in site order", async () => {
  const exported = await exportFirestore(sampleFirestore(), NOW);

  expect(exported).toEqual({
    exported_at: "2026-11-08T12:00:00.000Z",
    courses: [
      {
        id: "aws",
        title: "AWS",
        description: "Trilha para a certificação AWS Cloud Practitioner (CLF-C02).",
        lessons: [
          {
            slug: "0007-amazon-s3-object-storage",
            title: "Amazon S3",
            order: 7,
            domain: "Storage",
            summary: "Onde guardar objetos.",
            prerequisites: ["aws/0001-o-que-e-a-nuvem-e-por-que-importa"],
            estMinutes: 30,
            mdx: "Corpo da Aula 7.\n\n<BucketObjectKey />\n",
            esbocos: ["BucketObjectKey"],
            createdAt: "2026-06-01T12:00:00.000Z",
            updatedAt: "2026-06-01T12:00:00.000Z",
          },
          {
            slug: "0009-lambda-e-serverless",
            title: "Lambda e serverless",
            order: 9,
            domain: "Compute",
            summary: "Código sem servidor para administrar.",
            prerequisites: [],
            estMinutes: 20,
            mdx: "Corpo da Aula 9.\n",
            esbocos: [],
            createdAt: "2026-07-09T08:00:00.000Z",
            updatedAt: "2026-07-09T08:15:00.000Z",
          },
          {
            slug: "0010-iam-usuarios-grupos-e-politicas",
            title: "IAM: usuários, grupos e políticas",
            order: 10,
            domain: "Security",
            summary: "Quem pode fazer o quê na conta.",
            estMinutes: 25,
            mdx: "Corpo da Aula 10.\n",
            esbocos: [],
            createdAt: "2026-07-10T09:00:00.000Z",
            updatedAt: "2026-07-11T09:30:00.000Z",
          },
        ],
      },
      {
        id: "claude",
        title: "Claude",
        description: null,
        lessons: [
          {
            slug: "0001-agente-workflow-conversacional",
            title: "Agente, workflow e conversa",
            order: 1,
            domain: "Domínio 1 — Arquitetura Agêntica",
            summary: "Três formas de pôr um modelo para trabalhar.",
            prerequisites: [],
            estMinutes: 15,
            mdx: "Corpo da Aula 1 de claude.\n",
            esbocos: ["AutonomySpectrum"],
            createdAt: "2026-05-02T10:00:00.000Z",
            updatedAt: "2026-05-03T10:00:00.000Z",
          },
        ],
      },
      {
        id: "exemplo",
        title: "exemplo",
        description: null,
        lessons: [
          {
            slug: "0001-ola-mdx",
            title: "Olá MDX",
            order: 1,
            domain: "Tracer",
            summary: "Uma Aula de exemplo.",
            estMinutes: 5,
            mdx: "Olá.\n",
            esbocos: [],
          },
        ],
      },
    ],
  });
});

test("leaves absent fields out instead of inventing a value", async () => {
  const exported = await exportFirestore(sampleFirestore(), NOW);
  const lesson = exported.courses[0].lessons.find((l) => l.slug === "0010-iam-usuarios-grupos-e-politicas")!;
  const exemplo = exported.courses[2].lessons[0];

  // Not in the document → not in the JSON: no `prerequisites: []`, no dates
  // when neither a field nor the document metadata has one.
  expect(Object.keys(lesson)).not.toContain("prerequisites");
  expect(Object.keys(exemplo)).not.toContain("prerequisites");
  expect(Object.keys(exemplo)).not.toContain("createdAt");
  expect(Object.keys(exemplo)).not.toContain("updatedAt");
  // `esbocos` is the one exception the contract fixes: missing means none.
  expect(lesson.esbocos).toEqual([]);
});

test("round-trips through JSON with the shape the importer parses", async () => {
  const text = JSON.stringify(await exportFirestore(sampleFirestore(), NOW));
  const parsed = JSON.parse(text);

  expect(Object.keys(parsed)).toEqual(["exported_at", "courses"]);
  for (const course of parsed.courses) {
    expect(Object.keys(course)).toEqual(["id", "title", "description", "lessons"]);
    expect(typeof course.title).toBe("string");
    expect(course.title.length).toBeGreaterThan(0);
    for (const lesson of course.lessons) {
      expect(typeof lesson.slug).toBe("string");
      expect(Array.isArray(lesson.esbocos)).toBe(true);
      for (const key of ["createdAt", "updatedAt"]) {
        if (key in lesson) expect(new Date(lesson[key]).toISOString()).toBe(lesson[key]);
      }
    }
  }
});

test("orders Lessons by `order`, slug as the tiebreak, and Courses by id", async () => {
  const lesson = (course: string, slug: string, order: number) => ({
    course,
    slug,
    fields: { title: slug, order, domain: "d", summary: "s", estMinutes: 1, mdx: "" },
  });
  const exported = await exportFirestore(
    fakeFirestore({
      courses: [{ id: "zeta", fields: { title: "Zeta" } }, { id: "alfa", fields: { title: "Alfa" } }],
      lessons: [
        lesson("zeta", "0002-b", 2),
        lesson("alfa", "0010-dez", 10),
        lesson("zeta", "0002-a", 2),
        lesson("alfa", "0002-dois", 2),
        lesson("zeta", "0001-um", 1),
      ],
    }),
    NOW,
  );

  expect(exported.courses.map((c) => c.id)).toEqual(["alfa", "zeta"]);
  expect(exported.courses[0].lessons.map((l) => l.slug)).toEqual(["0002-dois", "0010-dez"]);
  expect(exported.courses[1].lessons.map((l) => l.slug)).toEqual(["0001-um", "0002-a", "0002-b"]);
});

test("a Course without its own document takes its id as title; a blank title falls back too", async () => {
  const exported = await exportFirestore(
    fakeFirestore({
      courses: [{ id: "vazio", fields: { title: "   " } }],
      lessons: [
        { course: "vazio", slug: "0001-a", fields: { title: "A", order: 1, mdx: "" } },
        { course: "orfao", slug: "0001-b", fields: { title: "B", order: 1, mdx: "" } },
      ],
    }),
    NOW,
  );

  expect(exported.courses.map((c) => [c.id, c.title, c.description])).toEqual([
    ["orfao", "orfao", null],
    ["vazio", "vazio", null],
  ]);
});

test("keeps a Course with no Aulas, and skips `lessons` outside courses/{id}", async () => {
  const stray = (parent: { id: string; parent: { id: string } } | null) => ({
    id: "0001-perdida",
    ref: { parent: { parent } },
    data: () => ({ title: "Perdida", order: 1 }),
  });
  const exported = await exportFirestore(
    fakeFirestore({
      courses: [{ id: "novo", fields: { title: "Novo" } }],
      lessons: [],
      strayLessons: [stray(null), stray({ id: "x", parent: { id: "outra" } })],
    }),
    NOW,
  );

  expect(exported.courses).toEqual([{ id: "novo", title: "Novo", description: null, lessons: [] }]);
});

test("only reads: one query for Courses and one for every Aula", async () => {
  const firestore = sampleFirestore();
  await exportFirestore(firestore, NOW);

  // The fake has no write method: reaching this line already proves no write
  // was attempted. These are the only two calls the exporter makes.
  expect(firestore.reads.sort()).toEqual(["collection:courses", "collectionGroup:lessons"]);
});

test("summarizes the counts per Course", async () => {
  const exported = await exportFirestore(sampleFirestore(), NOW);

  expect(exportSummary(exported)).toEqual([
    "Exported 3 course(s) and 5 lesson(s) from Firestore.",
    '  - courses/aws — "AWS" (3 aula(s))',
    '  - courses/claude — "Claude" (1 aula(s))',
    '  - courses/exemplo — "exemplo" (1 aula(s))',
  ]);
});
