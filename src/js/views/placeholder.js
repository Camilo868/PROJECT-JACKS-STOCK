export function renderPlaceholder(nombre) {
  return `
    <div class="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
      <p class="text-slate-400 text-sm">Sección "${nombre}"</p>
      <p class="text-slate-300 text-xs mt-1">Diseño pendiente — lo agregamos cuando lo tengas listo en Lovable</p>
    </div>
  `;
}