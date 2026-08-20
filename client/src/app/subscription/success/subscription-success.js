"use client";

import { capturePaypalOrder } from "@/services/subscription-service";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function SubscriptionSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const orderId = searchParams.get("token");

    if (!orderId) {
      console.error("PayPal order token is missing");
      setStatus("error");
      return;
    }

    const processPayment = async () => {
      try {
        console.log("Capturing PayPal order:", orderId);

        const response = await capturePaypalOrder(orderId);

        console.log("Capture response:", response);

        if (response?.success) {
          router.push("/");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Payment capture failed:", error);
        setStatus("error");
      }
    };

    processPayment();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
        {status === "processing" && (
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />

            <h1 className="text-2xl font-bold mb-2">
              Processing Payment
            </h1>

            <p className="text-muted-foreground mb-4">
              Please wait while we confirm your payment
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold mb-2 text-red-500">
              Payment Processing Failed
            </h1>

            <p className="text-muted-foreground mb-4">
              We could not confirm your payment.
            </p>

            <button
              onClick={() => router.push("/")}
              className="rounded-md bg-primary px-4 py-2 text-white"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionSuccess;
