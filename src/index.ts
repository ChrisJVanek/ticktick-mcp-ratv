#!/usr/bin/env node

/**
 * TickTick MCP Server — main entry point.
 *
 * Exposes TickTick task management as MCP tools for AI clients
 * (Claude Code, Cursor, VS Code, etc.).
 *
 * Usage:
 *   node build/index.js          # Run the MCP server (stdio)
 *   node build/index.js auth     # Run the OAuth2 setup flow
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TickTickClient } from "./client.js";
import { loadConfig } from "./config.js";
import { registerProjectTools } from "./tools/project-tools.js";
import { registerTaskTools } from "./tools/task-tools.js";
import { registerSmartTools } from "./tools/smart-tools.js";

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

  const client = new TickTickClient({
    accessToken: config.accessToken,
    refreshToken: config.refreshToken,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    host: config.host,
  });

  const server = new McpServer({
    name: "ticktick-mcp-server",
    version: "1.0.0",
  });

  // Register all tools
  const getClient = () => client;
  registerProjectTools(server, getClient);
  registerTaskTools(server, getClient);
  registerSmartTools(server, getClient);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("TickTick MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
