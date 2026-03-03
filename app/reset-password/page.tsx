"use client"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { useLanguage } from "@/components/providers/language-provider"
import { Suspense } from "react"

export default function ResetPasswordPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div>Chargement...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
