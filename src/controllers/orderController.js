const Order   = require('../models/orderModel');
const Cart    = require('../models/cartModel');
const Product = require('../models/productModel');
const ApiErr  = require('../utils/apiError');
const { sendOrderConfirmation } = require('../utils/sendEmail');

/* ⬇️ Create COD order from my cart */
exports.createOrderCOD = async (req, res, next) => {
  try {
    // 1. Cart must exist and not be empty
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0)
      return next(new ApiErr(400, 'Cart is empty'));
    
    // 2. Check stock availability
    for (const item of cart.items) {
      if (!item.product.inStock || item.product.inStock < item.qty) {
        return next(new ApiErr(400, `${item.product.name} is out of stock`));
      }
    }

    // 2. Build order lines (qty + snapshot price)
    const orderLines = cart.items.map((i) => ({
      product: i.product._id,
      qty: i.qty,
      priceAtPurchase: i.product.price,
    }));

    // 3. Create order and update stock
    const order = await Order.create({
      user: req.user._id,
      products: orderLines,
      paymentMethod: 'cod',
      status: 'pending',
    });

    // 4. Update product stock
    await Promise.all(cart.items.map(item => 
      Product.findByIdAndUpdate(item.product._id, {
        $inc: { inStock: -item.qty }
      })
    ));

    // 5. Clear cart
    cart.items = [];
    await cart.save();

    // 6. Send confirmation email
    await sendOrderConfirmation(req.user, await order.populate('products.product'));

    res.status(201).json(order);
  } catch (err) { next(err); }
};

/* ⬇️ Get my orders */
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('products.product');
    res.json(orders);
  } catch (err) { next(err); }
};

/* ⬇️ Admin: list all */
exports.getAllOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.json(orders);
  } catch (err) { next(err); }
};

/* ⬇️ Admin: update status */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return next(new ApiErr(404, 'Order not found'));
    res.json(order);
  } catch (err) { next(err); }
};
