"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"
import { BarChart3, LayoutDashboard, CreditCard, LogOut, Menu, X, Zap, Sparkles, Shield, Activity, Send, Gamepad2, DollarSign, FileSpreadsheet, KeyRound } from "lucide-react"
import { clearTokens } from "@/lib/api"

function SectionHeader({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) {
  return (
    <div className="flex items-center gap-2 mt-8 mb-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </div>
  )
}

function NavItem({ href, icon: Icon, children, isActive, onNavigate }: {
  href: string
  icon: any
  children: React.ReactNode
  isActive: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-4 px-6 py-4 text-sm font-medium rounded-2xl transition-colors duration-200",
        isActive
          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
          : "text-gray-700 hover:bg-gray-100 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      )}
      onClick={onNavigate}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200",
        isActive
          ? "bg-white/20 text-white"
          : "bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-gray-700 dark:group-hover:text-white"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1">{children}</span>
    </Link>
  )
}

function SidebarContent({
  titleSize = "lg",
  onNavigate,
  onLogout,
}: {
  titleSize?: "lg" | "xl"
  onNavigate?: () => void
  onLogout: () => void
}) {
  const pathname = usePathname()
  const { t } = useLanguage()

  const isBettingPlatformsActive = pathname.startsWith("/dashboard/betting/platforms")
  const isBettingTransactionsActive = pathname.startsWith("/dashboard/betting/transactions")
  const isBettingCommissionsActive = pathname.startsWith("/dashboard/betting/commissions")

  return (
    <>
      <div className="flex h-20 items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img src="/logo.png" alt="Blaffa Pay Logo" className="h-12 w-12 rounded-xl shadow-sm" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <span className={cn(
              "font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent",
              titleSize === "xl" ? "text-xl" : "text-lg"
            )}>
              Blaffa Pay
            </span>
            <p className={cn("text-gray-500 dark:text-gray-400", titleSize === "xl" ? "text-sm" : "text-xs")}>
              Partenaires
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto min-h-0">
        <SectionHeader icon={Sparkles}>Générale</SectionHeader>
        <NavItem href="/dashboard" icon={BarChart3} isActive={pathname === "/dashboard"} onNavigate={onNavigate}>
          {t("nav.dashboard")}
        </NavItem>

        <SectionHeader icon={Activity}>Gestion des transactions</SectionHeader>
        <NavItem href="/dashboard/transactions" icon={CreditCard} isActive={pathname === "/dashboard/transactions"} onNavigate={onNavigate}>
          {t("nav.transactions")}
        </NavItem>
        <NavItem href="/dashboard/account-transaction" icon={LayoutDashboard} isActive={pathname === "/dashboard/account-transaction"} onNavigate={onNavigate}>
          {t("nav.accountTransaction")}
        </NavItem>
        <NavItem href="/dashboard/topup" icon={Zap} isActive={pathname === "/dashboard/topup"} onNavigate={onNavigate}>
          {t("nav.topup")}
        </NavItem>
        <NavItem href="/dashboard/transfer" icon={Send} isActive={pathname === "/dashboard/transfer"} onNavigate={onNavigate}>
          Transfert UV
        </NavItem>
        <NavItem href="/dashboard/bulk-payment" icon={FileSpreadsheet} isActive={pathname === "/dashboard/bulk-payment"} onNavigate={onNavigate}>
          {t("nav.bulkPayment")}
        </NavItem>
        <NavItem href="/dashboard/api-keys" icon={KeyRound} isActive={pathname === "/dashboard/api-keys"} onNavigate={onNavigate}>
          API Keys
        </NavItem>

        <SectionHeader icon={Gamepad2}>Plateformes de Paris</SectionHeader>
        <NavItem href="/dashboard/betting/platforms" icon={Shield} isActive={isBettingPlatformsActive} onNavigate={onNavigate}>
          Plateformes
        </NavItem>
        <NavItem href="/dashboard/betting/transactions" icon={Activity} isActive={isBettingTransactionsActive} onNavigate={onNavigate}>
          Transactions
        </NavItem>
        <NavItem href="/dashboard/betting/commissions" icon={DollarSign} isActive={isBettingCommissionsActive} onNavigate={onNavigate}>
          Commissions
        </NavItem>
      </nav>
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-2xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t("nav.logout")}
        </Button>
      </div>
    </>
  )
}

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    clearTokens()
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict'
    }
    localStorage.removeItem("isAuthenticated")
    router.push("/")
  }

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full shadow-lg">
            <div className="absolute top-5 right-4 z-10">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent
              titleSize="lg"
              onNavigate={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full min-h-0 shadow-sm">
          <SidebarContent titleSize="xl" onLogout={handleLogout} />
        </div>
      </div>

      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-6 left-6 z-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </>
  )
}
