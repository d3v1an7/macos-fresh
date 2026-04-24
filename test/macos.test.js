import { mkdtempSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import plist from "simple-plist";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { runMock, captureMock } = vi.hoisted(() => ({
  runMock: vi.fn(),
  captureMock: vi.fn(),
}));
vi.mock("../src/util/exec.js", () => ({
  run: (...a) => runMock(...a),
  capture: (...a) => captureMock(...a),
  isDryRun: () => false,
  setDryRun: vi.fn(),
}));

vi.mock("../src/privileges.js", () => ({
  privileged: async (fn) => fn(),
  isPrivileged: async () => true,
  PrivilegeError: class extends Error {},
  _resetDepth: vi.fn(),
}));

const { _internal, adjustPowerSettings, getHardwareUuid, updatePlist } = await import(
  "../src/macos.js"
);

function fakeSpinner() {
  return { start: vi.fn(), succeed: vi.fn(), fail: vi.fn(), info: vi.fn(), stop: vi.fn() };
}

describe("sanitizeSystemName", () => {
  it("strips non-alphanumerics except hyphens", () => {
    expect(_internal.sanitizeSystemName("Ben's Mac!")).toBe("BensMac");
    expect(_internal.sanitizeSystemName("my-cool-box")).toBe("my-cool-box");
  });

  it("truncates to 63 characters", () => {
    const long = "a".repeat(100);
    expect(_internal.sanitizeSystemName(long)).toHaveLength(63);
  });
});

describe("expandPath", () => {
  it("expands ~ to the home directory", () => {
    expect(_internal.expandPath("~/foo/bar.plist", "")).toBe(join(homedir(), "foo/bar.plist"));
  });

  it("substitutes the literal `UUID` token with the hardware uuid", () => {
    const uuid = "AAAA-BBBB";
    expect(_internal.expandPath("/a/UUID/b.plist", uuid)).toBe("/a/AAAA-BBBB/b.plist");
  });
});

describe("getHardwareUuid", () => {
  it("parses `Hardware UUID: <value>` from system_profiler output", async () => {
    captureMock.mockResolvedValue({
      stdout: "Hardware:\n    Hardware UUID: DEAD-BEEF-CAFE\n    Other: x\n",
    });
    expect(await getHardwareUuid()).toBe("DEAD-BEEF-CAFE");
  });

  it("returns an empty string when UUID not found", async () => {
    captureMock.mockResolvedValue({ stdout: "no uuid here" });
    expect(await getHardwareUuid()).toBe("");
  });
});

describe("updatePlist", () => {
  let scratch;
  beforeEach(() => {
    scratch = mkdtempSync(join(tmpdir(), "macos-fresh-test-"));
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    rmSync(scratch, { recursive: true, force: true });
  });

  it("creates a new plist with the provided values when the file doesn't exist", () => {
    const path = join(scratch, "new.plist");
    updatePlist({ path, values: { A: 1, B: "two" } }, fakeSpinner(), "");
    const written = plist.readFileSync(path);
    expect(written).toEqual({ A: 1, B: "two" });
  });

  it("updates only changed keys and preserves other existing keys", () => {
    const path = join(scratch, "existing.plist");
    plist.writeFileSync(path, { A: 1, Keep: "keep-me" });
    updatePlist({ path, values: { A: 2 } }, fakeSpinner(), "");
    const written = plist.readFileSync(path);
    expect(written).toEqual({ A: 2, Keep: "keep-me" });
  });

  it("reports Skipped when the key already has the desired value", () => {
    const path = join(scratch, "same.plist");
    plist.writeFileSync(path, { A: 42 });
    const logs = [];
    vi.spyOn(console, "log").mockImplementation((m) => logs.push(String(m)));
    updatePlist({ path, values: { A: 42 } }, fakeSpinner(), "");
    expect(logs.join("\n")).toMatch(/Skipped value for A/);
  });
});

describe("adjustPowerSettings", () => {
  beforeEach(() => {
    runMock.mockReset();
    runMock.mockResolvedValue({ exitCode: 0 });
  });

  it("maps power_settings_all to -a", async () => {
    await adjustPowerSettings("power_settings_all", { values: { sleep: 10 } }, fakeSpinner());
    expect(runMock).toHaveBeenCalledWith("sudo", ["pmset", "-a", "sleep", "10"]);
  });

  it("maps power_settings_battery to -b", async () => {
    await adjustPowerSettings("power_settings_battery", { values: { sleep: 5 } }, fakeSpinner());
    expect(runMock).toHaveBeenCalledWith("sudo", ["pmset", "-b", "sleep", "5"]);
  });

  it("maps power_settings_charger to -c", async () => {
    await adjustPowerSettings("power_settings_charger", { values: { sleep: 15 } }, fakeSpinner());
    expect(runMock).toHaveBeenCalledWith("sudo", ["pmset", "-c", "sleep", "15"]);
  });

  it("does nothing for an unknown bucket", async () => {
    const spinner = fakeSpinner();
    await adjustPowerSettings("power_bogus", { values: { x: 1 } }, spinner);
    expect(runMock).not.toHaveBeenCalled();
    expect(spinner.fail).toHaveBeenCalled();
  });
});
