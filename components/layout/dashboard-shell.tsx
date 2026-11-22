"use client";

import {
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Brand } from "@/components/layout/brand";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  dashboardNavigation,
  isDashboardNavActive,
  type DashboardNavItem,
} from "@/constants/navigation";
import { planLabels, roleLabels } from "@/constants/status";
import { useCurrentUser } from "@/hooks/use-current-user";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/format";
import { dashboardPathForRole } from "@/lib/roles";
import type { UserRole } from "@/types";

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: DashboardNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const activeHref = items
    .filter((item) => isDashboardNavActive(pathname, item))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = item.href === activeHref;
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                active
                  ? "bg-accent text-primary"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UserSummary({
  name,
  email,
  image,
  role,
  plan,
  loading,
}: {
  name?: string;
  email?: string;
  image?: string;
  role: UserRole | null;
  plan: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg p-2">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg p-2">
      <Avatar size="lg">
        {image ? <AvatarImage src={image} alt="" /> : null}
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {name ?? "Your account"}
        </p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {role ? (
            <Badge variant="outline" className="h-5 text-[10px]">
              {roleLabels[role]}
            </Badge>
          ) : null}
          <Badge variant="secondary" className="h-5 text-[10px]">
            {plan === "pro" ? "Pro" : planLabels.free}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { user, role, isPending } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const items = role ? dashboardNavigation[role] : [];

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await authClient.signOut();
      toast.success("Signed out");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("We could not sign you out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  const summary = (
    <UserSummary
      name={user?.name}
      email={user?.email}
      image={user?.image}
      role={role}
      plan={user?.plan ?? "free"}
      loading={isPending && !user}
    />
  );

  return (
    <div className="min-h-svh bg-slate-50/70">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Brand />
        </div>

        <nav
          aria-label="Dashboard"
          className="flex-1 overflow-y-auto p-3"
        >
          {items.length > 0 ? (
            <NavLinks items={items} pathname={pathname} />
          ) : (
            <div className="space-y-2 p-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-4/5" />
            </div>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <Link
              href="/tuitions"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Browse tuitions
            </Link>
          </div>
        </nav>

        <div className="border-t border-border p-3">
          {summary}
          <Button
            type="button"
            variant="ghost"
            className="mt-1 w-full justify-start text-slate-600"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open dashboard navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </Button>
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              {role ? `${roleLabels[role]} dashboard` : "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Public site
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Avatar size="sm">
                  {user?.image ? <AvatarImage src={user.image} alt="" /> : null}
                  <AvatarFallback>{initials(user?.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate sm:inline">
                  {user?.name ?? "Account"}
                </span>
                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href={dashboardPathForRole(role)} />}
                >
                  <ExternalLink aria-hidden="true" />
                  Dashboard home
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                  <UserRound aria-hidden="true" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  <LogOut aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Dashboard navigation</SheetTitle>
            <SheetDescription>
              Navigate between dashboard sections.
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-16 items-center border-b border-border px-4">
            <Brand />
          </div>
          <nav aria-label="Dashboard" className="flex-1 overflow-y-auto p-3">
            {items.length > 0 ? (
              <NavLinks
                items={items}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            ) : null}
            <div className="mt-6 border-t border-border pt-4">
              <Link
                href="/tuitions"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                Browse tuitions
              </Link>
            </div>
          </nav>
          <div className="border-t border-border p-3">
            {summary}
            <Button
              type="button"
              variant="ghost"
              className="mt-1 w-full justify-start text-slate-600"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
