import pc from "picocolors";
import { loadConfig } from "./config.js";
import { installFont } from "./font.js";
import { printHeader } from "./header.js";
import { installApp } from "./installer.js";
import {
  adjustPowerSettings,
  getHardwareUuid,
  setSystemName,
  updateAppSettings,
  updatePlist,
} from "./macos.js";
import { createSpinner } from "./spinner.js";
import { run as exec } from "./util/exec.js";

export async function run({ configUrl, configPath, dryRun }) {
  const config = await loadConfig({ configUrl, configPath });
  const spinner = createSpinner();

  if (dryRun) {
    console.log(
      pc.yellow("Running in --dry-run mode: mutating commands will be printed, not executed.\n"),
    );
  }

  await installBrew(config, spinner);
  await installMas(config, spinner);
  await maybeSetSystemName(config, spinner);
  await maybeAdjustPower(config, spinner);
  await updateSystemSettings(config, spinner);
  await updateAppsSettings(config, spinner);
  await installFonts(config, spinner);
  await clearPreferenceCache(spinner);

  printHeader("All done!");
  console.log("Note that some of these changes require a restart to take effect.\n");
}

async function installBrew(config, spinner) {
  const brew = config.brew;
  if (!brew) return;
  if (brew.brew?.length) {
    printHeader("Installing via brew");
    for (const app of brew.brew) await installApp(spinner, app, "brew");
  }
  if (brew.cask?.length) {
    printHeader("Installing via brew cask");
    for (const app of brew.cask) await installApp(spinner, app, "cask");
  }
}

async function installMas(config, spinner) {
  if (!config.mas?.length) return;
  printHeader("Installing via mas");
  for (const app of config.mas) await installApp(spinner, app, "mas");
}

async function maybeSetSystemName(config, spinner) {
  if (!config.system_name_update) return;
  printHeader("Setting system name");
  console.log("Your sudo password/fingerprint will be required to adjust the system name.");
  await setSystemName(spinner);
}

async function maybeAdjustPower(config, spinner) {
  const power = config.power;
  if (!power || Object.keys(power).length === 0) return;
  printHeader("Adjusting power settings");
  console.log("Your sudo password/fingerprint will be required to adjust the power settings.");
  for (const [name, setting] of Object.entries(power)) {
    await adjustPowerSettings(name, setting, spinner);
  }
}

async function updateSystemSettings(config, spinner) {
  if (!config.settings?.length) return;
  printHeader("Updating system defaults");
  const hardwareUuid = await getHardwareUuid();
  for (const setting of config.settings) {
    await updatePlist(setting, spinner, hardwareUuid);
  }
}

async function updateAppsSettings(config, spinner) {
  const apps = config.apps;
  if (!apps || Object.keys(apps).length === 0) return;
  printHeader("Updating app settings");
  const hardwareUuid = await getHardwareUuid();
  for (const [name, appConfig] of Object.entries(apps)) {
    await updateAppSettings(name, appConfig, hardwareUuid, spinner);
  }
}

async function installFonts(config, spinner) {
  if (!config.fonts?.length) return;
  printHeader("Installing fonts");
  for (const entry of config.fonts) {
    await installFont(spinner, entry);
  }
}

async function clearPreferenceCache(spinner) {
  printHeader("Clearing preference cache");
  for (const proc of ["Finder", "Dock", "SystemUIServer", "cfprefsd"]) {
    spinner.start(proc);
    await exec("killall", [proc]);
    spinner.succeed(proc);
  }
}
