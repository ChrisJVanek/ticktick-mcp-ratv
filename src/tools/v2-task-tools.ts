/**
 * MCP tools that use the V2 API for task operations not possible with V1:
 * completed tasks, trashed tasks, move task, subtask hierarchy, user profile.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TickTickV2Client } from "../client-v2.js";

export function registerV2TaskTools(
  server: McpServer,
  getV2: () => TickTickV2Client,
) {
  // -------------------------------------------------------------------------
  // Completed tasks
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_completed_tasks",
    {
      title: "Get Completed Tasks",
      description:
        "Get tasks that have been completed. Optionally filter by date range. Great for reviewing what you've accomplished.",
      inputSchema: {
        from: z
          .string()
          .optional()
          .describe("Start date in ISO format, e.g. 2025-01-01T00:00:00+0000"),
        to: z
          .string()
          .optional()
          .describe("End date in ISO format, e.g. 2025-03-15T23:59:59+0000"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of tasks to return (default: 50)"),
      },
    },
    async ({ from, to, limit }) => {
      const tasks = await getV2().getCompletedTasks({ from, to, limit });
      return {
        content: [
          {
            type: "text",
            text:
              !tasks || tasks.length === 0
                ? "No completed tasks found for the given criteria."
                : `${tasks.length} completed tasks:\n${JSON.stringify(tasks, null, 2)}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Trashed tasks
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_trashed_tasks",
    {
      title: "Get Trashed Tasks",
      description:
        "Get tasks that have been deleted/trashed. Useful for recovering accidentally deleted items.",
      inputSchema: {
        start: z.number().optional().describe("Pagination offset (default: 0)"),
        limit: z.number().optional().describe("Number of results (default: 50)"),
      },
    },
    async ({ start, limit }) => {
      const data = await getV2().getTrashedTasks({ start, limit });
      const tasks = (data as Record<string, unknown>)?.tasks ?? data;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tasks, null, 2),
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Move task between projects
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_move_task",
    {
      title: "Move Task to Project",
      description:
        "Move a task from one project to another.",
      inputSchema: {
        task_id: z.string().describe("Task ID to move"),
        from_project_id: z.string().describe("Current project ID"),
        to_project_id: z.string().describe("Destination project ID"),
      },
    },
    async ({ task_id, from_project_id, to_project_id }) => {
      await getV2().moveTask(task_id, from_project_id, to_project_id);
      return {
        content: [
          {
            type: "text",
            text: `Task ${task_id} moved from project ${from_project_id} to ${to_project_id}.`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Set task parent (subtask hierarchy)
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_set_task_parent",
    {
      title: "Set Task Parent (Subtask)",
      description:
        "Make a task a subtask of another task by setting its parent. Pass an empty parent_id to remove the parent relationship.",
      inputSchema: {
        task_id: z.string().describe("Task ID to make a subtask"),
        project_id: z.string().describe("Project ID the task belongs to"),
        parent_id: z
          .string()
          .describe("Parent task ID (or empty string to remove parent)"),
      },
    },
    async ({ task_id, project_id, parent_id }) => {
      await getV2().setTaskParent(
        task_id,
        project_id,
        parent_id || null,
      );
      return {
        content: [
          {
            type: "text",
            text: parent_id
              ? `Task ${task_id} is now a subtask of ${parent_id}.`
              : `Task ${task_id} is no longer a subtask.`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // User profile
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_user_profile",
    {
      title: "Get User Profile",
      description:
        "Get your TickTick user profile including name, email, timezone, inbox ID, and subscription status.",
      inputSchema: {},
    },
    async () => {
      const profile = await getV2().getUserProfile();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(profile, null, 2),
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // User settings
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_user_settings",
    {
      title: "Get User Settings",
      description:
        "Get your TickTick account settings and preferences (timezone, start of week, etc.).",
      inputSchema: {},
    },
    async () => {
      const settings = await getV2().getUserSettings();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(settings, null, 2),
          },
        ],
      };
    },
  );
}
