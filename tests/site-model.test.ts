import { test, expect } from "vitest";

import { buildSiteModel, type CourseRecord, type Lesson } from "../src/lib/site-model";

// Seam D — the navigation model as a *pure* function over records already
// fetched from the store (ADR 0005, issue #25). The old version of this suite
// materialised temp directories and walked the filesystem; now it feeds plain
// records, the same shape the Firestore adapter hands in. Ordering, title and
// exclusions are asserted exactly as before — only the input changed.

// A valid Lesson record, with overridable fields. `course`/`slug` identify it.
function lesson(fields: Partial<Lesson> & Pick<Lesson, "course" | "slug">): Lesson {
  return {
    title: "Olá MDX",
    order: 1,
    domain: "Tracer",
    summary: "Uma Aula de exemplo.",
    prerequisites: [],
    estMinutes: 5,
    ...fields,
  };
}

function course(name: string, title: string = name): CourseRecord {
  return { name, title };
}

test("groups lessons under their course and surfaces Frontmatter on each", () => {
  const model = buildSiteModel(
    [course("exemplo", "Exemplo")],
    [lesson({ course: "exemplo", slug: "0001-ola", title: "Olá", order: 1, estMinutes: 7 })],
  );

  expect(model.courses).toHaveLength(1);
  const c = model.courses[0];
  expect(c.name).toBe("exemplo");
  expect(c.lessonCount).toBe(1);
  expect(c.lessons[0]).toMatchObject({
    slug: "0001-ola",
    course: "exemplo",
    title: "Olá",
    order: 1,
    estMinutes: 7,
  });
});

test("uses the title from the course record (not MISSION.md)", () => {
  const model = buildSiteModel(
    [course("aws", "AWS Certified Cloud Practitioner (CLF-C02)")],
    [lesson({ course: "aws", slug: "0001-a" })],
  );

  expect(model.courses[0].title).toBe("AWS Certified Cloud Practitioner (CLF-C02)");
});

test("orders lessons by `order`, stable and independent of slug", () => {
  const model = buildSiteModel(
    [course("aws")],
    [
      lesson({ course: "aws", slug: "zzz", order: 1 }),
      lesson({ course: "aws", slug: "aaa", order: 3 }),
      lesson({ course: "aws", slug: "mmm", order: 2 }),
    ],
  );

  expect(model.courses[0].lessons.map((l) => l.order)).toEqual([1, 2, 3]);
});

test("tiebreaks lessons of equal `order` by slug", () => {
  const model = buildSiteModel(
    [course("aws")],
    [
      lesson({ course: "aws", slug: "b", order: 1 }),
      lesson({ course: "aws", slug: "a", order: 1 }),
    ],
  );

  expect(model.courses[0].lessons.map((l) => l.slug)).toEqual(["a", "b"]);
});

test("orders courses alphabetically by name (locale-independent)", () => {
  const model = buildSiteModel(
    [course("terraform"), course("aws"), course("kubernetes")],
    [
      lesson({ course: "terraform", slug: "0001-a" }),
      lesson({ course: "aws", slug: "0001-a" }),
      lesson({ course: "kubernetes", slug: "0001-a" }),
    ],
  );

  expect(model.courses.map((c) => c.name)).toEqual(["aws", "kubernetes", "terraform"]);
});

test("passes prerequisites through untouched", () => {
  const model = buildSiteModel(
    [course("aws")],
    [lesson({ course: "aws", slug: "0001-a", prerequisites: ["0001-intro", "0002-ec2"] })],
  );

  expect(model.courses[0].lessons[0].prerequisites).toEqual(["0001-intro", "0002-ec2"]);
});

test("excludes courses that have no lessons", () => {
  const model = buildSiteModel(
    [course("aws"), course("claude")],
    [lesson({ course: "aws", slug: "0001-a" })],
  );

  expect(model.courses.map((c) => c.name)).toEqual(["aws"]);
});

test("ignores lessons whose course is absent from the course records", () => {
  const model = buildSiteModel(
    [course("aws")],
    [
      lesson({ course: "aws", slug: "0001-a" }),
      lesson({ course: "orphan", slug: "0001-x" }),
    ],
  );

  expect(model.courses.map((c) => c.name)).toEqual(["aws"]);
  expect(model.courses[0].lessonCount).toBe(1);
});
