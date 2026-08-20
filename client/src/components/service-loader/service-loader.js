"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SERVICE_URLS = {
  GATEWAY: API_URL,
  DESIGN: "https://design-service-mern-canva-clone.onrender.com",
  UPLOAD: "https://upload-service-mern-canva-clone.onrender.com",
  SUBSCRIPTION:
    "https://subscription-service-mern-canva-clone.onrender.com",
};

function ServiceLoader({ children }) {
  const [loading, setLoading] = useState(true);

  const [seconds, setSeconds] = useState(0);

  const [services, setServices] = useState({
    GATEWAY: "checking",
    DESIGN: "checking",
    UPLOAD: "checking",
    SUBSCRIPTION: "checking",
  });

  useEffect(() => {
    let mounted = true;
    let healthInterval = null;
    let timerInterval = null;

    const startTime = Date.now();

    const checkService = async (name, url) => {
      try {
        if (!url) {
          console.error(`${name} URL is missing`);

          if (mounted) {
            setServices((prev) => ({
              ...prev,
              [name]: "not configured",
            }));
          }

          return false;
        }

        const healthUrl = `${url}/health`;

        console.log(`🔍 Checking ${name}: ${healthUrl}`);

        const response = await fetch(healthUrl, {
          method: "GET",
          cache: "no-store",
        });

        const text = await response.text();

        console.log(`📡 ${name} response:`, {
          status: response.status,
          body: text,
        });

        if (!response.ok) {
          if (mounted) {
            setServices((prev) => ({
              ...prev,
              [name]: `error-${response.status}`,
            }));
          }

          return false;
        }


        if (name === "GATEWAY") {
          try {
            const data = JSON.parse(text);

            console.log("🌐 Gateway health:", data);

            if (mounted) {
              setServices((prev) => ({
                ...prev,

                GATEWAY:
                  data.success === true
                    ? "working"
                    : "getting ready",

                DESIGN:
                  data.services?.DESIGN ||
                  prev.DESIGN,

                UPLOAD:
                  data.services?.UPLOAD ||
                  prev.UPLOAD,

                SUBSCRIPTION:
                  data.services?.SUBSCRIPTION ||
                  prev.SUBSCRIPTION,
              }));
            }

            return data.success === true;
          } catch (error) {
            console.error(
              "❌ Gateway returned invalid JSON:",
              text
            );

            if (mounted) {
              setServices((prev) => ({
                ...prev,
                GATEWAY: "invalid response",
              }));
            }

            return false;
          }
        }

        if (text.trim() === "working") {
          if (mounted) {
            setServices((prev) => ({
              ...prev,
              [name]: "working",
            }));
          }

          return true;
        }

        // Unexpected response

        if (mounted) {
          setServices((prev) => ({
            ...prev,
            [name]: "unexpected response",
          }));
        }

        return false;
      } catch (error) {
        console.error(
          `❌ ${name} health check failed:`,
          error
        );

        if (mounted) {
          setServices((prev) => ({
            ...prev,
            [name]: "not working",
          }));
        }

        return false;
      }
    };

    const checkAllServices = async () => {
      console.log("");
      console.log("========================================");
      console.log("🚀 CHECKING ALL SERVICES");
      console.log("========================================");

      const results = await Promise.all([
        checkService(
          "GATEWAY",
          SERVICE_URLS.GATEWAY
        ),

        checkService(
          "DESIGN",
          SERVICE_URLS.DESIGN
        ),

        checkService(
          "UPLOAD",
          SERVICE_URLS.UPLOAD
        ),

        checkService(
          "SUBSCRIPTION",
          SERVICE_URLS.SUBSCRIPTION
        ),
      ]);

      const [
        gatewayWorking,
        designWorking,
        uploadWorking,
        subscriptionWorking,
      ] = results;

      const allWorking =
        gatewayWorking &&
        designWorking &&
        uploadWorking &&
        subscriptionWorking;

      const elapsed =
        Date.now() - startTime;

      console.log("========================================");
      console.log(
        `🌐 Gateway: ${
          gatewayWorking
            ? "WORKING"
            : "NOT WORKING"
        }`
      );

      console.log(
        `🎨 Design: ${
          designWorking
            ? "WORKING"
            : "NOT WORKING"
        }`
      );

      console.log(
        `📁 Upload: ${
          uploadWorking
            ? "WORKING"
            : "NOT WORKING"
        }`
      );

      console.log(
        `💳 Subscription: ${
          subscriptionWorking
            ? "WORKING"
            : "NOT WORKING"
        }`
      );

      console.log(
        `⏱️ Elapsed: ${Math.floor(
          elapsed / 1000
        )} seconds`
      );

      console.log(
        `🎯 All working: ${allWorking}`
      );

      console.log("========================================");


      if (
        mounted &&
        allWorking &&
        elapsed >= 20000
      ) {
        console.log(
          "🎉 ALL SERVICES ARE WORKING"
        );

        setLoading(false);

        if (healthInterval) {
          clearInterval(healthInterval);
        }

        if (timerInterval) {
          clearInterval(timerInterval);
        }
      }
    };


    checkAllServices();

    healthInterval = setInterval(
      checkAllServices,
      10000
    );


    timerInterval = setInterval(() => {
      if (!mounted) return;

      const elapsed =
        Date.now() - startTime;

      setSeconds(
        Math.min(
          Math.floor(elapsed / 1000),
          20
        )
      );
    }, 500);

    return () => {
      mounted = false;

      if (healthInterval) {
        clearInterval(healthInterval);
      }

      if (timerInterval) {
        clearInterval(timerInterval);
      }
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

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-black/50 backdrop-blur-md p-8 text-white text-center shadow-2xl">
            {/* Spinner */}

            <Loader2 className="w-12 h-12 mx-auto mb-5 animate-spin text-purple-400" />

            {/* Title */}

            <h1 className="text-2xl font-semibold mb-2">
              Services are getting ready
            </h1>

            {/* Description */}

            <p className="text-gray-300 mb-6">
              Please wait while we prepare the
              application.
            </p>

            {/* Progress bar */}

            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500 transition-all duration-500"
                style={{
                  width: `${
                    (seconds / 20) * 100
                  }%`,
                }}
              />
            </div>

            {/* Timer */}

            <p className="text-sm text-gray-400 mb-6">
              {seconds < 20
                ? `Preparing application... ${seconds}/20 seconds`
                : "Checking services..."}
            </p>

            {/* Services */}

            <div className="space-y-3 text-left">
              <ServiceStatus
                name="API Gateway"
                status={services.GATEWAY}
                url={SERVICE_URLS.GATEWAY}
              />

              <ServiceStatus
                name="Design Service"
                status={services.DESIGN}
                url={SERVICE_URLS.DESIGN}
              />

              <ServiceStatus
                name="Upload Service"
                status={services.UPLOAD}
                url={SERVICE_URLS.UPLOAD}
              />

              <ServiceStatus
                name="Subscription Service"
                status={
                  services.SUBSCRIPTION
                }
                url={
                  SERVICE_URLS.SUBSCRIPTION
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }


  return children;
}


function ServiceStatus({
  name,
  status,
  url,
}) {
  const working =
    status === "working";

  return (
    <div className="bg-white/10 rounded-lg px-4 py-3">
      {/* Service name + status */}

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">
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
              {status === "checking"
                ? "checking"
                : "not working"}
            </span>
          </div>
        )}
      </div>

      {/* Show URL if service isn't working */}

      {!working && url && (
        <div className="mt-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs text-blue-300 hover:bg-white/20 hover:text-blue-200 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />

            <span className="break-all">
              Open {name}
            </span>
          </a>

          <p className="text-[10px] text-gray-500 mt-1 break-all">
            {url}/health
          </p>
        </div>
      )}
    </div>
  );
}

export default ServiceLoader;
