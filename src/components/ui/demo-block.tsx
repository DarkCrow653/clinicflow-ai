"use client"

import { Lock } from "lucide-react"
import { useIsDemo } from "@/lib/useIsDemo"

type Props = {
  children: React.ReactNode
  fallback?: React.ReactNode
  /** "notice" = aviso completo (formularios). "inline" = chip compacto para acciones dentro de filas. */
  variant?: "notice" | "inline"
}

export default function DemoBlock({ children, fallback, variant = "notice" }: Props) {
  const { isDemo } = useIsDemo()

  if (!isDemo) return <>{children}</>
  if (fallback) return <>{fallback}</>

  if (variant === "inline") {
    return (
      <a
        href="/signup"
        title="Deshabilitado en la demo. Crea una cuenta gratis para usar esta función."
        aria-label="Función deshabilitada en la demo. Crear cuenta gratis"
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700"
      >
        <Lock size={12} aria-hidden="true" />
        Cuenta
      </a>
    )
  }

  return (
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
      👀 Deshabilitado en la demo.{" "}
      <a href="/signup" className="font-semibold underline">
        Crea una cuenta gratis
      </a>{" "}
      para usar esta función.
    </div>
  )
}
