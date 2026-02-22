import { useEffect, useState, useRef } from "react";
import Loader from "./Loader";
import { LogIn, LogOut, Clock } from "lucide-react";

interface Props {
  userId: string;
  companyId: string;
  isClockedIn: boolean;
  timecardsLoading: boolean;
  timecardsReady: boolean;
  refetch: () => Promise<any>;
}

const ClockInOut = ({
  userId,
  companyId,
  isClockedIn,
  timecardsLoading,
  timecardsReady,
  refetch,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Realtime clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState("00:00:00");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update current time every second
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // When clocked in, start the duration timer
  useEffect(() => {
    if (isClockedIn) {
      // If we don't have a clock-in time, set it to now (or it auto-resumes)
      setClockInTime((prev) => prev ?? new Date());
    } else {
      setClockInTime(null);
      setElapsed("00:00:00");
    }
  }, [isClockedIn]);

  // Duration counter
  useEffect(() => {
    if (clockInTime) {
      intervalRef.current = setInterval(() => {
        const diff = Math.floor((Date.now() - clockInTime.getTime()) / 1000);
        const h = Math.floor(diff / 3600)
          .toString()
          .padStart(2, "0");
        const m = Math.floor((diff % 3600) / 60)
          .toString()
          .padStart(2, "0");
        const s = (diff % 60).toString().padStart(2, "0");
        setElapsed(`${h}:${m}:${s}`);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [clockInTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleClockIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clockIn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, companyId }),
      });

      if (response.status === 565) {
        setError("You have already sent time in today");
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setClockInTime(new Date());
      console.log("✅ Clock In Successful");
    } catch (error) {
      console.error("❌ Clock In Error:", error);
    } finally {
      setIsLoading(false);
      refetch();
    }
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clockOut`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, employerName: companyId }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setError(data.message);
      setClockInTime(null);
      console.log("✅ Clock Out Successful:", data.message);
    } catch (error) {
      console.error("❌ Clock Out Error:", error);
    } finally {
      setIsLoading(false);
      refetch();
    }
  };

  const ready = !timecardsLoading && timecardsReady;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Realtime clock display */}
      <div className="w-full rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border border-white/20 dark:border-slate-700/30 p-4 space-y-3">
        {/* Current time */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current Time
          </span>
          <span className="font-mono text-lg font-semibold text-slate-800 dark:text-slate-100">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Clock in time */}
        {isClockedIn && clockInTime && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Clocked In At
            </span>
            <span className="font-mono text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {formatTime(clockInTime)}
            </span>
          </div>
        )}

        {/* Elapsed time */}
        {isClockedIn && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
            <span className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Duration
            </span>
            <span className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-300 tabular-nums">
              {elapsed}
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
            error === "Clocked out successfully"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          {error}
        </p>
      )}

      {/* Clock buttons */}
      <div className="flex gap-3 w-full">
        {!isClockedIn ? (
          ready ? (
            <button
              onClick={handleClockIn}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
                bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white
                shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_28px_-4px_rgba(16,185,129,0.5)]"
            >
              {isLoading ? (
                <Loader color="green" />
              ) : (
                <>
                  <LogIn size={20} />
                  Clock In
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center px-6 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Loader color="green" />
            </div>
          )
        ) : ready ? (
          <button
            onClick={handleClockOut}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
              bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white
              shadow-[0_4px_20px_-4px_rgba(244,63,94,0.4)] hover:shadow-[0_6px_28px_-4px_rgba(244,63,94,0.5)]"
          >
            {isLoading ? (
              <Loader color="red" />
            ) : (
              <>
                <LogOut size={20} />
                Clock Out
              </>
            )}
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center px-6 py-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <Loader color="red" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockInOut;
