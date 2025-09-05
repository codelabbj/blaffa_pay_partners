"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/components/providers/language-provider"
import { Eye, EyeOff } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

export function SignInForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const [showPassword, setShowPassword] = useState(false)
  const apiFetch = useApi();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await apiFetch(`${baseUrl}api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })
      if (!data || !data.access || !data.refresh || !data.user) {
        const backendError = extractErrorMessages(data) || t("auth.loginFailed")
        setError(backendError)
        toast({
          title: t("auth.loginFailed"),
          description: backendError,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      // Enforce staff/superuser-only access
      const user = data.user
      // const isStaff = Boolean(user?.is_staff)
      const isSuperuser = Boolean(user?.is_partner)
      if (!isSuperuser) {
        const notAllowedMsg = t("auth.notAllowed") || "User is not allowed to access this dashboard."
        setError(notAllowedMsg)
        toast({
          title: t("auth.loginFailed"),
          description: notAllowedMsg,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      localStorage.setItem("accessToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)
      localStorage.setItem("user", JSON.stringify(data.user))
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
        document.cookie = `accessToken=${data.access}; path=/; max-age=86400; secure; samesite=strict`;
      } else {
        localStorage.removeItem("rememberMe")
        document.cookie = `accessToken=${data.access}; path=/; secure; samesite=strict`;
      }
      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.loggedInSuccessfully"),
      })
      router.push("/dashboard")
    } catch (err: any) {
      let backendError = t("auth.networkError");
      if (err && err.message) {
        try {
          const parsed = JSON.parse(err.message);
          backendError = extractErrorMessages(parsed) || backendError;
        } catch {
          backendError = extractErrorMessages(err.message) || backendError;
        }
      } else if (err) {
        backendError = extractErrorMessages(err) || backendError;
      }
      setError(backendError);
      toast({
        title: t("auth.networkError"),
        description: backendError,
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 ">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {/* <div className="relative mx-auto h-16 w-16 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
             <div className="absolute inset-0 bg-white/20 rounded-3xl blur-sm"></div>
            <img src="/logo.png" alt="Blaffa Pay Logo" className="h-10 w-10 relative z-10" />
          </div> */}
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            Blaffa Pay Partenaires
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t("auth.subtitle")}
          </p>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
                className="rounded-2xl border-2 focus:border-blue-500 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("auth.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="rounded-2xl border-2 focus:border-blue-500 h-12 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor="remember" className="text-sm">
                  {t("auth.rememberMe")}
                </Label>
              </div>
              {/* <Button variant="link" className="px-0 text-sm" disabled={loading}>
                {t("auth.forgotPassword")}
              </Button> */}
            </div>
            {error && (
              <ErrorDisplay
                error={error}
                variant="inline"
                showRetry={false}
                className="mt-2"
              />
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl h-12 text-lg font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {t("auth.loggingIn")}
                </>
              ) : (
                t("auth.signIn")
              )}
            </Button>
                      </form>
          </div>
        </div>
      </div>
  )
}
