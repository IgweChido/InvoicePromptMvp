export interface QuickbooksInvoicePayload {
  customerId: string;
  invoiceId: string;
  subtotal: number;
  tax: number;
  total: number;
  billingType: string;
}

export interface QuickbooksInvoiceResult {
  quickbooksInvoiceId: string;
  status: string;
}

export class QuickbooksService {
  static async createInvoice(payload: QuickbooksInvoicePayload): Promise<QuickbooksInvoiceResult> {
    // Mock QuickBooks API call
    console.log('[QuickBooks] Creating invoice for payload:', payload);

    // Simulate async API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const quickbooksInvoiceId = `QB-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    console.log(`[QuickBooks] Invoice created successfully. ID: ${quickbooksInvoiceId}`);
    console.log(`[QuickBooks] Invoice email sent to customer: ${payload.customerId}`);

    return {
      quickbooksInvoiceId,
      status: 'SENT',
    };
  }
}
