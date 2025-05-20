const mongoose = require('mongoose');
const { Schema } = mongoose;

const sellerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    // معلومات إضافية لاحقاً (عنوان، وصف المتجر…)
  },
  { timestamps: true }
);

module.exports = mongoose.model('Seller', sellerSchema);
