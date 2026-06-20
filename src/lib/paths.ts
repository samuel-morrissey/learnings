import path from "node:path";

// Absolute path to the repo's `courses/` directory. Astro runs the build from
// the project root, so resolve against the working directory — robust even when
// getStaticPaths runs from a bundled chunk (where import.meta.url points into dist/).
export const COURSES_DIR = path.resolve(process.cwd(), "courses");
