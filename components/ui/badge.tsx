import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-2xl border px-3 py-1.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg",
        secondary:
          "border-transparent bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg",
        outline: "border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-700 dark:text-gray-300",
        success: "border-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg",
        warning: "border-transparent bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg",
        info: "border-transparent bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg",
        glass: "border border-white/30 dark:border-gray-700/30 bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm text-gray-700 dark:text-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
