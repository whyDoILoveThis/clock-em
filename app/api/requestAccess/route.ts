import dbConnect from '@/lib/mongodb';
import Owner from '@/models/Owner';
import { NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { companyId, userId, userFullName, userEmail, userPhone, userAddress } = await req.json();

    console.log(userFullName, userEmail, userAddress);
    
    try {
      await dbConnect();

      // Find the owner with the specific company
      const owner = await Owner.findOne({ 'companies._id': companyId });

      if (!owner) {
        return NextResponse.json({ error: 'Owner not found ❌' }, { status: 404 });
      }

      const company = owner.companies.id(companyId);

      if (company) {
        // Check if the user has already sent a request
        const existingRequest = company.requests?.find(
          (request) => request.userId.toString() === userId
        );

        if (existingRequest) {
          return NextResponse.json({
            error: 'User has already sent a request ❌',
          }, { status: 400 });
        }

        // If no existing request, push the new request
        company.requests?.push({
          userId,
          userFullName,
          userEmail,
          userPhone,
          userAddress,
          status: 'pending',
          dateRequested: new Date(),
        });

        await owner.save();
        return NextResponse.json({ message: 'Request added successfully ✅' });
      } else {
        return NextResponse.json({ error: 'Company not found ❌' }, { status: 404 });
      }
    } catch (error) {
      console.error('Error adding request:', error);
      return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 });
    }
  }
}
