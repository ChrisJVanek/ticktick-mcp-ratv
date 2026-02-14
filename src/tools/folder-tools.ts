/**
 * MCP tools for TickTick Project Folders/Groups (V2 API).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TickTickV2Client } from "../client-v2.js";

export function registerFolderTools(
  server: McpServer,
  getV2: () => TickTickV2Client,
) {
  server.registerTool(
    "ticktick_get_project_folders",
    {
      title: "List Project Folders",
      description:
        "List all project folders (groups) used to organize projects in TickTick.",
      inputSchema: {},
    },
    async () => {
      const groups = await getV2().getProjectGroups();
      return {
        content: [
          {
            type: "text",
            text:
              groups.length === 0
                ? "No project folders found."
                : `${groups.length} folders:\n${JSON.stringify(groups, null, 2)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "ticktick_create_project_folder",
    {
      title: "Create Project Folder",
      description: "Create a new folder to organize projects.",
      inputSchema: {
        name: z.string().describe("Folder name"),
        sort_order: z.number().optional().describe("Sort order"),
      },
    },
    async ({ name, sort_order }) => {
      await getV2().createProjectGroup(name, sort_order);
      return {
        content: [
          { type: "text", text: `Project folder "${name}" created.` },
        ],
      };
    },
  );

  server.registerTool(
    "ticktick_delete_project_folder",
    {
      title: "Delete Project Folder",
      description:
        "Delete a project folder. Projects inside will be ungrouped, not deleted.",
      inputSchema: {
        folder_id: z.string().describe("Folder ID to delete"),
      },
    },
    async ({ folder_id }) => {
      await getV2().deleteProjectGroup(folder_id);
      return {
        content: [
          { type: "text", text: `Project folder ${folder_id} deleted.` },
        ],
      };
    },
  );
}
