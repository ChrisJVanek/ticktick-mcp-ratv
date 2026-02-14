/**
 * MCP tools for TickTick Focus/Pomodoro and productivity stats (V2 API).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TickTickV2Client } from "../client-v2.js";

export function registerFocusTools(
  server: McpServer,
  getV2: () => TickTickV2Client,
) {
  server.registerTool(
    "ticktick_get_focus_heatmap",
    {
      title: "Focus Time Heatmap",
      description:
        "Get a heatmap of your focus/pomodoro time over a date range. Shows daily focus totals including pomodoro and stopwatch time.",
      inputSchema: {
        from: z
          .string()
          .describe("Start date in YYYY-MM-DD format, e.g. 2025-01-01"),
        to: z
          .string()
          .describe("End date in YYYY-MM-DD format, e.g. 2025-03-15"),
      },
    },
    async ({ from, to }) => {
      const data = await getV2().getFocusHeatmap(from, to);
      return {
        content: [
          {
            type: "text",
            text:
              !data || (Array.isArray(data) && data.length === 0)
                ? "No focus data for this period."
                : `Focus heatmap (${from} to ${to}):\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "ticktick_get_focus_distribution",
    {
      title: "Focus Time Distribution",
      description:
        "Get how your focus time is distributed across tags/categories over a date range.",
      inputSchema: {
        from: z.string().describe("Start date YYYY-MM-DD"),
        to: z.string().describe("End date YYYY-MM-DD"),
      },
    },
    async ({ from, to }) => {
      const data = await getV2().getFocusDistribution(from, to);
      return {
        content: [
          {
            type: "text",
            text:
              !data || (Array.isArray(data) && data.length === 0)
                ? "No focus distribution data for this period."
                : `Focus distribution (${from} to ${to}):\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "ticktick_get_productivity_stats",
    {
      title: "Productivity Stats",
      description:
        "Get your overall productivity statistics: tasks completed, tasks created, pomodoro count, habit check-ins, and productivity score.",
      inputSchema: {},
    },
    async () => {
      const stats = await getV2().getProductivityStats();
      return {
        content: [
          {
            type: "text",
            text: `Productivity stats:\n${JSON.stringify(stats, null, 2)}`,
          },
        ],
      };
    },
  );
}
