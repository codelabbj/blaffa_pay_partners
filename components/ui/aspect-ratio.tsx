"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import { cn } from "@/lib/utils"

const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AspectRatioPrimitive.Root
    ref={ref}
    className={cn(
      "overflow-hidden rounded-3xl border border-white/30 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg",
      className
    )}
    {...props}
  />
))

export { AspectRatio }
