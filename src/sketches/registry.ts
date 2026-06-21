import BucketObjectKey from "./BucketObjectKey.astro";

/**
 * The Esboço registry — the escape hatch's wiring.
 *
 * An Esboço is a one-off Component the Desenvolvedor authors for a single Lesson.
 * It lives in src/sketches/ — *not* the Catalog (src/components/) — and is not
 * advertised in the guide; an Esboço only graduates to a Catalog Component
 * through a deliberate Component Request (ADR 0002/0003). This map binds a Lesson
 * id ("<course>/<slug>") to the Esboços that Lesson may reference by name, so the
 * Lesson route merges them into that Lesson's render alone — never globally. The
 * Professor then writes `<BucketObjectKey />` in the MDX with no import, exactly
 * like a Catalog Component, but the binding is scoped to this Lesson.
 */
export const sketches: Record<string, Record<string, unknown>> = {
  "aws/0007-amazon-s3-object-storage": { BucketObjectKey },
};

/** The Esboços bound to a Lesson, or an empty map when it declares none. */
export function sketchesFor(lessonId: string): Record<string, unknown> {
  return sketches[lessonId] ?? {};
}
