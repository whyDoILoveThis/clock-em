import { DateTime } from "luxon";

// Normalize to YYYY-MM-DD
export const toISODate = (date: string | Date) =>
  DateTime.fromJSDate(new Date(date)).toISODate();

// Central timezone "now"
export const nowCentral = () =>
  DateTime.now().setZone("America/Chicago");

// Hours between two ISO strings
export const hoursBetween = (startISO: string, endISO: string) =>
  DateTime.fromISO(startISO).diff(DateTime.fromISO(endISO), "hours").hours;

// Get Monday of a given date
export const getMonday = (dateISO: string) =>
  DateTime.fromISO(dateISO).startOf("week").plus({ days: 1 }).toISODate();
