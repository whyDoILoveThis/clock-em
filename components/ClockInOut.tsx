import { useEffect, useState, useRef } from "react";
import Loader from "./Loader";
import { LogIn, LogOut, Clock, Pause, Play, Coffee } from "lucide-react";

interface BreakEntry {
  startTime: Date;
  endTime: Date | null;
}

interface Props {
  userId: string;
  companyId: string;
  isClockedIn: boolean;
  dbClockInTime: Date | null;
  dbBreakCount: number;
  dbIsOnBreak: boolean;
  dbBreaks: BreakEntry[];
  timecardsLoading: boolean;
  timecardsReady: boolean;
  refetch: () => Promise<any>;
}

const ClockInOut = ({
  userId,
  companyId,
  isClockedIn,
  dbClockInTime,
  dbBreakCount,
  dbIsOnBreak,
  dbBreaks,
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
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakCount, setBreakCount] = useState(0);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [breaks, setBreaks] = useState<BreakEntry[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total break seconds from break records
  const getTotalBreakSeconds = (breakList: BreakEntry[]) => {
    return breakList.reduce((total, b) => {
      const start = new Date(b.startTime).getTime();
      const end = b.endTime ? new Date(b.endTime).getTime() : Date.now();
      return total + Math.floor((end - start) / 1000);
    }, 0);
  };

  const formatDurationSeconds = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const formatShortTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Update current time every second
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Stable primitives for useEffect dependencies (avoid new object/array refs each render)
  const dbClockInTimeMs = dbClockInTime?.getTime() ?? null;
  const dbBreaksKey = JSON.stringify(dbBreaks);

  // When clocked in, sync state from DB props
  useEffect(() => {
    if (isClockedIn) {
      // Use the actual clock-in time from the database
      setClockInTime(dbClockInTime ?? new Date());
      setBreakCount(dbBreakCount);
      setIsOnBreak(dbIsOnBreak);
      setBreaks(dbBreaks);
      if (dbIsOnBreak && dbBreaks.length > 0) {
        const activeBreak = dbBreaks.find((b) => !b.endTime);
        if (activeBreak) setBreakStartTime(new Date(activeBreak.startTime));
      }
    } else {
      setClockInTime(null);
      setElapsed("00:00:00");
      setIsOnBreak(false);
      setBreakCount(0);
      setBreakStartTime(null);
      setBreaks([]);
    }
  }, [isClockedIn, dbClockInTimeMs, dbBreakCount, dbIsOnBreak, dbBreaksKey]);

  // Duration counter — subtracts break time from total elapsed
  useEffect(() => {
    if (clockInTime) {
      intervalRef.current = setInterval(() => {
        const totalSec = Math.floor(
          (Date.now() - clockInTime.getTime()) / 1000,
        );
        const breakSec = getTotalBreakSeconds(breaks);
        const workSec = Math.max(0, totalSec - breakSec);
        setElapsed(formatDurationSeconds(workSec));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [clockInTime, breaks]);

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

  const handlePauseResume = async () => {
    try {
      const newBreakState = !isOnBreak;
      const now = new Date();

      if (!newBreakState) {
        // Resuming from break — close the active break
        setIsOnBreak(false);
        setBreaks((prev) =>
          prev.map((b) => (b.endTime === null ? { ...b, endTime: now } : b)),
        );
        setBreakStartTime(null);
        setBreakCount(breakCount + 1);
      } else {
        // Starting a break — add a new open break
        setIsOnBreak(true);
        setBreakStartTime(now);
        setBreaks((prev) => [...prev, { startTime: now, endTime: null }]);
      }

      // Call API to record break
      const response = await fetch(`/api/recordBreak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          companyId,
          isStarting: newBreakState,
          timestamp: now,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Refresh timecards so breaks persist across mount/unmount
      await refetch();
    } catch (error) {
      console.error("❌ Break Toggle Error:", error);
      setError("Failed to toggle break");
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
          <>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <span className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Duration
              </span>
              <span className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-300 tabular-nums">
                {elapsed}
              </span>
            </div>

            {/* Break info */}
            {(breaks.length > 0 || isOnBreak) && (
              <div className="space-y-2 pt-1">
                {/* Break counter + total break time */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Breaks ({breakCount}
                    {isOnBreak ? "+1" : ""})
                  </span>
                  <span className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                    {formatDurationSeconds(getTotalBreakSeconds(breaks))}
                  </span>
                </div>

                {/* Break list */}
                {breaks.length > 0 && (
                  <div className="space-y-1">
                    {breaks.map((b, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-2.5 py-1 rounded-md text-xs ${
                          !b.endTime
                            ? "bg-amber-500/15 border border-amber-500/30"
                            : "bg-slate-100/60 dark:bg-slate-700/40"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Coffee size={11} className="text-amber-500" />
                          <span className="text-slate-600 dark:text-slate-300">
                            {formatShortTime(b.startTime)}
                            {" – "}
                            {b.endTime ? formatShortTime(b.endTime) : "now"}
                          </span>
                        </div>
                        {!b.endTime && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Active
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
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
          <>
            {/* Pause/Resume button */}
            <button
              onClick={handlePauseResume}
              className={`flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white
                ${
                  isOnBreak
                    ? "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-[0_4px_20px_-4px_rgba(217,119,6,0.4)] hover:shadow-[0_6px_28px_-4px_rgba(217,119,6,0.5)]"
                    : "bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_28px_-4px_rgba(139,92,246,0.5)]"
                }`}
            >
              {isOnBreak ? (
                <>
                  <Play size={18} />
                  Resume
                </>
              ) : (
                <>
                  <Pause size={18} />
                  Break
                </>
              )}
            </button>

            {/* Clock out button */}
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
          </>
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
