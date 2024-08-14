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

export interface Employee{
  userId: string,
  fullName: string,
  email: string,
  phone: string,
  address: string,
  status: string,
  dateHired: Date,

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
  requests: Request[]
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
  userId: string;
  userFullName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string
  status: 'pending' | 'accepted' | 'rejected';
  dateRequested: Date;
}
