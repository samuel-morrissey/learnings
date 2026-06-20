// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// Static, build-time output: the Platform renders the Lessons once and ships
// plain files, preserving the lightweight, offline-friendly PWA. The cutover
// to CI/deploy is a later slice — this tracer is verified with `astro build`.
export default defineConfig({
  output: "static",
  integrations: [mdx()],
});
