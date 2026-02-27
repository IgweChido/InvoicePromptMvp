'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Invoice {
  _id: string;
  shipmentId: string;
  customerId: string;
  billingType: string;
  splitRatio?: { platform: number; partner: number };
  subtotal: number;
  tax: number;
  total: number;
  quickbooksInvoiceId?: string;
  status: string;
  receiptUrl?: string;
  receiptUploadLink?: string;
  createdAt: string;
  updatedAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(/_/g, '-');
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  async function fetchInvoice() {
    setLoading(true);
    const res = await fetch(`/api/invoices/${invoiceId}`);
    const data = await res.json();
    setInvoice(data.invoice || null);
    setLoading(false);
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!invoice) return <div className="container"><p>Invoice not found</p></div>;

  return (
    <>
      <nav className="nav">
        <h1>📦 InvoicePrompt MVP</h1>
        <Link href="/">Dashboard</Link>
      </nav>
      <div className="container">
        <h1>Invoice Detail</h1>

        <div className="card">
          <div className="detail-row"><div className="detail-label">Invoice ID</div><div className="detail-value" style={{fontFamily:'monospace'}}>{invoice._id}</div></div>
          <div className="detail-row"><div className="detail-label">Shipment ID</div><div className="detail-value"><Link href={`/shipment/${invoice.shipmentId}`}>{invoice.shipmentId}</Link></div></div>
          <div className="detail-row"><div className="detail-label">Customer ID</div><div className="detail-value">{invoice.customerId}</div></div>
          <div className="detail-row"><div className="detail-label">Billing Type</div><div className="detail-value">{invoice.billingType}</div></div>
          {invoice.splitRatio && (
            <div className="detail-row"><div className="detail-label">Split Ratio</div><div className="detail-value">Platform: {invoice.splitRatio.platform}% / Partner: {invoice.splitRatio.partner}%</div></div>
          )}
          <div className="detail-row"><div className="detail-label">Subtotal</div><div className="detail-value">${invoice.subtotal.toFixed(2)}</div></div>
          <div className="detail-row"><div className="detail-label">Tax (10%)</div><div className="detail-value">${invoice.tax.toFixed(2)}</div></div>
          <div className="detail-row"><div className="detail-label">Total</div><div className="detail-value" style={{fontWeight:'700', fontSize:'1.1rem'}}>${invoice.total.toFixed(2)}</div></div>
          <div className="detail-row"><div className="detail-label">QuickBooks ID</div><div className="detail-value" style={{fontFamily:'monospace'}}>{invoice.quickbooksInvoiceId || 'Not assigned yet'}</div></div>
          <div className="detail-row"><div className="detail-label">Status</div><div className="detail-value"><StatusBadge status={invoice.status} /></div></div>
          <div className="detail-row"><div className="detail-label">Created</div><div className="detail-value">{new Date(invoice.createdAt).toLocaleString()}</div></div>
        </div>

        {/* Receipt upload link */}
        {invoice.receiptUploadLink && invoice.status === 'SENT' && (
          <div className="card">
            <h2>Receipt Upload Link</h2>
            <div className="alert alert-info">
              <strong>Share this link with the customer to upload payment receipt:</strong><br />
              <a href={invoice.receiptUploadLink} target="_blank" rel="noopener noreferrer">{invoice.receiptUploadLink}</a>
            </div>
            <Link href={`/invoice/${invoice._id}/upload-receipt`} className="btn btn-primary">
              Upload Receipt (Customer View)
            </Link>
          </div>
        )}

        {/* Receipt info if paid */}
        {invoice.receiptUrl && (
          <div className="card">
            <h2>Payment Receipt</h2>
            <p><strong>Receipt URL:</strong> <a href={invoice.receiptUrl} target="_blank" rel="noopener noreferrer">{invoice.receiptUrl}</a></p>
            {invoice.status === 'PAID' && (
              <div style={{marginTop:'1rem'}}>
                <Link href={`/invoice/${invoice._id}/verify`} className="btn btn-success">
                  Go to Admin Verify Page
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
