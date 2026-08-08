import { supabase } from "@/lib/supabase"
import { logActivity } from "@/lib/logActivity"

type SoftDeleteParams = {
  table: string
  id: string
  clinicId: string
  entityType: string
  details?: string | null
  confirmMessage: string
}

export async function softDelete({
  table,
  id,
  clinicId,
  entityType,
  details,
  confirmMessage,
}: SoftDeleteParams): Promise<boolean> {
  const confirmed = window.confirm(confirmMessage)
  if (!confirmed) return false

  const { error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    alert(`Error al eliminar: ${error.message}`)
    return false
  }

  await logActivity({
    clinicId,
    action: "eliminó",
    entityType,
    entityId: id,
    details: details ?? undefined,
  })

  return true
}