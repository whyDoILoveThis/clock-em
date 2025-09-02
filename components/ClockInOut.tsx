import { useState } from "react";
import Loader from "./Loader";

interface Props {
  userId: string;
  companyId: string;
  isClockedIn: boolean;
  timecardsLoading: boolean;
  timecardsReady: boolean;
  refetch: () => Promise<any>;
}

const ClockInOut = ({
  userId,
  companyId,
  isClockedIn,
  timecardsLoading,
  timecardsReady,
  refetch,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false); // Track loading status
  const [error, setError] = useState<string | null>(null); // Track any errors

  const handleClockIn = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await fetch(`/api/clockIn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          companyId,
        }),
      });

      if (response.status === 565) {
        setError("You have already sent time in today");
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Clock In Successful:", data.message);
    } catch (error) {
      console.error("❌ Clock In Error:", error);
    } finally {
      setIsLoading(false); // Stop loading
      refetch();
    }
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await fetch(`/api/clockOut`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          employerName: companyId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setError(data.message);
      console.log("✅ Clock Out Successful:", data.message);
    } catch (error) {
      console.error("❌ Clock Out Error:", error);
    } finally {
      setIsLoading(false); // Stop loading
      refetch();
    }
  };

  return (
    <div className="clock-in-out-container flex flex-col gap-2">
      {error && (
        <p
          className={`error ${
            error === "Clocked out successfully"
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {error}
        </p>
      )}{" "}
      {/* Display errors */}
      <div className="flex gap-2">
        {!isClockedIn ? (
          <>
            {!timecardsLoading && timecardsReady ? (
              <button
                onClick={handleClockIn}
                disabled={isLoading}
                className="btn-glob btn-grn flash-finsih"
              >
                {isLoading ? "Clocking In..." : "Clock In"}
              </button>
            ) : (
              <button className="btn-glob btn-grn p-[0.3rem]">
                <Loader color="green" />
              </button>
            )}
          </>
        ) : (
          <>
            {!timecardsLoading && timecardsReady ? (
              <button
                onClick={handleClockOut}
                disabled={isLoading}
                className="btn btn-red flash-finish"
              >
                {isLoading ? "Clocking Out..." : "Clock Out"}
              </button>
            ) : (
              <button className="btn btn-red p-[0.3rem]">
                <Loader color="red" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClockInOut;
