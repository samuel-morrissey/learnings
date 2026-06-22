// Generates the Professor-facing Frontmatter guide from the single source of
// truth (src/lib/frontmatter.ts). Run `npm run gen:frontmatter-guide` after
// changing a field or its `.describe()`; pass `--check` to fail (CI) when the
// committed guide is stale.
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { renderFrontmatterGuide } from "../src/lib/frontmatter-guide.ts";
import { lessonFrontmatter } from "../src/lib/frontmatter.ts";

const OUTPUT = fileURLToPath(new URL("../docs/frontmatter-guide.md", import.meta.url));
const guide = renderFrontmatterGuide(lessonFrontmatter);
const check = process.argv.includes("--check");

// Compare on content, not bytes, so a CRLF checkout (git autocrlf on Windows)
// doesn't read as stale.
const normalize = (text: string) => text.replace(/\r\n/g, "\n");

if (check) {
  const onDisk = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf8") : "";
  if (normalize(onDisk) !== normalize(guide)) {
    console.error(
      "docs/frontmatter-guide.md is out of date with the Frontmatter schema. Run `npm run gen:frontmatter-guide`.",
    );
    process.exit(1);
  }
  console.log("docs/frontmatter-guide.md is up to date.");
} else {
  fs.writeFileSync(OUTPUT, guide);
  const fields = Object.keys(lessonFrontmatter.shape).length;
  console.log(`Wrote docs/frontmatter-guide.md (${fields} fields).`);
}
