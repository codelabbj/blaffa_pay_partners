"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/components/providers/language-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useApi } from "@/lib/useApi"

const pageNames: Record<string, string> = {
  "/dashboard": "dashboard.title",
  "/dashboard/users": "users.title",
  "/dashboard/transactions": "transactions.title",
  "/dashboard/account-transaction": "nav.accountTransaction",
  "/dashboard/topup": "nav.topup",
}

interface UserProfile {
  uid: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  display_name: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  is_verified: boolean;
  contact_method: string;
  created_at: string;
  updated_at: string;
}

export function Header() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const apiFetch = useApi()

  const pageTitle = pageNames[pathname] || "dashboard.title"

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
        const endpoint = `${baseUrl}api/auth/profile/`
        const data = await apiFetch(endpoint)
        setUserProfile(data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        // Keep default values if API fails
      } finally {
        setProfileLoading(false)
      }
    }

    fetchUserProfile()
  }, [apiFetch])

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!userProfile) return "JD"
    const firstName = userProfile.first_name || ""
    const lastName = userProfile.last_name || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U"
  }

  // Helper function to get display name
  const getDisplayName = () => {
    if (!userProfile) return "John Doe"
    return userProfile.display_name || `${userProfile.first_name} ${userProfile.last_name}`.trim() || "Utilisateur"
  }

  // Helper function to get user role
  const getUserRole = () => {
    if (!userProfile) return "Administrateur"
    return userProfile.is_verified ? "Utilisateur Vérifié" : "Utilisateur"
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 md:h-16 justify-between items-center">
          {/* Left Section - Title and Status */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 min-w-0">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <h1 className="text-sm sm:text-lg md:text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent truncate">
                {t(pageTitle)}
              </h1>
            </div>
            {/* <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs hidden sm:inline-flex">
              Live
            </Badge> */}
          </div>
          
          {/* Right Section - Actions */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-2 lg:space-x-4">
            {/* Mobile Search Button */}
            {/* <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-xl h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button> */}

            {/* Desktop Search Bar */}
            {/* <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div> */}

            {/* Notifications */}
            {/* <Button variant="ghost" size="icon" className="relative rounded-xl h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse"></div>
            </Button> */}

            {/* Settings */}
            {/* <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </Button> */}

            {/* Theme Toggle */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg md:rounded-xl p-0.5 md:p-1">
              <ThemeToggle />
            </div>

            {/* Language Switcher */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg md:rounded-xl p-0.5 md:p-1">
              <LanguageSwitcher />
            </div>

            {/* User Avatar - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="hidden sm:flex items-center space-x-1 md:space-x-2 lg:space-x-3 cursor-pointer bg-gray-50 dark:bg-gray-800 rounded-lg md:rounded-xl p-1 md:p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Avatar className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ring-2 ring-orange-500/20">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs md:text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profileLoading ? "Chargement..." : getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {profileLoading ? "..." : getUserRole()}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50">
                <DropdownMenuItem className="rounded-lg">
                  <a href="/dashboard/profile" className="flex items-center w-full">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Mon Profil</p>
                      <p className="text-sm text-gray-500">Gérer votre compte</p>
                    </div>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile User Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden rounded-xl h-8 w-8">
                  <Menu className="h-3 w-3" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/50">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <ThemeToggle />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <LanguageSwitcher />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {/* User Profile Section */}
                  <div className="flex items-center space-x-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <Avatar className="h-12 w-12 ring-2 ring-orange-500/20">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profileLoading ? "Chargement..." : getDisplayName()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {profileLoading ? "..." : getUserRole()}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <div className="flex-1 space-y-2">
                    <Button variant="ghost" className="w-full justify-start rounded-xl h-12">
                      <Bell className="h-5 w-5 mr-3" />
                      Notifications
                      <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start rounded-xl h-12">
                      <Settings className="h-5 w-5 mr-3" />
                      Paramètres
                    </Button>
                    <Button variant="ghost" className="w-full justify-start rounded-xl h-12">
                      <Avatar className="h-5 w-5 mr-3" />
                      Mon Profil
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
