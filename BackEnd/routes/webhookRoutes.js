const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Webhook endpoints (no authentication required as they come from payment gateways)
// NOTE: In production, verify webhook signatures instead

// bKash webhook
router.post('/bkash', webhookController.bkashWebhook);
router.get('/bkash', webhookController.bkashWebhook); // Some gateways use GET

// Nagad webhook
router.post('/nagad', webhookController.nagadWebhook);
router.get('/nagad', webhookController.nagadWebhook);

// Rocket webhook
router.post('/rocket', webhookController.rocketWebhook);
router.get('/rocket', webhookController.rocketWebhook);

module.exports = router;
