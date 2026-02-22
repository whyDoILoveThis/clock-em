"use client";

import { SignInButton, useSignIn } from "@clerk/nextjs";
import React, { useState } from "react";
import { Zap, Sparkles } from "lucide-react";

const DEMO_CREDENTIALS = {
  company: {
    email: "demo-company@test.com",
    password: "DemoCompany123!",
  },
  employee: {
    email: "demo-employee@test.com",
    password: "DemoEmployee123!",
  },
  fresh: {
    email: "demo-fresh@test.com",
    password: "DemoFresh123!",
  },
};

type DemoType = "company" | "employee" | "fresh";

const SplashPage = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [demoLoading, setDemoLoading] = useState<DemoType | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleDemoLogin = async (type: DemoType) => {
    if (!isLoaded || !signIn) return;

    setDemoLoading(type);
    setDemoError(null);

    try {
      const { email, password } = DEMO_CREDENTIALS[type];

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        // Set the active session
        await setActive({ session: result.createdSessionId });
        // Store demo type for the toast
        localStorage.setItem("demo_account_type", type);
        // Redirect will happen automatically after session is set
      } else {
        setDemoError(`Demo ${type} account login failed. Please try again.`);
        setDemoLoading(null);
      }
    } catch (error: any) {
      console.error("Demo login error:", error);
      setDemoError(
        error?.errors?.[0]?.message ||
          `Failed to login to demo ${type} account. Please ensure the account exists in Clerk.`,
      );
      setDemoLoading(null);
    }
  };

  // If a demo switch is in progress, show nothing (overlay handles the UI)
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("demo_switching") === "true"
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <p className="text-lg text-slate-600 dark:text-slate-400 animate-pulse">
          Switching account...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Clock &apos;em
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Please sign in to use this application 😊
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Regular Sign In */}
        <button className="btn px-8 py-3 text-base font-medium">
          <SignInButton mode="modal">Sign In</SignInButton>
        </button>

        {/* Demo Divider */}
        <div className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400 w-full max-w-md">
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-600"></div>
          <span className="whitespace-nowrap px-2">Try Demo</span>
          <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-600"></div>
        </div>

        {/* Demo Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleDemoLogin("company")}
            disabled={demoLoading !== null}
            className={`
              inline-flex items-center justify-center gap-2 px-6 py-2 text-base font-medium
              rounded-lg transition-all duration-200
              ${
                demoLoading === "company"
                  ? "bg-blue-600/40 text-blue-300 cursor-not-allowed opacity-75"
                  : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:border-blue-500/50"
              }
            `}
          >
            <Zap size={16} />
            {demoLoading === "company" ? "Logging in..." : "Demo Company"}
          </button>

          <button
            onClick={() => handleDemoLogin("employee")}
            disabled={demoLoading !== null}
            className={`
              inline-flex items-center justify-center gap-2 px-6 py-2 text-base font-medium
              rounded-lg transition-all duration-200
              ${
                demoLoading === "employee"
                  ? "bg-emerald-600/40 text-emerald-300 cursor-not-allowed opacity-75"
                  : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50"
              }
            `}
          >
            <Zap size={16} />
            {demoLoading === "employee" ? "Logging in..." : "Demo Employee"}
          </button>

          <button
            onClick={() => handleDemoLogin("fresh")}
            disabled={demoLoading !== null}
            className={`
              inline-flex items-center justify-center gap-2 px-6 py-2 text-base font-medium
              rounded-lg transition-all duration-200
              ${
                demoLoading === "fresh"
                  ? "bg-violet-600/40 text-violet-300 cursor-not-allowed opacity-75"
                  : "bg-violet-600/20 hover:bg-violet-600/30 text-violet-600 dark:text-violet-400 border border-violet-500/30 hover:border-violet-500/50"
              }
            `}
          >
            <Sparkles size={16} />
            {demoLoading === "fresh" ? "Logging in..." : "Fresh Sign Up"}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {" "}
        {/* Added margin-top to create space below demo buttons */}
        {/* Error message */}
        {demoError && (
          <div className="max-w-md p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-600 dark:text-red-400">
            {demoError}
          </div>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-500 text-center max-w-md">
          Demo accounts are for testing only. Sign in with your real account to
          access your data.
        </p>
      </div>
    </div>
  );
};

export default SplashPage;
