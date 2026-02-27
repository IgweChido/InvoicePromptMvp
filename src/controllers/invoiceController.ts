import { Request, Response } from 'express';
import * as InvoiceService from '../services/InvoiceService';
import { onShipmentStatusUpdate } from '../services/InvoiceService';
import { ShipmentStatus } from '../models/Shipment';

export const updateShipmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const shipmentId = req.params['shipmentId'] as string;
    const { status } = req.body as { status: ShipmentStatus };

    if (!status) {
      res.status(400).json({ error: 'status is required' });
      return;
    }

    await onShipmentStatusUpdate(shipmentId, status);
    res.json({ message: `Shipment ${shipmentId} status updated to ${status}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
};

export const uploadReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const invoiceId = id as string;

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const invoice = await InvoiceService.uploadReceipt(invoiceId, fileUrl);

    res.json({ message: 'Receipt uploaded successfully', invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
};

export const verifyInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const invoiceId = id as string;
    const invoice = await InvoiceService.verifyInvoice(invoiceId);
    res.json({ message: 'Invoice verified successfully', invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
};
