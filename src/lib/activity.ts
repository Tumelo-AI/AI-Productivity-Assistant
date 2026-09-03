import { supabase } from "@/integrations/supabase/client";

export type ToolKey = "email" | "meeting" | "tasks" | "research" | "assistant";

export const TOOL_LABEL: Record<ToolKey, string> = {
  email: "Email Generator",
  meeting: "Meeting Summarizer",
  tasks: "Task Planner",
  research: "Research Assistant",
  assistant: "AI Assistant",
};

export const TOOL_ROUTE: Record<ToolKey, string> = {
  email: "/email-generator",
  meeting: "/meeting-summarizer",
  tasks: "/task-planner",
  research: "/research-assistant",
  assistant: "/assistant",
};

export async function logActivity(params: {
  userId: string;
  tool: ToolKey;
  action: string;
  title: string;
  recordId?: string;
}) {
  const { error } = await supabase.from("activity_log").insert({
    user_id: params.userId,
    tool: params.tool,
    action: params.action,
    title: params.title.slice(0, 160),
    record_id: params.recordId ?? null,
  });
  if (error) console.error("activity log failed", error.message);
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
