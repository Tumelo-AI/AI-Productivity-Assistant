import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  EmailResult,
  MeetingResult,
  PlanResult,
  ResearchResult,
} from "@/lib/ai-types";

/* ------------------------------------------------------------------ */
/* Input validation (runs before any AI call)                          */
/* ------------------------------------------------------------------ */

const emailInput = z.object({
  recipient: z.string().trim().max(200).optional().default(""),
  audience: z.enum(["client", "manager", "team", "colleague", "other"]).default("colleague"),
  purpose: z.string().trim().min(5, "Please describe the purpose of the email.").max(4000),
  importantInformation: z.string().trim().max(6000).optional().default(""),
  tone: z
    .enum(["formal", "professional", "friendly", "persuasive", "concise"])
    .default("professional"),
  length: z.enum(["short", "medium", "detailed"]).default("medium"),
  improve: z.string().trim().max(8000).optional().default(""),
});

const meetingInput = z.object({
  title: z.string().trim().max(200).optional().default(""),
  date: z.string().trim().max(40).optional().default(""),
  participants: z.string().trim().max(2000).optional().default(""),
  notes: z.string().trim().min(20, "Please paste at least a few lines of meeting notes.").max(20000),
});

const plannerInput = z.object({
  tasks: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        description: z.string().trim().max(2000).optional().default(""),
        deadline: z.string().trim().max(60).optional().default(""),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        durationMinutes: z.number().int().min(5).max(1440).default(60),
      }),
    )
    .min(1, "Add at least one task before generating a plan.")
    .max(30),
  startTime: z.string().trim().max(10).default("08:00"),
  endTime: z.string().trim().max(10).default("17:00"),
  period: z.enum(["today", "week"]).default("today"),
});

const researchInput = z.object({
  topic: z.string().trim().min(3, "Please enter a research topic.").max(300),
  question: z.string().trim().max(1000).optional().default(""),
  sourceText: z.string().trim().max(30000).optional().default(""),
  level: z.enum(["quick", "beginner", "professional", "detailed"]).default("professional"),
});

const chatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(12000),
      }),
    )
    .min(1)
    .max(40),
});

/* ------------------------------------------------------------------ */
/* Response validation                                                 */
/* ------------------------------------------------------------------ */

const strArray = z.array(z.string().trim().min(1)).default([]);

const emailSchema = z.object({
  subject: z.string().trim().min(1),
  email: z.string().trim().min(1),
  suggestions: strArray,
});

const meetingSchema = z.object({
  summary: z.string().trim().min(1),
  key_points: strArray,
  decisions: strArray,
  action_items: z
    .array(
      z.object({
        task: z.string().trim().min(1),
        owner: z.string().trim().default("Not specified"),
        deadline: z.string().trim().default("Not specified"),
      }),
    )
    .default([]),
  follow_up: strArray,
});

const planSchema = z.object({
  schedule: z
    .array(
      z.object({
        start: z.string().trim(),
        end: z.string().trim(),
        task: z.string().trim().min(1),
        priority: z.string().trim().default("medium"),
        type: z.enum(["task", "break", "buffer"]).default("task"),
        note: z.string().trim().default(""),
      }),
    )
    .default([]),
  reasoning: z.string().trim().default(""),
  unscheduled: z
    .array(z.object({ task: z.string().trim(), reason: z.string().trim().default("") }))
    .default([]),
  tips: strArray,
});

const researchSchema = z.object({
  summary: z.string().trim().min(1),
  insights: strArray,
  findings: strArray,
  simple_explanation: z.string().trim().default(""),
  recommendations: strArray,
  questions_to_consider: strArray,
  verification_note: z.string().trim().default(""),
});

/* ------------------------------------------------------------------ */
/* Server functions — the only place AI is called                      */
/* ------------------------------------------------------------------ */

function toMessage(error: unknown): string {
  if (error && typeof error === "object" && "name" in error && error.name === "AIServiceError") {
    return (error as Error).message;
  }
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Please check your input and try again.";
  }
  console.error("AI feature failure", error);
  return "Something went wrong while processing your request. Please try again.";
}

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; result: EmailResult } | { ok: false; error: string }> => {
    try {
      const { runStructuredPrompt } = await import("@/lib/ai-gateway.server");
      const { EMAIL_SYSTEM_PROMPT } = await import("@/lib/prompts.server");
      const user = [
        `Recipient: ${data.recipient || "Not specified"}`,
        `Audience: ${data.audience}`,
        `Tone: ${data.tone}`,
        `Length: ${data.length}`,
        `Purpose: ${data.purpose}`,
        `Important information to include (verbatim facts): ${data.importantInformation || "None supplied"}`,
        data.improve
          ? `Improve this existing draft rather than starting over. Keep its facts intact:\n${data.improve}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
      const result = await runStructuredPrompt(EMAIL_SYSTEM_PROMPT, user, (v) =>
        emailSchema.parse(v),
      );
      return { ok: true, result };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => meetingInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; result: MeetingResult } | { ok: false; error: string }> => {
    try {
      const { runStructuredPrompt } = await import("@/lib/ai-gateway.server");
      const { MEETING_SYSTEM_PROMPT } = await import("@/lib/prompts.server");
      const user = [
        `Meeting title: ${data.title || "Not specified"}`,
        `Meeting date: ${data.date || "Not specified"}`,
        `Participants listed by the user: ${data.participants || "Not specified"}`,
        `Meeting notes:\n${data.notes}`,
      ].join("\n");
      const result = await runStructuredPrompt(MEETING_SYSTEM_PROMPT, user, (v) =>
        meetingSchema.parse(v),
      );
      return { ok: true, result };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const planTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => plannerInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; result: PlanResult } | { ok: false; error: string }> => {
    try {
      const { runStructuredPrompt } = await import("@/lib/ai-gateway.server");
      const { PLANNER_SYSTEM_PROMPT } = await import("@/lib/prompts.server");
      const list = data.tasks
        .map(
          (t, i) =>
            `${i + 1}. ${t.name} | priority: ${t.priority} | estimated: ${t.durationMinutes} min | deadline: ${
              t.deadline || "none"
            } | notes: ${t.description || "none"}`,
        )
        .join("\n");
      const user = [
        `Planning period: ${data.period === "today" ? "Today" : "This week"}`,
        `Available window: ${data.startTime} to ${data.endTime}`,
        `Tasks:\n${list}`,
      ].join("\n");
      const result = await runStructuredPrompt(PLANNER_SYSTEM_PROMPT, user, (v) =>
        planSchema.parse(v),
      );
      return { ok: true, result };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const runResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => researchInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; result: ResearchResult } | { ok: false; error: string }> => {
    try {
      const { runStructuredPrompt } = await import("@/lib/ai-gateway.server");
      const { RESEARCH_SYSTEM_PROMPT } = await import("@/lib/prompts.server");
      const levels: Record<string, string> = {
        quick: "Quick summary",
        beginner: "Beginner",
        professional: "Professional",
        detailed: "Detailed",
      };
      const user = [
        `Research topic: ${data.topic}`,
        `Specific question: ${data.question || "Not specified"}`,
        `Requested explanation level: ${levels[data.level]}`,
        data.sourceText
          ? `USER-SUPPLIED SOURCE TEXT (treat as the user's evidence):\n"""\n${data.sourceText}\n"""`
          : "No source text supplied. Rely on general knowledge and flag uncertainty.",
      ].join("\n");
      const result = await runStructuredPrompt(RESEARCH_SYSTEM_PROMPT, user, (v) =>
        researchSchema.parse(v),
      );
      return { ok: true, result };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });

export const workplaceChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => chatInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true; reply: string } | { ok: false; error: string }> => {
    try {
      const { runChatPrompt } = await import("@/lib/ai-gateway.server");
      const { CHAT_SYSTEM_PROMPT } = await import("@/lib/prompts.server");
      const reply = await runChatPrompt([
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        ...data.messages,
      ]);
      return { ok: true, reply };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  });
