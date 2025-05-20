const express = require('express');
const { body } = require('express-validator');

const auth       = require('../middlewares/auth');
const restrictTo = require('../middlewares/restrictTo');
const validate   = require('../middlewares/validate');
const ordCtrl    = require('../controllers/orderController');

const router = express.Router();
router.use(auth);

/* user */
router.post('/cod', ordCtrl.createOrderCOD);
router.get('/my',  ordCtrl.getMyOrders);

/* admin */
router.get('/',           restrictTo('admin'), ordCtrl.getAllOrders);
router.patch(
  '/:id/status',
  restrictTo('admin'),
  [ body('status').isIn(['pending','paid','shipped','delivered','cancelled']) ],
  validate,
  ordCtrl.updateStatus
);

module.exports = router;
