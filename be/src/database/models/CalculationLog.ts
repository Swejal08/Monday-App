import mongoose, { Schema, Document } from 'mongoose';
import { ICalculationLog } from '../interfaces/IDatabase';

export interface ICalculationLogDocument
  extends Omit<ICalculationLog, '_id'>,
    Document {}

const CalculationLogSchema: Schema = new Schema({
  itemId: {
    type: Number,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  factor: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const CalculationLog = mongoose.model<ICalculationLogDocument>(
  'CalculationLog',
  CalculationLogSchema
);
