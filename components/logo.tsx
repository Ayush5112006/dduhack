import Image from "next/image"
import { cn } from "@/lib/utils"

type LogoProps = {
  showText?: boolean
  size?: number
  className?: string
  textClassName?: string
}

export function Logo({ showText = true, size = 32, className, textClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.svg"
        alt="HackHub logo"
        width={size}
        height={size}
        priority
        className="h-8 w-8"
      />
      {showText && (
        <span className={cn("text-xl font-bold text-foreground", textClassName)}>
          HackHub
        </span>
      )}
    </div>
  )
}
