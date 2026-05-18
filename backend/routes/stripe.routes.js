const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.post('/create-payment-intent', stripeController.createPaymentIntent);
router.post('/cancel-payment-intent', stripeController.cancelPaymentIntent);
router.get('/check-donacion', stripeController.checkDonacion);
router.post('/create-sepa-mandate', stripeController.createSepaMandate);
router.post('/create-subscription', stripeController.createSubscription);
router.post('/confirm-sepa-setup', stripeController.confirmSepaSetup);
router.post('/confirm-subscription-payment', stripeController.confirmSubscriptionPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);
router.get('/config', stripeController.getConfig);
router.get('/donaciones', authenticateToken, stripeController.getDonaciones);
router.post('/donaciones/actualizar', authenticateToken, stripeController.actualizarDonaciones);
router.get('/donaciones/mis-donaciones', authenticateToken, stripeController.getMisDonaciones);
router.post('/crear-suscripcion-real', stripeController.crearSuscripcionReal);
router.post('/marcar-socio-fallido', stripeController.marcarSocioFallido);
router.post('/create-setup-intent', stripeController.createSetupIntent);
router.post('/create-setup-intent-card', stripeController.createSetupIntentCard);
router.post('/payment-intent-sepa', stripeController.createPaymentIntentSEPA);
router.get('/customer-payment-methods', stripeController.getCustomerPaymentMethods);

module.exports = router;