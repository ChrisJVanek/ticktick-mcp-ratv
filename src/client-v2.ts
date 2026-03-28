/**
 * TickTick V2 (internal) API client.
 *
 * Uses session-based authentication (username/password) to access
 * undocumented endpoints that the official Open API doesn't expose:
 * tags, habits, focus/pomodoro, completed tasks, project folders,
 * kanban columns, subtask hierarchies, and batch operations.
 */

import type {
  Tag,
  Habit,
  HabitCheckin,
  HabitSection,
  FocusRecord,
  FocusDistribution,
  ProductivityStats,
  UserProfile,
  ProjectGroup,
  Column,
  Task,
  BatchCheckResponse,
  SessionLoginResponse,
  TickTickHost,
} from "./types.js";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/** Ensure a value is safe to interpolate into a URL path segment. */
function validatePathSegment(value: string, name: string): string {
  if (!value || /[\/\\?#]/.test(value)) {
    throw new Error(`Invalid ${name}: must not be empty or contain path separators`);
  }
  return encodeURIComponent(value);
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

function v2BaseUrl(host: TickTickHost): string {
  return host === "dida365"
    ? "https://api.dida365.com/api/v2"
    : "https://api.ticktick.com/api/v2";
}

function signonUrl(host: TickTickHost): string {
  return host === "dida365"
    ? "https://api.dida365.com/api/v2/user/signon?wc=true&remember=true"
    : "https://api.ticktick.com/api/v2/user/signon?wc=true&remember=true";
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class TickTickV2Client {
  private sessionToken: string | undefined;
  private username: string;
  private password: string;
  private host: TickTickHost;
  private api: string;

  constructor(opts: {
    username: string;
    password: string;
    host?: TickTickHost;
  }) {
    this.username = opts.username;
    this.password = opts.password;
    this.host = opts.host ?? "ticktick";
    this.api = v2BaseUrl(this.host);
  }

  // -------------------------------------------------------------------------
  // Session auth
  // -------------------------------------------------------------------------

  private async ensureSession(): Promise<void> {
    if (this.sessionToken) return;
    await this.login();
  }

  private async login(): Promise<void> {
    const res = await fetch(signonUrl(this.host), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `V2 login failed: ${res.status} ${res.statusText} – ${text}\n` +
          "Check your TICKTICK_USERNAME and TICKTICK_PASSWORD.",
      );
    }

    const data = (await res.json()) as SessionLoginResponse;
    this.sessionToken = data.token;
  }

  // -------------------------------------------------------------------------
  // Internal HTTP
  // -------------------------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    retried = false,
  ): Promise<T> {
    await this.ensureSession();

    const url = `${this.api}${path}`;
    const headers: Record<string, string> = {
      Cookie: `t=${this.sessionToken}`,
      "Content-Type": "application/json",
      "x-device": '{"platform":"web","os":"macOS","device":"Chrome","name":"","version":6100,"id":"","channel":"website","campaign":"","websocket":""}',
    };

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Re-auth on 401
    if (res.status === 401 && !retried) {
      this.sessionToken = undefined;
      await this.login();
      return this.request<T>(method, path, body, true);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `TickTick V2 API error: ${res.status} ${res.statusText} – ${text}`,
      );
    }

    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  // -------------------------------------------------------------------------
  // Batch sync — full account state
  // -------------------------------------------------------------------------

  /** GET /batch/check/0 — Full account sync. Returns projects, tags, tasks, etc. */
  async batchCheck(): Promise<BatchCheckResponse> {
    return this.request<BatchCheckResponse>("GET", "/batch/check/0");
  }

  // -------------------------------------------------------------------------
  // Tags
  // -------------------------------------------------------------------------

  /** Get all tags (from batch check response). */
  async getTags(): Promise<Tag[]> {
    const data = await this.batchCheck();
    return data.tags ?? [];
  }

  /** Create or update a tag. */
  async createTag(tag: { name: string; color?: string; sortOrder?: number }): Promise<unknown> {
    return this.request("POST", "/batch/tag", {
      add: [{ ...tag, label: tag.name }],
      update: [],
      delete: [],
    });
  }

  /** Rename a tag. */
  async renameTag(oldName: string, newName: string): Promise<unknown> {
    return this.request("PUT", "/tag/rename", {
      name: oldName,
      newName: newName,
    });
  }

  /** Delete a tag. */
  async deleteTag(name: string): Promise<unknown> {
    const safeName = validatePathSegment(name, "tagName");
    return this.request("DELETE", `/tag/${safeName}`);
  }

  /** Merge two tags. */
  async mergeTags(fromTag: string, toTag: string): Promise<unknown> {
    return this.request("PUT", "/tag/merge", {
      fromTag,
      toTag,
    });
  }

  // -------------------------------------------------------------------------
  // Completed tasks
  // -------------------------------------------------------------------------

  /** Get completed tasks across all projects. */
  async getCompletedTasks(opts?: {
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (opts?.from) params.set("from", opts.from);
    if (opts?.to) params.set("to", opts.to);
    if (opts?.limit) params.set("limit", String(opts.limit));

    const qs = params.toString();
    const path = `/project/all/completed${qs ? `?${qs}` : ""}`;
    return this.request<Task[]>("GET", path);
  }

  /** Get trashed/deleted tasks. */
  async getTrashedTasks(opts?: {
    start?: number;
    limit?: number;
  }): Promise<{ tasks?: Task[]; total?: number }> {
    const params = new URLSearchParams();
    if (opts?.start !== undefined) params.set("start", String(opts.start));
    if (opts?.limit) params.set("limit", String(opts.limit));

    const qs = params.toString();
    const path = `/project/all/trash/pagination${qs ? `?${qs}` : ""}`;
    return this.request("GET", path);
  }

  // -------------------------------------------------------------------------
  // Move tasks / subtask hierarchy
  // -------------------------------------------------------------------------

  /** Move a task to a different project. */
  async moveTask(taskId: string, fromProjectId: string, toProjectId: string): Promise<unknown> {
    return this.request("POST", "/batch/taskProject", [
      {
        taskId,
        fromProjectId,
        toProjectId,
      },
    ]);
  }

  /** Set a task's parent (make it a subtask). */
  async setTaskParent(taskId: string, projectId: string, parentId: string | null): Promise<unknown> {
    return this.request("POST", "/batch/taskParent", [
      {
        taskId,
        projectId,
        parentId: parentId ?? "",
      },
    ]);
  }

  // -------------------------------------------------------------------------
  // Kanban columns
  // -------------------------------------------------------------------------

  /** Get columns for a kanban project. */
  async getColumns(projectId: string): Promise<Column[]> {
    const pid = validatePathSegment(projectId, "projectId");
    return this.request<Column[]>("GET", `/column/project/${pid}`);
  }

  /** Create a column. */
  async createColumn(projectId: string, name: string, sortOrder?: number): Promise<unknown> {
    return this.request("POST", "/column", {
      add: [{ projectId, name, sortOrder: sortOrder ?? 0 }],
      update: [],
      delete: [],
    });
  }

  /** Delete a column. */
  async deleteColumn(columnId: string, projectId: string): Promise<unknown> {
    return this.request("POST", "/column", {
      add: [],
      update: [],
      delete: [{ id: columnId, projectId }],
    });
  }

  // -------------------------------------------------------------------------
  // Project Groups (Folders)
  // -------------------------------------------------------------------------

  /** Get all project groups/folders. */
  async getProjectGroups(): Promise<ProjectGroup[]> {
    const data = await this.batchCheck();
    return data.projectGroups ?? [];
  }

  /** Create a project folder. */
  async createProjectGroup(name: string, sortOrder?: number): Promise<unknown> {
    return this.request("POST", "/batch/projectGroup", {
      add: [{ name, sortOrder: sortOrder ?? 0 }],
      update: [],
      delete: [],
    });
  }

  /** Delete a project folder. */
  async deleteProjectGroup(groupId: string): Promise<unknown> {
    return this.request("POST", "/batch/projectGroup", {
      add: [],
      update: [],
      delete: [{ id: groupId }],
    });
  }

  // -------------------------------------------------------------------------
  // Habits
  // -------------------------------------------------------------------------

  /** List all habits. */
  async getHabits(): Promise<Habit[]> {
    return this.request<Habit[]>("GET", "/habits");
  }

  /** Get habit sections (Morning, Afternoon, Evening). */
  async getHabitSections(): Promise<HabitSection[]> {
    return this.request<HabitSection[]>("GET", "/habitSections");
  }

  /** Create a new habit. */
  async createHabit(habit: {
    name: string;
    color?: string;
    goal?: number;
    step?: number;
    unit?: string;
    frequency?: string;
    repeatRule?: string;
    reminders?: string[];
    sectionId?: string;
    encouragement?: string;
  }): Promise<unknown> {
    return this.request("POST", "/habits/batch", {
      add: [habit],
      update: [],
      delete: [],
    });
  }

  /** Delete a habit. */
  async deleteHabit(habitId: string): Promise<unknown> {
    return this.request("POST", "/habits/batch", {
      add: [],
      update: [],
      delete: [habitId],
    });
  }

  /** Query habit check-in history. */
  async getHabitCheckins(habitIds: string[], afterStamp: string): Promise<HabitCheckin[]> {
    return this.request<HabitCheckin[]>("POST", "/habitCheckins/query", {
      habitIds,
      afterStamp, // yyyyMMdd format
    });
  }

  /** Check in to a habit. */
  async checkinHabit(checkin: {
    habitId: string;
    checkinStamp: string; // yyyyMMdd
    value?: number;
    status?: number;
  }): Promise<unknown> {
    return this.request("POST", "/habitCheckins/batch", {
      add: [{
        ...checkin,
        checkinTime: new Date().toISOString(),
        opTime: new Date().toISOString(),
      }],
      update: [],
      delete: [],
    });
  }

  // -------------------------------------------------------------------------
  // Focus / Pomodoro
  // -------------------------------------------------------------------------

  /** Get focus time heatmap for a date range. */
  async getFocusHeatmap(from: string, to: string): Promise<FocusRecord[]> {
    const f = validatePathSegment(from, "from");
    const t = validatePathSegment(to, "to");
    return this.request<FocusRecord[]>(
      "GET",
      `/pomodoros/statistics/heatmap/${f}/${t}`,
    );
  }

  /** Get focus time distribution by tag. */
  async getFocusDistribution(from: string, to: string): Promise<FocusDistribution[]> {
    const f = validatePathSegment(from, "from");
    const t = validatePathSegment(to, "to");
    return this.request<FocusDistribution[]>(
      "GET",
      `/pomodoros/statistics/dist/${f}/${t}`,
    );
  }

  // -------------------------------------------------------------------------
  // Productivity stats
  // -------------------------------------------------------------------------

  /** Get general productivity statistics. */
  async getProductivityStats(): Promise<ProductivityStats> {
    return this.request<ProductivityStats>("GET", "/statistics/general");
  }

  // -------------------------------------------------------------------------
  // User profile
  // -------------------------------------------------------------------------

  /** Get user profile and preferences. */
  async getUserProfile(): Promise<UserProfile> {
    return this.request<UserProfile>("GET", "/user/profile");
  }

  /** Get user settings (timezone, preferences). */
  async getUserSettings(): Promise<Record<string, unknown>> {
    return this.request("GET", "/user/preferences/settings");
  }
}
