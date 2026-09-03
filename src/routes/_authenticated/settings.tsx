import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { ConfirmationDialog, ResponsibleAINotice, SectionHeading } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { fullName, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { RESPONSIBLE_AI_NOTICE } from "@/lib/ai-types";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CleanState AI" },
      {
        name: "description",
        content: "Manage your CleanState AI profile, password, data and privacy preferences.",
      },
      { property: "og:title", content: "Settings — CleanState AI" },
      { property: "og:description", content: "Profile, security and data controls." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  useEffect(() => {
    setName(fullName(user));
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    if (name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    if (!error) {
      await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", user.id);
    }
    setSavingProfile(false);
    if (error) {
      toast.error("Could not update your profile. Please try again.");
      return;
    }
    toast.success("Profile updated");
  };

  const savePassword = async () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    setConfirm("");
    toast.success("Password updated");
  };

  const clearData = async () => {
    if (!user) return;
    const tables = [
      "email_generations",
      "meeting_summaries",
      "task_plans",
      "tasks",
      "research_sessions",
      "activity_log",
      "chat_conversations",
    ] as const;
    for (const table of tables) {
      await supabase.from(table).delete().eq("user_id", user.id);
    }
    toast.success("Your saved data has been deleted");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        icon={SettingsIcon}
        title="Settings"
        subtitle="Manage your account, security and data."
      />

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>This name appears across your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">Your sign-in email can't be changed here.</p>
          </div>
          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save profile"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
          <CardDescription>Use at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={savePassword} disabled={savingPassword}>
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-primary" /> Data & privacy
          </CardTitle>
          <CardDescription>
            Your content is private to your account and never used to train models.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResponsibleAINotice text={RESPONSIBLE_AI_NOTICE} />
          <Separator />
          <div className="flex flex-wrap gap-3">
            <Button variant="destructive" onClick={() => setClearOpen(true)}>
              Delete all my saved data
            </Button>
            <Button variant="outline" onClick={signOut}>
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Delete all saved data?"
        description="This permanently removes every email, summary, plan, research session and conversation stored in your account. This can't be undone."
        confirmLabel="Delete everything"
        destructive
        onConfirm={() => {
          setClearOpen(false);
          clearData();
        }}
      />
    </div>
  );
}
