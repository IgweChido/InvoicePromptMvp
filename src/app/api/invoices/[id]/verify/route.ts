import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import InvoiceModel from '@/models/Invoice';
import ShipmentModel from '@/models/Shipment';
import PaymentReceiptModel from '@/models/PaymentReceipt';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Invoice must be in PAID status to verify' },
        { status: 400 }
      );
    }

    // Update invoice to VERIFIED
    await InvoiceModel.findByIdAndUpdate(id, { status: 'VERIFIED' });

    // Update shipment to INVOICE_SETTLED
    await ShipmentModel.findByIdAndUpdate(invoice.shipmentId, { status: 'INVOICE_SETTLED' });

    // Mark receipt as verified
    await PaymentReceiptModel.findOneAndUpdate(
      { invoiceId: id },
      { verifiedAt: new Date() }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
