/**
 * MCP tools for TickTick Kanban column management (V2 API).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TickTickV2Client } from "../client-v2.js";

export function registerColumnTools(
  server: McpServer,
  getV2: () => TickTickV2Client,
) {
  server.registerTool(
    "ticktick_get_columns",
    {
      title: "Get Kanban Columns",
      description:
        "List all Kanban columns for a project. Only applicable to projects using kanban view mode.",
      inputSchema: {
        project_id: z.string().describe("The project ID"),
      },
    },
    async ({ project_id }) => {
      const columns = await getV2().getColumns(project_id);
      return {
        content: [
          {
            type: "text",
            text:
              !columns || columns.length === 0
                ? "No columns found (project may not be in kanban mode)."
                : `${columns.length} columns:\n${JSON.stringify(columns, null, 2)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "ticktick_create_column",
    {
      title: "Create Kanban Column",
      description: "Add a new column to a kanban-view project.",
      inputSchema: {
        project_id: z.string().describe("The project ID"),
        name: z.string().describe("Column name"),
        sort_order: z.number().optional().describe("Sort order"),
      },
    },
    async ({ project_id, name, sort_order }) => {
      await getV2().createColumn(project_id, name, sort_order);
      return {
        content: [
          {
            type: "text",
            text: `Column "${name}" created in project ${project_id}.`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "ticktick_delete_column",
    {
      title: "Delete Kanban Column",
      description: "Delete a column from a kanban-view project.",
      inputSchema: {
        column_id: z.string().describe("Column ID to delete"),
        project_id: z.string().describe("The project ID"),
      },
    },
    async ({ column_id, project_id }) => {
      await getV2().deleteColumn(column_id, project_id);
      return {
        content: [
          { type: "text", text: `Column ${column_id} deleted.` },
        ],
      };
    },
  );
}
