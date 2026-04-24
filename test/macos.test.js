import { homedir } from "node:os";
import { join } from "node:path";
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

function stubExport(xmlByDomain) {
  captureMock.mockImplementation(async (cmd, args) => {
    if (cmd !== "defaults") return { stdout: "", exitCode: 0 };
    const idx = args.indexOf("export");
    if (idx === -1) return { stdout: "", exitCode: 0 };
    const domain = args[idx + 1];
    const xml = xmlByDomain[domain];
    return xml ? { stdout: xml, exitCode: 0 } : { stdout: "", exitCode: 1 };
  });
}

function plistXml(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n${body}\n</plist>`;
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

describe("parsePlistPath", () => {
  it("returns the bare domain for a normal plist path", () => {
    expect(_internal.parsePlistPath("/Users/x/Library/Preferences/com.apple.finder.plist")).toEqual(
      {
        domain: "com.apple.finder",
        byHost: false,
      },
    );
  });

  it("strips the uuid suffix and flags byHost for ByHost paths", () => {
    const p = "/Users/x/Library/Preferences/ByHost/com.apple.Spotlight.DEAD-BEEF-CAFE.plist";
    expect(_internal.parsePlistPath(p)).toEqual({
      domain: "com.apple.Spotlight",
      byHost: true,
    });
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
  beforeEach(() => {
    runMock.mockReset();
    captureMock.mockReset();
    runMock.mockResolvedValue({ exitCode: 0 });
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes typed flags per value kind when the domain is empty", async () => {
    stubExport({});
    await updatePlist(
      {
        path: "/Users/x/Library/Preferences/com.example.plist",
        values: { Flag: true, Count: 3, Ratio: 1.5, Name: "hi" },
      },
      fakeSpinner(),
      "",
    );
    const calls = runMock.mock.calls.map(([, args]) => args);
    expect(calls).toEqual([
      ["write", "com.example", "Flag", "-bool", "TRUE"],
      ["write", "com.example", "Count", "-int", "3"],
      ["write", "com.example", "Ratio", "-float", "1.5"],
      ["write", "com.example", "Name", "-string", "hi"],
    ]);
  });

  it("skips keys that already match the desired value", async () => {
    stubExport({
      "com.example": plistXml("<dict><key>A</key><integer>42</integer></dict>"),
    });
    const logs = [];
    vi.spyOn(console, "log").mockImplementation((m) => logs.push(String(m)));
    await updatePlist({ path: "/p/com.example.plist", values: { A: 42 } }, fakeSpinner(), "");
    expect(runMock).not.toHaveBeenCalled();
    expect(logs.join("\n")).toMatch(/Skipped value for A/);
  });

  it("prepends -currentHost for ByHost paths", async () => {
    stubExport({});
    await updatePlist(
      {
        path: "/Users/x/Library/Preferences/ByHost/com.apple.Spotlight.DEAD-BEEF-CAFE.plist",
        values: { MenuItemHidden: true },
      },
      fakeSpinner(),
      "",
    );
    expect(runMock).toHaveBeenCalledWith("defaults", [
      "-currentHost",
      "write",
      "com.apple.Spotlight",
      "MenuItemHidden",
      "-bool",
      "TRUE",
    ]);
  });

  it("serializes nested values as an XML plist argument", async () => {
    stubExport({});
    await updatePlist(
      {
        path: "/p/com.apple.symbolichotkeys.plist",
        values: {
          AppleSymbolicHotKeys: {
            64: { enabled: false, value: { parameters: [32, 49, 1048576], type: "standard" } },
          },
        },
      },
      fakeSpinner(),
      "",
    );
    const call = runMock.mock.calls[0][1];
    expect(call.slice(0, 3)).toEqual([
      "write",
      "com.apple.symbolichotkeys",
      "AppleSymbolicHotKeys",
    ]);
    expect(call[3]).toMatch(/<plist/);
    expect(call[3]).toMatch(/standard/);
    expect(call[3]).toMatch(/1048576/);
  });

  it("continues on per-key write failure and reports a warning", async () => {
    stubExport({});
    const logs = [];
    vi.spyOn(console, "log").mockImplementation((m) => logs.push(String(m)));
    runMock.mockResolvedValueOnce({ exitCode: 1, stderr: "Operation not permitted" });
    runMock.mockResolvedValueOnce({ exitCode: 0 });
    await updatePlist(
      { path: "/p/com.example.plist", values: { Bad: true, Good: true } },
      fakeSpinner(),
      "",
    );
    expect(runMock).toHaveBeenCalledTimes(2);
    const text = logs.join("\n");
    expect(text).toMatch(/Failed to set Bad.*Operation not permitted/);
    expect(text).toMatch(/Added value for Good/);
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
