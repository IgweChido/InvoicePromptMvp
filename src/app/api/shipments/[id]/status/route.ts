import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { onShipmentStatusUpdate } from '@/services/invoiceService';
import { ShipmentStatus } from '@/models/Shipment';

const VALID_STATUSES: ShipmentStatus[] = [
  'PENDING',
  'IN_TRANSIT',
  'DELIVERED',
  'INVOICE_SENT',
  'INVOICE_SETTLED',
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    await onShipmentStatusUpdate(id, status as ShipmentStatus);
    return NextResponse.json({ success: true, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
