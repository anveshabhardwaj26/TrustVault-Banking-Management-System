/**
 * Global Error Handler Middleware
 * Intercepts uncaught errors, logs details securely on the server,
 * and ensures stack traces are never exposed to clients.
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Always log full error server-side for troubleshooting
  console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message || err);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Never leak internal stack traces or database schema details to clients
  let clientMessage = err.message || 'An internal server error occurred.';
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    clientMessage = 'An internal server error occurred. Please contact customer support.';
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage
  });
}

module.exports = errorHandler;
