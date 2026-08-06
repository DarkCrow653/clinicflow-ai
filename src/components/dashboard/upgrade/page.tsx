"use client"

import { usePlan } from "@/lib/usePlan"

const FREE_FEATURES = [
  "Hasta 100 pacientes",
  "1 usuario",
  "Agenda y citas",
  "Pacientes básicos",
  "Calendario",
]

const PRO_FEATURES = [
  "Pacientes ilimitados",
  "Usuarios ilimitados",
  "Dashboard Ejecutivo",
  "Odontograma Interactivo",
  "Planes de Tratamiento",
  "Presupuestos en PDF",
  "Pagos y Recibos",
  "Exportaciones CSV",
  "Gestión de Archivos",
  "Auditoría completa",
  "Soporte prioritario",
]

export default function UpgradePage() {
  const { plan, isFree } = usePlan()

  return (
    <div className="space-y-8 p-10 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold">Planes</h1>
        <p className="mt-2 text-gray-500">
          Plan actual: <span className="font-semibold text-black">{plan?.name || "Free"}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* FREE */}
        <div className={`rounded-2xl border p-8 space-y-6 ${isFree ? "border-black" : "border-gray-200"}`}>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">Free</h3>
              {isFree && (
                <span className="rounded-full bg-black text-white text-xs px-3 py-0.5">
                  Plan actual
                </span>
              )}
            </div>
            <p className="text-4xl font-bold mt-2">
              $0 <span className="text-gray-400 text-base font-normal">/ mes</span>
            </p>
            <p className="text-gray-500 text-sm mt-2">Para clínicas que están comenzando.</p>
          </div>

          <ul className="space-y-3">
            {FREE_FEATURES.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <span className="text-green-500 font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>

          {isFree && (
            <div className="rounded-xl bg-gray-50 border p-4 text-sm text-gray-500 text-center">
              Tu plan actual
            </div>
          )}
        </div>

        {/* PRO */}
        <div className="rounded-2xl border-2 border-black p-8 space-y-6 relative">
          <div className="absolute -top-3 left-6">
            <span className="rounded-full bg-black text-white text-xs px-3 py-1 font-medium">
              Recomendado
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold">Pro</h3>
            <p className="text-4xl font-bold mt-2">
              $29 <span className="text-gray-400 text-base font-normal">/ mes</span>
            </p>
            <p className="text-gray-500 text-sm mt-2">Para clínicas que quieren crecer.</p>
          </div>

          <ul className="space-y-3">
            {PRO_FEATURES.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <span className="text-green-500 font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full rounded-lg bg-black px-6 py-3 text-white font-medium opacity-50 cursor-not-allowed"
          >
            Próximamente
          </button>
          <p className="text-xs text-gray-400 text-center">
            Pagos online disponibles pronto
          </p>
        </div>
      </div>
    </div>
  )
}