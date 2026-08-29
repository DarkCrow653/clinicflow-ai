"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  LogOut,
  Stethoscope,
  Users2,
  ScrollText,
  FileSpreadsheet,
  Settings,
  Zap,
  ArrowLeft,
} from "lucide-react"

import { supabase } from "@/lib/supabase"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string>("")
  const [isDemo, setIsDemo] = useState(false)

  async function loadRole() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setIsDemo(user.email === "demo@clinicflow.ai")

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile) setRole(profile.role)
  }

  useEffect(() => {
    const fetchRole = async () => {
      await loadRole()
    }

    void fetchRole()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleBackToLanding = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const allLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "doctor", "reception"],
    },
    {
      href: "/dashboard/patients",
      label: "Pacientes",
      icon: Users,
      roles: ["admin", "doctor", "reception"],
    },
    {
      href: "/dashboard/appointments",
      label: "Citas",
      icon: CalendarDays,
      roles: ["admin", "doctor", "reception"],
    },
    {
      href: "/dashboard/services",
      label: "Servicios",
      icon: Stethoscope,
      roles: ["admin"],
    },
    {
      href: "/dashboard/users",
      label: "Usuarios",
      icon: Users2,
      roles: ["admin"],
    },
    {
      href: "/dashboard/activity",
      label: "Auditoría",
      icon: ScrollText,
      roles: ["admin"],
    },
    {
      href: "/dashboard/reports",
      label: "Reportes",
      icon: FileSpreadsheet,
      roles: ["admin"],
    },
    {
      href: "/dashboard/settings",
      label: "Configuración",
      icon: Settings,
      roles: ["admin"],
    },
    {
      href: "/dashboard/upgrade",
      label: "⚡ Actualizar Plan",
      icon: Zap,
      roles: ["admin"],
    },
  ]

  const links = allLinks.filter((link) => link.roles.includes(role))

  return (
    <div className="flex h-screen w-72 flex-col border-r bg-white p-6">
      {/* HEADER — fijo */}
      <div className="shrink-0">
        <h1 className="text-3xl font-bold">ClinicFlow</h1>
        <p className="text-sm text-gray-500">AI Clinic SaaS</p>
        {isDemo ? (
          <span className="mt-2 inline-block rounded-full border border-yellow-300 bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
            👀 Modo Demo
          </span>
        ) : role && (
          <span className="mt-2 inline-block rounded-full border px-2 py-0.5 text-xs text-gray-500 capitalize">
            {role === "admin" ? "Admin" : role === "doctor" ? "Doctor" : "Recepción"}
          </span>
        )}
      </div>
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  LogOut,
  Stethoscope,
  Users2,
  ScrollText,
  FileSpreadsheet,
  Settings,
  Zap,
  ArrowLeft,
} from "lucide-react"

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

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string>("")
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setIsDemo(user.email === "demo@clinicflow.ai")
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      if (profile) setRole(profile.role)
    })()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleBackToLanding = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const links = allLinks.filter((link) => link.roles.includes(role))

  return (
    <div className="flex h-screen w-64 xl:w-72 flex-col border-r bg-white p-5 xl:p-6">
      <div className="shrink-0">
        <h1 className="text-2xl xl:text-3xl font-bold">ClinicFlow</h1>
        <p className="text-xs xl:text-sm text-gray-500">AI Clinic SaaS</p>
        {isDemo ? (
          <span className="mt-2 inline-block rounded-full border border-yellow-300 bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
            👀 Modo Demo
          </span>
        ) : role && (
          <span className="mt-2 inline-block rounded-full border px-2 py-0.5 text-xs text-gray-500 capitalize">
            {role === "admin" ? "Admin" : role === "doctor" ? "Doctor" : "Recepción"}
          </span>
        )}
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition shrink-0
                ${active ? "bg-black text-white" : "hover:bg-gray-100"}
              `}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </div>

      {isDemo ? (
        <button
          onClick={handleBackToLanding}
          className="mt-4 flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className="mt-4 flex shrink-0 items-center justify-center gap-2 rounded-lg bg-black p-2.5 text-sm text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      )}
    </div>
  )
}