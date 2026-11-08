import type { ExportDoc, ExportSource } from "../src/lib/firestore-export.ts";

/**
 * A read-only, in-memory stand-in for the Firestore the exporter reads
 * (`courses/{id}` and `courses/{id}/lessons/{slug}`), shaped like the slice of
 * the Admin SDK it touches: `collection("courses").get()` and
 * `collectionGroup("lessons").get()`. It has no write method at all, so any
 * write the exporter attempted would throw — and every read is recorded, so a
 * test can assert exactly which queries ran.
 *
 * Shared by the exporter test and the QA script, so both exercise the same
 * simulated database.
 */

export interface FakeLesson {
  course: string;
  slug: string;
  fields: Record<string, unknown>;
  createTime?: Date;
  updateTime?: Date;
}

export interface FakeCourse {
  id: string;
  fields: Record<string, unknown>;
}

export interface FakeFirestore extends ExportSource {
  reads: string[];
}

const timestamp = (date: Date | undefined) => (date ? { toDate: () => date } : undefined);

// The document path as the Admin SDK models it: a doc ref whose parent is a
// collection ref, whose parent is the owning doc ref (or `null` at the root).
function lessonDoc(lesson: FakeLesson): ExportDoc {
  return {
    id: lesson.slug,
    ref: { parent: { parent: { id: lesson.course, parent: { id: "courses" } } } },
    data: () => ({ ...lesson.fields }),
    createTime: timestamp(lesson.createTime),
    updateTime: timestamp(lesson.updateTime),
  };
}

function courseDoc(course: FakeCourse): ExportDoc {
  return {
    id: course.id,
    ref: { parent: { parent: null } },
    data: () => ({ ...course.fields }),
  };
}

export function fakeFirestore(data: {
  courses: FakeCourse[];
  lessons: FakeLesson[];
  // Lessons under a `lessons` collection outside `courses/{id}` (a stray
  // top-level one, or one nested under another collection).
  strayLessons?: ExportDoc[];
}): FakeFirestore {
  const reads: string[] = [];
  return {
    reads,
    collection(path: string) {
      return {
        async get() {
          reads.push(`collection:${path}`);
          return { docs: path === "courses" ? data.courses.map(courseDoc) : [] };
        },
      };
    },
    collectionGroup(id: string) {
      return {
        async get() {
          reads.push(`collectionGroup:${id}`);
          if (id !== "lessons") return { docs: [] };
          return { docs: [...data.lessons.map(lessonDoc), ...(data.strayLessons ?? [])] };
        },
      };
    },
  };
}

/**
 * A database shaped like the real one: `aws` with a description and an Aula
 * written by the MCP (no `esbocos`, no `prerequisites`), `claude` with an Aula
 * carrying explicit `createdAt`/`updatedAt` fields, and `exemplo` with no Course
 * document at all (only the subcollection). Inserted out of order on purpose.
 */
export function sampleFirestore(): FakeFirestore {
  return fakeFirestore({
    courses: [
      { id: "claude", fields: { name: "claude", title: "Claude", order: 2 } },
      {
        id: "aws",
        fields: {
          name: "aws",
          title: "AWS",
          order: 1,
          description: "Trilha para a certificação AWS Cloud Practitioner (CLF-C02).",
        },
      },
    ],
    lessons: [
      {
        course: "aws",
        slug: "0010-iam-usuarios-grupos-e-politicas",
        fields: {
          title: "IAM: usuários, grupos e políticas",
          order: 10,
          domain: "Security",
          summary: "Quem pode fazer o quê na conta.",
          estMinutes: 25,
          mdx: "Corpo da Aula 10.\n",
        },
        createTime: new Date("2026-07-10T09:00:00.000Z"),
        updateTime: new Date("2026-07-11T09:30:00.000Z"),
      },
      {
        course: "aws",
        slug: "0007-amazon-s3-object-storage",
        fields: {
          title: "Amazon S3",
          order: 7,
          domain: "Storage",
          summary: "Onde guardar objetos.",
          prerequisites: ["aws/0001-o-que-e-a-nuvem-e-por-que-importa"],
          estMinutes: 30,
          mdx: "Corpo da Aula 7.\n\n<BucketObjectKey />\n",
          esbocos: ["BucketObjectKey"],
        },
        createTime: new Date("2026-06-01T12:00:00.000Z"),
        updateTime: new Date("2026-06-01T12:00:00.000Z"),
      },
      {
        course: "aws",
        slug: "0009-lambda-e-serverless",
        fields: {
          title: "Lambda e serverless",
          order: 9,
          domain: "Compute",
          summary: "Código sem servidor para administrar.",
          prerequisites: [],
          estMinutes: 20,
          mdx: "Corpo da Aula 9.\n",
          esbocos: [],
        },
        createTime: new Date("2026-07-09T08:00:00.000Z"),
        updateTime: new Date("2026-07-09T08:15:00.000Z"),
      },
      {
        course: "claude",
        slug: "0001-agente-workflow-conversacional",
        fields: {
          title: "Agente, workflow e conversa",
          order: 1,
          domain: "Domínio 1 — Arquitetura Agêntica",
          summary: "Três formas de pôr um modelo para trabalhar.",
          prerequisites: [],
          estMinutes: 15,
          mdx: "Corpo da Aula 1 de claude.\n",
          esbocos: ["AutonomySpectrum"],
          createdAt: { toDate: () => new Date("2026-05-02T10:00:00.000Z") },
          updatedAt: "2026-05-03T10:00:00.000Z",
        },
      },
      {
        course: "exemplo",
        slug: "0001-ola-mdx",
        fields: {
          title: "Olá MDX",
          order: 1,
          domain: "Tracer",
          summary: "Uma Aula de exemplo.",
          estMinutes: 5,
          mdx: "Olá.\n",
          esbocos: [],
        },
      },
    ],
  });
}
