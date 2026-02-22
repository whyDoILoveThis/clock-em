// /app/api/resetDemoUser/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '@/models/User';
import Owner from '@/models/Owner';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete user from both collections
    const deletedUser = await User.findOneAndDelete({ userId });
    const deletedOwner = await Owner.findOneAndDelete({ userId });

    if (deletedUser || deletedOwner) {
      return NextResponse.json({ success: true, message: 'Demo user reset successfully' });
    } else {
      return NextResponse.json({ success: true, message: 'No user found to reset (already fresh)' });
    }
  } catch (error) {
    console.error('❌ An error occurred:', error);
    return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 });
  }
}
