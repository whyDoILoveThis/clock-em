import { Company, Employer } from "@/types/types.type";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ClockInOut from "./ClockInOut";
import Timecards from "./Timecards";
import TimecardsSearch from "./TimecardSearch";
import {
  X,
  Search,
  MapPin,
  Phone,
  DollarSign,
  Clock,
  Timer,
} from "lucide-react";
import { useTimecards } from "@/hooks/useTimecards";
import Loader from "./Loader";

interface Props {
  companies: Employer[];
  userId: string;
  refetch: () => Promise<any>;
}

const MyEmployers = ({ companies, userId, refetch }: Props) => {
  const [openCompanyCardIndex, setOpenCompanyCardIndex] = useState(-9);
  const [searchTimecards, setSearchTimecards] = useState(false);
  const [showTimeclock, setShowTimeclock] = useState(false);
  const [showTimecard, setShowTimecard] = useState(false);
  const companyId = companies[openCompanyCardIndex]?.userId || "";
  const { timecards, fetchTimecards, loading, error } = useTimecards(
    userId,
    companyId,
  );
  const timecardsLoading = loading;
  const [timecardsReady, setTimecardsReady] = useState(false);

  useEffect(() => {
    if (timecards.length > 0) setTimecardsReady(true);
  }, [timecards]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {companies.map((company, index) => {
        const thisCompanyIsSelected = openCompanyCardIndex === index;

        let isClockedIn = false;
        let dbClockInTime: Date | null = null;
        let dbBreakCount = 0;
        let dbIsOnBreak = false;
        let dbBreaks: { startTime: Date; endTime: Date | null }[] = [];
        timecards.map((timecard) => {
          const activeDay = timecard.days.find(
            (day) => day.clockInStatus === true,
          );
          if (activeDay) {
            isClockedIn = true;
            if (activeDay.clockIn) {
              dbClockInTime = new Date(activeDay.clockIn);
            }
            if (activeDay.breaks) {
              dbBreakCount = activeDay.breaks.filter(
                (b) => b.endTime !== null,
              ).length;
              dbIsOnBreak = activeDay.breaks.some((b) => b.endTime === null);
              dbBreaks = activeDay.breaks.map((b) => ({
                startTime: new Date(b.startTime),
                endTime: b.endTime ? new Date(b.endTime) : null,
              }));
            }
          }
        });

        return (
          <div
            onClick={() =>
              openCompanyCardIndex !== index && setOpenCompanyCardIndex(index)
            }
            className={`
              relative flex flex-col rounded-2xl transition-all duration-300
              ${
                thisCompanyIsSelected
                  ? "w-full max-w-lg p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/40 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
                  : "w-fit px-4 py-2.5 cursor-pointer bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/30 dark:border-slate-700/40 shadow-[0_2px_12px_-2px_rgba(99,102,241,0.08)] dark:shadow-[0_2px_12px_-2px_rgba(99,102,241,0.15)] hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)]"
              }
            `}
            key={index}
          >
            {/* Close button */}
            {thisCompanyIsSelected && (
              <button
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCompanyCardIndex(-9);
                  setShowTimeclock(false);
                  setShowTimecard(false);
                }}
              >
                <X size={16} />
              </button>
            )}

            {/* Company name + logo */}
            <div className="flex items-center gap-2.5">
              {company.logoUrl && (
                <Image
                  width={thisCompanyIsSelected ? 32 : 22}
                  height={thisCompanyIsSelected ? 32 : 22}
                  src={company.logoUrl}
                  alt={`${company.name}'s logo`}
                  className="rounded-lg object-cover"
                />
              )}
              <span
                className={`font-semibold ${thisCompanyIsSelected ? "text-lg text-slate-900 dark:text-white" : "text-sm text-slate-800 dark:text-slate-200"}`}
              >
                {company.name}
              </span>

              {/* Shows clocked-in dot on collapsed pill */}
              {!thisCompanyIsSelected && isClockedIn && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dbIsOnBreak ? "bg-amber-400" : "bg-green-400"} opacity-60`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${dbIsOnBreak ? "bg-amber-500" : "bg-green-500"}`}
                  ></span>
                </span>
              )}
            </div>

            {/* Expanded content */}
            {thisCompanyIsSelected && (
              <div className="mt-4 space-y-4">
                {/* Company details + status */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {company.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{company.address}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        {company.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <DollarSign
                        size={13}
                        className="text-slate-400 shrink-0"
                      />
                      ${company.hourlyRate}/hr
                    </div>
                  </div>

                  {/* Clocked in/out badge */}
                  <div className="shrink-0">
                    {isClockedIn ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border ${
                          dbIsOnBreak
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {!timecardsLoading && timecardsReady ? (
                          <>
                            <span className="relative flex h-1.5 w-1.5">
                              <span
                                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dbIsOnBreak ? "bg-amber-400" : "bg-green-400"} opacity-60`}
                              ></span>
                              <span
                                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dbIsOnBreak ? "bg-amber-500" : "bg-green-500"}`}
                              ></span>
                            </span>
                            {dbIsOnBreak ? "On Break" : "Clocked In"}
                          </>
                        ) : (
                          <Loader color="green" />
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/15">
                        {!timecardsLoading && timecardsReady ? (
                          "Clocked Out"
                        ) : (
                          <Loader color="red" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action tabs */}
                <div className="flex items-center gap-1.5">
                  <div className="inline-flex rounded-xl p-1 bg-white/40 dark:bg-slate-800/50 backdrop-blur-lg border border-white/20 dark:border-slate-700/40">
                    <button
                      onClick={() => {
                        setShowTimeclock(true);
                        setShowTimecard(false);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                        showTimeclock
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      <Clock size={13} />
                      Timeclock
                    </button>
                    <button
                      onClick={() => {
                        setShowTimecard(true);
                        setShowTimeclock(false);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                        showTimecard && !showTimeclock
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      <Timer size={13} />
                      Timecards
                    </button>
                  </div>

                  {(showTimecard || showTimeclock) && (
                    <button
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => {
                        setShowTimeclock(false);
                        setShowTimecard(false);
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Content sections */}
                <article>
                  {showTimeclock && (
                    <div className="pt-2">
                      <ClockInOut
                        userId={userId}
                        companyId={company.userId}
                        isClockedIn={isClockedIn}
                        dbClockInTime={dbClockInTime}
                        dbBreakCount={dbBreakCount}
                        dbIsOnBreak={dbIsOnBreak}
                        dbBreaks={dbBreaks}
                        timecardsLoading={timecardsLoading}
                        timecardsReady={timecardsReady}
                        refetch={fetchTimecards}
                      />
                    </div>
                  )}

                  {showTimecard && (
                    <article className="pt-2">
                      {/* Search toggle for timecards */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {!searchTimecards ? "Timecards" : "Search Timecards"}
                        </h3>
                        <button
                          onClick={() => setSearchTimecards(!searchTimecards)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                            searchTimecards
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20"
                          }`}
                        >
                          {searchTimecards ? (
                            <>
                              <X size={13} />
                              Close Search
                            </>
                          ) : (
                            <>
                              <Search size={13} />
                              Search
                            </>
                          )}
                        </button>
                      </div>
                      {searchTimecards ? (
                        <TimecardsSearch
                          userId={userId}
                          companyId={company.userId}
                        />
                      ) : (
                        <Timecards userId={userId} companyId={company.userId} />
                      )}
                    </article>
                  )}
                </article>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MyEmployers;
