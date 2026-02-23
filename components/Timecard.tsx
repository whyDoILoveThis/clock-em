import React, { useEffect, useState } from "react";
import { Timecard } from "@/types/types.type";
import {
  formatClockInOutTime,
  formatWeekStartDate,
  formatDayDate,
} from "@/lib/utils";
import axios from "axios";
import { DateTime } from "luxon";
import LoaderSpinSmall from "./Loader";
import ItsDropdown from "./ui/ItsDropdown";
import IconThreeDots from "./icons/IconThreeDots";
import {
  ChevronDown,
  Clock,
  Coffee,
  LogIn,
  LogOut,
  Trash2,
  DollarSign,
  Timer,
} from "lucide-react";

interface Props {
  timecard: Timecard;
  searchTerm?: string;
  ownerId?: string;
  fetchTimecards?: () => Promise<void>;
  forceExpand?: boolean;
  hourlyRate?: number;
}

const SHORT_DAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TimecardComponent = ({
  timecard,
  searchTerm,
  ownerId,
  fetchTimecards,
  forceExpand,
  hourlyRate = 0,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Tick every second when any day is actively clocked in (for realtime hours/pay)
  const isClockedIn = timecard.days.some((d) => d.clockInStatus === true);

  useEffect(() => {
    if (!isClockedIn) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isClockedIn]);

  // Respond to parent "expand all / collapse all"
  useEffect(() => {
    if (forceExpand !== undefined) setExpanded(forceExpand);
  }, [forceExpand]);

  // Helper: compute live hours for a day (accounts for breaks)
  const getLiveHours = (day: (typeof timecard.days)[0]) => {
    if (day.clockInStatus && day.clockIn && !day.clockOut) {
      const clockInMs = new Date(day.clockIn).getTime();
      let totalMs = now - clockInMs;
      // Subtract completed breaks
      if (day.breaks) {
        for (const b of day.breaks) {
          if (b.endTime) {
            totalMs -=
              new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
          } else {
            // Currently on break — subtract from start to now
            totalMs -= now - new Date(b.startTime).getTime();
          }
        }
      }
      return Math.max(0, totalMs / (1000 * 60 * 60));
    }
    return day.hoursWorked || 0;
  };

  // Helper: compute live pay for a day
  const getLivePay = (day: (typeof timecard.days)[0]) => {
    const hours = getLiveHours(day);
    if (day.clockInStatus && day.clockIn && !day.clockOut) {
      return hours * hourlyRate;
    }
    return day.pay || 0;
  };

  // Compute live totals
  const totalHours = timecard.days.reduce((acc, d) => acc + getLiveHours(d), 0);
  const totalPay = timecard.days.reduce((acc, d) => acc + getLivePay(d), 0);

  const isOnBreak = timecard.days.some(
    (d) => d.clockInStatus === true && d.breaks?.some((b) => !b.endTime),
  );

  const handleDeleteTimecard = async (weekStart: Date) => {
    if (confirm("Are you sure you want to delete this timecard?")) {
      setLoading(true);
      try {
        const response = await axios.delete("/api/deleteTimecard", {
          data: {
            companyId: timecard.companyId,
            employeeId: timecard.employeeId,
            weekStart,
          },
        });
        if (response.status === 200) {
          alert("Timecard deleted successfully");
          if (fetchTimecards) await fetchTimecards();
        } else {
          alert("Failed to delete timecard");
        }
      } catch {
        alert("Failed to delete timecard");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <article
      className={`
        w-full rounded-2xl overflow-hidden transition-all duration-300 select-none
        bg-gradient-to-br from-white/60 to-white/30
        dark:from-slate-900/60 dark:to-slate-800/30
        backdrop-blur-xl border border-white/20 dark:border-slate-700/40
        shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)]
        dark:shadow-[0_2px_20px_-4px_rgba(0,0,0,0.3)]
        hover:shadow-[0_4px_28px_-4px_rgba(99,102,241,0.12)]
        dark:hover:shadow-[0_4px_28px_-4px_rgba(99,102,241,0.15)]
      `}
    >
      {/* ── Collapsible Header ── */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 cursor-pointer group"
      >
        {/* Left: week info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-left min-w-0">
          {/* Week date range */}
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">
              {formatWeekStartDate(new Date(timecard.weekStart))}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {DateTime.fromISO(
                typeof timecard.weekStart === "string"
                  ? timecard.weekStart
                  : new Date(timecard.weekStart).toISOString(),
              )
                .toUTC()
                .toLocaleString(DateTime.DATE_MED)}{" "}
              –{" "}
              {DateTime.fromISO(
                typeof timecard.weekStart === "string"
                  ? timecard.weekStart
                  : new Date(timecard.weekStart).toISOString(),
              )
                .toUTC()
                .plus({ days: 6 })
                .toLocaleString(DateTime.DATE_MED)}
            </p>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 tabular-nums">
              <DollarSign size={11} />
              {totalPay.toFixed(2)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-400/20 tabular-nums">
              <Timer size={11} />
              {parseFloat(totalHours.toFixed(2))}h
            </span>
            {isClockedIn && (
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnBreak ? "bg-amber-400" : "bg-green-400"} opacity-60`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${isOnBreak ? "bg-amber-500" : "bg-green-500"}`}
                ></span>
              </span>
            )}
          </div>
        </div>

        {/* Right: chevron + actions */}
        <div className="flex items-center gap-2 shrink-0">
          <ChevronDown
            size={18}
            className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* ── Expandable Body ── */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 pt-1">
          {/* Delete action row */}
          <div className="flex justify-end mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTimecard(timecard.weekStart);
              }}
              className={`
                inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer
                text-red-500 dark:text-red-400
                bg-red-500/8 hover:bg-red-500/15
                transition-colors duration-200
                ${loading ? "opacity-50 pointer-events-none" : ""}
              `}
            >
              {loading ? (
                <LoaderSpinSmall color="red" />
              ) : (
                <>
                  <Trash2 size={13} />
                  Delete
                </>
              )}
            </button>
          </div>

          {/* ── Day Grid: Weekdays row + Weekend row ── */}
          {(() => {
            const weekdays = timecard.days.slice(0, 5);
            const weekend = timecard.days.slice(5, 7);

            const renderDay = (
              day: (typeof timecard.days)[0],
              index: number,
            ) => {
              const liveHours = getLiveHours(day);
              const livePay = getLivePay(day);
              const hours = Math.floor(liveHours);
              const minutes = Math.round((liveHours - hours) * 60);
              const isToday =
                DateTime.fromISO(
                  typeof day.date === "string"
                    ? day.date
                    : new Date(day.date).toISOString(),
                )
                  .toUTC()
                  .toISODate() ===
                DateTime.now().setZone("America/Chicago").toISODate();
              const isSearchMatch =
                searchTerm &&
                searchTerm.toString().split("T")[0] ===
                  new Date(day.date).toISOString().split("T")[0];
              const isActive = day.clockInStatus === true;
              const hasWorked = liveHours > 0;
              const isOnBreak = day.breaks?.some((b) => !b.endTime) ?? false;

              return (
                <div
                  key={index}
                  className={`
                    relative flex flex-col gap-2.5 p-4 rounded-xl
                    bg-white/50 dark:bg-slate-800/40
                    border
                    ${
                      isActive
                        ? "border-green-400/50 shadow-[0_0_12px_-2px_rgba(74,222,128,0.2)]"
                        : isSearchMatch
                          ? "border-yellow-400/50 shadow-[0_0_12px_-2px_rgba(250,204,21,0.15)]"
                          : isToday
                            ? "border-indigo-400/40 shadow-[0_0_12px_-2px_rgba(129,140,248,0.12)]"
                            : "border-transparent"
                    }
                  `}
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span
                        className={`
                          text-[11px] font-bold uppercase tracking-widest
                          ${isToday ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}
                        `}
                      >
                        {SHORT_DAY[index] ?? ""}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {formatDayDate(new Date(day.date))}
                      </span>
                    </div>

                    {/* Status dot */}
                    {isActive && (
                      <span
                        className="relative flex h-2 w-2"
                        title={isOnBreak ? "On break" : "Clocked in"}
                      >
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnBreak ? "bg-amber-400" : "bg-green-400"} opacity-60`}
                        ></span>
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${isOnBreak ? "bg-amber-500" : "bg-green-500"}`}
                        ></span>
                      </span>
                    )}
                  </div>

                  {/* Clock times */}
                  <div className="flex flex-col gap-1">
                    {day.clockIn ? (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <LogIn
                          size={13}
                          className="text-emerald-500 shrink-0"
                        />
                        <span className="font-mono text-xs">
                          {formatClockInOutTime(new Date(day.clockIn))}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-600">
                        <LogIn size={13} className="shrink-0" />
                        <span className="text-xs">—</span>
                      </div>
                    )}
                    {day.clockOut ? (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <LogOut size={13} className="text-rose-400 shrink-0" />
                        <span className="font-mono text-xs">
                          {formatClockInOutTime(new Date(day.clockOut))}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-600">
                        <LogOut size={13} className="shrink-0" />
                        <span className="text-xs">—</span>
                      </div>
                    )}
                  </div>

                  {/* Breaks */}
                  {day.breaks && day.breaks.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                      {day.breaks.map((b, bi) => (
                        <div
                          key={bi}
                          className={`flex items-center gap-1.5 text-xs ${
                            !b.endTime
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <Coffee
                            size={11}
                            className="text-amber-500 shrink-0"
                          />
                          <span className="font-mono text-[11px]">
                            {formatClockInOutTime(new Date(b.startTime))}
                            {" – "}
                            {b.endTime
                              ? formatClockInOutTime(new Date(b.endTime))
                              : "now"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hours pill */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      className={`
                        self-start inline-flex items-center gap-1 text-xs font-medium
                        px-2 py-0.5 rounded-md
                        ${
                          hasWorked
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                            : "bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500"
                        }
                      `}
                    >
                      <Clock size={11} />
                      {hours > 0 || minutes > 0
                        ? `${hours}h ${minutes}m`
                        : "0h"}
                    </div>

                    {/* Pay pill */}
                    <div
                      className={`
                        self-start inline-flex items-center gap-1 text-xs font-medium
                        px-2 py-0.5 rounded-md
                        ${
                          livePay > 0
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500"
                        }
                      `}
                    >
                      <DollarSign size={11} />
                      {livePay.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            };

            return (
              <div className="flex flex-col gap-3">
                {/* Mon–Fri: 1 col mobile, 2 col sm, 5 col lg */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {weekdays.map((day, i) => renderDay(day, i))}
                </div>
                {/* Sat–Sun: 1 col mobile, 2 col sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {weekend.map((day, i) => renderDay(day, i + 5))}
                </div>

                {/* Weekly Summary */}
                <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Timer size={13} />
                      {parseFloat(totalHours.toFixed(2))}h total
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <DollarSign size={13} />
                    {totalPay.toFixed(2)} total
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </article>
  );
};

export default TimecardComponent;
