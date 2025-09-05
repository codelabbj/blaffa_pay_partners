"use client"

import { useState } from "react"
import { AlertTriangle, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/components/providers/language-provider"

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: "inline" | "full" | "modal"
  className?: string
  showRetry?: boolean
  showDismiss?: boolean
}

// Helper to extract error messages from API responses
export function extractErrorMessages(errorObj: any): string {
  // Handle null/undefined
  if (!errorObj) return "An unknown error occurred"
  
  // Handle strings (already extracted)
  if (typeof errorObj === "string") return errorObj
  
  // Handle non-objects
  if (typeof errorObj !== "object") return String(errorObj)
  
  // Handle arrays
  if (Array.isArray(errorObj)) {
    return errorObj.map(item => extractErrorMessages(item)).join(" ")
  }
  
  // Handle objects - check for common error fields
  if (errorObj.detail) return errorObj.detail
  if (errorObj.message) return errorObj.message
  if (errorObj.error) return errorObj.error
  if (errorObj.msg) return errorObj.msg
  
  // Handle field-specific errors (e.g., {"email": ["This field is required"]})
  const fieldErrors = Object.entries(errorObj)
    .filter(([key, value]) => Array.isArray(value) && value.length > 0)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join("; ")
  
  if (fieldErrors) return fieldErrors
  
  // Handle other object values
  const values = Object.values(errorObj)
    .map((v) => Array.isArray(v) ? v.join(" ") : String(v))
    .join(" ")
  
  return values || "An unknown error occurred"
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  variant = "inline",
  className = "",
  showRetry = true,
  showDismiss = true
}: ErrorDisplayProps) {
  const { t } = useLanguage()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  if (!error) return null

  const errorMessage = typeof error === "string" ? error : extractErrorMessages(error)

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-6 ${className}`}>
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="bg-red-100/80 dark:bg-red-900/20 p-6 rounded-3xl backdrop-blur-xl border border-red-200/50 dark:border-red-800/50 shadow-xl">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
              {t("common.errorOccurred")}
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
              {errorMessage}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {showRetry && onRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              className="border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 backdrop-blur-sm rounded-2xl shadow-lg transition-all duration-300"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                  {t("common.retrying")}
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-3" />
                  {t("common.retry")}
                </>
              )}
            </Button>
          )}
          {showDismiss && onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/50 backdrop-blur-sm rounded-2xl transition-all duration-300"
            >
              {t("common.dismiss")}
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (variant === "modal") {
    return (
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 ${className}`}>
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-3xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="flex items-start space-x-4">
            <div className="bg-red-100/80 dark:bg-red-900/20 p-3 rounded-2xl backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 flex-shrink-0 shadow-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-red-600 dark:text-red-400 text-lg">
                {t("common.errorOccurred")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {errorMessage}
              </p>
              <div className="flex items-center space-x-3 pt-3">
                {showRetry && onRetry && (
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    size="sm"
                    variant="outline"
                    className="border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 backdrop-blur-sm rounded-2xl transition-all duration-300"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {t("common.retrying")}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("common.retry")}
                      </>
                    )}
                  </Button>
                )}
                {showDismiss && onDismiss && (
                  <Button
                    onClick={onDismiss}
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/50 backdrop-blur-sm rounded-2xl transition-all duration-300"
                  >
                    {t("common.dismiss")}
                  </Button>
                )}
              </div>
            </div>
            {showDismiss && onDismiss && (
              <Button
                onClick={onDismiss}
                size="sm"
                variant="ghost"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 h-auto transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default inline variant
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-5 w-5" />
      <AlertDescription className="flex items-center justify-between">
        <span className="flex-1">{errorMessage}</span>
        <div className="flex items-center space-x-3 ml-6">
          {showRetry && onRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              size="sm"
              variant="outline"
              className="border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 backdrop-blur-sm rounded-2xl h-8 px-3 transition-all duration-300"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.retrying")}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("common.retry")}
                </>
              )}
            </Button>
          )}
          {showDismiss && onDismiss && (
            <Button
              onClick={onDismiss}
              size="sm"
              variant="ghost"
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50/80 dark:hover:bg-red-900/20 backdrop-blur-sm rounded-2xl h-8 px-3 transition-all duration-300"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
} 