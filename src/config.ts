/**
 * Configuration loader.
 *
 * Reads from environment variables (supports .env via --env-file flag
 * in Node 20+ or external tools like dotenv).
 */

import type { ServerConfig, TickTickHost } from "./types.js";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        "Run the auth setup first: npx ticktick-mcp-server auth\n" +
        "Or set the variable in your MCP server configuration.",
    );
  }
  return val;
}

export function loadConfig(): ServerConfig {
  return {
    clientId: requireEnv("TICKTICK_CLIENT_ID"),
    clientSecret: requireEnv("TICKTICK_CLIENT_SECRET"),
    accessToken: requireEnv("TICKTICK_ACCESS_TOKEN"),
    refreshToken: process.env.TICKTICK_REFRESH_TOKEN,
    host: (process.env.TICKTICK_HOST as TickTickHost) ?? "ticktick",
  };
}
