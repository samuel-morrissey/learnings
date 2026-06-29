/**
 * Seed one Lesson into Firestore — the hand-authored document the tracer-bullet
 * route (`/live/<course>/<lesson>`) reads (issue #22). Run once, against your
 * own Firebase project, with the **read/write** service account:
 *
 *   FIRESTORE_ADMIN_KEY=./secrets/admin-sa.json node scripts/seed-firestore.mts
 *
 * It writes `courses/{course}` and `courses/{course}/lessons/{slug}` with the
 * Frontmatter as fields, the body as `mdx` text, and the Esboço binding as
 * `esbocos[]` (ADR 0005). This is throwaway scaffolding for the tracer bullet;
 * the real migration of every `.mdx` is a later slice of the parent PRD (#21).
 */
import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const COURSE = "demo";
const SLUG = "0001-bala-tracadora";

const LESSON = {
  title: "Bala traçadora: esta Aula vem do Firestore",
  order: 1,
  domain: "Plataforma",
  summary:
    "Você está lendo um documento do banco, compilado em runtime e renderizado por SSR — sem arquivo, sem build, sem deploy.",
  prerequisites: [] as string[],
  estMinutes: 3,
  esbocos: [] as string[],
  mdx: [
    "Esta Aula **não existe como arquivo**. O texto que você lê é o campo `mdx`",
    "de um documento no Firestore, compilado em runtime pelo `@mdx-js/mdx` e",
    "renderizado pelo servidor a cada requisição.",
    "",
    '<Callout variant="ok">',
    "  Se este aviso aparece com a cor e o ícone certos, o circuito fechou: o",
    "  Componente **Callout** foi mapeado por nome, do banco até o HTML.",
    "</Callout>",
    "",
    "## O que esta fatia prova",
    "",
    "- Astro em SSR (`output: 'server'`) com o adapter Node.",
    "- A leitura do Firestore isolada num adapter fino.",
    "- O render compilando o MDX do banco e mapeando nome → Componente Preact.",
    "",
    '<Callout variant="warn">',
    "  Ainda é só o caminho feliz: sem validação, sem fallback por bloco e sem",
    "  listagens. Essas camadas chegam nas próximas fatias da PRD.",
    "</Callout>",
  ].join("\n"),
};

// Intentionally NOT shared with src/lib/firestore.ts: that adapter is the
// public read-only SSR surface and reads FIRESTORE_SA_KEY (viewer role); this
// seed needs write access and reads FIRESTORE_ADMIN_KEY (user role). Merging the
// two into one helper would risk handing the read-only path a writer credential
// — the exact role split ADR 0006 exists to keep. Keep them separate.
function db() {
  if (getApps().length === 0) {
    const keyPath = process.env.FIRESTORE_ADMIN_KEY;
    initializeApp({
      credential: keyPath ? cert(keyPath) : applicationDefault(),
    });
  }
  return getFirestore();
}

async function main() {
  const firestore = db();
  const courseRef = firestore.collection("courses").doc(COURSE);

  await courseRef.set(
    { name: COURSE, title: "Demo", order: 0 },
    { merge: true },
  );
  await courseRef.collection("lessons").doc(SLUG).set(LESSON);

  console.log(`Seeded courses/${COURSE}/lessons/${SLUG}`);
  console.log(`Visit: /live/${COURSE}/${SLUG}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
