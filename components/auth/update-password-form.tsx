"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuthPasswords } from "@/lib/api/auth-passwords"
import { toast } from "sonner"
import { useLanguage } from "@/components/providers/language-provider"

export function UpdatePasswordForm() {
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const { updatePassword } = useAuthPasswords()
    const { t } = useLanguage()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error("Les nouveaux mots de passe ne correspondent pas.")
            return
        }

        // if (newPassword.length < 8) {
        //     toast.error("Le mot de passe doit contenir au moins 8 caractères.")
        //     return
        // }

        setLoading(true)
        try {
            const response = await updatePassword(oldPassword, newPassword)
            const successMessage = response?.message || "Votre mot de passe a été mis à jour avec succès."
            toast.success(successMessage)
            // Clear form on success
            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err: any) {
            // useApi throws the raw JSON object, not an Error instance.
            // Extract the message from common backend error fields.
            let errorMessage = "Impossible de mettre à jour le mot de passe."
            if (err) {
                if (typeof err === "string") {
                    errorMessage = err
                } else if (err.detail) {
                    errorMessage = err.detail
                } else if (err.old_password) {
                    errorMessage = Array.isArray(err.old_password) ? err.old_password[0] : err.old_password
                } else if (err.new_password) {
                    errorMessage = Array.isArray(err.new_password) ? err.new_password[0] : err.new_password
                } else if (err.non_field_errors) {
                    errorMessage = Array.isArray(err.non_field_errors) ? err.non_field_errors[0] : err.non_field_errors
                } else if (err.message) {
                    errorMessage = err.message
                }
            }
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>
                    Mettez à jour votre mot de passe pour sécuriser votre compte.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="oldPassword">Mot de passe actuel</Label>
                        <div className="relative">
                            <Input
                                id="oldPassword"
                                type={showOldPassword ? "text" : "password"}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Entrez votre mot de passe actuel"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">
                                    {showOldPassword ? "Masquer" : "Afficher"} le mot de passe
                                </span>
                            </button>
                        </div>
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
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">
                                    {showNewPassword ? "Masquer" : "Afficher"} le mot de passe
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirmez le nouveau mot de passe"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">
                                    {showConfirmPassword ? "Masquer" : "Afficher"} le mot de passe
                                </span>
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || !oldPassword || !newPassword || !confirmPassword}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mise à jour...
                            </>
                        ) : (
                            "Mettre à jour le mot de passe"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
