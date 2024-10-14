import React from "react";
import { Timecard } from "@/types/types.type";
import { formatClockInOutTime, formatWeekStartDate } from "@/lib/utils";

interface Props {
  timecard: Timecard;
  searchTerm?: string;
}

const TimecardComponent = ({ timecard, searchTerm }: Props) => {
  return (
    <li className="flex flex-col gap-2 items-center">
      <b>Week Start: {formatWeekStartDate(timecard.weekStart)}</b>
      <p>
        <b>Week Pay: </b> ${timecard.totalPay.toFixed(2)}
      </p>
      {timecard.days.map((day, index) => {
        // Get the whole hours
        const hours = Math.floor(day.hoursWorked);

        // Get the remaining minutes (decimal part * 60)
        const minutes = Math.round((day.hoursWorked - hours) * 60);

        return (
          <div
            className={`border p-2 rounded-2xl ${
              searchTerm &&
              searchTerm.toString().split("T")[0] ===
                day.date.toString().split("T")[0] &&
              "border-yellow-200"
            }`}
            key={index}
          >
            <p>
              <b>{formatWeekStartDate(new Date(day.date))}</b>
            </p>
            {day.clockIn && (
              <p>
                <b>Clock In: </b>
                {formatClockInOutTime(day.clockIn)}
              </p>
            )}
            {day.clockOut && (
              <p>
                <b>Clock Out: </b>
                {formatClockInOutTime(day.clockOut)}
              </p>
            )}
            <p>
              <b>Hours: </b>
              {hours > 0 ||
                (minutes > 0 ? (
                  <p>
                    {hours}h {minutes}m
                  </p>
                ) : (
                  0
                ))}
            </p>
          </div>
        );
      })}
      {/* Add more details from timecard if necessary */}
    </li>
  );
};

export default TimecardComponent;
