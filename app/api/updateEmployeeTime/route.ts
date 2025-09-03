// app route PUT handler (updateEmployeeTime) - updated to create timecard exactly like your other route
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Owner from "@/models/Owner";
import User from "@/models/User";
import Timecard from "@/models/Timecard";
import { DateTime } from "luxon";



export async function PUT(request: Request) {
  try {
    await dbConnect();

    const { ownerId, companyId, employeeId, date, clockIn, clockOut, clear } = await request.json();

    if (!ownerId || !companyId || !employeeId || !date) {
      return NextResponse.json(
        { error: "Owner ID, company ID, employee ID, and date are required ❌" },
        { status: 400 }
      );
    }

    // Auth / ownership checks
    const owner = await Owner.findOne({ userId: ownerId });
    if (!owner) return NextResponse.json({ error: "Owner not found ❌" }, { status: 401 });

    const company = owner.companies.id(companyId);
    if (!company) return NextResponse.json({ error: "Company not found ❌" }, { status: 402 });

    const employee = company.employees?.find((emp) => emp.userId === employeeId);
    if (!employee) return NextResponse.json({ error: "Employee not found ❌" }, { status: 403 });

    const user = await User.findOne({ userId: employeeId });
    if (!user) return NextResponse.json({ error: "User not found ❌" }, { status: 404 });

    // Normalize incoming date to JS Date
    const normalizedDateObj = toJSDateSafe(date);
    if (!normalizedDateObj) return NextResponse.json({ error: "Invalid date provided ❌" }, { status: 400 });

    // Compute the weekStart (Monday) as JS Date
    const weekStartDate = getWeekStartMondayDate(normalizedDateObj);
    if (!weekStartDate) return NextResponse.json({ error: "Unable to compute week start ❌" }, { status: 400 });

    // Ensure weekStartISO is in YYYY-MM-DD format (UTC)
    const weekStartISO = DateTime.fromJSDate(weekStartDate, { zone: "utc" }).toFormat("yyyy-MM-dd");

    // Try find the timecard by employeeId, companyId and weekStart date string
    let timecard = await Timecard.findOne({
      employeeId,
      companyId,
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$weekStart" } },
          weekStartISO
        ]
      }
    });

    // If no timecard, create exactly like your other route does, then re-fetch it
    if (!timecard) {
      const days: any[] = [];
      const mondayDT = DateTime.fromJSDate(weekStartDate, { zone: "utc" });
      for (let i = 0; i < 7; i++) {
        const currentDayDT = mondayDT.plus({ days: i });
        const currentDayStr = currentDayDT.toUTC().toFormat("yyyy-MM-dd");
        days.push({
          date: currentDayStr,
          clockIn: null,
          clockOut: null,
          clockInStatus: false,
          hoursWorked: 0,
        });
      }

      const hourlyRateInitial = typeof employee.hourlyRate === "number" ? employee.hourlyRate : 0;
      const totalPayInitial = days.reduce((acc, d) => acc + ((d.hoursWorked || 0) * hourlyRateInitial), 0);

      await Timecard.create({
        companyId,
        employeeId,
        weekStart: DateTime.fromJSDate(weekStartDate, { zone: "utc" }).toJSDate(),
        totalPay: totalPayInitial,
        days,
      });

      // re-fetch so we have a full mongoose document with the same shape
      timecard = await Timecard.findOne({
        employeeId,
        companyId,
        $expr: {
          $eq: [
            { $dateToString: { format: "%Y-%m-%d", date: "$weekStart" } },
            weekStartISO
          ]
        }
      });
    }

    if (!timecard) {
      // something unexpected happened
      return NextResponse.json({ error: "Unable to create or find timecard ❌" }, { status: 500 });
    }

    // Build normalizedDateISO to find the day within the timecard
    const normalizedDateISO = DateTime.fromJSDate(normalizedDateObj, { zone: "utc" }).toFormat("yyyy-MM-dd");

    // Find index of the day in the timecard
    const dayIdx = (timecard.days || []).findIndex((d: any) => {
      if (!d?.date) return false;
      // d.date may already be 'YYYY-MM-DD' string or ISO string or Date
      if (d.date instanceof Date) {
        return DateTime.fromJSDate(d.date, { zone: "utc" }).toFormat("yyyy-MM-dd") === normalizedDateISO;
      }
      // string case
      const asIso = DateTime.fromISO(String(d.date), { zone: "utc" });
      if (asIso.isValid) {
        return asIso.toFormat("yyyy-MM-dd") === normalizedDateISO;
      }
      // fallback raw comparison
      return String(d.date) === normalizedDateISO;
    });

    if (dayIdx === -1) {
      // This should not happen because we created the week days above, but handle defensively
      return NextResponse.json({ error: "Day not found in timecard after creation ❌" }, { status: 500 });
    }

    if(!timecard.days){return NextResponse.json({ error: "Day entry not found ❌" }, { status: 406 });}

    // Work with the subdoc directly
    const day = timecard.days[dayIdx];

    // If clear flag -> clear the day's times
    if (clear) {
      day.clockIn = null;
      day.clockOut = null;
      day.hoursWorked = 0;
      day.clockInStatus = false;
    }  

    
      // Normalize incoming clockIn/clockOut values
      const incomingClockIn = clockIn ? toJSDateSafe(clockIn) : toJSDateSafe(day.clockIn);
      const incomingClockOut = clockOut ? toJSDateSafe(clockOut) : toJSDateSafe(day.clockOut);

      day.clockIn = incomingClockIn;
      day.clockOut = incomingClockOut;
      day.clockInStatus = false;

      // If both present, compute hours using the helper that rounds to 2 decimals
      if (incomingClockIn && incomingClockOut) {
        day.hoursWorked = calculateHoursWorked(incomingClockIn, incomingClockOut);
      } else {
        // If either missing, keep 0 (or keep previous value if desired)
        day.hoursWorked = 0;
      }
    

    // Recalculate pay for the week
    const hourlyRate = typeof employee.hourlyRate === "number" ? employee.hourlyRate : 0;
    timecard.totalPay = (timecard.days || []).reduce((acc: number, d: any) => acc + ((d?.hoursWorked || 0) * hourlyRate), 0);

    // Set clockInStatus false for all days (like code you pasted)
    (timecard.days || []).forEach((d: any) => { d.clockInStatus = false; });

    await timecard.save();

    // Prepare return payload: compute payForToday from the updated day
    const payForToday = (day?.hoursWorked || 0) * hourlyRate;

    return NextResponse.json(
      {
        message: clear ? "Day cleared ✅" : "Employee time updated ✅",
        day: {
          date: day.date,
          clockIn: day.clockIn,
          clockOut: day.clockOut,
          hoursWorked: day.hoursWorked,
        },
        payForToday,
        totalPay: timecard.totalPay,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ An error occurred in updateEmployeeTime:", err);
    return NextResponse.json({ error: "Internal Server Error ❌" }, { status: 500 });
  }
}


const toISODateSafe = (input?: string | Date | null): string | null => {
  if (!input) return null;
  if (input instanceof Date) return DateTime.fromJSDate(input, { zone: "utc" }).toISO();
  let dt = DateTime.fromISO(String(input), { zone: "utc" });
  if (!dt.isValid) dt = DateTime.fromJSDate(new Date(String(input)), { zone: "utc" });
  return dt.isValid ? dt.toISO() : null;
};

const toJSDateSafe = (input?: string | Date | null): Date | null => {
  if (!input) return null;
  if (input instanceof Date) return input;
  const dt = DateTime.fromISO(String(input), { zone: "utc" });
  if (dt.isValid) return dt.toJSDate();
  const dt2 = DateTime.fromJSDate(new Date(String(input)), { zone: "utc" });
  return dt2.isValid ? dt2.toJSDate() : null;
};

const getWeekStartMondayDate = (dateIsoOrDate: string | Date): Date | null => {
  const dt = dateIsoOrDate instanceof Date
    ? DateTime.fromJSDate(dateIsoOrDate, { zone: "utc" })
    : DateTime.fromISO(String(dateIsoOrDate), { zone: "utc" });
  if (!dt.isValid) return null;
  const daysToSubtract = dt.weekday === 7 ? 6 : dt.weekday - 1;
  const monday = dt.minus({ days: daysToSubtract }).startOf("day");
  return monday.toJSDate();
};

// Calculate hours between two Date objects (UTC-aware) and round to 2 decimals
const calculateHoursWorked = (clockIn: Date, clockOut: Date): number => {
  const s = DateTime.fromJSDate(clockIn, { zone: "utc" });
  const e = DateTime.fromJSDate(clockOut, { zone: "utc" });
  if (!s.isValid || !e.isValid) return 0;
  const minutes = e.diff(s, "minutes").minutes;
  if (minutes <= 0) return 0;
  const hours = minutes / 60;
  return Math.round(hours * 100) / 100;
};