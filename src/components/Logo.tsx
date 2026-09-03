import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
        <Sparkles className="size-4.5" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight">
          CleanState<span className="text-primary"> AI</span>
        </span>
      )}
    </span>
  );
}
