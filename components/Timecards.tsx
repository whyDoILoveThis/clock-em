import {
  formatClockInOutDate,
  formatClockInOutTime,
  formatWeekStartDate,
} from "@/lib/utils";
import { Timecard } from "@/types/types.type";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import TimecardComponent from "./Timecard";
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
                <div key={idx}>
                  <TimecardComponent timecard={timecard} />
                </div>
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
