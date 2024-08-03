import mongoose, { Document, Schema, Model, model, Types } from 'mongoose';

// Define Company schema
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
    type: Number,
    required: true,
  },
});

// Define User schema
export const UserSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
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
    type: [CompanySchema],
    default: [],
    required: false,
  },
  logoUrl: {
    type: String,
    required: false,
  },
});

// TypeScript interface for User document
export interface IUser extends Document {
  userId: string;
  role: string
  firstName: string;
  fullName: string;
  age: string;
  phone: string;
  address: string;
  employers?: Types.DocumentArray<ICompany>;
  logoUrl?: string;
}

// TypeScript interface for Company subdocument
interface ICompany extends Document {
  logoUrl?: string;
  name: string;
  phone: string;
  address: string;
  estDate: number;
}

// Create and export User model
const User: Model<IUser> = mongoose.models.User || model<IUser>('User', UserSchema);
export default User;
