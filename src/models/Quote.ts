import mongoose, { Schema, Document } from 'mongoose';

export interface IQuote extends Document {
  customerId: string;
  baseRate: number;
  adjustments: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    customerId: { type: String, required: true },
    baseRate: { type: Number, required: true },
    adjustments: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

export default mongoose.models.Quote ||
  mongoose.model<IQuote>('Quote', QuoteSchema);
