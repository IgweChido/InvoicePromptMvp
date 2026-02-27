import { connectDB } from '@/lib/mongodb';
import ShipmentModel, { ShipmentStatus } from '@/models/Shipment';
import BookingModel from '@/models/Booking';
import QuoteModel from '@/models/Quote';
import ContractAgreementModel from '@/models/ContractAgreement';
import InvoiceModel from '@/models/Invoice';
import { QuickbooksService } from './QuickbooksService';

const TAX_RATE = 0.1; // 10% tax
const BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

export async function createInvoiceFromShipment(shipmentId: string) {
  await connectDB();

  const shipment = await ShipmentModel.findById(shipmentId);
  if (!shipment) throw new Error(`Shipment ${shipmentId} not found`);

  // Find booking for this shipment
  const booking = await BookingModel.findOne({ shipmentId: shipment._id.toString() });

  // Find quote if booking exists
  let quote = null;
  if (booking?.quoteId) {
    quote = await QuoteModel.findById(booking.quoteId);
  }

  // Find contract agreement for customer
  const contract = await ContractAgreementModel.findOne({ customerId: shipment.customerId });

  // Calculate amounts
  const baseRate = quote?.baseRate ?? 100;
  const adjustments = quote?.adjustments ?? 0;
  const subtotal = baseRate + adjustments;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const billingType = contract?.billingType ?? 'CREDIT';
  const splitRatio = contract?.splitRatio;

  // Create invoice
  const invoice = await InvoiceModel.create({
    shipmentId: shipment._id.toString(),
    customerId: shipment.customerId,
    billingType,
    splitRatio,
    subtotal,
    tax,
    total,
    status: 'PENDING',
  });

  // Call QuickBooks mock
  const qbResult = await QuickbooksService.createInvoice({
    invoiceId: invoice._id.toString(),
    customerId: shipment.customerId,
    total,
    subtotal,
    tax,
    billingType,
  });

  // Generate receipt upload link
  const receiptUploadLink = `${BASE_URL}/invoice/${invoice._id.toString()}/upload-receipt`;
  console.log(`[InvoiceService] Receipt upload link: ${receiptUploadLink}`);
  console.log(`[InvoiceService] Simulating sending receipt upload link to customer ${shipment.customerId}`);

  // Update invoice with QuickBooks ID, receipt link, and SENT status
  const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
    invoice._id,
    {
      quickbooksInvoiceId: qbResult.quickbooksInvoiceId,
      receiptUploadLink,
      status: 'SENT',
    },
    { new: true }
  );

  // Update shipment status to INVOICE_SENT
  await ShipmentModel.findByIdAndUpdate(shipmentId, { status: 'INVOICE_SENT' });

  return updatedInvoice;
}

export async function onShipmentStatusUpdate(shipmentId: string, newStatus: ShipmentStatus) {
  await connectDB();

  await ShipmentModel.findByIdAndUpdate(shipmentId, { status: newStatus });

  if (newStatus === 'DELIVERED') {
    await createInvoiceFromShipment(shipmentId);
  }
}
