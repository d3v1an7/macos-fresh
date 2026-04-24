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

// Walk a nested path inside obj; returns undefined if any segment is missing.
function getNested(obj, path) {
  let cur = obj;
  for (const seg of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[seg];
  }
  return cur;
}

// Assign `value` at `path` inside obj, creating intermediate dicts as needed.
// If an intermediate exists but isn't a plain dict, it's replaced.
function setNested(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    const next = cur[seg];
    if (next == null || typeof next !== "object" || Array.isArray(next)) {
      cur[seg] = {};
    }
    cur = cur[seg];
  }
  cur[path[path.length - 1]] = value;
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

  // Partition keys: flat keys write directly, dotted keys are paths into a nested
  // dict at the root segment and are batched per-root so we merge into the live
  // value instead of clobbering sibling keys we don't manage.
  const flatEntries = [];
  const dottedGroups = new Map();
  for (const [key, value] of Object.entries(setting.values)) {
    if (!key.includes(".")) {
      flatEntries.push({ key, value });
      continue;
    }
    const path = key.split(".");
    const root = path[0];
    if (!dottedGroups.has(root)) dottedGroups.set(root, []);
    dottedGroups.get(root).push({ key, path, value });
  }

  for (const { key, value } of flatEntries) {
    if (key in current && deepEqual(current[key], value)) {
      results.push(renderChange(key, current[key], value, "Skipped"));
      continue;
    }
    const hadKey = key in current;
    if (isDryRun()) {
      results.push(renderChange(key, hadKey ? current[key] : null, value, "Would set"));
      continue;
    }
    const result = await writeKey(domain, byHost, key, value);
    if (result?.exitCode && result.exitCode !== 0) {
      const detail = result.stderr?.trim() || `exit ${result.exitCode}`;
      results.push(pc.yellow(`⚠ Failed to set ${key}: ${detail}`));
      continue;
    }
    results.push(
      renderChange(key, hadKey ? current[key] : null, value, hadKey ? "Changed" : "Added"),
    );
  }

  for (const [root, entries] of dottedGroups) {
    const currentRoot =
      root in current && current[root] && typeof current[root] === "object" && !Array.isArray(current[root])
        ? current[root]
        : {};
    const merged = structuredClone(currentRoot);
    for (const { path, value } of entries) {
      setNested(merged, path.slice(1), value);
    }

    if (deepEqual(currentRoot, merged)) {
      for (const { key, value } of entries) {
        results.push(renderChange(key, value, value, "Skipped"));
      }
      continue;
    }

    if (isDryRun()) {
      for (const { key, path, value } of entries) {
        const prev = getNested(current, path);
        results.push(renderChange(key, prev ?? null, value, "Would set"));
      }
      continue;
    }

    const result = await writeKey(domain, byHost, root, merged);
    if (result?.exitCode && result.exitCode !== 0) {
      const detail = result.stderr?.trim() || `exit ${result.exitCode}`;
      for (const { key } of entries) {
        results.push(pc.yellow(`⚠ Failed to set ${key}: ${detail}`));
      }
      continue;
    }

    for (const { key, path, value } of entries) {
      const prev = getNested(current, path);
      const had = prev !== undefined;
      results.push(renderChange(key, had ? prev : null, value, had ? "Changed" : "Added"));
    }
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
