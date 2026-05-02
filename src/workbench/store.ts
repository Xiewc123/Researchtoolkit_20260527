import { WorkbenchState, Task, Project, Submission } from './types'
import { uid, dateTimeLabel } from './utils'

export const STAGES = [
  "Ideation",
  "Writing",
  "Ready to Submit",
  "Submitted",
  "Under Review",
  "Revision",
  "Accepted",
  "Published",
  "Rejected",
];

export const todayStr = () => {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export const defaultState = (): WorkbenchState => ({
  attendance: {},
  timeBlocks: {},
  focus: { active: null, sessions: [] },
  projects: [],
  tasks: [],
  submissions: [],
  thesis: {
    meta: { title: "", targetDate: "" },
    milestones: [],
    chapters: [],
    logs: [],
  },
  meetings: [],
  projectLogs: [],
  updatedAt: dateTimeLabel(),
});

const normalizeAttendance = (input: any): Record<string, { logs: any[]; leaves: any[] }> => {
  const obj: Record<string, any> = input && typeof input === "object" ? input : {};
  const out: Record<string, { logs: any[]; leaves: any[] }> = {};
  for (const [date, day] of Object.entries(obj)) {
    out[date] = {
      logs: Array.isArray(day?.logs) ? day.logs : [],
      leaves: Array.isArray(day?.leaves) ? day.leaves : [],
    };
  }
  return out;
};

const normalizeSubmissions = (arr: any[]): any[] =>
  (Array.isArray(arr) ? arr : []).map((s) => ({
    id: s?.id || uid("sub"),
    title: String(s?.title || ""),
    venue: String(s?.venue || ""),
    deadline: String(s?.deadline || ""),
    stage: STAGES.includes(s?.stage) ? s.stage : STAGES[0],
    logs: Array.isArray(s?.logs) ? s.logs : [],
    createdAt: String(s?.createdAt || dateTimeLabel()),
    updatedAt: String(s?.updatedAt || ""),
  }));

export const normalizeState = (raw: any): WorkbenchState => {
  const base = defaultState();
  const s = raw && typeof raw === "object" ? raw : {};
  return {
    ...base,
    ...s,
    attendance: normalizeAttendance(s.attendance),
    timeBlocks: s.timeBlocks && typeof s.timeBlocks === "object" ? s.timeBlocks : {},
    focus: {
      active: s.focus?.active || null,
      sessions: Array.isArray(s.focus?.sessions) ? s.focus.sessions : [],
    },
    tasks: (Array.isArray(s.tasks) ? s.tasks : []).map((t: any) => ({
      ...t,
      group: t.group || "默认分组",
      groupOrder: t.groupOrder || 0,
      members: t.members || "自己",
      partialDates: Array.isArray(t.partialDates) ? t.partialDates : [],
    })),
    projects: (Array.isArray(s.projects) ? s.projects : []).map((p: any) => ({
      ...p,
      files: Array.isArray(p.files) ? p.files : [],
      mdPath: p.mdPath || "",
      attPath: p.attPath || "",
    })),
    projectLogs: Array.isArray(s.projectLogs) ? s.projectLogs : [],
    submissions: normalizeSubmissions(s.submissions),
    thesis: {
      meta: {
        title: String(s.thesis?.meta?.title || ""),
        targetDate: String(s.thesis?.meta?.targetDate || ""),
      },
      milestones: Array.isArray(s.thesis?.milestones) ? s.thesis.milestones : [],
      chapters: Array.isArray(s.thesis?.chapters) ? s.thesis.chapters : [],
      logs: Array.isArray(s.thesis?.logs) ? s.thesis.logs : [],
    },
  };
};

export const getDayAttendance = (state: WorkbenchState, date: string = todayStr()) => {
  state.attendance[date] ||= { logs: [], leaves: [] };
  state.attendance[date].logs ||= [];
  state.attendance[date].leaves ||= [];
  return state.attendance[date];
};

export const getDayBlocks = (state: WorkbenchState, date: string = todayStr()) => {
  state.timeBlocks[date] ||= [];
  return state.timeBlocks[date];
};

export const createProject = (title: string, deadline: string = ""): Project => ({
  id: uid("proj"),
  title: title.trim(),
  deadline,
  status: "active",
  createdAt: dateTimeLabel(),
  files: [],
  mdPath: "",
  attPath: "",
});

export const createTask = (title: string, projectId: string = "", dueDate: string = ""): Task => ({
  id: uid("task"),
  title: title.trim(),
  projectId,
  dueDate,
  status: "todo",
  quadrant: "Q3",
  isToday: false,
  activeStart: null,
  group: "默认分组",
  groupOrder: 0,
  members: "自己",
  partialDates: [],
  createdAt: dateTimeLabel(),
});

export const createSubmission = (title: string, venue: string, deadline: string, stage: string): Submission => ({
  id: uid("sub"),
  title: title.trim(),
  venue: venue.trim(),
  deadline,
  stage: STAGES.includes(stage) ? stage : STAGES[0],
  logs: [],
  createdAt: dateTimeLabel(),
  updatedAt: "",
});