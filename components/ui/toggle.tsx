"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-medium ring-offset-background transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-700 dark:hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-indigo-600 data-[state=on]:text-white data-[state=on]:shadow-lg [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 gap-3",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border-2 border-white/30 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-700 dark:hover:text-blue-300 shadow-lg",
      },
      size: {
        default: "h-12 px-4 min-w-12",
        sm: "h-10 px-3 min-w-10",
        lg: "h-14 px-6 min-w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
