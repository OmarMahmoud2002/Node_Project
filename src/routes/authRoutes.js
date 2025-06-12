const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const authCtrl = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').isLength({ min: 2 }).withMessage('Name too short'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password ≥ 6 chars'),
  ],
  validate,
  authCtrl.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  authCtrl.login
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email required')],
  validate,
  authCtrl.forgotPassword
);

router.patch(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authCtrl.resetPassword
);

module.exports = router;
