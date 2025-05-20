const express = require('express');
const { body } = require('express-validator');
const auth     = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const cartCtrl = require('../controllers/cartController');

const router = express.Router();
router.use(auth);                     // كل المسارات محمية

router.get('/',            cartCtrl.getMyCart);
router.post(
  '/',
  [ body('productId').notEmpty(), body('qty').optional().isInt({ min:1 }) ],
  validate,
  cartCtrl.addItem
);
router.delete('/:productId', cartCtrl.removeItem);
router.delete('/',           cartCtrl.clearCart);

module.exports = router;
