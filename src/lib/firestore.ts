import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import type { LessonFrontmatter } from "./frontmatter";

/**
 * A Lesson as it lives in Firestore: the Frontmatter promoted to first-class
 * fields, the body as the `mdx` text, and the Esboço binding as `esbocos[]`
 * (ADR 0005). `course`/`slug` are the document path, attached on read.
 */
export interface LessonRecord extends LessonFrontmatter {
  course: string;
  slug: string;
  mdx: string;
  esbocos: string[];
}

/**
 * The Firestore read adapter — the *only* place the SSR server talks to the
 * database, kept deliberately thin and separate from render logic so the next
 * slices (listings, fallback) reuse it. The web surface is read-only and
 * public; writes never happen here (they go through the MCP server with its own
 * read/write service account, ADR 0006).
 *
 * Credentials come from the environment so no secret is committed:
 *   - `FIRESTORE_SA_KEY` — path to the read-only service account JSON (local dev);
 *   - otherwise Application Default Credentials (Firebase App Hosting injects the
 *     service account, so no file is needed in production).
 */
function db() {
  if (getApps().length === 0) {
    const keyPath = process.env.FIRESTORE_SA_KEY;
    initializeApp({
      credential: keyPath ? cert(keyPath) : applicationDefault(),
    });
  }
  return getFirestore();
}

/**
 * Read one Lesson document at `courses/{course}/lessons/{slug}`. Returns `null`
 * when it does not exist, so the route can answer 404 rather than throw.
 */
export async function readLesson(
  course: string,
  slug: string,
): Promise<LessonRecord | null> {
  const snap = await db()
    .collection("courses")
    .doc(course)
    .collection("lessons")
    .doc(slug)
    .get();

  if (!snap.exists) return null;

  const data = snap.data() as Omit<LessonRecord, "course" | "slug">;
  return { ...data, course, slug };
}

/**
 * The human title of a Course, stored on the `courses/{course}` document (the
 * Lesson document carries only the path id). Used for the back-link label;
 * returns `null` when the Course document is missing or has no title.
 */
export async function readCourseTitle(course: string): Promise<string | null> {
  const snap = await db().collection("courses").doc(course).get();
  if (!snap.exists) return null;
  const title = snap.data()?.title;
  return typeof title === "string" ? title : null;
}
