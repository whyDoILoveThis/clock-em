import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import mongoose from 'mongoose';
import { ITimecard } from '@/models/Timecard';
import { Day } from '@/types/types.type';
import { NextResponse } from 'next/server';

// Helper to get Monday of the current week
const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(date.setDate(diff));
};

// Helper to initialize the week with empty days
const initializeWeek = (monday: Date): Day[] => {
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

export async function POST(req: Request) {
  try {
    const { userId, employerName } = await req.json();

    // Find user by userId
    const user = await User.findOne({ userId });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if employers array exists and has entries
    if (!user.employers || user.employers.length === 0) {
      return NextResponse.json({ error: 'No employers found for this user' }, { status: 404 });
    }

    // Find employer by name
    const employer = user.employers.find(emp => emp.name === employerName);

    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // Get Monday of the current week
    const today = new Date();
    const currentMonday = getMonday(new Date(today));
    
    // Check if there's already a timecard for the current week (same Monday)
    let currentTimecard = employer.timecards && employer.timecards.find(tc => {
      const weekStart = tc.weekStart && new Date(tc.weekStart).toISOString().split('T')[0];
      return currentMonday.toISOString().split('T')[0] === weekStart;
    }) as ITimecard;

    // If no current week timecard exists, create a new one
    if (!currentTimecard) {
      currentTimecard = {
        weekStart: currentMonday.toISOString().split('T')[0],
        totalPay: 0,
        days: initializeWeek(currentMonday),
      } as ITimecard;
      employer.timecards.push(currentTimecard);
      
    }

    // Find today's day in the timecard
    const todayFormatted = today.toISOString().split('T')[0];
    const day = currentTimecard.days && currentTimecard.days.find(d => d.date === todayFormatted);

    if (day && day.clockIn !== null) {
      return NextResponse.json({ error: 'Already clocked in today' }, { status: 400 });
    }
    console.log(day?.clockIn, currentTimecard);



    



    
    



// Get today's date in UTC and format it to 'YYYY-MM-DD'
const currentDate = new Date();
const currentDateString = currentDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

// Step 1: Find the correct employer by casting the _id to a string
const theemployer = user.employers.find(emp => emp.userId.toString() === employer.userId);

if (theemployer) {
  // Step 2: Find the timecard based on the current week
  const timecard = theemployer.timecards.find(tc => {
    const weekStart = tc.weekStart && new Date(tc.weekStart);
    const weekEnd = weekStart && new Date(weekStart);
   weekEnd && weekEnd.setDate(weekStart.getDate() + 6); // Adding 6 days to weekStart to get weekEnd

    // Ensure currentDate is within the week range
    if(weekStart && weekEnd){return currentDate >= weekStart && currentDate <= weekEnd;}
  });

  if (timecard) {
    // Step 3: Find today's day
    const day = timecard.days && timecard.days.find(d => {
      const dayDateString = d.date && new Date(d.date).toISOString().split('T')[0]; // 'YYYY-MM-DD'

      // Log both dates for clarity
      console.log("Comparing day date:", dayDateString, "with today's date:", currentDateString);

      return dayDateString === currentDateString;
    });

    if (day) {
      console.log("Day found for today's date:", day);

      // Check if already clocked in
      if (day.clockIn === null && day.clockInStatus === false) {
        // Update clockIn for the day
        day.clockIn = new Date();
        day.clockInStatus = true;

        // Save user document
        await user.save();
        console.log("User clocked in successfully:", day);
      } else {
        console.error("User has already clocked in for today! Clock-in time:", day.clockIn);
        return NextResponse.json({ message: `User has already clocked in for today! Clock-in time: ${day.clockIn}`}, { status: 565 });
      }
    } else {
      console.error("No matching day found for today!");
    }
  } else {
    console.error("No matching timecard found for the current week!");
  }
} else {
  console.error("Employer not found!");
}

















    return NextResponse.json({ message: 'Clocked in successfully' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
