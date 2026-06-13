"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Invitation = {
  id: string
  clinic_id: string
  email: string
  role: string
  accepted: boolean
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()

  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState<"register" | "login">("register")

  useEffect(() => {
    loadInvitation()
  }, [params])

  const loadInvitation = async () => {
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", params.token)
      .eq("accepted", false)
      .single()

    if (error || !data) {
      setError("Esta invitación no existe o ya fue usada.")
      setLoading(false)
      return
    }

    setInvitation(data)
    setEmail(data.email)
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!invitation) return
    setSubmitting(true)

    // 1. Crear cuenta
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setError("No se pudo crear el usuario.")
      setSubmitting(false)
      return
    }

    // 2. Crear perfil
    await supabase.from("profiles").insert({
      id: userId,
      clinic_id: invitation.clinic_id,
      role: invitation.role,
    })

    // 3. Agregar al staff
    await supabase.from("staff_members").insert({
      clinic_id: invitation.clinic_id,
      user_id: userId,
      role: invitation.role,
    })

    // 4. Marcar invitación como aceptada
    await supabase
      .from("invitations")
      .update({ accepted: true })
      .eq("id", invitation.id)

    setSubmitting(false)
    router.push("/dashboard")
  }

  const handleLogin = async () => {
    if (!invitation) return
    setSubmitting(true)

    // 1. Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setError("No se pudo iniciar sesión.")
      setSubmitting(false)
      return
    }

    // 2. Agregar al staff si no existe
    await supabase.from("staff_members").upsert({
      clinic_id: invitation.clinic_id,
      user_id: userId,
      role: invitation.role,
    }, { onConflict: "clinic_id,user_id" })

    // 3. Actualizar perfil con nueva clínica y rol
    await supabase
      .from("profiles")
      .update({
        clinic_id: invitation.clinic_id,
        role: invitation.role,
      })
      .eq("id", userId)

    // 4. Marcar invitación como aceptada
    await supabase
      .from("invitations")
      .update({ accepted: true })
      .eq("id", invitation.id)

    setSubmitting(false)
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Verificando invitación...</p>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm text-center space-y-4 max-w-md w-full">
          <p className="text-2xl">❌</p>
          <h1 className="text-xl font-bold">Invitación inválida</h1>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="rounded-2xl border bg-white p-8 shadow-sm space-y-6 w-full max-w-md">

        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold">ClinicFlow</h1>
          <p className="text-gray-500 text-sm">Has sido invitado a unirte a una clínica</p>
        </div>

        {/* BADGE DE ROL */}
        <div className="rounded-xl bg-gray-50 border p-4 text-center">
          <p className="text-sm text-gray-500">Tu rol será</p>
          <p className="font-bold text-lg capitalize mt-1">
            {invitation?.role === "admin" ? "Admin" :
             invitation?.role === "doctor" ? "Doctor" : "Recepción"}
          </p>
        </div>

        {/* TOGGLE REGISTRO / LOGIN */}
        <div className="flex rounded-xl border overflow-hidden">
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "register" ? "bg-black text-white" : "bg-white text-gray-600"
            }`}
          >
            Crear cuenta
          </button>
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "login" ? "bg-black text-white" : "bg-white text-gray-600"
            }`}
          >
            Ya tengo cuenta
          </button>
        </div>

        {/* FORMULARIO */}
        <div className="space-y-3">
          <input
            className="w-full rounded border p-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded border p-2"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            onClick={mode === "register" ? handleRegister : handleLogin}
            disabled={submitting || !email || !password}
            className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
          >
            {submitting
              ? "Procesando..."
              : mode === "register"
              ? "Crear cuenta y unirme"
              : "Iniciar sesión y unirme"}
          </button>
        </div>
      </div>
    </div>
  )
}