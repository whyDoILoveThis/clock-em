import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb"; // Adjust the path if necessary
import User from "@/models/User";
import Timecard from "@/models/Timecard";

export async function GET(request: Request) {
  try {
    console.log("Connecting to MongoDB...");
    await dbConnect();
    console.log("Connected to MongoDB.");

    // Extract parameters from query string
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const employerId = url.searchParams.get("companyId");
    const searchTerm = url.searchParams.get("searchTerm");
    
    console.log('userId: ', userId, 'companyId: ', employerId);
    

    if (!userId || !employerId) {
      return NextResponse.json({ error: 'userId and employerId are required' }, { status: 403 });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 402 });
    }

    console.log(`Received search term: ${searchTerm}`);

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Search term is required ❌" },
        { status: 401 }
      );
    }

    const searchDate = new Date(searchTerm);
    if (isNaN(searchDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format ❌" },
        { status: 400 }
      );
    }

    const employer = user.employers && user.employers.find(emp => emp.userId === employerId);

    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 406 });
    }

   // Retrieve the timecards for the specified employer
    let timecards = await Timecard.find({
      companyId: employerId,
      employeeId: userId,
});

    // Search for matching timecard by weekStart or clockIn date
    const theTimecard = timecards.find(tc => {
      // Convert weekStart (string) to a comparable date string (YYYY-MM-DD)
      const weekStartDate = tc.weekStart && new Date(tc.weekStart).toISOString().split('T')[0];
    
      // Convert searchDate to comparable date string
      const searchDateStr = searchDate.toISOString().split('T')[0];
    
      // Check if weekStart matches search date
      const hasMatchingWeekStart = weekStartDate === searchDateStr;
    
      // Check if any day has a matching date
      const hasMatchingClockIn = tc.days && tc.days.some(day => {
        // Convert day.date (ISO) to comparable date string
        const dayDateStr = day.date && new Date(day.date).toISOString().split('T')[0];
        return dayDateStr === searchDateStr;
      });
    
      // Return true if either the weekStart or day date matches the search date
      return hasMatchingWeekStart || hasMatchingClockIn;
    });
    if (!theTimecard) {
      return NextResponse.json({ error: 'No matching timecard found' }, { status: 407 });
    }

    return NextResponse.json({ timecards: theTimecard });
  } catch (error) {
    console.error("❌ An error occurred:", error);
    return NextResponse.json(
      { error: "Internal Server Error ❌" },
      { status: 500 }
    );
  }
}
