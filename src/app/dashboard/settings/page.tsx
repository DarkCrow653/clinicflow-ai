"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage() {
  const [clinicId, setClinicId] = useState("")
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadClinic()
  }, [])

  const loadClinic = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!profile) return
    setClinicId(profile.clinic_id)

    const { data: clinic } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", profile.clinic_id)
      .single()

    if (clinic) {
      setName(clinic.name || "")
      setAddress(clinic.address || "")
      setPhone(clinic.phone || "")
      setEmail(clinic.email || "")
      setLogoUrl(clinic.logo_url || "")
    }
  }

  const save = async () => {
    setSaving(true)

    const { error } = await supabase
      .from("clinics")
      .update({ name, address, phone, email, logo_url: logoUrl })
      .eq("id", clinicId)

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8 p-10">
      <div>
        <h1 className="text-4xl font-bold">Configuración</h1>
        <p className="mt-2 text-gray-500">
          Estos datos aparecerán en los presupuestos y documentos generados.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4 max-w-xl">
        <div>
          <label className="text-xs text-gray-500">Nombre de la clínica</label>
          <input
            className="w-full rounded border p-2 mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Dirección</label>
          <input
            className="w-full rounded border p-2 mt-1"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, número, ciudad"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Teléfono</label>
            <input
              className="w-full rounded border p-2 mt-1"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\s-]/g, ""))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Email</label>
            <input
              className="w-full rounded border p-2 mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">URL del logo (opcional)</label>
          <input
            className="w-full rounded border p-2 mt-1"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Sube tu logo a un servicio como Imgur o Cloudinary y pega el link aquí.
          </p>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar configuración"}
        </button>
      </div>
    </div>
  )
}