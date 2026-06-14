"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

interface UserPermissions {
  // can_process_ussd_transaction: boolean
  can_process_momo: boolean
  can_process_mobcash: boolean
  can_process_bulk_payment: boolean
}

interface UserProfile {
  uid?: string
  email?: string
  phone?: string
  first_name?: string
  last_name?: string
  display_name?: string
  is_active?: boolean
  email_verified?: boolean
  phone_verified?: boolean
  is_verified?: boolean
  contact_method?: string
  created_at?: string
  updated_at?: string
  can_process_momo?: boolean
  can_process_mobcash?: boolean
  can_process_bulk_payment?: boolean
}

interface PermissionsContextType {
  permissions: UserPermissions | null
  user: UserProfile | null
  hasPermission: (permission: keyof UserPermissions) => boolean
  isLoading: boolean
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoading(true)
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      try {
        // Try fetching from API first
        const token = localStorage.getItem('accessToken')
        if (token) {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
          const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/profile/`

          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            const user = data.user || data

            // Generate the permission object
            const basePermissions = {
              // can_process_ussd_transaction: user.can_process_ussd_transaction !== false,
              can_process_momo: user.can_process_momo !== false,
              can_process_mobcash: user.can_process_mobcash !== false,
              can_process_bulk_payment: user.can_process_bulk_payment !== false,
            }

            setPermissions(basePermissions)
            setUser(user)

            // Update localStorage to keep it in sync
            const existingUserData = localStorage.getItem('user')
            if (existingUserData) {
              const existingUser = JSON.parse(existingUserData)
              localStorage.setItem('user', JSON.stringify({ ...existingUser, ...user }))
            } else {
              localStorage.setItem('user', JSON.stringify(user))
            }

            setIsLoading(false)
            return
          }
        }

        // Fallback to localStorage if API request fails or no token
        const userData = localStorage.getItem('user')
        if (userData) {
          const storedUser = JSON.parse(userData)
          setUser(storedUser)
          setPermissions({
            // can_process_ussd_transaction: user.can_process_ussd_transaction !== false,
            can_process_momo: storedUser.can_process_momo !== false,
            can_process_mobcash: storedUser.can_process_mobcash !== false,
            can_process_bulk_payment: storedUser.can_process_bulk_payment !== false,
          })
        }
      } catch (error) {
        console.error('Error loading user permissions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  const hasPermission = useCallback((permission: keyof UserPermissions): boolean => {
    if (!permissions) return false
    return permissions[permission] === true
  }, [permissions])

  const contextValue = useMemo(() => ({
    permissions,
    user,
    hasPermission,
    isLoading,
  }), [permissions, user, hasPermission, isLoading])

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}
