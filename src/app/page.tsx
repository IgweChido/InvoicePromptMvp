'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Shipment {
  _id: string;
  trackingNumber: string;
  customerId: string;
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
}

interface Invoice {
  _id: string;
  shipmentId: string;
  customerId: string;
  total: number;
  status: string;
  quickbooksInvoiceId?: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(/_/g, '-');
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

export default function Dashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // For creating shipment demo
  const [form, setForm] = useState({ trackingNumber: '', customerId: '', origin: '', destination: '' });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [sRes, iRes] = await Promise.all([
      fetch('/api/shipments'),
      fetch('/api/invoices'),
    ]);
    const sData = await sRes.json();
    const iData = await iRes.json();
    setShipments(sData.shipments || []);
    setInvoices(iData.invoices || []);
    setLoading(false);
  }

  async function createShipment() {
    setCreating(true);
    setMsg('');
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Shipment created!');
        setForm({ trackingNumber: '', customerId: '', origin: '', destination: '' });
        fetchAll();
      } else {
        setMsg(data.error || 'Error creating shipment');
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <nav className="nav">
        <h1>📦 InvoicePrompt MVP</h1>
        <Link href="/">Dashboard</Link>
      </nav>
      <div className="container">
        <h1>Dashboard</h1>

        {/* Create Shipment */}
        <div className="card">
          <h2>Create Shipment</h2>
          {msg && <div className={`alert ${msg.includes('created') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <div className="grid-2">
            <div className="form-group">
              <label>Tracking Number</label>
              <input value={form.trackingNumber} onChange={e => setForm(f => ({...f, trackingNumber: e.target.value}))} placeholder="TRK001" />
            </div>
            <div className="form-group">
              <label>Customer ID</label>
              <input value={form.customerId} onChange={e => setForm(f => ({...f, customerId: e.target.value}))} placeholder="CUST001" />
            </div>
            <div className="form-group">
              <label>Origin</label>
              <input value={form.origin} onChange={e => setForm(f => ({...f, origin: e.target.value}))} placeholder="New York" />
            </div>
            <div className="form-group">
              <label>Destination</label>
              <input value={form.destination} onChange={e => setForm(f => ({...f, destination: e.target.value}))} placeholder="Los Angeles" />
            </div>
          </div>
          <button className="btn btn-primary" onClick={createShipment} disabled={creating}>
            {creating ? 'Creating...' : 'Create Shipment'}
          </button>
        </div>

        {/* Shipments */}
        <div className="card">
          <h2>Shipments</h2>
          {loading ? <p>Loading...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.length === 0 ? (
                  <tr><td colSpan={5} style={{textAlign:'center',padding:'2rem',color:'#666'}}>No shipments yet</td></tr>
                ) : shipments.map(s => (
                  <tr key={s._id}>
                    <td>{s.trackingNumber}</td>
                    <td>{s.customerId}</td>
                    <td>{s.origin} → {s.destination}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td><Link href={`/shipment/${s._id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Invoices */}
        <div className="card">
          <h2>Invoices</h2>
          {loading ? <p>Loading...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>QB Invoice ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={6} style={{textAlign:'center',padding:'2rem',color:'#666'}}>No invoices yet</td></tr>
                ) : invoices.map(inv => (
                  <tr key={inv._id}>
                    <td style={{fontFamily:'monospace', fontSize:'0.85rem'}}>{inv._id.slice(-8)}</td>
                    <td>{inv.customerId}</td>
                    <td>${inv.total.toFixed(2)}</td>
                    <td style={{fontFamily:'monospace', fontSize:'0.85rem'}}>{inv.quickbooksInvoiceId || '-'}</td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td><Link href={`/invoice/${inv._id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
