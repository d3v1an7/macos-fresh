import { run } from "./util/exec.js";

// Install a single application via brew, brew --cask, or mas.
// `app` is either a string (brew/cask) or { id, name } (mas).
export async function installApp(spinner, app, kind) {
  let displayName;
  let cmd;
  let args;

  switch (kind) {
    case "brew":
      displayName = app;
      cmd = "brew";
      args = ["install", app];
      break;
    case "cask":
      displayName = app;
      cmd = "brew";
      args = ["install", "--cask", app];
      break;
    case "mas":
      displayName = app.name;
      cmd = "mas";
      args = ["install", String(app.id)];
      break;
    default:
      throw new Error(`Invalid installer kind: ${kind}`);
  }

  spinner.start(displayName);
  try {
    const result = await run(cmd, args);
    if (result.exitCode === 0) {
      spinner.succeed(displayName);
    } else {
      spinner.fail(displayName);
      if (result.stderr) console.error(result.stderr);
    }
  } catch (err) {
    spinner.fail(displayName);
    console.error(`Error running ${cmd} ${args.join(" ")}`);
    console.error(err?.message ?? err);
  }
}
