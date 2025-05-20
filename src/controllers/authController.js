const jwt    = require('jsonwebtoken');
const User   = require('../models/userModel');
const ApiErr = require('../utils/apiError');

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
