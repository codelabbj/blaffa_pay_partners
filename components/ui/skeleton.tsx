import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-3xl bg-gradient-to-r from-gray-200/60 via-gray-300/60 to-gray-200/60 dark:from-gray-700/60 dark:via-gray-600/60 dark:to-gray-700/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30", className)}
      {...props}
    />
  )
}

export { Skeleton }
