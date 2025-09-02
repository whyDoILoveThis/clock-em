import React, { useState } from "react";
import { Timecard } from "@/types/types.type";
import { formatClockInOutTime, formatWeekStartDate } from "@/lib/utils";
import axios from "axios";
import { DateTime } from "luxon";
import LoaderSpinSmall from "./Loader";
import ItsDropdown from "./ui/ItsDropdown";
import IconThreeDots from "./icons/IconThreeDots";

interface Props {
  timecard: Timecard;
  searchTerm?: string;
  ownerId?: string;
  fetchTimecards?: () => Promise<void>;
}

const TimecardComponent = ({
  timecard,
  searchTerm,
  ownerId,
  fetchTimecards,
}: Props) => {
  const [loading, setLoading] = useState(false);

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
          // Call parent fetch if provided so parent list updates
          if (fetchTimecards) await fetchTimecards();
        } else {
          console.error("Failed to delete timecard:", response.data);
          alert("Failed to delete timecard");
        }
      } catch (error) {
        console.error("Error deleting timecard:", error);
        alert("Failed to delete timecard");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <article className="flex flex-col gap-3 items-start w-full bg-white/10 dark:bg-slate-900/10 rounded-lg overflow-hidden p-4 shadow-sm text-slate-900 dark:text-slate-100 backdrop-blur-sm border border-gray-100/30 dark:border-slate-700/40">
      <div className="w-full flex flex-col gap-2">
        <ItsDropdown
          btnText={<IconThreeDots size={15} />}
          btnClassNames="btn !p-1 text-shadow flex gap-1 items-center"
          menuClassNames="-translate-x-10"
        >
          <button
            className={`btn btn-red text-nowrap ${loading && "btn-round"}`}
            onClick={() => handleDeleteTimecard(timecard.weekStart)}
          >
            {loading ? <LoaderSpinSmall color={"red"} /> : "Delete Timecard"}
          </button>
        </ItsDropdown>
        <b className="text-lg">
          <span className="text-indigo-500 dark:text-indigo-200">
            Week Start:
          </span>{" "}
          {formatWeekStartDate(new Date(timecard.weekStart))}
        </b>
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Week Pay:{" "}
            <span className="ml-1 font-semibold text-slate-900 dark:text-slate-100">
              ${timecard.totalPay.toFixed(2)}
            </span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total Hours:{" "}
            <span className="ml-1 font-semibold text-slate-900 dark:text-slate-100">
              {parseFloat(
                (
                  timecard.totalHours ??
                  timecard.days.reduce(
                    (acc, d) => acc + (d.hoursWorked || 0),
                    0
                  )
                ).toFixed(4)
              )}
              {" hrs"}
            </span>
          </p>
        </div>
      </div>
      {timecard.days.map((day, index) => {
        // Get the whole hours
        const hours = Math.floor(day.hoursWorked);

        // Get the remaining minutes (decimal part * 60)
        const minutes = Math.round((day.hoursWorked - hours) * 60);

        return (
          <div
            className={`w-full p-3 rounded-md bg-white/25 dark:bg-slate-700/35 backdrop-blur-sm ${
              day.clockInStatus === true ? "ring-1 ring-green-400/40" : ""
            } ${
              searchTerm &&
              searchTerm.toString().split("T")[0] ===
                new Date(day.date).toISOString().split("T")[0]
                ? "ring-1 ring-yellow-300/40"
                : ""
            }`}
            key={index}
          >
            <div className="w-fit flex flex-col items-start">
              <p className="text-sm text-indigo-600 dark:text-indigo-300 font-medium">
                {formatWeekStartDate(new Date(day.date))}
              </p>
              {day.clockIn && (
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Clock In:{" "}
                  <span className="font-mono ml-1">
                    {formatClockInOutTime(new Date(day.clockIn))}
                  </span>
                </p>
              )}
              {day.clockOut && (
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Clock Out:{" "}
                  <span className="font-mono ml-1">
                    {formatClockInOutTime(new Date(day.clockOut))}
                  </span>
                </p>
              )}
              <div className="place-self-start px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm">
                {hours > 0 || minutes > 0 ? `${hours}h ${minutes}m` : "0h"}
              </div>
            </div>
          </div>
        );
      })}
    </article>
  );
};

export default TimecardComponent;
