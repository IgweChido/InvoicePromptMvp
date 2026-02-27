import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ShipmentModel from '@/models/Shipment';

export async function GET() {
  try {
    await connectDB();
    const shipments = await ShipmentModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ shipments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { trackingNumber, customerId, origin, destination } = body;
    if (!trackingNumber || !customerId || !origin || !destination) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const shipment = await ShipmentModel.create({ trackingNumber, customerId, origin, destination });
    return NextResponse.json({ shipment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
