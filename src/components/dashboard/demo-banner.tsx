"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === "demo@clinicflow.ai") setIsDemo(true)
    })
  }, [])

  if (!isDemo) return null

  return (
    <div className="bg-black text-white text-xs text-center py-2 px-4">
      👀 Estás viendo la demo de ClinicFlow — los datos son de ejemplo y se restauran periódicamente.
      <a href="/signup" className="ml-2 underline font-semibold">
        Crear cuenta gratis →
      </a>
    </div>
  )
}
