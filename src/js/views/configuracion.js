// ============================================================
// VISTA: CONFIGURACIÓN
// Es una sola página larga (scroll), con un mini-menú a la
// izquierda que apunta a cada sección (ver nota "PENDIENTE" al final).
//
// DECISIÓN: los switches on/off son 100% CSS (checkbox oculto +
// la clase "peer" de Tailwind), no JavaScript, porque así el
// compañero de lógica solo necesita leer el estado del checkbox
// al guardar el formulario — no depende de que él conecte nada
// para que el switch se vea y se mueva correctamente.
// ============================================================
import { ICONS } from '../icons.js';

// Cada switch de notificación se genera con esta función para no
// repetir el mismo bloque de HTML 4 veces.
function switchNotificacion(titulo, descripcion, activadoPorDefecto) {
  return `
    <div class="flex items-start justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
      <div>
        <p class="text-sm font-medium text-slate-800">${titulo}</p>
        <p class="text-xs text-slate-400 mt-0.5">${descripcion}</p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer shrink-0">
        <input type="checkbox" class="sr-only peer" ${activadoPorDefecto ? 'checked' : ''}>
        <div class="w-11 h-6 bg-slate-200 rounded-full peer
                    peer-checked:bg-blue-900
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:rounded-full after:h-5 after:w-5
                    after:transition-all peer-checked:after:translate-x-5"></div>
      </label>
    </div>
  `;
}

// Tarjeta de selección de tema (Claro/Automático/Oscuro).
function tarjetaTema(nombre, previewClass, activo) {
  return `
    <button class="tema-btn flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition
                    ${activo ? 'border-blue-900' : 'border-slate-200 hover:border-slate-300'}">
      <div class="w-full h-16 rounded-lg ${previewClass}"></div>
      <div class="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        ${nombre}
        ${activo ? '<span class="text-blue-900">✓</span>' : ''}
      </div>
    </button>
  `;
}

export function renderConfiguracion() {
  return `
    <div class="mb-6">
      <p class="text-[11px] uppercase tracking-widest text-slate-400 font-medium mb-1">Ajustes</p>
      <h1 class="text-2xl font-bold text-slate-900">Configuración</h1>
      <p class="text-sm text-slate-400 mt-1">Administra tu cuenta, empresa y preferencias del sistema.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">

      <nav class="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 text-sm sticky top-6">
        <button data-target="config-cuenta" class="config-nav-link w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-medium">
          ${ICONS.user} Cuenta
        </button>
        <button data-target="config-empresa" class="config-nav-link w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50">
          ${ICONS.building} Empresa
        </button>
        <button data-target="config-notificaciones" class="config-nav-link w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50">
          ${ICONS.bell} Notificaciones
        </button>
        <button data-target="config-seguridad" class="config-nav-link w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50">
          ${ICONS.shield} Seguridad
        </button>
        <button data-target="config-apariencia" class="config-nav-link w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50">
          ${ICONS.palette} Apariencia
        </button>
        <button data-target="config-api" class="config-nav-link w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50">
          ${ICONS.api} API &amp; Integraciones
        </button>
      </nav>

      <div class="space-y-6">

        <section id="config-cuenta" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold">MR</div>
              <div>
                <p class="font-semibold text-slate-900">Mariana Ríos</p>
                <p class="text-xs text-slate-400">Administradora · Almacén Central</p>
              </div>
            </div>
            <button class="px-4 h-9 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2">
              ${ICONS.camera} Cambiar foto
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-slate-500">Nombre completo</label>
              <input type="text" value="Mariana Ríos Salgado"
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10">
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500">Correo corporativo</label>
              <input type="email" value="mariana.rios@stocksmart.co"
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10">
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500">Cargo</label>
              <input type="text" value="Jefa de almacén"
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10">
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500">Teléfono</label>
              <input type="tel" value="+57 320 812 4409"
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10">
            </div>
          </div>
        </section>

        <section id="config-empresa" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 class="font-semibold text-slate-900">Empresa</h2>
          <p class="text-xs text-slate-400 mt-0.5 mb-5">Datos fiscales y del centro logístico.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-slate-500">Razón social</label>
              <input type="text" value="Logística Andina S.A.S."
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10">
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500">NIT</label>
              <input type="text" value="900.482.117-3"
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10">
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500">Moneda base</label>
              <select class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option>COP · Peso colombiano</option>
                <option>USD · Dólar estadounidense</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500">Zona horaria</label>
              <select class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option>América / Bogotá (GMT-5)</option>
                <option>América / Ciudad de México (GMT-6)</option>
              </select>
            </div>
          </div>
        </section>

        <section id="config-notificaciones" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 class="font-semibold text-slate-900">Notificaciones</h2>
          <p class="text-xs text-slate-400 mt-0.5 mb-2">Elige qué eventos disparan alertas.</p>

          <div>
            ${switchNotificacion('Stock bajo mínimo', 'Envía correo cuando un SKU cae por debajo del mínimo definido.', true)}
            ${switchNotificacion('Stock crítico', 'Alerta inmediata al llegar a niveles críticos.', true)}
            ${switchNotificacion('Resumen diario', 'Correo con KPIs y movimientos del día a las 07:00.', false)}
            ${switchNotificacion('Movimientos inusuales', 'Detecta salidas atípicas por hora o volumen.', true)}
          </div>
        </section>

        <section id="config-seguridad" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 class="font-semibold text-slate-900">Seguridad</h2>
          <p class="text-xs text-slate-400 mt-0.5 mb-5">Contraseña y verificación en dos pasos.</p>
          <div class="space-y-4">
            <div>
              <label class="text-xs font-medium text-slate-500">Nueva contraseña</label>
              <input type="password" placeholder="••••••••"
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10">
            </div>
            ${switchNotificacion('Verificación en dos pasos', 'Pide un código adicional al iniciar sesión.', false)}
          </div>
        </section>

        <section id="config-apariencia" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 class="font-semibold text-slate-900">Apariencia</h2>
          <p class="text-xs text-slate-400 mt-0.5 mb-5">Selecciona el tema de la interfaz.</p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4" id="selector-tema">
            ${tarjetaTema('Claro', 'bg-white border border-slate-200', true)}
            ${tarjetaTema('Automático', 'bg-gradient-to-br from-white to-slate-700', false)}
            ${tarjetaTema('Oscuro', 'bg-slate-800', false)}
          </div>
        </section>

        <section id="config-api" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 class="font-semibold text-slate-900">API &amp; Integraciones</h2>
          <p class="text-xs text-slate-400 mt-0.5 mb-5">Conecta servicios externos (pendiente definir con el equipo).</p>
          <div class="flex flex-col items-center justify-center h-32 border border-dashed border-slate-300 rounded-xl text-center">
            <p class="text-slate-400 text-sm">Sin integraciones configuradas todavía</p>
          </div>
        </section>

        <div class="flex justify-end gap-3 pb-6">
          <button id="btn-cancelar-config" class="px-5 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancelar
          </button>
          <button id="btn-guardar-config" class="px-5 h-10 rounded-xl bg-blue-900 text-white text-sm font-medium hover:bg-blue-800">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  `;
}

// PENDIENTE (le corresponde al compañero de lógica):
// Los botones del mini-menú (clase .config-nav-link) tienen un
// atributo data-target con el id de la sección a la que deben
// llevar (ej. data-target="config-empresa"). Falta agregar el
// addEventListener que, al hacer clic, haga scroll o cambie de
// sección visible según ese id.