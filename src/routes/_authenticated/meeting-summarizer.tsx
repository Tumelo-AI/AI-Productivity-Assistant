import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { summarizeMeeting } from "@/lib/ai.functions";
import type { MeetingResult } from "@/lib/ai-types";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/meeting-summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — CleanState AI" },
      {
        name: "description",
        content: "Turn long meeting notes into a summary, decisions and clear action items.",
      },
      { property: "og:title", content: "Meeting Summarizer — CleanState AI" },
      { property: "og:description", content: "Summaries, decisions and action items in seconds." },
    ],
  }),
  component: MeetingSummarizer,
});

function MeetingSummarizer() {
  const { user } = useAuth();
  const run = useServerFn(summarizeMeeting);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const summarize = async () => {
    if (notes.trim().length < 20) {
      toast.error("Please paste at least a few lines of meeting notes.");
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await run({ data: { title, date, participants, notes } });
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
    const { data, error: err } = await supabase
      .from("meeting_summaries")
      .insert({
        user_id: user.id,
        meeting_title: title || "Untitled meeting",
        meeting_date: date || null,
        participants,
        notes,
        summary: result.summary,
        key_points: result.key_points,
        decisions: result.decisions,
        action_items: result.action_items,
        follow_up: result.follow_up,
      })
      .select("id")
      .single();
    setSaving(false);
    if (err) {
      toast.error("Could not save this summary. Please try again.");
      return;
    }
    setSaved(true);
    toast.success("Summary saved to your history");
    await logActivity({
      userId: user.id,
      tool: "meeting",
      action: "summarized",
      title: title || "Untitled meeting",
      recordId: data.id,
    });
  };

  const plainText = result
    ? [
        `Summary: ${result.summary}`,
        `Key points:\n${result.key_points.map((k) => `- ${k}`).join("\n")}`,
        `Decisions:\n${result.decisions.map((d) => `- ${d}`).join("\n")}`,
        `Action items:\n${result.action_items
          .map((a) => `- ${a.task} (${a.owner}, ${a.deadline})`)
          .join("\n")}`,
        `Follow up:\n${result.follow_up.map((f) => `- ${f}`).join("\n")}`,
      ].join("\n\n")
    : "";

  return (
    <div className="space-y-6">
      <SectionHeading
        icon={ClipboardList}
        title="Meeting Summarizer"
        subtitle="Paste your raw notes and get a structured summary with owners and deadlines."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mtitle">Meeting title</Label>
                <Input
                  id="mtitle"
                  placeholder="Q2 planning sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mdate">Date</Label>
                <Input id="mdate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants">Participants</Label>
              <Input
                id="participants"
                placeholder="Sarah, Thabo, Nina"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Meeting notes or transcript *</Label>
              <Textarea
                id="notes"
                rows={12}
                placeholder="Paste your notes here…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{notes.length} characters</p>
            </div>
            <Button onClick={summarize} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Summarizing…" : "Summarize meeting"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading && <LoadingState message="Reading your meeting notes…" />}
          {!loading && error && <ErrorState message={error} onRetry={summarize} />}
          {!loading && !error && !result && (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                Your structured summary will appear here.
              </CardContent>
            </Card>
          )}
          {!loading && result && (
            <>
              <AIResultCard
                title="Summary"
                icon={ClipboardList}
                actions={
                  <div className="flex flex-wrap gap-2">
                    <CopyButton value={plainText} />
                    <RegenerateButton onClick={summarize} loading={loading} />
                    <SaveButton onClick={save} saving={saving} saved={saved} />
                  </div>
                }
              >
                <p className="whitespace-pre-wrap">{result.summary}</p>
              </AIResultCard>
              <AIResultCard title="Key points">
                <BulletList items={result.key_points} empty="No key points identified." />
              </AIResultCard>
              <AIResultCard title="Decisions made">
                <BulletList items={result.decisions} empty="No decisions recorded." />
              </AIResultCard>
              <AIResultCard title="Action items">
                {result.action_items.length ? (
                  <ul className="space-y-3">
                    {result.action_items.map((item, i) => (
                      <li key={i} className="rounded-xl border bg-muted/40 p-3">
                        <p className="font-medium">{item.task}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Owner: {item.owner} · Deadline: {item.deadline}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No action items found.</p>
                )}
              </AIResultCard>
              <AIResultCard title="Follow-up needed">
                <BulletList items={result.follow_up} empty="Nothing outstanding." />
              </AIResultCard>
            </>
          )}
          <ResponsibleAINotice />
        </div>
      </div>
    </div>
  );
}
