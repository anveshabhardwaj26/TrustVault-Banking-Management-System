/**
 * TrustVault Banking Management System - Transactions Controller
 * Implements transaction list filtering, pagination, and CSV export
 */

let allTransactions = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation('transactions');

  const user = await checkAuth();
  if (!user) return;

  setupFilters();
  setupExport();
  await loadTransactions();
});

/**
 * Fetch transactions from backend
 */
async function loadTransactions() {
  const tbody = document.getElementById('transactions-table-body');
  const recordCountEl = document.getElementById('record-count');
  
  const typeFilter = document.getElementById('filter-type').value;
  const startDate = document.getElementById('filter-start-date').value;
  const endDate = document.getElementById('filter-end-date').value;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 40px;">
        <div class="spinner spinner-sm"></div> Fetching transaction statement...
      </td>
    </tr>
  `;

  try {
    const res = await API.transactions.getHistory({
      type: typeFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    });

    const list = res.transactions || res.data || (Array.isArray(res) ? res : []);
    allTransactions = Array.isArray(list) ? list : [];

    // Client-side date sorting (newest first)
    allTransactions.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    // Client-side filter fallback if backend didn't filter
    let filtered = allTransactions;
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => (tx.type || '').toLowerCase() === typeFilter.toLowerCase());
    }
    if (startDate) {
      filtered = filtered.filter(tx => new Date(tx.createdAt || tx.date) >= new Date(startDate));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(tx => new Date(tx.createdAt || tx.date) <= endDateTime);
    }

    renderTable(filtered);

    if (recordCountEl) {
      recordCountEl.textContent = `${filtered.length} total records found`;
    }

  } catch (err) {
    console.error('Failed to load transactions:', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--error); padding: 30px;">
          Failed to load transactions: ${escapeHtml(err.message || 'Server error')}
        </td>
      </tr>
    `;
    if (recordCountEl) recordCountEl.textContent = 'Error loading records';
  }
}

/**
 * Render paginated table rows
 */
function renderTable(data) {
  const tbody = document.getElementById('transactions-table-body');
  const paginationInfo = document.getElementById('pagination-info');
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-state-icon">📄</div>
          <div class="empty-state-title">No transactions match your criteria</div>
          <div class="empty-state-text">Try clearing filters or check back later after initiating account activity.</div>
        </td>
      </tr>
    `;
    if (paginationInfo) paginationInfo.textContent = 'No records';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const pageItems = data.slice(startIndex, endIndex);

  tbody.innerHTML = pageItems.map(tx => {
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

    const refNo = tx.referenceId || tx.referenceNumber || tx.id || tx._id || ('TXN-' + Math.random().toString(36).substr(2, 8).toUpperCase());
    const dateStr = formatDate(tx.createdAt || tx.timestamp || tx.date);

    return `
      <tr>
        <td><code style="font-weight: 600; font-size: 0.85rem;">${escapeHtml(String(refNo).substring(0, 16))}</code></td>
        <td style="white-space: nowrap; font-size: 0.85rem; color: var(--text-light);">${dateStr}</td>
        <td><span class="badge badge-secondary">${type}</span></td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(tx.description || `${type} Transaction`)}</div>
          ${tx.beneficiaryAccount ? `<div style="font-size: 0.78rem; color: var(--text-light);">Counterparty: ${escapeHtml(tx.beneficiaryAccount)}</div>` : ''}
        </td>
        <td>${drCrBadge}</td>
        <td style="text-align: right;" class="${amountClass}">
          ${sign} ${formatAmount(tx.amount)}
        </td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');

  if (paginationInfo) {
    paginationInfo.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${data.length} transactions (Page ${currentPage} of ${totalPages})`;
  }

  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable(data);
      }
    };
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable(data);
      }
    };
  }
}

/**
 * Setup filter listeners
 */
function setupFilters() {
  const applyBtn = document.getElementById('apply-filters-btn');
  const resetBtn = document.getElementById('reset-filters-btn');

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      currentPage = 1;
      loadTransactions();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('filter-type').value = 'all';
      document.getElementById('filter-start-date').value = '';
      document.getElementById('filter-end-date').value = '';
      currentPage = 1;
      loadTransactions();
    });
  }
}

/**
 * Setup CSV export function
 */
function setupExport() {
  const exportBtn = document.getElementById('export-csv-btn');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', () => {
    if (!allTransactions || allTransactions.length === 0) {
      showAlert('No transactions available to export.', 'warning');
      return;
    }

    const headers = ['Reference ID', 'Date & Time', 'Type', 'Description', 'Direction', 'Amount (INR)', 'Status'];
    const rows = allTransactions.map(tx => {
      const type = (tx.type || 'TRANSFER').toUpperCase();
      const isCredit = type === 'DEPOSIT' || tx.direction === 'credit' || (tx.type === 'TRANSFER' && tx.isCredit);
      const drCr = isCredit ? 'CR' : 'DR';
      const ref = tx.referenceId || tx.referenceNumber || tx.id || '';
      const date = formatDate(tx.createdAt || tx.date);
      const desc = (tx.description || '').replace(/"/g, '""');
      const amount = tx.amount || 0;
      const status = tx.status || 'COMPLETED';

      return `"${ref}","${date}","${type}","${desc}","${drCr}","${amount}","${status}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TrustVault_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert('Transaction statement exported successfully!', 'success');
  });
}
