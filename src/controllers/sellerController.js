// src/controllers/sellerController.js
const Seller  = require('../models/sellerModel');
const User    = require('../models/userModel');
const ApiErr  = require('../utils/apiError');

exports.registerSeller = async (req, res, next) => {
  try {
    // req.user موجود لأن المسار محمي
    if (req.user.role === 'seller')
      return next(new ApiErr(400, 'Already a seller'));

    const { storeName } = req.body;
    if (!storeName) return next(new ApiErr(400, 'storeName required'));

    // 1. أنشئ مستند Seller
    await Seller.create({ user: req.user._id, storeName });

    // 2. حدّث دور المستخدم
    req.user.role = 'seller';
    await req.user.save({ validateBeforeSave: false });

    res.status(201).json({ message: 'Seller profile created' });
  } catch (err) {
    next(err);
  }
};
