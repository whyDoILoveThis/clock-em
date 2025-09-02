import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const bufferToBase64 = (buffer: Buffer): string => {
  return `data:image/png;base64,${buffer.toString('base64')}`;
};


// utils/dateUtils.ts

/**
 * Returns the start of the week (Monday) for a given date.
 * @param date - The reference date.
 * @returns A new Date object set to the week's start.
 */
export function getWeekStart(date: Date): Date {
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = (day === 0 ? -6 : 1) - day; // Adjust to make Monday the first day
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * Generates an array of 7 days starting from the weekStart.
 * @param weekStart - The starting date of the week.
 * @returns Array of Date objects representing each day of the week.
 */
export function generateWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(weekStart);
    currentDay.setDate(weekStart.getDate() + i);
    currentDay.setHours(0, 0, 0, 0);
    days.push(currentDay);
  }
  return days;
}

export const formatWeekStartDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
  return date.toLocaleDateString(undefined, options);
};

export const formatClockInOutTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'CST' };
  return date.toLocaleTimeString(undefined, options);
};

export const formatClockInOutDate = (date: Date) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date(date);
  const day = dayNames[d.getDay()];
  const month = d.getMonth() + 1; // Months are zero-based
  const dayOfMonth = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12; // Adjust hours to 12-hour format
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Add leading zero if needed
  
  return `${day} ${month}/${dayOfMonth}/${d.getFullYear()} ${formattedHours}:${formattedMinutes}${ampm}`;
};



