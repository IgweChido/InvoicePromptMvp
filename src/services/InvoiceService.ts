import Shipment, { ShipmentStatus } from '../models/Shipment';
import Booking from '../models/Booking';
import Quote from '../models/Quote';
import ContractAgreement from '../models/ContractAgreement';
import Invoice from '../models/Invoice';
import PaymentReceipt from '../models/PaymentReceipt';
import { QuickbooksService } from '../integrations/QuickbooksService';
import { sendReceiptUploadNotification } from '../utils/notifications';

export async function onShipmentStatusUpdate(shipmentId: string, newStatus: ShipmentStatus): Promise<void> {
  const shipment = await Shipment.findByIdAndUpdate(
    shipmentId,
    { status: newStatus },
    { new: true }
  );

  if (!shipment) {
    throw new Error(`Shipment not found: ${shipmentId}`);
  }

  if (newStatus === 'DELIVERED') {
    await createInvoiceFromShipment(shipmentId);
  }
}

export async function createInvoiceFromShipment(shipmentId: string): Promise<InstanceType<typeof Invoice>> {
  // Fetch shipment
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) {
    throw new Error(`Shipment not found: ${shipmentId}`);
  }

  // Fetch booking
  const booking = await Booking.findOne({ shipmentId: shipment._id });
  if (!booking) {
    throw new Error(`Booking not found for shipment: ${shipmentId}`);
  }

  // Fetch quote
  const quote = await Quote.findOne({ bookingId: booking._id });
  if (!quote) {
    throw new Error(`Quote not found for booking: ${booking._id}`);
  }

  // Fetch contract agreement
  const contract = await ContractAgreement.findOne({ customerId: shipment.customerId });
  if (!contract) {
    throw new Error(`ContractAgreement not found for customer: ${shipment.customerId}`);
  }

  // Calculate costs
  const baseAmount = quote.baseRate + quote.fuelSurcharge + quote.handlingFee;
  let subtotal = baseAmount;
  let splitRatio: { platform: number; partner: number } | undefined;

  if (contract.billingType === 'CONTRACT_SPLIT' && contract.splitRatio) {
    // Apply split ratio (e.g., platform gets 80%, partner gets 20%)
    subtotal = baseAmount * (contract.splitRatio.platform / 100);
    splitRatio = contract.splitRatio;
  }

  const tax = subtotal * quote.taxRate;
  const total = subtotal + tax;

  // Create invoice record
  const invoice = await Invoice.create({
    shipmentId: shipment._id,
    customerId: shipment.customerId,
    billingType: contract.billingType,
    splitRatio,
    subtotal,
    tax,
    total,
    status: 'PENDING',
  });

  // Call QuickBooks mock
  const qbResult = await QuickbooksService.createInvoice({
    customerId: shipment.customerId,
    invoiceId: (invoice._id as unknown as string).toString(),
    subtotal,
    tax,
    total,
    billingType: contract.billingType,
  });

  // Update invoice with QuickBooks ID and set status to SENT
  invoice.quickbooksInvoiceId = qbResult.quickbooksInvoiceId;
  invoice.status = 'SENT';
  await invoice.save();

  // Update shipment status to INVOICE_SENT
  await Shipment.findByIdAndUpdate(shipmentId, { status: 'INVOICE_SENT' });

  // Notify customer with receipt upload link
  sendReceiptUploadNotification((invoice._id as unknown as string).toString(), shipment.customerId);

  console.log(`[InvoiceService] Invoice ${invoice._id} created and sent for shipment ${shipmentId}`);

  return invoice;
}

export async function uploadReceipt(
  invoiceId: string,
  fileUrl: string
): Promise<InstanceType<typeof Invoice>> {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new Error(`Invoice not found: ${invoiceId}`);
  }

  if (invoice.status !== 'SENT') {
    throw new Error(`Invoice must be in SENT status to upload receipt. Current status: ${invoice.status}`);
  }

  // Create PaymentReceipt record
  await PaymentReceipt.create({
    invoiceId: invoice._id,
    fileUrl,
    uploadedAt: new Date(),
  });

  // Update invoice status to PAID
  invoice.status = 'PAID';
  invoice.receiptUrl = fileUrl;
  await invoice.save();

  console.log(`[InvoiceService] Receipt uploaded for invoice ${invoiceId}. Status: PAID`);

  return invoice;
}

export async function verifyInvoice(invoiceId: string): Promise<InstanceType<typeof Invoice>> {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new Error(`Invoice not found: ${invoiceId}`);
  }

  if (invoice.status !== 'PAID') {
    throw new Error(`Invoice must be in PAID status to verify. Current status: ${invoice.status}`);
  }

  // Update invoice status to VERIFIED
  invoice.status = 'VERIFIED';
  await invoice.save();

  // Update shipment status to INVOICE_SETTLED
  await Shipment.findByIdAndUpdate(invoice.shipmentId, { status: 'INVOICE_SETTLED' });

  console.log(`[InvoiceService] Invoice ${invoiceId} verified. Shipment ${invoice.shipmentId} marked as INVOICE_SETTLED`);

  return invoice;
}
