const express = require('express');
const { searchAll } = require('../controllers/searchController');

const router = express.Router();

// Search across all content types
router.route('/').get(searchAll);

module.exports = router;