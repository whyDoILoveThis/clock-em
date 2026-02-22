// models/Timecard.ts
import mongoose, { Document, model, Model, Schema, Types } from 'mongoose';
import DaySchema, { IDay } from './Day';

export interface ITimecard extends Document {
  companyId: string;
  employeeId: string;
  weekStart?: Date | string | undefined;
  totalPay?: number;
  days?: IDay[];
}

export const TimecardSchema = new Schema<ITimecard>({
  companyId: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  weekStart: {
    type: Date,
    required: false,
  },
  totalPay: {
    type: Number,
    required: false,
    default: 0,
  },
  days: {
    type: [DaySchema],
    required: false,
    default: [],
  },
});

// Force re-registration so schema changes (e.g. adding breaks to Day) are picked up
// Next.js hot-reload caches mongoose.models — stale schemas silently strip new fields
if (mongoose.models.Timecard) {
  mongoose.deleteModel('Timecard');
}
const Timecard: Model<ITimecard> = model<ITimecard>('Timecard', TimecardSchema);
export default Timecard;
