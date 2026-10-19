/**
 * TrustVault Input Validation Utilities
 * Validates common bank inputs to protect against malformed data and injection attacks.
 */

/**
 * Validates an email address.
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a phone number (e.g. 10 to 15 digits, optional leading +).
 * @param {string} phone
 * @returns {boolean}
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^\+?[0-9\s\-()]{10,15}$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone.trim()) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Validates password strength:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * @param {string} password
 * @returns {boolean}
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  // Regex: min 8 chars, 1 uppercase, 1 lowercase, 1 digit
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validates a monetary amount.
 * Must be a positive finite number greater than zero.
 * @param {number|string} amount
 * @returns {boolean}
 */
function validateAmount(amount) {
  if (amount === null || amount === undefined || amount === '') return false;
  const num = Number(amount);
  return !Number.isNaN(num) && Number.isFinite(num) && num > 0;
}

/**
 * Validates a user's full name.
 * Must be a non-empty string between 2 and 100 characters.
 * @param {string} name
 * @returns {boolean}
 */
function validateName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

/**
 * Sanitizes input string by trimming and removing potential malicious scripts.
 * @param {string} str
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, ''); // Basic tag sanitization
}

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateAmount,
  validateName,
  sanitizeString
};
