import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoading } from "@/components/shared/loading-states";
import { PaymentSuccessResult } from "@/components/payments/payment-result";

export const metadata: Metadata = {
  title: "Payment Result",
  description:
    "Check the authoritative payment status returned by the server after Stripe Checkout.",
};

type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<PageLoading label="Loading payment result…" />}>
      <PaymentSuccessContent searchParams={searchParams} />
    </Suspense>
  );
}

async function PaymentSuccessContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string"
      ? params.session_id
      : typeof params.checkout_session_id === "string"
        ? params.checkout_session_id
        : undefined;

  return <PaymentSuccessResult sessionId={sessionId} />;
}
