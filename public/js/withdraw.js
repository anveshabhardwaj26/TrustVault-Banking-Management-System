/**
 * TrustVault Banking Management System - Withdrawal Controller
 */

let currentAccountData = null;
let pendingWithdrawalData = null;

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation('withdraw');

  const user = await checkAuth();
  if (!user) return;

  await loadCurrentBalance();
  setupWithdrawForm();
  setupModalEvents();
});

/**
 * Load customer balance and account details
 */
async function loadCurrentBalance() {
  try {
    const res = await API.accounts.getMyAccount();
    currentAccountData = res.account || res.data || res;

    const balanceEl = document.getElementById('current-balance');
    const accNumEl = document.getElementById('account-number-display');
    const balanceHint = document.getElementById('balance-hint');

    const balance = currentAccountData && currentAccountData.balance !== undefined ? currentAccountData.balance : 0;

    if (balanceEl) {
      balanceEl.textContent = formatAmount(balance);
    }

    if (accNumEl && currentAccountData) {
      accNumEl.textContent = currentAccountData.accountNumber || '••••••••';
    }

    if (balanceHint) {
      balanceHint.textContent = `Maximum withdrawable amount: ${formatAmount(balance)}`;
    }
  } catch (err) {
    console.error('Error fetching balance:', err);
    showAlert('Failed to load current balance', 'error');
  }
}

/**
 * Setup withdrawal form validation and modal trigger
 */
function setupWithdrawForm() {
  const form = document.getElementById('withdraw-form');
  const amountInput = document.getElementById('amount');
  const descInput = document.getElementById('description');
  const amountError = document.getElementById('amount-error');
  const errorBox = document.getElementById('withdraw-error-box');

  amountInput.addEventListener('input', () => {
    amountInput.classList.remove('is-invalid');
    amountError.classList.remove('visible');
    if (errorBox) errorBox.style.display = 'none';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const amountVal = parseFloat(amountInput.value);
    const descVal = descInput.value.trim();
    const availableBalance = currentAccountData && currentAccountData.balance !== undefined ? currentAccountData.balance : 0;

    if (isNaN(amountVal) || amountVal <= 0) {
      amountInput.classList.add('is-invalid');
      amountError.textContent = 'Please enter a valid withdrawal amount greater than ₹0.';
      amountError.classList.add('visible');
      return;
    }

    if (amountVal > availableBalance) {
      amountInput.classList.add('is-invalid');
      amountError.textContent = `Insufficient funds. Your available balance is ${formatAmount(availableBalance)}.`;
      amountError.classList.add('visible');
      return;
    }

    pendingWithdrawalData = {
      amount: amountVal,
      description: descVal || 'Cash Withdrawal'
    };

    // Open confirmation modal
    openConfirmModal(pendingWithdrawalData);
  });

  // "Withdraw Again" button on receipt
  const withdrawAgainBtn = document.getElementById('withdraw-again-btn');
  if (withdrawAgainBtn) {
    withdrawAgainBtn.addEventListener('click', () => {
      document.getElementById('success-card').style.display = 'none';
      document.getElementById('withdraw-card').style.display = 'block';
      form.reset();
      loadCurrentBalance();
    });
  }
}

/**
 * Setup Modal display and confirmation handlers
 */
function setupModalEvents() {
  const modal = document.getElementById('confirm-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const confirmBtn = document.getElementById('modal-confirm-btn');

  const closeModal = () => {
    modal.classList.remove('active');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (!pendingWithdrawalData) return;

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="spinner spinner-sm"></span> Processing...';
      closeModal();
      showLoading(true, 'Processing your withdrawal...');

      try {
        const response = await API.transactions.withdraw(pendingWithdrawalData);
        showLoading(false);
        showAlert('Withdrawal completed successfully!', 'success');

        const txn = response.transaction || response.data || response;
        showReceipt(txn, pendingWithdrawalData.amount);

      } catch (err) {
        showLoading(false);
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Confirm & Withdraw';

        const errorBox = document.getElementById('withdraw-error-box');
        const errorMsg = document.getElementById('withdraw-error-msg');
        if (errorBox && errorMsg) {
          errorMsg.textContent = err.message || 'Withdrawal failed. Please check your balance.';
          errorBox.style.display = 'flex';
        }
        showAlert(err.message || 'Withdrawal failed', 'error');
      }
    });
  }
}

/**
 * Open confirmation modal with populated data
 */
function openConfirmModal(data) {
  const modal = document.getElementById('confirm-modal');
  const modalAmount = document.getElementById('modal-amount');
  const modalDesc = document.getElementById('modal-desc');
  const modalAcc = document.getElementById('modal-source-account');

  modalAmount.textContent = formatAmount(data.amount);
  modalDesc.textContent = data.description || 'None';
  modalAcc.textContent = currentAccountData ? `${currentAccountData.accountNumber} (${currentAccountData.accountType || 'Savings'})` : 'Your Primary Account';

  modal.classList.add('active');
}

/**
 * Show success receipt
 */
function showReceipt(txn, withdrawnAmount) {
  document.getElementById('withdraw-card').style.display = 'none';
  const successCard = document.getElementById('success-card');
  successCard.style.display = 'block';

  const ref = txn.referenceId || txn.referenceNumber || txn.id || txn._id || ('WTH-' + Date.now());
  const balance = txn.balance !== undefined ? txn.balance : (currentAccountData ? currentAccountData.balance - withdrawnAmount : 0);

  document.getElementById('receipt-ref').textContent = ref;
  document.getElementById('receipt-amount').textContent = formatAmount(withdrawnAmount);
  document.getElementById('receipt-balance').textContent = formatAmount(balance);
  document.getElementById('receipt-time').textContent = formatDate(txn.createdAt || new Date());

  // Refresh current balance in header card
  loadCurrentBalance();
}
