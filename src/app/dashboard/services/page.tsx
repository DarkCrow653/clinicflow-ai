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

export default function ServicesPage() {
  const [services, setServices] = useState<AppointmentType[]>([])
  const [clinicId, setClinicId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editDuration, setEditDuration] = useState("")

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

  const createService = async () => {
    if (!name || !price || !duration) return

    const { data, error } = await supabase
      .from("appointment_types")
      .insert({
        clinic_id: clinicId,
        name,
        price: parseFloat(price),
        duration_minutes: parseInt(duration),
      })
      .select()
      .single()

    if (!error && data) {
      // 👇 NUEVO
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
    loadServices()
  }

  const saveEdit = async (id: string) => {
    await supabase
      .from("appointment_types")
      .update({
        name: editName,
        price: parseFloat(editPrice),
        duration_minutes: parseInt(editDuration),
      })
      .eq("id", id)

    // 👇 NUEVO
    await logActivity({
      clinicId,
      action: "editó servicio",
      entityType: "service",
      entityId: id,
      details: editName,
    })

    setEditingId(null)
    loadServices()
  }

  const deleteService = async (id: string) => {
    const confirm = window.confirm("¿Eliminar este servicio?")
    if (!confirm) return

    const service = services.find((s) => s.id === id)

    await supabase.from("appointment_types").delete().eq("id", id)

    // 👇 NUEVO
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

        <input
          className="w-full rounded border p-2"
          placeholder="Nombre del servicio (ej. Consulta General)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            className="w-full rounded border p-2"
            placeholder="Precio ($)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            className="w-full rounded border p-2"
            placeholder="Duración (minutos)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <button
          onClick={createService}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Crear servicio
        </button>
      </div>

      {/* LISTA DE SERVICIOS */}
      <div className="space-y-3">
        {services.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay servicios creados aún.</p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              {editingId === service.id ? (
                <div className="space-y-3">
                  <input
                    className="w-full rounded border p-2 font-bold"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="w-full rounded border p-2"
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="Precio ($)"
                    />
                    <input
                      className="w-full rounded border p-2"
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      placeholder="Duración (min)"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(service.id)}
                      className="rounded bg-black px-4 py-2 text-white text-sm"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
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