import { z } from "zod";

const plistValues = z.record(z.string(), z.unknown());

const plistEntry = z.object({
  path: z.string(),
  values: plistValues,
});

const powerBucket = z.object({
  values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

export const configSchema = z
  .object({
    brew: z
      .object({
        brew: z.array(z.string()).optional(),
        cask: z.array(z.string()).optional(),
      })
      .optional(),
    mas: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
    system_name_update: z.boolean().optional(),
    power: z.record(z.string(), powerBucket).optional(),
    settings: z.array(plistEntry).optional(),
    apps: z
      .record(
        z.string(),
        z.object({
          settings: z.array(plistEntry).optional(),
          set_as_default: z.boolean().optional(),
        }),
      )
      .optional(),
    fonts: z.array(z.record(z.string(), z.string())).optional(),
  })
  .passthrough();
