"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Patient = {
  id: string
  full_name: string
  phone: string
  email: string
  notes: string
}

export default function PatientDetailPage() {
  const params = useParams()

  const [patient, setPatient] =
    useState<Patient | null>(null)

  const [notes, setNotes] =
    useState("")

  useEffect(() => {
    if (params?.id) {
      loadPatient()
    }
  }, [params])

  const loadPatient = async () => {
    console.log("PARAMS", params)

    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", params.id)
      .single()

    console.log("DATA", data)
    console.log("ERROR", error)

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setPatient(data)
      setNotes(data.notes || "")
    }
  }

  const saveNotes = async () => {
    if (!patient) return

    await supabase
      .from("patients")
      .update({
        notes,
      })
      .eq("id", patient.id)

    alert("Notas guardadas")
  }

  if (!patient) {
    return (
      <div className="p-10">
        Cargando...
      </div>
    )
  }

  return (
    <div className="space-y-6 p-10">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          {patient.full_name}
        </h1>

        <p>{patient.phone}</p>

        <p>{patient.email}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">
          Historial Clínico
        </h2>

        <textarea
          className="min-h-[250px] w-full rounded border p-4"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
        />

        <button
          onClick={saveNotes}
          className="mt-4 rounded bg-black px-4 py-2 text-white"
        >
          Guardar
        </button>
      </div>
    </div>
  )
}