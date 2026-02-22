"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, AlertCircle } from "lucide-react";
import { useUser, useSignIn, useClerk } from "@clerk/nextjs";

type DemoType = "company" | "employee" | "fresh";

const DEMO_CREDENTIALS = {
  company: {
    email: "demo-company@test.com",
    password: "DemoCompany123!",
    label: "Company",
  },
  employee: {
    email: "demo-employee@test.com",
    password: "DemoEmployee123!",
    label: "Employee",
  },
  fresh: {
    email: "demo-fresh@test.com",
    password: "DemoFresh123!",
    label: "Fresh Account",
  },
};

const DemoAccountToast = () => {
  const { user } = useUser();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useClerk();
  const [demoType, setDemoType] = useState<DemoType | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSwitching, setIsSwitching] = useState<DemoType | null>(null);

  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      const email = user.emailAddresses[0].emailAddress;
      if (email === DEMO_CREDENTIALS.company.email) {
        setDemoType("company");
      } else if (email === DEMO_CREDENTIALS.employee.email) {
        setDemoType("employee");
      } else if (email === DEMO_CREDENTIALS.fresh.email) {
        setDemoType("fresh");
      } else {
        setDemoType(null);
      }
    } else {
      setDemoType(null);
    }
  }, [user]);

  if (!demoType) return null;

  const otherTypes = (Object.keys(DEMO_CREDENTIALS) as DemoType[]).filter(
    (t) => t !== demoType,
  );

  const handleSwitch = async (targetType: DemoType) => {
    if (!isLoaded || !signIn) return;

    setIsSwitching(targetType);
    localStorage.setItem("demo_switching", "true");

    try {
      const { email, password } = DEMO_CREDENTIALS[targetType];

      await signOut({ redirectUrl: undefined });

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        localStorage.removeItem("demo_switching");
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Switch account error:", error);
      localStorage.removeItem("demo_switching");
      window.location.href = "/";
    } finally {
      setIsSwitching(null);
    }
  };

  return (
    <>
      <div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out"
        style={{
          transform: `translateY(-50%) translateX(${isHovered ? "0" : "calc(-100% + 8px)"})`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-gradient-to-r from-amber-950/90 to-amber-900/90 dark:from-amber-900/95 dark:to-amber-950/95 backdrop-blur-xl border border-amber-700/40 dark:border-amber-600/40 rounded-r-2xl shadow-lg overflow-hidden">
          {/* Peek indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400"></div>

          <div className="pl-4 pr-4 py-4 min-w-[280px] flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start gap-2">
              <AlertCircle
                size={18}
                className="text-amber-400 shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-50">
                  Demo Account
                </h4>
                <p className="text-xs text-amber-100/70 mt-0.5">
                  You&apos;re using the{" "}
                  <span className="font-medium capitalize">
                    {DEMO_CREDENTIALS[demoType].label}
                  </span>{" "}
                  demo
                </p>
              </div>
            </div>

            {/* Switch buttons */}
            <div className="flex flex-col gap-2">
              {otherTypes.map((targetType) => (
                <button
                  key={targetType}
                  onClick={() => handleSwitch(targetType)}
                  disabled={isSwitching !== null}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-700/40 hover:bg-amber-600/50 text-amber-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSwitching === targetType ? (
                    "Switching..."
                  ) : (
                    <>
                      Switch to {DEMO_CREDENTIALS[targetType].label}
                      <ChevronRight size={12} />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoAccountToast;
