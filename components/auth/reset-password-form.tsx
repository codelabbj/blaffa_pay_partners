"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuthPasswords } from "@/lib/api/auth-passwords"
import { useToast } from "@/hooks/use-toast"
import { extractErrorMessages } from "@/components/ui/error-display"

export function ResetPasswordForm() {
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [identifier, setIdentifier] = useState("")

    const { confirmPasswordReset } = useAuthPasswords()
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const idParam = searchParams.get("identifier")
        if (idParam) {
            setIdentifier(idParam)
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast({
                title: "Erreur",
                description: "Les mots de passe ne correspondent pas.",
                variant: "destructive",
            })
            return
        }

        if (newPassword.length < 8) {
            toast({
                title: "Erreur",
                description: "Le mot de passe doit contenir au moins 8 caractères.",
                variant: "destructive",
            })
            return
        }

        if (!identifier) {
            toast({
                title: "Erreur",
                description: "Identifiant manquant. Veuillez recommencer la procédure.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            await confirmPasswordReset(identifier, code, newPassword)
            toast({
                title: "Succès",
                description: "Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.",
            })
            router.push("/")
        } catch (err: any) {
            const errorMessage = extractErrorMessages(err) || "Impossible de réinitialiser le mot de passe. Le code est peut-être expiré."
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
                    Réinitialisation
                </CardTitle>
                <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                    Entrez le code reçu par email/SMS et choisissez un nouveau mot de passe.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Code de vérification</Label>
                        <Input
                            id="code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="ex: 123456"
                            required
                            className="h-12 rounded-xl text-center text-lg tracking-widest"
                            maxLength={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Entrez le nouveau mot de passe"
                                required
                                className="h-12 rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirmez le nouveau mot de passe"
                                required
                                className="h-12 rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 transition-all outline-none"
                        disabled={loading || !code || !newPassword || !confirmPassword}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Vérification...
                            </>
                        ) : (
                            "Réinitialiser le mot de passe"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
