import mongoose, { Document, Schema, Model, model, Types } from 'mongoose';
import { IUser, UserSchema } from './User';

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
const OwnerSchema = new Schema({
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
  companies: {
    type: [CompanySchema],
    default: [],
    required: false,
  },
  employees: {
    type: [UserSchema],
    default: [],
    required: false,
  },
 
});

// TypeScript interface for User document
interface IOwner extends Document {
  userId: string;
  role: string
  firstName: string;
  fullName: string;
  age: string;
  phone: string;
  address: string;
  companies: Types.DocumentArray<ICompany>
  employees?: Types.DocumentArray<IUser>;
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
const Owner: Model<IOwner> = mongoose.models.Owner || model<IOwner>('Owner', OwnerSchema);
export default Owner;
