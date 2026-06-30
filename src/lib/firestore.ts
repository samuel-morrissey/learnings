import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, type DocumentData } from "firebase-admin/firestore";

import type { LessonFrontmatter } from "./frontmatter";
import {
  buildSiteModel,
  type Course,
  type CourseRecord,
  type Lesson,
  type SiteModel,
} from "./site-model";

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
  return titleField(snap.data());
}

// The Course's human title, or `null` when the `title` field is absent, not a
// string, or blank — the single rule both the back-link reader and the listing
// adapter share, so a blank title can never render as an empty heading.
function titleField(data: DocumentData | undefined): string | null {
  const title = data?.title;
  return typeof title === "string" && title.trim() !== "" ? title : null;
}

// The listing Frontmatter fields a Lesson document carries — everything except
// the heavy `mdx` body and the `esbocos` binding, which the listings never
// show. Projecting them keeps the hub/Course queries small even as Lessons grow.
const LESSON_LIST_FIELDS = [
  "title",
  "order",
  "domain",
  "summary",
  "prerequisites",
  "estMinutes",
] as const;

function toLesson(course: string, slug: string, data: DocumentData): Lesson {
  return {
    title: data.title,
    order: data.order,
    domain: data.domain,
    summary: data.summary,
    prerequisites: data.prerequisites ?? [],
    estMinutes: data.estMinutes,
    course,
    slug,
  };
}

function courseTitle(data: DocumentData | undefined, fallback: string): string {
  return titleField(data) ?? fallback;
}

/**
 * The hub model: every Course (with at least one Lesson) and its ordered
 * Lessons, read from Firestore (issue #25). One Course query plus a single
 * `lessons` collection-group query (projected, no `mdx`) feed the pure
 * `buildSiteModel` — the read stays a thin adapter outside the seam.
 */
export async function readSiteModel(): Promise<SiteModel> {
  const firestore = db();
  const [courseSnap, lessonSnap] = await Promise.all([
    firestore.collection("courses").get(),
    firestore.collectionGroup("lessons").select(...LESSON_LIST_FIELDS).get(),
  ]);

  const courses: CourseRecord[] = courseSnap.docs.map((doc) => ({
    name: doc.id,
    title: courseTitle(doc.data(), doc.id),
  }));

  const lessons: Lesson[] = lessonSnap.docs.flatMap((doc) => {
    // A `lessons` doc lives at courses/{course}/lessons/{slug}; its grandparent
    // ref is the Course document, whose id is the Course name. A collection-group
    // query matches *any* `lessons` collection, so skip a stray top-level one
    // (grandparent `null`) rather than crash the whole hub on it.
    const courseDoc = doc.ref.parent.parent;
    return courseDoc ? [toLesson(courseDoc.id, doc.id, doc.data())] : [];
  });

  return buildSiteModel(courses, lessons);
}

/**
 * One Course with its ordered Lessons, or `null` when the Course document does
 * not exist (so the route can answer 404). Reuses `buildSiteModel` over
 * single-Course records, so ordering and the no-Lessons exclusion match the hub.
 */
export async function readCourse(course: string): Promise<Course | null> {
  const courseRef = db().collection("courses").doc(course);
  const [courseSnap, lessonSnap] = await Promise.all([
    courseRef.get(),
    courseRef.collection("lessons").select(...LESSON_LIST_FIELDS).get(),
  ]);

  if (!courseSnap.exists) return null;

  const record: CourseRecord = { name: course, title: courseTitle(courseSnap.data(), course) };
  const lessons = lessonSnap.docs.map((doc) => toLesson(course, doc.id, doc.data()));

  return buildSiteModel([record], lessons).courses[0] ?? null;
}
