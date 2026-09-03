import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  ClipboardList,
  Clock,
  Gauge,
  Lock,
  Mail,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import heroImage from "@/assets/hero-workspace.jpg";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CleanState AI — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "CleanState AI writes your emails, summarizes meetings, plans your day and researches topics so you can focus on work that matters.",
      },
      { property: "og:title", content: "CleanState AI — Work Smarter. Get More Done with AI." },
      {
        property: "og:description",
        content:
          "Your AI-powered workplace assistant for emails, meetings, planning and research.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Mail,
    title: "Smart Email Generator",
    body: "Describe the situation and get a polished, on-tone email with a subject line in seconds.",
  },
  {
    icon: ClipboardList,
    title: "Meeting Notes Summarizer",
    body: "Turn messy notes into an executive summary, decisions and owned action items.",
  },
  {
    icon: CalendarClock,
    title: "AI Task Planner",
    body: "Feed in your tasks and get a realistic, prioritised, non-overlapping schedule.",
  },
  {
    icon: BrainCircuit,
    title: "AI Research Assistant",
    body: "Understand dense reports and unfamiliar topics at the depth you actually need.",
  },
  {
    icon: MessagesSquare,
    title: "Central AI Assistant",
    body: "One chat for everything else — and it points you to the right tool for the job.",
  },
  {
    icon: Gauge,
    title: "Productivity Insights",
    body: "See how much repetitive work you've handed to AI, tracked across every tool.",
  },
];

const BENEFITS = [
  { icon: Clock, title: "Save hours every week", body: "Cut drafting, note-writing and planning time from hours to minutes." },
  { icon: Target, title: "Prioritise with clarity", body: "Urgency, deadlines and effort weighed for you into one workable plan." },
  { icon: Sparkles, title: "Communicate professionally", body: "Consistent tone for clients, managers and teammates, every time." },
  { icon: Lock, title: "Your data stays yours", body: "Every record is locked to your account and never shared with other users." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-soft">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> AI workplace productivity platform
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
              Work Smarter. Get More Done with AI.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Your AI-powered workplace assistant for emails, meetings, planning and research.
            </p>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              CleanState AI takes the repetitive parts of your workday — writing, summarising,
              scheduling and reading — and does them in seconds, so your attention goes to the work
              only you can do.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Get Started <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">Explore Features</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Start Creating in under a minute — no credit card required.
            </p>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border bg-card shadow-lift">
              <img
                src={heroImage}
                alt="CleanState AI workspace showing an email draft, meeting summary and daily schedule"
                width={1280}
                height={960}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold">Four tools, one workday</h2>
          <p className="mt-3 text-muted-foreground">
            Each tool is purpose-built with its own structured prompt, so results are consistent and
            useful — not generic chatbot output.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="rounded-2xl border-border/70 shadow-soft transition-shadow hover:shadow-lift">
              <CardContent className="p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-secondary/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold">The productivity payoff</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <b.icon className="size-6 text-primary" />
                <h3 className="mt-3 text-base font-semibold">{b.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-8 rounded-3xl border bg-card p-8 shadow-soft lg:grid-cols-[1fr_1.4fr] lg:p-12">
          <div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <ShieldCheck className="size-6" />
            </span>
            <h2 className="mt-4 text-2xl font-semibold">Responsible AI</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              AI is an assistant, not an authority. CleanState AI is designed to keep you in control
              of every output.
            </p>
          </div>
          <ul className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              "Prompts explicitly forbid inventing facts, names, figures or sources.",
              "Meeting summaries never add participants, decisions or deadlines that aren't in your notes.",
              "Research output separates your source material from AI interpretation.",
              "Uncertainty is flagged and verification is encouraged before decisions.",
              "You are reminded not to enter confidential information without permission.",
              "Your data is protected by per-user access rules and API keys never reach the browser.",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 rounded-xl bg-secondary/60 p-3.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              AI-generated content may contain errors. Review and verify important information
              before using it for professional decisions.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <Link to="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link to="/signup" className="hover:text-foreground">
              Create account
            </Link>
          </div>
        </div>
        <div className="border-t py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CleanState AI. Built as an AI productivity demonstration.
        </div>
      </footer>
    </div>
  );
}
