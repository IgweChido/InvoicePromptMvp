'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';

function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(/[_\s]/g, '-');
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

export default function BookingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { state } = useDemo();

  const booking = state.booking?._id === id ? state.booking : null;
  const quote = state.quote;
  const invoice = state.invoice;
  const receipt = state.receipt;

  if (!booking) {
    return (
      <>
        <nav className="nav">
          <h1>📦 InvoicePrompt MVP</h1>
          <Link href="/">Dashboard</Link>
          <Link href="/bookings">Bookings</Link>
          <Link href="/quotes">Quotes</Link>
        </nav>
        <div className="container">
          <p style={{ color: '#666' }}>Booking not found. <Link href="/bookings">Back to Bookings</Link></p>
        </div>
      </>
    );
  }

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
          <Link href="/bookings" style={{ color: '#888', fontSize: '0.9rem' }}>← Bookings</Link>
          <h1 style={{ marginBottom: 0 }}>Booking Details</h1>
        </div>

        {/* Booking info */}
        <div className="card">
          <h2>Shipment Info</h2>
          <div className="detail-row"><div className="detail-label">Tracking #</div><div className="detail-value" style={{ fontFamily: 'monospace' }}>{booking.trackingNumber}</div></div>
          <div className="detail-row"><div className="detail-label">Customer</div><div className="detail-value">{booking.customerName}</div></div>
          <div className="detail-row"><div className="detail-label">Email</div><div className="detail-value">{booking.customerEmail}</div></div>
          <div className="detail-row"><div className="detail-label">Phone</div><div className="detail-value">{booking.customerPhone}</div></div>
          <div className="detail-row"><div className="detail-label">Origin</div><div className="detail-value">{booking.origin}</div></div>
          <div className="detail-row"><div className="detail-label">Destination</div><div className="detail-value">{booking.destination}</div></div>
          <div className="detail-row"><div className="detail-label">Scheduled Date</div><div className="detail-value">{booking.scheduledDate}</div></div>
          <div className="detail-row"><div className="detail-label">Status</div><div className="detail-value"><StatusBadge status={booking.status} /></div></div>
        </div>

        {/* Linked Quote */}
        {quote && (
          <div className="card">
            <h2>Linked Quote</h2>
            <div className="detail-row"><div className="detail-label">Quote ID</div><div className="detail-value" style={{ fontFamily: 'monospace' }}>{quote._id}</div></div>
            <div className="detail-row"><div className="detail-label">Base Rate</div><div className="detail-value">${quote.baseRate.toFixed(2)}</div></div>
            <div className="detail-row"><div className="detail-label">Adjustments</div><div className="detail-value">${quote.adjustments.toFixed(2)}</div></div>
            <div className="detail-row"><div className="detail-label">Total</div><div className="detail-value" style={{ fontWeight: 700 }}>${quote.total.toFixed(2)} {quote.currency}</div></div>
            <div className="detail-row"><div className="detail-label">Status</div><div className="detail-value"><StatusBadge status={quote.status} /></div></div>
            <div style={{ marginTop: '1rem' }}>
              <Link href={`/quotes/${quote._id}`} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                View Quote →
              </Link>
            </div>
          </div>
        )}

        {/* Linked Invoice */}
        {invoice && (
          <div className="card">
            <h2>Invoice</h2>
            <div className="detail-row"><div className="detail-label">Invoice ID</div><div className="detail-value" style={{ fontFamily: 'monospace' }}>{invoice._id}</div></div>
            <div className="detail-row"><div className="detail-label">QB Invoice ID</div><div className="detail-value" style={{ fontFamily: 'monospace' }}>{invoice.quickbooksInvoiceId}</div></div>
            <div className="detail-row"><div className="detail-label">Subtotal</div><div className="detail-value">${invoice.subtotal.toFixed(2)}</div></div>
            <div className="detail-row"><div className="detail-label">Tax (10%)</div><div className="detail-value">${invoice.tax.toFixed(2)}</div></div>
            <div className="detail-row"><div className="detail-label">Total</div><div className="detail-value" style={{ fontWeight: 700, fontSize: '1.1rem' }}>${invoice.total.toFixed(2)}</div></div>
            <div className="detail-row"><div className="detail-label">Status</div><div className="detail-value"><StatusBadge status={invoice.status} /></div></div>
            <div style={{ marginTop: '1rem' }}>
              <Link href={`/invoice/${invoice._id}`} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                View Invoice →
              </Link>
            </div>
          </div>
        )}

        {/* Receipt section */}
        {receipt ? (
          <div className="card">
            <h2>📎 Payment Receipt</h2>
            <p style={{ color: '#555', marginBottom: '1rem' }}>
              Uploaded on {new Date(receipt.uploadedAt).toLocaleString()} — <strong>{receipt.filename}</strong>
            </p>
            {receipt.dataUrl.startsWith('data:image') ? (
              <img
                src={receipt.dataUrl}
                alt="Payment receipt"
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            ) : (
              <a href={receipt.dataUrl} download={receipt.filename} className="btn btn-secondary">
                Download Receipt
              </a>
            )}
          </div>
        ) : state.flowStep >= 4 && invoice ? (
          <div className="card" style={{ borderLeft: '4px solid #0070f3' }}>
            <h2>⏳ Awaiting Receipt</h2>
            <p style={{ color: '#555', marginBottom: '1rem' }}>
              Invoice has been sent to the customer. Waiting for payment receipt upload.
            </p>
            <Link href={`/invoice/${invoice._id}/upload-receipt`} className="btn btn-primary">
              Simulate Customer Upload →
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
