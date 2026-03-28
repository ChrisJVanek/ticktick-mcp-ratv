# TickTick MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)
[![Node](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org)

An [MCP](https://modelcontextprotocol.io) server that lets your AI assistant manage your [TickTick](https://ticktick.com) tasks, projects, habits, and more through natural language. Works with **Claude Code**, **Cursor**, **VS Code**, **Claude Desktop**, and any MCP-compatible client.

Also supports **Dida365** (the Chinese version of TickTick).

---

## Features

**44 tools** across two API layers:

| Category | Tools | API |
|----------|-------|-----|
| **Projects** | List, create, update, delete | V1 |
| **Tasks** | CRUD, batch create, complete, subtasks | V1 |
| **Smart Queries** | Due today/tomorrow/this week, overdue, by priority | V1 |
| **Search & Filter** | Full-text search, multi-criteria filtering | V1 |
| **GTD Workflows** | Engaged tasks, next actions, daily digest | V1 |
| **Tags** | List, create, rename, delete, merge | V2 |
| **Habits** | Create, check-in, view streaks and history | V2 |
| **Focus / Pomodoro** | Heatmaps, time distribution, productivity score | V2 |
| **Completed Tasks** | Browse finished tasks with date filtering | V2 |
| **Kanban Columns** | Manage columns in kanban projects | V2 |
| **Project Folders** | Organize projects into groups | V2 |
| **Task Organization** | Move tasks between projects, subtask hierarchy | V2 |
| **User Profile** | Profile info, timezone, settings | V2 |

> **V1** = Official TickTick Open API (OAuth2). **V2** = Internal API (session auth) for features not in the public API.

---

## Setup

### 1. Create a TickTick Developer App

1. Go to [developer.ticktick.com/manage](https://developer.ticktick.com/manage)
2. Click **+ Create App**
3. Set **Redirect URI** to: `http://localhost:42813/callback`
4. Note your **Client ID** and **Client Secret**

### 2. Install and Authenticate

```bash
git clone https://github.com/chrisvanek/ticktick-mcp-ratv.git
cd ticktick-mcp-ratv
npm install && npm run build

# Run the interactive setup wizard
node build/index.js auth
```

The wizard guides you through:
1. **TickTick login** (email + password) — enables V2 features (tags, habits, focus, completed tasks)
2. **OAuth2 flow** (Client ID + Secret + browser auth) — enables V1 features (projects, tasks)

Credentials are saved to a local `.env` file (excluded from git).

### 3. Connect to Your AI Client

Add the server to your MCP client config. Replace the placeholder values with the credentials from your `.env` file.

<details>
<summary><strong>Claude Code</strong></summary>

**CLI (recommended):**

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

Use `-s user` (available everywhere), `-s project` (shared with team), or `-s local` (single project).

**Config file** (`~/.claude.json` or `.mcp.json`):

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

Verify with `/mcp` in Claude Code.

</details>

<details>
<summary><strong>Cursor</strong></summary>

Create or edit `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

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

Restart Cursor after saving.

</details>

<details>
<summary><strong>VS Code (Copilot Agent Mode)</strong></summary>

Requires VS Code 1.99+ with GitHub Copilot. Create `.vscode/mcp.json`:

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

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

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

Quit and relaunch Claude Desktop (Cmd+Q / Alt+F4).

</details>

<details>
<summary><strong>Cline (VS Code extension)</strong></summary>

Open the Cline panel > MCP Servers icon > Configure, then add:

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

</details>

### Dida365 (China)

Add `TICKTICK_HOST=dida365` to your environment variables. This routes API calls to `api.dida365.com`.

### Node Version Managers (nvm, fnm, etc.)

If `node` doesn't resolve in your MCP client, use the full path:

```json
"command": "/Users/you/.nvm/versions/node/v22.0.0/bin/node"
```

---

## Usage Examples

Once connected, just talk naturally. Here are examples organized by what you can do:

### Morning Planning

> "Give me my daily summary"

> "What's overdue?"

> "What do I have due this week?"

> "Show me all high priority tasks"

### Creating Tasks

> "Create a task called 'Review PR #42' in my Work project, due tomorrow, high priority"

> "Add a task 'Buy groceries' to Personal with subtasks: milk, eggs, bread, butter"

> "Create a recurring task 'Weekly standup notes' every Monday in my Work project"

> "Create these tasks in my Work project: Review design mockups, Update API docs, Fix login bug"

### Managing Tasks

> "Mark the 'Send invoice' task as complete"

> "Move 'Design review' to my Work project"

> "Make 'Write tests' a subtask of 'Ship v2'"

> "What tasks did I complete last week?"

### Search & Filter

> "Search for any tasks mentioning 'budget'"

> "Show me all medium priority tasks"

> "What tasks are due in the next 3 days?"

> "Show me all tasks in my Personal project that have a due date"

### Projects

> "List all my projects"

> "Create a new project called 'Q2 Goals' with a kanban view"

> "Show me everything in my Work project — tasks, columns, the works"

### Tags

> "Show me all my tags"

> "Create a tag called 'urgent' with a red color"

> "Rename the 'bug' tag to 'bugfix'"

> "Merge the 'todo' tag into 'backlog'"

### Habits

> "What habits do I have?"

> "Check in my 'Drink water' habit for today"

> "Create a habit called 'Read' with a goal of 30 pages per day"

> "Show my check-in history for all habits since January"

### Focus & Productivity

> "Show my focus time heatmap for this month"

> "How is my focus time distributed across tags?"

> "What are my productivity stats?"

### Organization

> "List my project folders"

> "Create a folder called 'Side Projects'"

> "Show the kanban columns in my Sprint project"

> "What's in my trash?"

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TICKTICK_CLIENT_ID` | Yes | OAuth2 Client ID from developer portal |
| `TICKTICK_CLIENT_SECRET` | Yes | OAuth2 Client Secret |
| `TICKTICK_ACCESS_TOKEN` | Yes | OAuth2 access token (set by auth wizard) |
| `TICKTICK_REFRESH_TOKEN` | No | OAuth2 refresh token (enables auto-renewal) |
| `TICKTICK_USERNAME` | Yes | Your TickTick email (for V2 API) |
| `TICKTICK_PASSWORD` | Yes | Your TickTick password (for V2 API) |
| `TICKTICK_HOST` | No | `ticktick` (default) or `dida365` for China |

> **Security note:** The V2 API requires your TickTick username and password. These are stored as environment variables and never logged or transmitted anywhere except directly to TickTick's authentication endpoint. The `.env` file is created with restricted permissions (owner-only read/write).

---

## All 44 Tools

<details>
<summary><strong>Project Management</strong> (6 tools, V1)</summary>

| Tool | Description |
|------|-------------|
| `ticktick_get_projects` | List all projects |
| `ticktick_get_project` | Get a project by ID |
| `ticktick_get_project_data` | Get project with tasks and columns |
| `ticktick_create_project` | Create a project |
| `ticktick_update_project` | Update project properties |
| `ticktick_delete_project` | Delete a project |

</details>

<details>
<summary><strong>Task Management</strong> (6 tools, V1)</summary>

| Tool | Description |
|------|-------------|
| `ticktick_get_task` | Get a task by ID |
| `ticktick_create_task` | Create a task with all options |
| `ticktick_update_task` | Update task fields |
| `ticktick_complete_task` | Mark a task as done |
| `ticktick_delete_task` | Delete a task |
| `ticktick_batch_create_tasks` | Create multiple tasks at once |

</details>

<details>
<summary><strong>Smart Queries & GTD</strong> (13 tools, V1)</summary>

| Tool | Description |
|------|-------------|
| `ticktick_get_all_tasks` | All undone tasks across all projects |
| `ticktick_search_tasks` | Full-text search |
| `ticktick_get_tasks_due_today` | Tasks due today |
| `ticktick_get_tasks_due_tomorrow` | Tasks due tomorrow |
| `ticktick_get_tasks_due_this_week` | Tasks due in 7 days |
| `ticktick_get_tasks_due_in_days` | Tasks due in N days |
| `ticktick_get_overdue_tasks` | Overdue tasks |
| `ticktick_get_tasks_by_priority` | Filter by priority |
| `ticktick_filter_tasks` | Advanced multi-criteria filter |
| `ticktick_get_engaged_tasks` | GTD "Engage" list |
| `ticktick_get_next_tasks` | GTD "Next" list |
| `ticktick_daily_summary` | Full daily digest |

</details>

<details>
<summary><strong>Tags</strong> (5 tools, V2)</summary>

| Tool | Description |
|------|-------------|
| `ticktick_get_tags` | List all tags |
| `ticktick_create_tag` | Create a tag |
| `ticktick_rename_tag` | Rename a tag |
| `ticktick_delete_tag` | Delete a tag |
| `ticktick_merge_tags` | Merge one tag into another |

</details>

<details>
<summary><strong>Habits</strong> (6 tools, V2)</summary>

| Tool | Description |
|------|-------------|
| `ticktick_get_habits` | List all habits |
| `ticktick_get_habit_sections` | Get habit sections |
| `ticktick_create_habit` | Create a habit |
| `ticktick_delete_habit` | Delete a habit |
| `ticktick_checkin_habit` | Check in to a habit |
| `ticktick_get_habit_checkins` | View check-in history |

</details>

<details>
<summary><strong>Focus / Pomodoro</strong> (3 tools, V2)</summary>

| Tool | Description |
|------|-------------|
| `ticktick_get_focus_heatmap` | Focus time heatmap |
| `ticktick_get_focus_distribution` | Focus distribution by category |
| `ticktick_get_productivity_stats` | Productivity score and stats |

</details>

<details>
<summary><strong>Completed & Trashed Tasks</strong> (2 tools, V2)</summary>

| Tool | Description |
|------|-------------|
| `ticktick_get_completed_tasks` | Browse completed tasks |
| `ticktick_get_trashed_tasks` | View deleted tasks |

</details>

<details>
<summary><strong>Task Organization</strong> (2 tools, V2)</summary>

| Tool | Description |
|------|-------------|
| `ticktick_move_task` | Move task to a different project |
| `ticktick_set_task_parent` | Set/remove subtask relationship |

</details>

<details>
<summary><strong>Kanban & Folders</strong> (6 tools, V2)</summary>

| Tool | Description |
|------|-------------|
| `ticktick_get_columns` | List kanban columns |
| `ticktick_create_column` | Create a column |
| `ticktick_delete_column` | Delete a column |
| `ticktick_get_project_folders` | List project folders |
| `ticktick_create_project_folder` | Create a folder |
| `ticktick_delete_project_folder` | Delete a folder |

</details>

<details>
<summary><strong>User & Settings</strong> (2 tools, V2)</summary>

| Tool | Description |
|------|-------------|
| `ticktick_get_user_profile` | Profile, email, timezone, subscription |
| `ticktick_get_user_settings` | Account preferences |

</details>

---

## Reference

**Task priority values:** `0` = None, `1` = Low, `3` = Medium, `5` = High

**Date format:** `yyyy-MM-dd'T'HH:mm:ssZ` (e.g. `2025-03-15T09:00:00+0000`)

**Recurrence rules:** Standard RRULE format (e.g. `RRULE:FREQ=DAILY;INTERVAL=1`)

---

## Development

```bash
npm install       # Install dependencies
npm run build     # Compile TypeScript
npm run dev       # Watch mode
npm run clean     # Remove build output
```

### Adding a Tool

1. Add your tool in the appropriate file under `src/tools/`
2. Use `server.registerTool()` with a Zod input schema
3. It's automatically available to all MCP clients

### Architecture

```
src/
├── index.ts              # Entry point + auth CLI routing
├── config.ts             # Environment variable loader
├── client.ts             # V1 API client (OAuth2)
├── client-v2.ts          # V2 API client (session auth)
├── types.ts              # TypeScript interfaces
├── auth-cli.ts           # Interactive auth wizard
├── auth/oauth.ts         # OAuth2 flow implementation
└── tools/
    ├── project-tools.ts  # Project CRUD (V1)
    ├── task-tools.ts     # Task CRUD (V1)
    ├── smart-tools.ts    # Smart queries & GTD (V1)
    ├── tag-tools.ts      # Tag management (V2)
    ├── habit-tools.ts    # Habit tracking (V2)
    ├── focus-tools.ts    # Focus/Pomodoro stats (V2)
    ├── column-tools.ts   # Kanban columns (V2)
    ├── folder-tools.ts   # Project folders (V2)
    └── v2-task-tools.ts  # Completed tasks, move, user (V2)
```

Both API clients handle auth transparently — expired tokens are refreshed automatically on 401 responses.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Missing required environment variable" | Run `node build/index.js auth` or set vars in your MCP config |
| "Token refresh failed" / 401 errors | Re-run `node build/index.js auth` |
| Server not showing in Claude Code | Use absolute paths, check with `/mcp`, try `claude mcp remove` + `add` |
| Server not showing in Cursor | Restart Cursor, check Output panel > MCP |

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes and run `npm run build`
4. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [TickTick Open API](https://developer.ticktick.com)
- [Model Context Protocol](https://modelcontextprotocol.io)
- Inspired by [jacepark12/ticktick-mcp](https://github.com/jacepark12/ticktick-mcp) and [jen6/ticktick-mcp](https://github.com/jen6/ticktick-mcp)
