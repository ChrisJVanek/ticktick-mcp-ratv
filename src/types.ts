/**
 * TickTick API type definitions based on the official Open API v1.
 * https://developer.ticktick.com/docs/index.html#/openapi
 */

// ---------------------------------------------------------------------------
// Checklist Item (Subtask)
// ---------------------------------------------------------------------------
export interface ChecklistItem {
  id?: string;
  title: string;
  status?: number; // 0 = Normal, 1 = Completed
  completedTime?: string; // yyyy-MM-dd'T'HH:mm:ssZ
  isAllDay?: boolean;
  sortOrder?: number;
  startDate?: string;
  timeZone?: string;
}

// ---------------------------------------------------------------------------
// Task
// ---------------------------------------------------------------------------
export interface Task {
  id: string;
  projectId: string;
  title: string;
  content?: string;
  desc?: string;
  isAllDay?: boolean;
  startDate?: string;
  dueDate?: string;
  timeZone?: string;
  reminders?: string[];
  repeatFlag?: string;
  priority?: number; // 0 = None, 1 = Low, 3 = Medium, 5 = High
  sortOrder?: number;
  status?: number; // 0 = Normal, 2 = Completed
  completedTime?: string;
  items?: ChecklistItem[];
  kind?: string;
}

export interface CreateTaskInput {
  title: string;
  projectId: string;
  content?: string;
  desc?: string;
  isAllDay?: boolean;
  startDate?: string;
  dueDate?: string;
  timeZone?: string;
  reminders?: string[];
  repeatFlag?: string;
  priority?: number;
  sortOrder?: number;
  items?: ChecklistItem[];
}

export interface UpdateTaskInput {
  id: string;
  projectId: string;
  title?: string;
  content?: string;
  desc?: string;
  isAllDay?: boolean;
  startDate?: string;
  dueDate?: string;
  timeZone?: string;
  reminders?: string[];
  repeatFlag?: string;
  priority?: number;
  sortOrder?: number;
  items?: ChecklistItem[];
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------
export interface Project {
  id: string;
  name: string;
  color?: string;
  sortOrder?: number;
  closed?: boolean;
  groupId?: string;
  viewMode?: string; // "list" | "kanban" | "timeline"
  permission?: string; // "read" | "write" | "comment"
  kind?: string; // "TASK" | "NOTE"
}

export interface CreateProjectInput {
  name: string;
  color?: string;
  sortOrder?: number;
  viewMode?: string;
  kind?: string;
}

export interface UpdateProjectInput {
  name?: string;
  color?: string;
  sortOrder?: number;
  viewMode?: string;
  kind?: string;
}

// ---------------------------------------------------------------------------
// Column (Kanban)
// ---------------------------------------------------------------------------
export interface Column {
  id: string;
  projectId: string;
  name: string;
  sortOrder?: number;
}

// ---------------------------------------------------------------------------
// ProjectData (composite response from /project/{id}/data)
// ---------------------------------------------------------------------------
export interface ProjectData {
  project: Project;
  tasks: Task[];
  columns: Column[];
}

// ---------------------------------------------------------------------------
// OAuth tokens
// ---------------------------------------------------------------------------
export interface TokenData {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
export type TickTickHost = "ticktick" | "dida365";

export interface ServerConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken?: string;
  host: TickTickHost;
}
