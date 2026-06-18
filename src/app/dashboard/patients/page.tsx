"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/lib/logActivity"

type Patient = {
  id: string
  full_name: string
  phone: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [clinicId, setClinicId] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [search, setSearch] = useState("")

  const filteredPatients = patients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  )

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!profile) return

    setClinicId(profile.clinic_id)

    const { data } = await supabase
      .from("patients")
      .select("*")
      .eq("clinic_id", profile.clinic_id)

    if (data) setPatients(data)
  }

  const createPatient = async () => {
    if (!fullName) return

    const { data, error } = await supabase
      .from("patients")
      .insert({
        clinic_id: clinicId,
        full_name: fullName,
        phone,
      })
      .select()
      .single()

    if (!error && data) {
      // 👇 NUEVO — registra la acción
      await logActivity({
        clinicId,
        action: "creó paciente",
        entityType: "patient",
        entityId: data.id,
        details: fullName,
      })
    }

    setFullName("")
    setPhone("")
    loadPatients()
  }

  return (
    <div className="space-y-8 p-10">
      <div>
        <h1 className="text-4xl font-bold">Pacientes</h1>
      </div>

      <input
        className="w-full rounded-xl border p-3 shadow-sm text-sm"
        placeholder=" Buscar por nombre o teléfono..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-4 rounded-2xl border bg-white shadow-sm p-6">
        <h2 className="text-2xl font-bold">Nuevo Paciente</h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Teléfono"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\s-]/g, ""))}
        />

        <button
          onClick={createPatient}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Crear paciente
        </button>
      </div>

      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No se encontraron pacientes.
          </p>
        ) : (
          filteredPatients.map((patient) => (
            <Link
              href={`/dashboard/patients/${patient.id}`}
              key={patient.id}
            >
              <div className="rounded-2xl border bg-white shadow-sm p-4 hover:bg-gray-50 cursor-pointer">
                <p className="font-bold">{patient.full_name}</p>
                <p>{patient.phone}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}