const express = require('express');
const router = express.Router();
const body_parse = require('body-parser');
const geocodeController = require('../controllers/geocode');

router.use(body_parse.json());

router.post('/', geocodeController.get_geocode_by_address);

module.exports = router;