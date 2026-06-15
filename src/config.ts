/**
 * Configuration loader.
 *
 * Reads from environment variables. Requires both OAuth (V1) and
 * username/password (V2) credentials for full feature access.
 */

import type { ServerConfig, TickTickHost } from "./types.js";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        "Run the auth setup first: node build/index.js auth\n" +
        "Or set the variable in your MCP server configuration.",
    );
  }
  return val;
}

export function loadConfig(): ServerConfig {
  return {
    // V1 OAuth
    clientId: requireEnv("TICKTICK_CLIENT_ID"),
    clientSecret: requireEnv("TICKTICK_CLIENT_SECRET"),
    accessToken: requireEnv("TICKTICK_ACCESS_TOKEN"),
    refreshToken: process.env.TICKTICK_REFRESH_TOKEN,
    // V2 session
    username: requireEnv("TICKTICK_USERNAME"),
    password: requireEnv("TICKTICK_PASSWORD"),
    deviceId: process.env.TICKTICK_DEVICE_ID,
    // Host
    host: (process.env.TICKTICK_HOST as TickTickHost) ?? "ticktick",
  };
}
