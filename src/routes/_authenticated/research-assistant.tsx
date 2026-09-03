import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BrainCircuit } from "lucide-react";
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
import { runResearch } from "@/lib/ai.functions";
import { RESEARCH_AI_NOTICE, type ResearchResult } from "@/lib/ai-types";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/research-assistant")({
  head: () => ({
    meta: [
      { title: "Research Assistant — CleanState AI" },
      {
        name: "description",
        content: "Summarize complex material into insights, findings and clear next steps.",
      },
      { property: "og:title", content: "Research Assistant — CleanState AI" },
      { property: "og:description", content: "Understand complex information faster." },
    ],
  }),
  component: ResearchAssistant,
});

const LEVELS = ["quick", "beginner", "professional", "detailed"] as const;

function ResearchAssistant() {
  const { user } = useAuth();
  const run = useServerFn(runResearch);

  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("professional");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const research = async () => {
    if (topic.trim().length < 3) {
      toast.error("Please enter a research topic.");
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await run({ data: { topic, question, sourceText, level } });
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
      .from("research_sessions")
      .insert({
        user_id: user.id,
        topic,
        question,
        source_text: sourceText,
        explanation_level: level,
        summary: result.summary,
        insights: result.insights,
        findings: result.findings,
        simple_explanation: result.simple_explanation,
        recommendations: result.recommendations,
        questions_to_consider: result.questions_to_consider,
      })
      .select("id")
      .single();
    setSaving(false);
    if (err) {
      toast.error("Could not save this research. Please try again.");
      return;
    }
    setSaved(true);
    toast.success("Research saved to your history");
    await logActivity({
      userId: user.id,
      tool: "research",
      action: "researched",
      title: topic,
      recordId: data.id,
    });
  };

  const text = result
    ? [
        result.summary,
        `Insights:\n${result.insights.map((i) => `- ${i}`).join("\n")}`,
        `Findings:\n${result.findings.map((i) => `- ${i}`).join("\n")}`,
        `Recommendations:\n${result.recommendations.map((i) => `- ${i}`).join("\n")}`,
      ].join("\n\n")
    : "";

  return (
    <div className="space-y-6">
      <SectionHeading
        icon={BrainCircuit}
        title="Research Assistant"
        subtitle="Break down dense material into insights you can act on — with sources you verify."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Research topic *</Label>
              <Input
                id="topic"
                placeholder="Remote onboarding best practices"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Specific question</Label>
              <Input
                id="question"
                placeholder="What reduces first-90-day attrition?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Explanation level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l} className="capitalize">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Paste source material (optional)</Label>
              <Textarea
                id="source"
                rows={10}
                placeholder="Paste an article, report or document extract…"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
              />
            </div>
            <Button onClick={research} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Researching…" : "Start research"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading && <LoadingState message="Analyzing the material…" />}
          {!loading && error && <ErrorState message={error} onRetry={research} />}
          {!loading && !error && !result && (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                Your research briefing will appear here.
              </CardContent>
            </Card>
          )}
          {!loading && result && (
            <>
              <AIResultCard
                title="Summary"
                icon={BrainCircuit}
                actions={
                  <div className="flex flex-wrap gap-2">
                    <CopyButton value={text} />
                    <RegenerateButton onClick={research} loading={loading} />
                    <SaveButton onClick={save} saving={saving} saved={saved} />
                  </div>
                }
              >
                <p className="whitespace-pre-wrap">{result.summary}</p>
              </AIResultCard>
              <AIResultCard title="Key insights">
                <BulletList items={result.insights} empty="No insights identified." />
              </AIResultCard>
              <AIResultCard title="Findings">
                <BulletList items={result.findings} empty="No findings listed." />
              </AIResultCard>
              {result.simple_explanation && (
                <AIResultCard title="Explained simply">
                  <p className="whitespace-pre-wrap">{result.simple_explanation}</p>
                </AIResultCard>
              )}
              <AIResultCard title="Recommendations">
                <BulletList items={result.recommendations} empty="No recommendations." />
              </AIResultCard>
              <AIResultCard title="Questions to consider">
                <BulletList items={result.questions_to_consider} empty="No open questions." />
              </AIResultCard>
              {result.verification_note && (
                <ResponsibleAINotice text={result.verification_note} />
              )}
            </>
          )}
          <ResponsibleAINotice text={RESEARCH_AI_NOTICE} />
        </div>
      </div>
    </div>
  );
}
