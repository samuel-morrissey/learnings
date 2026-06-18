"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { buildSiteModel } = require("./site-model.js");

/**
 * Materialises a fixture tree into a fresh temp dir and returns the path to
 * its `courses/` directory. The tree is described as nested objects: a string
 * value is a file's contents, an object is a subdirectory.
 */
function makeCoursesDir(tree) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "learnings-"));
  const coursesDir = path.join(root, "courses");
  writeTree(coursesDir, tree);
  return coursesDir;
}

function writeTree(dir, tree) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, value] of Object.entries(tree)) {
    const target = path.join(dir, name);
    if (typeof value === "string") {
      fs.writeFileSync(target, value);
    } else {
      writeTree(target, value);
    }
  }
}

test("discovers a course with its lessons", () => {
  const coursesDir = makeCoursesDir({
    aws: {
      "MISSION.md": "# Mission: AWS\n",
      lessons: {
        "0001-intro.html": "<title>Intro</title>",
      },
    },
  });

  const model = buildSiteModel(coursesDir);

  assert.equal(model.courses.length, 1);
  const course = model.courses[0];
  assert.equal(course.name, "aws");
  assert.equal(course.lessonCount, 1);
  assert.equal(course.lessons.length, 1);
  assert.equal(course.lessons[0].slug, "0001-intro");
  assert.equal(course.lessons[0].file, "0001-intro.html");
});

test("falls back to a formatted folder name when MISSION.md is missing", () => {
  const coursesDir = makeCoursesDir({
    "machine-learning": {
      lessons: { "0001-intro.html": "<title>Intro</title>" },
    },
  });

  const model = buildSiteModel(coursesDir);

  assert.equal(model.courses[0].title, "Machine Learning");
});

test("falls back to a formatted folder name when MISSION.md has no '#'", () => {
  const coursesDir = makeCoursesDir({
    "deep-learning": {
      "MISSION.md": "No heading here, just prose.\n",
      lessons: { "0001-intro.html": "<title>Intro</title>" },
    },
  });

  const model = buildSiteModel(coursesDir);

  assert.equal(model.courses[0].title, "Deep Learning");
});

test("uses the first '#' heading of MISSION.md as the course title", () => {
  const coursesDir = makeCoursesDir({
    aws: {
      "MISSION.md":
        "# Mission: AWS Certified Cloud Practitioner (CLF-C02)\n\n## Why\nbody\n",
      lessons: { "0001-intro.html": "<title>Intro</title>" },
    },
  });

  const model = buildSiteModel(coursesDir);

  assert.equal(
    model.courses[0].title,
    "AWS Certified Cloud Practitioner (CLF-C02)"
  );
});

test("uses the <title> tag as the lesson title", () => {
  const coursesDir = makeCoursesDir({
    aws: {
      lessons: {
        "0001-intro.html":
          "<!doctype html><html><head><title>Lição 01 — O que é a nuvem</title></head><body></body></html>",
      },
    },
  });

  const model = buildSiteModel(coursesDir);

  assert.equal(
    model.courses[0].lessons[0].title,
    "Lição 01 — O que é a nuvem"
  );
});

test("falls back to the file slug when the lesson has no <title>", () => {
  const coursesDir = makeCoursesDir({
    aws: {
      lessons: { "0002-no-title.html": "<html><body>no head</body></html>" },
    },
  });

  const model = buildSiteModel(coursesDir);

  assert.equal(model.courses[0].lessons[0].title, "0002-no-title");
});

test("orders lessons by file name", () => {
  const coursesDir = makeCoursesDir({
    aws: {
      lessons: {
        "0003-c.html": "<title>c</title>",
        "0001-a.html": "<title>a</title>",
        "0002-b.html": "<title>b</title>",
      },
    },
  });

  const model = buildSiteModel(coursesDir);

  assert.deepEqual(
    model.courses[0].lessons.map((l) => l.slug),
    ["0001-a", "0002-b", "0003-c"]
  );
});

test("keeps a course with an empty lessons/ folder, with count 0", () => {
  const coursesDir = makeCoursesDir({
    aws: { lessons: {} },
  });

  const model = buildSiteModel(coursesDir);

  assert.equal(model.courses.length, 1);
  assert.equal(model.courses[0].lessonCount, 0);
  assert.deepEqual(model.courses[0].lessons, []);
});

test("ignores non-.html files and subfolders inside lessons/", () => {
  const coursesDir = makeCoursesDir({
    aws: {
      lessons: {
        "0001-intro.html": "<title>Intro</title>",
        "notes.md": "# notes",
        "diagram.png": "binary-ish",
        assets: { "style.css": "body{}" },
      },
    },
  });

  const model = buildSiteModel(coursesDir);

  assert.deepEqual(
    model.courses[0].lessons.map((l) => l.file),
    ["0001-intro.html"]
  );
  assert.equal(model.courses[0].lessonCount, 1);
});

test("orders courses alphabetically by folder name", () => {
  const coursesDir = makeCoursesDir({
    terraform: { lessons: { "0001-a.html": "<title>a</title>" } },
    aws: { lessons: { "0001-a.html": "<title>a</title>" } },
    kubernetes: { lessons: { "0001-a.html": "<title>a</title>" } },
  });

  const model = buildSiteModel(coursesDir);

  assert.deepEqual(
    model.courses.map((c) => c.name),
    ["aws", "kubernetes", "terraform"]
  );
});

test("ignores directories without a lessons/ subfolder", () => {
  const coursesDir = makeCoursesDir({
    aws: { lessons: { "0001-intro.html": "<title>Intro</title>" } },
    scripts: { "build.js": "// not a course" },
    ".github": { workflows: { "deploy.yml": "name: deploy" } },
  });

  const model = buildSiteModel(coursesDir);

  assert.deepEqual(
    model.courses.map((c) => c.name),
    ["aws"]
  );
});
