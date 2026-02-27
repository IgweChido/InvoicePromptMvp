import { Router } from 'express';
import { updateShipmentStatus } from '../controllers/invoiceController';

const router = Router();

router.patch('/:shipmentId/status', updateShipmentStatus);

export default router;
