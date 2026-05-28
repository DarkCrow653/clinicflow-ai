"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const [clinicName, setClinicName] =
    useState("")

  const [totalPatients, setTotalPatients] =
    useState(0)

  const [totalAppointments,
    setTotalAppointments] =
    useState(0)

  const [todayAppointments,
    setTodayAppointments] =
    useState(0)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
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

    const clinicId = profile.clinic_id

    const { data: clinic } =
      await supabase
        .from("clinics")
        .select("name")
        .eq("id", clinicId)
        .single()

    if (clinic) {
      setClinicName(clinic.name)
    }

    const { count: patientCount } =
      await supabase
        .from("patients")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("clinic_id", clinicId)

    setTotalPatients(patientCount || 0)

    const { count: appointmentCount } =
      await supabase
        .from("appointments")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("clinic_id", clinicId)

    setTotalAppointments(
      appointmentCount || 0
    )

    const today = new Date()
      .toISOString()
      .split("T")[0]

    const { data: todayData } =
      await supabase
        .from("appointments")
        .select("*")
        .eq("clinic_id", clinicId)
        .gte(
          "appointment_date",
          `${today}T00:00:00`
        )
        .lte(
          "appointment_date",
          `${today}T23:59:59`
        )

    setTodayAppointments(
      todayData?.length || 0
    )
  }

  return (
    <div className="space-y-8 p-10">
      <div>
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-xl">
          Clínica: {clinicName}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">
            Pacientes
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {totalPatients}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">
            Total citas
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {totalAppointments}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-500">
            Citas hoy
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {todayAppointments}
          </h2>
        </div>
      </div>
    </div>
  )
}