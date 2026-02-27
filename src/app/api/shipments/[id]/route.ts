import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ShipmentModel from '@/models/Shipment';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const shipment = await ShipmentModel.findById(params.id);
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    return NextResponse.json({ shipment });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipment' }, { status: 500 });
  }
}
