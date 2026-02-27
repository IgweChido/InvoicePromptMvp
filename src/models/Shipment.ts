import mongoose, { Document, Schema } from 'mongoose';

export type ShipmentStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'INVOICE_SENT' | 'INVOICE_SETTLED';

export interface IShipment extends Document {
  customerId: string;
  bookingId: mongoose.Types.ObjectId;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    customerId: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'INVOICE_SENT', 'INVOICE_SETTLED'],
      default: 'PENDING',
    },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IShipment>('Shipment', ShipmentSchema);
