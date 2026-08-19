"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function DemoButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDemo = async () => {
    setLoading(true)

    try {
      const res = await fetch("/api/demo-login", { method: "POST" })
      const data = await res.json()

      if (data.error) {
        alert("Error al cargar la demo. Intenta de nuevo.")
        setLoading(false)
        return
      }

      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })

      router.push("/dashboard")
    } catch {
      alert("Error de conexión. Intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDemo}
      disabled={loading}
      className={className}
    >
      {loading ? "Cargando demo..." : "Ver Demo →"}
    </button>
  )
}
