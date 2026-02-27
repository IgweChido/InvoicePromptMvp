export function sendReceiptUploadNotification(invoiceId: string, customerId: string): void {
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://app.yourdomain.com';
  const uploadLink = `${baseUrl}/invoice/${invoiceId}/upload-receipt`;

  console.log(`[Notification] Sending receipt upload notification to customer: ${customerId}`);
  console.log(`[Notification] [Email] Dear Customer, please upload your payment receipt at: ${uploadLink}`);
  console.log(`[Notification] [WhatsApp] Receipt upload link: ${uploadLink}`);
}
