"use client"

import Link from "next/link"
import { usePathname, useRouter }
from "next/navigation"

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  LogOut,
} from "lucide-react"

import { supabase } from "@/lib/supabase"

export default function Sidebar() {
  const pathname = usePathname()

  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()

    router.push("/login")
  }

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/patients",
      label: "Pacientes",
      icon: Users,
    },
    {
      href: "/dashboard/appointments",
      label: "Citas",
      icon: CalendarDays,
    },
  ]

  return (
    <div className="flex h-screen w-72 flex-col border-r bg-white p-6">
      <div>
        <h1 className="text-3xl font-bold">
          ClinicFlow
        </h1>

        <p className="text-sm text-gray-500">
          AI Clinic SaaS
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon

          const active =
            pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 rounded-lg px-4 py-3 transition
                ${
                  active
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }
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
        className="
          mt-auto flex items-center
          justify-center gap-2 rounded-lg
          bg-black p-3 text-white
        "
      >
        <LogOut size={18} />

        Logout
      </button>
    </div>
  )
}