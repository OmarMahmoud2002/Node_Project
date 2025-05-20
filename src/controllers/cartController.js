const Cart    = require('../models/cartModel');
const Product = require('../models/productModel');
const ApiErr  = require('../utils/apiError');

/* ⬇️ Get my cart (creates empty cart on first call) */
exports.getMyCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json(cart);
  } catch (err) { next(err); }
};

/* ⬇️ Add / update item */
exports.addItem = async (req, res, next) => {
  try {
    const { productId, qty = 1 } = req.body;
    if (!productId) return next(new ApiErr(400, 'productId required'));

    const product = await Product.findById(productId);
    if (!product) return next(new ApiErr(404, 'Product not found'));

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) cart.items[idx].qty = qty;
    else cart.items.push({ product: productId, qty });

    await cart.save();
    res.json(await cart.populate('items.product'));
  } catch (err) { next(err); }
};

/* ⬇️ Remove item */
exports.removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return next(new ApiErr(404, 'Cart empty'));

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    await cart.save();
    res.json(await cart.populate('items.product'));
  } catch (err) { next(err); }
};

/* ⬇️ Clear cart */
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.status(204).end();
  } catch (err) { next(err); }
};
