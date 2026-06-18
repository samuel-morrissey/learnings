"use strict";

// Generates the ephemeral `_site/` directory from the source tree:
//   _site/index.html                     the auto-indexed hub
//   _site/courses/<name>/lessons/*.html  verbatim copies of each lesson
//
// The hub is a pure function of `courses/`; `_site/` is rebuilt from scratch
// on every run so removals/renames/reordering reflect with no leftover state.
// Vanilla Node, zero dependencies.

const fs = require("node:fs");
const path = require("node:path");
const { buildSiteModel } = require("./site-model.js");

const ROOT = path.resolve(__dirname, "..");
const COURSES_DIR = path.join(ROOT, "courses");
const OUT_DIR = path.join(ROOT, "_site");

function build() {
  const model = buildSiteModel(COURSES_DIR);

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const course of model.courses) {
    const srcLessons = path.join(COURSES_DIR, course.name, "lessons");
    const courseDir = path.join(OUT_DIR, "courses", course.name);
    const dstLessons = path.join(courseDir, "lessons");
    fs.mkdirSync(dstLessons, { recursive: true });
    for (const lesson of course.lessons) {
      fs.copyFileSync(
        path.join(srcLessons, lesson.file),
        path.join(dstLessons, lesson.file)
      );
    }
    fs.writeFileSync(
      path.join(courseDir, "index.html"),
      renderCoursePage(course),
      "utf8"
    );
  }

  fs.writeFileSync(path.join(OUT_DIR, "index.html"), renderHub(model), "utf8");

  const lessonTotal = model.courses.reduce((n, c) => n + c.lessonCount, 0);
  console.log(
    `Built ${OUT_DIR} — ${model.courses.length} course(s), ${lessonTotal} lesson(s).`
  );
}

function renderHub(model) {
  const courses = model.courses
    .map(
      (course) =>
        `        <li><a href="courses/${course.name}/">${escapeHtml(
          course.title
        )} · ${course.lessonCount} ${
          course.lessonCount === 1 ? "aula" : "aulas"
        }</a></li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Learnings</title>
  </head>
  <body>
    <header>
      <h1>Learnings</h1>
    </header>
    <main>
      <ul>
${courses}
      </ul>
    </main>
  </body>
</html>
`;
}

function renderCoursePage(course) {
  const lessons = course.lessons
    .map(
      (lesson) =>
        `        <li><a href="lessons/${lesson.file}">${escapeHtml(
          lesson.title
        )}</a></li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(course.title)}</title>
  </head>
  <body>
    <header>
      <a href="../../">← Learnings</a>
      <h1>${escapeHtml(course.title)}</h1>
    </header>
    <main>
      <ol>
${lessons}
      </ol>
    </main>
  </body>
</html>
`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

if (require.main === module) build();

module.exports = { build, renderHub, renderCoursePage };
