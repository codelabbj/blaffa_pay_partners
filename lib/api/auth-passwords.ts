import { useApi } from "../useApi"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export const useAuthPasswords = () => {
    const apiFetch = useApi()

    // Update Password (Logged-In User)
    const updatePassword = async (old_password: string, new_password: string) => {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/password-update/`
        return await apiFetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ old_password, new_password })
        })
    }

    // Initiate Password Reset (Logged-Out User)
    const initiatePasswordReset = async (identifier: string) => {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/password-reset/initiate/`
        // Using standard fetch since this is an unauthenticated endpoint and useApi might try to attach/refresh tokens
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ identifier })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.detail || "Failed to initiate password reset")
        }

        return await response.json()
    }

    // Confirm Password Reset (Logged-Out User)
    const confirmPasswordReset = async (identifier: string, code: string, new_password: string) => {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/password-reset/confirm/`
        // Using standard fetch since this is an unauthenticated endpoint
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ identifier, code, new_password })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.detail || "Failed to confirm password reset")
        }

        return await response.json()
    }

    return {
        updatePassword,
        initiatePasswordReset,
        confirmPasswordReset
    }
}
