"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import CalendarView from "@/components/calendar/calendar-view"

type Patient = {
  id: string
  full_name: string
}

type Appointment = {
  id: string
  appointment_date: string
  status: string
  patients: {
    full_name: string
  }
}

export default function AppointmentsPage() {
  const [patients, setPatients] =
    useState<Patient[]>([])

  const [appointments, setAppointments] =
    useState<Appointment[]>([])

  const [patientId, setPatientId] =
    useState("")

  const [date, setDate] =
    useState("")

  const [clinicId, setClinicId] =
    useState("")

    const calendarEvents =
  appointments.map((appointment) => ({
    title:
      appointment.patients?.full_name ||
      "Paciente",
    date: appointment.appointment_date,
  }))

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single()

    if (!profile) return

    setClinicId(profile.clinic_id)

    const { data: patientsData } =
      await supabase
        .from("patients")
        .select("*")
        .eq("clinic_id", profile.clinic_id)

    if (patientsData) {
      setPatients(patientsData)
    }

    const { data: appointmentsData } =
      await supabase
        .from("appointments")
        .select(`
          *,
          patients (
            full_name
          )
        `)
        .eq("clinic_id", profile.clinic_id)
        .order("appointment_date", {
          ascending: true,
        })

    if (appointmentsData) {
      setAppointments(
        appointmentsData as Appointment[]
      )
    }
  }

  const createAppointment =
    async () => {
      if (!patientId || !date) return

      await supabase
        .from("appointments")
        .insert({
          clinic_id: clinicId,
          patient_id: patientId,
          appointment_date: date,
        })

      setPatientId("")
      setDate("")

      loadData()
    }

  return (
    <div className="space-y-8 p-10">
      <div>
        <h1 className="text-4xl font-bold">
          Citas
        </h1>
      </div>

      <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">
          Nueva cita
        </h2>

        <select
          className="w-full rounded border p-2"
          value={patientId}
          onChange={(e) =>
            setPatientId(e.target.value)
          }
        >
          <option value="">
            Selecciona paciente
          </option>

          {patients.map((patient) => (
            <option
              key={patient.id}
              value={patient.id}
            >
              {patient.full_name}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          className="w-full rounded border p-2"
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
        />

        <button
          onClick={createAppointment}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Crear cita
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          Agenda
        </h2>

        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <p className="font-bold">
              {
                appointment.patients
                  ?.full_name
              }
            </p>

            <p>
              {new Date(
                appointment.appointment_date
              ).toLocaleString()}
            </p>

            <p>
              Estado:
              {" "}
              {appointment.status}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          Calendario
        </h2>

        <CalendarView
          events={calendarEvents}
        />
      </div>
    </div>
  )
}