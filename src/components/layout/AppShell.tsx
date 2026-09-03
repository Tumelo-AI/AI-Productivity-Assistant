import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BrainCircuit,
  CalendarClock,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessagesSquare,
  Settings,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { fullName, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email-generator", label: "Email Generator", icon: Mail },
  { to: "/meeting-summarizer", label: "Meeting Summarizer", icon: ClipboardList },
  { to: "/task-planner", label: "Task Planner", icon: CalendarClock },
  { to: "/research-assistant", label: "Research Assistant", icon: BrainCircuit },
  { to: "/assistant", label: "AI Assistant", icon: MessagesSquare },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className={cn("size-4.5", active && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const name = fullName(user) || "Account";

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent/50",
            compact && "w-auto border-0 bg-transparent px-2 hover:bg-accent",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-hero text-xs font-semibold text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
          {!compact && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{name}</span>
              <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <UserRound className="size-4" /> Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut} className="text-destructive focus:text-destructive">
          <LogOut className="size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-[262px] shrink-0 flex-col border-r bg-sidebar px-4 py-5 lg:flex">
      <Link to="/dashboard" className="px-2">
        <Logo />
      </Link>
      <div className="mt-7 flex-1 overflow-y-auto">
        <NavLinks />
      </div>
      <div className="pt-4">
        <UserMenu />
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-full flex-col px-4 py-5">
          <Logo />
          <div className="mt-7 flex-1 overflow-y-auto">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <UserMenu />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function TopNavbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV.find((n) => n.to === pathname);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
      <MobileNavigation />
      <span className="font-display text-sm font-semibold lg:text-base">
        {current?.label ?? "CleanState AI"}
      </span>
      <div className="ml-auto lg:hidden">
        <UserMenu compact />
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
