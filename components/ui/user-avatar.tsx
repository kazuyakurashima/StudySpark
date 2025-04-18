import type React from "react"
import Image from "next/image"
import { User } from "lucide-react"

interface UserAvatarProps {
  src?: string | null
  fallback?: React.ReactNode
  alt?: string
  size?: number
  className?: string
}

export function UserAvatar({
  src,
  fallback = <User />,
  alt = "ユーザーアバター",
  size = 32,
  className = "",
}: UserAvatarProps) {
  if (!src) {
    return (
      <div
        className={`bg-gray-200 rounded-full flex items-center justify-center ${className}`}
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
