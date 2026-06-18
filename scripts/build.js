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
  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.webmanifest"),
    renderManifest(),
    "utf8"
  );

  const lessonTotal = model.courses.reduce((n, c) => n + c.lessonCount, 0);
  console.log(
    `Built ${OUT_DIR} — ${model.courses.length} course(s), ${lessonTotal} lesson(s).`
  );
}

function renderHub(model) {
  const courses = model.courses
    .map(
      (course) =>
        `          <li><a href="courses/${course.name}/"><span class="title">${escapeHtml(
          course.title
        )}</span><span class="meta">· ${course.lessonCount} ${
          course.lessonCount === 1 ? "aula" : "aulas"
        }</span></a></li>`
    )
    .join("\n");

  return layout({
    title: "Learnings",
    header: `      <h1>Learnings</h1>`,
    main: `      <ul class="list card">
${courses}
      </ul>`,
  });
}

function renderCoursePage(course) {
  const lessons = course.lessons
    .map(
      (lesson) =>
        `          <li><a href="lessons/${lesson.file}">${escapeHtml(
          lesson.title
        )}</a></li>`
    )
    .join("\n");

  return layout({
    title: course.title,
    base: "../../",
    header: `      <a class="back" href="../../">← Learnings</a>
      <h1>${escapeHtml(course.title)}</h1>`,
    main: `      <ol class="list card">
${lessons}
      </ol>`,
  });
}

// The PWA manifest, served at the site root. Paths are relative so the app
// installs correctly under the GitHub Pages subpath (`/<repo>/`). The icons
// are PNGs rasterized from `icon.svg` during the CI build.
function renderManifest() {
  return JSON.stringify(
    {
      name: "Learnings",
      short_name: "Learnings",
      start_url: ".",
      scope: ".",
      display: "standalone",
      background_color: "#10202e",
      theme_color: "#10202e",
      icons: [
        { src: "icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2
  );
}

// Shared page shell for the generated index pages. Inherits the lessons'
// visual identity (navy gradient, AWS orange, white cards, system fonts) and
// is mobile-first: single column, ≥44px touch targets, scaling up on desktop.
function layout({ title, header, main, base = "" }) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="manifest" href="${base}manifest.webmanifest" />
    <meta name="theme-color" content="#10202e" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Learnings" />
    <link rel="apple-touch-icon" href="${base}apple-touch-icon.png" />
    <style>${STYLE}</style>
  </head>
  <body>
    <div class="wrap">
      <header>
${header}
      </header>
      <main>
${main}
      </main>
    </div>
  </body>
</html>
`;
}

// Visual tokens lifted from the lessons so the hub/course pages feel like one
// product. Self-contained (no external asset), matching the lessons' approach.
const STYLE = `
    :root{
      --bg1:#10202e; --bg2:#16344a; --card:#ffffff; --ink:#1a2230;
      --muted:#5b6675; --accent:#ff9900; --accent-deep:#ec7211; --aws:#232f3e;
      --line:#e7ebf0;
    }
    *{box-sizing:border-box}
    body{
      margin:0; min-height:100vh;
      background:linear-gradient(180deg,var(--bg1),var(--bg2)) fixed;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
      color:var(--ink); line-height:1.6; padding:32px 16px;
    }
    .wrap{max-width:760px; margin:0 auto;}
    header{margin-bottom:20px;}
    .back{display:inline-flex; align-items:center; min-height:44px;
      color:#cfe0ee; text-decoration:none; font-weight:600; font-size:15px;}
    .back:hover{color:#fff;}
    h1{margin:4px 0 0; color:#fff; font-size:28px; line-height:1.25;}
    .list{list-style:none; margin:0; padding:8px 0;}
    .card{background:var(--card); border-radius:16px;
      box-shadow:0 18px 50px rgba(0,0,0,.35);}
    .list li{padding:0 8px;}
    .list li + li{border-top:1px solid var(--line);}
    .list a{display:flex; align-items:center; gap:12px; min-height:44px;
      padding:10px 8px; color:var(--aws); text-decoration:none;
      font-size:16px; font-weight:600;}
    .list a:hover{color:var(--accent-deep);}
    .list .meta{color:var(--muted); font-weight:600; font-size:13px;}
    ol.list{counter-reset:item;}
    ol.list a{counter-increment:item;}
    ol.list a::before{
      content:counter(item); flex:none;
      width:30px; height:30px; border-radius:8px;
      background:var(--accent); color:#fff; font-weight:800; font-size:14px;
      display:flex; align-items:center; justify-content:center;}
    @media (min-width:600px){
      body{padding:48px 24px;}
      h1{font-size:34px;}
      .list{padding:12px 12px;}
      .list a{font-size:17px;}
    }`;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

if (require.main === module) build();

module.exports = { build, renderHub, renderCoursePage, renderManifest };
