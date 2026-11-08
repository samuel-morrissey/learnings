import type { DocumentData } from "firebase-admin/firestore";

import { lessonFrontmatter, type LessonFrontmatter } from "./frontmatter.ts";
import { compare } from "./site-model.ts";

/**
 * The Firestore exporter (issue #48) — the read side of the migration to the
 * Life OS (life-os#184): every Course and every Aula, as they live in Firestore
 * (`courses/{id}` and `courses/{id}/lessons/{slug}`, ADR 0005), into the JSON
 * the Life OS importer (`scripts/import-aprendizado.mts` there) consumes. The
 * Firestore holds Aulas the git snapshot does not, so the migration starts here.
 *
 * It only reads, and it does not validate: the importer runs `validateAula` and
 * reports what it skips. Fields absent from a document stay absent from the JSON
 * — nothing is invented — with one exception the contract fixes: a missing
 * `esbocos` means no Esboço, so it comes out as `[]`.
 *
 * Kept as a function over the slice of the Admin SDK it touches (`ExportSource`)
 * so the contract is testable against a simulated Firestore; the script
 * `scripts/export-firestore.mts` is the thin adapter that hands it the real one.
 */

/** The contract the Life OS importer parses. */
export interface FirestoreExport {
  /** When the export ran, ISO 8601. */
  exported_at: string;
  /** Every Course, in site order (by id), each with its Aulas by `order`. */
  courses: ExportedCourse[];
}

export interface ExportedCourse {
  id: string;
  /** The `title` field, or the id when the Course has no document or no title. */
  title: string;
  /** The `description` field, or `null` when there is none. */
  description: string | null;
  lessons: ExportedLesson[];
}

/** An Aula: the Frontmatter fields the document has, the body, the Esboços and its dates. */
export interface ExportedLesson extends Partial<LessonFrontmatter> {
  slug: string;
  mdx?: string;
  esbocos: string[];
  /** ISO 8601; absent when Firestore has no creation date for the document. */
  createdAt?: string;
  /** ISO 8601; absent when Firestore has no update date for the document. */
  updatedAt?: string;
}

interface TimestampLike {
  toDate(): Date;
}

/** A document snapshot, as far as the exporter reads it. */
export interface ExportDoc {
  id: string;
  // doc ref → its collection → the owning doc (or `null` at the root) → its collection.
  ref: { parent: { parent: { id: string; parent: { id: string } } | null } };
  data(): DocumentData | undefined;
  createTime?: TimestampLike;
  updateTime?: TimestampLike;
}

interface ExportQuery {
  get(): Promise<{ docs: ExportDoc[] }>;
}

/** The read-only slice of the Admin SDK `Firestore` the exporter uses. */
export interface ExportSource {
  collection(path: string): ExportQuery;
  collectionGroup(collectionId: string): ExportQuery;
}

// The Lesson fields copied as they are: the Frontmatter (derived from the single
// schema, like the MCP store, so it can never drift) and the `mdx` body.
const LESSON_FIELDS = [...Object.keys(lessonFrontmatter.shape), "mdx"];

// The Course's human title, or `null` when absent/blank — the rule the SSR and
// MCP adapters share, so the exported title matches what the site shows.
function titleField(data: DocumentData | undefined): string | null {
  const title = data?.title;
  return typeof title === "string" && title.trim() !== "" ? title : null;
}

function descriptionField(data: DocumentData | undefined): string | null {
  const description = data?.description;
  return typeof description === "string" && description.trim() !== "" ? description : null;
}

// A date as ISO 8601: a Firestore Timestamp (or anything with `toDate`), a
// `Date`, or a string already in that form. Anything else is no date at all.
function isoDate(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && typeof (value as TimestampLike).toDate === "function") {
    return (value as TimestampLike).toDate().toISOString();
  }
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) return new Date(value).toISOString();
  return undefined;
}

function toExportedLesson(doc: ExportDoc): ExportedLesson {
  const data = doc.data() ?? {};
  const lesson: Record<string, unknown> = { slug: doc.id };
  for (const field of LESSON_FIELDS) {
    if (data[field] !== undefined) lesson[field] = data[field];
  }
  lesson.esbocos = Array.isArray(data.esbocos) ? data.esbocos : [];

  // A `createdAt`/`updatedAt` field on the document wins; otherwise the
  // document's own metadata, which Firestore keeps for every write.
  const createdAt = isoDate(data.createdAt) ?? isoDate(doc.createTime);
  const updatedAt = isoDate(data.updatedAt) ?? isoDate(doc.updateTime);
  if (createdAt) lesson.createdAt = createdAt;
  if (updatedAt) lesson.updatedAt = updatedAt;
  return lesson as unknown as ExportedLesson;
}

// Lessons by `order`, slug as the stable tiebreak — the hub's rule
// (`buildSiteModel`). A Lesson without a numeric `order` goes last.
function byOrder(a: ExportedLesson, b: ExportedLesson): number {
  const order = (l: ExportedLesson) => (typeof l.order === "number" ? l.order : Number.MAX_SAFE_INTEGER);
  return order(a) - order(b) || compare(a.slug, b.slug);
}

/**
 * Read every Course and every Aula from `firestore` into the export contract.
 * Two reads, no writes: the `courses` collection and the `lessons` collection
 * group. A Course that exists only as the parent of its Lessons (no document of
 * its own) is still exported, titled by its id; a Course with no Lessons is kept
 * too, so the importer sees every Course there is.
 */
export async function exportFirestore(
  firestore: ExportSource,
  now: Date = new Date(),
): Promise<FirestoreExport> {
  const [courseSnap, lessonSnap] = await Promise.all([
    firestore.collection("courses").get(),
    firestore.collectionGroup("lessons").get(),
  ]);

  const courses = new Map<string, ExportedCourse>();
  const course = (id: string, data?: DocumentData) => {
    let entry = courses.get(id);
    if (!entry) {
      entry = { id, title: titleField(data) ?? id, description: descriptionField(data), lessons: [] };
      courses.set(id, entry);
    }
    return entry;
  };

  for (const doc of courseSnap.docs) course(doc.id, doc.data());

  for (const doc of lessonSnap.docs) {
    // A `lessons` doc lives at courses/{course}/lessons/{slug}. A collection-group
    // query matches *any* `lessons` collection, so skip a stray top-level one and
    // one nested under another collection.
    const courseDoc = doc.ref.parent.parent;
    if (!courseDoc || courseDoc.parent.id !== "courses") continue;
    course(courseDoc.id).lessons.push(toExportedLesson(doc));
  }

  const ordered = [...courses.values()].sort((a, b) => compare(a.id, b.id));
  for (const entry of ordered) entry.lessons.sort(byOrder);

  return { exported_at: now.toISOString(), courses: ordered };
}

/** The lines the script prints at the end: the totals, then the count per Course. */
export function exportSummary(exported: FirestoreExport): string[] {
  const total = exported.courses.reduce((sum, c) => sum + c.lessons.length, 0);
  return [
    `Exported ${exported.courses.length} course(s) and ${total} lesson(s) from Firestore.`,
    ...exported.courses.map((c) => `  - courses/${c.id} — "${c.title}" (${c.lessons.length} aula(s))`),
  ];
}
