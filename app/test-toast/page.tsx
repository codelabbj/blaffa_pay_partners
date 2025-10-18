"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function TestToastPage() {
  const handleTestToast = () => {
    toast.success("Test Success!", {
      description: "This is a test toast notification"
    })
  }

  const handleTestError = () => {
    toast.error("Test Error!", {
      description: "This is a test error toast"
    })
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Toast Test Page</h1>
      <div className="space-x-4">
        <Button onClick={handleTestToast}>
          Test Success Toast
        </Button>
        <Button onClick={handleTestError} variant="destructive">
          Test Error Toast
        </Button>
      </div>
    </div>
  )
}
