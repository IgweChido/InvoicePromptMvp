import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { uploadReceipt, verifyInvoice } from '../controllers/invoiceController';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/:id/upload-receipt', upload.single('receipt'), uploadReceipt);
router.post('/:id/verify', verifyLimiter, verifyInvoice);

export default router;
