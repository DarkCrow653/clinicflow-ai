"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Appointment = {
  id: string
  appointment_date: string
  patients: any
}

type ServiceStat = {
  name: string
  count: number
}

export default function DashboardPage() {
  const [role, setRole] = useState("") // 👈 NUEVO
  const [clinicName, setClinicName] = useState("")
  const [totalPatients, setTotalPatients] = useState(0)
  const [totalAppointments, setTotalAppointments] = useState(0)
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [tomorrowAppointments, setTomorrowAppointments] = useState<Appointment[]>([])
  const [incomeToday, setIncomeToday] = useState(0)
  const [incomeMonth, setIncomeMonth] = useState(0)
  const [cancellationRate, setCancellationRate] = useState(0)
  const [newPatientsMonth, setNewPatientsMonth] = useState(0)
  const [topServices, setTopServices] = useState<ServiceStat[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id, role") // 👈 NUEVO
      .eq("id", user.id)
      .single()

    if (!profile) return
    const clinicId = profile.clinic_id
    setRole(profile.role) // 👈 NUEVO

    const { data: clinic } = await supabase
      .from("clinics")
      .select("name")
      .eq("id", clinicId)
      .single()

    if (clinic) setClinicName(clinic.name)

    const { count: patientCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", clinicId)

    setTotalPatients(patientCount || 0)

    const { count: appointmentCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", clinicId)

    setTotalAppointments(appointmentCount || 0)

    const today = new Date().toISOString().split("T")[0]

    const { data: todayData } = await supabase
      .from("appointments")
      .select("id, appointment_date, patients(full_name)")
      .eq("clinic_id", clinicId)
      .gte("appointment_date", `${today}T00:00:00`)
      .lte("appointment_date", `${today}T23:59:59`)
      .order("appointment_date", { ascending: true })

    setTodayAppointments((todayData as any[]) ?? [])

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]

    const { data: tomorrowData } = await supabase
      .from("appointments")
      .select("id, appointment_date, patients(full_name)")
      .eq("clinic_id", clinicId)
      .gte("appointment_date", `${tomorrowStr}T00:00:00`)
      .lte("appointment_date", `${tomorrowStr}T23:59:59`)
      .order("appointment_date", { ascending: true })

    setTomorrowAppointments((tomorrowData as any[]) ?? [])

    // 👇 Solo carga KPIs financieros si es admin
    if (profile.role === "admin") {
      const { data: incomeTodayData } = await supabase
        .from("appointments")
        .select("price")
        .eq("clinic_id", clinicId)
        .eq("status", "completed")
        .gte("appointment_date", `${today}T00:00:00`)
        .lte("appointment_date", `${today}T23:59:59`)

      setIncomeToday(
        incomeTodayData?.reduce((sum, a) => sum + (a.price || 0), 0) ?? 0
      )

      const firstDayMonth = `${today.slice(0, 7)}-01`
      const lastDayMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).toISOString().split("T")[0]

      const { data: incomeMonthData } = await supabase
        .from("appointments")
        .select("price")
        .eq("clinic_id", clinicId)
        .eq("status", "completed")
        .gte("appointment_date", `${firstDayMonth}T00:00:00`)
        .lte("appointment_date", `${lastDayMonth}T23:59:59`)

      setIncomeMonth(
        incomeMonthData?.reduce((sum, a) => sum + (a.price || 0), 0) ?? 0
      )

      const { data: allAppointments } = await supabase
        .from("appointments")
        .select("status")
        .eq("clinic_id", clinicId)

      if (allAppointments && allAppointments.length > 0) {
        const cancelled = allAppointments.filter((a) => a.status === "cancelled").length
        setCancellationRate(Math.round((cancelled / allAppointments.length) * 100))
      }

      const { count: newPatients } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("clinic_id", clinicId)
        .gte("created_at", `${firstDayMonth}T00:00:00`)

      setNewPatientsMonth(newPatients || 0)

      const { data: completedApts } = await supabase
        .from("appointments")
        .select("appointment_types(name)")
        .eq("clinic_id", clinicId)
        .eq("status", "completed")
        .not("appointment_type_id", "is", null)

      if (completedApts) {
        const countMap: Record<string, number> = {}
        completedApts.forEach((apt: any) => {
          const name = apt.appointment_types?.name
          if (name) countMap[name] = (countMap[name] || 0) + 1
        })

        const sorted = Object.entries(countMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setTopServices(sorted)
      }
    }
  }

  const formatHour = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })

  const isAdmin = role === "admin" // 👈 helper

  return (
    <div className="space-y-8 p-10">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="mt-2 text-xl">Clínica: {clinicName}</p>
      </div>

      {tomorrowAppointments.length > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <p className="font-semibold text-yellow-800">
              Tienes {tomorrowAppointments.length} cita{tomorrowAppointments.length > 1 ? "s" : ""} mañana
            </p>
          </div>
          <div className="space-y-2">
            {tomorrowAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between text-sm text-yellow-700">
                <span>→ {apt.patients?.full_name || "Sin nombre"}</span>
                <span className="font-medium">{formatHour(apt.appointment_date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs GENERALES — todos los roles */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Pacientes</p>
          <h2 className="mt-2 text-4xl font-bold">{totalPatients}</h2>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Total citas</p>
          <h2 className="mt-2 text-4xl font-bold">{totalAppointments}</h2>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">Citas hoy</p>
          <h2 className="mt-2 text-4xl font-bold">{todayAppointments.length}</h2>
        </div>
      </div>

      {/* KPIs FINANCIEROS — solo admin 👇 */}
      {isAdmin && (
        <>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-gray-500 text-sm">Ingresos hoy</p>
              <h2 className="mt-2 text-3xl font-bold">${incomeToday}</h2>
              <p className="text-xs text-gray-400 mt-1">Solo citas completadas</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-gray-500 text-sm">Ingresos del mes</p>
              <h2 className="mt-2 text-3xl font-bold">${incomeMonth}</h2>
              <p className="text-xs text-gray-400 mt-1">Solo citas completadas</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-gray-500 text-sm">Tasa de cancelación</p>
              <h2 className="mt-2 text-3xl font-bold">{cancellationRate}%</h2>
              <p className="text-xs text-gray-400 mt-1">Del total de citas</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-gray-500 text-sm">Pacientes nuevos</p>
              <h2 className="mt-2 text-3xl font-bold">{newPatientsMonth}</h2>
              <p className="text-xs text-gray-400 mt-1">Este mes</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Servicios más vendidos</h2>
            {topServices.length === 0 ? (
              <p className="text-gray-400 text-sm">Aún no hay citas completadas con servicio asignado.</p>
            ) : (
              <div className="space-y-3">
                {topServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm font-bold w-5">{index + 1}</span>
                      <p className="font-medium">{service.name}</p>
                    </div>
                    <span className="text-sm text-gray-500">{service.count} cita{service.count > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* CITAS DE HOY — todos los roles */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Citas de hoy</h2>
        {todayAppointments.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay citas programadas para hoy.</p>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between rounded-xl border p-4">
                <p className="font-medium">{apt.patients?.full_name || "Sin nombre"}</p>
                <span className="text-sm text-gray-500">{formatHour(apt.appointment_date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}