"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import jsPDF from "jspdf"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/lib/logActivity"

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

type Payment = {
  id: string
  amount: number
  payment_date: string
  payment_method: string
  notes: string | null
  receipt_number: string | null
}

type TreatmentPlan = {
  id: string
  title: string
  total_amount: number
  status: string
  created_at: string
  treatment_items: TreatmentItem[]
  treatment_payments: Payment[]
}

type ItemErrors = {
  serviceId?: string
  price?: string
}

type PlanErrors = {
  title?: string
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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
}

const FINANCIAL_STATUS_STYLES: Record<string, string> = {
  "Pendiente": "bg-red-50 text-red-700 border-red-200",
  "Pago Parcial": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Pagado": "bg-green-50 text-green-700 border-green-200",
}

export default function TreatmentsPage() {
  const params = useParams()

  const [patientName, setPatientName] = useState("")
  const [clinicId, setClinicId] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [plans, setPlans] = useState<TreatmentPlan[]>([])

  const [newPlanTitle, setNewPlanTitle] = useState("")
  const [planErrors, setPlanErrors] = useState<PlanErrors>({})
  const [savingPlan, setSavingPlan] = useState(false)

  const [openItemForm, setOpenItemForm] = useState<string | null>(null)
  const [itemTooth, setItemTooth] = useState("")
  const [itemServiceId, setItemServiceId] = useState("")
  const [itemPrice, setItemPrice] = useState("")
  const [itemErrors, setItemErrors] = useState<ItemErrors>({})
  const [savingItem, setSavingItem] = useState(false)

  const [openPaymentForm, setOpenPaymentForm] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("efectivo")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [paymentError, setPaymentError] = useState("")
  const [savingPayment, setSavingPayment] = useState(false)

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
      .select("*, treatment_items(*, appointment_types(name)), treatment_payments(*)")
      .eq("patient_id", params.id)
      .order("created_at", { ascending: false })

    if (data) setPlans(data as TreatmentPlan[])
  }

  // 👇 NUEVO — validar plan
  const validatePlan = (): boolean => {
    const newErrors: PlanErrors = {}
    if (!newPlanTitle.trim()) {
      newErrors.title = "El nombre del plan es obligatorio."
    } else if (newPlanTitle.trim().length < 3) {
      newErrors.title = "El nombre debe tener al menos 3 caracteres."
    }
    setPlanErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createPlan = async () => {
    if (!validatePlan()) return
    setSavingPlan(true)

    await supabase.from("treatment_plans").insert({
      patient_id: params.id,
      clinic_id: clinicId,
      title: newPlanTitle.trim(),
      status: "draft",
      total_amount: 0,
    })

    setNewPlanTitle("")
    setPlanErrors({})
    setSavingPlan(false)
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
    if (itemErrors.serviceId) setItemErrors((prev) => ({ ...prev, serviceId: undefined }))
    const service = services.find((s) => s.id === serviceId)
    if (service) setItemPrice(String(service.price))
  }

  const recalcPlanTotal = async (planId: string) => {
    const { data } = await supabase
      .from("treatment_items")
      .select("price")
      .eq("treatment_plan_id", planId)

    const total = (data || []).reduce((sum, i) => sum + (i.price || 0), 0)
    await supabase.from("treatment_plans").update({ total_amount: total }).eq("id", planId)
  }

  // 👇 NUEVO — validar procedimiento
  const validateItem = (): boolean => {
    const newErrors: ItemErrors = {}

    if (!itemServiceId) newErrors.serviceId = "Selecciona un servicio."

    if (!itemPrice) {
      newErrors.price = "El precio es obligatorio."
    } else if (parseFloat(itemPrice) <= 0) {
      newErrors.price = "El precio debe ser mayor a cero."
    }

    setItemErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addItem = async (planId: string) => {
    if (!validateItem()) return
    setSavingItem(true)

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
    setItemErrors({})
    setSavingItem(false)
    setOpenItemForm(null)
    loadPlans()
  }

  const updateItemStatus = async (itemId: string, planId: string, status: string) => {
    await supabase
      .from("treatment_items")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", itemId)
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

  const getTotalPaid = (plan: TreatmentPlan) =>
    plan.treatment_payments.reduce((sum, p) => sum + p.amount, 0)

  const getBalance = (plan: TreatmentPlan) =>
    plan.total_amount - getTotalPaid(plan)

  const getFinancialStatus = (plan: TreatmentPlan) => {
    const paid = getTotalPaid(plan)
    if (paid <= 0) return "Pendiente"
    if (paid < plan.total_amount) return "Pago Parcial"
    return "Pagado"
  }

  const openAddPayment = (planId: string) => {
    setOpenPaymentForm(planId)
    setPaymentAmount("")
    setPaymentMethod("efectivo")
    setPaymentNotes("")
    setPaymentError("")
  }

  // 👇 NUEVO — validación de pago mejorada
  const addPayment = async (plan: TreatmentPlan) => {
    const amount = parseFloat(paymentAmount)

    if (!paymentAmount.trim()) {
      setPaymentError("El monto es obligatorio.")
      return
    }

    if (isNaN(amount) || amount <= 0) {
      setPaymentError("El monto debe ser mayor a cero.")
      return
    }

    const balance = getBalance(plan)

    if (balance <= 0) {
      setPaymentError("Este plan ya está completamente pagado.")
      return
    }

    if (amount > balance) {
      setPaymentError(`El pago ($${amount}) supera el saldo pendiente ($${balance}).`)
      return
    }

    setSavingPayment(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: receiptData } = await supabase.rpc("generate_receipt_number")

    const { error } = await supabase.from("treatment_payments").insert({
      treatment_plan_id: plan.id,
      amount,
      payment_method: paymentMethod,
      notes: paymentNotes || null,
      created_by: user?.id,
      receipt_number: receiptData,
    })

    if (error) {
      setPaymentError(error.message)
      setSavingPayment(false)
      return
    }

    await logActivity({
      clinicId,
      action: `registró un pago de $${amount} para`,
      entityType: "payment",
      details: patientName,
    })

    setSavingPayment(false)
    setOpenPaymentForm(null)
    loadPlans()
  }

  const deletePayment = async (paymentId: string, amount: number) => {
    const confirm = window.confirm("¿Eliminar este pago? Esta acción no se puede deshacer.")
    if (!confirm) return

    await supabase.from("treatment_payments").delete().eq("id", paymentId)

    await logActivity({
      clinicId,
      action: `eliminó un pago de $${amount} de`,
      entityType: "payment",
      details: patientName,
    })

    loadPlans()
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  const generateReceiptPDF = async (plan: TreatmentPlan, payment: Payment) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user?.id || "")
      .single()

    if (!profile) return

    const { data: clinic } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", profile.clinic_id)
      .single()

    const doc = new jsPDF()
    let y = 20

    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(clinic?.name || "Clínica", 20, y)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    y += 7
    if (clinic?.address) { doc.text(clinic.address, 20, y); y += 5 }
    if (clinic?.phone) { doc.text(`Tel: ${clinic.phone}`, 20, y); y += 5 }
    if (clinic?.email) { doc.text(clinic.email, 20, y); y += 5 }
    y += 5
    doc.setDrawColor(200)
    doc.line(20, y, 190, y)
    y += 10
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Recibo de Pago", 20, y)
    doc.setFontSize(11)
    doc.text(payment.receipt_number || "—", 150, y)
    y += 12
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`Paciente: ${patientName}`, 20, y); y += 6
    doc.text(`Tratamiento: ${plan.title}`, 20, y); y += 6
    doc.text(`Fecha de pago: ${formatDate(payment.payment_date)}`, 20, y); y += 6
    doc.text(`Método de pago: ${PAYMENT_METHOD_LABELS[payment.payment_method]}`, 20, y); y += 12
    doc.setDrawColor(200)
    doc.line(20, y, 190, y)
    y += 10
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(`Monto pagado: $${payment.amount}`, 20, y); y += 15
    if (payment.notes) {
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Observaciones: ${payment.notes}`, 20, y); y += 15
    }
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text("Gracias por su pago.", 20, y)
    doc.save(`recibo_${payment.receipt_number}.pdf`)

    await logActivity({
      clinicId,
      action: `generó recibo ${payment.receipt_number} para`,
      entityType: "payment",
      details: patientName,
    })
  }

  const generateBudgetPDF = async (plan: TreatmentPlan) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user?.id || "")
      .single()

    if (!profile) return

    const { data: clinic } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", profile.clinic_id)
      .single()

    const doc = new jsPDF()
    let y = 20
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(clinic?.name || "Clínica", 20, y)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    y += 7
    if (clinic?.address) { doc.text(clinic.address, 20, y); y += 5 }
    if (clinic?.phone) { doc.text(`Tel: ${clinic.phone}`, 20, y); y += 5 }
    if (clinic?.email) { doc.text(clinic.email, 20, y); y += 5 }
    y += 5
    doc.setDrawColor(200)
    doc.line(20, y, 190, y)
    y += 10
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Presupuesto de Tratamiento", 20, y); y += 10
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`Paciente: ${patientName}`, 20, y); y += 6
    doc.text(`Plan: ${plan.title}`, 20, y); y += 6
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 20, y); y += 12
    doc.setFont("helvetica", "bold")
    doc.text("Procedimiento", 20, y)
    doc.text("Pieza", 120, y)
    doc.text("Precio", 165, y)
    y += 3
    doc.line(20, y, 190, y)
    y += 7
    doc.setFont("helvetica", "normal")
    plan.treatment_items.forEach((item) => {
      doc.text(item.appointment_types?.name || "Servicio", 20, y)
      doc.text(item.tooth_number ? String(item.tooth_number) : "-", 120, y)
      doc.text(`$${item.price}`, 165, y)
      y += 7
    })
    y += 3
    doc.line(20, y, 190, y)
    y += 8
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text(`Total: $${plan.total_amount}`, 150, y)
    y += 20
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(150)
    doc.text("Este presupuesto es una estimación y puede variar según evolución del tratamiento.", 20, y)
    doc.save(`presupuesto_${patientName.replace(/\s/g, "_")}_${Date.now()}.pdf`)
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
        <div>
          <div className="flex gap-2">
            <input
              className={`flex-1 rounded border p-2 text-sm ${planErrors.title ? "border-red-400 bg-red-50" : ""}`}
              placeholder="Ej. Plan Dental Integral *"
              value={newPlanTitle}
              onChange={(e) => {
                setNewPlanTitle(e.target.value)
                if (planErrors.title) setPlanErrors({})
              }}
            />
            <button
              onClick={createPlan}
              disabled={savingPlan}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {savingPlan ? "Creando..." : "Crear plan"}
            </button>
          </div>
          {planErrors.title && (
            <p className="mt-1 text-xs text-red-500">{planErrors.title}</p>
          )}
        </div>
      </div>

      {/* LISTA DE PLANES */}
      {plans.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay planes de tratamiento aún.</p>
      ) : (
        plans.map((plan) => {
          const progress = getProgress(plan.treatment_items)
          const totalPaid = getTotalPaid(plan)
          const balance = getBalance(plan)
          const financialStatus = getFinancialStatus(plan)

          return (
            <div key={plan.id} className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{plan.title}</h3>
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
                    onClick={() => generateBudgetPDF(plan)}
                    className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    📄 Presupuesto
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="rounded border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50"
                  >
                    Eliminar plan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Total Tratamiento</p>
                  <p className="text-lg font-bold">${plan.total_amount}</p>
                </div>
                <div className="rounded-xl border bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Pagado</p>
                  <p className="text-lg font-bold text-green-600">${totalPaid}</p>
                </div>
                <div className="rounded-xl border bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Pendiente</p>
                  <p className="text-lg font-bold text-red-600">${balance}</p>
                </div>
                <div className="rounded-xl border bg-gray-50 p-3 flex flex-col">
                  <p className="text-xs text-gray-500">Estado</p>
                  <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-medium w-fit ${FINANCIAL_STATUS_STYLES[financialStatus]}`}>
                    {financialStatus}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progreso de procedimientos</span>
                  <span>{progress}% completado</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-black transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Procedimientos</p>
                {plan.treatment_items.length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin procedimientos aún.</p>
                ) : (
                  plan.treatment_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border p-3">
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

              {openItemForm === plan.id ? (
                <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input
                      className="rounded border p-2 text-sm"
                      placeholder="Pieza (opcional)"
                      value={itemTooth}
                      onChange={(e) => setItemTooth(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                    <div>
                      <select
                        className={`w-full rounded border p-2 text-sm ${itemErrors.serviceId ? "border-red-400 bg-red-50" : ""}`}
                        value={itemServiceId}
                        onChange={(e) => handleServiceChange(e.target.value)}
                      >
                        <option value="">Selecciona servicio *</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      {itemErrors.serviceId && (
                        <p className="mt-1 text-xs text-red-500">{itemErrors.serviceId}</p>
                      )}
                    </div>
                    <div>
                      <input
                        className={`w-full rounded border p-2 text-sm ${itemErrors.price ? "border-red-400 bg-red-50" : ""}`}
                        type="number"
                        placeholder="Precio *"
                        value={itemPrice}
                        min="0"
                        onChange={(e) => {
                          setItemPrice(e.target.value)
                          if (itemErrors.price) setItemErrors((prev) => ({ ...prev, price: undefined }))
                        }}
                      />
                      {itemErrors.price && (
                        <p className="mt-1 text-xs text-red-500">{itemErrors.price}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addItem(plan.id)}
                      disabled={savingItem}
                      className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {savingItem ? "Agregando..." : "Agregar"}
                    </button>
                    <button
                      onClick={() => { setOpenItemForm(null); setItemErrors({}) }}
                      className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setOpenItemForm(plan.id); setItemErrors({}) }}
                  className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  + Agregar procedimiento
                </button>
              )}

              {/* HISTORIAL DE PAGOS */}
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-semibold text-gray-700 pt-2">Historial de Pagos</p>
                {plan.treatment_payments.length === 0 ? (
                  <p className="text-gray-400 text-sm">No hay pagos registrados aún.</p>
                ) : (
                  plan.treatment_payments
                    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                    .map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between rounded-xl border p-3">
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(payment.payment_date)} · {PAYMENT_METHOD_LABELS[payment.payment_method]}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${payment.amount}
                            {payment.notes && <span> — {payment.notes}</span>}
                          </p>
                          <p className="text-xs text-gray-400">{payment.receipt_number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => generateReceiptPDF(plan, payment)}
                            className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
                          >
                            🧾 Recibo
                          </button>
                          <button
                            onClick={() => deletePayment(payment.id, payment.amount)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* FORMULARIO AGREGAR PAGO */}
              {openPaymentForm === plan.id ? (
                <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <input
                        className={`w-full rounded border p-2 text-sm ${paymentError && !paymentAmount ? "border-red-400 bg-red-50" : ""}`}
                        type="number"
                        placeholder="Monto *"
                        min="0"
                        value={paymentAmount}
                        onChange={(e) => {
                          setPaymentAmount(e.target.value)
                          if (paymentError) setPaymentError("")
                        }}
                      />
                    </div>
                    <select
                      className="rounded border p-2 text-sm"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                    </select>
                  </div>
                  <input
                    className="w-full rounded border p-2 text-sm"
                    placeholder="Observaciones (opcional)"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                  />

                  {/* 👇 Muestra el saldo disponible */}
                  <p className="text-xs text-gray-500">
                    Saldo pendiente: <strong>${balance}</strong>
                  </p>

                  {paymentError && (
                    <p className="text-sm text-red-500">{paymentError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => addPayment(plan)}
                      disabled={savingPayment}
                      className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {savingPayment ? "Registrando..." : "Registrar Pago"}
                    </button>
                    <button
                      onClick={() => setOpenPaymentForm(null)}
                      className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openAddPayment(plan.id)}
                  className="rounded bg-black px-4 py-2 text-sm text-white"
                >
                  + Agregar Pago
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}