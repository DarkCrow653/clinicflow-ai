import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Plan = {
  id: string
  name: string
  max_patients: number | null
  max_users: number | null
  has_odontogram: boolean
  has_treatments: boolean
  has_exports: boolean
  has_files: boolean
  has_dashboard_exec: boolean
  has_audit: boolean
  price_monthly: number
}

type UsePlanReturn = {
  plan: Plan | null
  loading: boolean
  isFree: boolean
  isPro: boolean
  canAddPatient: (currentCount: number) => boolean
  canAddUser: (currentCount: number) => boolean
}

export function usePlan(): UsePlanReturn {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadPlan() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!profile) return

    const { data: clinic } = await supabase
      .from("clinics")
      .select("plan_id")
      .eq("id", profile.clinic_id)
      .single()

    if (!clinic) return

    const { data: planData } = await supabase
      .from("plans")
      .select("*")
      .eq("id", clinic.plan_id || "free")
      .single()

    if (planData) setPlan(planData)
    setLoading(false)
  }

  useEffect(() => {
    const fetchPlan = async () => {
      await loadPlan()
    }

    void fetchPlan()
  }, [])

  const isFree = plan?.id === "free"
  const isPro = plan?.id === "pro"

  const canAddPatient = (currentCount: number) => {
    if (!plan?.max_patients) return true
    return currentCount < plan.max_patients
  }

  const canAddUser = (currentCount: number) => {
    if (!plan?.max_users) return true
    return currentCount < plan.max_users
  }

  return { plan, loading, isFree, isPro, canAddPatient, canAddUser }
}