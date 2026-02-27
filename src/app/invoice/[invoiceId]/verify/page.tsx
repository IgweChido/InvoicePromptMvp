'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Invoice {
  _id: string;
  shipmentId: string;
  customerId: string;
  total: number;
  status: string;
  receiptUrl?: string;
  quickbooksInvoiceId?: string;
}

export default function VerifyInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

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

  async function verifyInvoice() {
    setVerifying(true);
    setMsg('');
    setError('');
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/verify`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMsg('Invoice verified! Shipment marked as INVOICE_SETTLED.');
        fetchInvoice();
        setTimeout(() => router.push(`/invoice/${invoiceId}`), 2000);
      } else {
        setError(data.error || 'Verification failed');
      }
    } finally {
      setVerifying(false);
    }
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
        <h1>Admin: Verify Invoice</h1>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <h2>Invoice Summary</h2>
          <div className="detail-row"><div className="detail-label">Invoice ID</div><div className="detail-value" style={{fontFamily:'monospace'}}>{invoice._id}</div></div>
          <div className="detail-row"><div className="detail-label">Customer</div><div className="detail-value">{invoice.customerId}</div></div>
          <div className="detail-row"><div className="detail-label">Total</div><div className="detail-value" style={{fontWeight:'700'}}>${invoice.total.toFixed(2)}</div></div>
          <div className="detail-row"><div className="detail-label">QB Invoice ID</div><div className="detail-value" style={{fontFamily:'monospace'}}>{invoice.quickbooksInvoiceId || '-'}</div></div>
          <div className="detail-row">
            <div className="detail-label">Status</div>
            <div className="detail-value">
              <span className={`badge badge-${invoice.status.toLowerCase()}`}>{invoice.status}</span>
            </div>
          </div>
          {invoice.receiptUrl && (
            <div className="detail-row">
              <div className="detail-label">Receipt</div>
              <div className="detail-value">
                <a href={invoice.receiptUrl} target="_blank" rel="noopener noreferrer">View Receipt</a>
              </div>
            </div>
          )}
        </div>

        {invoice.status === 'PAID' ? (
          <div className="card">
            <h2>Verify Payment</h2>
            <p style={{marginBottom:'1rem', color:'#555'}}>
              Review the receipt above and click Verify to mark this invoice as VERIFIED and settle the shipment.
            </p>
            <button className="btn btn-success" onClick={verifyInvoice} disabled={verifying}>
              {verifying ? 'Verifying...' : '✅ Verify & Settle Invoice'}
            </button>
          </div>
        ) : invoice.status === 'VERIFIED' ? (
          <div className="alert alert-success">
            This invoice has already been verified. Shipment is INVOICE_SETTLED.
          </div>
        ) : (
          <div className="alert alert-info">
            Invoice is currently <strong>{invoice.status}</strong>. Can only verify when status is PAID.
          </div>
        )}
      </div>
    </>
  );
}
