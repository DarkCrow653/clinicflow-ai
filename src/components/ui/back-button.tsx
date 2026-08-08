"use client"

import { useRouter } from "next/navigation"

type Props = {
  href?: string
  label?: string
}

export default function BackButton({ href, label = "Volver" }: Props) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition mb-4"
    >
      ← {label}
    </button>
  )
}