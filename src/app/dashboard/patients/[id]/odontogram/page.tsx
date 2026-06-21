"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type ToothRecord = {
  tooth_number: number
  status: string
  notes: string | null
  updated_at: string
  updated_by_email: string | null
}

const STATUS_OPTIONS = [
  { value: "sana", label: "Sana" },
  { value: "caries", label: "Caries" },
  { value: "obturacion", label: "Obturación" },
  { value: "endodoncia", label: "Endodoncia" },
  { value: "corona", label: "Corona" },
  { value: "implante", label: "Implante" },
  { value: "ausente", label: "Ausente" },
  { value: "extraccion_indicada", label: "Extracción indicada" },
  { value: "protesis", label: "Prótesis" },
]

const STATUS_COLORS: Record<string, string> = {
  sana: "bg-white border-gray-300 text-gray-700",
  caries: "bg-red-100 border-red-400 text-red-700",
  obturacion: "bg-blue-100 border-blue-400 text-blue-700",
  endodoncia: "bg-purple-100 border-purple-400 text-purple-700",
  corona: "bg-yellow-100 border-yellow-400 text-yellow-700",
  implante: "bg-teal-100 border-teal-400 text-teal-700",
  ausente: "bg-gray-200 border-gray-400 text-gray-400",
  extraccion_indicada: "bg-orange-100 border-orange-400 text-orange-700",
  protesis: "bg-pink-100 border-pink-400 text-pink-700",
}

const UPPER_ROW = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_ROW = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

export default function OdontogramPage() {
  const params = useParams()

  const [patientName, setPatientName] = useState("")
  const [clinicId, setClinicId] = useState("")
  const [userId, setUserId] = useState("")
  const [records, setRecords] = useState<Record<number, ToothRecord>>({})
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [formStatus, setFormStatus] = useState("sana")
  const [formNotes, setFormNotes] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params?.id) loadAll()
  }, [params])

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user?.id || "")
      .single()

    if (profile) setClinicId(profile.clinic_id)

    const { data: patient } = await supabase
      .from("patients")
      .select("full_name")
      .eq("id", params.id)
      .single()

    if (patient) setPatientName(patient.full_name)

    loadRecords()
  }

  const loadRecords = async () => {
    const { data } = await supabase
      .from("tooth_records_with_author")
      .select("*")
      .eq("patient_id", params.id)

    if (data) {
      const map: Record<number, ToothRecord> = {}
      data.forEach((r: ToothRecord) => { map[r.tooth_number] = r })
      setRecords(map)
    }
  }

  const selectTooth = (toothNumber: number) => {
    setSelectedTooth(toothNumber)
    const existing = records[toothNumber]
    setFormStatus(existing?.status || "sana")
    setFormNotes(existing?.notes || "")
  }

  const saveTooth = async () => {
    if (!selectedTooth) return
    setSaving(true)

    const { error } = await supabase
      .from("tooth_records")
      .upsert({
        patient_id: params.id,
        clinic_id: clinicId,
        tooth_number: selectedTooth,
        status: formStatus,
        notes: formNotes,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }, { onConflict: "patient_id,tooth_number" })

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setSelectedTooth(null)
    loadRecords()
  }

  const renderTooth = (toothNumber: number) => {
    const record = records[toothNumber]
    const status = record?.status || "sana"
    const colorClass = STATUS_COLORS[status]

    return (
      <button
        key={toothNumber}
        onClick={() => selectTooth(toothNumber)}
        className={`flex h-14 w-12 flex-col items-center justify-center rounded-lg border-2 text-xs font-semibold transition hover:scale-105 ${colorClass}`}
      >
        <span>{toothNumber}</span>
      </button>
    )
  }

  return (
    <div className="space-y-6 p-10">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/dashboard/patients/${params.id}`} className="text-sm text-gray-400 hover:text-black">
            ← Volver a {patientName}
          </Link>
          <h1 className="text-3xl font-bold mt-1">Odontograma</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

        {/* ODONTOGRAMA */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm space-y-8">

          {/* Arcada superior */}
          <div>
            <p className="text-xs text-gray-400 mb-2 text-center">Arcada superior</p>
            <div className="flex justify-center gap-1 flex-wrap">
              {UPPER_ROW.map(renderTooth)}
            </div>
          </div>

          <div className="border-t" />

          {/* Arcada inferior */}
          <div>
            <div className="flex justify-center gap-1 flex-wrap">
              {LOWER_ROW.map(renderTooth)}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Arcada inferior</p>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {STATUS_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2 text-xs text-gray-600">
                <span className={`inline-block h-3 w-3 rounded-full border-2 ${STATUS_COLORS[opt.value]}`} />
                {opt.label}
              </div>
            ))}
          </div>
        </div>

        {/* PANEL LATERAL */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4 h-fit">
          {selectedTooth === null ? (
            <p className="text-gray-400 text-sm">
              Selecciona una pieza dental para ver o editar su estado.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400">Pieza dental</p>
                <h2 className="text-2xl font-bold">{selectedTooth}</h2>
              </div>

              <div>
                <label className="text-xs text-gray-500">Estado</label>
                <select
                  className="w-full rounded border p-2 text-sm mt-1"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500">Observaciones</label>
                <textarea
                  className="w-full rounded border p-2 text-sm mt-1 min-h-[100px]"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Detalles adicionales..."
                />
              </div>

              {records[selectedTooth] && (
                <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
                  <p>Última actualización: {new Date(records[selectedTooth].updated_at).toLocaleString("es-ES")}</p>
                  <p>Profesional: {records[selectedTooth].updated_by_email || "Desconocido"}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={saveTooth}
                  disabled={saving}
                  className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => setSelectedTooth(null)}
                  className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}