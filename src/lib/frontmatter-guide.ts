import { z } from "zod";

/**
 * Renders the Professor-facing guide to the Lesson Frontmatter as Markdown — the
 * document teach-v3 reads to fill a Lesson's metadata. It is a pure function of
 * the Zod schema (`lessonFrontmatter`), so the guide can never diverge from the
 * validation that gates the build: regenerate it whenever a field or its
 * `.describe()` changes (`npm run gen:frontmatter-guide`).
 *
 * The guide speaks the domain's language (Aula, Curso) and stays free of
 * Platform detail — the Professor fills the Frontmatter by *meaning*, never by
 * reading the schema source.
 *
 * The schema is read through `z.toJSONSchema` with `io: "input"`, so a field with
 * a default (e.g. `prerequisites`) reads as optional — matching what the
 * Professor must actually author.
 */
export function renderFrontmatterGuide(schema: z.ZodObject): string {
  const json = z.toJSONSchema(schema, { io: "input" }) as JsonSchema;
  const required = new Set(json.required ?? []);
  const fields = Object.entries(json.properties ?? {}).map(([name, node]) =>
    renderRow(name, node, required.has(name)),
  );
  return `${HEADER}\n\n${TABLE_HEAD}\n${fields.join("\n")}\n`;
}

const HEADER = `<!-- GERADO de src/lib/frontmatter.ts por \`npm run gen:frontmatter-guide\` — NÃO edite à mão. -->

# Guia do Frontmatter

Toda Aula começa por um bloco de Frontmatter — os metadados que a Plataforma usa
para validar, ordenar e indexar a Aula. Preencha **todos** os campos obrigatórios
conforme a tabela abaixo, escolhendo os valores por *significado*; um Frontmatter
incompleto ou inválido reprova a Aula no build. O Curso não é declarado aqui: ele
vem da pasta em que a Aula vive.`;

const TABLE_HEAD = ["| Campo | Tipo | Obrigatório | Descrição |", "| --- | --- | --- | --- |"].join(
  "\n",
);

interface JsonSchema {
  properties?: Record<string, JsonNode>;
  required?: string[];
}

interface JsonNode {
  type?: string | string[];
  description?: string;
  items?: JsonNode;
  enum?: unknown[];
  anyOf?: JsonNode[];
}

function renderRow(name: string, node: JsonNode, required: boolean): string {
  const type = escapeCell(typeOf(node));
  const description = escapeCell(node.description ?? "");
  return `| \`${name}\` | \`${type}\` | ${required ? "sim" : "não"} | ${description} |`;
}

/** Maps a JSON Schema node to a readable, Professor-facing type string. */
function typeOf(node: JsonNode): string {
  if (node.enum) {
    return node.enum.map((value) => JSON.stringify(value)).join(" | ");
  }
  if (node.anyOf) {
    return node.anyOf.map(typeOf).join(" | ");
  }
  if (node.type === "array") {
    return `${node.items ? typeOf(node.items) : "any"}[]`;
  }
  if (Array.isArray(node.type)) {
    return node.type.join(" | ");
  }
  return node.type ?? "any";
}

/** Escapes pipes so a value never breaks out of its Markdown table cell. */
function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}
