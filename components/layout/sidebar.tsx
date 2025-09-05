"use client"

import { useState, Fragment } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"
import { BarChart3, LayoutDashboard, CreditCard, LogOut, Menu, X, Zap, ChevronDown, ChevronUp, Globe, Share2, Phone, Monitor, MessageCircle, Bell, Settings, Terminal, User, ChevronDownCircleIcon, BarChart3Icon, Sparkles, Shield, Activity } from "lucide-react"
import { clearTokens } from "@/lib/api"

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false)
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false)
  const [devicesDropdownOpen, setDevicesDropdownOpen] = useState(false)
  const [networkConfigDropdownOpen, setNetworkConfigDropdownOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

  // Helper to check if a path is active or a child is active
  const isUsersActive = pathname.startsWith("/dashboard/users")
  const isRegisterActive = pathname === "/dashboard/users/register"
  const isListActive = pathname === "/dashboard/users/list"

  // Active logic for new dropdowns
  const isCountryActive = pathname.startsWith("/dashboard/country")
  const isCountryListActive = pathname === "/dashboard/country/list"
  const isCountryCreateActive = pathname === "/dashboard/country/create"

  const isNetworkActive = pathname.startsWith("/dashboard/network")
  const isNetworkListActive = pathname === "/dashboard/network/list"
  const isNetworkCreateActive = pathname === "/dashboard/network/create"

  const isDevicesActive = pathname.startsWith("/dashboard/devices")
  const isDevicesListActive = pathname === "/dashboard/devices/list"

  const isNetworkConfigActive = pathname.startsWith("/dashboard/network-config")
  const isNetworkConfigListActive = pathname === "/dashboard/network-config/list"
  const isNetworkConfigCreateActive = pathname === "/dashboard/network-config/create"

  const handleLogout = () => {
    clearTokens();
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    }
    localStorage.removeItem("isAuthenticated");
    router.push("/");
  }

  // Helper for section headers
  const SectionHeader = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
    <div className="flex items-center gap-2 mt-8 mb-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </div>
  )

  const NavItem = ({ href, icon: Icon, children, isActive }: { href: string, icon: any, children: React.ReactNode, isActive: boolean }) => (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-4 px-6 py-4 text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-105",
        isActive
          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
          : "text-gray-700 hover:bg-white/50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-white"
      )}
      onClick={() => setSidebarOpen(false)}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
        isActive
          ? "bg-white/20 text-white"
          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-gray-700 dark:group-hover:text-white"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1">{children}</span>
      {isActive && (
        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
      )}
    </Link>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden transition-all duration-300",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50 h-full shadow-2xl transition-transform duration-300">
          <div className="flex h-20 items-center justify-between px-6 border-b border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/logo.png" alt="Blaffa Pay Logo" className="h-12 w-12 rounded-xl shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Blaffa Pay
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Partenaires</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto min-h-0">
            <SectionHeader icon={Sparkles}>Générale</SectionHeader>
            <NavItem href="/dashboard" icon={BarChart3} isActive={pathname === "/dashboard"}>
              {t("nav.dashboard")}
            </NavItem>
            
            <SectionHeader icon={Activity}>Gestion des transactions</SectionHeader>
            <NavItem href="/dashboard/transactions" icon={CreditCard} isActive={pathname === "/dashboard/transactions"}>
              {t("nav.transactions")}
            </NavItem>
            <NavItem href="/dashboard/account-transaction" icon={LayoutDashboard} isActive={pathname === "/dashboard/account-transaction"}>
              {t("nav.accountTransaction")}
            </NavItem>
            <NavItem href="/dashboard/topup" icon={Zap} isActive={pathname === "/dashboard/topup"}>
              {t("nav.topup")}
            </NavItem>
          </nav>
          <div className="p-6 border-t border-white/20 dark:border-gray-700/50">
            <Button 
              variant="ghost" 
              className="w-full justify-start rounded-2xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" 
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50 h-full min-h-0 shadow-2xl">
          <div className="flex h-20 items-center px-6 border-b border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/logo.png" alt="Blaffa Pay Logo" className="h-12 w-12 rounded-xl shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Blaffa Pay
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Partenaires</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto min-h-0">
            <SectionHeader icon={Sparkles}>Générale</SectionHeader>
            <NavItem href="/dashboard" icon={BarChart3} isActive={pathname === "/dashboard"}>
              {t("nav.dashboard")}
            </NavItem>
            
            <SectionHeader icon={Activity}>Gestion des transactions</SectionHeader>
            <NavItem href="/dashboard/transactions" icon={CreditCard} isActive={pathname === "/dashboard/transactions"}>
              {t("nav.transactions")}
            </NavItem>
            <NavItem href="/dashboard/account-transaction" icon={LayoutDashboard} isActive={pathname === "/dashboard/account-transaction"}>
              {t("nav.accountTransaction")}
            </NavItem>
            <NavItem href="/dashboard/topup" icon={Zap} isActive={pathname === "/dashboard/topup"}>
              {t("nav.topup")}
            </NavItem>
          </nav>
          <div className="p-6 border-t border-white/20 dark:border-gray-700/50">
            <Button 
              variant="ghost" 
              className="w-full justify-start rounded-2xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" 
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-6 left-6 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-lg" 
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </>
  )
}
