import mongoose, { Document, Schema } from 'mongoose';

export interface IQuote extends Document {
  bookingId: mongoose.Types.ObjectId;
  baseRate: number;
  fuelSurcharge: number;
  handlingFee: number;
  taxRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    baseRate: { type: Number, required: true },
    fuelSurcharge: { type: Number, default: 0 },
    handlingFee: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.1 },
  },
  { timestamps: true }
);

export default mongoose.model<IQuote>('Quote', QuoteSchema);
