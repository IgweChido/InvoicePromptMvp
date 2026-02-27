import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, customerName, invoiceLink, trackingNumber } = body;

    if (!to || !invoiceLink) {
      return NextResponse.json({ error: 'Missing required fields: to, invoiceLink' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      console.log('[send-invoice-email] Resend not configured. Invoice link:', invoiceLink);
      return NextResponse.json({
        success: false,
        fallback: true,
        warning: '⚠️ Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL to enable real sending. (Demo: invoice link logged to console.)',
      });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const subject = `Your Invoice for Shipment ${trackingNumber ?? ''} is Ready`;
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:2rem">
        <h2 style="color:#0070f3">Invoice Ready</h2>
        <p>Hi ${customerName ?? 'there'},</p>
        <p>Your invoice for shipment <strong>${trackingNumber ?? ''}</strong> has been created and is ready for payment.</p>
        <p style="margin:1.5rem 0">
          <a href="${invoiceLink}"
             style="background:#0070f3;color:white;padding:0.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:600">
            View &amp; Pay Invoice
          </a>
        </p>
        <p style="color:#888;font-size:0.85rem">If the button above doesn't work, copy and paste this link:<br/>${invoiceLink}</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
