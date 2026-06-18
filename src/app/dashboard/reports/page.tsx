"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { downloadCSV } from "@/lib/exportCsv"
import { logActivity } from "@/lib/logActivity"

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
}

export default function ReportsPage() {
  const [clinicId, setClinicId] = useState("")
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    loadClinic()
  }, [])

  const loadClinic = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (profile) setClinicId(profile.clinic_id)
  }

  const exportPatients = async () => {
    setExporting("patients")

    const { data } = await supabase
      .from("patients")
      .select("full_name, phone, email, created_at")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: true })

    const rows = (data || []).map((p) => ({
      nombre: p.full_name,
      teléfono: p.phone || "",
      email: p.email || "",
      fecha_creación: new Date(p.created_at).toLocaleDateString("es-ES"),
    }))

    downloadCSV(`pacientes_${Date.now()}.csv`, rows)

    await logActivity({
      clinicId,
      action: "exportó reporte de",
      entityType: "report",
      details: "Pacientes",
    })

    setExporting(null)
  }

  const exportAppointments = async () => {
    setExporting("appointments")

    const { data } = await supabase
      .from("appointments")
      .select("appointment_date, status, patients(full_name), appointment_types(name)")
      .eq("clinic_id", clinicId)
      .order("appointment_date", { ascending: true })

    const rows = (data || []).map((a: any) => ({
      paciente: a.patients?.full_name || "Sin nombre",
      fecha: new Date(a.appointment_date).toLocaleString("es-ES"),
      estado: STATUS_LABELS[a.status] || a.status,
      servicio: a.appointment_types?.name || "Sin servicio",
    }))

    downloadCSV(`citas_${Date.now()}.csv`, rows)

    await logActivity({
      clinicId,
      action: "exportó reporte de",
      entityType: "report",
      details: "Citas",
    })

    setExporting(null)
  }

  const exportIncome = async () => {
    setExporting("income")

    const { data } = await supabase
      .from("appointments")
      .select("appointment_date, price, appointment_types(name)")
      .eq("clinic_id", clinicId)
      .eq("status", "completed")
      .order("appointment_date", { ascending: true })

    const rows = (data || []).map((a: any) => ({
      fecha: new Date(a.appointment_date).toLocaleDateString("es-ES"),
      servicio: a.appointment_types?.name || "Sin servicio",
      importe: a.price || 0,
    }))

    downloadCSV(`ingresos_${Date.now()}.csv`, rows)

    await logActivity({
      clinicId,
      action: "exportó reporte de",
      entityType: "report",
      details: "Ingresos",
    })

    setExporting(null)
  }

  return (
    <div className="space-y-8 p-10">
      <div>
        <h1 className="text-4xl font-bold">Reportes</h1>
        <p className="mt-2 text-gray-500">Descarga la información de tu clínica en formato CSV.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold">Pacientes</h2>
          <p className="text-sm text-gray-500">
            Nombre, teléfono, email y fecha de creación.
          </p>
          <button
            onClick={exportPatients}
            disabled={exporting === "patients"}
            className="w-full rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {exporting === "patients" ? "Exportando..." : "Exportar Pacientes"}
          </button>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold">Citas</h2>
          <p className="text-sm text-gray-500">
            Paciente, fecha, estado y servicio.
          </p>
          <button
            onClick={exportAppointments}
            disabled={exporting === "appointments"}
            className="w-full rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {exporting === "appointments" ? "Exportando..." : "Exportar Citas"}
          </button>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold">Ingresos</h2>
          <p className="text-sm text-gray-500">
            Fecha, servicio e importe (solo citas completadas).
          </p>
          <button
            onClick={exportIncome}
            disabled={exporting === "income"}
            className="w-full rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {exporting === "income" ? "Exportando..." : "Exportar Ingresos"}
          </button>
        </div>

      </div>
    </div>
  )
}