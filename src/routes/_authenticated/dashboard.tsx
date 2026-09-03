import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  ClipboardList,
  Mail,
  MessagesSquare,
} from "lucide-react";

import {
  EmptyState,
  ResponsibleAINotice,
  StatCard,
} from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { displayName, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatWhen, TOOL_LABEL, TOOL_ROUTE, type ToolKey } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CleanState AI" },
      {
        name: "description",
        content: "Your AI productivity dashboard: quick actions, usage statistics and recent work.",
      },
      { property: "og:title", content: "Dashboard — CleanState AI" },
      { property: "og:description", content: "Quick actions and productivity statistics." },
    ],
  }),
  component: Dashboard,
});

const ACTIONS = [
  {
    icon: Mail,
    title: "Email Generator",
    body: "Create professional emails in seconds.",
    cta: "Create Email",
    to: "/email-generator" as const,
  },
  {
    icon: ClipboardList,
    title: "Meeting Summarizer",
    body: "Turn lengthy meeting notes into clear action items.",
    cta: "Summarize Notes",
    to: "/meeting-summarizer" as const,
  },
  {
    icon: CalendarClock,
    title: "Task Planner",
    body: "Organize priorities and build your ideal schedule.",
    cta: "Plan My Day",
    to: "/task-planner" as const,
  },
  {
    icon: BrainCircuit,
    title: "Research Assistant",
    body: "Understand complex information faster.",
    cta: "Start Research",
    to: "/research-assistant" as const,
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useAuth();

  const stats = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const count = async (table: "email_generations" | "meeting_summaries" | "task_plans" | "research_sessions") => {
        const { count: c } = await supabase.from(table).select("id", { count: "exact", head: true });
        return c ?? 0;
      };
      const [emails, meetings, plans, research] = await Promise.all([
        count("email_generations"),
        count("meeting_summaries"),
        count("task_plans"),
        count("research_sessions"),
      ]);
      return { emails, meetings, plans, research };
    },
  });

  const activity = useQuery({
    queryKey: ["recent-activity", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("id, tool, action, title, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {greeting()}, {displayName(user)}
        </h1>
        <p className="mt-1.5 text-muted-foreground">What would you like to accomplish today?</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {ACTIONS.map((action) => (
          <Card
            key={action.title}
            className="rounded-2xl border-border/70 shadow-soft transition-shadow hover:shadow-lift"
          >
            <CardContent className="flex h-full flex-col p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <action.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{action.title}</h2>
              <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{action.body}</p>
              <Button asChild className="mt-5 w-fit">
                <Link to={action.to}>
                  {action.cta} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-semibold">Productivity overview</h2>
        <p className="text-sm text-muted-foreground">Everything you&apos;ve automated so far.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-2xl" />)
          ) : (
            <>
              <StatCard label="Emails generated" value={stats.data?.emails ?? 0} icon={Mail} />
              <StatCard label="Meetings summarized" value={stats.data?.meetings ?? 0} icon={ClipboardList} />
              <StatCard label="Plans created" value={stats.data?.plans ?? 0} icon={CalendarClock} />
              <StatCard label="Research sessions" value={stats.data?.research ?? 0} icon={BrainCircuit} />
            </>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <p className="text-sm text-muted-foreground">Your latest AI sessions.</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/history">View all</Link>
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {activity.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[70px] rounded-2xl" />)
          ) : !activity.data?.length ? (
            <EmptyState
              title="No activity yet"
              description="Run any of the four tools and your sessions will appear here."
              action={
                <Button asChild size="sm">
                  <Link to="/email-generator">Create your first email</Link>
                </Button>
              }
            />
          ) : (
            activity.data.map((item) => (
              <Card key={item.id} className="rounded-2xl border-border/70">
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{TOOL_LABEL[item.tool as ToolKey] ?? item.tool}</Badge>
                      <Badge variant="outline" className="text-success">
                        Completed
                      </Badge>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{formatWhen(item.created_at)}</p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={TOOL_ROUTE[item.tool as ToolKey] ?? "/history"}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <ResponsibleAINotice />
    </div>
  );
}
