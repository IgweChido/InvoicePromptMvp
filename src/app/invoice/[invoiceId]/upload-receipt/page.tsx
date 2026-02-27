'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';

export default function UploadReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;
  const { state, markReceiptUploaded } = useDemo();

  const isDemo = invoiceId.startsWith('demo-');
  const bookingId = state.booking?._id;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  async function handleUpload() {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setUploading(true);
    setMsg('');
    setError('');

    try {
      if (isDemo) {
        // In-memory upload: read file as data URL and store in demo context
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
        markReceiptUploaded({
          filename: file.name,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        });
        setMsg('Receipt uploaded successfully!');
        redirectTimerRef.current = setTimeout(() => router.push(bookingId ? `/bookings/${bookingId}` : `/invoice/${invoiceId}`), 1500);
      } else {
        // Real upload via API
        const formData = new FormData();
        formData.append('receipt', file);

        const res = await fetch(`/api/invoices/${invoiceId}/upload-receipt`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (res.ok) {
          setMsg(`Receipt uploaded successfully! URL: ${data.receiptUrl}`);
          redirectTimerRef.current = setTimeout(() => router.push(`/invoice/${invoiceId}`), 2000);
        } else {
          setError(data.error || 'Upload failed');
        }
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
        <Link href="/bookings">Bookings</Link>
        <Link href="/quotes">Quotes</Link>
      </nav>
      <div className="container">
        <h1>Upload Payment Receipt</h1>
        {isDemo && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <strong>Demo mode:</strong> Your receipt will be stored in-memory (browser session only) and displayed in Booking Details.
          </div>
        )}
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
