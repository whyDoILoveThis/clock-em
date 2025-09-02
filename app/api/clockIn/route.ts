import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import mongoose from 'mongoose';
import Timecard, { ITimecard } from '@/models/Timecard';
import { Day } from '@/types/types.type';
import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { nowCentral } from '@/lib/dates';




// Helper to get Monday of the current week
export const getMonday = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(date.setDate(diff));
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

export async function POST(req: Request) {
  try {
    const { userId, companyId } = await req.json();

   

    // Get Monday of the current week
    const today = new Date();
    const currentMonday = getMonday(new Date(today));

    const existingTimecard = await Timecard.findOne({
      companyId,
      employeeId: userId,
      weekStart: currentMonday.toISOString().split('T')[0],
    });

    
    // Check if there's already a timecard for the current week (same Monday)
    let currentTimecard = existingTimecard as ITimecard;

    // If no current week timecard exists, create a new one
    if (!currentTimecard) {
      currentTimecard = await Timecard.create({
        companyId,
        employeeId: userId,
        weekStart: currentMonday.toISOString().split('T')[0],
        totalPay: 0,
        days: initializeWeek(currentMonday),
      });
    }


    
    
    // Find today's day in the timecard
    const todayFormatted = today.toISOString().split('T')[0];
    const day = currentTimecard.days && currentTimecard.days.find(d => d.date && new Date(d.date).toISOString().split('T')[0] === todayFormatted);
    console.log('today: ', todayFormatted);
    console.log('day: ', day?.date && new Date(day.date).toISOString().split('T')[0]);
    console.log(day);
    

    if (day && day.clockIn !== null) {
      return NextResponse.json({ error: 'Already clocked in today' }, { status: 565 });
    }
    console.log(day?.clockIn, currentTimecard);



      // Ensure again there is no clock in and that the user is indeed not clocked in
      if ( day && day.clockIn === null && day.clockInStatus === false) {
        // Update clockIn for the day
      
// Convert to JS Date object
day.clockIn = nowCentral().toJSDate();
        day.clockInStatus = true;


        // Save user document
        await currentTimecard.save();
        console.log("User clocked in successfully:", day);
      }
    
    // Return success response
    return NextResponse.json({ message: 'Clocked in successfully', timecard: currentTimecard }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
