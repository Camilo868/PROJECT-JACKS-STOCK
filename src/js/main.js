/**
 * main.js
 * Punto de entrada de la SPA: registra rutas y arranca el router.
 */
import { addRoute, setNotFound, initRouter, navigateTo } from './core/router.js';
import { isAuthenticated } from './core/session.js';

import { renderLoginPage } from './pages/login.page.js';
import { renderRegisterPage } from './pages/register.page.js';
import { renderDashboardPage } from './pages/dashboard.page.js';
import { renderProductsPage } from './pages/products.page.js';
import { renderSuppliersPage } from './pages/suppliers.page.js';
import { renderWarehousesPage } from './pages/warehouses.page.js';
import { renderMovementsPage } from './pages/movements.page.js';
import { renderSemaphorePage } from './pages/semaphore.page.js';
import { renderPurchasesPage } from './pages/purchases.page.js';
import { renderReportsPage } from './pages/reports.page.js';
import { renderSettingsPage } from './pages/settings.page.js';
import { renderNotFoundPage } from './pages/notfound.page.js';

// Public routes
addRoute('/', async () => navigateTo(isAuthenticated() ? '/dashboard' : '/login'));
addRoute('/login', renderLoginPage);
addRoute('/register', renderRegisterPage);

// Private routes
addRoute('/dashboard', renderDashboardPage, { private: true });
addRoute('/products', renderProductsPage, { private: true });
addRoute('/suppliers', renderSuppliersPage, { private: true });
addRoute('/warehouses', renderWarehousesPage, { private: true });
addRoute('/movements', renderMovementsPage, { private: true });
addRoute('/semaphore', renderSemaphorePage, { private: true });
addRoute('/purchases', renderPurchasesPage, { private: true });
addRoute('/reports', renderReportsPage, { private: true });
addRoute('/settings', renderSettingsPage, { private: true });

setNotFound(renderNotFoundPage);

initRouter();
