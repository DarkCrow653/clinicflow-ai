"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Patient = {
  id: string
  full_name: string
  phone: string
  email: string
}

type ClinicalEntry = {
  id: string
  content: string
  created_at: string
}

export default function PatientDetailPage() {
  const params = useParams()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [entries, setEntries] = useState<ClinicalEntry[]>([])
  const [newEntry, setNewEntry] = useState("")
  const [saving, setSaving] = useState(false)

  // Edición de datos del paciente
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")

  useEffect(() => {
    if (params?.id) {
      loadPatient()
      loadEntries()
    }
  }, [params])

  const loadPatient = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) return

    if (data) {
      setPatient(data)
      setEditName(data.full_name || "")
      setEditPhone(data.phone || "")
      setEditEmail(data.email || "")
    }
  }

  const loadEntries = async () => {
    const { data } = await supabase
      .from("clinical_entries")
      .select("*")
      .eq("patient_id", params.id)
      .order("created_at", { ascending: false })

    if (data) setEntries(data)
  }

  const savePatient = async () => {
    if (!patient) return

    const { error } = await supabase
      .from("patients")
      .update({ full_name: editName, phone: editPhone, email: editEmail })
      .eq("id", String(patient.id))
      .select()

    if (error) { alert(error.message); return }

    setPatient({ ...patient, full_name: editName, phone: editPhone, email: editEmail })
    setIsEditing(false)
  }

  const addEntry = async () => {
    if (!newEntry.trim() || !patient) return
    setSaving(true)

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", (await supabase.auth.getUser()).data.user?.id || "")
      .single()

    const { error } = await supabase
      .from("clinical_entries")
      .insert({
        patient_id: patient.id,
        clinic_id: profile?.clinic_id,
        content: newEntry.trim(),
      })

    if (error) { alert(error.message); setSaving(false); return }

    setNewEntry("")
    setSaving(false)
    loadEntries()
  }

  const deleteEntry = async (entryId: string) => {
    const confirm = window.confirm("¿Eliminar esta entrada?")
    if (!confirm) return

    await supabase.from("clinical_entries").delete().eq("id", entryId)
    loadEntries()
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  if (!patient) return <div className="p-10">Cargando...</div>

  return (
    <div className="space-y-6 p-10">

      {/* DATOS DEL PACIENTE */}
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              className="w-full rounded border p-2 text-xl font-bold"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nombre completo"
            />
            <input
              className="w-full rounded border p-2"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Teléfono"
            />
            <input
              className="w-full rounded border p-2"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
            />
            <div className="flex gap-2">
              <button
                onClick={savePatient}
                className="rounded bg-black px-4 py-2 text-white"
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded border px-4 py-2 text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{patient.full_name}</h1>
            <p className="text-gray-600">{patient.phone}</p>
            <p className="text-gray-600">{patient.email}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 rounded border px-4 py-2 text-sm hover:bg-gray-50"
            >
              ✏️ Editar datos
            </button>
          </div>
        )}
      </div>

      {/* HISTORIAL CLÍNICO */}
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Historial Clínico</h2>

        {/* NUEVA ENTRADA */}
        <div className="space-y-2">
          <textarea
            className="min-h-[120px] w-full rounded border p-4 text-sm"
            placeholder="Escribe una nueva entrada clínica..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
          />
          <button
            onClick={addEntry}
            disabled={saving || !newEntry.trim()}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Agregar entrada"}
          </button>
        </div>

        {/* LISTA DE ENTRADAS */}
        <div className="space-y-3 mt-4">
          {entries.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay entradas clínicas aún.</p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">
                    {formatDate(entry.created_at)}
                  </span>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}