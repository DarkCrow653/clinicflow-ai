const CHANGELOG = [
  {
    version: "1.5.0",
    date: "Julio 2026",
    changes: [
      "Fase 10: Sistema de planes Free/Pro",
      "Límite de 100 pacientes en plan Free",
      "Página de upgrade dentro del dashboard",
      "Landing page comercial",
      "Páginas legales (Privacidad, Términos, DPA)",
    ],
  },
  {
    version: "1.4.0",
    date: "Julio 2026",
    changes: [
      "Fase 8: Dashboard ejecutivo por paciente",
      "Resumen de tratamientos activos, saldo y próxima cita",
      "Fase 9: Agenda inteligente con drag & drop",
      "Duración real de citas en el calendario",
      "Modal de detalle al hacer click en cita",
    ],
  },
  {
    version: "1.3.0",
    date: "Junio 2026",
    changes: [
      "Fase 6: Gestión de archivos clínicos (Supabase Storage)",
      "Subida de radiografías, fotos y documentos",
      "Validaciones en todos los formularios",
      "Optimización de carga del dashboard con Promise.all",
    ],
  },
  {
    version: "1.2.0",
    date: "Junio 2026",
    changes: [
      "Fase 4: Sistema de pagos y recibos PDF",
      "Estado financiero automático (Pendiente/Pago Parcial/Pagado)",
      "Numeración de recibos (REC-000001)",
      "Fase 5: Dashboard Dental Ejecutivo",
      "KPIs, alertas, actividad reciente y próximas citas",
    ],
  },
  {
    version: "1.1.0",
    date: "Junio 2026",
    changes: [
      "Fase 1: Odontograma interactivo",
      "Fase 2: Planes de tratamiento con progreso",
      "Fase 3: Presupuestos en PDF profesionales",
      "Multiusuario con roles (Admin, Doctor, Recepción)",
      "Sistema de invitaciones seguro",
    ],
  },
  {
    version: "1.0.0",
    date: "Mayo 2026",
    changes: [
      "Lanzamiento inicial de ClinicFlow",
      "Gestión de pacientes y citas",
      "Dashboard con KPIs básicos",
      "Historial clínico estructurado",
      "Exportaciones CSV",
      "Sistema de auditoría",
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Changelog</h1>
        <p className="text-gray-500 mt-2">Historial de versiones y novedades de ClinicFlow.</p>
      </div>

      <div className="space-y-6">
        {CHANGELOG.map((release) => (
          <div key={release.version} className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-black text-white text-xs px-3 py-1 font-mono font-bold">
                v{release.version}
              </span>
              <span className="text-sm text-gray-400">{release.date}</span>
            </div>
            <ul className="space-y-2">
              {release.changes.map((change) => (
                <li key={change} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-black mt-0.5">•</span>
                  {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}