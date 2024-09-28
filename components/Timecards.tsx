import { formatClockInOutDate, formatWeekStartDate } from "@/lib/utils";
import { Timecard } from "@/types/types.type";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";
interface Props {
  userId: string;
  companyId: string;
}
const Timecards = ({ userId, companyId }: Props) => {
  const [timecards, setTimecards] = useState<Timecard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimecards = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/timecards", {
          method: "GET",
          headers: {
            userId: userId, // Use 'userId' key correctly
            companyId: companyId, // Use 'companyId' key correctly
          },
        });

        const data = await response.json();
        if (response.ok) {
          setTimecards(data.timecards);
          setLoading(false);
        } else {
          console.error(data.error);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch timecards", error);
        setLoading(false);
      }
      setLoading(false);
    };

    fetchTimecards();
  }, [userId, companyId]);

  console.log(timecards);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div>
          {timecards && timecards.length > 0 ? (
            <ul className="border p-2 rounded-2xl">
              {timecards.map((timecard, idx) => (
                <li className="flex flex-col gap-2 items-center" key={idx}>
                  <b>Week Start: {formatWeekStartDate(timecard.weekStart)}</b>
                  <p>
                    <b>Week Pay: </b> ${timecard.totalPay.toFixed(2)}
                  </p>
                  {timecard.days.map((day, index) => {
                    const dayNames = [
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thur",
                      "Fri",
                      "Sat",
                      "Sun",
                    ];
                    // Get the whole hours
                    const hours = Math.floor(day.hoursWorked);

                    // Get the remaining minutes (decimal part * 60)
                    const minutes = Math.round((day.hoursWorked - hours) * 60);

                    return (
                      <div className="border p-2 rounded-2xl" key={index}>
                        {day.clockIn && (
                          <p>
                            <b>Clock In: </b>
                            {formatClockInOutDate(day.clockIn)}
                          </p>
                        )}
                        {day.clockOut && (
                          <p>
                            <b>Clock Out: </b>
                            {formatClockInOutDate(day.clockOut)}
                          </p>
                        )}
                        <p>
                          <p>{dayNames[index]}</p>
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
              ))}
            </ul>
          ) : (
            <p>No timecards available for this employer.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Timecards;
