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
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/providers/language-provider"
import { extractErrorMessages } from "@/components/ui/error-display"
import Link from "next/link"

export function ForgotPasswordForm() {
    const [identifier, setIdentifier] = useState("")
    const [loading, setLoading] = useState(false)

    const { initiatePasswordReset } = useAuthPasswords()
    const { toast } = useToast()
    const { t } = useLanguage()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await initiatePasswordReset(identifier)
            toast({
                title: "Code de réinitialisation envoyé",
                description: "Vérifiez vos emails ou SMS pour obtenir le code de réinitialisation.",
            })
            router.push(`/reset-password?identifier=${encodeURIComponent(identifier)}`)
        } catch (err: any) {
            const errorMessage = extractErrorMessages(err) || "Impossible d'initier la réinitialisation."
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-2xl border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardHeader className="space-y-3">
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
            <CardFooter className="flex justify-center flex-col items-center">
                <Link href="/" className="text-sm text-gray-500 hover:text-orange-500 transition-colors flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la connexion
                </Link>
            </CardFooter>
        </Card>
    )
}
