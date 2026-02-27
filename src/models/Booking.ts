import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  customerId: string;
  shipmentId: mongoose.Types.ObjectId;
  cargoDescription: string;
  weight: number;
  volume: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    customerId: { type: String, required: true },
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true },
    cargoDescription: { type: String, required: true },
    weight: { type: Number, required: true },
    volume: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
