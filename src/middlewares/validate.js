// src/middlewares/validate.js
const { validationResult } = require('express-validator');
const ApiErr = require('../utils/apiError');

module.exports = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new ApiErr(400, errors.array()[0].msg));
  next();
};
