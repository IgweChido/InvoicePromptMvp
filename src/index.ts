import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import invoiceRoutes from './routes/invoiceRoutes';
import shipmentRoutes from './routes/shipmentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoicepromptmvp';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/invoice', invoiceRoutes);
app.use('/shipment', shipmentRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Connected to database');
    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[MongoDB] Connection error:', err);
    process.exit(1);
  });

export default app;
