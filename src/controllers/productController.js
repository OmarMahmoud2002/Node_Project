// src/controllers/productController.js
const Product  = require('../models/productModel');
const Seller   = require('../models/sellerModel');
const ApiErr   = require('../utils/apiError');

exports.createProduct = async (req, res, next) => {
  try {
    const sellerId = req.user.role === 'seller' ? req.user._id : req.body.sellerId;
    if (!sellerId) return next(new ApiErr(400, 'Seller ID required'));

    const seller = await Seller.findById(sellerId);
    if (!seller) return next(new ApiErr(404, 'Seller not found'));

    const product = await Product.create({ ...req.body, sellerId });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const {
      q,
      page = 1,
      limit = 10,
      sort = '-createdAt',
      minPrice,
      maxPrice,
      inStock,
      sellerId
    } = req.query;

    let query = {};

    // Text search - improved to include seller name search
    if (q) {
      // First, find sellers that match the search query
      const matchingSellers = await Seller.find({
        storeName: { $regex: q, $options: 'i' }
      }).select('_id');

      const sellerIds = matchingSellers.map(seller => seller._id);

      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { sellerId: { $in: sellerIds } }
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') query.inStock = { $gt: 0 };
    if (inStock === 'false') query.inStock = 0;

    // Seller filter
    if (sellerId) query.sellerId = sellerId;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('sellerId', 'storeName'),
      Product.countDocuments(query)
    ]);

    // Filter out products where seller was not populated (in case of seller name search)
    const filteredProducts = products.filter(product => product.sellerId);

    res.json({
      products: filteredProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id).populate('sellerId', 'storeName');
    if (!prod) return next(new ApiErr(404, 'Product not found'));
    res.json(prod);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    let prod = await Product.findById(req.params.id);
    if (!prod) return next(new ApiErr(404, 'Product not found'));

    // التحقّق من الملكية
    if (req.user.role === 'seller' && prod.sellerId.toString() !== req.user._id.toString())
      return next(new ApiErr(403, 'Not allowed'));

    prod = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(prod);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return next(new ApiErr(404, 'Product not found'));

    if (req.user.role === 'seller' && prod.sellerId.toString() !== req.user._id.toString())
      return next(new ApiErr(403, 'Not allowed'));

    await prod.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
