import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  clerkId: string;
  name: string;
  role: 'owner' | 'employee';
  hourlyRate?: number;
  timeTrackingPeriod?: number; // 1 or 2 weeks
  companies?: string[]; // Company IDs the employee is part of
}

export interface Company {
  _id: ObjectId;
  name: string;
}

export interface ClockInRecord {
  _id: ObjectId;
  employeeId: string;
  companyId: string;
  clockInTime: Date;
  clockOutTime: Date | null;
}

export interface Request {
  _id: ObjectId;
  employeeId: string;
  companyId: string;
  status: 'pending' | 'approved' | 'rejected';
}
