# TickTick MCP Server

A comprehensive [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for [TickTick](https://ticktick.com) task management. Connect your AI assistant to your TickTick account and manage tasks, projects, and productivity workflows through natural language.

Works with **Claude Code**, **Cursor**, **VS Code** (Copilot/Cline/Continue), **Claude Desktop**, and any MCP-compatible client.

Also supports **Dida365** (滴答清单), the Chinese version of TickTick.

---

## Features

**25 tools** covering everything the TickTick Open API offers, plus smart productivity helpers:

| Category | Tools |
|----------|-------|
| **Projects** | List, get, create, update, delete projects |
| **Tasks** | Get, create, update, complete, delete tasks, batch create |
| **Smart Queries** | Tasks due today/tomorrow/this week/in N days, overdue tasks |
| **Search** | Full-text search across all tasks |
| **Filtering** | Advanced multi-criteria filtering (project, priority, dates, text) |
| **GTD** | Engaged tasks, next tasks (Getting Things Done methodology) |
| **Productivity** | Daily summary/digest for morning planning |

---

## Quick Start

### 1. Create a TickTick Developer Application

1. Go to [developer.ticktick.com/manage](https://developer.ticktick.com/manage)
2. Click **+ Create App**
3. Set the **Redirect URI** to: `http://localhost:42813/callback`
4. Note your **Client ID** and **Client Secret**

### 2. Install & Authenticate

```bash
# Clone the repository
git clone https://github.com/chrisvanek/ticktick-mcp-ratv.git
cd ticktick-mcp-ratv

# Install dependencies
npm install

# Build
npm run build

# Run the authentication wizard
node build/index.js auth
```

The auth wizard will:
- Ask for your Client ID and Client Secret
- Open your browser to authorize the app
- Save tokens to a `.env` file in the project directory

### 3. Add to Your AI Client

Choose your client below and add the configuration.

---

## IDE Integration Guides

### Claude Code

**Option A: CLI (recommended)**

```bash
claude mcp add ticktick-mcp-server \
  node /absolute/path/to/ticktick-mcp-ratv/build/index.js \
  -e TICKTICK_CLIENT_ID=your_client_id \
  -e TICKTICK_CLIENT_SECRET=your_client_secret \
  -e TICKTICK_ACCESS_TOKEN=your_access_token \
  -e TICKTICK_REFRESH_TOKEN=your_refresh_token \
  -s user
```

Scope options:
- `--scope user` — available in all projects (stored in `~/.claude.json`)
- `--scope project` — shared with your team (stored in `.mcp.json`)
- `--scope local` — this project only

**Option B: Config file**

Add to `~/.claude.json` (global) or `.mcp.json` (project):

```json
{
  "mcpServers": {
    "ticktick": {
      "command": "node",
      "args": ["/absolute/path/to/ticktick-mcp-ratv/build/index.js"],
      "env": {
        "TICKTICK_CLIENT_ID": "your_client_id",
        "TICKTICK_CLIENT_SECRET": "your_client_secret",
        "TICKTICK_ACCESS_TOKEN": "your_access_token",
        "TICKTICK_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

Verify it's running with the `/mcp` command in Claude Code.

---

### Cursor

**Option A: Settings UI**

1. Open **Settings** > **Features** > **MCP**
2. Click **+ Add New MCP Server**
3. Name: `ticktick`
4. Type: `command`
5. Command: `node /absolute/path/to/ticktick-mcp-ratv/build/index.js`

**Option B: Config file**

Create or edit `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project-level):

```json
{
  "mcpServers": {
    "ticktick": {
      "command": "node",
      "args": ["/absolute/path/to/ticktick-mcp-ratv/build/index.js"],
      "env": {
        "TICKTICK_CLIENT_ID": "your_client_id",
        "TICKTICK_CLIENT_SECRET": "your_client_secret",
        "TICKTICK_ACCESS_TOKEN": "your_access_token",
        "TICKTICK_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

After saving, restart Cursor. Check the MCP indicator in the bottom bar to confirm it's connected.

---

### VS Code (GitHub Copilot Agent Mode)

Requires VS Code 1.99+ with GitHub Copilot.

**Option A: Workspace config (shareable)**

Create `.vscode/mcp.json` in your project root:

```json
{
  "servers": {
    "ticktick": {
      "command": "node",
      "args": ["/absolute/path/to/ticktick-mcp-ratv/build/index.js"],
      "env": {
        "TICKTICK_CLIENT_ID": "your_client_id",
        "TICKTICK_CLIENT_SECRET": "your_client_secret",
        "TICKTICK_ACCESS_TOKEN": "your_access_token",
        "TICKTICK_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

**Option B: User settings**

Add to your VS Code `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "ticktick": {
        "command": "node",
        "args": ["/absolute/path/to/ticktick-mcp-ratv/build/index.js"],
        "env": {
          "TICKTICK_CLIENT_ID": "your_client_id",
          "TICKTICK_CLIENT_SECRET": "your_client_secret",
          "TICKTICK_ACCESS_TOKEN": "your_access_token",
          "TICKTICK_REFRESH_TOKEN": "your_refresh_token"
        }
      }
    }
  }
}
```

---

### VS Code + Cline Extension

1. Open the **Cline** panel in VS Code
2. Click the **MCP Servers** icon (plug icon)
3. Click **Configure** to open `cline_mcp_settings.json`
4. Add:

```json
{
  "mcpServers": {
    "ticktick": {
      "command": "node",
      "args": ["/absolute/path/to/ticktick-mcp-ratv/build/index.js"],
      "env": {
        "TICKTICK_CLIENT_ID": "your_client_id",
        "TICKTICK_CLIENT_SECRET": "your_client_secret",
        "TICKTICK_ACCESS_TOKEN": "your_access_token",
        "TICKTICK_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

---

### Claude Desktop

Edit the config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%AppData%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ticktick": {
      "command": "node",
      "args": ["/absolute/path/to/ticktick-mcp-ratv/build/index.js"],
      "env": {
        "TICKTICK_CLIENT_ID": "your_client_id",
        "TICKTICK_CLIENT_SECRET": "your_client_secret",
        "TICKTICK_ACCESS_TOKEN": "your_access_token",
        "TICKTICK_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

Quit Claude Desktop completely (Cmd+Q / Alt+F4) and relaunch.

---

## Dida365 Support (滴答清单)

For users of the Chinese version, add this environment variable:

```
TICKTICK_HOST=dida365
```

This routes all API calls to `api.dida365.com` and auth calls to `dida365.com`. Everything else works identically.

---

## All Available Tools

### Project Management

| Tool | Description |
|------|-------------|
| `ticktick_get_projects` | List all projects |
| `ticktick_get_project` | Get a single project by ID |
| `ticktick_get_project_data` | Get project with all its tasks and Kanban columns |
| `ticktick_create_project` | Create a new project |
| `ticktick_update_project` | Update project name, color, view mode |
| `ticktick_delete_project` | Delete a project |

### Task Management

| Tool | Description |
|------|-------------|
| `ticktick_get_task` | Get a single task by project ID and task ID |
| `ticktick_create_task` | Create a task with title, dates, priority, subtasks, recurrence |
| `ticktick_update_task` | Update any task fields |
| `ticktick_complete_task` | Mark a task as done |
| `ticktick_delete_task` | Delete a task |
| `ticktick_batch_create_tasks` | Create multiple tasks at once |

### Smart Queries

| Tool | Description |
|------|-------------|
| `ticktick_get_all_tasks` | Get all undone tasks across all projects |
| `ticktick_search_tasks` | Full-text search across titles, content, and subtasks |
| `ticktick_get_tasks_due_today` | What's due today |
| `ticktick_get_tasks_due_tomorrow` | What's due tomorrow |
| `ticktick_get_tasks_due_this_week` | What's due in the next 7 days |
| `ticktick_get_tasks_due_in_days` | What's due in the next N days |
| `ticktick_get_overdue_tasks` | All past-due tasks |
| `ticktick_get_tasks_by_priority` | Filter by priority level |
| `ticktick_filter_tasks` | Advanced multi-criteria filtering |

### Productivity & GTD

| Tool | Description |
|------|-------------|
| `ticktick_get_engaged_tasks` | GTD "Engage" — high priority, overdue, or due today |
| `ticktick_get_next_tasks` | GTD "Next" — medium priority or due tomorrow |
| `ticktick_daily_summary` | Full daily digest with overdue, today, tomorrow, and priority breakdown |

---

## Example Conversations

Once configured, you can use natural language with your AI assistant:

**Morning planning:**
> "Give me my daily summary"
> "What tasks are overdue?"
> "What do I have due this week?"

**Task management:**
> "Create a task called 'Review PR #42' in my Work project, due tomorrow, high priority"
> "Mark the 'Send invoice' task as complete"
> "Add 5 subtasks to my 'Launch checklist' task"

**Project management:**
> "List all my projects"
> "Create a new project called 'Q2 Goals' with a kanban view"
> "Show me all tasks in my Personal project"

**Search & filter:**
> "Search for any tasks mentioning 'budget'"
> "Show me all high priority tasks"
> "What tasks are due in the next 3 days?"

**Batch operations:**
> "Create these tasks in my Work project: Review design mockups, Update API docs, Fix login bug"

---

## Task Priority Values

TickTick uses these numeric priority levels:

| Value | Label | Description |
|-------|-------|-------------|
| `0` | None | No priority set (default) |
| `1` | Low | Low priority |
| `3` | Medium | Medium priority |
| `5` | High | High priority |

---

## Date Format

TickTick uses the format `yyyy-MM-dd'T'HH:mm:ssZ` for dates. Examples:

```
2025-03-15T09:00:00+0000    (March 15, 2025 at 9:00 AM UTC)
2025-12-31T23:59:00-0500    (Dec 31, 2025 at 11:59 PM EST)
```

Your AI assistant will handle date formatting for you in most cases.

---

## Recurrence Rules

Recurring tasks use standard RRULE format:

```
RRULE:FREQ=DAILY;INTERVAL=1            (every day)
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO  (every Monday)
RRULE:FREQ=MONTHLY;INTERVAL=1          (every month)
```

---

## Architecture

```
src/
├── index.ts              # Entry point — MCP server + auth CLI routing
├── auth-cli.ts           # Interactive OAuth2 setup wizard
├── client.ts             # TickTick API HTTP client with auto token refresh
├── config.ts             # Environment variable loader
├── types.ts              # TypeScript interfaces for the API
├── auth/
│   └── oauth.ts          # OAuth2 authorization code flow
└── tools/
    ├── project-tools.ts  # 6 project management tools
    ├── task-tools.ts     # 6 task CRUD tools
    └── smart-tools.ts    # 13 smart query & productivity tools
```

Key design decisions:
- **TypeScript** — full type safety, compiles to ESM
- **Official API only** — uses the TickTick Open API v1, no unofficial/internal endpoints
- **Auto token refresh** — seamlessly refreshes expired tokens on 401 responses
- **Zero runtime config files** — all config via environment variables
- **Modular tools** — each category in its own file for easy extension

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode (rebuild on changes)
npm run dev

# Clean build output
npm run clean
```

### Adding a New Tool

1. Create your tool function in the appropriate file under `src/tools/`
2. Use `server.registerTool()` with a Zod input schema
3. The tool will be automatically available to all MCP clients

Example:

```typescript
server.registerTool(
  "ticktick_my_custom_tool",
  {
    title: "My Custom Tool",
    description: "Does something useful",
    inputSchema: {
      param: z.string().describe("A parameter"),
    },
  },
  async ({ param }) => {
    const result = await getClient().someMethod(param);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);
```

---

## Troubleshooting

### "Missing required environment variable"

You haven't completed the auth setup. Run:

```bash
node build/index.js auth
```

Or manually set the environment variables in your MCP client configuration.

### "Token refresh failed"

Your refresh token has expired. Re-run the auth flow:

```bash
node build/index.js auth
```

### Server not appearing in Claude Code

1. Make sure the path in your config is absolute (starts with `/`)
2. Run `/mcp` in Claude Code to check server status
3. Try removing and re-adding: `claude mcp remove ticktick && claude mcp add ...`

### Server not appearing in Cursor

1. Restart Cursor after editing the config
2. Check the MCP indicator in the bottom status bar
3. Open **Output** panel (Cmd+Shift+U) and select **MCP** from the dropdown

### "TickTick API error: 401"

Your access token has expired and auto-refresh failed. Re-authenticate:

```bash
node build/index.js auth
```

### Using with Node Version Managers (nvm, fnm)

If you use nvm or fnm, make sure the `node` command in your config resolves correctly. Use the full path:

```json
{
  "command": "/Users/you/.nvm/versions/node/v22.0.0/bin/node",
  "args": ["/path/to/ticktick-mcp-ratv/build/index.js"]
}
```

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run `npm run build` to ensure it compiles
5. Submit a pull request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [TickTick Open API](https://developer.ticktick.com) — Official API documentation
- [Model Context Protocol](https://modelcontextprotocol.io) — The MCP specification
- Inspired by [jacepark12/ticktick-mcp](https://github.com/jacepark12/ticktick-mcp) and [jen6/ticktick-mcp](https://github.com/jen6/ticktick-mcp)
