// src/routes/sellerRoutes.js
const express = require('express');
const { body } = require('express-validator');

const auth       = require('../middlewares/auth');
const validate   = require('../middlewares/validate');
const sellerCtrl = require('../controllers/sellerController');

const router = express.Router();

router.post(
  '/register',
  auth,
  [body('storeName').notEmpty().withMessage('storeName required')],
  validate,
  sellerCtrl.registerSeller
);

module.exports = router;
