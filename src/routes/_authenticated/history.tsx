import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  ConfirmationDialog,
  EmptyState,
  ErrorState,
  SectionHeading,
} from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatWhen, TOOL_LABEL, type ToolKey } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "History — CleanState AI" },
      {
        name: "description",
        content: "Browse, search and manage everything you have generated with CleanState AI.",
      },
      { property: "og:title", content: "History — CleanState AI" },
      { property: "og:description", content: "All your saved AI sessions in one place." },
    ],
  }),
  component: HistoryPage,
});

type Item = {
  id: string;
  tool: ToolKey;
  title: string;
  detail: string;
  created_at: string;
  table: "email_generations" | "meeting_summaries" | "task_plans" | "research_sessions";
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "email", label: "Emails" },
  { key: "meeting", label: "Meetings" },
  { key: "tasks", label: "Plans" },
  { key: "research", label: "Research" },
] as const;

const TOOL_LINK = {
  email: "/email-generator",
  meeting: "/meeting-summarizer",
  tasks: "/task-planner",
  research: "/research-assistant",
} as const;

function HistoryPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Item | null>(null);

  const history = useQuery({
    queryKey: ["history", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Item[]> => {
      const [emails, meetings, plans, research] = await Promise.all([
        supabase
          .from("email_generations")
          .select("id, subject, purpose, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("meeting_summaries")
          .select("id, meeting_title, summary, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("task_plans")
          .select("id, planning_period, start_time, end_time, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("research_sessions")
          .select("id, topic, summary, created_at")
          .order("created_at", { ascending: false }),
      ]);

      const items: Item[] = [
        ...(emails.data ?? []).map((r) => ({
          id: r.id,
          tool: "email" as const,
          title: r.subject || "Untitled email",
          detail: r.purpose ?? "",
          created_at: r.created_at,
          table: "email_generations" as const,
        })),
        ...(meetings.data ?? []).map((r) => ({
          id: r.id,
          tool: "meeting" as const,
          title: r.meeting_title || "Untitled meeting",
          detail: r.summary ?? "",
          created_at: r.created_at,
          table: "meeting_summaries" as const,
        })),
        ...(plans.data ?? []).map((r) => ({
          id: r.id,
          tool: "tasks" as const,
          title: r.planning_period === "week" ? "Weekly plan" : "Daily plan",
          detail: `${r.start_time ?? ""} – ${r.end_time ?? ""}`,
          created_at: r.created_at,
          table: "task_plans" as const,
        })),
        ...(research.data ?? []).map((r) => ({
          id: r.id,
          tool: "research" as const,
          title: r.topic || "Research session",
          detail: r.summary ?? "",
          created_at: r.created_at,
          table: "research_sessions" as const,
        })),
      ];
      return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
  });

  const remove = async (item: Item) => {
    const { error } = await supabase.from(item.table).delete().eq("id", item.id);
    if (error) {
      toast.error("Could not delete this item.");
      return;
    }
    toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: ["history", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats", user?.id] });
  };

  const term = search.trim().toLowerCase();
  const items = (history.data ?? []).filter(
    (item) =>
      (filter === "all" || item.tool === filter) &&
      (!term ||
        item.title.toLowerCase().includes(term) ||
        item.detail.toLowerCase().includes(term)),
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        icon={HistoryIcon}
        title="History"
        subtitle="Everything you've generated, searchable and yours to delete at any time."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="flex-wrap">
            {FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search your history…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
      </div>

      {history.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : history.isError ? (
        <ErrorState
          message="We couldn't load your history."
          onRetry={() => history.refetch()}
        />
      ) : !items.length ? (
        <EmptyState
          title="Nothing here yet"
          description="Saved emails, summaries, plans and research sessions will show up here."
          action={
            <Button asChild size="sm">
              <Link to="/email-generator">Create your first email</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={`${item.table}-${item.id}`} className="rounded-2xl border-border/70">
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Badge variant="secondary">{TOOL_LABEL[item.tool]}</Badge>
                  <p className="mt-1.5 truncate text-sm font-medium">{item.title}</p>
                  {item.detail && (
                    <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatWhen(item.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={TOOL_LINK[item.tool]}>Open tool</Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete item"
                    onClick={() => setPending(item)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title="Delete this item?"
        description="This permanently removes the saved record from your history."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (pending) remove(pending);
          setPending(null);
        }}
      />
    </div>
  );
}
