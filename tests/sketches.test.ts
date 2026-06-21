import { test, expect, beforeAll } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

import CapexOpex from "../src/sketches/CapexOpex.astro";
import ResponsibilitySpectrum from "../src/sketches/ResponsibilitySpectrum.astro";
import RegionAzMap from "../src/sketches/RegionAzMap.astro";
import ScalingArchitecture from "../src/sketches/ScalingArchitecture.astro";
import OsiStack from "../src/sketches/OsiStack.astro";
import AutonomySpectrum from "../src/sketches/AutonomySpectrum.astro";
import PatternFlow from "../src/sketches/PatternFlow.astro";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

// Every Esboço is the escape hatch *on rails* (ADR 0002/0003): a faithful static
// diagram with scoped styles and no script. This helper proves both invariants
// at once for any Esboço — one scope id (no style leak) and no JS.
function assertOnRails(html: string, rootSelector: RegExp): void {
  const cids = new Set(
    [...html.matchAll(/data-astro-cid-([a-z0-9]+)/g)].map((m) => m[1]),
  );
  expect(cids.size).toBe(1);
  expect(html).toMatch(rootSelector);
  expect(html).not.toContain("onclick");
  expect(html).not.toContain("<script");
}

// --- CapexOpex (aws/0001): the CapEx vs OpEx two-column contrast ---

test("CapexOpex renders one card per model with its lead and bullet points", async () => {
  const html = await container.renderToString(CapexOpex, {
    props: {
      models: [
        { tag: "Modelo antigo — CapEx", title: "CapEx", lead: "Compra adiantada.", points: ["Investimento alto", "Adivinha capacidade"] },
        { tag: "Modelo da nuvem — OpEx", title: "OpEx", lead: "Paga conforme usa.", points: ["Zero adiantado", "Sob demanda"], highlight: true },
      ],
    },
  });

  expect((html.match(/data-sketch-card/g) ?? []).length).toBe(2);
  expect(html).toContain("CapEx");
  expect(html).toContain("OpEx");
  expect(html).toContain("Investimento alto");
  expect(html).toContain("Zero adiantado");
  // Exactly the OpEx card is highlighted.
  expect((html.match(/data-highlight="true"/g) ?? []).length).toBe(1);
});

test("CapexOpex ships defaults so the Aula references it bare", async () => {
  const html = await container.renderToString(CapexOpex);
  expect(html).toContain("CapEx");
  expect(html).toContain("OpEx");
  assertOnRails(html, /class="capex"[^>]*data-astro-cid-/);
});

// --- ResponsibilitySpectrum (aws/0002): IaaS/PaaS/SaaS shared-responsibility ---

test("ResponsibilitySpectrum renders a row per model and marks who owns each layer", async () => {
  const html = await container.renderToString(ResponsibilitySpectrum, {
    props: {
      layers: ["Aplicação", "Runtime / SO", "Rede / config", "Servidores físicos", "Data center"],
      rows: [
        { model: "IaaS", sub: "Infra como serviço", owned: 3 },
        { model: "PaaS", sub: "Plataforma como serviço", owned: 1 },
        { model: "SaaS", sub: "Software como serviço", owned: 0 },
      ],
    },
  });

  expect((html.match(/data-spectrum-row/g) ?? []).length).toBe(3);
  expect(html).toContain("IaaS");
  expect(html).toContain("PaaS");
  expect(html).toContain("SaaS");
  // IaaS owns 3 layers, PaaS 1, SaaS 0 → 4 "you"-owned segments total.
  expect((html.match(/data-owner="you"/g) ?? []).length).toBe(4);
  // 3 rows × 5 layers = 15 segments; 15 − 4 = 11 owned by AWS.
  expect((html.match(/data-owner="aws"/g) ?? []).length).toBe(11);
});

test("ResponsibilitySpectrum is a scoped, static Esboço", async () => {
  const html = await container.renderToString(ResponsibilitySpectrum);
  assertOnRails(html, /class="spectrum"[^>]*data-astro-cid-/);
});

// --- RegionAzMap (aws/0003): Region ⊃ AZ ⊃ data centers ---

test("RegionAzMap renders the region and one cell per AZ with its data centers", async () => {
  const html = await container.renderToString(RegionAzMap, {
    props: {
      region: { code: "sa-east-1", label: "São Paulo 🇧🇷" },
      azs: [
        { name: "AZ-a", dcs: 2 },
        { name: "AZ-b", dcs: 1 },
        { name: "AZ-c", dcs: 2 },
      ],
    },
  });

  expect(html).toContain("sa-east-1");
  expect(html).toContain("São Paulo");
  expect((html.match(/data-az/g) ?? []).length).toBe(3);
  expect(html).toContain("AZ-a");
  // 2 + 1 + 2 = 5 data-center chips.
  expect((html.match(/data-dc/g) ?? []).length).toBe(5);
});

test("RegionAzMap is a scoped, static Esboço", async () => {
  const html = await container.renderToString(RegionAzMap);
  assertOnRails(html, /class="geo"[^>]*data-astro-cid-/);
});

// --- ScalingArchitecture (aws/0005): users → ELB → multi-AZ EC2 + ASG ---

test("ScalingArchitecture renders the load balancer and one instance per AZ", async () => {
  const html = await container.renderToString(ScalingArchitecture, {
    props: {
      elbLabel: "Elastic Load Balancing",
      instances: [
        { label: "EC2", az: "AZ-a" },
        { label: "EC2", az: "AZ-b" },
        { label: "EC2", az: "AZ-c" },
      ],
      asgNote: "Auto Scaling adiciona/remove instâncias",
    },
  });

  expect(html).toContain("Elastic Load Balancing");
  expect((html.match(/data-inst/g) ?? []).length).toBe(3);
  expect(html).toContain("AZ-b");
  expect(html).toContain("Auto Scaling adiciona/remove instâncias");
});

test("ScalingArchitecture is a scoped, static Esboço", async () => {
  const html = await container.renderToString(ScalingArchitecture);
  assertOnRails(html, /class="arch"[^>]*data-astro-cid-/);
});

// --- OsiStack (aws/0006): the 7 layers, L4 & L7 highlighted ---

test("OsiStack renders every layer and highlights the load-balancer layers", async () => {
  const html = await container.renderToString(OsiStack);

  // The canonical 7 layers.
  expect((html.match(/data-layer/g) ?? []).length).toBe(7);
  expect(html).toContain("Aplicação");
  expect(html).toContain("Transporte");
  expect(html).toContain("Física");
  // Exactly two layers are "hot" (L7 → ALB, L4 → NLB).
  expect((html.match(/data-hot="true"/g) ?? []).length).toBe(2);
  expect(html).toContain("ALB");
  expect(html).toContain("NLB");
});

test("OsiStack is a scoped, static Esboço", async () => {
  const html = await container.renderToString(OsiStack);
  assertOnRails(html, /class="osi"[^>]*data-astro-cid-/);
});

// --- AutonomySpectrum (claude/0001): single-call → workflow → agent ---

test("AutonomySpectrum renders one column per stop with its controller and body", async () => {
  const html = await container.renderToString(AutonomySpectrum, {
    props: {
      stops: [
        { who: "Você controla", title: "Chamada única", body: "Um prompt, uma resposta." },
        { who: "Código controla", title: "Workflow", body: "Caminho fixo." },
        { who: "O modelo controla", title: "Agente", body: "Decide os próximos passos." },
      ],
      barLabels: ["fixo", "emergente"],
    },
  });

  expect((html.match(/data-stop/g) ?? []).length).toBe(3);
  expect(html).toContain("Chamada única");
  expect(html).toContain("Workflow");
  expect(html).toContain("Agente");
  expect(html).toContain("O modelo controla");
  // The gradient bar conveys the autonomy axis.
  expect(html).toContain("data-bar");
  expect(html).toContain("emergente");
});

test("AutonomySpectrum is a scoped, static Esboço", async () => {
  const html = await container.renderToString(AutonomySpectrum);
  assertOnRails(html, /class="autonomy"[^>]*data-astro-cid-/);
});

// --- PatternFlow (claude/0002): a labeled flow of nodes, with branches ---

test("PatternFlow renders a node per stage entry and carries node variants", async () => {
  const html = await container.renderToString(PatternFlow, {
    props: {
      stages: [
        { nodes: [{ label: "Entrada" }] },
        { nodes: [{ label: "LLM 1" }, { label: "LLM 2" }] },
        { nodes: [{ label: "Agregador", variant: "alt" }] },
      ],
    },
  });

  // 1 + 2 + 1 = 4 nodes across the flow.
  expect((html.match(/data-node/g) ?? []).length).toBe(4);
  expect(html).toContain("Entrada");
  expect(html).toContain("LLM 1");
  expect(html).toContain("Agregador");
  // The accent node keeps its variant marker.
  expect(html).toContain('data-variant="alt"');
});

test("PatternFlow is a scoped, static Esboço", async () => {
  const html = await container.renderToString(PatternFlow, {
    props: { stages: [{ nodes: [{ label: "Entrada" }] }, { nodes: [{ label: "Saída" }] }] },
  });
  assertOnRails(html, /class="flow"[^>]*data-astro-cid-/);
});
