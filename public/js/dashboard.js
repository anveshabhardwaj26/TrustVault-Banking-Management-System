/**
 * TrustVault Banking Management System - Dashboard Controller
 * Fetches account overview, live balance, and recent transaction history
 */

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation('dashboard');

  // Verify authentication
  const user = await checkAuth();
  if (!user) return;

  // Set user greeting
  const greetingEl = document.getElementById('dash-customer-name');
  if (greetingEl) {
    greetingEl.textContent = user.fullName || user.name || 'Valued Customer';
  }

  // Load account and transaction data
  await Promise.all([
    loadAccountDetails(),
    loadRecentTransactions()
  ]);
});

/**
 * Fetch and display customer's primary account information
 */
async function loadAccountDetails() {
  try {
    const res = await API.accounts.getMyAccount();
    const account = res.account || res.data || res;

    if (account) {
      // Balance display
      const balanceEl = document.getElementById('dash-balance');
      if (balanceEl) {
        balanceEl.textContent = formatAmount(account.balance !== undefined ? account.balance : 0);
      }

      // Account number
      const accNumEl = document.getElementById('dash-account-number');
      if (accNumEl) {
        accNumEl.textContent = account.accountNumber || 'N/A';
      }

      // Account type
      const accTypeEl = document.getElementById('dash-account-type');
      if (accTypeEl) {
        accTypeEl.textContent = (account.accountType || 'Savings').toUpperCase() + ' ACCOUNT';
      }

      // IFSC code
      const ifscEl = document.getElementById('dash-ifsc');
      if (ifscEl && account.ifscCode) {
        ifscEl.textContent = account.ifscCode;
      }

      // Branch
      const branchEl = document.getElementById('dash-branch');
      if (branchEl && account.branch) {
        branchEl.textContent = account.branch;
      }

      // Account status badge
      const statusBadge = document.getElementById('dash-account-status');
      if (statusBadge) {
        const status = (account.status || 'ACTIVE').toUpperCase();
        if (status === 'ACTIVE') {
          statusBadge.className = 'account-hero-badge active';
          statusBadge.textContent = '● Active Account';
        } else if (status === 'FROZEN' || status === 'BLOCKED') {
          statusBadge.className = 'account-hero-badge blocked';
          statusBadge.textContent = `● ${status}`;
        } else {
          statusBadge.className = 'account-hero-badge';
          statusBadge.textContent = `● ${status}`;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load account details:', err);
    showAlert('Unable to load account information. Please try refreshing.', 'error');
  }
}

/**
 * Fetch last 5 transactions for preview
 */
async function loadRecentTransactions() {
  const tbody = document.getElementById('recent-transactions-tbody');
  if (!tbody) return;

  try {
    const res = await API.transactions.getHistory({ limit: 5 });
    const transactions = res.transactions || res.data || (Array.isArray(res) ? res : []);

    if (!transactions || transactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-title">No transactions yet</div>
            <div class="empty-state-text">Your recent deposits, withdrawals, and transfers will appear here.</div>
            <a href="/deposit.html" class="btn btn-primary btn-sm">Make Your First Deposit</a>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = transactions.slice(0, 5).map(tx => {
      const type = (tx.type || 'TRANSFER').toUpperCase();
      const isCredit = type === 'DEPOSIT' || tx.direction === 'credit' || (tx.type === 'TRANSFER' && tx.isCredit);
      const amountClass = isCredit ? 'amount-credit' : 'amount-debit';
      const drCrBadge = isCredit ? '<span class="badge badge-success">CR</span>' : '<span class="badge badge-danger">DR</span>';
      const sign = isCredit ? '+' : '-';
      
      let statusBadge = '<span class="badge badge-success">COMPLETED</span>';
      const status = (tx.status || 'COMPLETED').toUpperCase();
      if (status === 'PENDING') {
        statusBadge = '<span class="badge badge-warning">PENDING</span>';
      } else if (status === 'FAILED' || status === 'REJECTED') {
        statusBadge = '<span class="badge badge-danger">FAILED</span>';
      }

      const refNo = tx.referenceId || tx.referenceNumber || tx.id || tx._id || 'TXN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const dateStr = formatDate(tx.createdAt || tx.timestamp || tx.date);

      return `
        <tr>
          <td><code style="font-size: 0.85rem; font-weight: 600;">${escapeHtml(String(refNo).substring(0, 16))}</code></td>
          <td style="white-space: nowrap; font-size: 0.85rem; color: var(--text-light);">${dateStr}</td>
          <td>
            <div style="font-weight: 600;">${escapeHtml(tx.description || `${type} Transaction`)}</div>
            ${tx.beneficiaryAccount ? `<div style="font-size: 0.78rem; color: var(--text-light);">To/From: ${escapeHtml(tx.beneficiaryAccount)}</div>` : ''}
          </td>
          <td><span class="badge badge-secondary">${type}</span></td>
          <td>${drCrBadge}</td>
          <td style="text-align: right;" class="${amountClass}">
            ${sign} ${formatAmount(tx.amount)}
          </td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load recent transactions:', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--error); padding: 20px;">
          Failed to load recent transactions.
        </td>
      </tr>
    `;
  }
}
