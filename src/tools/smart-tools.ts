/**
 * Smart / convenience tools that go beyond basic CRUD.
 *
 * These tools provide higher-level queries like "what's due today",
 * search, GTD-style workflows, and filtered views.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TickTickClient } from "../client.js";
import type { Task } from "../types.js";

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  return new Date(task.dueDate) < startOfDay(new Date());
}

function isDueOn(task: Task, start: Date, end: Date): boolean {
  if (!task.dueDate) return false;
  const d = new Date(task.dueDate);
  return d >= start && d <= end;
}

function formatTaskSummary(task: Task): string {
  const parts: string[] = [];
  parts.push(`• ${task.title}`);
  if (task.dueDate) parts.push(`  Due: ${task.dueDate}`);
  if (task.priority && task.priority > 0) {
    const labels: Record<number, string> = {
      1: "Low",
      3: "Medium",
      5: "High",
    };
    parts.push(`  Priority: ${labels[task.priority] ?? task.priority}`);
  }
  if (task.projectId) parts.push(`  Project: ${task.projectId}`);
  parts.push(`  ID: ${task.id}`);
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Register tools
// ---------------------------------------------------------------------------

export function registerSmartTools(
  server: McpServer,
  getClient: () => TickTickClient,
) {
  // -------------------------------------------------------------------------
  // Get all tasks
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_all_tasks",
    {
      title: "Get All Tasks",
      description:
        "Get all undone tasks across every active project. Useful for building a full picture of your task list.",
      inputSchema: {},
    },
    async () => {
      const tasks = await getClient().getAllTasks();
      return {
        content: [
          {
            type: "text",
            text:
              tasks.length === 0
                ? "No active tasks found."
                : `Found ${tasks.length} tasks:\n${JSON.stringify(tasks, null, 2)}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Search tasks
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_search_tasks",
    {
      title: "Search Tasks",
      description:
        "Search for tasks by text. Matches against task title, content, and subtask titles across all active projects.",
      inputSchema: {
        query: z
          .string()
          .describe("Search text to match against task titles and content"),
      },
    },
    async ({ query }) => {
      const tasks = await getClient().searchTasks(query);
      return {
        content: [
          {
            type: "text",
            text:
              tasks.length === 0
                ? `No tasks matching "${query}".`
                : `Found ${tasks.length} tasks matching "${query}":\n${JSON.stringify(tasks, null, 2)}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Tasks due today
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_tasks_due_today",
    {
      title: "Tasks Due Today",
      description:
        "Get all tasks that are due today. Helps you focus on what needs to get done right now.",
      inputSchema: {},
    },
    async () => {
      const tasks = await getClient().getAllTasks();
      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const due = tasks.filter((t) => isDueOn(t, todayStart, todayEnd));

      return {
        content: [
          {
            type: "text",
            text:
              due.length === 0
                ? "No tasks due today."
                : `${due.length} tasks due today:\n\n${due.map(formatTaskSummary).join("\n\n")}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Tasks due tomorrow
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_tasks_due_tomorrow",
    {
      title: "Tasks Due Tomorrow",
      description: "Get all tasks that are due tomorrow.",
      inputSchema: {},
    },
    async () => {
      const tasks = await getClient().getAllTasks();
      const tomorrow = addDays(new Date(), 1);
      const start = startOfDay(tomorrow);
      const end = endOfDay(tomorrow);
      const due = tasks.filter((t) => isDueOn(t, start, end));

      return {
        content: [
          {
            type: "text",
            text:
              due.length === 0
                ? "No tasks due tomorrow."
                : `${due.length} tasks due tomorrow:\n\n${due.map(formatTaskSummary).join("\n\n")}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Tasks due this week
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_tasks_due_this_week",
    {
      title: "Tasks Due This Week",
      description: "Get all tasks due within the next 7 days.",
      inputSchema: {},
    },
    async () => {
      const tasks = await getClient().getAllTasks();
      const now = new Date();
      const start = startOfDay(now);
      const end = endOfDay(addDays(now, 7));
      const due = tasks.filter((t) => isDueOn(t, start, end));

      return {
        content: [
          {
            type: "text",
            text:
              due.length === 0
                ? "No tasks due this week."
                : `${due.length} tasks due this week:\n\n${due.map(formatTaskSummary).join("\n\n")}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Tasks due in N days
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_tasks_due_in_days",
    {
      title: "Tasks Due in N Days",
      description: "Get all tasks due within the next N days.",
      inputSchema: {
        days: z
          .number()
          .describe("Number of days to look ahead (e.g. 3 for next 3 days)"),
      },
    },
    async ({ days }) => {
      const tasks = await getClient().getAllTasks();
      const now = new Date();
      const start = startOfDay(now);
      const end = endOfDay(addDays(now, days));
      const due = tasks.filter((t) => isDueOn(t, start, end));

      return {
        content: [
          {
            type: "text",
            text:
              due.length === 0
                ? `No tasks due in the next ${days} days.`
                : `${due.length} tasks due in the next ${days} days:\n\n${due.map(formatTaskSummary).join("\n\n")}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Overdue tasks
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_overdue_tasks",
    {
      title: "Overdue Tasks",
      description:
        "Get all tasks that are past their due date. These need immediate attention.",
      inputSchema: {},
    },
    async () => {
      const tasks = await getClient().getAllTasks();
      const overdue = tasks.filter(isOverdue);

      return {
        content: [
          {
            type: "text",
            text:
              overdue.length === 0
                ? "No overdue tasks. You're all caught up!"
                : `${overdue.length} overdue tasks:\n\n${overdue.map(formatTaskSummary).join("\n\n")}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Filter tasks by priority
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_tasks_by_priority",
    {
      title: "Tasks by Priority",
      description:
        "Get all tasks filtered by a specific priority level. Priority values: 0=None, 1=Low, 3=Medium, 5=High.",
      inputSchema: {
        priority: z
          .number()
          .describe("Priority level: 0=None, 1=Low, 3=Medium, 5=High"),
      },
    },
    async ({ priority }) => {
      const tasks = await getClient().getAllTasks();
      const filtered = tasks.filter((t) => t.priority === priority);
      const labels: Record<number, string> = {
        0: "None",
        1: "Low",
        3: "Medium",
        5: "High",
      };

      return {
        content: [
          {
            type: "text",
            text:
              filtered.length === 0
                ? `No tasks with priority ${labels[priority] ?? priority}.`
                : `${filtered.length} tasks with priority ${labels[priority] ?? priority}:\n\n${filtered.map(formatTaskSummary).join("\n\n")}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // GTD: Engaged tasks (high priority + overdue + due today)
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_engaged_tasks",
    {
      title: "GTD: Engaged Tasks",
      description:
        "Get tasks that need immediate engagement: high priority (5), overdue, or due today. Based on GTD methodology.",
      inputSchema: {},
    },
    async () => {
      const tasks = await getClient().getAllTasks();
      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);

      const engaged = tasks.filter(
        (t) =>
          t.priority === 5 ||
          isOverdue(t) ||
          isDueOn(t, todayStart, todayEnd),
      );

      return {
        content: [
          {
            type: "text",
            text:
              engaged.length === 0
                ? "No engaged tasks. Your plate is clear!"
                : `${engaged.length} tasks needing engagement:\n\n${engaged.map(formatTaskSummary).join("\n\n")}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // GTD: Next tasks (medium priority + due tomorrow)
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_get_next_tasks",
    {
      title: "GTD: Next Tasks",
      description:
        "Get tasks that are up next: medium priority (3) or due tomorrow. Based on GTD methodology.",
      inputSchema: {},
    },
    async () => {
      const tasks = await getClient().getAllTasks();
      const tomorrow = addDays(new Date(), 1);
      const start = startOfDay(tomorrow);
      const end = endOfDay(tomorrow);

      const next = tasks.filter(
        (t) => t.priority === 3 || isDueOn(t, start, end),
      );

      return {
        content: [
          {
            type: "text",
            text:
              next.length === 0
                ? "No next tasks on the horizon."
                : `${next.length} next tasks:\n\n${next.map(formatTaskSummary).join("\n\n")}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Advanced filter
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_filter_tasks",
    {
      title: "Filter Tasks",
      description:
        "Advanced task filtering. Combine multiple criteria: project, priority, date ranges, text search. All filters are AND-combined.",
      inputSchema: {
        project_id: z
          .string()
          .optional()
          .describe("Filter to tasks in this project only"),
        priority: z
          .number()
          .optional()
          .describe("Filter by priority (0, 1, 3, or 5)"),
        due_before: z
          .string()
          .optional()
          .describe("Only tasks due before this date (ISO 8601)"),
        due_after: z
          .string()
          .optional()
          .describe("Only tasks due after this date (ISO 8601)"),
        text: z
          .string()
          .optional()
          .describe("Text to search in title and content"),
        has_due_date: z
          .boolean()
          .optional()
          .describe("If true, only tasks with a due date; if false, only tasks without"),
      },
    },
    async ({ project_id, priority, due_before, due_after, text, has_due_date }) => {
      let tasks: Task[];
      if (project_id) {
        const data = await getClient().getProjectData(project_id);
        tasks = data.tasks ?? [];
      } else {
        tasks = await getClient().getAllTasks();
      }

      if (priority !== undefined) {
        tasks = tasks.filter((t) => t.priority === priority);
      }
      if (has_due_date !== undefined) {
        tasks = tasks.filter((t) =>
          has_due_date ? !!t.dueDate : !t.dueDate,
        );
      }
      if (due_before) {
        const cutoff = new Date(due_before);
        tasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) <= cutoff);
      }
      if (due_after) {
        const cutoff = new Date(due_after);
        tasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= cutoff);
      }
      if (text) {
        const q = text.toLowerCase();
        tasks = tasks.filter(
          (t) =>
            t.title?.toLowerCase().includes(q) ||
            t.content?.toLowerCase().includes(q),
        );
      }

      return {
        content: [
          {
            type: "text",
            text:
              tasks.length === 0
                ? "No tasks match the given filters."
                : `${tasks.length} tasks match:\n${JSON.stringify(tasks, null, 2)}`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Daily summary / digest
  // -------------------------------------------------------------------------
  server.registerTool(
    "ticktick_daily_summary",
    {
      title: "Daily Summary",
      description:
        "Get a productivity digest: overdue tasks, tasks due today, tasks due tomorrow, and high-priority items. Great for morning planning.",
      inputSchema: {},
    },
    async () => {
      const tasks = await getClient().getAllTasks();
      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const tomorrowStart = startOfDay(addDays(now, 1));
      const tomorrowEnd = endOfDay(addDays(now, 1));

      const overdue = tasks.filter(isOverdue);
      const today = tasks.filter((t) => isDueOn(t, todayStart, todayEnd));
      const tomorrow = tasks.filter((t) =>
        isDueOn(t, tomorrowStart, tomorrowEnd),
      );
      const highPri = tasks.filter((t) => t.priority === 5);

      const sections: string[] = [];
      sections.push(`📋 DAILY SUMMARY — ${now.toLocaleDateString()}`);
      sections.push(`Total active tasks: ${tasks.length}\n`);

      if (overdue.length > 0) {
        sections.push(
          `🔴 OVERDUE (${overdue.length}):\n${overdue.map(formatTaskSummary).join("\n\n")}`,
        );
      }
      if (today.length > 0) {
        sections.push(
          `🟡 DUE TODAY (${today.length}):\n${today.map(formatTaskSummary).join("\n\n")}`,
        );
      }
      if (tomorrow.length > 0) {
        sections.push(
          `🔵 DUE TOMORROW (${tomorrow.length}):\n${tomorrow.map(formatTaskSummary).join("\n\n")}`,
        );
      }
      if (highPri.length > 0) {
        sections.push(
          `🔥 HIGH PRIORITY (${highPri.length}):\n${highPri.map(formatTaskSummary).join("\n\n")}`,
        );
      }

      if (overdue.length === 0 && today.length === 0 && highPri.length === 0) {
        sections.push("✅ Looking good! No overdue or urgent tasks.");
      }

      return {
        content: [{ type: "text", text: sections.join("\n\n") }],
      };
    },
  );
}
