/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// Astro's Vite config lets Vitest import `.astro` components and resolve
// `astro:content` so the render tests (Seam B) exercise real components.
export default getViteConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
