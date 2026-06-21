"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/lib/logActivity"
import Link from "next/link"

type Patient = {
  id: string
  full_name: string
  phone: string
  email: string
}

type PatientRecord = {
  id: string
  consultation_date: string
  chief_complaint: string | null
  diagnosis: string | null
  treatment: string | null
  observations: string | null
  next_followup: string | null
  created_by_email: string | null
  created_at: string
}

const emptyForm = {
  consultation_date: new Date().toISOString().split("T")[0],
  chief_complaint: "",
  diagnosis: "",
  treatment: "",
  observations: "",
  next_followup: "",
}

export default function PatientDetailPage() {
  const params = useParams()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [clinicId, setClinicId] = useState("")
  const [userId, setUserId] = useState("")

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params?.id) {
      loadPatient()
      loadRecords()
    }
  }, [params])

  const loadPatient = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user?.id || "")
      .single()

    if (profile) setClinicId(profile.clinic_id)

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

  const loadRecords = async () => {
    const { data } = await supabase
      .from("patient_records_with_author")
      .select("*")
      .eq("patient_id", params.id)
      .order("consultation_date", { ascending: false })

    if (data) setRecords(data)
  }

  const savePatient = async () => {
    if (!patient) return

    const { error } = await supabase
      .from("patients")
      .update({ full_name: editName, phone: editPhone, email: editEmail })
      .eq("id", String(patient.id))
      .select()

    if (error) { alert(error.message); return }

    await logActivity({
      clinicId,
      action: "editó datos de paciente",
      entityType: "patient",
      entityId: patient.id,
      details: editName,
    })

    setPatient({ ...patient, full_name: editName, phone: editPhone, email: editEmail })
    setIsEditing(false)
  }

  const openNewForm = () => {
    setForm(emptyForm)
    setEditingRecordId(null)
    setShowForm(true)
  }

  const openEditForm = (record: PatientRecord) => {
    setForm({
      consultation_date: record.consultation_date,
      chief_complaint: record.chief_complaint || "",
      diagnosis: record.diagnosis || "",
      treatment: record.treatment || "",
      observations: record.observations || "",
      next_followup: record.next_followup || "",
    })
    setEditingRecordId(record.id)
    setShowForm(true)
  }

  const saveRecord = async () => {
    if (!patient) return
    setSaving(true)

    if (editingRecordId) {
      const { error } = await supabase
        .from("patient_records")
        .update({
          consultation_date: form.consultation_date,
          chief_complaint: form.chief_complaint,
          diagnosis: form.diagnosis,
          treatment: form.treatment,
          observations: form.observations,
          next_followup: form.next_followup || null,
        })
        .eq("id", editingRecordId)

      if (error) { alert(error.message); setSaving(false); return }

      await logActivity({
        clinicId,
        action: "editó consulta de",
        entityType: "patient_record",
        entityId: editingRecordId,
        details: patient.full_name,
      })
    } else {
      const { data, error } = await supabase
        .from("patient_records")
        .insert({
          patient_id: patient.id,
          clinic_id: clinicId,
          created_by: userId,
          consultation_date: form.consultation_date,
          chief_complaint: form.chief_complaint,
          diagnosis: form.diagnosis,
          treatment: form.treatment,
          observations: form.observations,
          next_followup: form.next_followup || null,
        })
        .select()
        .single()

      if (error) { alert(error.message); setSaving(false); return }

      await logActivity({
        clinicId,
        action: "registró nueva consulta para",
        entityType: "patient_record",
        entityId: data?.id,
        details: patient.full_name,
      })
    }

    setSaving(false)
    setShowForm(false)
    setEditingRecordId(null)
    loadRecords()
  }

  const deleteRecord = async (recordId: string) => {
    const confirm = window.confirm("¿Eliminar esta consulta? Esta acción no se puede deshacer.")
    if (!confirm) return

    const { error } = await supabase.from("patient_records").delete().eq("id", recordId)
    if (error) { alert(error.message); return }

    await logActivity({
      clinicId,
      action: "eliminó consulta de",
      entityType: "patient_record",
      entityId: recordId,
      details: patient?.full_name,
    })

    loadRecords()
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
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
              type="tel"
              onChange={(e) => setEditPhone(e.target.value.replace(/[^0-9+\s-]/g, ""))}
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

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setIsEditing(true)}
                className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Editar datos
              </button>

              {/* 👇 NUEVO — botón al odontograma */}
              <Link
                href={`/dashboard/patients/${patient.id}/odontogram`}
                className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
              >
                🦷 Ver odontograma
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* HISTORIAL CLÍNICO */}
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Historial Clínico</h2>
          <button
            onClick={openNewForm}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            + Nueva consulta
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-gray-50 p-5 space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">
              {editingRecordId ? "Editar consulta" : "Nueva consulta"}
            </h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs text-gray-500">Fecha de consulta</label>
                <input
                  type="date"
                  className="w-full rounded border p-2 text-sm"
                  value={form.consultation_date}
                  onChange={(e) => setForm({ ...form, consultation_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Próxima revisión (opcional)</label>
                <input
                  type="date"
                  className="w-full rounded border p-2 text-sm"
                  value={form.next_followup}
                  onChange={(e) => setForm({ ...form, next_followup: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500">Motivo de consulta</label>
              <textarea
                className="w-full rounded border p-2 text-sm min-h-[60px]"
                value={form.chief_complaint}
                onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })}
                placeholder="¿Por qué vino el paciente?"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Diagnóstico</label>
              <textarea
                className="w-full rounded border p-2 text-sm min-h-[60px]"
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Tratamiento</label>
              <textarea
                className="w-full rounded border p-2 text-sm min-h-[60px]"
                value={form.treatment}
                onChange={(e) => setForm({ ...form, treatment: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Observaciones</label>
              <textarea
                className="w-full rounded border p-2 text-sm min-h-[60px]"
                value={form.observations}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={saveRecord}
                disabled={saving}
                className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar consulta"}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingRecordId(null) }}
                className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* LISTA CRONOLÓGICA */}
        <div className="space-y-3 mt-4">
          {records.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay consultas registradas aún.</p>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Consulta {formatDate(record.consultation_date)}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditForm(record)}
                      className="text-xs text-gray-500 hover:text-black"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {record.chief_complaint && (
                  <p className="text-sm"><span className="text-gray-500">Motivo:</span> {record.chief_complaint}</p>
                )}
                {record.diagnosis && (
                  <p className="text-sm"><span className="text-gray-500">Diagnóstico:</span> {record.diagnosis}</p>
                )}
                {record.treatment && (
                  <p className="text-sm"><span className="text-gray-500">Tratamiento:</span> {record.treatment}</p>
                )}
                {record.observations && (
                  <p className="text-sm"><span className="text-gray-500">Observaciones:</span> {record.observations}</p>
                )}
                {record.next_followup && (
                  <p className="text-sm"><span className="text-gray-500">Próxima revisión:</span> {formatDate(record.next_followup)}</p>
                )}

                <p className="text-xs text-gray-400 pt-1">
                  Registrado por {record.created_by_email || "desconocido"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}