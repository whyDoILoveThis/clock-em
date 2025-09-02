// models/User.ts
import mongoose, { Document, Schema, Model, model, Types } from 'mongoose';
import { ITimecard } from './Timecard';

const EmployerSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
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
  hourlyRate: {
    type: Number,
    default: 0,
    required: false
  }
});

export interface IEmployer extends Document {
  userId: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  logoUrl?: string;
  weekHours: number;
  hourlyRate?: number;
}

export interface IUser extends Document {
  userId: string;
  role: string;
  firstName: string;
  fullName: string;
  age: number;
  phone: string;
  address: string;
  employers?: Types.DocumentArray<IEmployer>;
  logoUrl?: string;
  addTimecard(companyId: string, timecard: ITimecard): Promise<void>;
  updateTimecard(companyId: string, userId: string, updatedTimecard: ITimecard): Promise<void>;
  deleteTimecard(companyId: string, userId: string): Promise<void>;
}

const UserSchema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user'], // Explicit roles
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
  employers: {
    type: [EmployerSchema],
    default: [],
    required: false,
  },
  logoUrl: {
    type: String,
    required: false,
  },
});



// Create and export User model
const User: Model<IUser> = mongoose.models.User || model<IUser>('User', UserSchema);
export default User;
