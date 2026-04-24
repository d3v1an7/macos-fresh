import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import AdmZip from "adm-zip";
import pc from "picocolors";
import { capture, isDryRun } from "./util/exec.js";

const FONT_DIR = "/Library/Fonts";

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

      const zip = new AdmZip(zipPath);
      zip.extractAllTo(FONT_DIR, /* overwrite */ true);

      spinner.succeed(fontName);
    } catch (err) {
      spinner.fail(fontName);
      console.error(err?.message ?? err);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  }
}
