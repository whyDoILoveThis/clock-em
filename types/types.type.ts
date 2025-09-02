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

export interface Employer {
  userId: string;
  name: string;
  age: string;
  phone: string;
  address: string;
  logoUrl?: string;
  weeklyHours: number;
  hourlyRate: number;
  totalPay?: number;
  timecards: Timecard[]; // Array of past timecards
}

export interface Employee{
  userId: string,
  fullName: string,
  email: string,
  phone: string,
  address: string,
  status: string,
  dateHired: Date,
  hourlyRate: number,
  totalPay?: number;
  timecards: Timecard[]; // Array of past timecards
}


export interface User {
  userId: string;
  role: string
  firstName: string;
  fullName: string;
  age: string;
  phone: string;
  address: string;
  employers?: Employer[];
  logoUrl?: string;
}

export interface Company {
  _id: string;
  userId: string;
  logoUrl?: string;
  name: string;
  phone: string;
  address: string;
  estDate: number;
  requests: Request[]
  employees?: Employee[];
}

export interface ClockInRecord {
  _id: ObjectId;
  employeeId: string;
  companyId: string;
  clockInTime: Date;
  clockOutTime: Date | null;
}

export interface Day {
  date: string;
  clockIn: Date | null;
  clockOut: Date | null;
  clockInStatus: boolean;
  hoursWorked: number;
}


export interface Timecard {
  userId: string;
  companyId: string;
  employeeId: string;
  weekStart: Date;
  weekEnd: Date;
  days: Day[];
  totalHours: number;
  totalPay: number;
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
