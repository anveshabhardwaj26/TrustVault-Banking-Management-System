const db = require('../config/database');
const accountRepo = require('../repositories/account.repository');
const transactionRepo = require('../repositories/transaction.repository');
const { generateTransactionRef, formatAmount } = require('../utils/responses');
const { validateAmount } = require('../utils/validation');

/**
 * Transaction Service
 * Implements core banking operations: deposits, withdrawals, and transfers.
 * All monetary operations are stored in paise and wrapped in atomic database transactions.
 */

/**
 * Deposits money into a user's bank account.
 * @param {object} params
 * @param {number} params.userId
 * @param {number|string} params.amount - Amount in Rupees
 * @param {string} [params.description]
 * @returns {object}
 */
function deposit({ userId, amount, description = 'Direct Deposit' }) {
  if (!validateAmount(amount)) {
    const error = new Error('Deposit amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  // Convert Rupees to paise (integer)
  const amountPaise = Math.round(Number(amount) * 100);
  if (amountPaise <= 0) {
    const error = new Error('Deposit amount must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  const account = accountRepo.findByUserId(userId);
  if (!account) {
    const error = new Error('Account not found for this user.');
    error.statusCode = 404;
    throw error;
  }

  if (account.status !== 'active') {
    const error = new Error(`Cannot deposit to account. Current status: ${account.status}.`);
    error.statusCode = 400;
    throw error;
  }

  // Atomic deposit transaction
  const executeDeposit = db.transaction(() => {
    const newBalance = account.balance_paise + amountPaise;
    const updatedAccount = accountRepo.updateBalance(account.id, newBalance, db);

    const transaction = transactionRepo.createTransaction({
      transaction_reference: generateTransactionRef(),
      transaction_type: 'deposit',
      source_account_id: null,
      destination_account_id: account.id,
      amount_paise: amountPaise,
      status: 'completed',
      description
    }, db);

    return {
      transaction,
      account: {
        account_number: updatedAccount.account_number,
        new_balance_paise: updatedAccount.balance_paise,
        new_balance_rupees: formatAmount(updatedAccount.balance_paise)
      }
    };
  });

  return executeDeposit();
}

/**
 * Withdraws funds from a user's bank account.
 * Validates balance and executes atomically.
 * @param {object} params
 * @param {number} params.userId
 * @param {number|string} params.amount - Amount in Rupees
 * @param {string} [params.description]
 * @returns {object}
 */
function withdraw({ userId, amount, description = 'Cash Withdrawal' }) {
  if (!validateAmount(amount)) {
    const error = new Error('Withdrawal amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  const amountPaise = Math.round(Number(amount) * 100);
  if (amountPaise <= 0) {
    const error = new Error('Withdrawal amount must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  const account = accountRepo.findByUserId(userId);
  if (!account) {
    const error = new Error('Account not found for this user.');
    error.statusCode = 404;
    throw error;
  }

  if (account.status !== 'active') {
    const error = new Error(`Cannot withdraw from account. Current status: ${account.status}.`);
    error.statusCode = 400;
    throw error;
  }

  // Check sufficient balance
  if (account.balance_paise < amountPaise) {
    const error = new Error(`Insufficient balance. Current balance is ₹${formatAmount(account.balance_paise)}.`);
    error.statusCode = 400;
    throw error;
  }

  // Atomic withdrawal transaction
  const executeWithdraw = db.transaction(() => {
    const newBalance = account.balance_paise - amountPaise;
    const updatedAccount = accountRepo.updateBalance(account.id, newBalance, db);

    const transaction = transactionRepo.createTransaction({
      transaction_reference: generateTransactionRef(),
      transaction_type: 'withdrawal',
      source_account_id: account.id,
      destination_account_id: null,
      amount_paise: amountPaise,
      status: 'completed',
      description
    }, db);

    return {
      transaction,
      account: {
        account_number: updatedAccount.account_number,
        new_balance_paise: updatedAccount.balance_paise,
        new_balance_rupees: formatAmount(updatedAccount.balance_paise)
      }
    };
  });

  return executeWithdraw();
}

/**
 * Transfers funds from the sender's account to a beneficiary account.
 * Ensures atomicity: if debit or credit fails, entire operation rolls back.
 * @param {object} params
 * @param {number} params.senderUserId
 * @param {string} params.destinationAccountNumber
 * @param {number|string} params.amount - Amount in Rupees
 * @param {string} [params.description]
 * @returns {object}
 */
function transfer({ senderUserId, destinationAccountNumber, amount, description = 'Account Transfer' }) {
  if (!validateAmount(amount)) {
    const error = new Error('Transfer amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  const amountPaise = Math.round(Number(amount) * 100);
  if (amountPaise <= 0) {
    const error = new Error('Transfer amount must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  if (!destinationAccountNumber || typeof destinationAccountNumber !== 'string') {
    const error = new Error('Destination account number is required.');
    error.statusCode = 400;
    throw error;
  }

  const sourceAccount = accountRepo.findByUserId(senderUserId);
  if (!sourceAccount) {
    const error = new Error('Sender bank account not found.');
    error.statusCode = 404;
    throw error;
  }

  if (sourceAccount.status !== 'active') {
    const error = new Error(`Sender account is ${sourceAccount.status}. Transfers not permitted.`);
    error.statusCode = 400;
    throw error;
  }

  const destinationAccount = accountRepo.findByAccountNumber(destinationAccountNumber.trim());
  if (!destinationAccount) {
    const error = new Error('Destination account not found.');
    error.statusCode = 404;
    throw error;
  }

  // Business Rule: Cannot transfer money to the exact same account
  if (sourceAccount.id === destinationAccount.id) {
    const error = new Error('Cannot transfer funds to the same account.');
    error.statusCode = 400;
    throw error;
  }

  if (destinationAccount.status !== 'active') {
    const error = new Error(`Destination account is ${destinationAccount.status}. Transfers cannot be completed.`);
    error.statusCode = 400;
    throw error;
  }

  // Business Rule: Sender must hold at least the requested amount
  if (sourceAccount.balance_paise < amountPaise) {
    const error = new Error(`Insufficient funds. Your available balance is ₹${formatAmount(sourceAccount.balance_paise)}.`);
    error.statusCode = 400;
    throw error;
  }

  // Atomic transfer execution (debit sender + credit receiver + insert log)
  const executeTransfer = db.transaction(() => {
    // 1. Debit sender
    const updatedSource = accountRepo.updateBalance(
      sourceAccount.id,
      sourceAccount.balance_paise - amountPaise,
      db
    );

    // 2. Credit receiver
    accountRepo.updateBalance(
      destinationAccount.id,
      destinationAccount.balance_paise + amountPaise,
      db
    );

    // 3. Record transaction entry
    const transaction = transactionRepo.createTransaction({
      transaction_reference: generateTransactionRef(),
      transaction_type: 'transfer',
      source_account_id: sourceAccount.id,
      destination_account_id: destinationAccount.id,
      amount_paise: amountPaise,
      status: 'completed',
      description
    }, db);

    return {
      transaction,
      sender_account: {
        account_number: updatedSource.account_number,
        new_balance_paise: updatedSource.balance_paise,
        new_balance_rupees: formatAmount(updatedSource.balance_paise)
      },
      beneficiary_account_number: destinationAccount.account_number
    };
  });

  return executeTransfer();
}

/**
 * Retrieves transaction history for a user's account.
 * @param {number} userId
 * @param {object} [filters]
 * @returns {Array<object>}
 */
function getTransactionHistory(userId, filters = {}) {
  const account = accountRepo.findByUserId(userId);
  if (!account) {
    const error = new Error('Account not found for this user.');
    error.statusCode = 404;
    throw error;
  }

  const transactions = transactionRepo.getTransactionsByAccountId(account.id, filters);

  return transactions.map(tx => ({
    ...tx,
    amount_rupees: formatAmount(tx.amount_paise),
    direction: tx.source_account_id === account.id ? 'debit' : 'credit'
  }));
}

/**
 * Retrieves aggregate transaction statistics.
 * @returns {object}
 */
function getTransactionStats() {
  const stats = transactionRepo.getTransactionStats();
  return {
    ...stats,
    total_volume_rupees: formatAmount(stats.total_volume_paise),
    deposit_volume_rupees: formatAmount(stats.deposit_volume_paise),
    withdrawal_volume_rupees: formatAmount(stats.withdrawal_volume_paise),
    transfer_volume_rupees: formatAmount(stats.transfer_volume_paise)
  };
}

module.exports = {
  deposit,
  withdraw,
  transfer,
  getTransactionHistory,
  getTransactionStats
};
