# InvoicePrompt MVP

A full-stack Next.js 14 application for automated invoice generation tied to shipment lifecycle events.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **MongoDB + Mongoose** for persistence
- **Next.js Route Handlers** for API (`app/api/`)
- Local file storage under `public/uploads` for payment receipts

## Features

- Create and manage shipments with status tracking
- Automatic invoice generation when a shipment is marked as **DELIVERED**
- Mock QuickBooks integration (logs to console)
- Receipt upload link generation sent to customer (simulated)
- Payment receipt upload via multipart form data
- Admin invoice verification workflow
- Full status lifecycle: `PENDING → IN_TRANSIT → DELIVERED → INVOICE_SENT → INVOICE_SETTLED`

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or set `MONGODB_URI` env var)

### Setup

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local to set MONGODB_URI and PUBLIC_BASE_URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Invoice Workflow

1. Create a shipment via the Dashboard
2. Navigate to shipment detail and advance status to **DELIVERED**
3. Invoice is automatically created and sent to QuickBooks (mock)
4. Customer receives a receipt upload link (logged to console)
5. Customer uploads their payment receipt
6. Admin verifies the receipt → invoice becomes **VERIFIED**, shipment becomes **INVOICE_SETTLED**

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── shipments/          # Shipment API routes
│   │   └── invoices/           # Invoice API routes
│   ├── shipment/[id]/          # Shipment detail page
│   ├── invoice/[invoiceId]/    # Invoice detail, upload, verify pages
│   ├── layout.tsx
│   ├── page.tsx                # Dashboard
│   └── globals.css
├── lib/
│   └── mongodb.ts              # DB connection helper
├── models/                     # Mongoose models
│   ├── Shipment.ts
│   ├── Booking.ts
│   ├── Quote.ts
│   ├── ContractAgreement.ts
│   ├── Invoice.ts
│   └── PaymentReceipt.ts
└── services/
    ├── invoiceService.ts       # Invoice creation logic
    └── QuickbooksService.ts    # Mock QuickBooks integration
```
