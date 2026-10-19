const accountRepo = require('../repositories/account.repository');
const userRepo = require('../repositories/user.repository');
const { formatAmount } = require('../utils/responses');

/**
 * Account Service
 * Provides business logic for managing bank accounts and balances.
 */

/**
 * Retrieves the primary account for a user.
 * @param {number} userId
 * @returns {object}
 */
function getAccountByUserId(userId) {
  const account = accountRepo.findByUserId(userId);
  if (!account) {
    const error = new Error('No bank account found for this user.');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...account,
    balance_rupees: formatAmount(account.balance_paise)
  };
}

/**
 * Retrieves only the balance summary for a user.
 * @param {number} userId
 * @returns {object}
 */
function getBalance(userId) {
  const account = getAccountByUserId(userId);
  return {
    account_number: account.account_number,
    account_type: account.account_type,
    balance_paise: account.balance_paise,
    balance_rupees: account.balance_rupees,
    status: account.status,
    currency: 'INR'
  };
}

/**
 * Retrieves comprehensive account details including owner profile.
 * @param {number} userId
 * @returns {object}
 */
function getAccountDetails(userId) {
  const account = getAccountByUserId(userId);
  const user = userRepo.findById(userId);

  return {
    account,
    owner: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone
    }
  };
}

module.exports = {
  getAccountByUserId,
  getBalance,
  getAccountDetails
};
