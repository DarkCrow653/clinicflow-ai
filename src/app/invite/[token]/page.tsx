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
    const { data, error } = await supabase.rpc("get_invitation_by_token", {
      p_token: params.token,
    })

    if (error || !data || data.length === 0) {
      setError("Esta invitación no existe o ya fue usada.")
      setLoading(false)
      return
    }

    setInvitation(data[0])
    setEmail(data[0].email)
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!invitation) return
    setSubmitting(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          invite_token: params.token,
        },
      },
    })

    if (authError?.message?.includes("already registered")) {
      setMode("login")
      setError("Este email ya tiene cuenta. Usa 'Ya tengo cuenta'.")
      setSubmitting(false)
      return
    }

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

    // ✅ Ya no se manda role — profiles es la única fuente de verdad
    await supabase.from("staff_members").upsert({
      clinic_id: invitation.clinic_id,
      user_id: userId,
    }, { onConflict: "clinic_id,user_id" })

    await supabase.rpc("accept_invitation", { p_token: params.token })

    setSubmitting(false)
    router.push("/dashboard")
  }

  const handleLogin = async () => {
    if (!invitation) return
    setSubmitting(true)

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

    await supabase.from("profiles").upsert({
      id: userId,
      clinic_id: invitation.clinic_id,
      role: invitation.role,
    })

    // ✅ Ya no se manda role — profiles es la única fuente de verdad
    await supabase.from("staff_members").upsert({
      clinic_id: invitation.clinic_id,
      user_id: userId,
    }, { onConflict: "clinic_id,user_id" })

    await supabase.rpc("accept_invitation", { p_token: params.token })

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

        <div className="rounded-xl bg-gray-50 border p-4 text-center">
          <p className="text-sm text-gray-500">Tu rol será</p>
          <p className="font-bold text-lg mt-1">
            {invitation?.role === "admin" ? "Admin" :
             invitation?.role === "doctor" ? "Doctor" : "Recepción"}
          </p>
        </div>

        <div className="flex rounded-xl border overflow-hidden">
          <button
            onClick={() => { setMode("register"); setError("") }}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "register" ? "bg-black text-white" : "bg-white text-gray-600"
            }`}
          >
            Crear cuenta
          </button>
          <button
            onClick={() => { setMode("login"); setError("") }}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "login" ? "bg-black text-white" : "bg-white text-gray-600"
            }`}
          >
            Ya tengo cuenta
          </button>
        </div>

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