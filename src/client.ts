/**
 * TickTick Open API HTTP client.
 *
 * Wraps all 11 official endpoints plus undocumented convenience endpoints.
 * Handles automatic token refresh on 401 responses.
 */

import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectData,
  TokenData,
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

function baseUrl(host: TickTickHost): string {
  return host === "dida365"
    ? "https://api.dida365.com/open/v1"
    : "https://api.ticktick.com/open/v1";
}

function tokenUrl(host: TickTickHost): string {
  return host === "dida365"
    ? "https://dida365.com/oauth/token"
    : "https://ticktick.com/oauth/token";
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class TickTickClient {
  private accessToken: string;
  private refreshToken: string | undefined;
  private clientId: string;
  private clientSecret: string;
  private host: TickTickHost;
  private api: string;

  constructor(opts: {
    accessToken: string;
    refreshToken?: string;
    clientId: string;
    clientSecret: string;
    host?: TickTickHost;
  }) {
    this.accessToken = opts.accessToken;
    this.refreshToken = opts.refreshToken;
    this.clientId = opts.clientId;
    this.clientSecret = opts.clientSecret;
    this.host = opts.host ?? "ticktick";
    this.api = baseUrl(this.host);
  }

  // -------------------------------------------------------------------------
  // Internal HTTP helpers
  // -------------------------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    retried = false,
  ): Promise<T> {
    const url = `${this.api}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Automatic token refresh on 401
    if (res.status === 401 && !retried && this.refreshToken) {
      await this.doRefreshToken();
      return this.request<T>(method, path, body, true);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `TickTick API error: ${res.status} ${res.statusText} – ${text}`,
      );
    }

    // Some endpoints return 200 with no body (complete, delete)
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  private async doRefreshToken(): Promise<void> {
    const url = tokenUrl(this.host);
    const basicAuth = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString("base64");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken!,
      }).toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Token refresh failed: ${res.status} ${res.statusText} – ${text}. ` +
          "Re-run the auth flow: npx ticktick-mcp-server auth",
      );
    }

    const data = (await res.json()) as TokenData;
    this.accessToken = data.access_token;
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }
  }

  // -------------------------------------------------------------------------
  // Project endpoints
  // -------------------------------------------------------------------------

  /** GET /project – List all projects */
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>("GET", "/project");
  }

  /** GET /project/{id} – Get single project */
  async getProject(projectId: string): Promise<Project> {
    const pid = validatePathSegment(projectId, "projectId");
    return this.request<Project>("GET", `/project/${pid}`);
  }

  /** GET /project/{id}/data – Get project with its undone tasks and columns */
  async getProjectData(projectId: string): Promise<ProjectData> {
    const pid = validatePathSegment(projectId, "projectId");
    return this.request<ProjectData>("GET", `/project/${pid}/data`);
  }

  /** POST /project – Create project */
  async createProject(input: CreateProjectInput): Promise<Project> {
    return this.request<Project>("POST", "/project", input);
  }

  /** POST /project/{id} – Update project */
  async updateProject(
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    const pid = validatePathSegment(projectId, "projectId");
    return this.request<Project>("POST", `/project/${pid}`, input);
  }

  /** DELETE /project/{id} – Delete project */
  async deleteProject(projectId: string): Promise<void> {
    const pid = validatePathSegment(projectId, "projectId");
    return this.request<void>("DELETE", `/project/${pid}`);
  }

  // -------------------------------------------------------------------------
  // Task endpoints
  // -------------------------------------------------------------------------

  /** GET /project/{pid}/task/{tid} – Get single task */
  async getTask(projectId: string, taskId: string): Promise<Task> {
    const pid = validatePathSegment(projectId, "projectId");
    const tid = validatePathSegment(taskId, "taskId");
    return this.request<Task>("GET", `/project/${pid}/task/${tid}`);
  }

  /** POST /task – Create task */
  async createTask(input: CreateTaskInput): Promise<Task> {
    return this.request<Task>("POST", "/task", input);
  }

  /** POST /task/{id} – Update task */
  async updateTask(input: UpdateTaskInput): Promise<Task> {
    const tid = validatePathSegment(input.id, "taskId");
    return this.request<Task>("POST", `/task/${tid}`, input);
  }

  /** POST /project/{pid}/task/{tid}/complete – Complete task */
  async completeTask(projectId: string, taskId: string): Promise<void> {
    const pid = validatePathSegment(projectId, "projectId");
    const tid = validatePathSegment(taskId, "taskId");
    return this.request<void>(
      "POST",
      `/project/${pid}/task/${tid}/complete`,
    );
  }

  /** DELETE /project/{pid}/task/{tid} – Delete task */
  async deleteTask(projectId: string, taskId: string): Promise<void> {
    const pid = validatePathSegment(projectId, "projectId");
    const tid = validatePathSegment(taskId, "taskId");
    return this.request<void>(
      "DELETE",
      `/project/${pid}/task/${tid}`,
    );
  }

  // -------------------------------------------------------------------------
  // Convenience / composite helpers
  // -------------------------------------------------------------------------

  /** Fetch ALL undone tasks across all non-closed projects. */
  async getAllTasks(): Promise<Task[]> {
    const projects = await this.getProjects();
    const active = projects.filter((p) => !p.closed);

    const results = await Promise.all(
      active.map(async (p) => {
        try {
          const data = await this.getProjectData(p.id);
          return data.tasks ?? [];
        } catch {
          // Project may have been deleted between calls
          return [];
        }
      }),
    );

    return results.flat();
  }

  /** Search tasks by text (client-side, matches title/content). */
  async searchTasks(query: string): Promise<Task[]> {
    const allTasks = await this.getAllTasks();
    const q = query.toLowerCase();
    return allTasks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.content?.toLowerCase().includes(q) ||
        t.items?.some((item) => item.title?.toLowerCase().includes(q)),
    );
  }

  /** Batch create tasks (sequential – official API has no batch endpoint). */
  async batchCreateTasks(tasks: CreateTaskInput[]): Promise<Task[]> {
    const results: Task[] = [];
    for (const task of tasks) {
      results.push(await this.createTask(task));
    }
    return results;
  }
}
