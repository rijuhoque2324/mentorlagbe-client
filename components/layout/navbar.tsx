"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Brand } from "@/components/layout/brand";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { publicNavigation } from "@/constants/site";
import { roleLabels } from "@/constants/status";
import { useCurrentUser } from "@/hooks/use-current-user";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/format";
import { dashboardPathForRole } from "@/lib/roles";
import { cn } from "cn";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isPending } = useCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await authClient.signOut();
      closeMenu();
      toast.success("Signed out");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("We could not sign you out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <nav className="container-custom" aria-label="Main navigation">
        <div className="flex h-20 items-center justify-between gap-4">
          <Brand href="/" className="shrink-0" />

          <div className="hidden items-center gap-7 md:flex">
            {publicNavigation.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "text-primary"
                      : "text-slate-600 hover:text-primary",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isPending && !user ? (
              <>
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-28" />
              </>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pr-2 pl-1 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  <Avatar size="sm">
                    {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-28 truncate">{user.name}</span>
                  {role ? (
                    <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary lg:inline">
                      {roleLabels[role]}
                    </span>
                  ) : null}
                  <ChevronDown
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <div className="px-2 py-1.5">
                    <p className="truncate text-sm font-semibold">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    {role ? (
                      <p className="mt-1 text-xs font-medium text-primary">
                        {roleLabels[role]}
                      </p>
                    ) : null}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={<Link href={dashboardPathForRole(role)} />}
                  >
                    <LayoutDashboard aria-hidden="true" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                    <UserRound aria-hidden="true" />
                    Update Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    <LogOut aria-hidden="true" />
                    {signingOut ? "Signing out…" : "Sign Out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 px-4",
                  )}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "h-9 px-4",
                  )}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((previous) => !previous)}
            className="flex size-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen ? (
          <div
            id="mobile-navigation"
            className="border-t border-border py-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {publicNavigation.map((link) => {
                const active = isActivePath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-accent text-primary"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              {user ? (
                <>
                  <Link
                    href={dashboardPathForRole(role)}
                    onClick={closeMenu}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "h-10 w-full",
                    )}
                  >
                    <LayoutDashboard aria-hidden="true" />
                    Go to dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={closeMenu}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-10 w-full",
                    )}
                  >
                    <UserRound aria-hidden="true" />
                    Update Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-10 w-full justify-start text-destructive",
                    )}
                  >
                    <LogOut aria-hidden="true" />
                    {signingOut ? "Signing out…" : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={closeMenu}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-10 w-full",
                    )}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={closeMenu}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "h-10 w-full",
                    )}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
