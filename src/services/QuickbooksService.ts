export interface QuickbooksInvoicePayload {
  invoiceId: string;
  customerId: string;
  total: number;
  subtotal: number;
  tax: number;
  billingType: string;
}

export interface QuickbooksInvoiceResult {
  quickbooksInvoiceId: string;
  status: string;
}

export const QuickbooksService = {
  async createInvoice(payload: QuickbooksInvoicePayload): Promise<QuickbooksInvoiceResult> {
    // Mock QuickBooks API call
    const quickbooksInvoiceId = `QB-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
    console.log(`[QuickBooks Mock] Creating invoice for customer ${payload.customerId}, total: ${payload.total}`);
    console.log(`[QuickBooks Mock] Invoice ID: ${quickbooksInvoiceId}`);
    // Simulate email sending
    console.log(`[QuickBooks Mock] Simulating email send to customer ${payload.customerId}`);
    return { quickbooksInvoiceId, status: 'sent' };
  },
};
