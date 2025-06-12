// src/routes/sellerRoutes.js
const express = require('express');
const { body } = require('express-validator');

const auth       = require('../middlewares/auth');
const restrictTo = require('../middlewares/restrictTo');
const validate   = require('../middlewares/validate');
const sellerCtrl = require('../controllers/sellerController');

const router = express.Router();

// Public route for seller registration
router.post(
  '/register',
  auth,
  [body('storeName').notEmpty().withMessage('storeName required')],
  validate,
  sellerCtrl.registerSeller
);

// Protected routes for sellers
router.use(auth);
router.use(restrictTo('seller'));

// Seller profile management
router.get('/profile', sellerCtrl.getMyProfile);
router.patch(
  '/profile',
  [body('storeName').notEmpty().withMessage('storeName required')],
  validate,
  sellerCtrl.updateMyProfile
);

// Seller products management
router.get('/products', sellerCtrl.getMyProducts);

module.exports = router;
