"use strict";

const fs = require("node:fs");
const path = require("node:path");

/**
 * Discovers courses and lessons from the folder structure under `coursesDir`
 * and returns a pure data model of the site (no HTML).
 *
 * @param {string} coursesDir absolute path to the `courses/` directory
 * @returns {{ courses: Array<{ name: string, title: string, lessonCount: number, lessons: Array<{ slug: string, file: string, title: string }> }> }}
 */
function buildSiteModel(coursesDir) {
  const entries = fs
    .readdirSync(coursesDir, { withFileTypes: true })
    .sort((a, b) => compare(a.name, b.name));
  const courses = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const lessonsDir = path.join(coursesDir, entry.name, "lessons");
    if (!isDirectory(lessonsDir)) continue;

    const lessons = fs
      .readdirSync(lessonsDir, { withFileTypes: true })
      .filter((f) => f.isFile() && f.name.endsWith(".html"))
      .sort((a, b) => compare(a.name, b.name))
      .map((f) => {
        const slug = f.name.replace(/\.html$/, "");
        const html = fs.readFileSync(path.join(lessonsDir, f.name), "utf8");
        return {
          slug,
          file: f.name,
          title: extractTitle(html) || slug,
        };
      });

    const missionPath = path.join(coursesDir, entry.name, "MISSION.md");
    const mission = fs.existsSync(missionPath)
      ? fs.readFileSync(missionPath, "utf8")
      : "";

    courses.push({
      name: entry.name,
      title: extractCourseTitle(mission) || formatFolderName(entry.name),
      lessonCount: lessons.length,
      lessons,
    });
  }

  return { courses };
}

function isDirectory(p) {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

// Fallback course title: turn a folder slug into Title Case words,
// e.g. "machine-learning" -> "Machine Learning".
function formatFolderName(name) {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Course title from the first `#` heading of MISSION.md, with a leading
// "Mission:" label stripped. Empty string when there is no `#` heading.
function extractCourseTitle(markdown) {
  const match = markdown.match(/^#\s+(.+?)\s*$/m);
  if (!match) return "";
  return match[1].replace(/^mission:\s*/i, "").trim();
}

// Content of the first <title> tag, trimmed; empty string when absent.
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : "";
}

// Stable, locale-independent ordering so course/lesson order is identical
// across platforms (dev on Windows, CI on Linux).
function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

module.exports = { buildSiteModel };
