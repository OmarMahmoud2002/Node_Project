// src/middlewares/auth.js
const jwt    = require('jsonwebtoken');
const User   = require('../models/userModel');
const ApiErr = require('../utils/apiError');

module.exports = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      throw new ApiErr(401, 'Not logged in');

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+password');
    if (!user) throw new ApiErr(401, 'User no longer exists');

    req.user = user;             
    next();
  } catch (err) {
    next(err);
  }
};
