import { apiGet, apiPost, buildParams } from "@/lib/api";
import { asRecord, normalizeTransactionStatus } from "@/lib/normalize";
import type {
  CheckoutResponse,
  PaymentStatusResult,
  UserRole,
} from "@/types";

export interface CheckoutPlan {
  plan: string;
  role: UserRole;
}

export const paymentService = {
  async createCheckout(input: CheckoutPlan): Promise<CheckoutResponse> {
    return apiPost<CheckoutResponse>("/payments/checkout", input);
  },

  async status(sessionId: string): Promise<PaymentStatusResult> {
    const payload = await apiGet<unknown>("/payments/status", {
      params: buildParams({ session_id: sessionId }),
    });

    const record = asRecord(payload);
    const rawStatus =
      typeof record.status === "string" ? record.status.toLowerCase() : "";

    const status =
      rawStatus === "processing" || rawStatus === "unknown"
        ? rawStatus
        : normalizeTransactionStatus(rawStatus);

    return {
      status,
      plan:
        typeof record.plan === "string" ? record.plan : undefined,
      amount:
        typeof record.amount === "number"
          ? record.amount
          : typeof record.amount === "string"
            ? Number(record.amount)
            : undefined,
      currency:
        typeof record.currency === "string" ? record.currency : undefined,
      message:
        typeof record.message === "string" ? record.message : undefined,
    };
  },
};
