"use client"

import { useIsDemo } from "@/lib/useIsDemo"

type Props = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function DemoBlock({ children, fallback }: Props) {
  const { isDemo } = useIsDemo()

  if (isDemo) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
        👀 Funcionalidad deshabilitada en la demo.{" "}
        <a href="/signup" className="font-semibold underline">
          Crea una cuenta gratis
        </a>{" "}
        para usar esta función.
      </div>
    )
  }

  return <>{children}</>
}
