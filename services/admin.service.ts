import {
  apiGet,
  apiGetRaw,
  apiPatch,
  buildParams,
  toPage,
} from "@/lib/api";
import {
  normalizeTransaction,
  normalizeTuition,
  normalizeUser,
  asRecord,
} from "@/lib/normalize";
import type {
  AdminStats,
  ModerationStatus,
  Page,
  Transaction,
  Tuition,
  User,
  UserRole,
} from "@/types";

export interface AdminUserQuery {
  search?: string;
  role?: UserRole | "";
  page?: number;
  limit?: number;
}

export interface AdminTuitionQuery {
  search?: string;
  status?: ModerationStatus | "";
  page?: number;
  limit?: number;
}

export interface AdminTransactionQuery {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

function numberFrom(value: unknown, fallback = 0): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numeric) ? numeric : fallback;
}

export const adminService = {
  async stats(): Promise<AdminStats> {
    const payload = await apiGet<unknown>("/admin/stats");
    const root = asRecord(payload);
    const users = asRecord(root.users);
    const tuitions = asRecord(root.tuitions);
    const transactions = asRecord(root.transactions);

    return {
      users: {
        total: numberFrom(users.total ?? root.totalUsers),
        students: numberFrom(users.students ?? users.student),
        tutors: numberFrom(users.tutors ?? users.tutor),
        admins: numberFrom(users.admins ?? users.admin),
      },
      tuitions: {
        total: numberFrom(tuitions.total ?? root.totalTuitions),
        pending: numberFrom(tuitions.pending),
        approved: numberFrom(tuitions.approved),
        rejected: numberFrom(tuitions.rejected),
        active: numberFrom(tuitions.active),
      },
      transactions: {
        total: numberFrom(transactions.total ?? root.totalTransactions),
        paid: numberFrom(transactions.paid),
        pending: numberFrom(transactions.pending),
        failed: numberFrom(transactions.failed),
        revenue: numberFrom(
          transactions.revenue ?? transactions.totalRevenue,
        ),
        currency:
          typeof transactions.currency === "string"
            ? transactions.currency
            : undefined,
      },
    };
  },

  async users(query: AdminUserQuery = {}): Promise<Page<User>> {
    const payload = await apiGetRaw("/admin/users", {
      params: buildParams({ ...query }),
    });

    return toPage(payload, normalizeUser);
  },

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const payload = await apiPatch<unknown>(`/admin/users/${id}`, { role });
    return normalizeUser(payload);
  },

  async tuitions(query: AdminTuitionQuery = {}): Promise<Page<Tuition>> {
    const payload = await apiGetRaw("/admin/tuitions", {
      params: buildParams({ ...query }),
    });

    return toPage(payload, normalizeTuition);
  },

  async moderate(
    id: string,
    status: Extract<ModerationStatus, "approved" | "rejected">,
    reason?: string,
  ): Promise<Tuition> {
    const payload = await apiPatch<unknown>(
      `/admin/tuitions/${id}/moderate`,
      {
        status,
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      },
    );

    return normalizeTuition(payload);
  },

  async transactions(
    query: AdminTransactionQuery = {},
  ): Promise<Page<Transaction>> {
    const payload = await apiGetRaw("/admin/transactions", {
      params: buildParams({ ...query }),
    });

    return toPage(payload, normalizeTransaction);
  },
};
