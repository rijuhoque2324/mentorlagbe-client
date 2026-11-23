export type UserRole = "student" | "tutor" | "admin";

export type PlanTier = "free" | "pro";

export type TuitionMode = "online" | "offline" | "hybrid" | "unknown";

export type ModerationStatus = "pending" | "approved" | "rejected";

export type ApplicationStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type TransactionStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
  plan: PlanTier;
  image?: string;
  phone?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
}

export interface TutorSummary {
  id: string;
  name: string;
  email?: string;
  image?: string;
  verified?: boolean;
}

export interface Tuition {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: TuitionMode;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  description: string;
  requirements?: string;
  availability?: string;
  status: ModerationStatus;
  isActive: boolean;
  tutorId: string;
  tutor?: TutorSummary;
  isBookmarked?: boolean;
  applicationCount?: number;
  bannerImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  tuitionId: string;
  tuition?: Tuition;
  studentId: string;
  student?: User;
  status: ApplicationStatus;
  message?: string;
  preferredSchedule?: string;
  studentPhone?: string;
  tutorName?: string;
  tutorEmail?: string;
  monthlyFee?: number;
  isPriority?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bookmark {
  id: string;
  tuitionId: string;
  tuition?: Tuition;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  user?: User;
  plan: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  planName?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt?: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface AdminStats {
  users: {
    total: number;
    students: number;
    tutors: number;
    admins: number;
  };
  tuitions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
  };
  transactions: {
    total: number;
    paid: number;
    pending: number;
    failed: number;
    revenue: number;
    currency?: string;
  };
}

export interface TuitionInput {
  title: string;
  subject: string;
  classLevel: string;
  mode: Exclude<TuitionMode, "unknown">;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  description: string;
  requirements?: string;
  availability?: string;
  isActive?: boolean;
  bannerImage?: string;
}

export interface ApplyInput {
  studentNote?: string;
  preferredSchedule?: string;
  phone?: string;
}

export interface ProfileInput {
  name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  /** Profile photo URL (https). Empty string clears the photo. */
  image?: string;
}

export interface CheckoutResponse {
  url?: string;
  sessionId?: string;
  session_id?: string;
}

export type PaymentStatus =
  | TransactionStatus
  | "processing"
  | "unknown";

export interface PaymentStatusResult {
  status: PaymentStatus;
  plan?: string;
  amount?: number;
  currency?: string;
  message?: string;
}

export interface DashboardStats {
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    cancelled: number;
  };
  bookmarks: number;
}
