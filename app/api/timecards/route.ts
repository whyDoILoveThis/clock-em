import { NextResponse } from 'next/server';
import User from '@/models/User';

// Define the expected headers type
interface CustomHeaders extends Headers {
  userId: string; // Adjust type if needed
  companyId: string; // Adjust type if needed
}

export async function GET(req: Request) {
  try {
    const headers = req.headers as CustomHeaders; // Cast to CustomHeaders type
    const userId = headers.get('userId'); // Safely get userId
    const companyId = headers.get('companyId'); // Safely get companyId

    // Validate the retrieved values
    if (!userId || !companyId) {
      return NextResponse.json({ error: 'userId and companyId are required' }, { status: 400 });
    }

    // Find user by userId
    const user = await User.findOne({ userId });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if employers array exists and has entries
    if (!user.employers || user.employers.length === 0) {
      return NextResponse.json({ error: 'No employers found for this user' }, { status: 404 });
    }

    // Find the employer by companyId
    const employer = user.employers.find(emp => emp.userId === companyId);

    if (!employer) {
      return NextResponse.json({ error: 'Employer not found for this user' }, { status: 404 });
    }

    // Retrieve the timecards for the specified employer
    const timecards = employer.timecards;

    return NextResponse.json({ timecards }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
