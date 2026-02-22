import { Day } from "@/types/types.type";
import { DateTime } from "luxon";
import { nowCentral } from "@/lib/dates";

// Helper to get Monday of the current week (Central timezone-aware)
export const getMondayCentral = (dt?: DateTime): string => {
  const d = dt ?? nowCentral();
  return d.startOf("week").toISODate()!; // Luxon weeks start on Monday (ISO)
};

// Keep legacy name for backwards compat — but now timezone-safe
export const getMonday = (_date?: Date): string => {
  // Always derive from Central "now" to avoid UTC drift
  return getMondayCentral();
};

// Calculate hours worked between two JS Date objects
export const calculateHoursWorked = (clockIn: Date, clockOut: Date): number => {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  return diffMs / (1000 * 60 * 60);
};

// Calculate hours worked accounting for breaks
export const calculateHoursWorkedWithBreaks = (
  clockIn: Date,
  clockOut: Date,
  breaks?: Array<{ startTime: Date | string; endTime?: Date | string | null }>
): number => {
  let totalMs = clockOut.getTime() - clockIn.getTime();

  if (breaks && breaks.length > 0) {
    // Subtract break time from total
    const breakTimeMs = breaks.reduce((acc, breakPeriod) => {
      if (!breakPeriod.startTime || !breakPeriod.endTime) return acc;

      const breakStart =
        typeof breakPeriod.startTime === "string"
          ? new Date(breakPeriod.startTime).getTime()
          : breakPeriod.startTime.getTime();

      const breakEnd =
        typeof breakPeriod.endTime === "string"
          ? new Date(breakPeriod.endTime).getTime()
          : breakPeriod.endTime.getTime();

      return acc + (breakEnd - breakStart);
    }, 0);

    totalMs -= breakTimeMs;
  }

  return Math.max(0, totalMs / (1000 * 60 * 60)); // Never negative
};

// Central-timezone "today" as YYYY-MM-DD
export const todayCentral = (): string => nowCentral().toISODate()!;

// Helper to initialize the week with empty days (Central timezone-aware)
export const initializeWeek = (mondayISO: string): Day[] => {
  const monday = DateTime.fromISO(mondayISO, { zone: "America/Chicago" });
  const days: Day[] = [];

  for (let i = 0; i < 7; i++) {
    days.push({
      date: monday.plus({ days: i }).toISODate()!, // YYYY-MM-DD
      clockIn: null,
      clockOut: null,
      clockInStatus: false,
      hoursWorked: 0,
      breaks: [],
      pay: 0,
    });
  }

  return days;
};


