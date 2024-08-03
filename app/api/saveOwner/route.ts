// /app/api/saveUser/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Owner from '@/models/Owner';


export async function POST(request: Request) {
    
  try {
    await dbConnect();

    const { userId, role, firstName, fullName, age, phone, address, logoUrl } = await request.json();
    if (!userId || !role || !firstName || !fullName || !age || !phone || !address) {
      return NextResponse.json({ error: 'userId, role, firstName, fullName, age, phone, address are required' }, { status: 400 });
    }

    const newOwner = new Owner({ userId, role, firstName, fullName, age, phone, address, logoUrl });
    await newOwner.save();
    return NextResponse.json(newOwner, { status: 201 });
  } catch (error) {
    console.error('❌ An error occurred:', error);
    return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 });
  }
}
