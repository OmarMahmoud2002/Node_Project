const express = require('express');
const { body } = require('express-validator');

const auth       = require('../middlewares/auth');
const restrictTo = require('../middlewares/restrictTo');
const validate   = require('../middlewares/validate');
const userCtrl   = require('../controllers/userController');

const router = express.Router();

/* ---------- مسارات المستخدم المسجَّل ---------- */
router.use(auth);                 // لابد من JWT في كل ما يلي

router.get('/me', userCtrl.getMe);

router.patch(
  '/me',
  [
    body('name').optional().isLength({ min: 2 }).withMessage('Name too short'),
    body('email').optional().isEmail().withMessage('Invalid email'),
  ],
  validate,
  userCtrl.updateMe
);

router.delete('/me', userCtrl.deleteMe);

/* ---------- صلاحيات Admin ---------- */
router.use(restrictTo('admin'));

router.get('/',          userCtrl.getAll);
router.get('/:id',       userCtrl.getOne);
router.delete('/:id',    userCtrl.deleteUser);

module.exports = router;
