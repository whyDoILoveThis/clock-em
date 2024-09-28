// models/Day.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IDay extends Document {
  date?: Date | string;
  clockIn?: Date | null;
  clockOut?: Date | null;
  clockInStatus: boolean;
  hoursWorked?: number;
}

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
});

export default DaySchema;
