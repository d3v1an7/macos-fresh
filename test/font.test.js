import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { runMock, captureMock } = vi.hoisted(() => ({
  runMock: vi.fn(),
  captureMock: vi.fn(),
}));
vi.mock("../src/util/exec.js", () => ({
  run: (...a) => runMock(...a),
  capture: (...a) => captureMock(...a),
  isDryRun: () => true, // exercise the dry-run short-circuit; avoids real filesystem writes
  setDryRun: vi.fn(),
}));

const { installFont } = await import("../src/font.js");

function fakeSpinner() {
  return { start: vi.fn(), succeed: vi.fn(), fail: vi.fn(), info: vi.fn(), stop: vi.fn() };
}

describe("installFont", () => {
  beforeEach(() => {
    captureMock.mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips when the font is already installed per system_profiler", async () => {
    captureMock.mockResolvedValue({ stdout: "Helvetica\nJetBrains Mono\nMenlo\n" });
    const spinner = fakeSpinner();
    await installFont(spinner, { "JetBrains Mono": "https://example.invalid/jetbrains-mono.zip" });
    expect(spinner.succeed).toHaveBeenCalledWith("JetBrains Mono (already installed)");
  });

  it("dry-runs the download/extract path when font not present", async () => {
    captureMock.mockResolvedValue({ stdout: "Helvetica\n" });
    const logs = [];
    vi.spyOn(console, "log").mockImplementation((m) => logs.push(String(m)));
    const spinner = fakeSpinner();
    await installFont(spinner, { "JetBrains Mono": "https://example.invalid/jb.zip" });
    expect(logs.join("\n")).toMatch(/dry-run.*download/);
    expect(logs.join("\n")).toMatch(/dry-run.*extract/);
    expect(spinner.succeed).toHaveBeenCalledWith("JetBrains Mono");
  });
});
