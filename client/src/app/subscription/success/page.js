import { Suspense } from "react";
import SubscriptionSuccess from "./subscription-success";

function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />

          <h1 className="text-2xl font-bold mb-2">
            Processing Payment
          </h1>

          <p className="text-muted-foreground">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SubscriptionSuccess />
    </Suspense>
  );
}
