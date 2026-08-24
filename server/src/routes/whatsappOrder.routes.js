const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/whatsappOrder.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All routes require Admin authentication
router.use(protect, adminOnly);

// Customer lookup & addresses
router.get('/customers/search', ctrl.searchWhatsAppCustomer);
router.get('/customers/:phone/stats', ctrl.getCustomerWhatsAppStats);
router.post('/customers/:customerId/addresses', ctrl.addCustomerAddress);
router.put('/customers/:customerId/addresses/:addressId', ctrl.updateCustomerAddress);
router.delete('/customers/:customerId/addresses/:addressId', ctrl.deleteCustomerAddress);

// WhatsApp Orders CRUD
router.get('/orders', ctrl.getWhatsAppOrders);
router.post('/orders', ctrl.createWhatsAppOrder);
router.get('/orders/:id', ctrl.getWhatsAppOrderById);
router.put('/orders/:id', ctrl.updateWhatsAppOrder);
router.get('/orders/:id/invoice', ctrl.getWhatsAppOrderInvoice);
router.patch('/orders/:id/status', ctrl.updateWhatsAppOrderStatus);
router.delete('/orders/:id', ctrl.deleteWhatsAppOrder);

module.exports = router;
