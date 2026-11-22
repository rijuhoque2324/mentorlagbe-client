import type { Metadata } from "next";

import { PaymentCancelResult } from "@/components/payments/payment-result";

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description:
    "Checkout was cancelled. No payment was completed and no plan was changed.",
};

export default function PaymentCancelPage() {
  return <PaymentCancelResult />;
}
