import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Owner from '@/models/Owner';
import User from '@/models/User'; // Assuming the User model exists

export async function PUT(request: Request) {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB.');

    // Destructure the incoming data
    const { ownerId, companyId, employeeId, newHourlyRate } = await request.json();
    console.log(`Received ownerId: ${ownerId}, companyId: ${companyId}, employeeId: ${employeeId}, newHourlyRate: ${newHourlyRate}`);

    // Validation: Ensure all required fields are present
    if (!ownerId || !companyId || !employeeId || newHourlyRate === undefined) {
      return NextResponse.json({ error: 'Owner ID, company ID, employee ID, and new hourly rate are required ❌' }, { status: 400 });
    }

    // Step 1: Update the Owner's collection (company's employee)
    const owner = await Owner.findOne({ userId: ownerId });
    if (!owner) {
      return NextResponse.json({ error: 'Owner not found ❌' }, { status: 401 });
    }

    const company = owner.companies.id(companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found ❌' }, { status: 402 });
    }

    const employee = company.employees?.find((emp) => emp.userId === employeeId);
    if (!employee) {
        return NextResponse.json({ error: 'Employee not found ❌' }, { status: 403 });
    }
    
    // Update the employee's hourly rate
    employee.hourlyRate = newHourlyRate;
    await owner.save();

    // Step 2: Update the User's collection (in the employers array)
    const user = await User.findOne({ userId: employeeId });
    if (!user) {
      return NextResponse.json({ error: 'User not found ❌' }, { status: 404 });
    }

    // Find the relevant employer inside the user's employers array
    const employer = user.employers?.find((emp) => emp.userId === companyId);
    if (!employer) {
      return NextResponse.json({ error: 'Employer record not found for the user ❌' }, { status: 405 });
    }

    // Update the hourly rate in the user's employers array
    employer.hourlyRate = newHourlyRate;
    await user.save();

    return NextResponse.json({ message: 'Employee hourly rate updated successfully in both collections ✅', employee });
  } catch (error) {
    console.error('❌ An error occurred:', error);
    return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 });
  }
}
