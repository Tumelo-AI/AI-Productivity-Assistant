import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MessagesSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { ResponsibleAINotice, SectionHeading } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { workplaceChat } from "@/lib/ai.functions";
import { logActivity } from "@/lib/activity";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — CleanState AI" },
      {
        name: "description",
        content: "Ask workplace productivity questions and get practical, structured guidance.",
      },
      { property: "og:title", content: "AI Assistant — CleanState AI" },
      { property: "og:description", content: "Your workplace productivity co-pilot." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I prioritize a week with three competing deadlines?",
  "Help me prepare an agenda for a project kickoff.",
  "How should I phrase feedback to a teammate who missed a deadline?",
];

function Assistant() {
  const { user } = useAuth();
  const run = useServerFn(workplaceChat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const persist = async (history: Msg[], reply: string) => {
    if (!user) return;
    let id = conversationId;
    const firstUser = history.find((m) => m.role === "user")?.content ?? "Conversation";
    if (!id) {
      const { data } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, title: firstUser.slice(0, 80) })
        .select("id")
        .single();
      id = data?.id ?? null;
      setConversationId(id);
      if (id) {
        await logActivity({
          userId: user.id,
          tool: "assistant",
          action: "chatted",
          title: firstUser.slice(0, 80),
          recordId: id,
        });
      }
    }
    if (!id) return;
    const last = history[history.length - 1];
    await supabase.from("chat_messages").insert([
      { conversation_id: id, role: "user", content: last?.content ?? "" },
      { conversation_id: id, role: "assistant", content: reply },
    ]);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const history: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(history);
    setInput("");
    setLoading(true);
    const res = await run({ data: { messages: history.slice(-12) } });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I couldn't answer that just now. Please try again." },
      ]);
      return;
    }
    setMessages([...history, { role: "assistant", content: res.reply }]);
    await persist(history, res.reply);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        icon={MessagesSquare}
        title="AI Assistant"
        subtitle="Ask anything about planning, communication or getting unstuck at work."
      />

      <Card className="flex h-[62vh] min-h-[420px] flex-col rounded-2xl border-border/70 shadow-soft">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-5">
          {!messages.length && (
            <div className="space-y-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Start with a question, or try one of these:
              </p>
              <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border bg-muted/50",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Thinking…
            </div>
          )}
          <div ref={endRef} />
        </CardContent>
        <div className="border-t p-4">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Textarea
              rows={2}
              placeholder="Ask a workplace productivity question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              className="resize-none"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Card>

      <ResponsibleAINotice />
    </div>
  );
}
