import { supabase } from "@/lib/supabase"

type LogParams = {
  clinicId: string
  action: string
  entityType: string
  entityId?: string
  details?: string | null
}

export async function logActivity({
  clinicId,
  action,
  entityType,
  entityId,
  details,
}: LogParams) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("activity_logs").insert({
    clinic_id: clinicId,
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    details: details || null,
  })
}