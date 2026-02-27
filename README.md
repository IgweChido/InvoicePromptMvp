# InvoicePrompt MVP

A Node.js + TypeScript + Express + MongoDB backend for invoice automation.

## Overview

When a shipment status changes to `DELIVERED`, this system automatically:
1. Derives invoice data from Booking, Quote, and ContractAgreement
2. Applies billing logic (CREDIT or CONTRACT_SPLIT)
3. Sends the invoice to QuickBooks (mocked)
4. Notifies the customer to upload a payment receipt
5. Allows admin to verify the receipt and mark the shipment as `INVOICE_SETTLED`

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
```

## Running

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Shipment

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/shipment/:shipmentId/status` | Update shipment status (triggers invoice creation when set to `DELIVERED`) |

**Body:** `{ "status": "DELIVERED" }`

### Invoice

| Method | Path | Description |
|--------|------|-------------|
| POST | `/invoice/:id/upload-receipt` | Customer uploads payment receipt (multipart/form-data, field: `receipt`) |
| POST | `/invoice/:id/verify` | Admin verifies payment and marks shipment as `INVOICE_SETTLED` |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |

## Invoice Workflow

```
Shipment DELIVERED
  → Invoice created (PENDING)
  → Sent to QuickBooks mock (SENT)
  → Shipment status → INVOICE_SENT
  → Customer notified with receipt upload link
  → Customer uploads receipt (PAID)
  → Admin verifies (VERIFIED)
  → Shipment status → INVOICE_SETTLED
```

## Billing Types

- **CREDIT**: Full subtotal billed to the customer
- **CONTRACT_SPLIT**: Subtotal split by platform/partner ratio (e.g., 80/20)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/invoicepromptmvp` | MongoDB connection string |
| `PORT` | `3000` | Server port |
| `PUBLIC_BASE_URL` | `https://app.yourdomain.com` | Base URL for receipt upload links |
