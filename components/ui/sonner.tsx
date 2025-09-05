"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/95 dark:group-[.toaster]:bg-gray-900/95 group-[.toaster]:text-foreground group-[.toaster]:border-white/30 dark:group-[.toaster]:border-gray-700/50 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-3xl",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-500 group-[.toast]:to-indigo-600 group-[.toast]:text-white group-[.toast]:rounded-2xl group-[.toast]:shadow-lg group-[.toast]:transition-all group-[.toast]:duration-300",
          cancelButton:
            "group-[.toast]:bg-white/80 dark:group-[.toast]:bg-gray-900/80 group-[.toast]:text-muted-foreground group-[.toast]:border-2 group-[.toast]:border-white/30 dark:group-[.toast]:border-gray-700/50 group-[.toast]:rounded-2xl group-[.toast]:backdrop-blur-sm group-[.toast]:shadow-lg group-[.toast]:transition-all group-[.toast]:duration-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
