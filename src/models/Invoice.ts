import mongoose, { Document, Schema } from 'mongoose';

export type InvoiceStatus = 'PENDING' | 'SENT' | 'PAID' | 'VERIFIED';
export type BillingType = 'CREDIT' | 'CONTRACT_SPLIT';

export interface ISplitRatio {
  platform: number;
  partner: number;
}

export interface IInvoice extends Document {
  shipmentId: mongoose.Types.ObjectId;
  customerId: string;
  billingType: BillingType;
  splitRatio?: ISplitRatio;
  subtotal: number;
  tax: number;
  total: number;
  quickbooksInvoiceId?: string;
  status: InvoiceStatus;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true },
    customerId: { type: String, required: true },
    billingType: { type: String, enum: ['CREDIT', 'CONTRACT_SPLIT'], required: true },
    splitRatio: {
      platform: { type: Number },
      partner: { type: Number },
    },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    quickbooksInvoiceId: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'PAID', 'VERIFIED'],
      default: 'PENDING',
    },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
