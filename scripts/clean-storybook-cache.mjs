import { rmSync } from "node:fs";
import { join } from "node:path";

const cacheRoots = [
  join(process.cwd(), "node_modules", ".cache", "storybook"),
  join(process.cwd(), "node_modules", ".cache", "sb-vite-plugin-externals"),
];

for (const cacheRoot of cacheRoots) {
  rmSync(cacheRoot, { recursive: true, force: true });
}
