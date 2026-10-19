const accountService = require('../services/account.service');
const { successResponse, errorResponse } = require('../utils/responses');

/**
 * Account Controller
 * Handles user-facing banking account retrieval requests.
 */

/**
 * Retrieves the authenticated user's account details.
 */
function getMyAccount(req, res, next) {
  try {
    const userId = req.session.userId;
    const accountDetails = accountService.getAccountDetails(userId);
    return successResponse(res, accountDetails, 'Account details retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Retrieves current balance for authenticated user.
 */
function getMyBalance(req, res, next) {
  try {
    const userId = req.session.userId;
    const balance = accountService.getBalance(userId);
    return successResponse(res, balance, 'Account balance retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

module.exports = {
  getMyAccount,
  getMyBalance
};
