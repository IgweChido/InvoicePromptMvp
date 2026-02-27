# InvoicePrompt MVP

A full-stack Next.js application for automated invoice generation tied to shipment lifecycle events, with a guided end-to-end demo flow.

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **MongoDB + Mongoose** for persistence
- **Next.js Route Handlers** for API (`app/api/`)
- **Resend** (optional) for transactional email in demo flow
- Local file storage under `public/uploads` for payment receipts
- In-memory / `sessionStorage` for demo receipt uploads

## Features

- Create and manage shipments with status tracking
- Automatic invoice generation when a shipment is marked as **DELIVERED**
- Mock QuickBooks integration (logs to console)
- **Demo flow**: seed bookings, quotes and invoices without a database
- Sailing-event simulation → QuickBooks notification → WhatsApp or Email send
- In-memory receipt upload (no DB required for demo)
- Receipt visible on Booking Details page after upload
- Admin invoice verification workflow
- Full status lifecycle: `PENDING → IN_TRANSIT → DELIVERED → INVOICE_SENT → INVOICE_SETTLED`

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or set `MONGODB_URI` env var) — **not required for the demo flow**

### Setup

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local to set MONGODB_URI, PUBLIC_BASE_URL, and optionally Resend keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | For real data | MongoDB connection string |
| `PUBLIC_BASE_URL` | For real data | Base URL for receipt upload links (server-side) |
| `NEXT_PUBLIC_APP_URL` | For demo | Base URL used to generate invoice links in demo flow |
| `RESEND_API_KEY` | Optional | Resend API key for email sending. Get one free at [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | Optional | Sender email address verified in Resend |

> If `RESEND_API_KEY` or `RESEND_FROM_EMAIL` are not set, the email option in the demo will display a warning and skip actual sending.

## Demo Flow

1. Navigate to **[/bookings](http://localhost:3000/bookings)**
2. Click **🚀 Start a demo** to seed demo shipment, quote, and invoice
3. A **Sailing 🚢** toast appears (auto-dismisses)
4. A **QuickBooks** confirmation modal appears — click Continue
5. A **channel picker** appears — choose **WhatsApp** or **Email**:
   - WhatsApp: opens `wa.me` deep link with prefilled invoice message
   - Email: sends invoice link via Resend (shows warning if unconfigured)
6. Click **Simulate Customer Upload →** to open the receipt upload page
7. Upload a receipt image — it is stored in browser `sessionStorage`
8. Booking Details shows the receipt thumbnail/download link

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/shipments` | List all shipments |
| POST | `/api/shipments` | Create a shipment |
| GET | `/api/shipments/:id` | Get shipment by ID |
| POST | `/api/shipments/:id/status` | Update shipment status |
| GET | `/api/invoices` | List all invoices |
| GET | `/api/invoices/:id` | Get invoice by ID |
| POST | `/api/invoices/:id/upload-receipt` | Upload payment receipt |
| POST | `/api/invoices/:id/verify` | Verify invoice (admin) |
| POST | `/api/send-invoice-email` | Send invoice link via Resend |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── shipments/          # Shipment API routes
│   │   ├── invoices/           # Invoice API routes
│   │   └── send-invoice-email/ # Resend email route
│   ├── bookings/               # Bookings list + detail pages (demo flow entry)
│   ├── quotes/                 # Quotes list + detail pages
│   ├── shipment/[id]/          # Shipment detail page
│   ├── invoice/[invoiceId]/    # Invoice detail, upload, verify pages
│   ├── layout.tsx
│   ├── page.tsx                # Dashboard
│   └── globals.css
├── components/
│   └── Providers.tsx           # Client-side context provider wrapper
├── context/
│   └── DemoContext.tsx         # Demo state machine (sessionStorage-backed)
├── lib/
│   └── mongodb.ts              # DB connection helper
├── models/                     # Mongoose models
└── services/
    ├── invoiceService.ts       # Invoice creation logic
    └── QuickbooksService.ts    # Mock QuickBooks integration
```

