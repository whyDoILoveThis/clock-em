import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Owner from '@/models/Owner';

export async function PUT(request: Request) {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB.');

    const { ownerId, companyId, companyData } = await request.json();
    console.log(`Received ownerId: ${ownerId}, companyId: ${companyId}, companyData: ${JSON.stringify(companyData)}`);

    if (!ownerId || !companyId || !companyData) {
      return NextResponse.json({ error: 'Owner ID, company ID, and company data are required ❌' }, { status: 400 });
    }

    const owner = await Owner.findOne({ userId: ownerId });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found ❌' }, { status: 404 });
    }

    const company = owner.companies.id(companyId);

    if (!company) {
      return NextResponse.json({ error: 'Company not found ❌' }, { status: 404 });
    }

    Object.assign(company, companyData);
    await owner.save();

    return NextResponse.json({ message: 'Company updated successfully ✅', company });
  } catch (error) {
    console.error('❌ An error occurred:', error);
    return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 });
  }
}
