import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import InvoiceModel from '@/models/Invoice';
import PaymentReceiptModel from '@/models/PaymentReceipt';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const invoice = await InvoiceModel.findById(params.id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status !== 'SENT') {
      return NextResponse.json(
        { error: 'Invoice is not in SENT status' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('receipt') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No receipt file provided' }, { status: 400 });
    }

    // Save file locally
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `receipt-${params.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const receiptUrl = `/uploads/${filename}`;

    // Update invoice
    await InvoiceModel.findByIdAndUpdate(params.id, {
      status: 'PAID',
      receiptUrl,
    });

    // Create PaymentReceipt record
    await PaymentReceiptModel.create({
      invoiceId: params.id,
      customerId: invoice.customerId,
      fileUrl: receiptUrl,
      uploadedAt: new Date(),
    });

    return NextResponse.json({ success: true, receiptUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
