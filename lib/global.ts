import { Day } from "@/types/types.type";

// Helper to get Monday of the current week
export const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

// Calculate hours worked between two JS Date objects
export const calculateHoursWorked = (clockIn: Date, clockOut: Date): number => {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  return diffMs / (1000 * 60 * 60);
};

// Helper to initialize the week with empty days
export const initializeWeek = (monday: Date): Day[] => {
  const days: Day[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);

    days.push({
      date: currentDay.toISOString().split('T')[0], // YYYY-MM-DD
      clockIn: null,
      clockOut: null,
      clockInStatus: false,
      hoursWorked: 0, // You can add other fields as per your schema here
    });
  }
  
  return days;
};


