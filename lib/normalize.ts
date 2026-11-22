import type {
  Application,
  ApplicationStatus,
  Bookmark,
  ModerationStatus,
  PlanTier,
  Transaction,
  TransactionStatus,
  Tuition,
  TuitionMode,
  TutorSummary,
  User,
  UserRole,
} from "@/types";

type UnknownRecord = Record<string, unknown>;

export function asRecord(value: unknown): UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function first(...values: unknown[]): unknown {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

function text(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function decimal(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const cleaned = text(value).replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function integer(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  const match = text(value).match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

function flag(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === 1 || value === "1") {
    return true;
  }

  if (value === "false" || value === 0 || value === "0") {
    return false;
  }

  return fallback;
}

export function identifier(value: unknown): string {
  const record = asRecord(value);
  return text(first(record.id, record._id, record.value));
}

export function normalizeRole(value: unknown): UserRole | null {
  const raw = text(value).trim().toLowerCase();

  if (!raw) {
    return null;
  }

  if (raw === "student" || raw === "tutor" || raw === "admin") {
    return raw;
  }

  if (raw.includes("admin") || raw.includes("moderator")) {
    return "admin";
  }

  if (raw.includes("tutor") || raw.includes("teacher")) {
    return "tutor";
  }

  if (raw.includes("student") || raw.includes("learner")) {
    return "student";
  }

  return null;
}

export function normalizePlan(value: unknown): PlanTier {
  if (typeof value === "boolean") {
    return value ? "pro" : "free";
  }

  const raw = text(value).trim().toLowerCase();

  if (!raw) {
    return "free";
  }

  if (raw.includes("pro") || raw.includes("premium") || raw.includes("paid")) {
    return "pro";
  }

  return "free";
}

export function normalizeMode(value: unknown): TuitionMode {
  const raw = text(value).trim().toLowerCase();

  if (raw === "online" || raw === "remote" || raw === "virtual") {
    return "online";
  }

  if (raw === "offline" || raw === "in-person" || raw === "physical") {
    return "offline";
  }

  if (raw === "hybrid" || raw === "both" || raw === "mixed") {
    return "hybrid";
  }

  return "unknown";
}

export function normalizeModerationStatus(value: unknown): ModerationStatus {
  const raw = text(value).trim().toLowerCase();

  if (raw.includes("approve") || raw === "active" || raw === "published") {
    return "approved";
  }

  if (raw.includes("reject") || raw === "declined") {
    return "rejected";
  }

  return "pending";
}

export function normalizeApplicationStatus(value: unknown): ApplicationStatus {
  const raw = text(value).trim().toLowerCase();

  if (raw === "accepted" || raw === "approved") {
    return "accepted";
  }

  if (raw === "rejected" || raw === "declined") {
    return "rejected";
  }

  if (raw === "cancelled" || raw === "canceled" || raw === "withdrawn") {
    return "cancelled";
  }

  return "pending";
}

export function normalizeTransactionStatus(value: unknown): TransactionStatus {
  const raw = text(value).trim().toLowerCase();

  if (raw === "paid" || raw === "succeeded" || raw === "success") {
    return "paid";
  }

  if (raw === "failed" || raw === "error") {
    return "failed";
  }

  if (raw === "refunded" || raw === "refund") {
    return "refunded";
  }

  if (raw === "cancelled" || raw === "canceled" || raw === "expired") {
    return "cancelled";
  }

  return "pending";
}

export function normalizeUser(raw: unknown): User {
  const record = asRecord(raw);
  const subscription = asRecord(record.subscription);

  return {
    id: identifier(record),
    name: text(
      first(record.name, record.fullName, record.username),
      "MentorLagbe user",
    ),
    email: text(record.email),
    role: normalizeRole(record.role),
    plan: normalizePlan(
      first(
        record.plan,
        record.planTier,
        record.subscriptionPlan,
        subscription.plan,
        record.isPro,
      ),
    ),
    image: text(first(record.image, record.avatar, record.photoURL)) || undefined,
    phone:
      text(first(record.phone, record.phoneNumber, record.mobile)) || undefined,
    bio: text(record.bio) || undefined,
    location: text(first(record.location, record.address)) || undefined,
    createdAt: text(record.createdAt) || undefined,
  };
}

function normalizeTutor(raw: unknown): TutorSummary | undefined {
  const record = asRecord(raw);

  if (Object.keys(record).length === 0) {
    return undefined;
  }

  return {
    id: identifier(record),
    name: text(first(record.name, record.fullName), "Tutor"),
    email: text(record.email) || undefined,
    image: text(first(record.image, record.avatar)) || undefined,
    verified: flag(first(record.verified, record.isVerified), false),
  };
}

export function normalizeTuition(raw: unknown): Tuition {
  const record = asRecord(raw);
  const rawTutor = record.tutor;
  const tutor =
    rawTutor !== null && typeof rawTutor === "object"
      ? normalizeTutor(rawTutor)
      : undefined;
  const status = normalizeModerationStatus(
    first(record.status, record.moderationStatus),
  );
  const bookmarkedValue = record.isBookmarked;

  return {
    id: identifier(record),
    title: text(first(record.title, record.name), "Untitled tuition"),
    subject: text(record.subject),
    classLevel: text(
      first(record.classLevel, record.class, record.grade, record.level),
    ),
    mode: normalizeMode(first(record.mode, record.tuitionType, record.type)),
    location: text(first(record.location, record.area, record.address)),
    monthlyFee: decimal(first(record.monthlyFee, record.fee, record.salary, record.budget)),
    daysPerWeek: integer(
      first(record.daysPerWeek, record.days, record.daysPerWeekCount),
    ),
    description: text(first(record.description, record.details)),
    requirements:
      text(first(record.requirements, record.studentRequirements)) || undefined,
    availability: text(first(record.availability, record.schedule)) || undefined,
    status,
    isActive: flag(
      first(record.isActive, record.active, record.published),
      status === "approved",
    ),
    tutorId: text(
      first(
        record.tutorId,
        typeof rawTutor === "string" ? rawTutor : undefined,
        tutor?.id,
      ),
    ),
    tutor,
    isBookmarked:
      typeof bookmarkedValue === "boolean" ? bookmarkedValue : undefined,
    applicationCount: integer(
      first(record.applicationCount, record.applicationsCount),
    ),
    createdAt: text(record.createdAt) || undefined,
    updatedAt: text(record.updatedAt) || undefined,
  };
}

export function normalizeApplication(raw: unknown): Application {
  const record = asRecord(raw);
  const rawTuition = asRecord(first(record.tuition, record.post));
  const rawStudent = asRecord(
    first(record.student, record.applicant, record.user),
  );

  return {
    id: identifier(record),
    tuitionId: text(first(record.tuitionId, identifier(rawTuition))),
    tuition: Object.keys(rawTuition).length
      ? normalizeTuition(rawTuition)
      : undefined,
    studentId: text(first(record.studentId, identifier(rawStudent))),
    student: Object.keys(rawStudent).length
      ? normalizeUser(rawStudent)
      : undefined,
    status: normalizeApplicationStatus(record.status),
    message: text(first(record.message, record.note)) || undefined,
    createdAt: text(record.createdAt) || undefined,
    updatedAt: text(record.updatedAt) || undefined,
  };
}

export function normalizeBookmark(raw: unknown): Bookmark {
  const record = asRecord(raw);
  const rawTuition = asRecord(first(record.tuition, record.post));

  return {
    id: identifier(record),
    tuitionId: text(first(record.tuitionId, identifier(rawTuition))),
    tuition: Object.keys(rawTuition).length
      ? normalizeTuition(rawTuition)
      : undefined,
    createdAt: text(record.createdAt) || undefined,
  };
}

export function normalizeTransaction(raw: unknown): Transaction {
  const record = asRecord(raw);
  const rawUser = asRecord(first(record.user, record.student, record.tutor));

  return {
    id: identifier(record),
    userId: text(first(record.userId, identifier(rawUser))),
    user: Object.keys(rawUser).length ? normalizeUser(rawUser) : undefined,
    plan: text(first(record.plan, record.planName, record.product), "Pro"),
    amount: decimal(first(record.amount, record.total, record.price)),
    currency: text(first(record.currency), "USD").toUpperCase(),
    status: normalizeTransactionStatus(record.status),
    reference: text(
      first(
        record.reference,
        record.transactionId,
        record.stripeSessionId,
        record.sessionId,
      ),
    ) || undefined,
    createdAt: text(record.createdAt) || undefined,
  };
}
