/**
 * TrustVault Banking Management System - Loans Controller
 * Handles loan application, real-time EMI calculation, and loan status cards
 */

document.addEventListener('DOMContentLoaded', async () => {
  const isApplicationPage = !!document.getElementById('loan-form');
  const isStatusPage = !!document.getElementById('loan-cards-container');

  if (isApplicationPage) {
    initNavigation('loans');
  } else if (isStatusPage) {
    initNavigation('loan-status');
  }

  const user = await checkAuth();
  if (!user) return;

  if (isApplicationPage) {
    setupLoanApplication();
    setupEmiCalculator();
    loadRecentLoansTable();
  }

  if (isStatusPage) {
    loadLoanStatusCards();
  }
});

/**
 * Setup EMI Calculator on application page
 */
function setupEmiCalculator() {
  const loanTypeSelect = document.getElementById('loanType');
  const amountInput = document.getElementById('amount');
  const tenureSelect = document.getElementById('tenure');

  const calcEmiEl = document.getElementById('calc-emi');
  const calcPrincipalEl = document.getElementById('calc-principal');
  const calcRateEl = document.getElementById('calc-rate');
  const calcInterestEl = document.getElementById('calc-total-interest');
  const calcPayableEl = document.getElementById('calc-total-payable');

  const updateCalculation = () => {
    const selectedOption = loanTypeSelect.options[loanTypeSelect.selectedIndex];
    const annualRate = parseFloat(selectedOption.getAttribute('data-rate')) || 10.5;
    const principal = parseFloat(amountInput.value) || 0;
    const months = parseInt(tenureSelect.value, 10) || 12;

    if (calcRateEl) calcRateEl.textContent = `${annualRate.toFixed(2)}% p.a.`;
    if (calcPrincipalEl) calcPrincipalEl.textContent = formatAmount(principal);

    if (principal <= 0 || months <= 0) {
      if (calcEmiEl) calcEmiEl.textContent = '₹0.00';
      if (calcInterestEl) calcInterestEl.textContent = '₹0.00';
      if (calcPayableEl) calcPayableEl.textContent = '₹0.00';
      return;
    }

    // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyRate = annualRate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayable = emi * months;
    const totalInterest = totalPayable - principal;

    if (calcEmiEl) calcEmiEl.textContent = formatAmount(Math.round(emi));
    if (calcInterestEl) calcInterestEl.textContent = formatAmount(Math.round(totalInterest));
    if (calcPayableEl) calcPayableEl.textContent = formatAmount(Math.round(totalPayable));
  };

  loanTypeSelect.addEventListener('change', updateCalculation);
  amountInput.addEventListener('input', updateCalculation);
  tenureSelect.addEventListener('change', updateCalculation);

  // Initial calculation
  updateCalculation();
}

/**
 * Setup Loan Application Form Submission
 */
function setupLoanApplication() {
  const form = document.getElementById('loan-form');
  const loanTypeSelect = document.getElementById('loanType');
  const amountInput = document.getElementById('amount');
  const tenureSelect = document.getElementById('tenure');
  const purposeInput = document.getElementById('purpose');

  const amountError = document.getElementById('amount-error');
  const purposeError = document.getElementById('purpose-error');
  const errorBox = document.getElementById('loan-error-box');
  const errorMsg = document.getElementById('loan-error-msg');
  const submitBtn = document.getElementById('submit-loan-btn');

  amountInput.addEventListener('input', () => {
    amountInput.classList.remove('is-invalid');
    amountError.classList.remove('visible');
    if (errorBox) errorBox.style.display = 'none';
  });

  purposeInput.addEventListener('input', () => {
    purposeInput.classList.remove('is-invalid');
    purposeError.classList.remove('visible');
    if (errorBox) errorBox.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const loanType = loanTypeSelect.value;
    const amountVal = parseFloat(amountInput.value);
    const tenureMonths = parseInt(tenureSelect.value, 10);
    const purpose = purposeInput.value.trim();

    let isValid = true;

    if (isNaN(amountVal) || amountVal < 10000 || amountVal > 10000000) {
      amountInput.classList.add('is-invalid');
      amountError.classList.add('visible');
      isValid = false;
    }

    if (!purpose) {
      purposeInput.classList.add('is-invalid');
      purposeError.classList.add('visible');
      isValid = false;
    }

    if (!isValid) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Submitting Application...';
    showLoading(true, 'Submitting your loan application...');

    try {
      await API.loans.apply({
        loanType,
        amount: amountVal,
        tenure: tenureMonths,
        purpose
      });

      showLoading(false);
      showAlert('Loan application submitted successfully! It is now pending bank review.', 'success');
      form.reset();

      // Trigger recalculation with defaults
      loanTypeSelect.selectedIndex = 1;
      amountInput.value = '100000';
      tenureSelect.selectedIndex = 2;
      const event = new Event('change');
      loanTypeSelect.dispatchEvent(event);

      // Refresh applications table
      loadRecentLoansTable();

    } catch (err) {
      showLoading(false);
      if (errorBox && errorMsg) {
        errorMsg.textContent = err.message || 'Failed to submit loan application. Please try again.';
        errorBox.style.display = 'flex';
      }
      showAlert(err.message || 'Application failed', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit Loan Application';
    }
  });
}

/**
 * Load customer's recent applications table on application page
 */
async function loadRecentLoansTable() {
  const tbody = document.getElementById('my-loans-table-body');
  if (!tbody) return;

  try {
    const res = await API.loans.getMyLoans();
    const loans = res.loans || res.data || (Array.isArray(res) ? res : []);

    if (!loans || loans.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state" style="padding: 24px;">
            <div style="font-weight: 600; color: var(--text-dark);">No loan applications found</div>
            <div style="font-size: 0.85rem; color: var(--text-light);">Apply using the form above to see your status here.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = loans.map(loan => {
      const status = (loan.status || 'PENDING').toUpperCase();
      let statusBadge = '<span class="badge badge-warning">PENDING</span>';
      if (status === 'APPROVED') statusBadge = '<span class="badge badge-success">APPROVED</span>';
      if (status === 'REJECTED') statusBadge = '<span class="badge badge-danger">REJECTED</span>';

      return `
        <tr>
          <td><strong>${escapeHtml(loan.loanType || 'Personal Loan')}</strong></td>
          <td style="font-weight: 600; color: var(--primary);">${formatAmount(loan.amount)}</td>
          <td>${escapeHtml(String(loan.tenure))} Months</td>
          <td style="color: var(--text-light); font-size: 0.85rem;">${formatDateOnly(loan.createdAt || loan.appliedDate || loan.date)}</td>
          <td>${statusBadge}</td>
          <td style="font-size: 0.85rem; color: var(--text-dark);">${escapeHtml(loan.decisionNote || loan.adminRemarks || loan.remarks || 'Under evaluation')}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load loans table:', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--error); padding: 20px;">
          Failed to load recent loans.
        </td>
      </tr>
    `;
  }
}

/**
 * Load loan status cards on loan-status.html
 */
async function loadLoanStatusCards() {
  const container = document.getElementById('loan-cards-container');
  if (!container) return;

  try {
    const res = await API.loans.getMyLoans();
    const loans = res.loans || res.data || (Array.isArray(res) ? res : []);

    if (!loans || loans.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1;" class="card">
          <div class="card-body empty-state">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-title">No Loan Applications</div>
            <div class="empty-state-text">You have not submitted any loan applications yet. Explore our low-rate loan products today!</div>
            <a href="/loans.html" class="btn btn-primary">Apply For A Loan</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = loans.map(loan => {
      const status = (loan.status || 'PENDING').toUpperCase();
      let statusBadge = '<span class="badge badge-warning">● EVALUATION PENDING</span>';
      let borderHighlight = 'border-top: 4px solid var(--warning);';
      let headerIcon = '⏳';

      if (status === 'APPROVED') {
        statusBadge = '<span class="badge badge-success">✓ APPROVED</span>';
        borderHighlight = 'border-top: 4px solid var(--success);';
        headerIcon = '🎉';
      } else if (status === 'REJECTED') {
        statusBadge = '<span class="badge badge-danger">✕ REJECTED</span>';
        borderHighlight = 'border-top: 4px solid var(--error);';
        headerIcon = '❌';
      }

      return `
        <div class="card" style="${borderHighlight}">
          <div class="card-header" style="background-color: transparent;">
            <div>
              <h3 class="card-title">${headerIcon} ${escapeHtml(loan.loanType || 'Personal Loan')}</h3>
              <div style="font-size: 0.78rem; color: var(--text-light); margin-top: 2px;">
                Application ID: ${escapeHtml(String(loan.id || loan._id || 'N/A').substring(0, 10))}
              </div>
            </div>
            ${statusBadge}
          </div>
          <div class="card-body">
            <div style="margin-bottom: 16px;">
              <div style="font-size: 0.8rem; color: var(--text-light); text-transform: uppercase;">Requested Amount</div>
              <div style="font-size: 1.6rem; font-weight: 700; color: var(--primary);">${formatAmount(loan.amount)}</div>
            </div>

            <div class="summary-box" style="padding: 12px; margin-bottom: 14px; font-size: 0.88rem;">
              <div class="summary-row" style="padding: 6px 0;">
                <span class="summary-label">Tenure:</span>
                <span class="summary-value">${escapeHtml(String(loan.tenure))} Months</span>
              </div>
              <div class="summary-row" style="padding: 6px 0;">
                <span class="summary-label">Applied Date:</span>
                <span class="summary-value">${formatDate(loan.createdAt || loan.appliedDate || loan.date)}</span>
              </div>
              <div class="summary-row" style="padding: 6px 0;">
                <span class="summary-label">Purpose:</span>
                <span class="summary-value">${escapeHtml(loan.purpose || 'General Financing')}</span>
              </div>
            </div>

            ${loan.decisionNote || loan.adminRemarks ? `
              <div style="background-color: #fafbfc; border-left: 3px solid var(--primary); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.85rem;">
                <strong>Bank Decision Note:</strong><br>
                ${escapeHtml(loan.decisionNote || loan.adminRemarks)}
              </div>
            ` : `
              <div style="font-size: 0.82rem; color: var(--text-light); font-style: italic;">
                Your application is currently being evaluated by our credit management team.
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load loan status cards:', err);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--error); padding: 30px;">
        Failed to load loan application cards.
      </div>
    `;
  }
}
