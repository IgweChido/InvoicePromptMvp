import mongoose, { Schema, Document } from 'mongoose';

export type ShipmentStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'INVOICE_SENT'
  | 'INVOICE_SETTLED';

export interface IShipment extends Document {
  trackingNumber: string;
  customerId: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  bookingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    trackingNumber: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'INVOICE_SENT', 'INVOICE_SETTLED'],
      default: 'PENDING',
    },
    bookingId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Shipment ||
  mongoose.model<IShipment>('Shipment', ShipmentSchema);
