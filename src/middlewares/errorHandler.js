// src/middlewares/errorHandler.js
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = (err, req, res, _next) => {
  // Add request ID if present
  const requestId = req.headers['x-request-id'];
  
  // Log error
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.path,
      error: err.message,
      stack: isDevelopment ? err.stack : undefined,
    })
  );

  // Determine if error is operational
  const isOperational = err.statusCode < 500;

  // Send response
  const status = err.statusCode || 500;
  res.status(status).json({
    status,
    message: isOperational ? err.message : 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack }),
    ...(requestId && { requestId }),
  });
};
  