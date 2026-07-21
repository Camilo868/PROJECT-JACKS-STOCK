/**
 * register.page.js
 */
import { register } from '../services/auth.service.js';
import { navigateTo } from '../core/router.js';
import { validateForm, validators } from '../utils/validators.js';
import { showError } from '../components/toast.js';
import { isAuthenticated } from '../core/session.js';

export async function renderRegisterPage(container) {
  if (isAuthenticated()) {
    navigateTo('/dashboard');
    return;
  }

  container.innerHTML = `
    <div class="sw-auth-shell">
      <aside class="sw-auth-aside d-none d-lg-flex">
        <div class="sw-brand text-white">
          <div class="sw-brand-mark"><i class="bi bi-boxes"></i></div>
         JACKS STOCKS
        </div>
        <div>
          <h2 class="fw-bold mb-3" style="max-width:420px;">Create your warehouse manager account.</h2>
          <p class="text-white-50" style="max-width:420px;">
            Register your catalog, track your movements and let the system
            calculate how much and when to buy.
          </p>
        </div>
        <div class="small text-white-50">CodeUp RIWI · Capstone Project 2026</div>
      </aside>

      <div class="sw-auth-form-side">
        <div class="sw-auth-card">
          <div class="sw-brand d-lg-none mb-4">
            <div class="sw-brand-mark"><i class="bi bi-boxes"></i></div>
            JACKS STOCKS
          </div>
          <h3 class="fw-bold mb-1">Create your account</h3>
          <p class="text-secondary mb-4">Start managing your inventory in minutes.</p>

          <form id="register-form" novalidate>
            <div class="row g-2">
              <div class="col-6 mb-3">
                <label class="form-label" for="name">First name</label>
                <input type="text" class="form-control form-control-lg" id="name" name="name" placeholder="First name" required>
                <div class="invalid-feedback"></div>
              </div>
              <div class="col-6 mb-3">
                <label class="form-label" for="lastName">Last name</label>
                <input type="text" class="form-control form-control-lg" id="lastName" name="lastName" placeholder="Last name" required>
                <div class="invalid-feedback"></div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="email">Email</label>
              <input type="email" class="form-control form-control-lg" id="email" name="email" placeholder="you@company.com" required>
              <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="password">Password</label>
              <input type="password" class="form-control form-control-lg" id="password" name="password" placeholder="At least 6 characters" required>
              <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="confirmPassword">Confirm password</label>
              <input type="password" class="form-control form-control-lg" id="confirmPassword" name="confirmPassword" placeholder="Repeat your password" required>
              <div class="invalid-feedback"></div>
            </div>
            <div class="alert alert-danger d-none" id="register-error"></div>
            <button type="submit" class="btn sw-btn-accent btn-lg w-100 mt-2" id="register-submit">
              Create account
              <span class="spinner-border spinner-border-sm ms-1 d-none" id="register-spinner"></span>
            </button>
          </form>

          <p class="text-center text-secondary mt-4 mb-0">
            Already have an account? <a href="#/login" class="sw-link">Log in</a>
          </p>
        </div>
      </div>
    </div>`;

  const form = container.querySelector('#register-form');
  const errorBox = container.querySelector('#register-error');
  const submitBtn = container.querySelector('#register-submit');
  const spinner = container.querySelector('#register-spinner');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.classList.add('d-none');

    const data = Object.fromEntries(new FormData(form).entries());
    const { valid, errors } = validateForm(data, {
      name: [validators.required],
      lastName: [validators.required],
      email: [validators.required, validators.email],
      password: [validators.required, validators.minLength(6)],
      confirmPassword: [validators.required, validators.match(data.password, 'Passwords do not match.')],
    });

    form.querySelectorAll('.form-control').forEach((input) => {
      const err = errors[input.name];
      input.classList.toggle('is-invalid', Boolean(err));
      const feedback = input.closest('.mb-3')?.querySelector('.invalid-feedback');
      if (feedback && err) feedback.textContent = err;
    });

    if (!valid) return;

    submitBtn.disabled = true;
    spinner.classList.remove('d-none');

    try {
      await register(data.name, data.lastName, data.email, data.password);
      navigateTo('/dashboard');
    } catch (error) {
      errorBox.textContent = error.message || 'Could not create the account.';
      errorBox.classList.remove('d-none');
      showError(error.message || 'Could not create the account.');
    } finally {
      submitBtn.disabled = false;
      spinner.classList.add('d-none');
    }
  });
}
