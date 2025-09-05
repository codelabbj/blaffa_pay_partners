"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300 transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "text-gray-700 dark:text-gray-300",
        required: "text-gray-700 dark:text-gray-300 after:content-['*'] after:ml-1 after:text-red-500 after:font-bold",
        optional: "text-gray-600 dark:text-gray-400 italic",
        heading: "text-xl font-bold text-gray-900 dark:text-white tracking-tight",
        subtitle: "text-base font-medium text-gray-600 dark:text-gray-400",
        caption: "text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, variant, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant }), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
