/**
 * Read a Worker var, then process.env. A blank placeholder in wrangler.jsonc
 * counts as unset so local process.env can still supply the value.
 */
export async function readWorkerEnv(name: string): Promise<string | undefined> {
  try {
    const { env } = await import("cloudflare:workers");
    const value = (env as unknown as Record<string, string | undefined>)[name];
    if (typeof value === "string" && value.trim()) return value;
  } catch {
    // Outside the Workers runtime, use process.env.
  }
  return process.env[name];
}

export function configuredEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
