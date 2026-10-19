/**
 * TrustVault Banking Management System - Centralized API Module
 * Provides unified request handling, endpoints, and utility functions
 */

const API = {
  BASE: '/api',

  /**
   * Core request dispatcher using Fetch API
   */
  async request(method, endpoint, body = null) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const headers = {
      'Accept': 'application/json'
    };

    if (body !== null && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      method,
      headers,
      credentials: 'include' // Always send cookies for session auth
    };

    if (body !== null) {
      config.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.endsWith('index.html') || 
                           currentPath.endsWith('register.html') || 
                           currentPath === '/' || 
                           currentPath.endsWith('/');
        if (!isAuthPage) {
          window.location.href = '/index.html';
        }
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Session expired. Please log in again.' };
        }
        throw new Error(errorData.message || 'Unauthorized');
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        const currentPath = window.location.pathname;
        if (!currentPath.endsWith('access-denied.html')) {
          window.location.href = '/access-denied.html';
        }
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Access denied.' };
        }
        throw new Error(errorData.message || 'Forbidden');
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const errorMessage = (data && (data.message || data.error)) || `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (err) {
      console.error(`API ${method} ${endpoint} failed:`, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request('GET', endpoint);
  },

  post(endpoint, body) {
    return this.request('POST', endpoint, body);
  },

  patch(endpoint, body) {
    return this.request('PATCH', endpoint, body);
  },

  put(endpoint, body) {
    return this.request('PUT', endpoint, body);
  },

  delete(endpoint) {
    return this.request('DELETE', endpoint);
  },

  // ==========================================
  // Authentication Endpoints
  // ==========================================
  auth: {
    register(data) {
      return API.post('/auth/register', data);
    },
    login(data) {
      return API.post('/auth/login', data);
    },
    logout() {
      return API.post('/auth/logout', {});
    },
    me() {
      return API.get('/auth/me');
    }
  },

  // ==========================================
  // Account Endpoints
  // ==========================================
  accounts: {
    getMyAccount() {
      return API.get('/accounts/me');
    },
    getBalance() {
      return API.get('/accounts/balance');
    },
    lookup(accountNumber) {
      return API.get(`/accounts/lookup/${encodeURIComponent(accountNumber)}`);
    }
  },

  // ==========================================
  // Transaction Endpoints
  // ==========================================
  transactions: {
    deposit(data) {
      return API.post('/transactions/deposit', data);
    },
    withdraw(data) {
      return API.post('/transactions/withdraw', data);
    },
    transfer(data) {
      return API.post('/transactions/transfer', data);
    },
    getHistory(params = {}) {
      const query = new URLSearchParams();
      if (params.type && params.type !== 'all') query.append('type', params.type);
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      const queryString = query.toString();
      return API.get(`/transactions${queryString ? `?${queryString}` : ''}`);
    }
  },

  // ==========================================
  // Loan Endpoints
  // ==========================================
  loans: {
    apply(data) {
      return API.post('/loans/apply', data);
    },
    getMyLoans() {
      return API.get('/loans/my-loans');
    },
    getById(id) {
      return API.get(`/loans/${id}`);
    }
  },

  // ==========================================
  // Admin Endpoints
  // ==========================================
  admin: {
    getDashboard() {
      return API.get('/admin/dashboard');
    },
    getCustomers(search = '') {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return API.get(`/admin/customers${query}`);
    },
    updateCustomerStatus(id, data) {
      return API.patch(`/admin/customers/${id}/status`, data);
    },
    getTransactions(params = {}) {
      const query = new URLSearchParams();
      if (params.type && params.type !== 'all') query.append('type', params.type);
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      const queryString = query.toString();
      return API.get(`/admin/transactions${queryString ? `?${queryString}` : ''}`);
    },
    getLoans(params = {}) {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'all') query.append('status', params.status);
      const queryString = query.toString();
      return API.get(`/admin/loans${queryString ? `?${queryString}` : ''}`);
    },
    decideLoan(id, data) {
      return API.patch(`/admin/loans/${id}`, data);
    },
    getReports() {
      return API.get('/admin/reports');
    }
  }
};

// ==========================================================================
// Formatting & UI Utility Functions
// ==========================================================================

/**
 * Format currency in Indian Rupees format (e.g. ₹1,23,456.78)
 * @param {number|string} amount 
 * @param {boolean} isPaise If true, divides amount by 100
 */
function formatAmount(amount, isPaise = false) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }
  let val = Number(amount);
  if (isPaise) {
    val = val / 100;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

/**
 * Format date string or timestamp nicely in Indian locale
 */
function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return String(timestamp);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format date only (YYYY-MM-DD or DD Mon YYYY)
 */
function formatDateOnly(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return String(timestamp);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Display toast alert message at top right
 * @param {string} message 
 * @param {'success'|'error'|'warning'|'info'} type 
 * @param {number} duration milliseconds
 */
function showAlert(message, type = 'info', duration = 4000) {
  let container = document.getElementById('global-alert-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-alert-container';
    container.className = 'alert-container';
    document.body.appendChild(container);
  }

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.setAttribute('role', 'alert');

  let icon = 'ℹ️';
  if (type === 'success') icon = '✓';
  if (type === 'error') icon = '✕';
  if (type === 'warning') icon = '⚠';

  alert.innerHTML = `
    <span style="font-weight: bold; margin-right: 6px;">${icon}</span>
    <div class="alert-message">${escapeHtml(message)}</div>
    <button type="button" class="alert-close" aria-label="Close">&times;</button>
  `;

  container.appendChild(alert);

  const closeBtn = alert.querySelector('.alert-close');
  const removeAlert = () => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(100%)';
    alert.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (alert.parentElement) {
        alert.remove();
      }
    }, 300);
  };

  closeBtn.addEventListener('click', removeAlert);

  if (duration > 0) {
    setTimeout(removeAlert, duration);
  }
}

/**
 * Show or hide full-screen loading spinner
 */
function showLoading(show = true, message = 'Processing...') {
  let overlay = document.getElementById('global-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'global-loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="spinner"></div>
      <div class="loading-text" id="global-loading-text">Loading...</div>
    `;
    document.body.appendChild(overlay);
  }

  const textEl = document.getElementById('global-loading-text');
  if (textEl && message) {
    textEl.textContent = message;
  }

  if (show) {
    overlay.classList.add('active');
  } else {
    overlay.classList.remove('active');
  }
}

/**
 * Helper to escape HTML characters safely
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Initialize common sidebar, navigation, and user header
 */
function initNavigation(activePageId) {
  // Mark active link in sidebar
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(link => {
    if (link.getAttribute('data-page') === activePageId || link.getAttribute('href') === activePageId) {
      link.classList.add('active');
    }
  });

  // Mobile sidebar toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('active');
    });
  }

  if (backdrop && sidebar) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('active');
    });
  }

  // Logout button handler
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        showLoading(true, 'Logging out...');
        await API.auth.logout();
      } catch (err) {
        console.warn('Logout API error:', err);
      } finally {
        showLoading(false);
        window.location.href = '/index.html';
      }
    });
  });
}

/**
 * Auth check helper for protected pages
 * Redirects to /index.html if unauthenticated,
 * or to /access-denied.html if admin role is required but user is not admin
 */
async function checkAuth(requiredRole = null) {
  try {
    const userRes = await API.auth.me();
    const user = userRes.user || userRes.data || userRes;
    
    if (requiredRole === 'admin' && user.role !== 'admin') {
      window.location.href = '/access-denied.html';
      return null;
    }

    // Populate user info in navbar if elements exist
    const userNameEls = document.querySelectorAll('.user-name-display');
    const userAvatarEls = document.querySelectorAll('.user-avatar');
    const userRoleEls = document.querySelectorAll('.user-role-display');

    userNameEls.forEach(el => {
      el.textContent = user.fullName || user.name || user.email || 'Customer';
    });

    userRoleEls.forEach(el => {
      el.textContent = user.role === 'admin' ? 'Administrator' : 'Customer Account';
    });

    userAvatarEls.forEach(el => {
      const name = user.fullName || user.name || user.email || 'U';
      el.textContent = name.charAt(0).toUpperCase();
    });

    return user;
  } catch (err) {
    window.location.href = '/index.html';
    return null;
  }
}
