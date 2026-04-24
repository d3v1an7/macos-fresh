import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { runMock } = vi.hoisted(() => ({ runMock: vi.fn() }));
vi.mock("../src/util/exec.js", () => ({
  run: (...args) => runMock(...args),
  capture: vi.fn(),
  isDryRun: () => false,
  setDryRun: vi.fn(),
}));

const { installApp } = await import("../src/installer.js");

function fakeSpinner() {
  return { start: vi.fn(), succeed: vi.fn(), fail: vi.fn(), info: vi.fn(), stop: vi.fn() };
}

describe("installApp", () => {
  beforeEach(() => {
    runMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("runs `brew install <name>` for brew", async () => {
    runMock.mockResolvedValue({ exitCode: 0, stdout: "", stderr: "" });
    const spinner = fakeSpinner();
    await installApp(spinner, "git", "brew");
    expect(runMock).toHaveBeenCalledWith("brew", ["install", "git"]);
    expect(spinner.succeed).toHaveBeenCalledWith("git");
  });

  it("runs `brew install --cask <name>` for cask", async () => {
    runMock.mockResolvedValue({ exitCode: 0 });
    const spinner = fakeSpinner();
    await installApp(spinner, "slack", "cask");
    expect(runMock).toHaveBeenCalledWith("brew", ["install", "--cask", "slack"]);
  });

  it("runs `mas install <id>` for mas with the app name displayed", async () => {
    runMock.mockResolvedValue({ exitCode: 0 });
    const spinner = fakeSpinner();
    await installApp(spinner, { id: 12345, name: "Some App" }, "mas");
    expect(runMock).toHaveBeenCalledWith("mas", ["install", "12345"]);
    expect(spinner.start).toHaveBeenCalledWith("Some App");
    expect(spinner.succeed).toHaveBeenCalledWith("Some App");
  });

  it("marks the spinner as failed and prints stderr on non-zero exit", async () => {
    runMock.mockResolvedValue({ exitCode: 1, stderr: "boom" });
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const spinner = fakeSpinner();
    await installApp(spinner, "broken-pkg", "brew");
    expect(spinner.fail).toHaveBeenCalledWith("broken-pkg");
    expect(errSpy).toHaveBeenCalledWith("boom");
  });

  it("throws on invalid kind", async () => {
    await expect(installApp(fakeSpinner(), "x", "bogus")).rejects.toThrow(/Invalid installer/);
  });
});
