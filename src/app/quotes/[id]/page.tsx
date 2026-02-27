'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';

function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(/[_\s]/g, '-');
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

export default function QuoteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { state } = useDemo();

  const quote = state.quote?._id === id ? state.quote : null;
  const booking = state.booking;

  if (!quote) {
    return (
      <>
        <nav className="nav">
          <h1>📦 InvoicePrompt MVP</h1>
          <Link href="/">Dashboard</Link>
          <Link href="/bookings">Bookings</Link>
          <Link href="/quotes">Quotes</Link>
        </nav>
        <div className="container">
          <p style={{ color: '#666' }}>Quote not found. <Link href="/quotes">Back to Quotes</Link></p>
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
          <Link href="/quotes" style={{ color: '#888', fontSize: '0.9rem' }}>← Quotes</Link>
          <h1 style={{ marginBottom: 0 }}>Quote Details</h1>
        </div>

        <div className="card">
          <h2>Quote Summary</h2>
          <div className="detail-row"><div className="detail-label">Quote ID</div><div className="detail-value" style={{ fontFamily: 'monospace' }}>{quote._id}</div></div>
          <div className="detail-row"><div className="detail-label">Customer</div><div className="detail-value">{quote.customerName}</div></div>
          <div className="detail-row"><div className="detail-label">Customer ID</div><div className="detail-value" style={{ fontFamily: 'monospace' }}>{quote.customerId}</div></div>
          <div className="detail-row"><div className="detail-label">Base Rate</div><div className="detail-value">${quote.baseRate.toFixed(2)}</div></div>
          <div className="detail-row"><div className="detail-label">Adjustments</div><div className="detail-value">${quote.adjustments.toFixed(2)}</div></div>
          <div className="detail-row">
            <div className="detail-label">Total</div>
            <div className="detail-value" style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0070f3' }}>
              ${quote.total.toFixed(2)} {quote.currency}
            </div>
          </div>
          <div className="detail-row"><div className="detail-label">Status</div><div className="detail-value"><StatusBadge status={quote.status} /></div></div>
        </div>

        {booking && (
          <div className="card">
            <h2>Linked Booking</h2>
            <div className="detail-row"><div className="detail-label">Booking ID</div><div className="detail-value" style={{ fontFamily: 'monospace' }}>{booking._id}</div></div>
            <div className="detail-row"><div className="detail-label">Tracking #</div><div className="detail-value" style={{ fontFamily: 'monospace' }}>{booking.trackingNumber}</div></div>
            <div className="detail-row"><div className="detail-label">Route</div><div className="detail-value">{booking.origin} → {booking.destination}</div></div>
            <div className="detail-row"><div className="detail-label">Scheduled</div><div className="detail-value">{booking.scheduledDate}</div></div>
            <div style={{ marginTop: '1rem' }}>
              <Link href={`/bookings/${booking._id}`} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                View Booking →
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
