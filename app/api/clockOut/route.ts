import { NextResponse } from 'next/server';
import User from '@/models/User';
import Timecard from '@/models/Timecard';
import { DateTime } from 'luxon';
import { nowCentral } from '@/lib/dates';
import { calculateHoursWorked, getMonday, todayCentral } from '@/lib/global';



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
    const today = nowCentral();
    const todayISO = todayCentral();
    const currentMonday = getMonday();

    // ⏪ Pull recent timecards (limit 52 weeks back for safety/perf)
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

    // Helper to get YYYY-MM-DD from a day's date field
    // Stored dates are UTC midnight calendar dates — read them back as UTC, not Central
    const dayToISO = (d: any): string => {
      if (!d.date) return '';
      if (typeof d.date === 'string') return d.date.split('T')[0];
      return DateTime.fromJSDate(new Date(d.date)).toUTC().toISODate()!;
    };

    // 🧹 Clean up old days that never got clocked out
    timecards.forEach(tc => {
      tc.days?.forEach(d => {
        if (d.clockIn && !d.clockOut) {
          // If date is before today, nuke it
          const dISO = dayToISO(d);
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
    const thisWeek = timecards.find(tc => {
      if (!tc.weekStart) return false;
      const wsISO = typeof tc.weekStart === 'string'
        ? (tc.weekStart as string).split('T')[0]
        : DateTime.fromJSDate(new Date(tc.weekStart)).toUTC().toISODate();
      return wsISO === currentMonday;
    });
    if (!thisWeek) {
      console.log('No timecard found for this week');
      return NextResponse.json({ error: 'Timecard not found for this week' }, { status: 404 });
    }

    const day = thisWeek.days?.find(d => dayToISO(d) === todayISO);

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
    day.clockOut = today.toJSDate();
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




