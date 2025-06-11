import mongoose, { Schema, Document } from 'mongoose';
import { IItem } from '../interfaces/IDatabase';

export interface IItemDocument extends Omit<IItem, '_id'>, Document {}

const ItemSchema: Schema = new Schema({
  number: {
    type: Number,
    required: true,
  },
  factor: {
    type: Number,
    required: true,
  },
  itemId: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

ItemSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

ItemSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

export const Item = mongoose.model<IItemDocument>('Item', ItemSchema);
