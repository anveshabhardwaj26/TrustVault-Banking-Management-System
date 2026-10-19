/**
 * TrustVault Banking Management System - Admin Master Controller
 * Manages Dashboard stats, Customer management, Global Transactions, Loan Decisions, and Financial Reports
 */

let currentAdminUser = null;
let allAdminCustomers = [];
let allAdminTransactions = [];
let allAdminLoans = [];
let reportDataCache = null;

// Pagination state for admin transactions
let adminTxCurrentPage = 1;
const adminTxPerPage = 15;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Guard check: Must be an authenticated administrator
  currentAdminUser = await checkAuth('admin');
  if (!currentAdminUser) return;

  // 2. Identify the active admin page
  const pagePath = window.location.pathname;

  if (pagePath.includes('admin-customers.html')) {
    initNavigation('admin-customers');
    initAdminCustomersPage();
  } else if (pagePath.includes('admin-transactions.html')) {
    initNavigation('admin-transactions');
    initAdminTransactionsPage();
  } else if (pagePath.includes('admin-loans.html')) {
    initNavigation('admin-loans');
    initAdminLoansPage();
  } else if (pagePath.includes('admin-reports.html')) {
    initNavigation('admin-reports');
    initAdminReportsPage();
  } else {
    // Default: admin.html (Dashboard)
    initNavigation('admin-dashboard');
    initAdminDashboardPage();
  }
});

/* ==========================================================================
   1. Admin Dashboard Controller (admin.html)
   ========================================================================== */
async function initAdminDashboardPage() {
  const timestampEl = document.getElementById('admin-time-stamp');
  if (timestampEl) {
    timestampEl.textContent = `Last Synchronized: ${formatDate(new Date())}`;
  }

  try {
    const res = await API.admin.getDashboard();
    const stats = res.stats || res.data || res;

    // Populate stat cards
    const totalCustomersEl = document.getElementById('stat-total-customers');
    const activeAccountsEl = document.getElementById('stat-active-accounts');
    const totalTxnsEl = document.getElementById('stat-total-transactions');
    const pendingLoansEl = document.getElementById('stat-pending-loans');

    if (totalCustomersEl) totalCustomersEl.textContent = stats.totalCustomers !== undefined ? stats.totalCustomers : 0;
    if (activeAccountsEl) activeAccountsEl.textContent = stats.activeAccounts !== undefined ? stats.activeAccounts : 0;
    if (totalTxnsEl) totalTxnsEl.textContent = stats.totalTransactions !== undefined ? stats.totalTransactions : 0;
    if (pendingLoansEl) pendingLoansEl.textContent = stats.pendingLoans !== undefined ? stats.pendingLoans : 0;

    // Load recent transactions
    loadDashboardRecentTransactions();

  } catch (err) {
    console.error('Failed to load admin dashboard stats:', err);
    showAlert('Error fetching admin dashboard statistics', 'error');
  }
}

async function loadDashboardRecentTransactions() {
  const tbody = document.getElementById('admin-recent-txns');
  if (!tbody) return;

  try {
    const res = await API.admin.getTransactions({ limit: 8 });
    const list = res.transactions || res.data || (Array.isArray(res) ? res : []);
    const txns = Array.isArray(list) ? list : [];

    if (txns.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state" style="padding: 24px;">
            <div style="font-weight: 600; color: var(--text-dark);">No platform transactions found</div>
            <div style="font-size: 0.85rem; color: var(--text-light);">Transactions executed by customers will stream here.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = txns.slice(0, 8).map(tx => {
      const type = (tx.type || 'TRANSFER').toUpperCase();
      let statusBadge = '<span class="badge badge-success">COMPLETED</span>';
      const status = (tx.status || 'COMPLETED').toUpperCase();
      if (status === 'PENDING') statusBadge = '<span class="badge badge-warning">PENDING</span>';
      if (status === 'FAILED') statusBadge = '<span class="badge badge-danger">FAILED</span>';

      const refNo = tx.referenceId || tx.referenceNumber || tx.id || 'TXN-LEDGER';
      const acc = tx.sourceAccount || tx.accountNumber || (tx.account && tx.account.accountNumber) || 'Customer Account';

      return `
        <tr>
          <td><code style="font-weight: 600; font-size: 0.85rem;">${escapeHtml(String(refNo).substring(0, 16))}</code></td>
          <td style="font-size: 0.85rem; color: var(--text-light);">${formatDate(tx.createdAt || tx.date)}</td>
          <td><strong>${escapeHtml(acc)}</strong></td>
          <td><span class="badge badge-secondary">${type}</span></td>
          <td style="text-align: right; font-weight: 600;">${formatAmount(tx.amount)}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load recent admin txns:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--error);">Error loading recent transactions</td></tr>`;
  }
}

/* ==========================================================================
   2. Admin Customer Management (admin-customers.html)
   ========================================================================== */
let selectedCustomer = null;

async function initAdminCustomersPage() {
  const searchInput = document.getElementById('customer-search-input');
  const refreshBtn = document.getElementById('refresh-customers-btn');

  await loadAdminCustomers();

  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        filterCustomers(searchInput.value.trim());
      }, 250);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadAdminCustomers());
  }

  setupCustomerModal();
}

async function loadAdminCustomers() {
  const tbody = document.getElementById('customers-table-tbody');
  const countLabel = document.getElementById('customer-count-label');

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px;">
          <div class="spinner spinner-sm"></div> Fetching customers directory...
        </td>
      </tr>
    `;
  }

  try {
    const res = await API.admin.getCustomers();
    const list = res.customers || res.data || (Array.isArray(res) ? res : []);
    allAdminCustomers = Array.isArray(list) ? list : [];

    filterCustomers('');

  } catch (err) {
    console.error('Failed to load customers:', err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--error); padding: 30px;">Error loading customers: ${escapeHtml(err.message)}</td></tr>`;
    }
  }
}

function filterCustomers(searchQuery) {
  const tbody = document.getElementById('customers-table-tbody');
  const countLabel = document.getElementById('customer-count-label');

  let filtered = allAdminCustomers;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = allAdminCustomers.filter(c => {
      const name = (c.fullName || c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const acc = (c.accountNumber || (c.account && c.account.accountNumber) || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || acc.includes(q);
    });
  }

  if (countLabel) {
    countLabel.textContent = `${filtered.length} customers displayed`;
  }

  if (!filtered || filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <div class="empty-state-icon">👥</div>
          <div class="empty-state-title">No customers matched your search</div>
          <div class="empty-state-text">Check your search spelling or clear the query.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const id = c.id || c._id;
    const name = c.fullName || c.name || 'Account Holder';
    const email = c.email || '—';
    const phone = c.phone || '—';
    const accNum = c.accountNumber || (c.account && c.account.accountNumber) || 'TRST-' + String(id).slice(-6);
    const accType = (c.accountType || (c.account && c.account.accountType) || 'Savings').toUpperCase();
    const balance = c.balance !== undefined ? c.balance : (c.account && c.account.balance !== undefined ? c.account.balance : 0);
    const status = (c.status || (c.account && c.account.status) || 'ACTIVE').toUpperCase();

    let statusBadge = '<span class="badge badge-success">ACTIVE</span>';
    if (status === 'FROZEN') statusBadge = '<span class="badge badge-warning">FROZEN</span>';
    if (status === 'BLOCKED') statusBadge = '<span class="badge badge-danger">BLOCKED</span>';

    return `
      <tr>
        <td><strong>${escapeHtml(name)}</strong></td>
        <td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
        <td>+91 ${escapeHtml(phone)}</td>
        <td><code>${escapeHtml(accNum)}</code></td>
        <td><span class="badge badge-secondary">${accType}</span></td>
        <td style="text-align: right; font-weight: 700; color: var(--primary);">${formatAmount(balance)}</td>
        <td>${statusBadge}</td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 6px; justify-content: center;">
            <button class="btn btn-outline btn-sm view-cust-btn" data-id="${id}">Details</button>
            ${status === 'ACTIVE' ? 
              `<button class="btn btn-outline-danger btn-sm quick-block-btn" data-id="${id}" data-action="BLOCKED">Block</button>` : 
              `<button class="btn btn-success btn-sm quick-block-btn" data-id="${id}" data-action="ACTIVE">Unblock</button>`
            }
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Attach button event listeners
  document.querySelectorAll('.view-cust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const custId = btn.getAttribute('data-id');
      const cust = allAdminCustomers.find(item => String(item.id || item._id) === String(custId));
      if (cust) openCustomerModal(cust);
    });
  });

  document.querySelectorAll('.quick-block-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const custId = btn.getAttribute('data-id');
      const targetStatus = btn.getAttribute('data-action');
      const actionName = targetStatus === 'ACTIVE' ? 'unblock' : 'block';

      if (!confirm(`Are you sure you want to ${actionName} this customer?`)) return;

      showLoading(true, `Updating customer status...`);
      try {
        await API.admin.updateCustomerStatus(custId, { status: targetStatus });
        showAlert(`Customer has been ${targetStatus === 'ACTIVE' ? 'activated' : 'restricted'} successfully.`, 'success');
        await loadAdminCustomers();
      } catch (err) {
        showAlert(err.message || 'Status update failed', 'error');
      } finally {
        showLoading(false);
      }
    });
  });
}

function setupCustomerModal() {
  const modal = document.getElementById('customer-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const dismissBtn = document.getElementById('modal-dismiss-btn');
  const saveBtn = document.getElementById('modal-save-status-btn');

  const closeModal = () => modal.classList.remove('active');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!selectedCustomer) return;
      const custId = selectedCustomer.id || selectedCustomer._id;
      const newStatus = document.getElementById('change-status-select').value;

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner spinner-sm"></span> Saving...';

      try {
        await API.admin.updateCustomerStatus(custId, { status: newStatus });
        showAlert('Customer status updated successfully.', 'success');
        closeModal();
        await loadAdminCustomers();
      } catch (err) {
        showAlert(err.message || 'Failed to update status', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save Changes';
      }
    });
  }
}

function openCustomerModal(cust) {
  selectedCustomer = cust;
  const modal = document.getElementById('customer-modal');

  document.getElementById('modal-cust-name').textContent = cust.fullName || cust.name || '—';
  document.getElementById('modal-cust-email').textContent = cust.email || '—';
  document.getElementById('modal-cust-phone').textContent = cust.phone ? `+91 ${cust.phone}` : '—';
  document.getElementById('modal-cust-account').textContent = cust.accountNumber || (cust.account && cust.account.accountNumber) || '—';
  document.getElementById('modal-cust-type').textContent = (cust.accountType || (cust.account && cust.account.accountType) || 'Savings').toUpperCase() + ' ACCOUNT';

  const balance = cust.balance !== undefined ? cust.balance : (cust.account && cust.account.balance !== undefined ? cust.account.balance : 0);
  document.getElementById('modal-cust-balance').textContent = formatAmount(balance);

  const status = (cust.status || (cust.account && cust.account.status) || 'ACTIVE').toUpperCase();
  document.getElementById('modal-cust-status').textContent = status;
  document.getElementById('change-status-select').value = status;

  modal.classList.add('active');
}

/* ==========================================================================
   3. Admin Global Transactions (admin-transactions.html)
   ========================================================================== */
async function initAdminTransactionsPage() {
  const typeFilter = document.getElementById('admin-filter-type');
  const startFilter = document.getElementById('admin-filter-start');
  const endFilter = document.getElementById('admin-filter-end');
  const applyBtn = document.getElementById('admin-apply-tx-filter');
  const resetBtn = document.getElementById('admin-reset-tx-filter');
  const exportBtn = document.getElementById('admin-export-txns-btn');

  await loadAdminTransactions();

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      adminTxCurrentPage = 1;
      loadAdminTransactions();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      typeFilter.value = 'all';
      startFilter.value = '';
      endFilter.value = '';
      adminTxCurrentPage = 1;
      loadAdminTransactions();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportAdminTransactionsCSV);
  }
}

async function loadAdminTransactions() {
  const tbody = document.getElementById('admin-tx-tbody');
  const countLabel = document.getElementById('admin-tx-count');
  const type = document.getElementById('admin-filter-type').value;
  const start = document.getElementById('admin-filter-start').value;
  const end = document.getElementById('admin-filter-end').value;

  tbody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align: center; padding: 40px;">
        <div class="spinner spinner-sm"></div> Fetching platform ledger...
      </td>
    </tr>
  `;

  try {
    const res = await API.admin.getTransactions({
      type: type !== 'all' ? type : undefined,
      startDate: start || undefined,
      endDate: end || undefined
    });

    const list = res.transactions || res.data || (Array.isArray(res) ? res : []);
    allAdminTransactions = Array.isArray(list) ? list : [];

    // Sort newest first
    allAdminTransactions.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    // Client-side filter fallback
    let filtered = allAdminTransactions;
    if (type !== 'all') {
      filtered = filtered.filter(t => (t.type || '').toLowerCase() === type.toLowerCase());
    }
    if (start) {
      filtered = filtered.filter(t => new Date(t.createdAt || t.date) >= new Date(start));
    }
    if (end) {
      const endDt = new Date(end);
      endDt.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.createdAt || t.date) <= endDt);
    }

    if (countLabel) {
      countLabel.textContent = `${filtered.length} total entries`;
    }

    renderAdminTransactionsTable(filtered);

  } catch (err) {
    console.error('Failed to load admin transactions:', err);
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--error); padding: 30px;">Error loading transactions: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderAdminTransactionsTable(txns) {
  const tbody = document.getElementById('admin-tx-tbody');
  const paginationInfo = document.getElementById('admin-tx-pagination-info');
  const prevBtn = document.getElementById('admin-tx-prev');
  const nextBtn = document.getElementById('admin-tx-next');

  if (!txns || txns.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <div class="empty-state-icon">📄</div>
          <div class="empty-state-title">No transactions found</div>
          <div class="empty-state-text">No transactions match the selected filter criteria.</div>
        </td>
      </tr>
    `;
    if (paginationInfo) paginationInfo.textContent = 'No records';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  const totalPages = Math.ceil(txns.length / adminTxPerPage);
  if (adminTxCurrentPage > totalPages) adminTxCurrentPage = totalPages;
  if (adminTxCurrentPage < 1) adminTxCurrentPage = 1;

  const startIdx = (adminTxCurrentPage - 1) * adminTxPerPage;
  const endIdx = Math.min(startIdx + adminTxPerPage, txns.length);
  const pageItems = txns.slice(startIdx, endIdx);

  tbody.innerHTML = pageItems.map(tx => {
    const type = (tx.type || 'TRANSFER').toUpperCase();
    const ref = tx.referenceId || tx.referenceNumber || tx.id || 'TXN-GEN';
    const sourceAcc = tx.sourceAccount || tx.accountNumber || (tx.account && tx.account.accountNumber) || 'Self / System';
    const destAcc = tx.destinationAccount || tx.beneficiaryAccount || tx.toAccount || '—';
    const status = (tx.status || 'COMPLETED').toUpperCase();

    let statusBadge = '<span class="badge badge-success">COMPLETED</span>';
    if (status === 'PENDING') statusBadge = '<span class="badge badge-warning">PENDING</span>';
    if (status === 'FAILED') statusBadge = '<span class="badge badge-danger">FAILED</span>';

    return `
      <tr>
        <td><code>${escapeHtml(String(ref).substring(0, 16))}</code></td>
        <td style="white-space: nowrap; font-size: 0.85rem; color: var(--text-light);">${formatDate(tx.createdAt || tx.date)}</td>
        <td><strong>${escapeHtml(sourceAcc)}</strong></td>
        <td>${escapeHtml(destAcc)}</td>
        <td><span class="badge badge-secondary">${type}</span></td>
        <td style="text-align: right; font-weight: 700;">${formatAmount(tx.amount)}</td>
        <td>${statusBadge}</td>
        <td style="font-size: 0.85rem;">${escapeHtml(tx.description || '—')}</td>
      </tr>
    `;
  }).join('');

  if (paginationInfo) {
    paginationInfo.textContent = `Showing ${startIdx + 1} to ${endIdx} of ${txns.length} entries (Page ${adminTxCurrentPage} of ${totalPages})`;
  }

  if (prevBtn) {
    prevBtn.disabled = adminTxCurrentPage <= 1;
    prevBtn.onclick = () => {
      if (adminTxCurrentPage > 1) {
        adminTxCurrentPage--;
        renderAdminTransactionsTable(txns);
      }
    };
  }

  if (nextBtn) {
    nextBtn.disabled = adminTxCurrentPage >= totalPages;
    nextBtn.onclick = () => {
      if (adminTxCurrentPage < totalPages) {
        adminTxCurrentPage++;
        renderAdminTransactionsTable(txns);
      }
    };
  }
}

function exportAdminTransactionsCSV() {
  if (!allAdminTransactions || allAdminTransactions.length === 0) {
    showAlert('No transactions available to export.', 'warning');
    return;
  }

  const headers = ['Reference ID', 'Date & Time', 'Source Account', 'Beneficiary Account', 'Type', 'Amount (INR)', 'Status', 'Description'];
  const rows = allAdminTransactions.map(tx => {
    const ref = tx.referenceId || tx.referenceNumber || tx.id || '';
    const date = formatDate(tx.createdAt || tx.date);
    const src = tx.sourceAccount || tx.accountNumber || '';
    const dst = tx.destinationAccount || tx.beneficiaryAccount || '';
    const type = (tx.type || 'TRANSFER').toUpperCase();
    const amount = tx.amount || 0;
    const status = tx.status || 'COMPLETED';
    const desc = (tx.description || '').replace(/"/g, '""');

    return `"${ref}","${date}","${src}","${dst}","${type}","${amount}","${status}","${desc}"`;
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `TrustVault_Global_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showAlert('Global transactions exported successfully!', 'success');
}

/* ==========================================================================
   4. Admin Loan Underwriting (admin-loans.html)
   ========================================================================== */
let activeDecisionLoan = null;

async function initAdminLoansPage() {
  const statusFilter = document.getElementById('admin-loan-filter-status');
  const refreshBtn = document.getElementById('refresh-loans-btn');

  await loadAdminLoans();

  if (statusFilter) {
    statusFilter.addEventListener('change', () => filterLoansList(statusFilter.value));
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadAdminLoans());
  }

  setupLoanDecisionModal();
}

async function loadAdminLoans() {
  const tbody = document.getElementById('admin-loans-tbody');
  const countLabel = document.getElementById('admin-loan-count');

  tbody.innerHTML = `
    <tr>
      <td colspan="9" style="text-align: center; padding: 40px;">
        <div class="spinner spinner-sm"></div> Fetching loan underwriting queue...
      </td>
    </tr>
  `;

  try {
    const res = await API.admin.getLoans();
    const list = res.loans || res.data || (Array.isArray(res) ? res : []);
    allAdminLoans = Array.isArray(list) ? list : [];

    // Default filter to currently selected dropdown option
    const statusFilter = document.getElementById('admin-loan-filter-status');
    filterLoansList(statusFilter ? statusFilter.value : 'all');

  } catch (err) {
    console.error('Failed to load loans queue:', err);
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--error); padding: 30px;">Error loading loans queue: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function filterLoansList(statusVal) {
  const tbody = document.getElementById('admin-loans-tbody');
  const countLabel = document.getElementById('admin-loan-count');

  let filtered = allAdminLoans;
  if (statusVal && statusVal !== 'all') {
    filtered = allAdminLoans.filter(l => (l.status || '').toUpperCase() === statusVal.toUpperCase());
  }

  if (countLabel) {
    countLabel.textContent = `${filtered.length} applications matching`;
  }

  if (!filtered || filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">
          <div class="empty-state-icon">📑</div>
          <div class="empty-state-title">No loan applications found</div>
          <div class="empty-state-text">There are currently no credit requests under this category.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(loan => {
    const id = loan.id || loan._id;
    const applicant = loan.applicantName || loan.userName || (loan.user && (loan.user.fullName || loan.user.name)) || (loan.account && loan.account.accountNumber) || 'Applicant';
    const status = (loan.status || 'PENDING').toUpperCase();

    let statusBadge = '<span class="badge badge-warning">PENDING REVIEW</span>';
    if (status === 'APPROVED') statusBadge = '<span class="badge badge-success">APPROVED</span>';
    if (status === 'REJECTED') statusBadge = '<span class="badge badge-danger">REJECTED</span>';

    return `
      <tr>
        <td><strong>${escapeHtml(applicant)}</strong></td>
        <td>${escapeHtml(loan.loanType || 'Personal Loan')}</td>
        <td style="text-align: right; font-weight: 700; color: var(--primary);">${formatAmount(loan.amount)}</td>
        <td>${escapeHtml(String(loan.tenure))} Mo</td>
        <td style="font-size: 0.85rem; color: var(--text-light);">${formatDateOnly(loan.createdAt || loan.appliedDate || loan.date)}</td>
        <td style="font-size: 0.85rem; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(loan.purpose || '')}">
          ${escapeHtml(loan.purpose || '—')}
        </td>
        <td>${statusBadge}</td>
        <td style="font-size: 0.85rem; color: var(--text-dark);">
          ${escapeHtml(loan.decisionNote || loan.adminRemarks || (status === 'PENDING' ? 'Awaiting Underwriting' : '—'))}
        </td>
        <td style="text-align: center;">
          ${status === 'PENDING' ? `
            <div style="display: flex; gap: 6px; justify-content: center;">
              <button class="btn btn-success btn-sm loan-action-btn" data-id="${id}" data-action="APPROVE">Approve</button>
              <button class="btn btn-danger btn-sm loan-action-btn" data-id="${id}" data-action="REJECT">Reject</button>
            </div>
          ` : `
            <span style="font-size: 0.8rem; color: var(--text-light);">Decision Finalized</span>
          `}
        </td>
      </tr>
    `;
  }).join('');

  // Action listeners
  document.querySelectorAll('.loan-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const loanId = btn.getAttribute('data-id');
      const actionType = btn.getAttribute('data-action');
      const targetLoan = allAdminLoans.find(item => String(item.id || item._id) === String(loanId));
      if (targetLoan) openLoanDecisionModal(targetLoan, actionType);
    });
  });
}

function setupLoanDecisionModal() {
  const modal = document.getElementById('loan-decision-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('decision-modal-cancel');
  const approveBtn = document.getElementById('decision-modal-approve-btn');
  const rejectBtn = document.getElementById('decision-modal-reject-btn');
  const noteInput = document.getElementById('decision-note-input');
  const noteError = document.getElementById('decision-note-error');

  const closeModal = () => modal.classList.remove('active');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  const executeDecision = async (decisionStatus) => {
    if (!activeDecisionLoan) return;

    const note = noteInput.value.trim();
    if (!note) {
      noteInput.classList.add('is-invalid');
      if (noteError) noteError.classList.add('visible');
      return;
    }

    const loanId = activeDecisionLoan.id || activeDecisionLoan._id;
    showLoading(true, `Submitting ${decisionStatus} decision...`);

    try {
      await API.admin.decideLoan(loanId, {
        status: decisionStatus,
        decisionNote: note,
        adminRemarks: note
      });

      showAlert(`Loan application has been ${decisionStatus.toLowerCase()} successfully.`, 'success');
      closeModal();
      await loadAdminLoans();

    } catch (err) {
      showAlert(err.message || 'Failed to record loan decision', 'error');
    } finally {
      showLoading(false);
    }
  };

  if (approveBtn) {
    approveBtn.addEventListener('click', () => executeDecision('APPROVED'));
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => executeDecision('REJECTED'));
  }
}

function openLoanDecisionModal(loan, preferredAction) {
  activeDecisionLoan = loan;
  const modal = document.getElementById('loan-decision-modal');
  const noteInput = document.getElementById('decision-note-input');
  const noteError = document.getElementById('decision-note-error');
  const approveBtn = document.getElementById('decision-modal-approve-btn');
  const rejectBtn = document.getElementById('decision-modal-reject-btn');

  noteInput.value = '';
  noteInput.classList.remove('is-invalid');
  if (noteError) noteError.classList.remove('visible');

  const applicant = loan.applicantName || loan.userName || (loan.user && (loan.user.fullName || loan.user.name)) || 'Applicant';
  document.getElementById('modal-loan-applicant').textContent = applicant;
  document.getElementById('modal-loan-type').textContent = loan.loanType || 'Personal Loan';
  document.getElementById('modal-loan-amount').textContent = formatAmount(loan.amount);
  document.getElementById('modal-loan-tenure').textContent = `${loan.tenure} Months`;
  document.getElementById('modal-loan-purpose').textContent = loan.purpose || 'None provided';

  if (preferredAction === 'APPROVE') {
    approveBtn.style.display = 'inline-flex';
    rejectBtn.style.display = 'none';
    noteInput.placeholder = 'e.g. Approved. Verified credit score and income documentation.';
  } else {
    approveBtn.style.display = 'none';
    rejectBtn.style.display = 'inline-flex';
    noteInput.placeholder = 'e.g. Rejected due to insufficient monthly disposable income.';
  }

  modal.classList.add('active');
}

/* ==========================================================================
   5. Admin Financial Reports & Intelligence (admin-reports.html)
   ========================================================================== */
async function initAdminReportsPage() {
  const refreshBtn = document.getElementById('refresh-reports-btn');
  const exportBtn = document.getElementById('export-reports-btn');

  await loadAdminReports();

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadAdminReports());
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportReportsCSV);
  }
}

async function loadAdminReports() {
  const timestampEl = document.getElementById('report-timestamp');
  if (timestampEl) {
    timestampEl.textContent = `Generated on: ${formatDate(new Date())}`;
  }

  try {
    const res = await API.admin.getReports();
    reportDataCache = res.reports || res.data || res;

    // Populate the 6 Summary Cards
    const totalCustomers = reportDataCache.totalCustomers || 0;
    const totalAccounts = reportDataCache.totalAccounts || 0;
    const totalDeposits = reportDataCache.totalDeposits || 0;
    const totalWithdrawals = reportDataCache.totalWithdrawals || 0;
    const successfulTransfers = reportDataCache.totalTransfers || reportDataCache.successfulTransfers || 0;
    const pendingLoans = reportDataCache.pendingLoans || 0;

    document.getElementById('report-total-customers').textContent = totalCustomers;
    document.getElementById('report-total-accounts').textContent = totalAccounts;
    document.getElementById('report-total-deposits').textContent = formatAmount(totalDeposits);
    document.getElementById('report-total-withdrawals').textContent = formatAmount(totalWithdrawals);
    document.getElementById('report-successful-transfers').textContent = successfulTransfers;
    document.getElementById('report-pending-loans').textContent = pendingLoans;

    // Populate Liquidity and Financial Breakdown Table
    const tbody = document.getElementById('report-details-tbody');
    if (tbody) {
      const netLiquidity = Number(totalDeposits) - Number(totalWithdrawals);

      tbody.innerHTML = `
        <tr>
          <td><strong>Total Capital Inflow (Deposits)</strong></td>
          <td style="font-weight: 700; color: var(--success);">${formatAmount(totalDeposits)}</td>
          <td><span class="badge badge-success">Capital Influx</span></td>
        </tr>
        <tr>
          <td><strong>Total Capital Outflow (Withdrawals)</strong></td>
          <td style="font-weight: 700; color: var(--error);">${formatAmount(totalWithdrawals)}</td>
          <td><span class="badge badge-danger">Outflow</span></td>
        </tr>
        <tr>
          <td><strong>Net System Liquidity (Inflow - Outflow)</strong></td>
          <td style="font-weight: 700; color: ${netLiquidity >= 0 ? 'var(--primary)' : 'var(--error)'}; font-size: 1.05rem;">
            ${formatAmount(netLiquidity)}
          </td>
          <td>
            <span class="badge ${netLiquidity >= 0 ? 'badge-success' : 'badge-warning'}">
              ${netLiquidity >= 0 ? 'Healthy Reserve' : 'Deficit Watch'}
            </span>
          </td>
        </tr>
        <tr>
          <td><strong>Registered Customer Base</strong></td>
          <td style="font-weight: 600;">${totalCustomers} Account Holders</td>
          <td><span class="badge badge-info">KYC Verified</span></td>
        </tr>
        <tr>
          <td><strong>Internal Inter-Account Transfers</strong></td>
          <td style="font-weight: 600;">${successfulTransfers} Transactions</td>
          <td><span class="badge badge-secondary">Cleared & Settled</span></td>
        </tr>
        <tr>
          <td><strong>Credit Applications Pending Underwriting</strong></td>
          <td style="font-weight: 600; color: var(--warning);">${pendingLoans} Requests</td>
          <td>
            <span class="badge ${pendingLoans > 0 ? 'badge-warning' : 'badge-success'}">
              ${pendingLoans > 0 ? 'Action Required' : 'Queue Cleared'}
            </span>
          </td>
        </tr>
      `;
    }

  } catch (err) {
    console.error('Failed to load financial reports:', err);
    showAlert('Error loading financial analytics report', 'error');
  }
}

function exportReportsCSV() {
  if (!reportDataCache) {
    showAlert('No report data available to export.', 'warning');
    return;
  }

  const generatedDate = formatDate(new Date());
  const rows = [
    ['TRUSTVAULT EXECUTIVE FINANCIAL REPORT'],
    [`Generated Date`, `"${generatedDate}"`],
    [''],
    ['Metric Category', 'Value (INR / Count)', 'Status Evaluation'],
    ['Total Registered Customers', reportDataCache.totalCustomers || 0, 'Active'],
    ['Total Core Bank Accounts', reportDataCache.totalAccounts || 0, 'Active'],
    ['Total Capital Inflow (Deposits)', reportDataCache.totalDeposits || 0, 'Deposited'],
    ['Total Capital Outflow (Withdrawals)', reportDataCache.totalWithdrawals || 0, 'Disbursed'],
    ['Net Platform Reserve Liquidity', (Number(reportDataCache.totalDeposits || 0) - Number(reportDataCache.totalWithdrawals || 0)), 'Audited'],
    ['Successful Inter-Account Transfers', reportDataCache.totalTransfers || reportDataCache.successfulTransfers || 0, 'Settled'],
    ['Pending Loan Review Requests', reportDataCache.pendingLoans || 0, 'Underwriting Queue']
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `TrustVault_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showAlert('Executive report downloaded as CSV!', 'success');
}
