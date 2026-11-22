"use client";

import { Loader2, SearchX, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardError } from "@/components/dashboard/dashboard-error";
import { EmptyState } from "@/components/shared/empty-state";
import { InlineAlert } from "@/components/shared/inline-alert";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { planLabels, roleLabels } from "@/constants/status";
import { useApi } from "@/hooks/use-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ApiError } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import { USER_ROLES } from "@/lib/roles";
import { adminService } from "@/services/admin.service";
import type { User, UserRole } from "@/types";

const PAGE_SIZE = 10;
const roleOptions: Array<{ value: UserRole | ""; label: string }> = [
  { value: "", label: "All roles" },
  { value: "student", label: roleLabels.student },
  { value: "tutor", label: roleLabels.tutor },
  { value: "admin", label: roleLabels.admin },
];

export function AdminUsers() {
  const { user: currentUser } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);
  const [target, setTarget] = useState<User | null>(null);
  const [nextRole, setNextRole] = useState<UserRole>("student");
  const [working, setWorking] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApi(
    () =>
      adminService.users({
        search: debouncedSearch.trim(),
        role,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, role, page],
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasFilters = Boolean(search.trim() || role);

  function openRoleDialog(user: User) {
    setTarget(user);
    setDialogError(null);
    setNextRole(user.role ?? "student");
  }

  async function handleRoleChange() {
    if (!target) {
      return;
    }

    if (target.role === nextRole) {
      setTarget(null);
      return;
    }

    setWorking(true);
    setDialogError(null);

    try {
      await adminService.updateUserRole(target.id, nextRole);
      toast.success("Role updated", {
        description: `${target.name} is now ${roleLabels[nextRole].toLowerCase()}.`,
      });
      setTarget(null);
      refetch();
    } catch (caught) {
      setDialogError(
        caught instanceof ApiError
          ? caught.message
          : "We could not update this role. Please try again.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin dashboard"
        title="Users"
        description="Search accounts and update roles. Every role change is validated by the server."
      />

      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admin-user-search">Search users</Label>
            <Input
              id="admin-user-search"
              type="search"
              placeholder="Name or email"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-user-role">Role</Label>
            <NativeSelect
              id="admin-user-role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value as UserRole | "");
                setPage(1);
              }}
            >
              {roleOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {loading
          ? "Loading users…"
          : `${total} ${total === 1 ? "user" : "users"}${
              hasFilters ? " matching your filters" : ""
            }`}
      </p>

      {loading ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <DashboardError error={error} onRetry={refetch} />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : UserRound}
          title={hasFilters ? "No users match" : "No users found"}
          description={
            hasFilters
              ? "Try another role or search term, or clear the filters to see every account."
              : "Registered accounts will appear here as users sign up."
          }
          action={
            hasFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setRole("");
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="pr-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((account) => {
                  const isSelf = currentUser?.id === account.id;

                  return (
                    <TableRow key={account.id}>
                      <TableCell className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            {account.image ? (
                              <AvatarImage src={account.image} alt="" />
                            ) : null}
                            <AvatarFallback>
                              {initials(account.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">
                              {account.name}
                              {isSelf ? (
                                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  You
                                </span>
                              ) : null}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {account.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {account.role ? (
                          <StatusBadge
                            status={account.role}
                            label={roleLabels[account.role]}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not set
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={account.plan}
                          label={planLabels[account.plan]}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(account.createdAt)}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => openRoleDialog(account)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "You cannot change your own role here."
                              : undefined
                          }
                        >
                          <ShieldCheck aria-hidden="true" />
                          Change role
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={data?.page ?? page}
            totalPages={data?.totalPages ?? 1}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={loading}
          />
        </>
      ) : null}

      <Dialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open && !working) {
            setTarget(null);
            setDialogError(null);
          }
        }}
      >
        <DialogContent showCloseButton={!working}>
          <DialogHeader>
            <DialogTitle>Change account role</DialogTitle>
            <DialogDescription>
              {target
                ? `Choose the role for ${target.name}. This changes the dashboard and permissions the server grants.`
                : "Choose a new role."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {dialogError ? (
              <InlineAlert variant="error" title="Role not updated">
                {dialogError}
              </InlineAlert>
            ) : null}

            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Current role</span>
                <span className="font-semibold">
                  {target?.role ? roleLabels[target.role] : "Not set"}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {target?.email}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-role-select">New role</Label>
              <NativeSelect
                id="admin-role-select"
                value={nextRole}
                onChange={(event) =>
                  setNextRole(event.target.value as UserRole)
                }
                disabled={working}
              >
                {USER_ROLES.map((option) => (
                  <option key={option} value={option}>
                    {roleLabels[option]}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <InlineAlert variant="warning" title="Check before you change">
              Admins can moderate tuition posts and manage accounts. Make sure
              the role matches the person&apos;s responsibilities.
            </InlineAlert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTarget(null)}
              disabled={working}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRoleChange}
              disabled={working || !nextRole}
            >
              {working ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : null}
              {working ? "Updating…" : "Update role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
