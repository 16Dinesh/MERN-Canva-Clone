"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

const API_URL ="https://api-gateway-canva-clone.onrender.com";

function ServiceLoader({ children }) {
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);

  const [services, setServices] = useState({
    DESIGN: "checking",
    UPLOAD: "checking",
    SUBSCRIPTION: "checking",
  });

  useEffect(() => {
    let mounted = true;
    let healthInterval;
    let timerInterval;

    const startTime = Date.now();

    const checkHealth = async () => {
      try {
        if (!API_URL) {
          console.error(
            "NEXT_PUBLIC_API_URL is not defined."
          );
          return;
        }

        const healthUrl = `${API_URL}/health`;

        console.log("Checking services:", healthUrl);

        const response = await fetch(healthUrl, {
          method: "GET",
          cache: "no-store",
        });

        const text = await response.text();

        console.log("Health response:", {
          status: response.status,
          body: text,
        });

        if (!response.ok) {
          throw new Error(
            `Health check failed: ${response.status}`
          );
        }

        let data;

        try {
          data = JSON.parse(text);
        } catch (error) {
          console.error(
            "Gateway returned invalid JSON:",
            text
          );

          throw new Error(
            "API Gateway returned non-JSON response"
          );
        }

        if (!mounted) return;

        console.log("Services:", data);

        if (data.services) {
          setServices(data.services);
        }

        const elapsed = Date.now() - startTime;

        if (data.success === true && elapsed >= 20000) {
          console.log("✅ All services are working");

          setLoading(false);

          clearInterval(healthInterval);
          clearInterval(timerInterval);
        }
      } catch (error) {
        console.error(
          "Health check failed:",
          error
        );
      }
    };

    // Check immediately
    checkHealth();

    // Check services every 2 seconds
    healthInterval = setInterval(
      checkHealth,
      2000
    );

    // Update timer
    timerInterval = setInterval(() => {
      if (!mounted) return;

      const elapsed = Date.now() - startTime;

      setSeconds(
        Math.min(
          Math.floor(elapsed / 1000),
          20
        )
      );
    }, 500);

    return () => {
      mounted = false;

      clearInterval(healthInterval);
      clearInterval(timerInterval);
    };
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen relative">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://static.canva.com/web/images/543d7829999d351b301ced5ed3c1f087.jpg)",
          }}
        />

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.55), rgba(0,0,0,0.85))",
          }}
        />

        {/* Logo */}
        <div className="absolute top-4 left-4 z-10">
          <Image
            src="https://static.canva.com/web/images/856bac30504ecac8dbd38dbee61de1f1.svg"
            alt="canva"
            width={90}
            height={30}
            priority
          />
        </div>

        {/* Loader */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-black/50 backdrop-blur-md p-8 text-white text-center">

            <Loader2 className="w-12 h-12 mx-auto mb-5 animate-spin text-purple-400" />

            <h1 className="text-2xl font-semibold mb-2">
              Services are getting ready
            </h1>

            <p className="text-gray-300 mb-6">
              Please wait while we prepare the application.
            </p>

            {/* Progress bar */}
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500 transition-all duration-500"
                style={{
                  width: `${(seconds / 20) * 100}%`,
                }}
              />
            </div>

            <p className="text-sm text-gray-400 mb-6">
              {seconds < 20
                ? `Preparing application... ${seconds}/20 seconds`
                : "Checking services..."}
            </p>

            {/* Services */}
            <div className="space-y-3 text-left">

              <ServiceStatus
                name="Design Service"
                status={services.DESIGN}
              />

              <ServiceStatus
                name="Upload Service"
                status={services.UPLOAD}
              />

              <ServiceStatus
                name="Subscription Service"
                status={services.SUBSCRIPTION}
              />

            </div>

          </div>
        </div>
      </div>
    );
  }


  return children;
}


// ==========================================
// SERVICE STATUS
// ==========================================

function ServiceStatus({ name, status }) {
  const working = status === "working";

  return (
    <div className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-3">

      <span className="text-sm">
        {name}
      </span>

      {working ? (
        <div className="flex items-center gap-2 text-green-400">

          <CheckCircle2 className="w-4 h-4" />

          <span className="text-sm">
            working
          </span>

        </div>
      ) : (
        <div className="flex items-center gap-2 text-yellow-400">

          <Loader2 className="w-4 h-4 animate-spin" />

          <span className="text-sm">
            getting ready
          </span>

        </div>
      )}

    </div>
  );
}

export default ServiceLoader;
