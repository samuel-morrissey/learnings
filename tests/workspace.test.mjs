// O learnings é o workspace do Professor: as Aulas vivem no Life OS, e daqui
// só saem a skill, os formatos e o scratch. Estes testes guardam esse papel
// (samuel-morrissey/life-os#184, ADR 0007), sem dependência além do Node.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const tracked = () => execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);

test("a Plataforma saiu: sem src/, Astro, Firebase nem o deploy do GitHub Pages", () => {
  for (const path of ["src", "astro.config.mjs", "firebase.json", "apphosting.yaml", ".github/workflows/deploy.yml"]) {
    assert.equal(existsSync(join(root, path)), false, `${path} ainda existe`);
  }
  const pkg = JSON.parse(read("package.json"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const name of ["astro", "preact", "firebase-admin", "@mdx-js/mdx"]) {
    assert.equal(name in deps, false, `package.json ainda lista ${name}`);
  }
});

test("as Aulas de semente saíram e o scratch dos Cursos ficou", () => {
  assert.deepEqual(tracked().filter((path) => /^courses\/[^/]+\/lessons\//.test(path)), []);
  for (const course of ["aws", "claude", "exemplo"]) {
    assert.ok(existsSync(join(root, "courses", course, "MISSION.md")), `courses/${course}/MISSION.md sumiu`);
  }
});

test("a skill /professor usa as ferramentas do MCP do Life OS", () => {
  const skill = read(".claude/skills/professor/SKILL.md");
  for (const tool of ["guide", "list_courses", "get_lesson", "write_lesson", "archive_lesson", "get_catalog"]) {
    assert.match(skill, new RegExp(`\\b${tool}\\b`), `a skill não cita ${tool}`);
  }
  for (const gone of ["read_aula", "write_aula", "delete_aula", "docs/catalog-guide.md"]) {
    assert.equal(skill.includes(gone), false, `a skill ainda cita ${gone}`);
  }
  assert.equal(existsSync(join(root, ".claude/skills/professor-developer")), false, "a /professor-developer ainda está aqui");
});

test(".mcp.json aponta para o /api/mcp do Life OS com o token de uma variável de ambiente", () => {
  const servers = Object.values(JSON.parse(read(".mcp.json")).mcpServers);
  assert.equal(servers.length, 1);
  const [server] = servers;
  assert.equal(server.type, "http");
  assert.match(server.url, /\/api\/mcp\b/);
  assert.equal(server.headers.Authorization, "Bearer ${LIFE_OS_MCP_TOKEN}");
  // O prefixo do token vem partido para que este arquivo não seja, ele mesmo, um achado.
  const prefix = ["los", "_"].join("");
  assert.deepEqual(tracked().filter((path) => existsSync(join(root, path)) && read(path).includes(prefix)), []);
});

test("README, CLAUDE.md e a ADR 0007 descrevem o workspace e apontam para life-os#184", () => {
  const adr = readdirSync(join(root, "docs/adr")).filter((name) => name.startsWith("0007-"));
  assert.equal(adr.length, 1, "falta docs/adr/0007-*.md");
  for (const path of ["README.md", "CLAUDE.md", `docs/adr/${adr[0]}`]) {
    const text = read(path);
    assert.match(text, /workspace do Professor/i, `${path} não descreve o workspace do Professor`);
    assert.match(text, /samuel-morrissey\/life-os(#|\/issues\/)184/, `${path} não aponta para samuel-morrissey/life-os#184`);
  }
});
