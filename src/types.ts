/**
 * TickTick API type definitions.
 *
 * Covers both the official Open API v1 and the undocumented V2 API.
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
  tags?: string[];
  pinned?: boolean;
  parentId?: string;
  childIds?: string[];
  columnId?: string; // kanban column this task sits in
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
// Tag (V2 API)
// ---------------------------------------------------------------------------
export interface Tag {
  name: string;
  label?: string;
  sortOrder?: number;
  sortType?: string;
  color?: string;
  etag?: string;
  type?: string;
  rawName?: string;
}

// ---------------------------------------------------------------------------
// Project Group / Folder (V2 API)
// ---------------------------------------------------------------------------
export interface ProjectGroup {
  id: string;
  etag?: string;
  name: string;
  sortOrder?: number;
  viewMode?: string;
  deleted?: number;
  userId?: number;
  showAll?: boolean;
  sortType?: string;
  teamId?: string;
}

// ---------------------------------------------------------------------------
// Habit (V2 API)
// ---------------------------------------------------------------------------
export interface Habit {
  id: string;
  name: string;
  color?: string;
  iconRes?: string;
  sortOrder?: number;
  status?: number; // 0 = active, 2 = archived
  encouragement?: string;
  frequency?: string;
  type?: string;
  goal?: number;
  step?: number;
  unit?: string;
  sectionId?: string;
  repeatRule?: string;
  reminders?: string[];
  startDate?: string;
  targetDays?: number;
  targetStartDate?: string;
  totalCheckIns?: number;
  createdTime?: string;
  modifiedTime?: string;
  etag?: string;
}

export interface HabitCheckin {
  id?: string;
  habitId: string;
  checkinTime: string; // yyyy-MM-dd'T'HH:mm:ssZ
  checkinStamp?: string; // yyyyMMdd
  status?: number;
  value?: number;
  goal?: number;
  opTime?: string;
}

export interface HabitSection {
  id: string;
  name: string;
  sortOrder?: number;
  children?: string[];
  isSystemSection?: boolean;
}

// ---------------------------------------------------------------------------
// Focus / Pomodoro (V2 API)
// ---------------------------------------------------------------------------
export interface FocusRecord {
  date: string;
  pomodoroCount?: number;
  pomodoroTime?: number;
  stopwatchTime?: number;
  totalTime?: number;
}

export interface FocusDistribution {
  name?: string;
  color?: string;
  totalTime?: number;
  pomodoroTime?: number;
  stopwatchTime?: number;
}

// ---------------------------------------------------------------------------
// Productivity Stats (V2 API)
// ---------------------------------------------------------------------------
export interface ProductivityStats {
  score?: number;
  completedCount?: number;
  createdCount?: number;
  pomodoroCount?: number;
  pomodoroDuration?: number;
  habitCheckInCount?: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// User Profile (V2 API)
// ---------------------------------------------------------------------------
export interface UserProfile {
  username?: string;
  name?: string;
  email?: string;
  timeZone?: string;
  inboxId?: string;
  isPro?: boolean;
  createdDate?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// V2 Batch Sync response
// ---------------------------------------------------------------------------
export interface BatchCheckResponse {
  syncTaskBean?: {
    update?: Task[];
    delete?: string[];
  };
  projectProfiles?: Project[];
  projectGroups?: ProjectGroup[];
  tags?: Tag[];
  inboxId?: string;
  [key: string]: unknown;
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
// V2 Session token
// ---------------------------------------------------------------------------
export interface SessionLoginResponse {
  token: string;
  userId?: string;
  username?: string;
  inboxId?: string;
  [key: string]: unknown;
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
  // V2 auth (session-based)
  username: string;
  password: string;
  /** Stable device id for the V2 `x-device` header (required for signon). */
  deviceId?: string;
}
