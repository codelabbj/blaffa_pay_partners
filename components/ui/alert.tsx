import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-3xl border-2 p-8 [&>svg~*]:pl-10 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-8 [&>svg]:top-8 [&>svg]:text-foreground shadow-xl backdrop-blur-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-white/30 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-white",
        destructive: "border-red-200/50 dark:border-red-800/50 bg-red-50/80 dark:bg-red-900/20 text-red-800 dark:text-red-200 [&>svg]:text-red-600 dark:[&>svg]:text-red-400",
        success: "border-green-200/50 dark:border-green-800/50 bg-green-50/80 dark:bg-green-900/20 text-green-800 dark:text-green-200 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        warning: "border-yellow-200/50 dark:border-yellow-800/50 bg-yellow-50/80 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        info: "border-blue-200/50 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        glass: "border-white/20 dark:border-gray-700/30 bg-white/20 dark:bg-gray-900/20 text-gray-900 dark:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-3 font-semibold leading-none tracking-tight text-lg", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-base leading-relaxed [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
