'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';

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
  const { state } = useDemo();

  const isDemo = invoiceId.startsWith('demo-');

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    if (!isDemo) {
      fetchInvoice();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, isDemo]);

  async function fetchInvoice() {
    setLoading(true);
    const res = await fetch(`/api/invoices/${invoiceId}`);
    const data = await res.json();
    setInvoice(data.invoice || null);
    setLoading(false);
  }

  // Build a unified display object
  const demoInv = isDemo && state.invoice?._id === invoiceId ? state.invoice : null;

  if (!isDemo && loading) return <div className="container"><p>Loading...</p></div>;
  if (!isDemo && !invoice) return <div className="container"><p>Invoice not found</p></div>;
  if (isDemo && !demoInv) return <div className="container"><p>Demo invoice not found. <Link href="/bookings">Start a demo</Link> first.</p></div>;

  const inv = isDemo ? demoInv! : invoice!;
  const receipt = isDemo ? state.receipt : null;
  const bookingId = isDemo ? state.booking?._id : undefined;

  return (
    <>
      <nav className="nav">
        <h1>📦 InvoicePrompt MVP</h1>
        <Link href="/">Dashboard</Link>
        <Link href="/bookings">Bookings</Link>
        <Link href="/quotes">Quotes</Link>
      </nav>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          {bookingId && (
            <Link href={`/bookings/${bookingId}`} style={{ color: '#888', fontSize: '0.9rem' }}>← Booking</Link>
          )}
          <h1 style={{ marginBottom: 0 }}>Invoice Detail</h1>
        </div>

        <div className="card">
          <div className="detail-row"><div className="detail-label">Invoice ID</div><div className="detail-value" style={{fontFamily:'monospace'}}>{inv._id}</div></div>
          <div className="detail-row"><div className="detail-label">Customer</div><div className="detail-value">{isDemo ? (demoInv!.customerName) : inv.customerId}</div></div>
          {!isDemo && (
            <>
              <div className="detail-row"><div className="detail-label">Shipment ID</div><div className="detail-value"><Link href={`/shipment/${inv.shipmentId}`}>{inv.shipmentId}</Link></div></div>
              <div className="detail-row"><div className="detail-label">Billing Type</div><div className="detail-value">{(inv as Invoice).billingType}</div></div>
              {(inv as Invoice).splitRatio && (
                <div className="detail-row"><div className="detail-label">Split Ratio</div><div className="detail-value">Platform: {(inv as Invoice).splitRatio!.platform}% / Partner: {(inv as Invoice).splitRatio!.partner}%</div></div>
              )}
            </>
          )}
          <div className="detail-row"><div className="detail-label">Subtotal</div><div className="detail-value">${inv.subtotal.toFixed(2)}</div></div>
          <div className="detail-row"><div className="detail-label">Tax (10%)</div><div className="detail-value">${inv.tax.toFixed(2)}</div></div>
          <div className="detail-row"><div className="detail-label">Total</div><div className="detail-value" style={{fontWeight:'700', fontSize:'1.1rem'}}>${inv.total.toFixed(2)}</div></div>
          <div className="detail-row"><div className="detail-label">QuickBooks ID</div><div className="detail-value" style={{fontFamily:'monospace'}}>{inv.quickbooksInvoiceId || 'Not assigned yet'}</div></div>
          <div className="detail-row"><div className="detail-label">Status</div><div className="detail-value"><StatusBadge status={inv.status} /></div></div>
          {!isDemo && (inv as Invoice).createdAt && (
            <div className="detail-row"><div className="detail-label">Created</div><div className="detail-value">{new Date((inv as Invoice).createdAt).toLocaleString()}</div></div>
          )}
        </div>

        {/* Demo: receipt upload CTA */}
        {isDemo && !receipt && (
          <div className="card" style={{ borderLeft: '4px solid #0070f3' }}>
            <h2>Upload Payment Receipt</h2>
            <p style={{ color: '#555', marginBottom: '1rem' }}>
              As the customer, upload your payment receipt using the link below.
            </p>
            <Link href={`/invoice/${inv._id}/upload-receipt`} className="btn btn-primary">
              Upload Receipt →
            </Link>
          </div>
        )}

        {/* Demo: receipt already uploaded */}
        {isDemo && receipt && (
          <div className="card">
            <h2>📎 Payment Receipt Uploaded</h2>
            <p style={{ color: '#555', marginBottom: '0.75rem' }}>
              Uploaded: <strong>{receipt.filename}</strong> on {new Date(receipt.uploadedAt).toLocaleString()}
            </p>
            {receipt.dataUrl.startsWith('data:image') ? (
              <img src={receipt.dataUrl} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #ddd' }} />
            ) : (
              <a href={receipt.dataUrl} download={receipt.filename} className="btn btn-secondary">Download Receipt</a>
            )}
            {bookingId && (
              <div style={{ marginTop: '1rem' }}>
                <Link href={`/bookings/${bookingId}`} className="btn btn-success">View in Booking Details →</Link>
              </div>
            )}
          </div>
        )}

        {/* Non-demo: receipt upload link */}
        {!isDemo && (inv as Invoice).receiptUploadLink && inv.status === 'SENT' && (
          <div className="card">
            <h2>Receipt Upload Link</h2>
            <div className="alert alert-info">
              <strong>Share this link with the customer to upload payment receipt:</strong><br />
              <a href={(inv as Invoice).receiptUploadLink} target="_blank" rel="noopener noreferrer">{(inv as Invoice).receiptUploadLink}</a>
            </div>
            <Link href={`/invoice/${inv._id}/upload-receipt`} className="btn btn-primary">
              Upload Receipt (Customer View)
            </Link>
          </div>
        )}

        {/* Non-demo: receipt info if paid */}
        {!isDemo && (inv as Invoice).receiptUrl && (
          <div className="card">
            <h2>Payment Receipt</h2>
            <p><strong>Receipt URL:</strong> <a href={(inv as Invoice).receiptUrl} target="_blank" rel="noopener noreferrer">{(inv as Invoice).receiptUrl}</a></p>
            {inv.status === 'PAID' && (
              <div style={{marginTop:'1rem'}}>
                <Link href={`/invoice/${inv._id}/verify`} className="btn btn-success">
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
