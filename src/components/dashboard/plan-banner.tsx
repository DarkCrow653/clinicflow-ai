"use client"

import { usePlan } from "@/lib/usePlan"
import Link from "next/link"

export default function PlanBanner() {
  const { plan, isFree, loading } = usePlan()

  if (loading || !isFree) return null

  return (
    <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs sm:text-sm font-semibold text-yellow-800">
          Plan Free · 100 pacientes, 1 usuario
        </p>
        <p className="hidden sm:block text-xs text-yellow-600 mt-0.5">
          Actualiza a Pro para acceder a todas las funciones.
        </p>
      </div>
      <Link
        href="/dashboard/upgrade"
        className="rounded-lg bg-black px-3 py-2 text-xs text-white whitespace-nowrap hover:bg-gray-800 transition"
      >
        Actualizar a Pro
      </Link>
    </div>
  )
}