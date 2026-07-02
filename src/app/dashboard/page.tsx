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

type TreatmentStat = {
  name: string
  count: number
  revenue: number
}

type UpcomingAppointment = {
  id: string
  appointment_date: string
  status: string
  patients: { full_name: string } | null
  appointment_types: { name: string } | null
}

type ActivityLog = {
  id: string
  action: string
  details: string | null
  created_at: string
  user_email: string | null
}

type Alert = {
  type: string
  message: string
  severity: "warning" | "danger"
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true) // 👈 NUEVO
  const [role, setRole] = useState("")
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
  const [activePatientsCount, setActivePatientsCount] = useState(0)
  const [activeTreatmentsCount, setActiveTreatmentsCount] = useState(0)
  const [monthlyPaymentIncome, setMonthlyPaymentIncome] = useState(0)
  const [pendingBalanceTotal, setPendingBalanceTotal] = useState(0)
  const [totalBilled, setTotalBilled] = useState(0)
  const [totalCollected, setTotalCollected] = useState(0)
  const [completedTreatmentsCount, setCompletedTreatmentsCount] = useState(0)
  const [avgPerTreatment, setAvgPerTreatment] = useState(0)
  const [topTreatments, setTopTreatments] = useState<TreatmentStat[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id, role")
      .eq("id", user.id)
      .single()

    if (!profile) return
    const clinicId = profile.clinic_id
    setRole(profile.role)

    const today = new Date().toISOString().split("T")[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]
    const firstDayMonth = `${today.slice(0, 7)}-01`
    const lastDayMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
    const nowIso = new Date().toISOString()
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    const twelveMonthsAgoStr = twelveMonthsAgo.toISOString()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // 👇 PARALELO 1 — consultas base (todos los roles)
    const [
      clinicRes,
      patientCountRes,
      appointmentCountRes,
      todayRes,
      tomorrowRes,
    ] = await Promise.all([
      supabase.from("clinics").select("name").eq("id", clinicId).single(),
      supabase.from("patients").select("*", { count: "exact", head: true }).eq("clinic_id", clinicId),
      supabase.from("appointments").select("*", { count: "exact", head: true }).eq("clinic_id", clinicId),
      supabase.from("appointments").select("id, appointment_date, patients(full_name)").eq("clinic_id", clinicId).gte("appointment_date", `${today}T00:00:00`).lte("appointment_date", `${today}T23:59:59`).order("appointment_date", { ascending: true }),
      supabase.from("appointments").select("id, appointment_date, patients(full_name)").eq("clinic_id", clinicId).gte("appointment_date", `${tomorrowStr}T00:00:00`).lte("appointment_date", `${tomorrowStr}T23:59:59`).order("appointment_date", { ascending: true }),
    ])

    if (clinicRes.data) setClinicName(clinicRes.data.name)
    setTotalPatients(patientCountRes.count || 0)
    setTotalAppointments(appointmentCountRes.count || 0)
    setTodayAppointments((todayRes.data as any[]) ?? [])
    setTomorrowAppointments((tomorrowRes.data as any[]) ?? [])

    if (profile.role === "admin") {
      // 👇 PARALELO 2 — todas las consultas de admin al mismo tiempo
      const [
        incomeTodayRes,
        treatmentIncomeTodayRes,
        incomeMonthRes,
        treatmentIncomeMonthRes,
        allAppointmentsRes,
        newPatientsRes,
        completedAptsRes,
        apPatientsRes,
        tpPatientsRes,
        allPlansRes,
        completedItemsRes,
        upcomingRes,
        activityRes,
        futureAppointmentsRes,
      ] = await Promise.all([
        supabase.from("appointments").select("price").eq("clinic_id", clinicId).eq("status", "completed").gte("appointment_date", `${today}T00:00:00`).lte("appointment_date", `${today}T23:59:59`),
        supabase.from("treatment_items").select("price, treatment_plans!inner(clinic_id)").eq("status", "completed").eq("treatment_plans.clinic_id", clinicId).gte("completed_at", `${today}T00:00:00`).lte("completed_at", `${today}T23:59:59`),
        supabase.from("appointments").select("price").eq("clinic_id", clinicId).eq("status", "completed").gte("appointment_date", `${firstDayMonth}T00:00:00`).lte("appointment_date", `${lastDayMonth}T23:59:59`),
        supabase.from("treatment_items").select("price, treatment_plans!inner(clinic_id)").eq("status", "completed").eq("treatment_plans.clinic_id", clinicId).gte("completed_at", `${firstDayMonth}T00:00:00`).lte("completed_at", `${lastDayMonth}T23:59:59`),
        supabase.from("appointments").select("status").eq("clinic_id", clinicId),
        supabase.from("patients").select("*", { count: "exact", head: true }).eq("clinic_id", clinicId).gte("created_at", `${firstDayMonth}T00:00:00`),
        supabase.from("appointments").select("appointment_types(name)").eq("clinic_id", clinicId).eq("status", "completed").not("appointment_type_id", "is", null),
        supabase.from("appointments").select("patient_id").eq("clinic_id", clinicId).gte("appointment_date", twelveMonthsAgoStr),
        supabase.from("treatment_plans").select("patient_id").eq("clinic_id", clinicId).gte("created_at", twelveMonthsAgoStr),
        supabase.from("treatment_plans").select("id, patient_id, status, total_amount, created_at, treatment_payments(amount, payment_date)").eq("clinic_id", clinicId),
        supabase.from("treatment_items").select("price, appointment_types(name), treatment_plans!inner(clinic_id)").eq("status", "completed").eq("treatment_plans.clinic_id", clinicId),
        supabase.from("appointments").select("id, appointment_date, status, patients(full_name), appointment_types(name)").eq("clinic_id", clinicId).neq("status", "cancelled").gte("appointment_date", nowIso).order("appointment_date", { ascending: true }).limit(10),
        supabase.from("activity_logs_with_user").select("*").eq("clinic_id", clinicId).order("created_at", { ascending: false }).limit(20),
        supabase.from("appointments").select("patient_id").eq("clinic_id", clinicId).gte("appointment_date", nowIso).neq("status", "cancelled"),
      ])

      // Ingresos hoy
      const appointmentIncomeToday = incomeTodayRes.data?.reduce((sum, a) => sum + (a.price || 0), 0) ?? 0
      const treatmentIncomeToday = treatmentIncomeTodayRes.data?.reduce((sum, t) => sum + (t.price || 0), 0) ?? 0
      setIncomeToday(appointmentIncomeToday + treatmentIncomeToday)

      // Ingresos mes
      const appointmentIncomeMonth = incomeMonthRes.data?.reduce((sum, a) => sum + (a.price || 0), 0) ?? 0
      const treatmentIncomeMonth = treatmentIncomeMonthRes.data?.reduce((sum, t) => sum + (t.price || 0), 0) ?? 0
      setIncomeMonth(appointmentIncomeMonth + treatmentIncomeMonth)

      // Tasa cancelación
      const allApts = allAppointmentsRes.data || []
      if (allApts.length > 0) {
        const cancelled = allApts.filter((a) => a.status === "cancelled").length
        setCancellationRate(Math.round((cancelled / allApts.length) * 100))
      }

      // Pacientes nuevos
      setNewPatientsMonth(newPatientsRes.count || 0)

      // Top servicios (citas)
      if (completedAptsRes.data) {
        const countMap: Record<string, number> = {}
        completedAptsRes.data.forEach((apt: any) => {
          const name = apt.appointment_types?.name
          if (name) countMap[name] = (countMap[name] || 0) + 1
        })
        const sorted = Object.entries(countMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        setTopServices(sorted)
      }

      // Pacientes activos
      const activeIds = new Set([
        ...(apPatientsRes.data || []).map((a) => a.patient_id),
        ...(tpPatientsRes.data || []).map((t) => t.patient_id),
      ])
      setActivePatientsCount(activeIds.size)

      // Planes de tratamiento
      const allPlans = allPlansRes.data || []
      const activePlans = allPlans.filter((p) => p.status === "draft" || p.status === "active")
      const completedPlans = allPlans.filter((p) => p.status === "completed")
      const nonCancelledPlans = allPlans.filter((p) => p.status !== "cancelled")

      setActiveTreatmentsCount(activePlans.length)
      setCompletedTreatmentsCount(completedPlans.length)

      const getPlanPaid = (plan: any) =>
        (plan.treatment_payments || []).reduce((sum: number, p: any) => sum + p.amount, 0)

      setPendingBalanceTotal(activePlans.reduce((sum, plan) => sum + (plan.total_amount - getPlanPaid(plan)), 0))
      setTotalBilled(nonCancelledPlans.reduce((sum, plan) => sum + plan.total_amount, 0))

      const collected = allPlans.reduce((sum, plan) => sum + getPlanPaid(plan), 0)
      setTotalCollected(collected)
      setAvgPerTreatment(completedPlans.length > 0 ? Math.round(collected / completedPlans.length) : 0)

      // Ingresos del mes desde pagos
      let monthlyFromPayments = 0
      allPlans.forEach((plan) => {
        (plan.treatment_payments || []).forEach((payment: any) => {
          if (payment.payment_date >= firstDayMonth && payment.payment_date <= lastDayMonth) {
            monthlyFromPayments += payment.amount
          }
        })
      })
      setMonthlyPaymentIncome(monthlyFromPayments)

      // Top tratamientos dentales
      if (completedItemsRes.data) {
        const treatmentMap: Record<string, { count: number; revenue: number }> = {}
        completedItemsRes.data.forEach((item: any) => {
          const name = item.appointment_types?.name
          if (!name) return
          if (!treatmentMap[name]) treatmentMap[name] = { count: 0, revenue: 0 }
          treatmentMap[name].count += 1
          treatmentMap[name].revenue += item.price || 0
        })
        const sortedTreatments = Object.entries(treatmentMap)
          .map(([name, stats]) => ({ name, count: stats.count, revenue: stats.revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
        setTopTreatments(sortedTreatments)
      }

      // Próximas citas
      if (upcomingRes.data) setUpcomingAppointments(upcomingRes.data as any[])

      // Actividad reciente
      if (activityRes.data) setRecentActivity(activityRes.data)

      // Alertas
      const newAlerts: Alert[] = []

      const activePlansWithBalance = activePlans.filter((p) => p.total_amount - getPlanPaid(p) > 0)
      if (activePlansWithBalance.length > 0) {
        newAlerts.push({
          type: "balance",
          message: `${activePlansWithBalance.length} tratamiento${activePlansWithBalance.length > 1 ? "s" : ""} con saldo pendiente`,
          severity: "warning",
        })
      }

      const uniquePatientIds = [...new Set(activePlans.map((p: any) => p.patient_id))]
      const patientsWithFutureAppt = new Set((futureAppointmentsRes.data || []).map((a) => a.patient_id))
      const patientsWithoutNext = uniquePatientIds.filter((id) => !patientsWithFutureAppt.has(id))
      if (patientsWithoutNext.length > 0) {
        newAlerts.push({
          type: "no_appointment",
          message: `${patientsWithoutNext.length} paciente${patientsWithoutNext.length > 1 ? "s" : ""} con tratamiento activo sin próxima cita`,
          severity: "danger",
        })
      }

      const draftPlans = allPlans.filter((p) => p.status === "draft" && new Date(p.created_at) <= sevenDaysAgo)
      if (draftPlans.length > 0) {
        newAlerts.push({
          type: "draft",
          message: `${draftPlans.length} presupuesto${draftPlans.length > 1 ? "s" : ""} sin aprobar hace más de 7 días`,
          severity: "warning",
        })
      }

      setAlerts(newAlerts)
    }

    setLoading(false)
  }

  const formatHour = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })

  const formatFullDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })

  const isAdmin = role === "admin"

  // 👇 NUEVO — pantalla de carga
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent mx-auto" />
          <p className="text-sm text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

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

      {isAdmin && (
        <>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-gray-500 text-sm">Ingresos hoy</p>
              <h2 className="mt-2 text-3xl font-bold">${incomeToday}</h2>
              <p className="text-xs text-gray-400 mt-1">Citas + tratamientos completados</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-gray-500 text-sm">Ingresos del mes</p>
              <h2 className="mt-2 text-3xl font-bold">${incomeMonth}</h2>
              <p className="text-xs text-gray-400 mt-1">Citas + tratamientos completados</p>
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

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Centro de Control Dental</h2>

            <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-gray-500 text-sm">Pacientes Activos</p>
                <h2 className="mt-2 text-3xl font-bold">{activePatientsCount}</h2>
                <p className="text-xs text-gray-400 mt-1">Últimos 12 meses</p>
              </div>
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-gray-500 text-sm">Tratamientos Activos</p>
                <h2 className="mt-2 text-3xl font-bold">{activeTreatmentsCount}</h2>
                <p className="text-xs text-gray-400 mt-1">Borrador o en curso</p>
              </div>
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-gray-500 text-sm">Ingresos del Mes</p>
                <h2 className="mt-2 text-3xl font-bold">${monthlyPaymentIncome}</h2>
                <p className="text-xs text-gray-400 mt-1">Pagos cobrados</p>
              </div>
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-gray-500 text-sm">Saldo Pendiente</p>
                <h2 className="mt-2 text-3xl font-bold text-red-600">${pendingBalanceTotal}</h2>
                <p className="text-xs text-gray-400 mt-1">De tratamientos activos</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-gray-500 text-sm">Tratamientos Completados</p>
                <h2 className="mt-2 text-3xl font-bold">{completedTreatmentsCount}</h2>
              </div>
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-gray-500 text-sm">Tratamientos Pendientes</p>
                <h2 className="mt-2 text-3xl font-bold">{activeTreatmentsCount}</h2>
              </div>
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-gray-500 text-sm">Tasa de Finalización</p>
                <h2 className="mt-2 text-3xl font-bold">
                  {completedTreatmentsCount + activeTreatmentsCount > 0
                    ? Math.round((completedTreatmentsCount / (completedTreatmentsCount + activeTreatmentsCount)) * 100)
                    : 0}%
                </h2>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Resumen Financiero</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Total Facturado</p>
                  <p className="text-xl font-bold">${totalBilled}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Cobrado</p>
                  <p className="text-xl font-bold text-green-600">${totalCollected}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Pendiente</p>
                  <p className="text-xl font-bold text-red-600">${totalBilled - totalCollected}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Promedio por Tratamiento</p>
                  <p className="text-xl font-bold">${avgPerTreatment}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Top Tratamientos</h3>
              {topTreatments.length === 0 ? (
                <p className="text-gray-400 text-sm">Aún no hay procedimientos completados.</p>
              ) : (
                <div className="space-y-3">
                  {topTreatments.map((t, index) => (
                    <div key={t.name} className="flex items-center justify-between rounded-xl border p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm font-bold w-5">{index + 1}</span>
                        <p className="font-medium">{t.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${t.revenue}</p>
                        <p className="text-xs text-gray-400">{t.count} realizado{t.count > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Próximas Citas</h3>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-400 text-sm">No hay próximas citas programadas.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between rounded-xl border p-3">
                      <div>
                        <p className="text-sm font-medium">{apt.patients?.full_name || "Sin nombre"}</p>
                        <p className="text-xs text-gray-500">
                          {formatFullDate(apt.appointment_date)} · {formatHour(apt.appointment_date)}
                          {apt.appointment_types && <span> · {apt.appointment_types.name}</span>}
                        </p>
                      </div>
                      <span className={`text-xs border rounded-full px-3 py-1 font-medium ${STATUS_STYLES[apt.status]}`}>
                        {STATUS_LABELS[apt.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {alerts.length > 0 && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
                <h3 className="text-lg font-bold">Alertas</h3>
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 text-sm ${
                      alert.severity === "danger"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-yellow-50 border-yellow-200 text-yellow-700"
                    }`}
                  >
                    {alert.severity === "danger" ? "🔴" : "🟡"} {alert.message}
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Actividad Reciente</h3>
              {recentActivity.length === 0 ? (
                <p className="text-gray-400 text-sm">No hay actividad registrada aún.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentActivity.map((log) => (
                    <div key={log.id} className="flex items-start justify-between text-sm border-b pb-2 last:border-0">
                      <p>
                        <span className="font-medium">{log.user_email || "Usuario"}</span>
                        {" "}{log.action}
                        {log.details && <span className="text-gray-500"> — {log.details}</span>}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(log.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

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