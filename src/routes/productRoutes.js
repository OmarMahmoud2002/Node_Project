// src/routes/productRoutes.js
const express = require('express');
const { body } = require('express-validator');

const auth       = require('../middlewares/auth');
const restrictTo = require('../middlewares/restrictTo');
const validate   = require('../middlewares/validate');
const uploadImg  = require('../middlewares/uploadPhoto');
const prodCtrl   = require('../controllers/productController');

const router = express.Router();

/* عام: مشاهدة أو بحث */
router.get('/', prodCtrl.getProducts);
router.get('/:id', prodCtrl.getProduct);

/* يتطلب توثيق */
router.use(auth);

/* Seller/Admin - إنشاء */
router.post(
  '/',
  restrictTo('seller', 'admin'),
  uploadImg,                         // إذا سترسل photo
  [
    body('name').notEmpty().withMessage('Name required'),
    body('price').isNumeric().withMessage('Price required'),
  ],
  validate,
  prodCtrl.createProduct
);

/* تعديل / حذف */
router
  .route('/:id')
  .patch(
    restrictTo('seller', 'admin'),
    uploadImg,
    prodCtrl.updateProduct
  )
  .delete(restrictTo('seller', 'admin'), prodCtrl.deleteProduct);

module.exports = router;
