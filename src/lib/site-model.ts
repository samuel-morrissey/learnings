import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { lessonFrontmatter, type LessonFrontmatter } from "./frontmatter";

export interface Lesson extends LessonFrontmatter {
  /** Filename without the `.mdx` extension, e.g. "0001-intro". */
  slug: string;
  /** Owning course folder name, e.g. "aws". */
  course: string;
}

export interface Course {
  name: string;
  title: string;
  lessonCount: number;
  lessons: Lesson[];
}

export interface SiteModel {
  courses: Course[];
}

/**
 * Discovers Courses and Lessons from `courses/<course>/lessons/*.mdx` and
 * returns the pure navigation model — the successor to the old
 * scripts/site-model.js, now reading MDX Frontmatter instead of HTML.
 *
 * Only `.mdx` files inside a `lessons/` folder count as Lessons, so non-Lesson
 * content (learning-records/, reference/, .claude/) stays out. Courses with no
 * `.mdx` lessons yet (not migrated) are omitted. Frontmatter is validated; an
 * invalid Lesson throws, naming the file, so the build fails early.
 *
 * @param coursesDir absolute path to the `courses/` directory
 */
export function buildSiteModel(coursesDir: string): SiteModel {
  const courses: Course[] = [];

  const entries = fs
    .readdirSync(coursesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .sort((a, b) => compare(a.name, b.name));

  for (const entry of entries) {
    const lessonsDir = path.join(coursesDir, entry.name, "lessons");
    if (!isDirectory(lessonsDir)) continue;

    const lessons = fs
      .readdirSync(lessonsDir, { withFileTypes: true })
      .filter((f) => f.isFile() && f.name.endsWith(".mdx"))
      .map((f) => readLesson(entry.name, path.join(lessonsDir, f.name), f.name))
      .sort((a, b) => a.order - b.order || compare(a.slug, b.slug));

    if (lessons.length === 0) continue;

    courses.push({
      name: entry.name,
      title: courseTitle(coursesDir, entry.name),
      lessonCount: lessons.length,
      lessons,
    });
  }

  return { courses };
}

function readLesson(course: string, filePath: string, fileName: string): Lesson {
  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  const parsed = lessonFrontmatter.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid Frontmatter in ${course}/lessons/${fileName}:\n${formatIssues(parsed.error)}`
    );
  }
  return {
    ...parsed.data,
    slug: fileName.replace(/\.mdx$/, ""),
    course,
  };
}

function courseTitle(coursesDir: string, name: string): string {
  const missionPath = path.join(coursesDir, name, "MISSION.md");
  if (fs.existsSync(missionPath)) {
    const heading = fs
      .readFileSync(missionPath, "utf8")
      .match(/^#\s+(.+?)\s*$/m);
    if (heading) return heading[1].replace(/^mission:\s*/i, "").trim();
  }
  return formatFolderName(name);
}

// Turn a folder slug into Title Case words: "machine-learning" -> "Machine Learning".
function formatFolderName(name: string): string {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatIssues(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  return error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
}

function isDirectory(p: string): boolean {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

// Stable, locale-independent ordering so order is identical across platforms
// (dev on Windows, CI on Linux).
function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
