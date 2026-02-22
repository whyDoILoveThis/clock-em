import { Timecard } from "@/types/types.type";
import React, { useEffect, useState, useCallback } from "react";
import { Search, Calendar } from "lucide-react";
import TimecardComponent from "./Timecard";

interface Props {
  userId: string;
  companyId: string;
}

const TimecardsSearch = ({ userId, companyId }: Props) => {
  const [timecard, setTimecard] = useState<Timecard | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/searchTimecards?searchTerm=${searchTerm}&userId=${userId}&companyId=${companyId}`,
        { method: "GET" },
      );

      const data = await response.json();

      if (response.ok) {
        setTimecard(data.timecards || []);
        setError(null);
      } else {
        console.error(data.error);
        setError(data.error);
        setTimecard(null);
      }
    } catch (error) {
      console.error("Failed to search timecards", error);
      setError("Failed to fetch timecards");
      setTimecard(null);
    }
  }, [searchTerm, userId, companyId]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      handleSearch();
    } else {
      setError("Please enter a valid date to search.");
    }
  };

  return (
    <div className="w-full">
      {/* Date Search Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border border-white/20 dark:border-slate-700/40 shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/40 mb-4"
      >
        <Calendar
          size={16}
          className="text-slate-400 dark:text-slate-500 shrink-0"
        />
        <input
          type="date"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          required
          className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white"
        />
        <button
          type="submit"
          className="shrink-0 p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
        >
          <Search size={16} />
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-rose-500 dark:text-rose-400 mb-4 px-1">
          {error}
        </p>
      )}

      {/* Display the Timecard - already expanded */}
      {timecard && (
        <TimecardComponent
          timecard={timecard}
          searchTerm={searchTerm}
          forceExpand={true}
        />
      )}
    </div>
  );
};

export default TimecardsSearch;
