/**
 * The migration export (issue #48): read every Course and every Aula from the
 * Firestore and write them to a JSON file — the input of the Life OS importer
 * (`scripts/import-aprendizado.mts` there, life-os#184). Run it with the
 * **read/write** account the MCP server and the seed already use:
 *
 *   FIRESTORE_ADMIN_KEY=./secrets/admin-sa.json npx tsx scripts/export-firestore.mts --out export.json
 *
 * Without `FIRESTORE_ADMIN_KEY` it falls back to the Application Default
 * Credentials (`GOOGLE_APPLICATION_CREDENTIALS` or `gcloud auth
 * application-default login`). It only reads: two queries (`courses` and the
 * `lessons` collection group), no write to Firestore. The only file it writes is
 * `--out`, and only after the export succeeded; it ends printing the count of
 * Aulas per Course.
 *
 * The transform lives in the pure, tested `exportFirestore` (Seam); this file is
 * the thin adapter that hands it the real Firestore — the same split as the
 * seed's `readSeedRecords`.
 */
import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { exportFirestore, exportSummary } from "../src/lib/firestore-export.ts";

const USAGE = "Usage: npx tsx scripts/export-firestore.mts --out <file.json>";

// The same credential rule as the seed and the MCP store (`FIRESTORE_ADMIN_KEY`
// or ADC), not the SSR adapter's read-only `FIRESTORE_SA_KEY` — the account the
// migration names. This script never writes to Firestore with it.
function db() {
  if (getApps().length === 0) {
    const keyPath = process.env.FIRESTORE_ADMIN_KEY;
    initializeApp({
      credential: keyPath ? cert(keyPath) : applicationDefault(),
    });
  }
  return getFirestore();
}

function parseOut(argv: string[]): string {
  const index = argv.indexOf("--out");
  const out = index === -1 ? undefined : argv[index + 1];
  if (!out || out.startsWith("--")) {
    console.error(USAGE);
    process.exit(2);
  }
  return out;
}

async function main() {
  const out = path.resolve(parseOut(process.argv.slice(2)));
  const exported = await exportFirestore(db());

  fs.writeFileSync(out, `${JSON.stringify(exported, null, 2)}\n`);
  console.log(`Wrote ${out}`);
  for (const line of exportSummary(exported)) console.log(line);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
