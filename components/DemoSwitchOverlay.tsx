"use client";

import { useEffect, useState } from "react";

const DemoSwitchOverlay = () => {
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    // Check immediately and also listen for storage changes
    const check = () => {
      setIsSwitching(localStorage.getItem("demo_switching") === "true");
    };

    check();

    // Poll to catch changes from the same tab
    const interval = setInterval(check, 100);

    return () => clearInterval(interval);
  }, []);

  if (!isSwitching) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex items-center justify-center">
      <p className="text-lg text-slate-600 dark:text-slate-400 animate-pulse">
        Switching account...
      </p>
    </div>
  );
};

export default DemoSwitchOverlay;
