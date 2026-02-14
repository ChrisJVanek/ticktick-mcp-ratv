/**
 * MCP tools for TickTick Habit tracking (V2 API).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TickTickV2Client } from "../client-v2.js";

export function registerHabitTools(
  server: McpServer,
  getV2: () => TickTickV2Client,
) {
  server.registerTool(
    "ticktick_get_habits",
    {
      title: "List Habits",
      description:
        "List all habits in your TickTick account, including name, frequency, goal, and streak info.",
      inputSchema: {},
    },
    async () => {
      const habits = await getV2().getHabits();
      return {
        content: [
          {
            type: "text",
            text:
              habits.length === 0
                ? "No habits found."
                : `${habits.length} habits:\n${JSON.stringify(habits, null, 2)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "ticktick_get_habit_sections",
    {
      title: "Get Habit Sections",
      description:
        "Get habit sections (Morning, Afternoon, Evening, etc.) and which habits belong to each.",
      inputSchema: {},
    },
    async () => {
      const sections = await getV2().getHabitSections();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(sections, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "ticktick_create_habit",
    {
      title: "Create Habit",
      description:
        "Create a new habit. Set a name, optional goal, unit, frequency, color, and encouragement message.",
      inputSchema: {
        name: z.string().describe("Habit name"),
        color: z.string().optional().describe("Color hex"),
        goal: z.number().optional().describe("Daily goal number (e.g. 8 for 8 glasses of water)"),
        step: z.number().optional().describe("Step increment (default 1)"),
        unit: z.string().optional().describe('Unit label, e.g. "glasses", "minutes", "pages"'),
        frequency: z.string().optional().describe("Frequency type"),
        encouragement: z
          .string()
          .optional()
          .describe("Motivational message shown on check-in"),
        section_id: z
          .string()
          .optional()
          .describe("Section ID (Morning/Afternoon/Evening)"),
      },
    },
    async ({ name, color, goal, step, unit, frequency, encouragement, section_id }) => {
      await getV2().createHabit({
        name,
        color,
        goal,
        step,
        unit,
        frequency,
        encouragement,
        sectionId: section_id,
      });
      return {
        content: [{ type: "text", text: `Habit "${name}" created.` }],
      };
    },
  );

  server.registerTool(
    "ticktick_delete_habit",
    {
      title: "Delete Habit",
      description: "Delete a habit by its ID. This cannot be undone.",
      inputSchema: {
        habit_id: z.string().describe("Habit ID to delete"),
      },
    },
    async ({ habit_id }) => {
      await getV2().deleteHabit(habit_id);
      return {
        content: [{ type: "text", text: `Habit ${habit_id} deleted.` }],
      };
    },
  );

  server.registerTool(
    "ticktick_checkin_habit",
    {
      title: "Check In Habit",
      description:
        "Record a check-in for a habit on a specific date. Use today's date in YYYYMMDD format by default.",
      inputSchema: {
        habit_id: z.string().describe("Habit ID"),
        date: z
          .string()
          .describe("Date stamp in YYYYMMDD format, e.g. 20250315"),
        value: z
          .number()
          .optional()
          .describe("Check-in value (for quantitative habits, e.g. 3 glasses)"),
      },
    },
    async ({ habit_id, date, value }) => {
      await getV2().checkinHabit({
        habitId: habit_id,
        checkinStamp: date,
        value,
        status: 2, // completed
      });
      return {
        content: [
          {
            type: "text",
            text: `Checked in to habit ${habit_id} for ${date}${value !== undefined ? ` (value: ${value})` : ""}.`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "ticktick_get_habit_checkins",
    {
      title: "Get Habit Check-in History",
      description:
        "Get check-in records for one or more habits from a specific date onward.",
      inputSchema: {
        habit_ids: z
          .array(z.string())
          .describe("Array of habit IDs to query"),
        after_date: z
          .string()
          .describe("Start date in YYYYMMDD format, e.g. 20250101"),
      },
    },
    async ({ habit_ids, after_date }) => {
      const checkins = await getV2().getHabitCheckins(habit_ids, after_date);
      return {
        content: [
          {
            type: "text",
            text:
              checkins.length === 0
                ? "No check-ins found for the given criteria."
                : `${checkins.length} check-ins:\n${JSON.stringify(checkins, null, 2)}`,
          },
        ],
      };
    },
  );
}
