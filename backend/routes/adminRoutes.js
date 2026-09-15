const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth'); // Add your role-checking middleware

// Apply auth & admin checks to all routes
router.use(verifyToken, verifyAdmin);

router.get('/users', adminController.getAllUsers);
router.post('/draw/simulate', adminController.runDrawSimulation);
router.post('/charities', adminController.addCharity);
router.patch('/winners/payout', adminController.updateWinnerPayoutStatus);
router.get('/reports/analytics', adminController.getAnalytics);

module.exports = router;