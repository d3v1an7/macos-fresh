import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import pc from "picocolors";
import { capture, isDryRun, run } from "./util/exec.js";

// Install per-user so no sudo is needed. Fonts here are visible to the user
// in every app. Use /Library/Fonts only for multi-user Macs.
const FONT_DIR = join(homedir(), "Library", "Fonts");

async function isFontInstalled(fontName) {
  const { stdout } = await capture("sh", [
    "-c",
    "system_profiler SPFontsDataType | grep 'Full Name: ' | awk -F': ' '{print $2}'",
  ]);
  return stdout.includes(fontName);
}

export async function installFont(spinner, fontEntry) {
  for (const [fontName, fontUrl] of Object.entries(fontEntry)) {
    spinner.start(fontName);

    if (await isFontInstalled(fontName)) {
      spinner.succeed(`${fontName} (already installed)`);
      continue;
    }

    if (isDryRun()) {
      console.log(pc.dim(`  [dry-run] download ${fontUrl}`));
      console.log(pc.dim(`  [dry-run] extract to ${FONT_DIR}`));
      spinner.succeed(fontName);
      continue;
    }

    mkdirSync(FONT_DIR, { recursive: true });
    const scratch = mkdtempSync(join(tmpdir(), "macos-fresh-font-"));
    const zipPath = join(scratch, "font.zip");

    try {
      const res = await fetch(fontUrl);
      if (!res.ok) {
        spinner.fail(`${fontName} (HTTP ${res.status})`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(zipPath, buf);

      // Use system `unzip` — AdmZip tripped on Nerd Fonts archives (chmod on
      // entries whose file extraction was skipped). `unzip -o -q` is the
      // battle-tested path that macOS uses for the same archives elsewhere.
      const result = await run("unzip", ["-o", "-q", zipPath, "-d", FONT_DIR]);
      if (result.exitCode !== 0) {
        spinner.fail(`${fontName} (unzip exit ${result.exitCode})`);
        if (result.stderr) console.error(result.stderr.trim());
        continue;
      }

      spinner.succeed(fontName);
    } catch (err) {
      spinner.fail(fontName);
      console.error(err?.message ?? err);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  }
}
