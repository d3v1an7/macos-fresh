import { execa } from "execa";
import pc from "picocolors";

let dryRun = false;

export function setDryRun(value) {
  dryRun = Boolean(value);
}

export function isDryRun() {
  return dryRun;
}

// Run a mutating command. Honors dry-run (prints intent, returns a success-shaped result).
export async function run(cmd, args = [], opts = {}) {
  if (dryRun) {
    console.log(pc.dim(`  [dry-run] ${cmd} ${args.join(" ")}`));
    return { exitCode: 0, stdout: "", stderr: "", failed: false };
  }
  return execa(cmd, args, { reject: false, ...opts });
}

// Run a read-only command. Never dry-runs (no side effects).
export async function capture(cmd, args = [], opts = {}) {
  return execa(cmd, args, { reject: false, ...opts });
}
