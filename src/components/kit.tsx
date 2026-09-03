import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Inbox,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RESPONSIBLE_AI_NOTICE } from "@/lib/ai-types";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  icon: Icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="size-5" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold sm:text-[1.75rem]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions}
    </div>
  );
}

export function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-card/60 p-10 text-center">
      <Loader2 className="size-7 animate-spin text-primary" />
      <p className="text-sm font-medium">{message}</p>
      <div className="w-full max-w-sm space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-destructive">Something needs your attention</p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="size-4" /> Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function CopyButton({
  value,
  label = "Copy",
  size = "sm",
  variant = "outline",
}: {
  value: string;
  label?: string;
  size?: "sm" | "default";
  variant?: "outline" | "ghost" | "secondary";
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size={size}
      variant={variant}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1800);
        } catch {
          toast.error("Your browser blocked copying. Select the text and copy manually.");
        }
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {label}
    </Button>
  );
}

export function RegenerateButton({
  onClick,
  loading,
  label = "Regenerate",
}: {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}) {
  return (
    <Button size="sm" variant="outline" onClick={onClick} disabled={loading}>
      <RefreshCw className={cn("size-4", loading && "animate-spin")} />
      {label}
    </Button>
  );
}

export function SaveButton({
  onClick,
  saving,
  saved,
}: {
  onClick: () => void;
  saving?: boolean;
  saved?: boolean;
}) {
  return (
    <Button size="sm" variant="secondary" onClick={onClick} disabled={saving || saved}>
      {saving ? (
        <Loader2 className="size-4 animate-spin" />
      ) : saved ? (
        <Check className="size-4" />
      ) : (
        <Save className="size-4" />
      )}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}

export function ResponsibleAINotice({
  text = RESPONSIBLE_AI_NOTICE,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/10 px-3.5 py-2.5 text-xs leading-relaxed text-foreground/80",
        className,
      )}
    >
      <ShieldCheck className="mt-px size-4 shrink-0 text-warning" />
      <span>{text}</span>
    </div>
  );
}

export function AIResultCard({
  title,
  icon: Icon,
  children,
  actions,
  className,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("rounded-2xl border-border/70 shadow-soft", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="size-4 text-primary" />}
          {title}
        </CardTitle>
        {actions}
      </CardHeader>
      <CardContent className="text-sm leading-relaxed">{children}</CardContent>
    </Card>
  );
}

export function BulletList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? "bg-destructive text-destructive-foreground" : undefined}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="font-display text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1.5 text-xs font-medium text-muted-foreground">{label}</p>
          {hint && <p className="text-[0.7rem] text-muted-foreground/80">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
