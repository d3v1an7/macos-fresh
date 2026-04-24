import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import pc from "picocolors";
import { run } from "./index.js";
import { setDryRun } from "./util/exec.js";

function readPackageVersion() {
  const here = dirname(fileURLToPath(import.meta.url));
  // When bundled, package.json sits alongside dist/fresh.mjs via the Homebrew tarball;
  // when running from source, it's two levels up from src/cli.js.
  for (const rel of ["../package.json", "../../package.json"]) {
    try {
      const pkg = JSON.parse(readFileSync(join(here, rel), "utf8"));
      if (pkg?.version) return pkg.version;
    } catch {}
  }
  return "0.0.0";
}

const program = new Command();

program
  .name("fresh")
  .description("Bootstrap a fresh macOS install from a YAML config")
  .version(readPackageVersion(), "-v, --version")
  .option("-c, --config-url <url>", "URL of a raw YAML config file (typically a Gist)")
  .option("-f, --config <file>", "Path to a local YAML config file")
  .option("-n, --dry-run", "Print actions without executing mutating commands")
  .action(async (opts) => {
    if (!opts.configUrl && !opts.config) {
      program.error("one of --config-url or --config is required");
    }
    if (opts.configUrl && opts.config) {
      program.error("--config-url and --config are mutually exclusive");
    }
    setDryRun(Boolean(opts.dryRun));
    await run({
      configUrl: opts.configUrl,
      configPath: opts.config,
      dryRun: Boolean(opts.dryRun),
    });
  });

try {
  await program.parseAsync(process.argv);
} catch (err) {
  console.error(pc.red(`\n✖ ${err?.message ?? err}`));
  if (process.env.DEBUG) console.error(err);
  process.exit(1);
}
