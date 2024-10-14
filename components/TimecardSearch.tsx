import { formatClockInOutDate, formatWeekStartDate } from "@/lib/utils"; // Ensure this utility is correctly imported
import { Timecard } from "@/types/types.type";
import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import TimecardComponent from "./Timecard";

interface Props {
  userId: string;
  companyId: string;
}

const TimecardsSearch = ({ userId, companyId }: Props) => {
  const [timecard, setTimecard] = useState<Timecard | null>(null); // Stores fetched timecards
  const [searchTerm, setSearchTerm] = useState<string>(
    new Date().toISOString().split("T")[0]
  ); // Track search term (date)
  const [error, setError] = useState<string | null>(null); // Track errors

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  // Handle the API call to fetch timecards
  const handleSearch = async () => {
    try {
      const response = await fetch(
        `/api/searchTimecards?searchTerm=${searchTerm}&userId=${userId}&companyId=${companyId}`, // Append the parameters to URL
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTimecard(data.timecards || []); // If timecards exist, set them
        setError(null); // Clear previous errors if any
      } else {
        console.error(data.error);
        setError(data.error); // Handle any errors from backend
        setTimecard(null);
      }
    } catch (error) {
      console.error("Failed to search timecards", error);
      setError("Failed to fetch timecards"); // Set general error message
      setTimecard(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      handleSearch();
    } else {
      setError("Please enter a valid date to search.");
    }
  };

  console.log(timecard);

  return (
    <div>
      {/* Date Search Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-4 flex gap-4 items-center search-bar bg-slate-950 bg-opacity-80 rounded-full"
      >
        <input
          type="date"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          className=""
          required
        />

        <button type="submit">
          <IoSearch />
        </button>
      </form>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Display the Timecards */}
      {timecard && (
        <TimecardComponent timecard={timecard} searchTerm={searchTerm} />
      )}
    </div>
  );
};

export default TimecardsSearch;
