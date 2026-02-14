/**
 * Interactive CLI for dual authentication setup.
 *
 * Sets up both:
 * 1. OAuth2 (V1 API) — Client ID, Client Secret, access/refresh tokens
 * 2. Session auth (V2 API) — TickTick username and password
 *
 * Usage: node build/index.js auth
 */

import path from "node:path";
import readline from "node:readline";
import { runOAuthFlow } from "./auth/oauth.js";
import type { TickTickHost } from "./types.js";

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function runAuthCli(): Promise<void> {
  console.error("\n╔══════════════════════════════════════════════╗");
  console.error("║    TickTick MCP Server — Dual Auth Setup     ║");
  console.error("╚══════════════════════════════════════════════╝\n");

  console.error("This server requires TWO forms of authentication:\n");
  console.error("  1. OAuth2 (for the official V1 API)");
  console.error("     - Create an app at: https://developer.ticktick.com/manage");
  console.error("     - Set redirect URI to: http://localhost:42813/callback\n");
  console.error("  2. Username & Password (for the V2 internal API)");
  console.error("     - Your TickTick login credentials");
  console.error("     - Unlocks: tags, habits, focus, completed tasks, and more\n");

  // -------------------------------------------------------------------------
  // Step 1: Host selection
  // -------------------------------------------------------------------------
  const hostInput = await prompt("  Service (ticktick or dida365) [ticktick]: ");
  const host: TickTickHost = hostInput === "dida365" ? "dida365" : "ticktick";

  // -------------------------------------------------------------------------
  // Step 2: V2 credentials (username/password)
  // -------------------------------------------------------------------------
  console.error("\n─── Step 1: TickTick Login Credentials (V2 API) ───\n");

  const username = await prompt("  Email / Username: ");
  if (!username) {
    console.error("Username is required.");
    process.exit(1);
  }

  const password = await prompt("  Password: ");
  if (!password) {
    console.error("Password is required.");
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Step 3: OAuth2 flow (V1 API)
  // -------------------------------------------------------------------------
  console.error("\n─── Step 2: OAuth2 Setup (V1 API) ───\n");

  const clientId = await prompt("  Client ID: ");
  if (!clientId) {
    console.error("Client ID is required.");
    process.exit(1);
  }

  const clientSecret = await prompt("  Client Secret: ");
  if (!clientSecret) {
    console.error("Client Secret is required.");
    process.exit(1);
  }

  const envPath = path.resolve(process.cwd(), ".env");

  console.error("\n  Starting OAuth flow...\n");

  try {
    const result = await runOAuthFlow({
      clientId,
      clientSecret,
      host,
      envPath,
      extraVars: {
        TICKTICK_USERNAME: username,
        TICKTICK_PASSWORD: password,
      },
    });

    console.error("\n✅ Dual authentication successful!\n");
    console.error(`  OAuth access token: ${result.accessToken.slice(0, 12)}...`);
    if (result.refreshToken) {
      console.error(`  OAuth refresh token: ${result.refreshToken.slice(0, 12)}...`);
    }
    console.error(`  V2 username: ${username}`);
    console.error(`  V2 password: ${"*".repeat(password.length)}`);
    console.error(`\n  All credentials written to: ${envPath}`);
    console.error("\n  You can now configure this server in your MCP client.");
    console.error("  See README.md for integration guides.\n");
  } catch (err) {
    console.error(`\n❌ Authentication failed: ${err}`);
    process.exit(1);
  }
}
