import { ObjectId } from 'mongodb';

export interface Owner {
  userId: string;
  role: string
  firstName: string;
  fullName: string;
  age: string;
  phone: string;
  address: string;
  companies: Company[]
  logoUrl?: string;
}

export interface User {
  userId: string;
  role: string
  firstName: string;
  fullName: string;
  age: string;
  phone: string;
  address: string;
  employers?: Company;
  logoUrl?: string;
}

export interface Company {
  _id: string;
  logoUrl?: string;
  name: string;
  phone: string;
  address: string;
  estDate: number;
  employees?: User[];
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
