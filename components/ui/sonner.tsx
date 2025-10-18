"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      expand={true}
      richColors={true}
      closeButton={true}
      {...props}
    />
  )
}

export { Toaster }
