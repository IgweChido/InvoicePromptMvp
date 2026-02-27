import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  shipmentId: string;
  customerId: string;
  quoteId?: string;
  scheduledDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    shipmentId: { type: String, required: true },
    customerId: { type: String, required: true },
    quoteId: { type: String },
    scheduledDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model<IBooking>('Booking', BookingSchema);
