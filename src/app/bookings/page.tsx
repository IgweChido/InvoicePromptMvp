'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDemo } from '@/context/DemoContext';

const APP_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function BookingsPage() {
  const { state, startDemo, advanceFlow, setChannel, resetDemo } = useDemo();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

  // Auto-advance from sailing toast (step 1) to QB modal (step 2) after 2.5 s
  useEffect(() => {
    if (state.flowStep === 1) {
      const t = setTimeout(() => advanceFlow(), 2500);
      return () => clearTimeout(t);
    }
  }, [state.flowStep, advanceFlow]);

  const invoiceLink = `${APP_URL}/invoice/${state.invoice?._id ?? 'demo-invoice-001'}`;

  async function handleEmailSend() {
    setSendingEmail(true);
    setEmailMsg('');
    try {
      const res = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: state.booking?.customerEmail ?? 'customer@example.com',
          customerName: state.booking?.customerName ?? 'Customer',
          invoiceLink,
          trackingNumber: state.booking?.trackingNumber ?? 'DEMO',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailMsg(data.warning || 'Email sent successfully!');
      } else {
        setEmailMsg(data.error || 'Failed to send email');
        setSendingEmail(false);
        return;
      }
    } catch {
      setEmailMsg('Failed to send email');
      setSendingEmail(false);
      return;
    }
    setSendingEmail(false);
    setChannel('email');
  }

  function handleWhatsApp() {
    const phone = state.booking?.customerPhone?.replace(/\D/g, '') ?? '14155552671';
    const msg = encodeURIComponent(
      `Hi ${state.booking?.customerName ?? 'there'}! Your invoice for shipment ${state.booking?.trackingNumber ?? ''} is ready. Please view and pay at: ${invoiceLink}`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
    setChannel('whatsapp');
  }

  return (
    <>
      <nav className="nav">
        <h1>📦 InvoicePrompt MVP</h1>
        <Link href="/">Dashboard</Link>
        <Link href="/bookings" style={{ fontWeight: 600 }}>Bookings</Link>
        <Link href="/quotes">Quotes</Link>
      </nav>

      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: 0 }}>Bookings</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {state.started && (
              <button className="btn btn-secondary" onClick={resetDemo} style={{ fontSize: '0.85rem' }}>
                Reset Demo
              </button>
            )}
            {!state.started && (
              <button className="btn btn-demo" onClick={startDemo}>
                🚀 Start a demo
              </button>
            )}
          </div>
        </div>

        {/* Demo status banner */}
        {state.started && state.flowStep >= 4 && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {state.flowStep === 5
                ? '✅ Demo complete! Receipt uploaded and visible in Booking Details.'
                : `✅ Invoice sent via ${state.invoiceSendChannel === 'whatsapp' ? 'WhatsApp' : 'Email'}. Awaiting customer receipt upload.`}
            </span>
            {state.flowStep === 4 && state.invoice && (
              <Link href={`/invoice/${state.invoice._id}/upload-receipt`} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                Simulate Customer Upload →
              </Link>
            )}
          </div>
        )}

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Tracking #</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!state.started || !state.booking ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                    No bookings yet. Click <strong>Start a demo</strong> to seed demo data.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td>1</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{state.booking.trackingNumber}</td>
                  <td>{state.booking.customerName}</td>
                  <td>{state.booking.origin} → {state.booking.destination}</td>
                  <td>{state.booking.scheduledDate}</td>
                  <td><span className="badge badge-confirmed">{state.booking.status}</span></td>
                  <td><Link href={`/bookings/${state.booking._id}`}>View</Link></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DEMO FLOW OVERLAYS ───────────────────────────── */}

      {/* Step 1: Sailing toast */}
      {state.flowStep === 1 && (
        <div className="demo-toast">
          🚢 <strong>Shipment status changed to Sailing!</strong>
        </div>
      )}

      {/* Step 2: QuickBooks notification modal */}
      {state.flowStep === 2 && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ marginBottom: '0.75rem' }}>Sent to QuickBooks</h2>
            <p style={{ color: '#555', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Shipment <strong>{state.booking?.trackingNumber}</strong> is now sailing.<br />
              Invoice <strong>{state.invoice?.quickbooksInvoiceId}</strong> has been created and synced to QuickBooks.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={advanceFlow}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Channel picker modal */}
      {state.flowStep === 3 && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Send Invoice to Customer</h2>
            <p style={{ color: '#555', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Choose how to send the invoice link to <strong>{state.booking?.customerName}</strong>:
            </p>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.25rem', wordBreak: 'break-all' }}>
              {invoiceLink}
            </p>
            {emailMsg && (
              <div className={`alert ${emailMsg.includes('sent') || emailMsg.includes('warning') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                {emailMsg}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
                💬 WhatsApp
              </button>
              <button className="btn btn-primary" onClick={handleEmailSend} disabled={sendingEmail}>
                {sendingEmail ? 'Sending…' : '✉️ Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
