"use client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/providers/language-provider"
import { useBettingPlatforms } from "@/lib/api/betting"
import { BettingPlatform, BettingPlatformsWithStatsResponse } from "@/lib/types/betting"
import { Search, RefreshCw, TrendingUp, TrendingDown, Activity, Shield, Eye, DollarSign, Users, AlertCircle, Plus, Minus, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function BettingPlatformsPage() {
  const { t } = useLanguage()
  const { getPlatformsWithStats } = useBettingPlatforms()
  const { toast } = useToast()

  const [platformsData, setPlatformsData] = useState<BettingPlatformsWithStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchPlatforms = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getPlatformsWithStats()
      setPlatformsData(data)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur de chargement", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const filteredPlatforms = platformsData?.authorized_platforms.filter(platform =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const getStatusBadge = (isActive: boolean, permissionActive: boolean) => {
    if (isActive && permissionActive) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Actif</Badge>
    } else if (!isActive) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Inactif</Badge>
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Permission révoquée</Badge>
    }
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString()
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-4 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">Plateformes de Paris</h1>
              <p className="text-orange-100 text-sm md:text-lg">Gérez vos plateformes de paris autorisées</p>
            </div>
            <div className="flex md:hidden items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-full">
                <div className="text-lg font-bold text-center">
                  {platformsData?.summary.authorized_count || 0} autorisées
                </div>
                <div className="text-orange-100 text-xs text-center">sur {platformsData?.summary.total_platforms || 0}</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-bold">
                  {platformsData?.summary.authorized_count || 0}
                </div>
                <div className="text-orange-100 text-sm">Autorisées</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-bold">
                  {platformsData?.summary.platforms_with_transactions || 0}
                </div>
                <div className="text-orange-100 text-sm">Avec transactions</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Summary Statistics */}
      {platformsData && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Total Plateformes</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{platformsData.summary.total_platforms}</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Toutes les plateformes</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl md:rounded-2xl">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Autorisées</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{platformsData.summary.authorized_count}</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Accès accordé</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl md:rounded-2xl">
                <TrendingDown className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Non Autorisées</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{platformsData.summary.unauthorized_count}</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Accès refusé</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl md:rounded-2xl">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Avec Transactions</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{platformsData.summary.platforms_with_transactions}</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Activité enregistrée</p>
          </div>
        </div>
      )}

      {/* Search and Actions */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Plateformes Autorisées</h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Vos plateformes de paris avec accès</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPlatforms}
                disabled={loading}
                className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12 text-sm md:text-base px-3 md:px-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </Button>
              <Link href="/dashboard/betting/deposit">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl md:rounded-2xl h-10 md:h-12 text-sm md:text-base px-3 md:px-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nouveau Dépôt</span>
                  <span className="sm:hidden">Dépôt</span>
                </Button>
              </Link>
              <Link href="/dashboard/betting/withdrawal">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl md:rounded-2xl h-10 md:h-12 text-sm md:text-base px-3 md:px-4"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nouveau Retrait</span>
                  <span className="sm:hidden">Retrait</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Label htmlFor="search" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Rechercher une plateforme
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Tapez le nom de la plateforme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-orange-500 focus:ring-orange-500/20 text-sm md:text-base pl-10"
              />
            </div>
          </div>

          {/* Platforms List */}
          {loading ? (
            <div className="text-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Chargement...</p>
            </div>
          ) : error ? (
            <ErrorDisplay error={error} variant="full" />
          ) : (
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlatforms.length === 0 ? (
                <div className="col-span-full text-center py-8 md:py-12">
                  <div className="text-center">
                    <Shield className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                      {searchQuery ? "Aucune plateforme trouvée" : "Aucune plateforme autorisée"}
                    </p>
                    {searchQuery && (
                      <p className="text-xs text-gray-400 mt-1">Essayez un autre terme de recherche</p>
                    )}
                  </div>
                </div>
              ) : (
                filteredPlatforms.map((platform) => (
                  <Card key={platform.uid} className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl md:rounded-2xl hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {platform.logo ? (
                            <img
                              src={platform.logo}
                              alt={platform.name}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                              <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">
                              {platform.name}
                            </CardTitle>
                            {getStatusBadge(platform.is_active, platform.permission_is_active || false)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Stats */}
                      {platform.my_stats && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">Transactions</span>
                            </div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {platform.my_stats.total_transactions}
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">Montant</span>
                            </div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {platform.my_stats.total_amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Limits */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Dépôt min/max:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatAmount(platform.min_deposit_amount)} - {formatAmount(platform.max_deposit_amount)} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Retrait min/max:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatAmount(platform.min_withdrawal_amount)} - {formatAmount(platform.max_withdrawal_amount)} FCFA
                          </span>
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              platform.can_deposit ? "bg-green-500" : "bg-red-500"
                            )} />
                            <span className="text-gray-500 dark:text-gray-400">Dépôt</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              platform.can_withdraw ? "bg-green-500" : "bg-red-500"
                            )} />
                            <span className="text-gray-500 dark:text-gray-400">Retrait</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          asChild
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-xs"
                        >
                          <Link href={`/dashboard/betting/platforms/${platform.uid}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-lg text-xs border-2"
                        >
                          <Link href={`/dashboard/betting/transactions?platform=${platform.uid}`}>
                            <Activity className="h-3 w-3 mr-1" />
                            Transactions
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
