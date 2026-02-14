/**
 * MCP tool definitions for TickTick Project management.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TickTickClient } from "../client.js";

export function registerProjectTools(
  server: McpServer,
  getClient: () => TickTickClient,
) {
  // -------------------------------------------------------------------------
  // List all projects
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_projects",
    {
      title: "List Projects",
      description:
        "List all projects (lists) in the user's TickTick account. Returns project IDs, names, colors, view modes, and whether they are closed.",
      inputSchema: {},
    },
    async () => {
      const projects = await getClient().getProjects();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(projects, null, 2),
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Get a single project
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_project",
    {
      title: "Get Project",
      description:
        "Get details for a specific project by its ID. Returns project metadata including name, color, view mode, and permissions.",
      inputSchema: {
        project_id: z.string().describe("The project ID"),
      },
    },
    async ({ project_id }) => {
      const project = await getClient().getProject(project_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(project, null, 2),
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Get project with its tasks and columns
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_project_data",
    {
      title: "Get Project with Tasks",
      description:
        "Get a project along with all its undone tasks and Kanban columns. Useful for seeing the full state of a project.",
      inputSchema: {
        project_id: z.string().describe("The project ID"),
      },
    },
    async ({ project_id }) => {
      const data = await getClient().getProjectData(project_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Create a project
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_create_project",
    {
      title: "Create Project",
      description:
        "Create a new project (list) in TickTick. You can specify the name, color, view mode (list/kanban/timeline), and kind (TASK/NOTE).",
      inputSchema: {
        name: z.string().describe("Name of the project"),
        color: z
          .string()
          .optional()
          .describe('Color hex string, e.g. "#F18181"'),
        view_mode: z
          .enum(["list", "kanban", "timeline"])
          .optional()
          .describe("View mode for the project"),
        kind: z
          .enum(["TASK", "NOTE"])
          .optional()
          .describe("Project kind: TASK or NOTE"),
      },
    },
    async ({ name, color, view_mode, kind }) => {
      const project = await getClient().createProject({
        name,
        color,
        viewMode: view_mode,
        kind,
      });
      return {
        content: [
          {
            type: "text",
            text: `Project created successfully:\n${JSON.stringify(project, null, 2)}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Update a project
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_update_project",
    {
      title: "Update Project",
      description:
        "Update an existing project's properties. You can change the name, color, view mode, or kind.",
      inputSchema: {
        project_id: z.string().describe("The project ID to update"),
        name: z.string().optional().describe("New name"),
        color: z.string().optional().describe("New color hex string"),
        view_mode: z
          .enum(["list", "kanban", "timeline"])
          .optional()
          .describe("New view mode"),
        kind: z.enum(["TASK", "NOTE"]).optional().describe("New kind"),
      },
    },
    async ({ project_id, name, color, view_mode, kind }) => {
      const project = await getClient().updateProject(project_id, {
        name,
        color,
        viewMode: view_mode,
        kind,
      });
      return {
        content: [
          {
            type: "text",
            text: `Project updated:\n${JSON.stringify(project, null, 2)}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Delete a project
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_delete_project",
    {
      title: "Delete Project",
      description:
        "Permanently delete a project and all its tasks. This cannot be undone.",
      inputSchema: {
        project_id: z.string().describe("The project ID to delete"),
      },
    },
    async ({ project_id }) => {
      await getClient().deleteProject(project_id);
      return {
        content: [
          {
            type: "text",
            text: `Project ${project_id} deleted successfully.`,
          },
        ],
      };
    },
  );
}
