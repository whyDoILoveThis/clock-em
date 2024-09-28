// models/Owner.ts
import mongoose, { Document, Schema, Model, model, Types } from 'mongoose';
import TimecardSchema, { ITimecard } from './Timecard';

const RequestSchema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  userFullName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userPhone: {
    type: String,
    required: true,
  },
  userAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    required: true,
  },
  dateRequested: {
    type: Date,
    default: Date.now,
  },
});

const EmployeeSchema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['employed', 'resigned', 'terminated'],
    default: 'employed',
    required: true,
  },
  dateHired: {
    type: Date,
    default: Date.now,
  },
  hourlyRate: {
    type: Number,
    default: 0,
    required: false,
  },
  totalPay: {
    type: Number,
    required: false,
    default: 0,
  },
  timecards: {
    type: [TimecardSchema],
    default: [],
    required: false,
  },
});

const CompanySchema = new Schema({
  logoUrl: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  estDate: {
    type: String,
    required: true,
  },
  employees: {
    type: [EmployeeSchema],
    default: [],
    required: false,
  },
  requests: {
    type: [RequestSchema],
    default: [],
    required: false,
  },
});

export interface IRequest extends Document {
  userId: string;
  userFullName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  status: 'pending' | 'accepted' | 'rejected';
  dateRequested: Date;
}

export interface IEmployee extends Document {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: 'employed' | 'resigned' | 'terminated';
  dateHired: Date;
  hourlyRate?: number;
  totalPay?: number;
  timecards: Types.DocumentArray<ITimecard>;
}

export interface ICompany extends Document {
  _id: string;
  logoUrl?: string;
  name: string;
  phone: string;
  address: string;
  estDate: string;
  employees?: Types.DocumentArray<IEmployee>;
  requests?: Types.DocumentArray<IRequest>;
}

export interface IOwner extends Document {
  userId: string;
  role: string;
  firstName: string;
  fullName: string;
  age: number;
  phone: string;
  address: string;
  companies: Types.DocumentArray<ICompany>;
  logoUrl?: string;
}

const OwnerSchema = new Schema<IOwner>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['owner'], // Explicit roles
  },
  firstName: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  companies: {
    type: [CompanySchema],
    default: [],
    required: false,
  },
});

const Owner: Model<IOwner> = mongoose.models.Owner || model<IOwner>('Owner', OwnerSchema);
export default Owner;
