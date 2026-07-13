"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import CalendarView from "@/components/calendar/calendar-view"
import { logActivity } from "@/lib/logActivity"

type Patient = {
  id: string
  full_name: string
}

type AppointmentType = {
  id: string
  name: string
  price: number
  duration_minutes: number
}

type Appointment = {
  id: string
  appointment_date: string
  status: string
  price: number
  patients: { full_name: string }
  appointment_types: { name: string; price: number } | null
}

type FormErrors = {
  patientId?: string
  serviceId?: string
  date?: string
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

const STATUS_FILTERS = ["todas", "pending", "confirmed", "completed", "cancelled"]

export default function AppointmentsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<AppointmentType[]>([])
  const [patientId, setPatientId] = useState("")
  const [date, setDate] = useState("")
  const [clinicId, setClinicId] = useState("")
  const [activeFilter, setActiveFilter] = useState("todas")
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [selectedPrice, setSelectedPrice] = useState(0)
  const [selectedDuration, setSelectedDuration] = useState(0)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  const filteredAppointments = appointments.filter((a) =>
    activeFilter === "todas" ? true : a.status === activeFilter
  )

  const groupedByDate = filteredAppointments.reduce<Record<string, Appointment[]>>(
    (acc, apt) => {
      const day = new Date(apt.appointment_date).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      if (!acc[day]) acc[day] = []
      acc[day].push(apt)
      return acc
    },
    {}
  )

  const calendarEvents = appointments.map((apt) => ({
    title: apt.patients?.full_name || "Paciente",
    date: apt.appointment_date,
    status: apt.status,
  }))

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!profile) return
    setClinicId(profile.clinic_id)

    const { data: patientsData } = await supabase
      .from("patients")
      .select("*")
      .eq("clinic_id", profile.clinic_id)

    if (patientsData) setPatients(patientsData)

    const { data: servicesData } = await supabase
      .from("appointment_types")
      .select("*")
      .eq("clinic_id", profile.clinic_id)
      .order("name", { ascending: true })

    if (servicesData) setServices(servicesData)

    const { data: appointmentsData } = await supabase
      .from("appointments")
      .select(`*, patients (full_name), appointment_types (name, price)`)
      .eq("clinic_id", profile.clinic_id)
      .order("appointment_date", { ascending: true })

    if (appointmentsData) setAppointments(appointmentsData as Appointment[])
  }

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    if (errors.serviceId) setErrors((prev) => ({ ...prev, serviceId: undefined }))
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      setSelectedPrice(service.price)
      setSelectedDuration(service.duration_minutes)
    } else {
      setSelectedPrice(0)
      setSelectedDuration(0)
    }
  }

  // 👇 NUEVO — validación
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!patientId) newErrors.patientId = "Selecciona un paciente."
    if (!selectedServiceId) newErrors.serviceId = "Selecciona un servicio."

    if (!date) {
      newErrors.date = "La fecha y hora son obligatorias."
    } else {
      const selected = new Date(date)
      const now = new Date()
      if (selected <= now) {
        newErrors.date = "La fecha debe ser futura."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createAppointment = async () => {
    if (!validate()) return
    setSaving(true)

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        clinic_id: clinicId,
        patient_id: patientId,
        appointment_date: date,
        status: "pending",
        appointment_type_id: selectedServiceId,
        price: selectedPrice,
      })
      .select()
      .single()

    if (error) {
      setErrors({ date: "Error al crear la cita. Intenta de nuevo." })
      setSaving(false)
      return
    }

    if (data) {
      const patientName = patients.find((p) => p.id === patientId)?.full_name
      await logActivity({
        clinicId,
        action: "creó cita para",
        entityType: "appointment",
        entityId: data.id,
        details: patientName,
      })
    }

    setPatientId("")
    setDate("")
    setSelectedServiceId("")
    setSelectedPrice(0)
    setSelectedDuration(0)
    setErrors({})
    setSaving(false)
    loadAppointments()
  }

  const updateStatus = async (appointmentId: string, status: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId)

    if (error) { alert(error.message); return }

    const appointment = appointments.find((a) => a.id === appointmentId)
    await logActivity({
      clinicId,
      action: `cambió cita a "${STATUS_LABELS[status]}" de`,
      entityType: "appointment",
      entityId: appointmentId,
      details: appointment?.patients?.full_name,
    })

    loadAppointments()
  }

  const deleteAppointment = async (appointmentId: string) => {
    const confirm = window.confirm("¿Eliminar esta cita?")
    if (!confirm) return

    const appointment = appointments.find((a) => a.id === appointmentId)

    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointmentId)

    if (error) { alert(error.message); return }

    await logActivity({
      clinicId,
      action: "eliminó cita de",
      entityType: "appointment",
      entityId: appointmentId,
      details: appointment?.patients?.full_name,
    })

    loadAppointments()
  }

  return (
    <div className="space-y-8 p-10">
      <div>
        <h1 className="text-4xl font-bold">Citas</h1>
      </div>

      {/* FORMULARIO */}
      <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Nueva cita</h2>

        {/* PACIENTE */}
        <div>
          <select
            className={`w-full rounded border p-2 ${errors.patientId ? "border-red-400 bg-red-50" : ""}`}
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value)
              if (errors.patientId) setErrors((prev) => ({ ...prev, patientId: undefined }))
            }}
          >
            <option value="">Selecciona paciente *</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
          {errors.patientId && (
            <p className="mt-1 text-xs text-red-500">{errors.patientId}</p>
          )}
        </div>

        {/* SERVICIO */}
        <div>
          <select
            className={`w-full rounded border p-2 ${errors.serviceId ? "border-red-400 bg-red-50" : ""}`}
            value={selectedServiceId}
            onChange={(e) => handleServiceChange(e.target.value)}
          >
            <option value="">Selecciona servicio *</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — ${service.price} · {service.duration_minutes} min
              </option>
            ))}
          </select>
          {errors.serviceId && (
            <p className="mt-1 text-xs text-red-500">{errors.serviceId}</p>
          )}
        </div>

        {selectedServiceId && (
          <div className="rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-600 flex gap-6">
            <span>💰 Precio: <strong>${selectedPrice}</strong></span>
            <span>⏱ Duración: <strong>{selectedDuration} min</strong></span>
          </div>
        )}

        {/* FECHA */}
        <div>
          <input
            type="datetime-local"
            className={`w-full rounded border p-2 ${errors.date ? "border-red-400 bg-red-50" : ""}`}
            value={date}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => {
              setDate(e.target.value)
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }))
            }}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-500">{errors.date}</p>
          )}
        </div>

        <button
          onClick={createAppointment}
          disabled={saving}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Creando..." : "Crear cita"}
        </button>
      </div>

      {/* AGENDA */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Agenda</h2>

        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-1 text-sm capitalize transition ${
                activeFilter === filter
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter === "todas" ? "Todas" : STATUS_LABELS[filter]}
            </button>
          ))}
        </div>

        {Object.keys(groupedByDate).length === 0 ? (
          <p className="text-gray-400 text-sm">No hay citas para mostrar.</p>
        ) : (
          Object.entries(groupedByDate).map(([day, apts]) => (
            <div key={day} className="space-y-2">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                {day}
              </p>

              {apts.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-2xl border bg-white p-4 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-bold">{appointment.patients?.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.appointment_date).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {appointment.appointment_types && (
                        <p className="text-xs text-gray-400 mt-1">
                          {appointment.appointment_types.name} · ${appointment.appointment_types.price}
                        </p>
                      )}
                    </div>

                    <span className={`text-xs border rounded-full px-3 py-1 font-medium ${STATUS_STYLES[appointment.status]}`}>
                      {STATUS_LABELS[appointment.status]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={appointment.status}
                      onChange={(e) => updateStatus(appointment.id, e.target.value)}
                      className="rounded border p-2 text-sm"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      className="rounded border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* CALENDARIO */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Calendario</h2>
        <CalendarView events={calendarEvents} />
      </div>
    </div>
  )
}