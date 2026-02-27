import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import InvoiceModel from '@/models/Invoice';

export async function GET() {
  try {
    await connectDB();
    const invoices = await InvoiceModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ invoices });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
