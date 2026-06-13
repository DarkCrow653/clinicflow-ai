"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type StaffMember = {
  id: string
  role: string
  user_id: string
  profiles: {
    email: string
  } | null
}

type Invitation = {
  id: string
  email: string
  role: string
  accepted: boolean
  created_at: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  doctor: "Doctor",
  reception: "Recepción",
}

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  doctor: "bg-blue-50 text-blue-700 border-blue-200",
  reception: "bg-green-50 text-green-700 border-green-200",
}

export default function UsersPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [clinicId, setClinicId] = useState("")
  const [currentUserId, setCurrentUserId] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("doctor")
  const [inviteLink, setInviteLink] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!profile) return
    setClinicId(profile.clinic_id)

    const { data: staffData } = await supabase
      .from("staff_members")
      .select("*, profiles(email)")
      .eq("clinic_id", profile.clinic_id)
      .order("created_at", { ascending: true })

    if (staffData) setStaff(staffData as StaffMember[])

    const { data: invData } = await supabase
      .from("invitations")
      .select("*")
      .eq("clinic_id", profile.clinic_id)
      .eq("accepted", false)
      .order("created_at", { ascending: false })

    if (invData) setInvitations(invData)
  }

  const sendInvitation = async () => {
    if (!inviteEmail) return
    setSending(true)

    const { data, error } = await supabase
      .from("invitations")
      .insert({
        clinic_id: clinicId,
        email: inviteEmail,
        role: inviteRole,
      })
      .select()
      .single()

    if (error) {
      alert(error.message)
      setSending(false)
      return
    }

    // Genera el link de invitación
    const link = `https://clinicflow-ai-hazel.vercel.app/invite/${data.token}`
    setInviteLink(link)
    setInviteEmail("")
    setSending(false)
    loadUsers()
  }

  const changeRole = async (staffId: string, newRole: string) => {
    await supabase
      .from("staff_members")
      .update({ role: newRole })
      .eq("id", staffId)

    loadUsers()
  }

  const removeStaff = async (staffId: string) => {
    const confirm = window.confirm("¿Eliminar este usuario del equipo?")
    if (!confirm) return

    await supabase.from("staff_members").delete().eq("id", staffId)
    loadUsers()
  }

  const cancelInvitation = async (invId: string) => {
    await supabase.from("invitations").delete().eq("id", invId)
    loadUsers()
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    alert("¡Link copiado!")
  }

  return (
    <div className="space-y-8 p-10">
      <div>
        <h1 className="text-4xl font-bold">Usuarios</h1>
        <p className="mt-2 text-gray-500">Gestiona el equipo de tu clínica.</p>
      </div>

      {/* INVITAR USUARIO */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-2xl font-bold">Invitar usuario</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            className="w-full rounded border p-2"
            placeholder="Email del usuario"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />

          <select
            className="w-full rounded border p-2"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          >
            <option value="doctor">Doctor</option>
            <option value="reception">Recepción</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={sendInvitation}
            disabled={sending || !inviteEmail}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {sending ? "Generando..." : "Generar invitación"}
          </button>
        </div>

        {/* LINK GENERADO */}
        {inviteLink && (
          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-600">
              Comparte este link con el usuario:
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-800 break-all flex-1">{inviteLink}</p>
              <button
                onClick={copyLink}
                className="rounded border px-3 py-1 text-sm hover:bg-gray-100 shrink-0"
              >
                Copiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EQUIPO ACTUAL */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Equipo actual</h2>

        {staff.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay usuarios en el equipo aún.</p>
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{member.profiles?.email || "Sin email"}</p>
                  </div>
                  <span className={`text-xs border rounded-full px-3 py-1 font-medium ${ROLE_STYLES[member.role]}`}>
                    {ROLE_LABELS[member.role]}
                  </span>
                </div>

                {member.user_id !== currentUserId && (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => changeRole(member.id, e.target.value)}
                      className="rounded border p-2 text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="doctor">Doctor</option>
                      <option value="reception">Recepción</option>
                    </select>

                    <button
                      onClick={() => removeStaff(member.id)}
                      className="rounded border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INVITACIONES PENDIENTES */}
      {invitations.length > 0 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold">Invitaciones pendientes</h2>

          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <p className="font-medium text-sm">{inv.email}</p>
                  <span className={`text-xs border rounded-full px-3 py-1 font-medium ${ROLE_STYLES[inv.role]}`}>
                    {ROLE_LABELS[inv.role]}
                  </span>
                  <span className="text-xs text-gray-400">Pendiente</span>
                </div>

                <button
                  onClick={() => cancelInvitation(inv.id)}
                  className="rounded border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}