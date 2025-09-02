import {
  formatClockInOutDate,
  formatClockInOutTime,
  formatWeekStartDate,
} from "@/lib/utils";
import { Timecard } from "@/types/types.type";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import TimecardComponent from "./Timecard";
import { useTimecards } from "@/hooks/useTimecards";
interface Props {
  userId: string;
  companyId: string;
}
const Timecards = ({ userId, companyId }: Props) => {
  const { timecards, fetchTimecards, loading, error } = useTimecards(
    userId,
    companyId
  );

  if (error) return <p>Error: {error} ❌</p>;

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center p-6">
          <Loader />
        </div>
      ) : (
        <div>
          {timecards && timecards.length > 0 ? (
            <ul className="space-y-4 flex flex-col items-center">
              {timecards.map((timecard, idx) => (
                <li className="w-fit" key={idx}>
                  <TimecardComponent
                    timecard={timecard}
                    ownerId={userId}
                    fetchTimecards={fetchTimecards}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No timecards available for this employer.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Timecards;
