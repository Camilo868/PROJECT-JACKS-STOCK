/**
 * login.page.js
 */
import { login } from '../services/auth.service.js';
import { navigateTo } from '../core/router.js';
import { validateForm, validators } from '../utils/validators.js';
import { showError } from '../components/toast.js';
import { isAuthenticated } from '../core/session.js';

export async function renderLoginPage(container) {
  if (isAuthenticated()) {
    navigateTo('/dashboard');
    return;
  }

  container.innerHTML = `
    <div class="sw-auth-shell">
      <aside class="sw-auth-aside d-none d-lg-flex">
        <div class="sw-brand text-white">
          <div class="sw-brand-mark"><img src="./src/assets/img/jack.png" alt="Jacks-Stock" style="width:52px; height:42px; object-fit:contain;"></div>
          JACKS STOCKS
        </div>
        <div>
          <h2 class="fw-bold mb-3" style="max-width:420px;">Buy just enough, right on time.</h2>
          <p class="text-white-50" style="max-width:420px;">
            EOQ, ABC classification and reorder point calculated automatically
            so you never run short or overstock.
          </p>
          <div class="sw-auth-stat">
            <i class="bi bi-graph-up-arrow"></i>
            <div>
              <div class="fw-semibold">Automatic ABC classification</div>
              <div class="small text-white-50">Prioritize the products that really move your business.</div>
            </div>
          </div>
          <div class="sw-auth-stat">
            <i class="bi bi-stoplights"></i>
            <div>
              <div class="fw-semibold">Criticality semaphore</div>
              <div class="small text-white-50">Know what to buy first, with clear colors.</div>
            </div>
          </div>
        </div>
        <div class="small text-white-50">CodeUp RIWI · Capstone Project 2026</div>
      </aside>

      <div class="sw-auth-form-side">
        <div class="sw-auth-card">  
          <div class="sw-brand d-lg-none mb-4">
            <div class="sw-brand-mark"><img src="./src/assets/img/jack.png" alt="Jacks-Stock" style="width:52px; height:42px; object-fit:contain;"></div>
            JACKS STOCKS
          </div>
          <h3 class="fw-bold mb-1">Welcome back</h3>
          <p class="text-secondary mb-4">Enter your credentials to access the panel.</p>

          <form id="login-form" novalidate>
            <div class="mb-3">
              <label class="form-label" for="email">Email</label>
              <input type="email" class="form-control form-control-lg" id="email" name="email" placeholder="you@company.com" required>
              <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="password">Password</label>
              <div class="input-group input-group-lg">
                <input type="password" class="form-control" id="password" name="password" placeholder="••••••••" required>
                <button class="btn btn-outline-secondary" type="button" id="toggle-password"><i class="bi bi-eye"></i></button>
              </div>
              <div class="invalid-feedback"></div>
            </div>
            <div class="alert alert-danger d-none" id="login-error"></div>
            <button type="submit" class="btn sw-btn-accent btn-lg w-100 mt-2" id="login-submit">
              Log in
              <span class="spinner-border spinner-border-sm ms-1 d-none" id="login-spinner"></span>
            </button>
          </form>

          <p class="text-center text-secondary mt-4 mb-0">
            Don't have an account? <a href="#/register" class="sw-link">Sign up here</a>
          </p>
        </div>
      </div>
    </div>`;

  const form = container.querySelector('#login-form');
  const errorBox = container.querySelector('#login-error');
  const submitBtn = container.querySelector('#login-submit');
  const spinner = container.querySelector('#login-spinner');

  container.querySelector('#toggle-password').addEventListener('click', () => {
    const input = container.querySelector('#password');
    const icon = container.querySelector('#toggle-password i');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.className = isHidden ? 'bi bi-eye-slash' : 'bi bi-eye';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.classList.add('d-none');

    const data = Object.fromEntries(new FormData(form).entries());
    const { valid, errors } = validateForm(data, {
      email: [validators.required, validators.email],
      password: [validators.required],
    });

    form.classList.add('was-validated');
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
      await login(data.email, data.password);
      navigateTo('/dashboard');
    } catch (error) {
      errorBox.textContent = error.message || 'Could not log in.';
      errorBox.classList.remove('d-none');
      showError(error.message || 'Could not log in.');
    } finally {
      submitBtn.disabled = false;
      spinner.classList.add('d-none');
    }
  });
}
