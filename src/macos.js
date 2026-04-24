import { homedir } from "node:os";
import { basename } from "node:path";
import { createInterface } from "node:readline/promises";
import pc from "picocolors";
import plist from "simple-plist";
import { privileged } from "./privileges.js";
import { capture, isDryRun, run } from "./util/exec.js";

export async function getHardwareUuid() {
  const { stdout } = await capture("system_profiler", ["SPHardwareDataType"]);
  const match = stdout.match(/Hardware UUID:\s*(\S+)/);
  return match ? match[1] : "";
}

function expandPath(rawPath, hardwareUuid) {
  let p = rawPath;
  if (hardwareUuid) p = p.replace("UUID", hardwareUuid);
  if (p.startsWith("~")) p = p.replace(/^~/, homedir());
  return p;
}

// Derive the defaults domain + byHost flag from a plist file path.
//   ~/Library/Preferences/com.apple.finder.plist                       → com.apple.finder, byHost=false
//   ~/Library/Preferences/ByHost/com.apple.Spotlight.<UUID>.plist      → com.apple.Spotlight, byHost=true
function parsePlistPath(plistPath) {
  const byHost = plistPath.includes("/ByHost/");
  const name = basename(plistPath).replace(/\.plist$/, "");
  const domain = byHost ? name.replace(/\.[A-F0-9-]{8,}$/i, "") : name;
  return { domain, byHost };
}

async function readDomain(domain, byHost) {
  const args = byHost ? ["-currentHost", "export", domain, "-"] : ["export", domain, "-"];
  const { stdout, exitCode } = await capture("defaults", args);
  if (exitCode !== 0 || !stdout?.trim()) return {};
  try {
    return plist.parse(stdout) ?? {};
  } catch {
    return {};
  }
}

// Write a single key via `defaults`, type-dispatching so defaults stores the right
// type. Complex values are handed off as XML plist, which `defaults write` parses.
async function writeKey(domain, byHost, key, value) {
  const pre = byHost ? ["-currentHost", "write", domain, key] : ["write", domain, key];
  let args;
  if (typeof value === "boolean") {
    args = [...pre, "-bool", value ? "TRUE" : "FALSE"];
  } else if (Number.isInteger(value)) {
    args = [...pre, "-int", String(value)];
  } else if (typeof value === "number") {
    args = [...pre, "-float", String(value)];
  } else if (typeof value === "string") {
    args = [...pre, "-string", value];
  } else {
    args = [...pre, plist.stringify(value)];
  }
  return run("defaults", args);
}

function renderValue(v) {
  if (v === undefined || v === null) return "None";
  if (typeof v === "object") {
    const j = JSON.stringify(v);
    return j.length > 80 ? `${j.slice(0, 77)}...` : j;
  }
  return String(v);
}

function renderChange(key, oldValue, newValue, action) {
  return `${action} value for ${key}: ${renderValue(oldValue)} ${pc.gray("->")} ${renderValue(newValue)}`;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

function isPlainDict(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

// Deep-merge incoming over base. Returns a new value; never mutates inputs.
// Dict ∩ dict recurses; everything else (arrays, scalars, type mismatch) is
// replaced by incoming. `defaults write <domain> <key> <dict>` clobbers the
// whole root, so we merge first to preserve sibling keys we don't manage.
function deepMerge(base, incoming) {
  if (!isPlainDict(base) || !isPlainDict(incoming)) return structuredClone(incoming);
  const out = structuredClone(base);
  for (const [k, v] of Object.entries(incoming)) {
    out[k] = isPlainDict(v) && isPlainDict(out[k]) ? deepMerge(out[k], v) : structuredClone(v);
  }
  return out;
}

// Update a single plist: per-key diff, write changed keys via `defaults`.
// Using `defaults` (vs direct file writes) routes through cfprefsd, which is
// required for ACL-protected domains like com.apple.universalaccess.
export async function updatePlist(setting, spinner, hardwareUuid) {
  const plistPath = expandPath(setting.path, hardwareUuid);
  const { domain, byHost } = parsePlistPath(plistPath);
  const action = `Updating: ${plistPath}`;
  spinner.start(action);

  const current = await readDomain(domain, byHost);
  const results = [];

  for (const [key, value] of Object.entries(setting.values)) {
    // Dict values deep-merge with the current value: `defaults write <domain>
    // <key> <dict>` clobbers the whole root, so without this we'd wipe sibling
    // keys Finder/Dock manage themselves. Arrays and scalars replace.
    const desired = isPlainDict(value) ? deepMerge(current[key] ?? {}, value) : value;

    if (key in current && deepEqual(current[key], desired)) {
      results.push(renderChange(key, current[key], desired, "Skipped"));
      continue;
    }
    const hadKey = key in current;
    if (isDryRun()) {
      results.push(renderChange(key, hadKey ? current[key] : null, desired, "Would set"));
      continue;
    }
    const result = await writeKey(domain, byHost, key, desired);
    if (result?.exitCode && result.exitCode !== 0) {
      const detail = result.stderr?.trim() || `exit ${result.exitCode}`;
      results.push(pc.yellow(`⚠ Failed to set ${key}: ${detail}`));
      continue;
    }
    results.push(
      renderChange(key, hadKey ? current[key] : null, desired, hadKey ? "Changed" : "Added"),
    );
  }

  spinner.succeed(action);
  for (const r of results) console.log(`  - ${r}`);
}

function sanitizeSystemName(input) {
  const safe = input.replace(/[^a-zA-Z0-9-]/g, "");
  return safe.length > 63 ? safe.slice(0, 63) : safe;
}

export async function setSystemName(spinner) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Enter system name: ");
  rl.close();

  const name = sanitizeSystemName(answer);
  if (!name) {
    spinner.fail("No valid system name provided");
    return;
  }

  await privileged(async () => {
    spinner.start(name);
    const result = await run("sudo", ["scutil", "--set", "ComputerName", name]);
    if (result.exitCode === 0) {
      spinner.succeed(name);
    } else {
      spinner.fail(name);
      console.error(`Failed to update system name. Exit code: ${result.exitCode}`);
      if (result.stderr) console.error(result.stderr);
    }
  });
}

const POWER_FLAGS = {
  power_settings_all: "-a",
  power_settings_battery: "-b",
  power_settings_charger: "-c",
};

export async function adjustPowerSettings(settingName, setting, spinner) {
  const flag = POWER_FLAGS[settingName];
  if (!flag) {
    spinner.fail(`Unknown power setting: ${settingName}`);
    return;
  }

  await privileged(async () => {
    spinner.start(settingName);
    const results = [];
    for (const [key, value] of Object.entries(setting.values)) {
      await run("sudo", ["pmset", flag, key, String(value)]);
      results.push(`${settingName} value for ${key}: ${value}`);
    }
    spinner.succeed(settingName);
    for (const r of results) console.log(`  - ${r}`);
  });
}

export async function updateAppSettings(appName, appConfig, hardwareUuid, spinner) {
  console.log(`Settings for ${appName}`);
  for (const setting of appConfig.settings ?? []) {
    await updatePlist(setting, spinner, hardwareUuid);
  }
  if (appName === "brave" && appConfig.set_as_default) {
    spinner.start("Setting Brave as the default browser");
    await run("open", ["--new", "-a", "Brave Browser", "--args", "--make-default-browser"]);
    spinner.succeed("Setting Brave as the default browser");
  }
}

export const _internal = { sanitizeSystemName, expandPath, renderChange, parsePlistPath };
