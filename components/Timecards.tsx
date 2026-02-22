import { Timecard } from "@/types/types.type";
import React, { useMemo, useState } from "react";
import Loader from "./Loader";
import TimecardComponent from "./Timecard";
import { useTimecards } from "@/hooks/useTimecards";
import {
  ChevronDown,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react";

type SortField = "date" | "pay" | "hours";
type SortDir = "asc" | "desc";

interface Props {
  userId: string;
  companyId: string;
}

const SORT_OPTIONS: {
  field: SortField;
  label: string;
  icon: React.ReactNode;
}[] = [
  { field: "date", label: "Date", icon: <Calendar size={14} /> },
  { field: "pay", label: "Pay", icon: <DollarSign size={14} /> },
  { field: "hours", label: "Hours", icon: <Clock size={14} /> },
];

const Timecards = ({ userId, companyId }: Props) => {
  const { timecards, fetchTimecards, loading, error } = useTimecards(
    userId,
    companyId,
  );
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandAll, setExpandAll] = useState(false);

  const sorted = useMemo(() => {
    if (!timecards || timecards.length === 0) return [];
    return [...timecards].sort((a, b) => {
      let valA: number, valB: number;
      switch (sortField) {
        case "pay":
          valA = a.totalPay ?? 0;
          valB = b.totalPay ?? 0;
          break;
        case "hours":
          valA =
            a.totalHours ??
            a.days.reduce((s, d) => s + (d.hoursWorked || 0), 0);
          valB =
            b.totalHours ??
            b.days.reduce((s, d) => s + (d.hoursWorked || 0), 0);
          break;
        default:
          valA = new Date(a.weekStart).getTime();
          valB = new Date(b.weekStart).getTime();
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });
  }, [timecards, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  if (error)
    return <p className="text-red-400 text-sm p-4">Error: {error} ❌</p>;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader />
        </div>
      ) : timecards && timecards.length > 0 ? (
        <>
          {/* ── Toolbar ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-1">
            {/* Sort buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Sort
              </span>
              {SORT_OPTIONS.map(({ field, label, icon }) => {
                const active = sortField === field;
                return (
                  <button
                    key={field}
                    onClick={() => toggleSort(field)}
                    className={`
                      group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                      transition-all duration-200 cursor-pointer select-none
                      ${
                        active
                          ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-400/30"
                          : "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/60"
                      }
                    `}
                  >
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                    {active && (
                      <ArrowUpDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          sortDir === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Expand / Collapse all */}
            <button
              onClick={() => setExpandAll((prev) => !prev)}
              className="
                flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer select-none
                bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400
                hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all duration-200
              "
            >
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${expandAll ? "rotate-180" : ""}`}
              />
              <span className="hidden sm:inline">
                {expandAll ? "Collapse All" : "Expand All"}
              </span>
            </button>
          </div>

          {/* ── Timecard list ── */}
          <div className="flex flex-col gap-4">
            {sorted.map((tc, idx) => (
              <TimecardComponent
                key={tc.weekStart?.toString() ?? idx}
                timecard={tc}
                ownerId={userId}
                fetchTimecards={fetchTimecards}
                forceExpand={expandAll}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
          No timecards available for this employer.
        </p>
      )}
    </div>
  );
};

export default Timecards;
