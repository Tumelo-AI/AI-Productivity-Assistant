import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AIResultCard,
  BulletList,
  CopyButton,
  ErrorState,
  LoadingState,
  RegenerateButton,
  ResponsibleAINotice,
  SaveButton,
  SectionHeading,
} from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { planTasks } from "@/lib/ai.functions";
import type { PlanResult } from "@/lib/ai-types";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/task-planner")({
  head: () => ({
    meta: [
      { title: "Task Planner — CleanState AI" },
      {
        name: "description",
        content: "Turn your task list into a realistic, prioritized daily or weekly schedule.",
      },
      { property: "og:title", content: "Task Planner — CleanState AI" },
      { property: "og:description", content: "Prioritized schedules built around your workday." },
    ],
  }),
  component: TaskPlanner,
});

type Priority = "low" | "medium" | "high" | "urgent";
type Draft = {
  name: string;
  description: string;
  deadline: string;
  priority: Priority;
  durationMinutes: number;
};

const emptyTask = (): Draft => ({
  name: "",
  description: "",
  deadline: "",
  priority: "medium",
  durationMinutes: 60,
});

const PRIORITY_TONE: Record<string, string> = {
  urgent: "bg-destructive/15 text-destructive",
  high: "bg-warning/20 text-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

function TaskPlanner() {
  const { user } = useAuth();
  const run = useServerFn(planTasks);

  const [tasks, setTasks] = useState<Draft[]>([emptyTask()]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [period, setPeriod] = useState<"today" | "week">("today");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (index: number, patch: Partial<Draft>) =>
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));

  const plan = async () => {
    const valid = tasks.filter((t) => t.name.trim().length > 0);
    if (!valid.length) {
      toast.error("Add at least one task with a name.");
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await run({ data: { tasks: valid, startTime, endTime, period } });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(res.result);
  };

  const save = async () => {
    if (!user || !result) return;
    setSaving(true);
    const valid = tasks.filter((t) => t.name.trim().length > 0);
    const { data, error: err } = await supabase
      .from("task_plans")
      .insert({
        user_id: user.id,
        planning_period: period,
        start_time: startTime,
        end_time: endTime,
        generated_plan: result,
      })
      .select("id")
      .single();
    if (!err) {
      await supabase.from("tasks").insert(
        valid.map((t) => ({
          user_id: user.id,
          task_name: t.name,
          description: t.description,
          deadline: t.deadline || null,
          priority: t.priority,
          estimated_duration: t.durationMinutes,
          status: "pending",
        })),
      );
    }
    setSaving(false);
    if (err) {
      toast.error("Could not save this plan. Please try again.");
      return;
    }
    setSaved(true);
    toast.success("Plan saved to your history");
    await logActivity({
      userId: user.id,
      tool: "tasks",
      action: "planned",
      title: `${period === "today" ? "Daily" : "Weekly"} plan · ${valid.length} tasks`,
      recordId: data.id,
    });
  };

  const planText = result
    ? result.schedule.map((b) => `${b.start}-${b.end} · ${b.task} (${b.priority})`).join("\n")
    : "";

  return (
    <div className="space-y-6">
      <SectionHeading
        icon={CalendarClock}
        title="Task Planner"
        subtitle="List what needs doing — we'll prioritize it into a realistic schedule with breaks."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="start">Day starts</Label>
                <Input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Day ends</Label>
                <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={index} className="space-y-3 rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Task name"
                      value={task.name}
                      onChange={(e) => update(index, { name: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove task"
                      onClick={() => setTasks((prev) => prev.filter((_, i) => i !== index))}
                      disabled={tasks.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Notes (optional)"
                    value={task.description}
                    onChange={(e) => update(index, { description: e.target.value })}
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input
                      type="date"
                      value={task.deadline}
                      onChange={(e) => update(index, { deadline: e.target.value })}
                    />
                    <Select
                      value={task.priority}
                      onValueChange={(v) => update(index, { priority: v as Priority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["low", "medium", "high", "urgent"] as const).map((p) => (
                          <SelectItem key={p} value={p} className="capitalize">
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={5}
                      max={1440}
                      step={5}
                      value={task.durationMinutes}
                      onChange={(e) =>
                        update(index, { durationMinutes: Number(e.target.value) || 60 })
                      }
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => setTasks((prev) => [...prev, emptyTask()])}>
                <Plus className="size-4" /> Add task
              </Button>
            </div>

            <Button onClick={plan} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Building plan…" : "Generate plan"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading && <LoadingState message="Prioritizing your tasks…" />}
          {!loading && error && <ErrorState message={error} onRetry={plan} />}
          {!loading && !error && !result && (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                Your schedule will appear here.
              </CardContent>
            </Card>
          )}
          {!loading && result && (
            <>
              <AIResultCard
                title="Your schedule"
                icon={CalendarClock}
                actions={
                  <div className="flex flex-wrap gap-2">
                    <CopyButton value={planText} />
                    <RegenerateButton onClick={plan} loading={loading} />
                    <SaveButton onClick={save} saving={saving} saved={saved} />
                  </div>
                }
              >
                <ul className="space-y-2">
                  {result.schedule.map((block, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
                      <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground">
                        {block.start} – {block.end}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{block.task}</span>
                        {block.note && (
                          <span className="block text-xs text-muted-foreground">{block.note}</span>
                        )}
                      </span>
                      <Badge className={PRIORITY_TONE[block.priority] ?? "bg-muted"}>
                        {block.type === "task" ? block.priority : block.type}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </AIResultCard>
              {result.reasoning && (
                <AIResultCard title="Why this order">
                  <p className="whitespace-pre-wrap">{result.reasoning}</p>
                </AIResultCard>
              )}
              {result.unscheduled.length > 0 && (
                <AIResultCard title="Didn't fit today">
                  <ul className="space-y-2">
                    {result.unscheduled.map((u, i) => (
                      <li key={i}>
                        <span className="font-medium">{u.task}</span>
                        <span className="text-muted-foreground"> — {u.reason}</span>
                      </li>
                    ))}
                  </ul>
                </AIResultCard>
              )}
              <AIResultCard title="Productivity tips">
                <BulletList items={result.tips} empty="No extra tips." />
              </AIResultCard>
            </>
          )}
          <ResponsibleAINotice />
        </div>
      </div>
    </div>
  );
}
