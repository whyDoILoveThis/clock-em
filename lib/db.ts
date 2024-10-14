import { MongoClient, MongoClientOptions, ObjectId } from 'mongodb';
import { User, Request, Company } from '@/types/types.type';

// MongoDB client setup
const uri = process.env.MONGODB_URI as string;
const options: MongoClientOptions = {};

// Create a MongoClient instance with the URI and options
const client = new MongoClient(uri, options);

// Export the client promise
const clientPromise = client.connect();

export const fetchEmployeesInCompany = async (companyId: string): Promise<User[]> => {
  const client = await clientPromise;
  const db = client.db('clock-em');
  const usersCollection = db.collection<User>('users');

  // Find users where the companyId is in the companies array
  return usersCollection.find({ companies: companyId }).toArray();
};

export const fetchEmployeeRequests = async (ownerId: string): Promise<Request[]> => {
  const client = await clientPromise;
  const db = client.db('clock-em');
  const requestsCollection = db.collection<Request>('requests');

  return requestsCollection.find({ ownerId: new ObjectId(ownerId) }).toArray();
};



export const addEmployeeToCompany = async (employeeId: string, companyId: string): Promise<void> => {
  const client = await clientPromise;
  const db = client.db('clock-em');
  const usersCollection = db.collection<User>('users');

  await usersCollection.updateOne(
    { _id: new ObjectId(employeeId) },
    { $addToSet: { companies: companyId } }
  );
};

export const calculateWorkHoursAndPay = async (employeeId: string, hourlyRate: number): Promise<{ totalHours: number; totalPay: number }> => {
  const client = await clientPromise;
  const db = client.db('clock-em');
  const timesheetsCollection = db.collection('timesheets');

  const timesheets = await timesheetsCollection.find({ employeeId: new ObjectId(employeeId) }).toArray();

  const totalHours = timesheets.reduce((acc, sheet) => acc + sheet.hours, 0);
  const totalPay = totalHours * hourlyRate;

  return { totalHours, totalPay };
};

export const updateUserHourlyRate = async (userId: string, hourlyRate: number): Promise<void> => {
  const client = await clientPromise;
  const db = client.db('clock-em');
  const usersCollection = db.collection<User>('users');

  await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { hourlyRate } }
  );
};

export const updateUserTimeTrackingPeriod = async (userId: string, period: number): Promise<void> => {
  const client = await clientPromise;
  const db = client.db('clock-em');
  const usersCollection = db.collection<User>('users');

  await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { timeTrackingPeriod: period } }
  );
};

export default clientPromise;
