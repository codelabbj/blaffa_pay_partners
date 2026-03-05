"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuthPasswords } from "@/lib/api/auth-passwords"
import { toast } from "sonner"
import { useLanguage } from "@/components/providers/language-provider"

export function ForgotPasswordForm() {
    const [identifier, setIdentifier] = useState("")
    const [loading, setLoading] = useState(false)

    const { initiatePasswordReset } = useAuthPasswords()
    const { t } = useLanguage()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await initiatePasswordReset(identifier)
            toast.success("Code de réinitialisation envoyé. Vérifiez vos emails ou SMS.")
            router.push(`/reset-password?identifier=${encodeURIComponent(identifier)}`)
        } catch (err: any) {
            const errorMessage =
                err?.detail ||
                err?.identifier?.[0] ||
                err?.message ||
                "Impossible d'initier la réinitialisation."
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-2xl border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardHeader className="space-y-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-500 w-fit -ml-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la connexion
                </Button>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent text-center">
                    Mot de passe oublié ?
                </CardTitle>
                <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                    Entrez votre email ou identifiant, et nous vous enverrons un code pour réinitialiser votre mot de passe.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="identifier">Identifiant / Email</Label>
                        <Input
                            id="identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="ex: nom@entreprise.com"
                            required
                            className="h-12 rounded-xl"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 transition-all outline-none"
                        disabled={loading || !identifier}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            "Envoyer le code"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
