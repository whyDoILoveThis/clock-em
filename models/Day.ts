// models/Day.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IBreak {
  startTime: Date;
  endTime?: Date | null;
}

export interface IDay extends Document {
  date?: Date | string;
  clockIn?: Date | null;
  clockOut?: Date | null;
  clockInStatus: boolean;
  hoursWorked?: number;
  breaks?: IBreak[];
  pay?: number;
}

const BreakSchema = new Schema<IBreak>({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date || null,
    required: false,
    default: null,
  },
});

const DaySchema = new Schema<IDay>({
  date: {
    type: Date || String,
    required: false,
  },
  clockIn: {
    type: Date || null,
    required: false,
  },
  clockOut: {
    type: Date || null,
    required: false,
  },
  clockInStatus: {
    type: Boolean,
    required: false,
    default: false
  },
  hoursWorked: {
    type: Number,
    required: false,
    default: 0,
  },
  breaks: {
    type: [BreakSchema],
    required: false,
    default: [],
  },
  pay: {
    type: Number,
    required: false,
    default: 0,
  },
});

export default DaySchema;
