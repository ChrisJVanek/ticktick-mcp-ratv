#!/usr/bin/env node

/**
 * TickTick MCP Server — main entry point.
 *
 * Exposes TickTick task management as MCP tools for AI clients
 * (Claude Code, Cursor, VS Code, etc.).
 *
 * Uses BOTH the official V1 API (OAuth) and the V2 internal API
 * (session-based) for maximum feature coverage.
 *
 * Usage:
 *   node build/index.js          # Run the MCP server (stdio)
 *   node build/index.js auth     # Run the dual auth setup flow
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TickTickClient } from "./client.js";
import { TickTickV2Client } from "./client-v2.js";
import { loadConfig } from "./config.js";
import { registerProjectTools } from "./tools/project-tools.js";
import { registerTaskTools } from "./tools/task-tools.js";
import { registerSmartTools } from "./tools/smart-tools.js";
import { registerTagTools } from "./tools/tag-tools.js";
import { registerHabitTools } from "./tools/habit-tools.js";
import { registerFocusTools } from "./tools/focus-tools.js";
import { registerColumnTools } from "./tools/column-tools.js";
import { registerFolderTools } from "./tools/folder-tools.js";
import { registerV2TaskTools } from "./tools/v2-task-tools.js";

// ---------------------------------------------------------------------------
// Handle "auth" subcommand
// ---------------------------------------------------------------------------

if (process.argv[2] === "auth") {
  const { runAuthCli } = await import("./auth-cli.js");
  await runAuthCli();
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Start MCP server
// ---------------------------------------------------------------------------

async function main() {
  const config = loadConfig();

  // V1 client (official Open API — projects, tasks CRUD)
  const v1Client = new TickTickClient({
    accessToken: config.accessToken,
    refreshToken: config.refreshToken,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    host: config.host,
  });

  // V2 client (internal API — tags, habits, focus, completed tasks, etc.)
  const v2Client = new TickTickV2Client({
    username: config.username,
    password: config.password,
    host: config.host,
    deviceId: config.deviceId,
  });

  const server = new McpServer({
    name: "ticktick-mcp-server",
    version: "2.0.0",
  });

  // V1 tools (official API)
  const getV1 = () => v1Client;
  registerProjectTools(server, getV1);
  registerTaskTools(server, getV1);
  registerSmartTools(server, getV1);

  // V2 tools (internal API)
  const getV2 = () => v2Client;
  registerTagTools(server, getV2);
  registerHabitTools(server, getV2);
  registerFocusTools(server, getV2);
  registerColumnTools(server, getV2);
  registerFolderTools(server, getV2);
  registerV2TaskTools(server, getV2);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("TickTick MCP server v2.0.0 running on stdio (V1 + V2 APIs)");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
