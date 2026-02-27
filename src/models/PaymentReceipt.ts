import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentReceipt extends Document {
  invoiceId: mongoose.Types.ObjectId;
  fileUrl: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentReceiptSchema = new Schema<IPaymentReceipt>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IPaymentReceipt>('PaymentReceipt', PaymentReceiptSchema);
