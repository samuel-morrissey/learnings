import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { lessonFrontmatter } from "./frontmatter";
import {
  buildSiteModel,
  type CourseRecord,
  type Lesson,
  type SiteModel,
} from "./site-model";

/**
 * The transitional filesystem adapter: reads `courses/<course>/lessons/*.mdx`
 * into records and feeds the pure `buildSiteModel` (Seam D). It exists only so
 * the still-static Lesson route can enumerate Lessons for `getStaticPaths`
 * while content migrates to Firestore; the hub and Course pages already read
 * from Firestore (issue #25). It is removed once every Lesson lives in the
 * store and the static route is gone (a later slice of the parent PRD).
 *
 * Only `.mdx` files inside a `lessons/` folder count, so non-Lesson content
 * (learning-records/, reference/, .claude/) stays out. Frontmatter is
 * validated; an invalid Lesson throws, naming the file, so the build fails
 * early. The Course title is inferred from MISSION.md (the pre-Firestore
 * source) or the folder name — the Firestore adapter uses the stored field.
 *
 * @param coursesDir absolute path to the repo's `courses/` directory
 */
export function readSiteModelFromFs(coursesDir: string): SiteModel {
  const courses: CourseRecord[] = [];
  const lessons: Lesson[] = [];

  const entries = fs
    .readdirSync(coursesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory());

  for (const entry of entries) {
    const lessonsDir = path.join(coursesDir, entry.name, "lessons");
    if (!isDirectory(lessonsDir)) continue;

    for (const file of fs.readdirSync(lessonsDir, { withFileTypes: true })) {
      if (!file.isFile() || !file.name.endsWith(".mdx")) continue;
      lessons.push(readLesson(entry.name, path.join(lessonsDir, file.name), file.name));
    }

    courses.push({ name: entry.name, title: courseTitle(coursesDir, entry.name) });
  }

  return buildSiteModel(courses, lessons);
}

function readLesson(course: string, filePath: string, fileName: string): Lesson {
  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  const parsed = lessonFrontmatter.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid Frontmatter in ${course}/lessons/${fileName}:\n${formatIssues(parsed.error)}`,
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
    const heading = fs.readFileSync(missionPath, "utf8").match(/^#\s+(.+?)\s*$/m);
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
