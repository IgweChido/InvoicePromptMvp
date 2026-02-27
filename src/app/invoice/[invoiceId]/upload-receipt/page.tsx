'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function UploadReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function handleUpload() {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setUploading(true);
    setMsg('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const res = await fetch(`/api/invoices/${invoiceId}/upload-receipt`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMsg(`Receipt uploaded successfully! URL: ${data.receiptUrl}`);
        setTimeout(() => router.push(`/invoice/${invoiceId}`), 2000);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <nav className="nav">
        <h1>📦 InvoicePrompt MVP</h1>
        <Link href="/">Dashboard</Link>
      </nav>
      <div className="container">
        <h1>Upload Payment Receipt</h1>
        <div className="card">
          <p style={{marginBottom:'1.5rem', color:'#555'}}>
            Please upload your payment receipt for Invoice <strong>{invoiceId}</strong>.
          </p>

          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label>Receipt File (image or PDF)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading...' : 'Upload Receipt'}
          </button>
        </div>
      </div>
    </>
  );
}
