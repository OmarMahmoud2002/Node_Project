const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/userModel');
const ApiErr = require('../utils/apiError');
const { sendEmail } = require('../utils/sendEmail');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

exports.register = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password)))
      throw new ApiErr(401, 'Incorrect email or password');

    const token = signToken(user._id);
    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new ApiErr(404, 'No user found with that email'));

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetURL}">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: message,
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token and find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return next(new ApiErr(400, 'Token is invalid or has expired'));

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = signToken(user._id);
    res.status(200).json({ token: authToken, user });
  } catch (err) {
    next(err);
  }
};
