const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        qty: { type: Number, default: 1, min: 1 },
        priceAtPurchase: Number,   // لتثبيت السعر
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'stripe', 'paypal'],
      default: 'cod',
    },
  },
  { timestamps: true }            // createdAt = تاريخ الطلب
);

module.exports = mongoose.model('Order', orderSchema);
