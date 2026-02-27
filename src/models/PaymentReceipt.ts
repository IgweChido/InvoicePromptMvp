import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentReceipt extends Document {
  invoiceId: string;
  customerId: string;
  fileUrl: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentReceiptSchema = new Schema<IPaymentReceipt>(
  {
    invoiceId: { type: String, required: true },
    customerId: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentReceipt ||
  mongoose.model<IPaymentReceipt>('PaymentReceipt', PaymentReceiptSchema);
