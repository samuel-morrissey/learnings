import { test, expect } from "vitest";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

import { renderFrontmatterGuide } from "../src/lib/frontmatter-guide";
import { lessonFrontmatter } from "../src/lib/frontmatter";

// Seam A: the guide is a pure function of the Zod schema — feed the schema in,
// observe the Professor-facing Markdown out. We assert on what the Professor must
// be able to read for each field (name, type, whether it's required, and the
// `.describe()` prose), not on the exact layout of the document.
const guide = renderFrontmatterGuide(lessonFrontmatter);

// Read every field through the same lens the generator uses (input view, so a
// field with a default reads as optional), giving the test a schema-derived
// source of truth to compare against.
const json = z.toJSONSchema(lessonFrontmatter, { io: "input" }) as {
  properties: Record<string, { description?: string }>;
  required?: string[];
};
const required = new Set(json.required ?? []);
const fields = Object.entries(json.properties);

test("lists every Frontmatter field by name", () => {
  for (const [name] of fields) {
    expect(guide).toContain(`\`${name}\``);
  }
});

test("carries each field's describe() prose", () => {
  for (const [, node] of fields) {
    expect(node.description).toBeTruthy();
    expect(guide).toContain(node.description!);
  }
});

test("renders each field's type", () => {
  // Spot-check the type rendering the Professor relies on, including the array
  // type derived from the JSON Schema `items`.
  expect(guide).toContain("`string`");
  expect(guide).toContain("`integer`");
  expect(guide).toContain("`string[]`");
});

test("marks each field's obligatoriness from the schema", () => {
  // `prerequisites` has a default, so in the input view it is optional; the rest
  // are required. The guide must reflect that distinction.
  expect(required.has("prerequisites")).toBe(false);
  expect(guide).toMatch(/\| `prerequisites` \|[^|]*\| não \|/);
  expect(guide).toMatch(/\| `title` \|[^|]*\| sim \|/);
});

test("escapes union-type pipes so the field table stays valid Markdown", () => {
  // No current field is a union, so exercise the generator with a synthetic
  // schema whose field is an enum: an unescaped pipe inside a table cell would
  // split it into bogus columns; the generator must escape it.
  const withUnion = z.object({
    variant: z.enum(["info", "warn", "ok"]).describe("Um campo de união."),
  });
  const rendered = renderFrontmatterGuide(withUnion);
  expect(rendered).toContain("\\|");
  expect(rendered).not.toMatch(/\| "info" \| "warn"/); // pipes escaped, not raw
});

test("the checked-in guide is up to date with the Frontmatter schema", () => {
  // The guide is generated, never hand-maintained. The committed file must be
  // exactly what the generator produces, so it can never silently diverge.
  const file = fileURLToPath(new URL("../docs/frontmatter-guide.md", import.meta.url));
  const onDisk = fs.readFileSync(file, "utf8");
  // Compare on content, not bytes: git's autocrlf may check the file out with
  // CRLF on Windows while the generator emits LF.
  const normalize = (text: string) => text.replace(/\r\n/g, "\n");
  expect(normalize(onDisk)).toBe(normalize(guide));
});
