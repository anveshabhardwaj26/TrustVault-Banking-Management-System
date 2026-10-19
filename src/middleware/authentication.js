/**
 * Authentication Middleware
 * Enforces session-based authentication and role-based access control.
 */

/**
 * Ensures the user has an active, authenticated session.
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  // Populate req.user for convenient access in controllers
  req.user = {
    id: req.session.userId,
    role: req.session.role
  };

  next();
}

/**
 * Ensures the user is authenticated and has the 'customer' role.
 */
function requireCustomer(req, res, next) {
  requireAuth(req, res, () => {
    if (req.session.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Customer access only.'
      });
    }
    next();
  });
}

/**
 * Ensures the user is authenticated and has the 'admin' role.
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.session.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required.'
      });
    }
    next();
  });
}

/**
 * Ensures the user is authenticated and is an 'employee' or 'admin'.
 */
function requireEmployee(req, res, next) {
  requireAuth(req, res, () => {
    if (req.session.role !== 'employee' && req.session.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff privileges required.'
      });
    }
    next();
  });
}

module.exports = {
  requireAuth,
  requireCustomer,
  requireAdmin,
  requireEmployee
};
