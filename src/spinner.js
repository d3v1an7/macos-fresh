import ora from "ora";

export function createSpinner() {
  const spinner = ora({ spinner: "dots" });
  return {
    start(text) {
      spinner.start(text);
    },
    info(text) {
      spinner.info(text);
    },
    stop() {
      spinner.stop();
    },
    succeed(text) {
      spinner.succeed(text);
    },
    fail(text) {
      spinner.fail(text);
    },
  };
}
