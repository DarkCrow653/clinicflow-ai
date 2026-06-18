"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type LogEntry = {
  id: string
  action: string
  entity_type: string
  details: string | null
  created_at: string
  user_email: string | null
}

const ENTITY_LABELS: Record<string, string> = {
  patient: "Paciente",
  appointment: "Cita",
  service: "Servicio",
  user: "Usuario",
  patient_record: "Consulta",
}

const ENTITY_FILTERS = ["todas", "patient", "appointment", "service", "user", "patient_record"]

export default function ActivityPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("todas")

  const filteredLogs = logs.filter((log) =>
    activeFilter === "todas" ? true : log.entity_type === activeFilter
  )

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!profile) return

    const { data } = await supabase
      .from("activity_logs_with_user")
      .select("*")
      .eq("clinic_id", profile.clinic_id)
      .order("created_at", { ascending: false })
      .limit(200)

    if (data) setLogs(data)
    setLoading(false)
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="space-y-8 p-10">
      <div>
        <h1 className="text-4xl font-bold">Auditoría</h1>
        <p className="mt-2 text-gray-500">Historial de acciones en tu clínica.</p>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 flex-wrap">
        {ENTITY_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-4 py-1 text-sm transition ${
              activeFilter === filter
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter === "todas" ? "Todas" : ENTITY_LABELS[filter]}
          </button>
        ))}
      </div>

      {/* LISTA */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : filteredLogs.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay actividad registrada aún.</p>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between rounded-xl border p-4 gap-4"
              >
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{log.user_email || "Usuario desconocido"}</span>
                    {" "}{log.action}
                    {log.details && <span className="text-gray-600"> — {log.details}</span>}
                  </p>
                  <span className="text-xs text-gray-400 border rounded-full px-2 py-0.5 mt-1 inline-block">
                    {ENTITY_LABELS[log.entity_type] || log.entity_type}
                  </span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}