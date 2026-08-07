export default function RoadmapPage() {
  const completed = [
    "Gestión de pacientes",
    "Agenda y citas",
    "Calendario interactivo",
    "Odontograma interactivo",
    "Historial clínico estructurado",
    "Planes de tratamiento",
    "Presupuestos en PDF",
    "Seguimiento de pagos y recibos",
    "Dashboard ejecutivo dental",
    "Multiusuario con roles",
    "Gestión de archivos clínicos",
    "Exportaciones CSV",
    "Sistema de auditoría",
    "Plan Free / Pro",
  ]

  const inProgress = [
    "Responsive para móvil",
    "Mejoras de rendimiento",
    "Asistente IA para historial clínico",
  ]

  const upcoming = [
    "Integración con Stripe (pagos online)",
    "Notificaciones por WhatsApp",
    "App móvil nativa",
    "Integración con sistemas de radiología",
    "Módulo de inventario",
    "Recordatorios automáticos de citas",
    "Firma digital de consentimientos",
    "Informe de producción mensual",
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Roadmap</h1>
        <p className="text-gray-500 mt-2">El futuro de ClinicFlow, de forma transparente.</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
            Completado
          </h2>
          <ul className="space-y-2">
            {completed.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
            En desarrollo
          </h2>
          <ul className="space-y-2">
            {inProgress.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-blue-500">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
            Próximamente
          </h2>
          <ul className="space-y-2">
            {upcoming.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                <span>○</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}