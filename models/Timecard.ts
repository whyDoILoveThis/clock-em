// models/Timecard.ts
import mongoose, { Document, Schema } from 'mongoose';
import DaySchema, { IDay } from './Day';

export interface ITimecard extends Document {
  weekStart?: string | number | Date;
  days?: IDay[];
  totalPay?: number;
}

const TimecardSchema = new Schema<ITimecard>({
  weekStart: {
    type: String || Number || Date,
    required: false,
  },
  days: {
    type: [DaySchema],
    required: false,
  },
  totalPay: {
    type: Number,
    required: false,
    default: 0,
  },
});

export default TimecardSchema;
