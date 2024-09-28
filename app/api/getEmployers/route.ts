// /app/api/getEmployers/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Owner from '@/models/Owner';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    await dbConnect();

    // Find all companies where the user is an employee
    const owners = await Owner.find({
      'companies.employees': userId,
    });

    const employers = owners.flatMap(owner => 
      owner.companies.filter(company =>
        company.employees?.includes(userId)
      )
    );

    return NextResponse.json({ employers });
  } catch (error) {
    console.error('Error fetching employers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
