'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Shipment {
  _id: string;
  trackingNumber: string;
  customerId: string;
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(/_/g, '-');
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShipment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchShipment() {
    setLoading(true);
    const res = await fetch(`/api/shipments/${id}`);
    const data = await res.json();
    setShipment(data.shipment || null);
    setLoading(false);
  }

  async function updateStatus(status: string) {
    setUpdating(true);
    setMsg('');
    setError('');
    try {
      const res = await fetch(`/api/shipments/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Status updated to ${status}!${status === 'DELIVERED' ? ' Invoice has been created.' : ''}`);
        fetchShipment();
      } else {
        setError(data.error || 'Error updating status');
      }
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!shipment) return <div className="container"><p>Shipment not found</p></div>;

  const statusFlow = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'INVOICE_SENT', 'INVOICE_SETTLED'];
  const currentIdx = statusFlow.indexOf(shipment.status);
  const nextStatus = currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  return (
    <>
      <nav className="nav">
        <h1>📦 InvoicePrompt MVP</h1>
        <Link href="/">Dashboard</Link>
      </nav>
      <div className="container">
        <h1>Shipment Detail</h1>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <div className="detail-row"><div className="detail-label">Tracking #</div><div className="detail-value">{shipment.trackingNumber}</div></div>
          <div className="detail-row"><div className="detail-label">Customer ID</div><div className="detail-value">{shipment.customerId}</div></div>
          <div className="detail-row"><div className="detail-label">Origin</div><div className="detail-value">{shipment.origin}</div></div>
          <div className="detail-row"><div className="detail-label">Destination</div><div className="detail-value">{shipment.destination}</div></div>
          <div className="detail-row"><div className="detail-label">Status</div><div className="detail-value"><StatusBadge status={shipment.status} /></div></div>
          <div className="detail-row"><div className="detail-label">Created</div><div className="detail-value">{new Date(shipment.createdAt).toLocaleString()}</div></div>
          <div className="detail-row"><div className="detail-label">Updated</div><div className="detail-value">{new Date(shipment.updatedAt).toLocaleString()}</div></div>
        </div>

        {/* Status progression */}
        <div className="card">
          <h2>Update Status</h2>
          <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1rem'}}>
            {statusFlow.map((s, idx) => (
              <span key={s} style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                background: shipment.status === s ? '#0070f3' : idx < currentIdx ? '#28a745' : '#e9ecef',
                color: shipment.status === s || idx < currentIdx ? 'white' : '#666',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>{s}</span>
            ))}
          </div>
          {nextStatus && nextStatus !== 'INVOICE_SENT' && nextStatus !== 'INVOICE_SETTLED' && nextStatus !== 'DELIVERED' && (
            <button
              className="btn btn-primary"
              onClick={() => updateStatus(nextStatus)}
              disabled={updating}
            >
              {updating ? 'Updating...' : `Mark as ${nextStatus}`}
            </button>
          )}
          {nextStatus === 'DELIVERED' && (
            <button
              className="btn btn-success"
              onClick={() => updateStatus('DELIVERED')}
              disabled={updating}
            >
              {updating ? 'Processing...' : '🚀 Mark as DELIVERED (triggers invoice)'}
            </button>
          )}
          {(shipment.status === 'INVOICE_SENT' || shipment.status === 'INVOICE_SETTLED') && (
            <p style={{color:'#666'}}>Invoice workflow in progress. Check the Invoices section.</p>
          )}
        </div>
      </div>
    </>
  );
}
