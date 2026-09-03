import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail } from "lucide-react";
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
import { generateEmail } from "@/lib/ai.functions";
import type { EmailResult } from "@/lib/ai-types";
import { logActivity } from "@/lib/activity";

export const Route = createFileRoute("/_authenticated/email-generator")({
  head: () => ({
    meta: [
      { title: "Email Generator — CleanState AI" },
      {
        name: "description",
        content: "Draft professional workplace emails in seconds with tone and length control.",
      },
      { property: "og:title", content: "Email Generator — CleanState AI" },
      { property: "og:description", content: "Draft professional workplace emails in seconds." },
    ],
  }),
  component: EmailGenerator,
});

const TONES = ["formal", "friendly", "persuasive", "apologetic", "concise"] as const;
const AUDIENCES = ["client", "manager", "team", "colleague", "other"] as const;
const LENGTHS = ["short", "medium", "detailed"] as const;

function EmailGenerator() {
  const { user } = useAuth();
  const run = useServerFn(generateEmail);

  const [recipient, setRecipient] = useState("");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>("colleague");
  const [purpose, setPurpose] = useState("");
  const [info, setInfo] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("formal");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("medium");
  const [improve, setImprove] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    if (purpose.trim().length < 5) {
      toast.error("Please describe the purpose of the email.");
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await run({
      data: { recipient, audience, purpose, importantInformation: info, tone, length, improve },
    });
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
      .from("email_generations")
      .insert({
        user_id: user.id,
        recipient,
        audience,
        purpose,
        important_information: info,
        tone,
        length,
        subject: result.subject,
        generated_email: result.email,
      })
      .select("id")
      .single();
    setSaving(false);
    if (err) {
      toast.error("Could not save this email. Please try again.");
      return;
    }
    setSaved(true);
    toast.success("Email saved to your history");
    await logActivity({
      userId: user.id,
      tool: "email",
      action: "generated",
      title: result.subject,
      recordId: data.id,
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        icon={Mail}
        title="Email Generator"
        subtitle="Describe what you need to say — we'll write a polished, professional email."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  placeholder="e.g. Sarah, Head of Ops"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCES.map((a) => (
                      <SelectItem key={a} value={a} className="capitalize">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of the email *</Label>
              <Textarea
                id="purpose"
                rows={3}
                placeholder="Ask the client for an extension on the delivery deadline."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="info">Important information to include</Label>
              <Textarea
                id="info"
                rows={3}
                placeholder="New date: 14 March. Reason: supplier delay."
                value={info}
                onChange={(e) => setInfo(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Length</Label>
                <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTHS.map((l) => (
                      <SelectItem key={l} value={l} className="capitalize">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="improve">Existing draft to improve (optional)</Label>
              <Textarea
                id="improve"
                rows={3}
                placeholder="Paste a rough draft and we'll refine it."
                value={improve}
                onChange={(e) => setImprove(e.target.value)}
              />
            </div>

            <Button onClick={generate} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Generating…" : "Generate email"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading && <LoadingState message="Writing your email…" />}
          {!loading && error && <ErrorState message={error} onRetry={generate} />}
          {!loading && !error && !result && (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                Your generated email will appear here.
              </CardContent>
            </Card>
          )}
          {!loading && result && (
            <>
              <AIResultCard
                title="Generated email"
                icon={Mail}
                actions={
                  <div className="flex flex-wrap gap-2">
                    <CopyButton value={`Subject: ${result.subject}\n\n${result.email}`} />
                    <RegenerateButton onClick={generate} loading={loading} />
                    <SaveButton onClick={save} saving={saving} saved={saved} />
                  </div>
                }
              >
                <p className="font-medium">Subject: {result.subject}</p>
                <p className="mt-3 whitespace-pre-wrap">{result.email}</p>
              </AIResultCard>
              <AIResultCard title="Suggestions">
                <BulletList items={result.suggestions} empty="No extra suggestions." />
              </AIResultCard>
            </>
          )}
          <ResponsibleAINotice />
        </div>
      </div>
    </div>
  );
}
