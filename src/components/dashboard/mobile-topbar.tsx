"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ArrowLeft, LogOut, LayoutDashboard, Users, CalendarDays, Stethoscope, Users2, ScrollText, FileSpreadsheet, Settings, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"

const allLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "reception"] },
  { href: "/dashboard/patients", label: "Pacientes", icon: Users, roles: ["admin", "doctor", "reception"] },
  { href: "/dashboard/appointments", label: "Citas", icon: CalendarDays, roles: ["admin", "doctor", "reception"] },
  { href: "/dashboard/services", label: "Servicios", icon: Stethoscope, roles: ["admin"] },
  { href: "/dashboard/users", label: "Usuarios", icon: Users2, roles: ["admin"] },
  { href: "/dashboard/activity", label: "Auditoría", icon: ScrollText, roles: ["admin"] },
  { href: "/dashboard/reports", label: "Reportes", icon: FileSpreadsheet, roles: ["admin"] },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings, roles: ["admin"] },
  { href: "/dashboard/upgrade", label: "⚡ Actualizar Plan", icon: Zap, roles: ["admin"] },
]

export default function MobileTopbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState("")
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setIsDemo(user.email === "demo@clinicflow.ai")
      supabase.from("profiles").select("role").eq("id", user.id).single().then(({ data }) => {
        if (data) setRole(data.role)
      })
    })
  }, [])

  // Cierra el menú al navegar
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const links = allLinks.filter((l) => l.roles.includes(role))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleBackToLanding = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      {/* Topbar — solo visible en móvil */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
        <div className="flex items-center gap-1">
          <span className="font-bold text-lg">ClinicFlow</span>
          {isDemo && (
            <span className="ml-2 rounded-full border border-yellow-300 bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
              Demo
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-xl transition-transform duration-300 md:hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Header del drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b shrink-0">
          <div>
            <h1 className="text-2xl font-bold">ClinicFlow</h1>
            <p className="text-xs text-gray-500">AI Clinic SaaS</p>
            {isDemo ? (
              <span className="mt-1 inline-block rounded-full border border-yellow-300 bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
                👀 Modo Demo
              </span>
            ) : role && (
              <span className="mt-1 inline-block rounded-full border px-2 py-0.5 text-xs text-gray-500 capitalize">
                {role === "admin" ? "Admin" : role === "doctor" ? "Doctor" : "Recepción"}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition
                  ${active ? "bg-black text-white" : "hover:bg-gray-100"}
                `}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Botón logout/volver */}
        <div className="px-4 pb-6 shrink-0">
          {isDemo ? (
            <button
              onClick={handleBackToLanding}
              className="w-full flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <ArrowLeft size={18} />
              Volver al inicio
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-black p-3 text-white text-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  )
}