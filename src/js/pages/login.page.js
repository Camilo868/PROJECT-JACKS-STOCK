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
          JACKS STOCK
        </div>
        <div>
          <h2 class="fw-bold mb-3" style="max-width:420px;">Compra lo justo, en el momento justo.</h2>
          <p class="text-white-50" style="max-width:420px;">
            EOQ, clasificación ABC y punto de reorden calculados automáticamente
            para que nunca te falte ni te sobre inventario.
          </p>
          <div class="sw-auth-stat">
            <i class="bi bi-graph-up-arrow"></i>
            <div>
              <div class="fw-semibold">Clasificación ABC automática</div>
              <div class="small text-white-50">Prioriza los productos que realmente mueven tu negocio.</div>
            </div>
          </div>
          <div class="sw-auth-stat">
            <i class="bi bi-stoplights"></i>
            <div>
              <div class="fw-semibold">Semáforo de criticidad</div>
              <div class="small text-white-50">Sabe qué comprar primero, con colores claros.</div>
            </div>
          </div>
        </div>
        <div class="small text-white-50">CodeUp RIWI · Proyecto Integrador 2026</div>
      </aside>

      <div class="sw-auth-form-side">
        <div class="sw-auth-card">  
          <div class="sw-brand d-lg-none mb-4">
            <div class="sw-brand-mark"><img src="./src/assets/img/jack.png" alt="Jacks-Stock" style="width:52px; height:42px; object-fit:contain;"></div>
            JACKS STOCK
          </div>
          <h3 class="fw-bold mb-1">Bienvenido de nuevo</h3>
          <p class="text-secondary mb-4">Ingresa tus credenciales para acceder al panel.</p>

          <form id="login-form" novalidate>
            <div class="mb-3">
              <label class="form-label" for="email">Correo electrónico</label>
              <input type="email" class="form-control form-control-lg" id="email" name="email" placeholder="admin@stockwise.com" required>
              <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="password">Contraseña</label>
              <div class="input-group input-group-lg">
                <input type="password" class="form-control" id="password" name="password" placeholder="••••••••" required>
                <button class="btn btn-outline-secondary" type="button" id="toggle-password"><i class="bi bi-eye"></i></button>
              </div>
              <div class="invalid-feedback"></div>
            </div>
            <div class="alert alert-danger d-none" id="login-error"></div>
            <button type="submit" class="btn sw-btn-accent btn-lg w-100 mt-2" id="login-submit">
              Iniciar sesión
              <span class="spinner-border spinner-border-sm ms-1 d-none" id="login-spinner"></span>
            </button>
          </form>

          <div class="alert alert-light border mt-3 small mb-3">
            <i class="bi bi-info-circle me-1"></i>
            Cuenta demo: <strong>admin@stockwise.com</strong> / <strong>admin123</strong>
          </div>

          <p class="text-center text-secondary mt-4 mb-0">
            ¿No tienes cuenta? <a href="#/register" class="sw-link">Regístrate aquí</a>
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
      errorBox.textContent = error.message || 'No se pudo iniciar sesión.';
      errorBox.classList.remove('d-none');
      showError(error.message || 'No se pudo iniciar sesión.');
    } finally {
      submitBtn.disabled = false;
      spinner.classList.add('d-none');
    }
  });
}
