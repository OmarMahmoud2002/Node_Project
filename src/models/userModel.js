const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'User name required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email required'],
      unique: true,
      lowercase: true,
      index: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password required'],
      minlength: 6,
      select: false,              
    },
    role: {                        // 'user' | 'seller' | 'admin'
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// تشفير قبل الحفظ
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// مقارنة كلمات المرور
userSchema.methods.correctPassword = function (candidate, hash) {
  return bcrypt.compare(candidate, hash);
};

module.exports = mongoose.model('User', userSchema);
