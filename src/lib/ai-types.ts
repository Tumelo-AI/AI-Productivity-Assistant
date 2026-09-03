// Shared, client-safe result shapes returned by the AI server functions.

export type EmailResult = {
  subject: string;
  email: string;
  suggestions: string[];
};

export type ActionItem = { task: string; owner: string; deadline: string };

export type MeetingResult = {
  summary: string;
  key_points: string[];
  decisions: string[];
  action_items: ActionItem[];
  follow_up: string[];
};

export type ScheduleBlock = {
  start: string;
  end: string;
  task: string;
  priority: string;
  type: "task" | "break" | "buffer";
  note: string;
};

export type PlanResult = {
  schedule: ScheduleBlock[];
  reasoning: string;
  unscheduled: { task: string; reason: string }[];
  tips: string[];
};

export type ResearchResult = {
  summary: string;
  insights: string[];
  findings: string[];
  simple_explanation: string;
  recommendations: string[];
  questions_to_consider: string[];
  verification_note: string;
};

export const RESPONSIBLE_AI_NOTICE =
  "AI-generated content may contain errors. Review and verify important information before using it for professional decisions.";

export const RESEARCH_AI_NOTICE =
  "AI-generated research may contain errors. Verify important information using reliable sources before making decisions.";
