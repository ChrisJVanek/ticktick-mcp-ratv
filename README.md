# TickTick MCP Server

> **Talk to your TickTick.** Manage tasks, projects, habits, focus sessions, and more — all through natural language in your favorite AI coding assistant.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that connects your AI assistant to [TickTick](https://ticktick.com). Works out of the box with **Claude Code**, **Cursor**, **VS Code**, **Claude Desktop**, and any MCP-compatible client.

Also supports **Dida365** (滴答清单), the Chinese version of TickTick.

---

## What Can It Do?

**44 tools** across two API layers — the most comprehensive TickTick MCP server available:

| Category | What You Get | API |
|----------|-------------|-----|
| **Projects** | List, get, create, update, delete projects | V1 |
| **Tasks** | Full CRUD — create, update, complete, delete, batch create | V1 |
| **Smart Queries** | "What's due today?" "What's overdue?" "Due this week?" | V1 |
| **Search & Filter** | Full-text search, advanced multi-criteria filtering | V1 |
| **GTD Workflows** | Engaged tasks, next actions (Getting Things Done methodology) | V1 |
| **Daily Digest** | Morning planning summary with priorities and deadlines | V1 |
| **Tags** | List, create, rename, delete, merge tags | V2 |
| **Habits** | Track habits — create, check-in, view streaks and history | V2 |
| **Focus / Pomodoro** | Focus heatmaps, time distribution, productivity scores | V2 |
| **Completed Tasks** | Browse your finished work with date filtering | V2 |
| **Kanban Columns** | Manage columns in kanban-style projects | V2 |
| **Project Folders** | Organize projects into groups | V2 |
| **Task Hierarchy** | Move tasks between projects, create subtask relationships | V2 |
| **User Profile** | Profile info, timezone, subscription, account settings | V2 |
| **Trashed Tasks** | View and recover deleted tasks | V2 |

> **V1** = Official TickTick Open API (OAuth2) &bull; **V2** = Internal TickTick API (session auth) for features not yet in the public API.

---

## Quick Start

Getting set up takes about 5 minutes.

### Step 1: Create a TickTick Developer App

1. Head to [developer.ticktick.com/manage](https://developer.ticktick.com/manage)
2. Click **+ Create App**
3. Set the **Redirect URI** to: `http://localhost:42813/callback`
4. Save your **Client ID** and **Client Secret** somewhere handy

### Step 2: Install & Authenticate

```bash
git clone https://github.com/chrisvanek/ticktick-mcp-ratv.git
cd ticktick-mcp-ratv
npm install
npm run build

# Run the setup wizard
node build/index.js auth
```

The wizard walks you through two auth steps:

1. **TickTick login** (email + password) — unlocks V2 features like tags, habits, focus, and completed tasks
2. **OAuth2** (Client ID + Secret + browser authorization) — powers V1 features like projects and task CRUD

Everything gets saved to a `.env` file automatically. You're done!

### Step 3: Connect to Your AI Client

Pick your editor below and follow the guide.

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
  -e TICKTICK_USERNAME=your_email \
  -e TICKTICK_PASSWORD=your_password \
  -s user
```

> **Tip:** Use `--scope user` to make it available everywhere, `--scope project` to share with your team, or `--scope local` for just one project.

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
        "TICKTICK_REFRESH_TOKEN": "your_refresh_token",
        "TICKTICK_USERNAME": "your_email",
        "TICKTICK_PASSWORD": "your_password"
      }
    }
  }
}
```

Run `/mcp` in Claude Code to verify it's connected.

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
        "TICKTICK_REFRESH_TOKEN": "your_refresh_token",
        "TICKTICK_USERNAME": "your_email",
        "TICKTICK_PASSWORD": "your_password"
      }
    }
  }
}
```

Restart Cursor after saving. You'll see the MCP indicator light up in the bottom bar.

---

### VS Code (GitHub Copilot Agent Mode)

Requires VS Code 1.99+ with GitHub Copilot.

**Option A: Workspace config (shareable with your team)**

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
        "TICKTICK_REFRESH_TOKEN": "your_refresh_token",
        "TICKTICK_USERNAME": "your_email",
        "TICKTICK_PASSWORD": "your_password"
      }
    }
  }
}
```

**Option B: User settings (just for you)**

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
          "TICKTICK_REFRESH_TOKEN": "your_refresh_token",
          "TICKTICK_USERNAME": "your_email",
          "TICKTICK_PASSWORD": "your_password"
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
        "TICKTICK_REFRESH_TOKEN": "your_refresh_token",
        "TICKTICK_USERNAME": "your_email",
        "TICKTICK_PASSWORD": "your_password"
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
        "TICKTICK_REFRESH_TOKEN": "your_refresh_token",
        "TICKTICK_USERNAME": "your_email",
        "TICKTICK_PASSWORD": "your_password"
      }
    }
  }
}
```

Quit Claude Desktop completely (Cmd+Q / Alt+F4) and relaunch.

---

## Dida365 Support (滴答清单)

Using the Chinese version? Just add one extra environment variable:

```
TICKTICK_HOST=dida365
```

This routes all API calls to `api.dida365.com` instead of `api.ticktick.com`. Everything else works the same.

---

## All 44 Tools

### Project Management (V1)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_projects` | List all your projects |
| `ticktick_get_project` | Get a single project by ID |
| `ticktick_get_project_data` | Get a project with all its tasks and columns |
| `ticktick_create_project` | Create a new project |
| `ticktick_update_project` | Update project name, color, or view mode |
| `ticktick_delete_project` | Delete a project |

### Task Management (V1)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_task` | Get a task by project ID and task ID |
| `ticktick_create_task` | Create a task with title, dates, priority, subtasks, recurrence |
| `ticktick_update_task` | Update any task fields |
| `ticktick_complete_task` | Mark a task as done |
| `ticktick_delete_task` | Delete a task |
| `ticktick_batch_create_tasks` | Create multiple tasks at once |

### Smart Queries (V1)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_all_tasks` | Get every undone task across all projects |
| `ticktick_search_tasks` | Full-text search across titles, content, and subtasks |
| `ticktick_get_tasks_due_today` | What's due today |
| `ticktick_get_tasks_due_tomorrow` | What's due tomorrow |
| `ticktick_get_tasks_due_this_week` | What's due in the next 7 days |
| `ticktick_get_tasks_due_in_days` | What's due in the next N days |
| `ticktick_get_overdue_tasks` | Everything that's past due |
| `ticktick_get_tasks_by_priority` | Filter by priority level |
| `ticktick_filter_tasks` | Advanced multi-criteria filtering |

### Productivity & GTD (V1)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_engaged_tasks` | GTD "Engage" — high priority, overdue, or due today |
| `ticktick_get_next_tasks` | GTD "Next" — medium priority or due tomorrow |
| `ticktick_daily_summary` | Full daily digest: overdue, today, tomorrow, priority breakdown |

### Tags (V2)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_tags` | List all your tags with colors |
| `ticktick_create_tag` | Create a new tag |
| `ticktick_rename_tag` | Rename a tag (updates all tagged tasks automatically) |
| `ticktick_delete_tag` | Delete a tag |
| `ticktick_merge_tags` | Merge one tag into another |

### Habits (V2)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_habits` | List all your habits |
| `ticktick_get_habit_sections` | Get sections (Morning / Afternoon / Evening) |
| `ticktick_create_habit` | Create a habit with goal, unit, and frequency |
| `ticktick_delete_habit` | Delete a habit |
| `ticktick_checkin_habit` | Record a check-in for today |
| `ticktick_get_habit_checkins` | View check-in history |

### Focus / Pomodoro (V2)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_focus_heatmap` | Focus time heatmap over a date range |
| `ticktick_get_focus_distribution` | Focus time breakdown by tag/category |
| `ticktick_get_productivity_stats` | Your overall productivity score and stats |

### Completed & Trashed Tasks (V2)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_completed_tasks` | Browse completed tasks with date range filter |
| `ticktick_get_trashed_tasks` | View deleted tasks (handy for recovery) |

### Task Organization (V2)

| Tool | What It Does |
|------|-------------|
| `ticktick_move_task` | Move a task to a different project |
| `ticktick_set_task_parent` | Make a task a subtask of another (or remove the parent) |

### Kanban Columns (V2)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_columns` | List columns in a kanban project |
| `ticktick_create_column` | Add a new column |
| `ticktick_delete_column` | Delete a column |

### Project Folders (V2)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_project_folders` | List all project folders/groups |
| `ticktick_create_project_folder` | Create a folder to organize projects |
| `ticktick_delete_project_folder` | Delete a project folder |

### User & Settings (V2)

| Tool | What It Does |
|------|-------------|
| `ticktick_get_user_profile` | Your profile, email, timezone, subscription status |
| `ticktick_get_user_settings` | Account preferences and settings |

---

## Try It Out

Once you're connected, just talk naturally. Here are some ideas:

**Start your morning:**
> "Give me my daily summary"
> "What's overdue?"
> "What do I have due this week?"

**Manage tasks:**
> "Create a task called 'Review PR #42' in my Work project, due tomorrow, high priority"
> "Mark the 'Send invoice' task as complete"
> "Add 5 subtasks to my 'Launch checklist' task"

**Work with projects:**
> "List all my projects"
> "Create a new project called 'Q2 Goals' with a kanban view"
> "Show me all tasks in my Personal project"

**Search and filter:**
> "Search for any tasks mentioning 'budget'"
> "Show me all high priority tasks"
> "What tasks are due in the next 3 days?"

**Batch operations:**
> "Create these tasks in my Work project: Review design mockups, Update API docs, Fix login bug"

**Tags:**
> "Show me all my tags"
> "Create a tag called 'urgent' with a red color"
> "Merge the 'bug' tag into 'bugfix'"

**Habits and focus:**
> "What habits do I have?"
> "Check in my 'Drink water' habit for today"
> "Show my focus time heatmap for this month"
> "What are my productivity stats?"

**Completed and trashed tasks:**
> "Show me tasks I completed last week"
> "What's in my trash?"

**Organization:**
> "Move the 'Design review' task to my Work project"
> "Make 'Write tests' a subtask of 'Ship v2'"
> "List my project folders"

---

## Reference

### Task Priority Values

TickTick uses these numeric priority levels:

| Value | Label | Description |
|-------|-------|-------------|
| `0` | None | No priority (default) |
| `1` | Low | Low priority |
| `3` | Medium | Medium priority |
| `5` | High | High priority |

### Date Format

TickTick dates use ISO format: `yyyy-MM-dd'T'HH:mm:ssZ`

```
2025-03-15T09:00:00+0000    (March 15, 2025 at 9:00 AM UTC)
2025-12-31T23:59:00-0500    (Dec 31, 2025 at 11:59 PM EST)
```

Don't worry about this — your AI assistant handles date formatting for you.

### Recurrence Rules

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
├── auth-cli.ts           # Interactive dual-auth setup wizard
├── client.ts             # V1 API client (OAuth2, auto token refresh)
├── client-v2.ts          # V2 API client (session auth, auto re-login)
├── config.ts             # Environment variable loader
├── types.ts              # TypeScript interfaces for both APIs
├── auth/
│   └── oauth.ts          # OAuth2 authorization code flow
└── tools/
    ├── project-tools.ts  # 6 project management tools (V1)
    ├── task-tools.ts     # 6 task CRUD tools (V1)
    ├── smart-tools.ts    # 13 smart query & productivity tools (V1)
    ├── tag-tools.ts      # 5 tag management tools (V2)
    ├── habit-tools.ts    # 6 habit tracking tools (V2)
    ├── focus-tools.ts    # 3 focus/pomodoro tools (V2)
    ├── column-tools.ts   # 3 kanban column tools (V2)
    ├── folder-tools.ts   # 3 project folder tools (V2)
    └── v2-task-tools.ts  # 6 completed tasks, trash, move, user (V2)
```

### How It Works

This server talks to TickTick through **two API layers**:

- **V1 (Official Open API)** — Stable, documented endpoints for projects and task CRUD. Uses OAuth2 with automatic token refresh.
- **V2 (Internal API)** — Undocumented endpoints that power TickTick's web app. Gives access to tags, habits, focus stats, completed tasks, and more. Uses session-based auth with automatic re-login.

Both clients handle auth transparently — if a token expires mid-session, it refreshes automatically. You never have to think about it.

### Design Principles

- **TypeScript** — Full type safety, compiles to ESM
- **Dual API coverage** — V1 for stability + V2 for completeness
- **Auto-healing auth** — Both clients auto-refresh on 401 errors
- **Zero config files** — Everything via environment variables
- **Modular** — Each tool category lives in its own file

---

## Development

```bash
npm install       # Install dependencies
npm run build     # Build
npm run dev       # Watch mode (rebuild on changes)
npm run clean     # Clean build output
```

### Want to Add a Tool?

1. Create your tool function in the right file under `src/tools/`
2. Use `server.registerTool()` with a Zod input schema
3. That's it — it's automatically available to all MCP clients

Here's a quick example:

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

The auth setup isn't complete. Run the wizard:

```bash
node build/index.js auth
```

Or set the environment variables manually in your MCP client config.

### "Token refresh failed"

Your refresh token expired. Just re-run auth:

```bash
node build/index.js auth
```

### "TickTick API error: 401"

Your access token expired and auto-refresh couldn't fix it. Re-authenticate:

```bash
node build/index.js auth
```

### Server not showing up in Claude Code

1. Make sure the path is absolute (starts with `/`)
2. Run `/mcp` in Claude Code to check status
3. Try removing and re-adding: `claude mcp remove ticktick-mcp-server && claude mcp add ...`

### Server not showing up in Cursor

1. Restart Cursor after editing the config
2. Check the MCP indicator in the bottom status bar
3. Open **Output** panel (Cmd+Shift+U) and select **MCP** from the dropdown

### Using nvm, fnm, or other Node version managers?

Make sure the `node` command resolves correctly. Use the full path:

```json
{
  "command": "/Users/you/.nvm/versions/node/v22.0.0/bin/node",
  "args": ["/path/to/ticktick-mcp-ratv/build/index.js"]
}
```

---

## Contributing

Contributions are welcome! Here's how:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run `npm run build` to make sure everything compiles
5. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [TickTick Open API](https://developer.ticktick.com) — Official API documentation
- [Model Context Protocol](https://modelcontextprotocol.io) — The MCP specification
- Inspired by [jacepark12/ticktick-mcp](https://github.com/jacepark12/ticktick-mcp) and [jen6/ticktick-mcp](https://github.com/jen6/ticktick-mcp)
