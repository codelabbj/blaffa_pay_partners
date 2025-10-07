"use client"

import type React from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { WebSocketProvider } from "@/components/providers/websocket-provider"
import { PermissionsProvider } from "@/components/providers/permissions-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get token from localStorage (set in sign-in-form.tsx after login)
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || "";
  }
  return (
    <PermissionsProvider>
      <WebSocketProvider token={token}>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
          <Sidebar />
          <div className="lg:pl-80">
            <Header />
            <main className="py-4 md:py-8">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative">
                  {/* Background decorative elements */}
                  <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-200/20 dark:bg-orange-800/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-200/20 dark:bg-green-800/20 rounded-full blur-3xl"></div>
                  </div>
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </WebSocketProvider>
    </PermissionsProvider>
  )
}
