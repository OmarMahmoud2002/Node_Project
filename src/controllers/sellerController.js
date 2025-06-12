// src/controllers/sellerController.js
const Seller  = require('../models/sellerModel');
const Product = require('../models/productModel');
const ApiErr  = require('../utils/apiError');

exports.registerSeller = async (req, res, next) => {
  try {
    if (req.user.role === 'seller')
      return next(new ApiErr(400, 'Already a seller'));

    const { storeName } = req.body;
    if (!storeName) return next(new ApiErr(400, 'storeName required'));

    const seller = await Seller.create({ user: req.user._id, storeName });

    req.user.role = 'seller';
    await req.user.save({ validateBeforeSave: false });

    res.status(201).json({ message: 'Seller profile created', seller });
  } catch (err) {
    next(err);
  }
};

exports.getMyProducts = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return next(new ApiErr(404, 'Seller profile not found'));

    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ sellerId: seller._id })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('sellerId', 'storeName'),
      Product.countDocuments({ sellerId: seller._id })
    ]);

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!seller) return next(new ApiErr(404, 'Seller profile not found'));
    res.json(seller);
  } catch (err) {
    next(err);
  }
};

// Update seller profile
exports.updateMyProfile = async (req, res, next) => {
  try {
    const { storeName } = req.body;
    const seller = await Seller.findOneAndUpdate(
      { user: req.user._id },
      { storeName },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!seller) return next(new ApiErr(404, 'Seller profile not found'));
    res.json(seller);
  } catch (err) {
    next(err);
  }
};
