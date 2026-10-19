/**
 * TrustVault Banking Management System - Deposit Controller
 */

let currentAccountData = null;
let pendingDepositData = null;

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation('deposit');

  const user = await checkAuth();
  if (!user) return;

  await loadCurrentBalance();
  setupDepositForm();
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

    if (balanceEl && currentAccountData) {
      balanceEl.textContent = formatAmount(currentAccountData.balance !== undefined ? currentAccountData.balance : 0);
    }

    if (accNumEl && currentAccountData) {
      accNumEl.textContent = currentAccountData.accountNumber || '••••••••';
    }
  } catch (err) {
    console.error('Error fetching balance:', err);
    showAlert('Failed to load current balance', 'error');
  }
}

/**
 * Setup deposit form validation and modal trigger
 */
function setupDepositForm() {
  const form = document.getElementById('deposit-form');
  const amountInput = document.getElementById('amount');
  const descInput = document.getElementById('description');
  const amountError = document.getElementById('amount-error');
  const errorBox = document.getElementById('deposit-error-box');

  amountInput.addEventListener('input', () => {
    amountInput.classList.remove('is-invalid');
    amountError.classList.remove('visible');
    if (errorBox) errorBox.style.display = 'none';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const amountVal = parseFloat(amountInput.value);
    const descVal = descInput.value.trim();

    if (isNaN(amountVal) || amountVal <= 0) {
      amountInput.classList.add('is-invalid');
      amountError.classList.add('visible');
      return;
    }

    pendingDepositData = {
      amount: amountVal,
      description: descVal || 'Cash Deposit'
    };

    // Open confirmation modal
    openConfirmModal(pendingDepositData);
  });

  // "Deposit Again" button on receipt
  const depositAgainBtn = document.getElementById('deposit-again-btn');
  if (depositAgainBtn) {
    depositAgainBtn.addEventListener('click', () => {
      document.getElementById('success-card').style.display = 'none';
      document.getElementById('deposit-card').style.display = 'block';
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
      if (!pendingDepositData) return;

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="spinner spinner-sm"></span> Processing...';
      closeModal();
      showLoading(true, 'Processing your deposit...');

      try {
        const response = await API.transactions.deposit(pendingDepositData);
        showLoading(false);
        showAlert('Deposit completed successfully!', 'success');

        // Extract receipt info
        const txn = response.transaction || response.data || response;
        showReceipt(txn, pendingDepositData.amount);

      } catch (err) {
        showLoading(false);
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Confirm & Deposit';

        const errorBox = document.getElementById('deposit-error-box');
        const errorMsg = document.getElementById('deposit-error-msg');
        if (errorBox && errorMsg) {
          errorMsg.textContent = err.message || 'Deposit failed. Please try again.';
          errorBox.style.display = 'flex';
        }
        showAlert(err.message || 'Deposit failed', 'error');
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
  const modalAcc = document.getElementById('modal-target-account');

  modalAmount.textContent = formatAmount(data.amount);
  modalDesc.textContent = data.description || 'None';
  modalAcc.textContent = currentAccountData ? `${currentAccountData.accountNumber} (${currentAccountData.accountType || 'Savings'})` : 'Your Primary Account';

  modal.classList.add('active');
}

/**
 * Show success receipt
 */
function showReceipt(txn, depositedAmount) {
  document.getElementById('deposit-card').style.display = 'none';
  const successCard = document.getElementById('success-card');
  successCard.style.display = 'block';

  const ref = txn.referenceId || txn.referenceNumber || txn.id || txn._id || ('DEP-' + Date.now());
  const balance = txn.balance !== undefined ? txn.balance : (currentAccountData ? currentAccountData.balance + depositedAmount : depositedAmount);

  document.getElementById('receipt-ref').textContent = ref;
  document.getElementById('receipt-amount').textContent = formatAmount(depositedAmount);
  document.getElementById('receipt-balance').textContent = formatAmount(balance);
  document.getElementById('receipt-time').textContent = formatDate(txn.createdAt || new Date());

  // Refresh current balance in header card
  loadCurrentBalance();
}
