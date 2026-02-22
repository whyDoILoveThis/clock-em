import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import mongoose from 'mongoose';
import Timecard, { ITimecard } from '@/models/Timecard';
import { Day } from '@/types/types.type';
import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { nowCentral } from '@/lib/dates';
import { getMonday, initializeWeek, todayCentral } from '@/lib/global';





export async function POST(req: Request) {
  try {
    const { userId, companyId } = await req.json();

   

    // Get Monday of the current week (Central timezone)
    const currentMonday = getMonday();

    const existingTimecard = await Timecard.findOne({
      companyId,
      employeeId: userId,
      weekStart: currentMonday,
    });

    
    // Check if there's already a timecard for the current week (same Monday)
    let currentTimecard = existingTimecard as ITimecard;

    // If no current week timecard exists, create a new one
    if (!currentTimecard) {
      currentTimecard = await Timecard.create({
        companyId,
        employeeId: userId,
        weekStart: currentMonday,
        totalPay: 0,
        days: initializeWeek(currentMonday),
      });
    }


    
    
    // Find today's day in the timecard (Central timezone)
    const todayFormatted = todayCentral();
    const day = currentTimecard.days && currentTimecard.days.find(d => {
      if (!d.date) return false;
      // Stored dates are UTC midnight calendar dates — read them back as UTC, not Central
      const dayDate = typeof d.date === 'string' ? d.date.split('T')[0] : DateTime.fromJSDate(new Date(d.date)).toUTC().toISODate();
      return dayDate === todayFormatted;
    });
    console.log('today: ', todayFormatted);
    console.log('day: ', day?.date);
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




