/**
 * TrustVault Banking Management System - Authentication Logic
 * Handles Login, Registration, Validation, and Password Strength
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is already logged in
  await checkExistingSession();

  // Initialize specific form based on presence in DOM
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    initLoginForm();
  }

  if (registerForm) {
    initRegisterForm();
  }

  // Setup password visibility toggles
  setupPasswordToggles();

  // Check URL query parameters for notifications (e.g., ?registered=true)
  checkUrlParams();
});

/**
 * If user already has an active session, redirect to the right dashboard
 */
async function checkExistingSession() {
  try {
    const res = await API.auth.me();
    const user = res.user || res.data || res;
    if (user && user.role) {
      if (user.role === 'admin') {
        window.location.href = '/admin.html';
      } else {
        window.location.href = '/dashboard.html';
      }
    }
  } catch (err) {
    // Not logged in, stay on auth page
  }
}

/**
 * Check query parameters to show feedback banners
 */
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    showAlert('Account created successfully! Please sign in with your credentials.', 'success', 6000);
    const alertBox = document.getElementById('login-alert');
    if (alertBox) {
      alertBox.className = 'inline-alert inline-alert-success';
      const msg = document.getElementById('login-alert-message');
      if (msg) msg.textContent = 'Account created successfully! Please sign in.';
      alertBox.style.display = 'flex';
    }
  }
  if (urlParams.get('session') === 'expired') {
    showAlert('Your session has expired. Please sign in again.', 'warning');
  }
}

/**
 * Setup Show/Hide Password buttons
 */
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.password-wrapper');
      const input = wrapper ? wrapper.querySelector('input') : null;
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
        btn.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        btn.textContent = 'Show';
        btn.setAttribute('aria-label', 'Show password');
      }
    });
  });
}

/**
 * Handle Login Form Logic
 */
function initLoginForm() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const alertBox = document.getElementById('login-alert');
  const alertMsg = document.getElementById('login-alert-message');
  const submitBtn = document.getElementById('login-btn');

  // Clear errors on input
  emailInput.addEventListener('input', () => {
    emailInput.classList.remove('is-invalid');
    emailError.classList.remove('visible');
    if (alertBox) alertBox.style.display = 'none';
  });

  passwordInput.addEventListener('input', () => {
    passwordInput.classList.remove('is-invalid');
    passwordError.classList.remove('visible');
    if (alertBox) alertBox.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      emailInput.classList.add('is-invalid');
      emailError.classList.add('visible');
      isValid = false;
    }

    // Validate password
    if (!password) {
      passwordInput.classList.add('is-invalid');
      passwordError.classList.add('visible');
      isValid = false;
    }

    if (!isValid) return;

    // Disable button to prevent duplicate submissions
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Signing In...';
    showLoading(true, 'Verifying your credentials...');

    try {
      const response = await API.auth.login({ email, password });
      const user = response.user || response.data || response;
      showAlert('Signed in successfully!', 'success');

      // Role-based routing
      setTimeout(() => {
        if (user && user.role === 'admin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/dashboard.html';
        }
      }, 500);

    } catch (err) {
      showLoading(false);
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign In';

      const errorText = err.message || 'Login failed. Please check your credentials.';
      if (alertBox && alertMsg) {
        alertMsg.textContent = errorText;
        alertBox.className = 'inline-alert inline-alert-error';
        alertBox.style.display = 'flex';
      }
      showAlert(errorText, 'error');
    }
  });
}

/**
 * Handle Registration Form Logic
 */
function initRegisterForm() {
  const form = document.getElementById('register-form');
  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  const nameError = document.getElementById('fullName-error');
  const emailError = document.getElementById('email-error');
  const phoneError = document.getElementById('phone-error');
  const passwordError = document.getElementById('password-error');
  const confirmPasswordError = document.getElementById('confirmPassword-error');

  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const alertBox = document.getElementById('register-alert');
  const alertMsg = document.getElementById('register-alert-message');
  const submitBtn = document.getElementById('register-btn');

  // Password strength calculator
  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    const score = calculatePasswordStrength(val);

    if (val.length === 0) {
      strengthBar.style.width = '0%';
      strengthBar.style.backgroundColor = 'transparent';
      strengthText.textContent = 'Password strength';
      return;
    }

    if (score < 40) {
      strengthBar.style.width = '30%';
      strengthBar.style.backgroundColor = 'var(--error)';
      strengthText.textContent = 'Password strength: Weak';
      strengthText.style.color = 'var(--error)';
    } else if (score < 75) {
      strengthBar.style.width = '65%';
      strengthBar.style.backgroundColor = 'var(--warning)';
      strengthText.textContent = 'Password strength: Fair';
      strengthText.style.color = 'var(--warning)';
    } else {
      strengthBar.style.width = '100%';
      strengthBar.style.backgroundColor = 'var(--success)';
      strengthText.textContent = 'Password strength: Strong';
      strengthText.style.color = 'var(--success)';
    }
  });

  // Real-time phone number formatting: restrict to digits only
  phoneInput.addEventListener('input', (e) => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
  });

  // Clear validation styling on focus/input
  [nameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      if (alertBox) alertBox.style.display = 'none';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Full name check
    if (!fullName || fullName.length < 3) {
      nameInput.classList.add('is-invalid');
      nameError.classList.add('visible');
      isValid = false;
    } else {
      nameError.classList.remove('visible');
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      emailInput.classList.add('is-invalid');
      emailError.classList.add('visible');
      isValid = false;
    } else {
      emailError.classList.remove('visible');
    }

    // Phone check (10 digits starting with 6, 7, 8, or 9 for Indian mobile numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      phoneInput.classList.add('is-invalid');
      phoneError.classList.add('visible');
      isValid = false;
    } else {
      phoneError.classList.remove('visible');
    }

    // Password check (min 8 chars, at least 1 letter and 1 digit)
    if (!password || password.length < 8) {
      passwordInput.classList.add('is-invalid');
      passwordError.classList.add('visible');
      isValid = false;
    } else {
      passwordError.classList.remove('visible');
    }

    // Confirm password check
    if (password !== confirmPassword) {
      confirmPasswordInput.classList.add('is-invalid');
      confirmPasswordError.classList.add('visible');
      isValid = false;
    } else {
      confirmPasswordError.classList.remove('visible');
    }

    if (!isValid) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Creating Account...';
    showLoading(true, 'Setting up your TrustVault account...');

    try {
      await API.auth.register({
    full_name: fullName,
    email: email,
    phone: phone,
    password: password
});

      showLoading(false);
      showAlert('Account created successfully! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = '/index.html?registered=true';
      }, 1000);

    } catch (err) {
      showLoading(false);
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Create Account';

      const errorText = err.message || 'Registration failed. Please check your information.';
      if (alertBox && alertMsg) {
        alertMsg.textContent = errorText;
        alertBox.className = 'inline-alert inline-alert-error';
        alertBox.style.display = 'flex';
      }
      showAlert(errorText, 'error');
    }
  });
}

/**
 * Calculate password complexity score (0-100)
 */
function calculatePasswordStrength(pass) {
  let score = 0;
  if (!pass) return score;

  if (pass.length >= 8) score += 30;
  if (pass.length >= 12) score += 15;
  if (/[A-Z]/.test(pass)) score += 15;
  if (/[a-z]/.test(pass)) score += 10;
  if (/[0-9]/.test(pass)) score += 15;
  if (/[^A-Za-z0-9]/.test(pass)) score += 15;

  return Math.min(score, 100);
}
