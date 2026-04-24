import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
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

function renderChange(key, oldValue, newValue, action) {
  const oldStr = oldValue === undefined || oldValue === null ? "None" : String(oldValue);
  const newStr = String(newValue);
  return `${action} value for ${key}: ${oldStr} ${pc.gray("->")} ${newStr}`;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

// Update a single plist entry: read, diff each key, write if changed.
export function updatePlist(setting, spinner, hardwareUuid) {
  const plistPath = expandPath(setting.path, hardwareUuid);
  const exists = existsSync(plistPath);
  const action = exists ? `Updating: ${plistPath}` : `Creating: ${plistPath}`;

  let data = {};
  if (exists) {
    try {
      data = plist.readFileSync(plistPath) ?? {};
    } catch {
      data = {};
    }
  }

  spinner.start(action);

  const results = [];
  let changed = !exists;
  for (const [key, value] of Object.entries(setting.values)) {
    if (key in data) {
      if (!deepEqual(data[key], value)) {
        const previous = data[key];
        data[key] = value;
        changed = true;
        results.push(renderChange(key, previous, value, "Changed"));
      } else {
        results.push(renderChange(key, data[key], value, "Skipped"));
      }
    } else {
      data[key] = value;
      changed = true;
      results.push(renderChange(key, null, value, "Added"));
    }
  }

  if (changed && !isDryRun()) {
    plist.writeFileSync(plistPath, data);
  } else if (changed && isDryRun()) {
    console.log(pc.dim(`  [dry-run] write plist ${plistPath}`));
  }

  spinner.succeed(action);
  for (const result of results) {
    console.log(`  - ${result}`);
  }
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
    updatePlist(setting, spinner, hardwareUuid);
  }
  if (appName === "brave" && appConfig.set_as_default) {
    spinner.start("Setting Brave as the default browser");
    await run("open", ["--new", "-a", "Brave Browser", "--args", "--make-default-browser"]);
    spinner.succeed("Setting Brave as the default browser");
  }
}

export const _internal = { sanitizeSystemName, expandPath, renderChange };
