import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(here, "fixtures", "example-config.yaml");

describe("loadConfig", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads and validates a local YAML file", async () => {
    const config = await loadConfig({ configPath: fixturePath });
    expect(config.brew.brew).toEqual(["git", "fnm"]);
    expect(config.brew.cask).toContain("visual-studio-code");
    expect(config.mas[0]).toEqual({ id: 1333542190, name: "1Password 7 - Password Manager" });
    expect(config.system_name_update).toBe(true);
    expect(config.settings[0].path).toMatch(/finder\.plist$/);
    expect(config.apps.brave.set_as_default).toBe(true);
  });

  it("fetches from a URL when --config-url is used", async () => {
    const yaml = "brew:\n  brew:\n    - git\n";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => yaml,
    });
    vi.stubGlobal("fetch", fetchMock);

    const config = await loadConfig({ configUrl: "https://example.invalid/config.yaml" });
    expect(fetchMock).toHaveBeenCalledWith("https://example.invalid/config.yaml");
    expect(config.brew.brew).toEqual(["git"]);
  });

  it("throws a descriptive error when the schema is violated", async () => {
    const badYaml = "mas:\n  - id: 'not a number'\n    name: 'x'\n";
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => badYaml,
    }));
    await expect(loadConfig({ configUrl: "https://example.invalid/bad.yaml" })).rejects.toThrow(
      /Invalid config/,
    );
  });

  it("throws when HTTP fetch fails", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "",
    }));
    await expect(loadConfig({ configUrl: "https://example.invalid/missing" })).rejects.toThrow(
      /HTTP 404/,
    );
  });
});
