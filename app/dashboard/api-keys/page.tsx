"use client"

import { useState } from "react"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
    Key,
    Copy,
    Check,
    RefreshCw,
    Eye,
    EyeOff,
    ShieldCheck,
    AlertTriangle,
} from "lucide-react"
import { extractErrorMessages } from "@/components/ui/error-display"

interface ApiKeyResponse {
    api_key: string
    api_secret: string
    created_at: string
    detail?: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function ApiKeysPage() {
    const apiFetch = useApi()
    const { t } = useLanguage()

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<ApiKeyResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isNew, setIsNew] = useState(false)
    const [showSecret, setShowSecret] = useState(false)
    const [copiedKey, setCopiedKey] = useState(false)
    const [copiedSecret, setCopiedSecret] = useState(false)

    const generateKeys = async () => {
        setLoading(true)
        setError(null)
        setIsNew(false)
        setShowSecret(false)

        try {
            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/api-key/`
            const result: ApiKeyResponse = await apiFetch(endpoint)
            setData(result)
            setIsNew(true)
            toast.success(t("apiKeys.successTitle"), {
                description: t("apiKeys.successDesc"),
            })
        } catch (err: any) {
            const msg = extractErrorMessages(err)
            setError(msg)
            toast.error(t("apiKeys.failedTitle"), { description: msg })
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async (value: string, type: "key" | "secret") => {
        try {
            await navigator.clipboard.writeText(value)
            if (type === "key") {
                setCopiedKey(true)
                setTimeout(() => setCopiedKey(false), 2000)
                toast.success(t("apiKeys.copiedKey"))
            } else {
                setCopiedSecret(true)
                setTimeout(() => setCopiedSecret(false), 2000)
                toast.success(t("apiKeys.copiedSecret"))
            }
        } catch {
            toast.error(t("apiKeys.copyFailed"))
        }
    }

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 md:p-10 text-white shadow-2xl">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Key className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("apiKeys.title")}</h1>
                        </div>
                        <p className="text-orange-100 text-base md:text-lg max-w-xl">
                            {t("apiKeys.subtitle")}
                        </p>
                    </div>
                    <Button
                        onClick={generateKeys}
                        disabled={loading}
                        className="bg-gray-900 border-2 border-gray-900 text-white hover:bg-gray-800 font-bold rounded-xl px-8 py-3 h-auto shadow-xl shadow-black/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed w-full md:w-auto"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                {t("apiKeys.generating")}
                            </>
                        ) : data ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {t("apiKeys.regenerate")}
                            </>
                        ) : (
                            <>
                                <Key className="h-4 w-4 mr-2" />
                                {t("apiKeys.generate")}
                            </>
                        )}
                    </Button>
                </div>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Loading skeleton */}
            {loading && (
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
                    <CardHeader className="pb-4">
                        <Skeleton className="h-6 w-48 rounded-lg" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24 rounded" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24 rounded" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error state */}
            {!loading && error && (
                <div className="flex items-start gap-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-red-800 dark:text-red-200">{t("apiKeys.errorTitle")}</p>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && !data && (
                <div className="flex flex-col items-center justify-center min-h-[420px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-10 text-center">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-3xl flex items-center justify-center shadow-lg">
                            <Key className="h-12 w-12 text-orange-500" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                            <ShieldCheck className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("apiKeys.noKeysTitle")}</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                        {t("apiKeys.noKeysHint")}
                    </p>
                </div>
            )}

            {/* Keys card */}
            {!loading && !error && data && (
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl">
                                    <ShieldCheck className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{t("apiKeys.credentialsTitle")}</CardTitle>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        {t("apiKeys.generatedOn")}{" "}
                                        {new Date(data.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {isNew && (
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800">
                                    {t("apiKeys.newlyGenerated")}
                                </span>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 md:p-8 space-y-6">
                        {/* Security warning for newly generated keys */}
                        {isNew && (
                            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <span className="font-semibold">{t("apiKeys.saveSecretNow")}</span>{" "}
                                    {t("apiKeys.saveSecretHint")}
                                </p>
                            </div>
                        )}

                        {/* API Key */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("apiKeys.apiKey")}</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={data.api_key}
                                    className="flex-1 rounded-xl border-2 font-mono text-sm bg-gray-50 dark:bg-gray-800/50 focus:border-orange-500 focus:ring-orange-500/20"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(data.api_key, "key")}
                                    className="rounded-xl border-2 h-10 w-10 flex-shrink-0 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
                                >
                                    {copiedKey ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* API Secret */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("apiKeys.apiSecret")}</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    type={isNew || showSecret ? "text" : "password"}
                                    value={data.api_secret}
                                    className="flex-1 rounded-xl border-2 font-mono text-sm bg-gray-50 dark:bg-gray-800/50 focus:border-orange-500 focus:ring-orange-500/20"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setShowSecret((v) => !v)}
                                    className="rounded-xl border-2 h-10 w-10 flex-shrink-0 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
                                >
                                    {showSecret || isNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(data.api_secret, "secret")}
                                    className="rounded-xl border-2 h-10 w-10 flex-shrink-0 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
                                >
                                    {copiedSecret ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t("apiKeys.secretHint")}
                            </p>
                        </div>

                        {/* Regenerate warning */}
                        <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-semibold text-red-500">{t("apiKeys.regenerateWarning")}</span>{" "}
                                {t("apiKeys.regenerateWarningText")}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
