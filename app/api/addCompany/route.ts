import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Owner from '@/models/Owner';

export async function POST(request: Request) {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB.');

    const { ownerId, company } = await request.json();
    console.log(`Received ownerId: ${ownerId}, company: ${JSON.stringify(company)}`);

    if (!ownerId || !company) {
      return NextResponse.json({ error: 'Owner ID and company details are required ❌' }, { status: 400 });
    }

    const owner = await Owner.findOne({ userId: ownerId });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found ❌' }, { status: 404 });
    }

    owner.companies.push(company);
    await owner.save();

    return NextResponse.json({ message: 'Company added successfully ✅' });
  } catch (error) {
    console.error('❌ An error occurred:', error);
    return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 });
  }
}
