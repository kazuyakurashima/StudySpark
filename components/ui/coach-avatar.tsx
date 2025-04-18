import type React from "react"
import Image from "next/image"
import { UserCircle2 } from "lucide-react"

interface CoachAvatarProps {
  src?: string | null
  fallback?: React.ReactNode
  alt?: string
  size?: number
  className?: string
}

export function CoachAvatar({
  src,
  fallback = <UserCircle2 />,
  alt = "コーチアバター",
  size = 32,
  className = "",
}: CoachAvatarProps) {
  if (!src) {
    return (
      <div
        className={`bg-blue-100 rounded-full flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        {fallback}
      </div>
    )
  }

  return (
    <div className={`rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image src={src || "/placeholder.svg"} alt={alt} width={size} height={size} className="object-cover" />
    </div>
  )
}
