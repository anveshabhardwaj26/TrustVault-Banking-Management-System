/**
 * TrustVault Banking Management System - Fund Transfer Controller
 * Implements 3-step transfer wizard with beneficiary verification
 */

let currentAccountData = null;
let transferPayload = null;

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation('transfer');

  const user = await checkAuth();
  if (!user) return;

  await loadCurrentBalance();
  setupTransferWizard();
});

/**
 * Fetch customer account data and live balance
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
 * Initialize 3-step wizard and event handlers
 */
function setupTransferWizard() {
  const formStep1 = document.getElementById('transfer-form-step1');
  const toAccountInput = document.getElementById('toAccount');
  const lookupBtn = document.getElementById('lookup-btn');
  const beneficiaryNameInput = document.getElementById('beneficiaryName');
  const lookupStatus = document.getElementById('beneficiary-lookup-status');
  const amountInput = document.getElementById('amount');
  const descInput = document.getElementById('description');

  const step1Card = document.getElementById('step-1-card');
  const step2Card = document.getElementById('step-2-card');
  const step3Card = document.getElementById('step-3-card');

  const stepNav1 = document.getElementById('step-nav-1');
  const stepNav2 = document.getElementById('step-nav-2');
  const stepNav3 = document.getElementById('step-nav-3');

  const errorBox = document.getElementById('transfer-error-box');
  const errorMsg = document.getElementById('transfer-error-msg');

  // Verify Beneficiary Account handler
  const performLookup = async () => {
    const accountNum = toAccountInput.value.trim();
    if (!accountNum) return;

    if (currentAccountData && accountNum === currentAccountData.accountNumber) {
      lookupStatus.innerHTML = '<span style="color: var(--error);">❌ Cannot transfer to your own account.</span>';
      beneficiaryNameInput.value = '';
      return;
    }

    lookupStatus.innerHTML = '<span style="color: var(--text-light);"><span class="spinner spinner-sm"></span> Verifying account...</span>';

    try {
      const res = await API.accounts.lookup(accountNum);
      const recipient = res.account || res.user || res.data || res;
      const recipientName = recipient.fullName || recipient.name || recipient.holderName || (recipient.user && recipient.user.fullName) || 'Verified Account Holder';

      beneficiaryNameInput.value = recipientName;
      lookupStatus.innerHTML = `<span style="color: var(--success); font-weight: 600;">✓ Verified: ${escapeHtml(recipientName)}</span>`;
    } catch (err) {
      // If backend lookup endpoint is generic or account not found
      lookupStatus.innerHTML = `<span style="color: var(--warning);">⚠ Note: Could not auto-verify name (${escapeHtml(err.message || 'Account')})</span>`;
    }
  };

  lookupBtn.addEventListener('click', performLookup);
  toAccountInput.addEventListener('blur', () => {
    if (toAccountInput.value.trim() && !beneficiaryNameInput.value) {
      performLookup();
    }
  });

  // Step 1 Submission -> Proceed to Step 2
  formStep1.addEventListener('submit', (e) => {
    e.preventDefault();

    const toAccount = toAccountInput.value.trim();
    const amountVal = parseFloat(amountInput.value);
    const descVal = descInput.value.trim();
    const beneficiaryName = beneficiaryNameInput.value.trim() || 'Beneficiary Account';
    const availableBalance = currentAccountData && currentAccountData.balance !== undefined ? currentAccountData.balance : 0;

    let isValid = true;
    errorBox.style.display = 'none';

    if (!toAccount) {
      document.getElementById('toAccount-error').classList.add('visible');
      toAccountInput.classList.add('is-invalid');
      isValid = false;
    }

    if (currentAccountData && toAccount === currentAccountData.accountNumber) {
      showAlert('You cannot transfer money to your own account.', 'error');
      isValid = false;
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      document.getElementById('amount-error').textContent = 'Please enter a valid amount greater than ₹0.';
      document.getElementById('amount-error').classList.add('visible');
      amountInput.classList.add('is-invalid');
      isValid = false;
    } else if (amountVal > availableBalance) {
      document.getElementById('amount-error').textContent = `Insufficient balance. Available: ${formatAmount(availableBalance)}`;
      document.getElementById('amount-error').classList.add('visible');
      amountInput.classList.add('is-invalid');
      isValid = false;
    }

    if (!isValid) return;

    transferPayload = {
      toAccount,
      amount: amountVal,
      description: descVal || 'Fund Transfer',
      beneficiaryName
    };

    // Populate Review Step 2
    document.getElementById('review-amount').textContent = formatAmount(transferPayload.amount);
    document.getElementById('review-from-acc').textContent = currentAccountData ? `${currentAccountData.accountNumber}` : 'Your Account';
    document.getElementById('review-to-acc').textContent = transferPayload.toAccount;
    document.getElementById('review-to-name').textContent = transferPayload.beneficiaryName;
    document.getElementById('review-desc').textContent = transferPayload.description;

    // Switch view to Step 2
    step1Card.style.display = 'none';
    step2Card.style.display = 'block';

    stepNav1.className = 'step-item completed';
    stepNav2.className = 'step-item active';
  });

  // Back to Step 1 Button
  const backBtn = document.getElementById('back-to-step1-btn');
  backBtn.addEventListener('click', () => {
    step2Card.style.display = 'none';
    step1Card.style.display = 'block';

    stepNav1.className = 'step-item active';
    stepNav2.className = 'step-item';
  });

  // Step 2 Confirm & Execute Transfer
  const confirmBtn = document.getElementById('confirm-transfer-btn');
  confirmBtn.addEventListener('click', async () => {
    if (!transferPayload) return;

    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner spinner-sm"></span> Processing Transfer...';
    showLoading(true, 'Transferring funds securely...');

    try {
      const response = await API.transactions.transfer({
        toAccount: transferPayload.toAccount,
        recipientAccount: transferPayload.toAccount,
        beneficiaryAccount: transferPayload.toAccount,
        amount: transferPayload.amount,
        description: transferPayload.description
      });

      showLoading(false);
      showAlert('Fund transfer completed successfully!', 'success');

      // Populate Step 3
      const txn = response.transaction || response.data || response;
      const ref = txn.referenceId || txn.referenceNumber || txn.id || ('TRF-' + Date.now());
      const remainingBalance = txn.balance !== undefined ? txn.balance : (currentAccountData ? currentAccountData.balance - transferPayload.amount : 0);

      document.getElementById('receipt-ref').textContent = ref;
      document.getElementById('receipt-amount').textContent = formatAmount(transferPayload.amount);
      document.getElementById('receipt-beneficiary').textContent = `${transferPayload.toAccount} (${transferPayload.beneficiaryName})`;
      document.getElementById('receipt-balance').textContent = formatAmount(remainingBalance);
      document.getElementById('receipt-time').textContent = formatDate(txn.createdAt || new Date());

      // Transition to Step 3
      step2Card.style.display = 'none';
      step3Card.style.display = 'block';

      stepNav2.className = 'step-item completed';
      stepNav3.className = 'step-item active completed';

      // Update balance
      loadCurrentBalance();

    } catch (err) {
      showLoading(false);
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = 'Confirm & Transfer Now';

      step2Card.style.display = 'none';
      step1Card.style.display = 'block';
      stepNav1.className = 'step-item active';
      stepNav2.className = 'step-item';

      if (errorBox && errorMsg) {
        errorMsg.textContent = err.message || 'Transfer failed. Please check beneficiary details and try again.';
        errorBox.style.display = 'flex';
      }
      showAlert(err.message || 'Transfer failed', 'error');
    }
  });

  // Send Another Transfer
  const newTransferBtn = document.getElementById('new-transfer-btn');
  if (newTransferBtn) {
    newTransferBtn.addEventListener('click', () => {
      formStep1.reset();
      beneficiaryNameInput.value = '';
      lookupStatus.innerHTML = '';
      transferPayload = null;

      step3Card.style.display = 'none';
      step1Card.style.display = 'block';

      stepNav1.className = 'step-item active';
      stepNav2.className = 'step-item';
      stepNav3.className = 'step-item';

      loadCurrentBalance();
    });
  }
}
