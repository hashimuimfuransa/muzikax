import express from 'express';
import { updateWhatsAppContact, getWhatsAppContact } from '../controllers/whatsappController';
import { protect } from '../utils/jwt';

const router = express.Router();

// All routes protected
router.use(protect);

// PUT /api/whatsapp/contact - Update WhatsApp contact
router.route('/contact').put(updateWhatsAppContact);

// GET /api/whatsapp/contact - Get WhatsApp contact
router.route('/contact').get(getWhatsAppContact);

export default router;