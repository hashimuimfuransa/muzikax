const express = require('express');
const { updateWhatsAppContact, getWhatsAppContact } = require('../controllers/whatsappController');
const { protect } = require('../utils/jwt');

const router = express.Router();

// All routes protected
router.use(protect);

// PUT /api/whatsapp/contact - Update WhatsApp contact
router.route('/contact').put(updateWhatsAppContact);

// GET /api/whatsapp/contact - Get WhatsApp contact
router.route('/contact').get(getWhatsAppContact);

module.exports = router;