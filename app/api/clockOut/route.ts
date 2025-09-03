import { NextResponse } from 'next/server';
import User from '@/models/User';
import Timecard from '@/models/Timecard';
import { DateTime } from 'luxon';
import { nowCentral } from '@/lib/dates';



export async function POST(req: Request) {
  try {
    const { userId, employerName } = await req.json();

    if (!userId || !employerName) {
      return NextResponse.json({ error: 'Missing userId or employerName' }, { status: 400 });
    }

    const user = await User.findOne({ userId });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const employer = user.employers?.find(
      emp => emp.name === employerName || emp.userId === employerName
    );
    if (!employer) return NextResponse.json({ error: 'Employer not found for this user' }, { status: 404 });

    const hourlyRate = employer.hourlyRate ?? 0;
    const today = nowCentral().toJSDate();
    const currentMonday = getMonday(new Date(today));

    // ⏪ Pull recent timecards (limit 2 weeks back for safety/perf)
    const twoWeeksAgo = nowCentral().minus({ weeks: 52 }).toISODate();

    const timecards = await Timecard.find({
      employeeId: userId,
      companyId: employerName,
      weekStart: { $gte: twoWeeksAgo },
    });

    if (!timecards || timecards.length === 0) {
      console.log('No recent timecards found');
      return NextResponse.json({ error: 'No recent timecards found' }, { status: 404 });
    }

    // 🧹 Clean up old days that never got clocked out
    timecards.forEach(tc => {
      tc.days?.forEach(d => {
        if (d.clockIn && !d.clockOut) {
          // If date is before today, nuke it
          const dISO = new Date(String(d.date)).toISOString().split('T')[0];
          const todayISO = today.toISOString().split('T')[0];
          if (dISO < todayISO) {
            d.clockIn = null;
            d.clockOut = null;
            d.hoursWorked = 0;
            d.clockInStatus = false;
          }
        }
      });
    });

    await Promise.all(timecards.map(tc => tc.save()));

    // ⏩ Now process *today’s* clockOut
    const thisWeek = timecards.find(tc => 
      new Date(String(tc.weekStart)).toISOString().split('T')[0] === currentMonday.toISOString().split('T')[0]
    );
    if (!thisWeek) {
      console.log('No timecard found for this week');
      return NextResponse.json({ error: 'Timecard not found for this week' }, { status: 404 });
    }

    const todayFormatted = today.toISOString().split('T')[0];
    const day = thisWeek.days?.find(d =>
      new Date(String(d.date)).toISOString().split('T')[0] === todayFormatted
    );

    if (!day) {
      return NextResponse.json({ error: 'No entry found for today' }, { status: 404 });
    }

    if (!day.clockIn) {
      thisWeek.days?.forEach(d => (d.clockInStatus = false));
      await thisWeek.save();
      return NextResponse.json({ error: 'User has not clocked in today' }, { status: 400 });
    }

    if (day.clockOut) {
      thisWeek.days?.forEach(d => (d.clockInStatus = false));
      await thisWeek.save();
      return NextResponse.json({ error: 'User has already clocked out today' }, { status: 565 });
    }

    // ✅ Normal clockOut
    day.clockOut = today;
    day.clockInStatus = false;

    if (day.clockIn instanceof Date && day.clockOut instanceof Date) {
      day.hoursWorked = calculateHoursWorked(day.clockIn, day.clockOut);
    } else {
      return NextResponse.json({ error: 'Invalid time format' }, { status: 400 });
    }

    // 💰 Calculate pay
    const payForToday = day.hoursWorked * hourlyRate;
    thisWeek.totalPay = (thisWeek.days || []).reduce(
      (acc, d) => acc + (d.hoursWorked || 0) * hourlyRate,
      0
    );

    thisWeek.days?.forEach(d => (d.clockInStatus = false));
    await thisWeek.save();

    return NextResponse.json(
      {
        message: 'Clocked out successfully',
        hoursWorked: day.hoursWorked,
        payForToday,
        totalPay: thisWeek.totalPay,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// Helper to get Monday of the current week
const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

// Calculate hours worked between two JS Date objects
export const calculateHoursWorked = (clockIn: Date, clockOut: Date): number => {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  return diffMs / (1000 * 60 * 60);
};