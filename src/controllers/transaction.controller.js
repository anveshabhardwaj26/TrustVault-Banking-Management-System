const transactionService = require('../services/transaction.service');
const { successResponse, errorResponse } = require('../utils/responses');
const { validateAmount } = require('../utils/validation');

/**
 * Transaction Controller
 * Handles HTTP operations for deposits, withdrawals, transfers, and transaction history.
 */

/**
 * Executes a deposit to the user's account.
 */
function deposit(req, res, next) {
  try {
    const { amount, description } = req.body;

    if (amount === undefined || amount === null || amount === '') {
      return errorResponse(res, 'Deposit amount is required.', 400);
    }

    if (!validateAmount(amount)) {
      return errorResponse(res, 'Amount must be a positive number greater than zero.', 400);
    }

    const result = transactionService.deposit({
      userId: req.session.userId,
      amount,
      description
    });

    return successResponse(res, result, 'Deposit processed successfully.', 200);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Executes a cash withdrawal from the user's account.
 */
function withdraw(req, res, next) {
  try {
    const { amount, description } = req.body;

    if (amount === undefined || amount === null || amount === '') {
      return errorResponse(res, 'Withdrawal amount is required.', 400);
    }

    if (!validateAmount(amount)) {
      return errorResponse(res, 'Amount must be a positive number greater than zero.', 400);
    }

    const result = transactionService.withdraw({
      userId: req.session.userId,
      amount,
      description
    });

    return successResponse(res, result, 'Withdrawal processed successfully.', 200);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Executes an inter-account fund transfer.
 */
function transfer(req, res, next) {
  try {
    const {
      amount,
      destination_account_number,
      destinationAccountNumber,
      beneficiary_account_number,
      description
    } = req.body;

    const targetAccount = destination_account_number || destinationAccountNumber || beneficiary_account_number;

    if (!targetAccount) {
      return errorResponse(res, 'Destination account number is required.', 400);
    }

    if (amount === undefined || amount === null || amount === '') {
      return errorResponse(res, 'Transfer amount is required.', 400);
    }

    if (!validateAmount(amount)) {
      return errorResponse(res, 'Amount must be a positive number greater than zero.', 400);
    }

    const result = transactionService.transfer({
      senderUserId: req.session.userId,
      destinationAccountNumber: targetAccount,
      amount,
      description
    });

    return successResponse(res, result, 'Fund transfer completed successfully.', 200);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

/**
 * Fetches transaction history for the logged-in customer.
 */
function getMyTransactions(req, res, next) {
  try {
    const { type, limit, offset } = req.query;

    const transactions = transactionService.getTransactionHistory(req.session.userId, {
      type,
      limit,
      offset
    });

    return successResponse(res, transactions, 'Transaction history retrieved.');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

module.exports = {
  deposit,
  withdraw,
  transfer,
  getMyTransactions
};
