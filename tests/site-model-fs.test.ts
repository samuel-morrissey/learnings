import { test, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { readSiteModelFromFs } from "../src/lib/site-model-fs";

// The transitional filesystem adapter (issue #25): it reads `.mdx` Lessons and
// infers Course titles from MISSION.md, then hands records to the pure
// buildSiteModel (covered in site-model.test.ts). These cases pin the
// filesystem-only behaviour — title inference, Frontmatter validation, and
// file/folder exclusion — that keeps the still-static Lesson route safe until
// content fully migrates to Firestore.

// Materialises a fixture tree into a fresh temp dir and returns its `courses/`
// path. A string value is a file's contents; an object is a subdirectory.
type Tree = { [name: string]: string | Tree };

function makeCoursesDir(tree: Tree): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "learnings-astro-"));
  const coursesDir = path.join(root, "courses");
  writeTree(coursesDir, tree);
  return coursesDir;
}

function writeTree(dir: string, tree: Tree): void {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, value] of Object.entries(tree)) {
    const target = path.join(dir, name);
    if (typeof value === "string") fs.writeFileSync(target, value);
    else writeTree(target, value);
  }
}

// A valid Lesson .mdx, with overridable Frontmatter fields.
function lesson(fields: Record<string, unknown> = {}): string {
  const fm: Record<string, unknown> = {
    title: "Olá MDX",
    order: 1,
    domain: "Tracer",
    summary: "Uma Aula de exemplo.",
    prerequisites: [],
    estMinutes: 5,
    ...fields,
  };
  const yaml = Object.entries(fm)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");
  return `---\n${yaml}\n---\n\nCorpo da Aula.\n`;
}

test("infers the course title from the MISSION.md heading", () => {
  const coursesDir = makeCoursesDir({
    aws: {
      "MISSION.md": "# Mission: AWS Certified Cloud Practitioner (CLF-C02)\n",
      lessons: { "0001-a.mdx": lesson() },
    },
  });

  expect(readSiteModelFromFs(coursesDir).courses[0].title).toBe(
    "AWS Certified Cloud Practitioner (CLF-C02)",
  );
});

test("falls back to a formatted folder name when MISSION.md is missing", () => {
  const coursesDir = makeCoursesDir({
    "machine-learning": { lessons: { "0001-a.mdx": lesson() } },
  });

  expect(readSiteModelFromFs(coursesDir).courses[0].title).toBe("Machine Learning");
});

test("rejects invalid Frontmatter, naming the offending file", () => {
  const coursesDir = makeCoursesDir({
    aws: {
      // estMinutes must be a positive integer; a string must fail.
      lessons: { "0001-bad.mdx": lesson({ estMinutes: "muito" }) },
    },
  });

  expect(() => readSiteModelFromFs(coursesDir)).toThrow(/0001-bad\.mdx/);
});

test("rejects Frontmatter missing a required field", () => {
  const coursesDir = makeCoursesDir({
    aws: { lessons: { "0001-no-title.mdx": "---\norder: 1\n---\nbody\n" } },
  });

  expect(() => readSiteModelFromFs(coursesDir)).toThrow(/0001-no-title\.mdx/);
});

test("excludes non-Lesson files and folders from the collection", () => {
  const coursesDir = makeCoursesDir({
    aws: {
      "MISSION.md": "# Mission: AWS\n",
      lessons: {
        "0001-a.mdx": lesson(),
        "notes.md": "# notes",
        "0002-old.html": "<title>old</title>",
      },
      "learning-records": { "D1.md": "record" },
      reference: { "GLOSSARY.md": "glossary" },
      ".claude": { "skill.md": "skill" },
    },
  });

  const course = readSiteModelFromFs(coursesDir).courses[0];
  expect(course.lessons.map((l) => l.slug)).toEqual(["0001-a"]);
  expect(course.lessonCount).toBe(1);
});

test("excludes courses that have no .mdx lessons yet (unmigrated)", () => {
  const coursesDir = makeCoursesDir({
    aws: { lessons: { "0001-a.mdx": lesson() } },
    claude: { lessons: { "0001-old.html": "<title>old</title>" } },
  });

  expect(readSiteModelFromFs(coursesDir).courses.map((c) => c.name)).toEqual(["aws"]);
});
