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
} from "lucide-react"

import { supabase } from "@/lib/supabase"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string>("")

  useEffect(() => {
    loadRole()
  }, [])

  const loadRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile) setRole(profile.role)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const allLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "doctor", "reception"], // todos
    },
    {
      href: "/dashboard/patients",
      label: "Pacientes",
      icon: Users,
      roles: ["admin", "doctor", "reception"], // todos
    },
    {
      href: "/dashboard/appointments",
      label: "Citas",
      icon: CalendarDays,
      roles: ["admin", "doctor", "reception"], // todos
    },
    {
      href: "/dashboard/services",
      label: "Servicios",
      icon: Stethoscope,
      roles: ["admin"], // solo admin
    },
    {
      href: "/dashboard/users",
      label: "Usuarios",
      icon: Users2,
      roles: ["admin"], // solo admin
    },
  ]

  // Filtra links según el rol del usuario
  const links = allLinks.filter((link) => link.roles.includes(role))

  return (
    <div className="flex h-screen w-72 flex-col border-r bg-white p-6">
      <div>
        <h1 className="text-3xl font-bold">ClinicFlow</h1>
        <p className="text-sm text-gray-500">AI Clinic SaaS</p>
        {/* Badge de rol */}
        {role && (
          <span className="mt-2 inline-block rounded-full border px-2 py-0.5 text-xs text-gray-500 capitalize">
            {role === "admin" ? "Admin" : role === "doctor" ? "Doctor" : "Recepción"}
          </span>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 rounded-lg px-4 py-3 transition
                ${active ? "bg-black text-white" : "hover:bg-gray-100"}
              `}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          )
        })}
      </div>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-black p-3 text-white"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  )
}