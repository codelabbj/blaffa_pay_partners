"use client"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { useLanguage } from "@/components/providers/language-provider"

export default function ForgotPasswordPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <ForgotPasswordForm />
        </div>
    )
}
