"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

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

  const handleCancel = () => {
    localStorage.removeItem("demo_switching");
    setIsSwitching(false);
  };

  if (!isSwitching) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg text-slate-600 dark:text-slate-400 animate-pulse">
          Switching account...
        </p>
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DemoSwitchOverlay;
