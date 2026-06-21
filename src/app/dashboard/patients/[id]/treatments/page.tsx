"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Service = {
  id: string
  name: string
  price: number
}

type TreatmentItem = {
  id: string
  tooth_number: number | null
  service_id: string | null
  price: number
  status: string
  appointment_types: { name: string } | null
}

type TreatmentPlan = {
  id: string
  title: string
  total_amount: number
  status: string
  created_at: string
  treatment_items: TreatmentItem[]
}

const PLAN_STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
}

const PLAN_STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-300",
  active: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

const ITEM_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completado",
}

export default function TreatmentsPage() {
  const params = useParams()
  const router = useRouter()

  const [patientName, setPatientName] = useState("")
  const [clinicId, setClinicId] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [plans, setPlans] = useState<TreatmentPlan[]>([])

  const [newPlanTitle, setNewPlanTitle] = useState("")

  // Formulario de nuevo item, por plan abierto
  const [openItemForm, setOpenItemForm] = useState<string | null>(null)
  const [itemTooth, setItemTooth] = useState("")
  const [itemServiceId, setItemServiceId] = useState("")
  const [itemPrice, setItemPrice] = useState("")

  useEffect(() => {
    if (params?.id) loadAll()
  }, [params])

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()

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

    if (profile) {
      const { data: servicesData } = await supabase
        .from("appointment_types")
        .select("id, name, price")
        .eq("clinic_id", profile.clinic_id)
        .order("name", { ascending: true })

      if (servicesData) setServices(servicesData)
    }

    loadPlans()
  }

  const loadPlans = async () => {
    const { data } = await supabase
      .from("treatment_plans")
      .select("*, treatment_items(*, appointment_types(name))")
      .eq("patient_id", params.id)
      .order("created_at", { ascending: false })

    if (data) setPlans(data as TreatmentPlan[])
  }

  const createPlan = async () => {
    if (!newPlanTitle.trim()) return

    await supabase.from("treatment_plans").insert({
      patient_id: params.id,
      clinic_id: clinicId,
      title: newPlanTitle.trim(),
      status: "draft",
      total_amount: 0,
    })

    setNewPlanTitle("")
    loadPlans()
  }

  const updatePlanStatus = async (planId: string, status: string) => {
    await supabase.from("treatment_plans").update({ status }).eq("id", planId)
    loadPlans()
  }

  const deletePlan = async (planId: string) => {
    const confirm = window.confirm("¿Eliminar este plan de tratamiento y todos sus procedimientos?")
    if (!confirm) return

    await supabase.from("treatment_plans").delete().eq("id", planId)
    loadPlans()
  }

  const handleServiceChange = (serviceId: string) => {
    setItemServiceId(serviceId)
    const service = services.find((s) => s.id === serviceId)
    if (service) setItemPrice(String(service.price))
  }

  const recalcPlanTotal = async (planId: string) => {
    const { data } = await supabase
      .from("treatment_items")
      .select("price")
      .eq("treatment_plan_id", planId)

    const total = (data || []).reduce((sum, i) => sum + (i.price || 0), 0)

    await supabase
      .from("treatment_plans")
      .update({ total_amount: total })
      .eq("id", planId)
  }

  const addItem = async (planId: string) => {
    if (!itemServiceId || !itemPrice) return

    await supabase.from("treatment_items").insert({
      treatment_plan_id: planId,
      tooth_number: itemTooth ? parseInt(itemTooth) : null,
      service_id: itemServiceId,
      price: parseFloat(itemPrice),
      status: "pending",
    })

    await recalcPlanTotal(planId)

    setItemTooth("")
    setItemServiceId("")
    setItemPrice("")
    setOpenItemForm(null)
    loadPlans()
  }

  const updateItemStatus = async (itemId: string, planId: string, status: string) => {
    await supabase.from("treatment_items").update({ status }).eq("id", itemId)
    loadPlans()
  }

  const deleteItem = async (itemId: string, planId: string) => {
    await supabase.from("treatment_items").delete().eq("id", itemId)
    await recalcPlanTotal(planId)
    loadPlans()
  }

  const getProgress = (items: TreatmentItem[]) => {
    if (items.length === 0) return 0
    const completed = items.filter((i) => i.status === "completed").length
    return Math.round((completed / items.length) * 100)
  }

  return (
    <div className="space-y-6 p-10">
      <div>
        <Link href={`/dashboard/patients/${params.id}`} className="text-sm text-gray-400 hover:text-black">
          ← Volver a {patientName}
        </Link>
        <h1 className="text-3xl font-bold mt-1">Planes de Tratamiento</h1>
      </div>

      {/* NUEVO PLAN */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-bold">Nuevo plan de tratamiento</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border p-2 text-sm"
            placeholder="Ej. Plan Dental Integral"
            value={newPlanTitle}
            onChange={(e) => setNewPlanTitle(e.target.value)}
          />
          <button
            onClick={createPlan}
            disabled={!newPlanTitle.trim()}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Crear plan
          </button>
        </div>
      </div>

      {/* LISTA DE PLANES */}
      {plans.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay planes de tratamiento aún.</p>
      ) : (
        plans.map((plan) => {
          const progress = getProgress(plan.treatment_items)

          return (
            <div key={plan.id} className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">

              {/* HEADER DEL PLAN */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{plan.title}</h3>
                  <p className="text-sm text-gray-500">Total: ${plan.total_amount}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={plan.status}
                    onChange={(e) => updatePlanStatus(plan.id, e.target.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${PLAN_STATUS_STYLES[plan.status]}`}
                  >
                    {Object.entries(PLAN_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="rounded border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50"
                  >
                    Eliminar plan
                  </button>
                </div>
              </div>

              {/* BARRA DE PROGRESO */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progreso</span>
                  <span>{progress}% completado</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-black transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* LISTA DE PROCEDIMIENTOS */}
              <div className="space-y-2">
                {plan.treatment_items.length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin procedimientos aún.</p>
                ) : (
                  plan.treatment_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {item.appointment_types?.name || "Servicio"}
                          {item.tooth_number && (
                            <span className="text-gray-400"> · Pieza {item.tooth_number}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">${item.price}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => updateItemStatus(item.id, plan.id, e.target.value)}
                          className="rounded border p-1.5 text-xs"
                        >
                          {Object.entries(ITEM_STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => deleteItem(item.id, plan.id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* AGREGAR PROCEDIMIENTO */}
              {openItemForm === plan.id ? (
                <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input
                      className="rounded border p-2 text-sm"
                      placeholder="Pieza (opcional)"
                      value={itemTooth}
                      onChange={(e) => setItemTooth(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                    <select
                      className="rounded border p-2 text-sm"
                      value={itemServiceId}
                      onChange={(e) => handleServiceChange(e.target.value)}
                    >
                      <option value="">Selecciona servicio</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <input
                      className="rounded border p-2 text-sm"
                      type="number"
                      placeholder="Precio"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addItem(plan.id)}
                      disabled={!itemServiceId || !itemPrice}
                      className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setOpenItemForm(null)}
                      className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setOpenItemForm(plan.id)}
                  className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  + Agregar procedimiento
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}