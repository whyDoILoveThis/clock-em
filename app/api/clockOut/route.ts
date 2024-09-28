import { NextResponse } from 'next/server';
import User from '@/models/User';

// Helper to calculate hours worked between two dates
const calculateHoursWorked = (clockIn: Date, clockOut: Date): number => {
  const diffMs = clockOut.getTime() - clockIn.getTime(); // Difference in milliseconds
  const diffHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
  return diffHours;
};

// Helper to get Monday of the current week
const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(date.setDate(diff));
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

    // Check if there's a timecard for the current week (same Monday)
    const currentTimecard = employer.timecards.find(tc => {
      const weekStart = tc.weekStart && new Date(tc.weekStart).toISOString().split('T')[0];
      return currentMonday.toISOString().split('T')[0] === weekStart;
    });

    if (!currentTimecard) {
      return NextResponse.json({ error: 'No timecard found for this week' }, { status: 404 });
    }

    
    // Find today's day in the timecard
    const todayFormatted = today.toISOString().split('T')[0];
    const day = currentTimecard.days && currentTimecard.days.find(d => d.date && new Date(d.date).toISOString().split('T')[0] === todayFormatted);
    
    if (!day) {
      return NextResponse.json({ error: 'No day entry found for today' }, { status: 404 });
    }

    // Check if the user has clocked in
    if (!day.clockIn) {
      return NextResponse.json({ error: 'You need to clock in before clocking out' }, { status: 400 });
    }

    // Check if the user has already clocked out
    if (day.clockOut) {
      return NextResponse.json({ error: 'You have already clocked out today' }, { status: 400 });
    }

    // Set the clock out time
    day.clockOut = new Date();
    day.clockInStatus = false;
    
    // Check if clockIn and clockOut are valid Date objects
    if (day.clockIn instanceof Date && day.clockOut instanceof Date) {
      day.hoursWorked = calculateHoursWorked(day.clockIn, day.clockOut);
    } else {
      return NextResponse.json({ error: 'Invalid clockIn or clockOut time' }, { status: 400 });
    }

    const updatedPay = employer.hourlyRate && employer.hourlyRate > 0 ? day.hoursWorked * employer.hourlyRate : 0
    currentTimecard.totalPay = updatedPay
    console.log(currentTimecard);
    
    // Save the updated user document
    await user.save();

    return NextResponse.json({ message: 'Clocked out successfully', hoursWorked: day.hoursWorked }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
