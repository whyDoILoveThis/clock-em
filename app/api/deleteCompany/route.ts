import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Owner from '@/models/Owner';

export async function DELETE(request: Request) {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB.');

    const { ownerId, companyId } = await request.json();
    console.log(`Received ownerId: ${ownerId}, companyId: ${companyId}`);

    if (!ownerId || !companyId) {
      return NextResponse.json({ error: 'Owner ID and company ID are required ❌' }, { status: 400 });
    }

    const owner = await Owner.findOne({ userId: ownerId });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found ❌' }, { status: 404 });
    }

    const companyIndex = owner.companies.findIndex(company => company._id.toString() === companyId);

    if (companyIndex === -1) {
      return NextResponse.json({ error: 'Company not found ❌' }, { status: 404 });
    }

    owner.companies.splice(companyIndex, 1);
    await owner.save();

    return NextResponse.json({ message: 'Company deleted successfully ✅' });
  } catch (error) {
    console.error('❌ An error occurred:', error);
    return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 });
  }
}
