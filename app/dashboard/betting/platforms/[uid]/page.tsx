"use client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/providers/language-provider"
import { useBettingPlatforms } from "@/lib/api/betting"
import { BettingPlatform } from "@/lib/types/betting"
import { ArrowLeft, RefreshCw, Shield, DollarSign, TrendingUp, TrendingDown, Activity, Users, Calendar, User, AlertCircle, Eye, Plus, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function PlatformDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const { getPlatformDetail } = useBettingPlatforms()
  const { toast } = useToast()

  const [platform, setPlatform] = useState<BettingPlatform | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const platformUid = params.uid as string

  const fetchPlatformDetail = async () => {
    if (!platformUid) return

    setLoading(true)
    setError("")
    try {
      const data = await getPlatformDetail(platformUid)
      setPlatform(data)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur de chargement", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatformDetail()
  }, [platformUid])

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Actif</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Inactif</Badge>
    }
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="rounded-xl border-2 h-10 md:h-12"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Détails de la Plateforme
          </h1>
          <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400">
            Informations complètes sur la plateforme
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 md:py-12">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Chargement...</p>
        </div>
      ) : error ? (
        <ErrorDisplay error={error} variant="full" />
      ) : platform ? (
        <>
          {/* Platform Header */}
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-4 md:p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {platform.logo ? (
                    <img
                      src={platform.logo}
                      alt={platform.name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Shield className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl md:text-3xl font-bold mb-2">{platform.name}</h2>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(platform.is_active)}
                      {platform.permission_is_active && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Permission Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPlatformDetail}
                    disabled={loading}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 rounded-xl"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Platform Information */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Basic Information */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Informations Générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Nom:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{platform.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">ID Externe:</span>
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{platform.external_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Statut:</span>
                    {getStatusBadge(platform.is_active)}
                  </div>
                  {platform.description && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Description:</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{platform.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Dépôt autorisé:</span>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        platform.can_deposit ? "bg-green-500" : "bg-red-500"
                      )} />
                      <span className="text-sm font-medium">
                        {platform.can_deposit ? "Oui" : "Non"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Retrait autorisé:</span>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        platform.can_withdraw ? "bg-green-500" : "bg-red-500"
                      )} />
                      <span className="text-sm font-medium">
                        {platform.can_withdraw ? "Oui" : "Non"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Permission active:</span>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        platform.permission_is_active ? "bg-green-500" : "bg-red-500"
                      )} />
                      <span className="text-sm font-medium">
                        {platform.permission_is_active ? "Oui" : "Non"}
                      </span>
                    </div>
                  </div>
                  {platform.granted_by_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Accordé par:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{platform.granted_by_name}</span>
                    </div>
                  )}
                  {platform.permission_granted_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Accordé le:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(platform.permission_granted_at)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Deposit Limits */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-500" />
                  Limites de Dépôt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Montant minimum:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatAmount(platform.min_deposit_amount)} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Montant maximum:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatAmount(platform.max_deposit_amount)} FCFA
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Plage de dépôt</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Vous pouvez effectuer des dépôts entre {formatAmount(platform.min_deposit_amount)} et {formatAmount(platform.max_deposit_amount)} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Limits */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-red-500" />
                  Limites de Retrait
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Montant minimum:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {formatAmount(platform.min_withdrawal_amount)} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Montant maximum:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {formatAmount(platform.max_withdrawal_amount)} FCFA
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800 dark:text-red-200">Plage de retrait</span>
                      </div>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Vous pouvez effectuer des retraits entre {formatAmount(platform.min_withdrawal_amount)} et {formatAmount(platform.max_withdrawal_amount)} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
            <div className="p-4 md:p-8">
              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl md:rounded-2xl h-10 md:h-12"
                >
                  <Link href={`/dashboard/betting/transactions?platform=${platform.uid}`}>
                    <Activity className="h-4 w-4 mr-2" />
                    Voir les Transactions
                  </Link>
                </Button>
                {platform.can_deposit && (
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-2 rounded-xl md:rounded-2xl h-10 md:h-12"
                  >
                    <Link href={`/dashboard/betting/deposit?platform=${platform.uid}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Effectuer un Dépôt
                    </Link>
                  </Button>
                )}
                {platform.can_withdraw && (
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-2 rounded-xl md:rounded-2xl h-10 md:h-12"
                  >
                    <Link href={`/dashboard/betting/withdrawal?platform=${platform.uid}`}>
                      <Minus className="h-4 w-4 mr-2" />
                      Effectuer un Retrait
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
