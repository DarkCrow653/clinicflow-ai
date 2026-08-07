export default function StatusPage() {
  const systems = [
    { name: "Aplicación web", status: "operational" },
    { name: "Base de datos", status: "operational" },
    { name: "Almacenamiento de archivos", status: "operational" },
    { name: "Autenticación", status: "operational" },
    { name: "API", status: "operational" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Estado del Servicio</h1>
        <p className="text-gray-500 mt-2">Estado actual de los sistemas de ClinicFlow.</p>
      </div>

      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 flex items-center gap-4">
        <span className="text-3xl">✅</span>
        <div>
          <p className="font-bold text-green-800 text-lg">Todos los sistemas operativos</p>
          <p className="text-green-600 text-sm">No hay incidencias activas en este momento.</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        {systems.map((system, index) => (
          <div
            key={system.name}
            className={`flex items-center justify-between p-4 ${index < systems.length - 1 ? "border-b" : ""}`}
          >
            <span className="text-sm font-medium">{system.name}</span>
            <span className="flex items-center gap-2 text-sm text-green-600">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              Operativo
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-bold mb-4">Historial reciente</h2>
        <p className="text-gray-400 text-sm">No hay incidencias registradas en los últimos 90 días.</p>
      </div>
    </div>
  )
}