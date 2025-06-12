const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name required'],
      trim: true,
      minlength: 2,
      maxlength: 120,
      index: true, // Add index for better search performance
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    photo: String,                
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    inStock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
