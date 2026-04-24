import { chmodSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outfile = resolve(root, "dist", "fresh.mjs");

mkdirSync(dirname(outfile), { recursive: true });

await build({
  entryPoints: [resolve(root, "src/cli.js")],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  minify: false,
  sourcemap: false,
  banner: {
    js: [
      "#!/usr/bin/env node",
      // Shim require() for ESM-bundled deps that reach for it.
      "import { createRequire as __createRequire } from 'node:module';",
      "const require = __createRequire(import.meta.url);",
    ].join("\n"),
  },
});

chmodSync(outfile, 0o755);
console.log(`✓ built ${outfile}`);
