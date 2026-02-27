'use client';

import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';

function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(/[_\s]/g, '-');
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

export default function QuotesPage() {
  const { state } = useDemo();

  return (
    <>
      <nav className="nav">
        <h1>📦 InvoicePrompt MVP</h1>
        <Link href="/">Dashboard</Link>
        <Link href="/bookings">Bookings</Link>
        <Link href="/quotes" style={{ fontWeight: 600 }}>Quotes</Link>
      </nav>

      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: 0 }}>Quotes</h1>
        </div>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Quote ID</th>
                <th>Customer</th>
                <th>Base Rate</th>
                <th>Total</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!state.started || !state.quote ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                    No quotes yet. <Link href="/bookings">Start a demo</Link> on the Bookings page.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td>1</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{state.quote._id}</td>
                  <td>{state.quote.customerName}</td>
                  <td>${state.quote.baseRate.toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>${state.quote.total.toFixed(2)}</td>
                  <td>{state.quote.currency}</td>
                  <td><StatusBadge status={state.quote.status} /></td>
                  <td><Link href={`/quotes/${state.quote._id}`}>View</Link></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
