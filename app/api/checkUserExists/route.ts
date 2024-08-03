// /app/api/checkUser/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '@/models/User';
import Owner from '@/models/Owner';

export async function POST(request: Request) {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB.');

    const { userId } = await request.json();
    console.log(`Received userId: ${userId}`);

    if (!userId) {
      console.log('User ID is missing.');
      return NextResponse.json({ error: 'User ID is required ❌' }, { status: 401 });
    }

    const user = await User.findOne({ userId }) || await Owner.findOne({ userId });
    console.log(`User found: ${!!user}`);

    if (user) {
      return NextResponse.json({ exists: true, user });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error('❌ An error occurred:', error);
    return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 });
  }
}
