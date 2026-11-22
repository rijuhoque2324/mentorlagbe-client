import { asRecord } from "@/lib/normalize";

export function getAuthErrorMessage(error: unknown): string {
  if (!error) {
    return "We could not complete that request. Please try again.";
  }

  const record = asRecord(error);
  const message = record.message ?? record.error ?? record.statusText;

  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not complete that request. Please try again.";
}
