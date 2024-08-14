import mongoose, { Document, Schema, Model, model, Types, ObjectId } from 'mongoose';
import { IUser, UserSchema } from './User';

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
});


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
  }
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
  logoUrl?: string;
}

// TypeScript interface for Company subdocument
interface ICompany extends Document {
  _id: string;
  logoUrl?: string;
  name: string;
  phone: string;
  address: string;
  employees?: Types.DocumentArray<IUser>;
  estDate: string;
  requests?: Types.DocumentArray<IRequest>;
}

interface IRequest extends Document {
  userId: string;
  userFullName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  status: 'pending' | 'accepted' | 'rejected';
  dateRequested: string;
}


// Create and export User model
const Owner: Model<IOwner> = mongoose.models.Owner || model<IOwner>('Owner', OwnerSchema);
export default Owner;
