import mongoose, { Document, Schema } from 'mongoose';

export type BillingType = 'CREDIT' | 'CONTRACT_SPLIT';

export interface ISplitRatio {
  platform: number;
  partner: number;
}

export interface IContractAgreement extends Document {
  customerId: string;
  billingType: BillingType;
  splitRatio?: ISplitRatio;
  createdAt: Date;
  updatedAt: Date;
}

const ContractAgreementSchema = new Schema<IContractAgreement>(
  {
    customerId: { type: String, required: true },
    billingType: { type: String, enum: ['CREDIT', 'CONTRACT_SPLIT'], required: true },
    splitRatio: {
      platform: { type: Number },
      partner: { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IContractAgreement>('ContractAgreement', ContractAgreementSchema);
