"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/lib/logActivity"

type AppointmentType = {
  id: string
  name: string
  price: number
  duration_minutes: number
}

type FormErrors = {
  name?: string
  price?: string
  duration?: string
}

type EditErrors = {
  editName?: string
  editPrice?: string
  editDuration?: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<AppointmentType[]>([])
  const [clinicId, setClinicId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [editErrors, setEditErrors] = useState<EditErrors>({})
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
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
      .from("appointment_types")
      .select("*")
      .eq("clinic_id", profile.clinic_id)
      .order("created_at", { ascending: true })

    if (data) setServices(data)
  }

  // 👇 NUEVO — validación crear
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio."
    } else if (name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres."
    }

    if (!price) {
      newErrors.price = "El precio es obligatorio."
    } else if (parseFloat(price) <= 0) {
      newErrors.price = "El precio debe ser mayor a cero."
    }

    if (!duration) {
      newErrors.duration = "La duración es obligatoria."
    } else if (parseInt(duration) <= 0) {
      newErrors.duration = "La duración debe ser mayor a cero."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 👇 NUEVO — validación editar
  const validateEdit = (): boolean => {
    const newErrors: EditErrors = {}

    if (!editName.trim()) {
      newErrors.editName = "El nombre es obligatorio."
    } else if (editName.trim().length < 3) {
      newErrors.editName = "El nombre debe tener al menos 3 caracteres."
    }

    if (!editPrice) {
      newErrors.editPrice = "El precio es obligatorio."
    } else if (parseFloat(editPrice) <= 0) {
      newErrors.editPrice = "El precio debe ser mayor a cero."
    }

    if (!editDuration) {
      newErrors.editDuration = "La duración es obligatoria."
    } else if (parseInt(editDuration) <= 0) {
      newErrors.editDuration = "La duración debe ser mayor a cero."
    }

    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createService = async () => {
    if (!validate()) return
    setSaving(true)

    const { data, error } = await supabase
      .from("appointment_types")
      .insert({
        clinic_id: clinicId,
        name: name.trim(),
        price: parseFloat(price),
        duration_minutes: parseInt(duration),
      })
      .select()
      .single()

    if (error) {
      setErrors({ name: "Error al crear el servicio. Intenta de nuevo." })
      setSaving(false)
      return
    }

    if (data) {
      await logActivity({
        clinicId,
        action: "creó servicio",
        entityType: "service",
        entityId: data.id,
        details: name,
      })
    }

    setName("")
    setPrice("")
    setDuration("")
    setErrors({})
    setSaving(false)
    loadServices()
  }

  const saveEdit = async (id: string) => {
    if (!validateEdit()) return
    setEditSaving(true)

    const { error } = await supabase
      .from("appointment_types")
      .update({
        name: editName.trim(),
        price: parseFloat(editPrice),
        duration_minutes: parseInt(editDuration),
      })
      .eq("id", id)

    if (error) {
      setEditErrors({ editName: "Error al guardar. Intenta de nuevo." })
      setEditSaving(false)
      return
    }

    await logActivity({
      clinicId,
      action: "editó servicio",
      entityType: "service",
      entityId: id,
      details: editName,
    })

    setEditingId(null)
    setEditErrors({})
    setEditSaving(false)
    loadServices()
  }

  const deleteService = async (id: string) => {
    const confirm = window.confirm("¿Eliminar este servicio?")
    if (!confirm) return

    const service = services.find((s) => s.id === id)
    await supabase.from("appointment_types").delete().eq("id", id)

    await logActivity({
      clinicId,
      action: "eliminó servicio",
      entityType: "service",
      entityId: id,
      details: service?.name,
    })

    loadServices()
  }

  const startEdit = (service: AppointmentType) => {
    setEditingId(service.id)
    setEditName(service.name)
    setEditPrice(String(service.price))
    setEditDuration(String(service.duration_minutes))
    setEditErrors({})
  }

  return (
    <div className="space-y-8 p-10">
      <div>
        <h1 className="text-4xl font-bold">Servicios</h1>
        <p className="mt-2 text-gray-500">Define los servicios y precios de tu clínica.</p>
      </div>

      {/* FORMULARIO NUEVO SERVICIO */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-2xl font-bold">Nuevo servicio</h2>

        {/* NOMBRE */}
        <div>
          <input
            className={`w-full rounded border p-2 ${errors.name ? "border-red-400 bg-red-50" : ""}`}
            placeholder="Nombre del servicio (ej. Consulta General) *"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
            }}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* PRECIO */}
          <div>
            <input
              className={`w-full rounded border p-2 ${errors.price ? "border-red-400 bg-red-50" : ""}`}
              placeholder="Precio ($) *"
              type="number"
              min="0"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
                if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }))
              }}
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
          </div>

          {/* DURACIÓN */}
          <div>
            <input
              className={`w-full rounded border p-2 ${errors.duration ? "border-red-400 bg-red-50" : ""}`}
              placeholder="Duración (minutos) *"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value)
                if (errors.duration) setErrors((prev) => ({ ...prev, duration: undefined }))
              }}
            />
            {errors.duration && <p className="mt-1 text-xs text-red-500">{errors.duration}</p>}
          </div>
        </div>

        <button
          onClick={createService}
          disabled={saving}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Creando..." : "Crear servicio"}
        </button>
      </div>

      {/* LISTA DE SERVICIOS */}
      <div className="space-y-3">
        {services.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay servicios creados aún.</p>
        ) : (
          services.map((service) => (
            <div key={service.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              {editingId === service.id ? (
                <div className="space-y-3">

                  {/* EDITAR NOMBRE */}
                  <div>
                    <input
                      className={`w-full rounded border p-2 font-bold ${editErrors.editName ? "border-red-400 bg-red-50" : ""}`}
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value)
                        if (editErrors.editName) setEditErrors((prev) => ({ ...prev, editName: undefined }))
                      }}
                    />
                    {editErrors.editName && <p className="mt-1 text-xs text-red-500">{editErrors.editName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* EDITAR PRECIO */}
                    <div>
                      <input
                        className={`w-full rounded border p-2 ${editErrors.editPrice ? "border-red-400 bg-red-50" : ""}`}
                        type="number"
                        min="0"
                        value={editPrice}
                        onChange={(e) => {
                          setEditPrice(e.target.value)
                          if (editErrors.editPrice) setEditErrors((prev) => ({ ...prev, editPrice: undefined }))
                        }}
                        placeholder="Precio ($)"
                      />
                      {editErrors.editPrice && <p className="mt-1 text-xs text-red-500">{editErrors.editPrice}</p>}
                    </div>

                    {/* EDITAR DURACIÓN */}
                    <div>
                      <input
                        className={`w-full rounded border p-2 ${editErrors.editDuration ? "border-red-400 bg-red-50" : ""}`}
                        type="number"
                        min="1"
                        value={editDuration}
                        onChange={(e) => {
                          setEditDuration(e.target.value)
                          if (editErrors.editDuration) setEditErrors((prev) => ({ ...prev, editDuration: undefined }))
                        }}
                        placeholder="Duración (min)"
                      />
                      {editErrors.editDuration && <p className="mt-1 text-xs text-red-500">{editErrors.editDuration}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(service.id)}
                      disabled={editSaving}
                      className="rounded bg-black px-4 py-2 text-white text-sm disabled:opacity-50"
                    >
                      {editSaving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditErrors({}) }}
                      className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{service.name}</p>
                    <p className="text-sm text-gray-500">
                      ${service.price} · {service.duration_minutes} min
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(service)}
                      className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="rounded border border-red-200 px-3 py-1 text-sm text-red-500 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}