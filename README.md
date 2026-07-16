# Frontend — Proyecto Integrador

SPA en JavaScript Vanilla (sin frameworks), con Tailwind CSS vía CDN.

## Estructura

```
frontend/
├── index.html              # shell fijo: sidebar + header + <main id="app">
├── src/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js         # arranque de la app
│       ├── router.js       # hash router: define rutas e inyecta HTML en #app
│       ├── api.js          # funciones fetch() al backend
│       └── views/
│           ├── dashboard.js
│           └── productos.js
```

## Cómo funciona la SPA

1. `index.html` nunca se recarga: solo tiene un `<main id="app">` vacío.
2. `router.js` escucha cambios en el `#hash` de la URL (ej. `#productos`).
3. Según el hash, llama a la función `render...()` de la vista correspondiente,
   que devuelve un **string de HTML**.
4. Ese string se inyecta con `appEl.innerHTML = ...` dentro de `#app`.

## Cómo agregar una vista nueva

1. Crea `src/js/views/miVista.js` con una función `renderMiVista()` que
   devuelva el HTML como string (copia el patrón de `dashboard.js`).
2. Impórtala en `router.js` y agrégala al objeto `ROUTES`:

```js
import { renderMiVista } from './views/miVista.js';

const ROUTES = {
  ...
  mivista: { title: 'Mi Vista', render: renderMiVista },
};
```

El link del sidebar se genera solo, no hay que tocar el HTML a mano.

## Instalación y ejecución local

No requiere `npm install` todavía (Tailwind está vía CDN).

```bash
npx serve .
```

o con la extensión **Live Server** de VS Code: clic derecho sobre
`index.html` → "Open with Live Server".

## Pendiente

- Conectar `api.js` con el backend real.
- Reemplazar el contenido de ejemplo en `views/` por los datos y componentes reales.
- Definir el enfoque final del inventario (aún por confirmar con el equipo).
