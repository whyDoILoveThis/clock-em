import dbConnect from '@/lib/mongodb';
import Owner from '@/models/Owner';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { companyId, userId } = await req.json();

    try {
      await dbConnect();

      const owner = await Owner.findOne({ 'companies._id': companyId });

      if (!owner) {
        return NextResponse.json({ error: 'Owner not found ❌' }, { status: 404 });
    }

      const company = owner.companies.id(companyId);
      
      if (company) {
        company.requests?.push({
          userId: userId,
          status: 'pending',
          dateRequested: new Date(),
        });

        await owner.save();
        return NextResponse.json({ message: 'Company added successfully ✅' });
    } else {
        return NextResponse.json({ error: 'Owner not found ❌' }, { status: 404 });
      }
    } catch (error) {
      console.error('Error adding request:', error);
      return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 });
    }
  } 
}
