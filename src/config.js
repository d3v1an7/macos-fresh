import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import { configSchema } from "./schema.js";

export async function loadConfig({ configUrl, configPath }) {
  const raw = configUrl ? await fetchConfig(configUrl) : await readFile(configPath, "utf8");
  const parsed = parseYaml(raw);
  const result = configSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "<root>"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid config:\n${issues}`);
  }
  return result.data;
}

async function fetchConfig(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch config from ${url}: HTTP ${res.status} ${res.statusText}`);
  }
  return res.text();
}
