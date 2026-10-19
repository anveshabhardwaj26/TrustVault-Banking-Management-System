const crypto = require('crypto');

/**
 * Standardized API success response
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} [message]
 * @param {number} [statusCode=200]
 */
function successResponse(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * Standardized API error response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=400]
 */
function errorResponse(res, message = 'An error occurred', statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message
  });
}

/**
 * Converts monetary value in paise (integer) to formatted Rupee string (e.g. 1,234.56)
 * @param {number} paise
 * @returns {string}
 */
function formatAmount(paise) {
  if (paise === null || paise === undefined || isNaN(paise)) {
    return '0.00';
  }
  const rupees = Number(paise) / 100;
  return rupees.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Generates a TrustVault account number in format: 'TV' + 10 random digits
 * @returns {string}
 */
function generateAccountNumber() {
  let digits = '';
  for (let i = 0; i < 10; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return `TV${digits}`;
}

/**
 * Generates a unique transaction reference in format: 'TXN-' + 8 char uppercase hex
 * @returns {string}
 */
function generateTransactionRef() {
  const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN-${hex}`;
}

module.exports = {
  successResponse,
  errorResponse,
  formatAmount,
  generateAccountNumber,
  generateTransactionRef
};
