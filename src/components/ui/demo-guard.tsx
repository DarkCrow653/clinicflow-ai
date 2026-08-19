"use client"

import { useIsDemo } from "@/lib/useIsDemo"

type Props = {
  children: React.ReactNode
}

export default function DemoGuard({ children }: Props) {
  const { isDemo } = useIsDemo()

  if (isDemo) return null

  return <>{children}</>
}
