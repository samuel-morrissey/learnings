import { test, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

import BaseLayout from "../src/layouts/BaseLayout.astro";

// The cutover retires scripts/build.js, which used to emit the PWA wiring and
// the manifest. The Platform must keep the app installable and offline-friendly,
// so the shared shell now carries the manifest link, the iOS web-app meta tags
// and the touch icon — on every page, since BaseLayout wraps hub, Course and
// Lesson alike.

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

test("BaseLayout links the PWA manifest so the app is installable", async () => {
  const html = await container.renderToString(BaseLayout, {
    props: { title: "Learnings" },
    slots: { default: "<p>corpo</p>" },
  });

  expect(html).toMatch(/<link[^>]+rel="manifest"[^>]+href="[^"]*manifest\.webmanifest"/);
});

test("BaseLayout carries the iOS web-app meta and the touch icon", async () => {
  const html = await container.renderToString(BaseLayout, {
    props: { title: "Learnings" },
    slots: { default: "<p>corpo</p>" },
  });

  expect(html).toContain('name="apple-mobile-web-app-capable"');
  expect(html).toContain('name="apple-mobile-web-app-status-bar-style"');
  expect(html).toMatch(/name="apple-mobile-web-app-title"[^>]+content="Learnings"/);
  expect(html).toMatch(/<link[^>]+rel="apple-touch-icon"[^>]+href="[^"]*apple-touch-icon\.png"/);
  // The theme color the install uses for the status bar / splash.
  expect(html).toMatch(/name="theme-color"[^>]+content="#10202e"/);
});

test("the served manifest is valid and names the rasterized icons", () => {
  const manifestPath = path.resolve(process.cwd(), "public/manifest.webmanifest");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  expect(manifest.name).toBe("Learnings");
  expect(manifest.display).toBe("standalone");
  // Relative start_url/scope keep the app working under the Pages subpath.
  expect(manifest.start_url).toBe(".");
  expect(manifest.scope).toBe(".");

  const sources = (manifest.icons ?? []).map((i: { src: string }) => i.src);
  expect(sources).toContain("icon-192.png");
  expect(sources).toContain("icon-512.png");
});
