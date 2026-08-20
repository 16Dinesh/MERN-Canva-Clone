"use client";

import LoginCard from "@/components/login/login-card";
import ServiceLoader from "@/components/service-loader/service-loader";

function Login() {
  return (
    <ServiceLoader>
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
              "linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4), rgba(0,0,0,0.8))",
          }}
        />

        {/* Logo */}
        <div className="absolute top-4 left-4 z-10">
          <img
            src="https://static.canva.com/web/images/856bac30504ecac8dbd38dbee61de1f1.svg"
            alt="canva"
            width={90}
            height={30}
          />
        </div>

        {/* Login */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <LoginCard />
        </div>

      </div>
    </ServiceLoader>
  );
}

export default Login;
