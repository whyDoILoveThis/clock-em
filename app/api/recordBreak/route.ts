import { NextRequest, NextResponse } from "next/server";
import Timecard, { ITimecard } from "@/models/Timecard";
import dbConnect from "@/lib/mongodb";
import { DateTime } from "luxon";
import { getMonday, todayCentral } from "@/lib/global";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { userId, companyId, isStarting, timestamp } =
      await request.json();

    if (!userId || !companyId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the current Monday
    const currentMonday = getMonday();

    // Find the current timecard
    const timecard = await Timecard.findOne({
      companyId,
      employeeId: userId,
      weekStart: currentMonday,
    });

    if (!timecard) {
      console.log("recordBreak: No timecard found for", { companyId, userId, currentMonday });
      return NextResponse.json(
        { message: "No active timecard found" },
        { status: 404 }
      );
    }

    // Get today's date as YYYY-MM-DD string
    const today = todayCentral();

    // Helper to normalize stored day.date to YYYY-MM-DD
    const dayToISO = (d: any): string => {
      if (!d.date) return '';
      if (typeof d.date === 'string') return d.date.split('T')[0];
      return DateTime.fromJSDate(new Date(d.date)).toUTC().toISODate()!;
    };

    // Find today's day entry
    const dayIndex = timecard.days?.findIndex(
      (day: any) => dayToISO(day) === today
    ) ?? -1;

    if (dayIndex === -1) {
      console.log("recordBreak: No day entry for today", { today, days: timecard.days?.map((d: any) => dayToISO(d)) });
      return NextResponse.json(
        { message: "No entry for today" },
        { status: 404 }
      );
    }

    // Use atomic MongoDB operations instead of in-memory mutation + save
    if (isStarting) {
      // $push a new break onto the nested array
      await Timecard.updateOne(
        { _id: timecard._id },
        {
          $push: {
            [`days.${dayIndex}.breaks`]: {
              startTime: new Date(timestamp),
              endTime: null,
            },
          },
        }
      );
    } else {
      // Find the active break index and $set its endTime
      const breaks = timecard.days![dayIndex].breaks || [];
      const activeBreakIndex = breaks.findIndex((b: any) => !b.endTime);
      if (activeBreakIndex >= 0) {
        await Timecard.updateOne(
          { _id: timecard._id },
          {
            $set: {
              [`days.${dayIndex}.breaks.${activeBreakIndex}.endTime`]: new Date(timestamp),
            },
          }
        );
      }
    }

    // Re-read to get accurate count (.lean() to bypass schema filtering)
    const updated = await Timecard.findById(timecard._id).lean() as any;
    const completedBreaks = (
      updated?.days?.[dayIndex]?.breaks || []
    ).filter((b: any) => b.endTime !== null).length;

    console.log("recordBreak: success", { isStarting, dayIndex, completedBreaks, breaks: updated?.days?.[dayIndex]?.breaks });

    return NextResponse.json(
      {
        message: isStarting ? "Break started" : "Break ended",
        breakCount: completedBreaks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error recording break:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
