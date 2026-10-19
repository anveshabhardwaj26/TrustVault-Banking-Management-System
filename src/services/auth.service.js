const bcrypt = require('bcryptjs');
const db = require('../config/database');
const userRepo = require('../repositories/user.repository');
const accountRepo = require('../repositories/account.repository');
const { generateAccountNumber } = require('../utils/responses');
const {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName
} = require('../utils/validation');

/**
 * Authentication Service
 * Implements business logic for registration, authentication, and profiles.
 */

/**
 * Registers a new user and automatically creates an associated bank account.
 * Uses atomic transaction to guarantee that user and account are created together.
 * @param {object} params
 * @param {string} params.full_name
 * @param {string} params.email
 * @param {string} params.phone
 * @param {string} params.password
 * @param {string} [params.role='customer']
 * @returns {Promise<{user: object, account: object}>}
 */
async function registerUser({ full_name, email, phone, password, role = 'customer' }) {
  // Business Rule: Self-registration is strictly for customers
  if (role && role !== 'customer') {
    const error = new Error('Public registration is restricted to customer accounts.');
    error.statusCode = 403;
    throw error;
  }

  // Validate Name
  if (!validateName(full_name)) {
    const error = new Error('Invalid full name. Name must be between 2 and 100 characters.');
    error.statusCode = 400;
    throw error;
  }

  // Validate Email
  if (!validateEmail(email)) {
    const error = new Error('Invalid email address format.');
    error.statusCode = 400;
    throw error;
  }

  // Validate Phone
  if (!validatePhone(phone)) {
    const error = new Error('Invalid phone number. Must contain 10-15 digits.');
    error.statusCode = 400;
    throw error;
  }

  // Validate Password complexity
  if (!validatePassword(password)) {
    const error = new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.');
    error.statusCode = 400;
    throw error;
  }

  // Business Rule: Email addresses must be unique
  const existingUser = userRepo.findByEmail(email);
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Hash password using bcrypt with 10 salt rounds
  const password_hash = await bcrypt.hash(password, 10);

  // Execute atomic transaction for user and account creation
  const executeRegistration = db.transaction(() => {
    // 1. Create the user
    const user = userRepo.createUser({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password_hash,
      role: 'customer'
    });

    // 2. Generate unique account number and create savings account
    let accountNumber;
    let isUnique = false;
    while (!isUnique) {
      accountNumber = generateAccountNumber();
      const existingAccount = accountRepo.findByAccountNumber(accountNumber);
      if (!existingAccount) {
        isUnique = true;
      }
    }

    const account = accountRepo.createAccount({
      account_number: accountNumber,
      user_id: user.id,
      account_type: 'savings',
      balance_paise: 0,
      status: 'active'
    });

    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, account };
  });

  return executeRegistration();
}

/**
 * Verifies credentials and logs in the user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} The authenticated user without password hash
 */
async function loginUser(email, password) {
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const user = userRepo.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (user.is_active !== 1) {
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const { password_hash: _, ...safeUser } = user;
  return safeUser;
}

/**
 * Fetches user profile along with linked account information.
 * @param {number} userId
 * @returns {object}
 */
function getUserProfile(userId) {
  const user = userRepo.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const account = accountRepo.findByUserId(userId);
  const { password_hash: _, ...safeUser } = user;

  return {
    user: safeUser,
    account: account || null
  };
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
