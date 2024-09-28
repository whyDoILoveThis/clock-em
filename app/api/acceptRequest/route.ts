import dbConnect from '@/lib/mongodb';
import Owner from '@/models/Owner';
import User from '@/models/User';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { companyId, userId } = await req.json();

    try {
      await dbConnect();

      // Find the owner who owns the company
      const owner = await Owner.findOne({ 'companies._id': companyId });

      if (!owner) {
        return NextResponse.json({ error: 'Owner not found ❌' }, { status: 404 });
      }

      // Find the specific company
      const company = owner.companies.id(companyId);
      if (!company?.requests) {
        return NextResponse.json({ error: 'Company not found ❌' }, { status: 404 });
      }

      // Find the request and remove it
      const requestIndex = company.requests.findIndex(req => req.userId === userId);
      if (requestIndex === -1) {
        return NextResponse.json({ error: 'Request not found ❌' }, { status: 404 });
      }

      const acceptedRequest = company.requests[requestIndex];

      // Remove the request from the requests array
      company.requests.splice(requestIndex, 1);

      // Add the user to the employees array
      company.employees?.push({
        userId: acceptedRequest.userId,
        fullName: acceptedRequest.userFullName,
        email: acceptedRequest.userEmail,
        phone: acceptedRequest.userPhone,
        address: acceptedRequest.userAddress,
        // Add any other fields you need for employees
      });

      // Save the changes to the owner document
      await owner.save();

      // Now update the user to add the company to their employers list
      const user = await User.findOne({ userId: acceptedRequest.userId });

      if (user) {
        user.employers?.push({
          userId: companyId,
          logoUrl: company.logoUrl,
          name: company.name,
          phone: company.phone,
          address: company.address,
          estDate: company.estDate,
        });

        // Save the changes to the user document
        await user.save();
      } else {
        return NextResponse.json({ error: 'User not found ❌' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Request accepted and user added to employees ✅' });
    } catch (error) {
      console.error('Error accepting request:', error);
      return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 });
    }
  }
}
