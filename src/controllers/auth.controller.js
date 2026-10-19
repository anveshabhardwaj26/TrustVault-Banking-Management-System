const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/responses');
const { validateEmail, validatePassword, validateName, validatePhone } = require('../utils/validation');

/**
 * Auth Controller
 * Handles incoming HTTP requests for user registration, login, logout, and session profile.
 */

/**
 * Registers a new customer and initializes their bank account.
 */
async function register(req, res, next) {
  try {
    const { full_name, email, phone, password, role } = req.body;

    // Validate presence of required fields
    if (!full_name || !email || !phone || !password) {
      return errorResponse(res, 'All fields (full_name, email, phone, password) are required.', 400);
    }

    // Role safety check
    if (role && role !== 'customer') {
      return errorResponse(res, 'Registration role cannot be admin or staff.', 403);
    }

    if (!validateName(full_name)) {
      return errorResponse(res, 'Invalid full name. Must be between 2 and 100 characters.', 400);
    }

    if (!validateEmail(email)) {
      return errorResponse(res, 'Invalid email address format.', 400);
    }

    if (!validatePhone(phone)) {
      return errorResponse(res, 'Invalid phone number. Must contain 10-15 digits.', 400);
    }

    if (!validatePassword(password)) {
      return errorResponse(res, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.', 400);
    }

    const result = await authService.registerUser({
      full_name,
      email,
      phone,
      password,
      role: 'customer'
    });

    // Automatically establish session upon registration
    req.session.userId = result.user.id;
    req.session.role = result.user.role;

    return successResponse(res, result, 'Registration successful. Account created.', 201);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Authenticates user credentials and creates session.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    if (!validateEmail(email)) {
      return errorResponse(res, 'Invalid email format.', 400);
    }

    const user = await authService.loginUser(email, password);

    // Save user info in express-session
    req.session.userId = user.id;
    req.session.role = user.role;

    return successResponse(res, { user }, 'Login successful.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Logs out the authenticated user by destroying session.
 */
function logout(req, res, next) {
  if (!req.session) {
    return successResponse(res, null, 'Logged out successfully.');
  }

  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid');
    return successResponse(res, null, 'Logged out successfully.');
  });
}

/**
 * Retrieves the currently authenticated user's profile and account.
 */
function getMe(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    const profile = authService.getUserProfile(req.session.userId);
    return successResponse(res, profile, 'User profile retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe
};
