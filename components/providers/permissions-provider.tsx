"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface UserPermissions {
  can_process_ussd_transaction: boolean
  can_process_momo: boolean
  can_process_mobcash: boolean
  can_process_bulk_payment: boolean
}

interface PermissionsContextType {
  permissions: UserPermissions | null
  hasPermission: (permission: keyof UserPermissions) => boolean
  isLoading: boolean
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load permissions from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          setPermissions({
            can_process_ussd_transaction: user.can_process_ussd_transaction !== false,
            can_process_momo: user.can_process_momo !== false,
            can_process_mobcash: user.can_process_mobcash !== false,
            can_process_bulk_payment: user.can_process_bulk_payment !== false,
          })
        }
      } catch (error) {
        console.error('Error loading user permissions:', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!permissions) return false
    return permissions[permission] === true
  }

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, isLoading }}>
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
