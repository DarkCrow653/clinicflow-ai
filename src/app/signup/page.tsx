"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setError("")

    if (!email.trim()) { setError("El email es obligatorio."); return }
    if (!email.includes("@")) { setError("Ingresa un email válido."); return }
    if (!password) { setError("La contraseña es obligatoria."); return }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return }
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return }

    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSignup()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b bg-white">
        <Link href="/" className="flex items-center gap-1 w-fit">
          <span className="font-bold text-lg">ClinicFlow</span>
          <span className="text-xs text-gray-400">AI Dental</span>
        </Link>
      </div>

      {/* Contenido centrado */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Card */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8 space-y-5">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Crear cuenta</h1>
              <p className="text-sm text-gray-500">Empieza gratis, sin tarjeta de crédito</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Email</label>
                <input
                  className="w-full rounded-lg border p-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">Contraseña</label>
                <input
                  className="w-full rounded-lg border p-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  onKeyDown={handleKeyDown}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium">Confirmar contraseña</label>
                <input
                  className="w-full rounded-lg border p-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError("") }}
                  onKeyDown={handleKeyDown}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-lg bg-black py-3 text-white font-medium hover:bg-gray-800 transition disabled:opacity-50 text-sm"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
            </button>

            <p className="text-center text-xs text-gray-400">
              Al registrarte aceptas nuestros{" "}
              <Link href="/terms" className="underline hover:text-black">Términos</Link>
              {" "}y{" "}
              <Link href="/privacy" className="underline hover:text-black">Privacidad</Link>
            </p>

            <p className="text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-medium text-black hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            <Link href="/" className="hover:text-black">← Volver al inicio</Link>
          </p>
        </div>
      </div>
    </div>
  )
}