// src/middlewares/restrictTo.js
const ApiErr = require('../utils/apiError');

module.exports = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role))
    return next(new ApiErr(403, 'Forbidden'));
  next();
};
