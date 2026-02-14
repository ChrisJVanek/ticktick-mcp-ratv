/**
 * MCP tools for TickTick Tag management (V2 API).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TickTickV2Client } from "../client-v2.js";

export function registerTagTools(
  server: McpServer,
  getV2: () => TickTickV2Client,
) {
  server.registerTool(
    "ticktick_get_tags",
    {
      title: "List Tags",
      description:
        "List all tags in your TickTick account. Returns tag names, colors, and sort order.",
      inputSchema: {},
    },
    async () => {
      const tags = await getV2().getTags();
      return {
        content: [
          {
            type: "text",
            text:
              tags.length === 0
                ? "No tags found."
                : `${tags.length} tags:\n${JSON.stringify(tags, null, 2)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "ticktick_create_tag",
    {
      title: "Create Tag",
      description: "Create a new tag with an optional color.",
      inputSchema: {
        name: z.string().describe("Tag name"),
        color: z.string().optional().describe('Tag color hex string, e.g. "#FF6F61"'),
      },
    },
    async ({ name, color }) => {
      await getV2().createTag({ name, color });
      return {
        content: [{ type: "text", text: `Tag "${name}" created.` }],
      };
    },
  );

  server.registerTool(
    "ticktick_rename_tag",
    {
      title: "Rename Tag",
      description: "Rename an existing tag. All tasks with this tag will be updated.",
      inputSchema: {
        old_name: z.string().describe("Current tag name"),
        new_name: z.string().describe("New tag name"),
      },
    },
    async ({ old_name, new_name }) => {
      await getV2().renameTag(old_name, new_name);
      return {
        content: [{ type: "text", text: `Tag renamed from "${old_name}" to "${new_name}".` }],
      };
    },
  );

  server.registerTool(
    "ticktick_delete_tag",
    {
      title: "Delete Tag",
      description: "Delete a tag. Tasks with this tag will have it removed.",
      inputSchema: {
        name: z.string().describe("Tag name to delete"),
      },
    },
    async ({ name }) => {
      await getV2().deleteTag(name);
      return {
        content: [{ type: "text", text: `Tag "${name}" deleted.` }],
      };
    },
  );

  server.registerTool(
    "ticktick_merge_tags",
    {
      title: "Merge Tags",
      description:
        "Merge one tag into another. All tasks with the source tag will be re-tagged with the destination tag.",
      inputSchema: {
        from_tag: z.string().describe("Tag to merge from (will be removed)"),
        to_tag: z.string().describe("Tag to merge into (will be kept)"),
      },
    },
    async ({ from_tag, to_tag }) => {
      await getV2().mergeTags(from_tag, to_tag);
      return {
        content: [
          { type: "text", text: `Tag "${from_tag}" merged into "${to_tag}".` },
        ],
      };
    },
  );
}
