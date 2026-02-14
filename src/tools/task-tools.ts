/**
 * MCP tool definitions for TickTick Task management.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TickTickClient } from "../client.js";

const checklistItemSchema = z.object({
  title: z.string().describe("Subtask title"),
  status: z
    .number()
    .optional()
    .describe("0 = incomplete (default), 1 = completed"),
  startDate: z
    .string()
    .optional()
    .describe("Start date in yyyy-MM-ddTHH:mm:ssZ format"),
  isAllDay: z.boolean().optional().describe("Whether this is an all-day item"),
  sortOrder: z.number().optional().describe("Sort order"),
  timeZone: z
    .string()
    .optional()
    .describe('Time zone, e.g. "America/New_York"'),
});

export function registerTaskTools(
  server: McpServer,
  getClient: () => TickTickClient,
) {
  // -------------------------------------------------------------------------
  // Get a single task
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_task",
    {
      title: "Get Task",
      description:
        "Retrieve a specific task by its project ID and task ID. Returns full task details including subtasks, dates, priority, and content.",
      inputSchema: {
        project_id: z
          .string()
          .describe("The project ID the task belongs to"),
        task_id: z.string().describe("The task ID"),
      },
    },
    async ({ project_id, task_id }) => {
      const task = await getClient().getTask(project_id, task_id);
      return {
        content: [{ type: "text", text: JSON.stringify(task, null, 2) }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Create a task
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_create_task",
    {
      title: "Create Task",
      description:
        "Create a new task in TickTick. Requires a title and project ID. Optionally set content, dates, priority (0=None, 1=Low, 3=Medium, 5=High), reminders, recurring rules, and subtasks.",
      inputSchema: {
        title: z.string().describe("Task title"),
        project_id: z
          .string()
          .describe("Project ID to create the task in"),
        content: z.string().optional().describe("Task body / notes"),
        desc: z.string().optional().describe("Description for checklist items"),
        is_all_day: z
          .boolean()
          .optional()
          .describe("Whether this is an all-day task"),
        start_date: z
          .string()
          .optional()
          .describe(
            "Start date/time in yyyy-MM-ddTHH:mm:ssZ format, e.g. 2025-03-15T09:00:00+0000",
          ),
        due_date: z
          .string()
          .optional()
          .describe(
            "Due date/time in yyyy-MM-ddTHH:mm:ssZ format, e.g. 2025-03-15T17:00:00+0000",
          ),
        time_zone: z
          .string()
          .optional()
          .describe('Time zone, e.g. "America/New_York"'),
        reminders: z
          .array(z.string())
          .optional()
          .describe("List of reminder triggers"),
        repeat_flag: z
          .string()
          .optional()
          .describe(
            'Recurrence rule string, e.g. "RRULE:FREQ=DAILY;INTERVAL=1"',
          ),
        priority: z
          .number()
          .optional()
          .describe("Priority: 0=None, 1=Low, 3=Medium, 5=High"),
        sort_order: z.number().optional().describe("Sort order value"),
        items: z
          .array(checklistItemSchema)
          .optional()
          .describe("Subtasks / checklist items"),
      },
    },
    async ({
      title,
      project_id,
      content,
      desc,
      is_all_day,
      start_date,
      due_date,
      time_zone,
      reminders,
      repeat_flag,
      priority,
      sort_order,
      items,
    }) => {
      const task = await getClient().createTask({
        title,
        projectId: project_id,
        content,
        desc,
        isAllDay: is_all_day,
        startDate: start_date,
        dueDate: due_date,
        timeZone: time_zone,
        reminders,
        repeatFlag: repeat_flag,
        priority,
        sortOrder: sort_order,
        items,
      });
      return {
        content: [
          {
            type: "text",
            text: `Task created:\n${JSON.stringify(task, null, 2)}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Update a task
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_update_task",
    {
      title: "Update Task",
      description:
        "Update an existing task. Both task_id and project_id are required. Only the fields you provide will be changed.",
      inputSchema: {
        task_id: z.string().describe("The task ID to update"),
        project_id: z
          .string()
          .describe("The project ID the task belongs to"),
        title: z.string().optional().describe("New title"),
        content: z.string().optional().describe("New body / notes"),
        desc: z.string().optional().describe("New description"),
        is_all_day: z.boolean().optional().describe("All-day flag"),
        start_date: z
          .string()
          .optional()
          .describe("New start date in yyyy-MM-ddTHH:mm:ssZ"),
        due_date: z
          .string()
          .optional()
          .describe("New due date in yyyy-MM-ddTHH:mm:ssZ"),
        time_zone: z.string().optional().describe("Time zone"),
        reminders: z.array(z.string()).optional().describe("Reminders"),
        repeat_flag: z.string().optional().describe("Recurrence rule"),
        priority: z
          .number()
          .optional()
          .describe("Priority: 0=None, 1=Low, 3=Medium, 5=High"),
        sort_order: z.number().optional().describe("Sort order"),
        items: z
          .array(checklistItemSchema)
          .optional()
          .describe("Subtasks / checklist items"),
      },
    },
    async ({
      task_id,
      project_id,
      title,
      content,
      desc,
      is_all_day,
      start_date,
      due_date,
      time_zone,
      reminders,
      repeat_flag,
      priority,
      sort_order,
      items,
    }) => {
      const task = await getClient().updateTask({
        id: task_id,
        projectId: project_id,
        title,
        content,
        desc,
        isAllDay: is_all_day,
        startDate: start_date,
        dueDate: due_date,
        timeZone: time_zone,
        reminders,
        repeatFlag: repeat_flag,
        priority,
        sortOrder: sort_order,
        items,
      });
      return {
        content: [
          {
            type: "text",
            text: `Task updated:\n${JSON.stringify(task, null, 2)}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Complete a task
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_complete_task",
    {
      title: "Complete Task",
      description: "Mark a task as completed.",
      inputSchema: {
        project_id: z
          .string()
          .describe("The project ID the task belongs to"),
        task_id: z.string().describe("The task ID to complete"),
      },
    },
    async ({ project_id, task_id }) => {
      await getClient().completeTask(project_id, task_id);
      return {
        content: [
          {
            type: "text",
            text: `Task ${task_id} marked as completed.`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Delete a task
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_delete_task",
    {
      title: "Delete Task",
      description: "Permanently delete a task. This cannot be undone.",
      inputSchema: {
        project_id: z
          .string()
          .describe("The project ID the task belongs to"),
        task_id: z.string().describe("The task ID to delete"),
      },
    },
    async ({ project_id, task_id }) => {
      await getClient().deleteTask(project_id, task_id);
      return {
        content: [
          {
            type: "text",
            text: `Task ${task_id} deleted.`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Batch create tasks
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_batch_create_tasks",
    {
      title: "Batch Create Tasks",
      description:
        "Create multiple tasks at once. Each task requires a title and project_id.",
      inputSchema: {
        tasks: z
          .array(
            z.object({
              title: z.string().describe("Task title"),
              project_id: z.string().describe("Project ID"),
              content: z.string().optional().describe("Task body"),
              due_date: z.string().optional().describe("Due date"),
              priority: z
                .number()
                .optional()
                .describe("Priority: 0, 1, 3, or 5"),
            }),
          )
          .describe("Array of tasks to create"),
      },
    },
    async ({ tasks }) => {
      const inputs = tasks.map((t) => ({
        title: t.title,
        projectId: t.project_id,
        content: t.content,
        dueDate: t.due_date,
        priority: t.priority,
      }));
      const created = await getClient().batchCreateTasks(inputs);
      return {
        content: [
          {
            type: "text",
            text: `${created.length} tasks created:\n${JSON.stringify(created, null, 2)}`,
          },
        ],
      };
    },
  );
}
