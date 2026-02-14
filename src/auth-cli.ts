/**
 * Interactive CLI for the OAuth2 authorization flow.
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
    output: process.stderr, // Use stderr so it doesn't interfere with MCP stdio
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function runAuthCli(): Promise<void> {
  console.error("\n╔══════════════════════════════════════════╗");
  console.error("║    TickTick MCP Server — Auth Setup      ║");
  console.error("╚══════════════════════════════════════════╝\n");

  console.error("Before starting, you need a TickTick developer application.");
  console.error("Create one at: https://developer.ticktick.com/manage\n");
  console.error(
    `Set the redirect URI to: http://localhost:42813/callback\n`,
  );

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

  const hostInput = await prompt(
    "  Service (ticktick or dida365) [ticktick]: ",
  );
  const host: TickTickHost =
    hostInput === "dida365" ? "dida365" : "ticktick";

  const envPath = path.resolve(process.cwd(), ".env");

  console.error("\n  Starting OAuth flow...\n");

  try {
    const result = await runOAuthFlow({
      clientId,
      clientSecret,
      host,
      envPath,
    });

    console.error("\n✅ Authentication successful!");
    console.error(`  Access token: ${result.accessToken.slice(0, 12)}...`);
    if (result.refreshToken) {
      console.error(
        `  Refresh token: ${result.refreshToken.slice(0, 12)}...`,
      );
    }
    console.error(`\n  Tokens written to: ${envPath}`);
    console.error(
      "\n  You can now configure this server in your MCP client.\n",
    );
  } catch (err) {
    console.error(`\n❌ Authentication failed: ${err}`);
    process.exit(1);
  }
}
