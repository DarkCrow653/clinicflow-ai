import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function useIsDemo() {
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsDemo(user?.email === "demo@clinicflow.ai")
      setLoading(false)
    })
  }, [])

  return { isDemo, loading }
}
