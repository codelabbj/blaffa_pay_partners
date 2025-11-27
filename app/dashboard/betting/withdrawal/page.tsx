"use client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/providers/language-provider"
import { useBettingTransactions, useBettingPlatforms } from "@/lib/api/betting"
import { BettingPlatform, UserVerificationResponse, TransactionCreateResponse, ExternalPlatformData } from "@/lib/types/betting"
import { ArrowLeft, RefreshCw, Minus, DollarSign, User, Shield, Check, X, AlertCircle, Loader2, Key } from "lucide-react"
import { toast } from "sonner"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function BettingWithdrawalContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()
  const { verifyUserId, createWithdrawal } = useBettingTransactions()
  const { getPlatformDetail, getPlatforms, getExternalPlatformByExternalId } = useBettingPlatforms()

  const [platform, setPlatform] = useState<BettingPlatform | null>(null)
  const [availablePlatforms, setAvailablePlatforms] = useState<any[]>([])
  const [externalPlatformsData, setExternalPlatformsData] = useState<Map<string, ExternalPlatformData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<UserVerificationResponse | null>(null)
  const [verificationError, setVerificationError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    betting_user_id: "",
    withdrawal_code: ""
  })

  const platformUid = searchParams.get('platform')

  const fetchAvailablePlatforms = async () => {
    try {
      const data = await getPlatforms()
      setAvailablePlatforms(data.results || [])
      
      // Fetch external platform data for each platform
      const externalDataMap = new Map<string, ExternalPlatformData>()
      const externalPromises = (data.results || []).map(async (platform) => {
        try {
          const externalData = await getExternalPlatformByExternalId(platform.external_id)
          if (externalData) {
            externalDataMap.set(platform.external_id, externalData)
          }
        } catch (error) {
          console.error(`Failed to fetch external data for platform ${platform.name}:`, error)
        }
      })
      
      await Promise.all(externalPromises)
      setExternalPlatformsData(externalDataMap)
    } catch (err: any) {
      console.error('Failed to fetch platforms:', err)
    }
  }

  const fetchPlatformDetail = async () => {
    if (!platformUid) {
      setError("")
      setLoading(false)
      await fetchAvailablePlatforms()
      return
    }

    setLoading(true)
    setError("")
    try {
      const data = await getPlatformDetail(platformUid)
      setPlatform(data)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatformDetail()
  }, [platformUid])

  const handlePlatformSelect = (platformUid: string) => {
    if (platformUid) {
      router.push(`/dashboard/betting/withdrawal?platform=${platformUid}`)
    }
  }

  const handleVerifyUserId = async () => {
    if (!formData.betting_user_id.trim()) {
      setVerificationError("Veuillez saisir un ID utilisateur")
      return
    }

    if (!platformUid) {
      setVerificationError("Plateforme non spécifiée")
      return
    }

    setVerifying(true)
    setVerificationError("")
    setVerificationResult(null)

    try {
      const result = await verifyUserId(platformUid, formData.betting_user_id)

      if (
        !result.success ||
        !result.user ||
        result.user.user_id === 0 ||
        result.user.currency_id !== 27
      ) {
        setVerificationError("ID utilisateur invalide")
        setVerificationResult(null)
      } else {
        setVerificationResult(result)
        toast.success(`Utilisateur: ${result.user.name}`)
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setVerificationError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!platformUid) {
      toast.error("Plateforme non spécifiée")
      return
    }

    if (!verificationResult?.user || verificationResult.user.user_id === 0) {
      toast.error("Veuillez vérifier l'ID utilisateur")
      return
    }

    if (!formData.withdrawal_code.trim()) {
      toast.error("Veuillez saisir le code de retrait")
      return
    }

    setSubmitting(true)
    try {
      const result: TransactionCreateResponse = await createWithdrawal({
        platform_uid: platformUid,
        betting_user_id: formData.betting_user_id,
        withdrawal_code: formData.withdrawal_code
      })

      // Check if the transaction was successful but failed
      if (result.success && result.transaction && result.transaction.status === "failed") {
        // Extract error message from external_response or notes
        const errorMessage = result.transaction.external_response?.error || 
                           result.transaction.notes || 
                           "La transaction a échoué"
        
        toast.error(errorMessage)
        
        // Don't reset form or redirect on failure
        return
      }

      toast.success(result.message || "Retrait effectué avec succès")

      // Reset form
      setFormData({ betting_user_id: "", withdrawal_code: "" })
      setVerificationResult(null)
      setVerificationError("")

      // Add a small delay to ensure toast is visible before redirecting
      setTimeout(() => {
        router.push(`/dashboard/betting/transactions?platform=${platformUid}`)
      }, 1500)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString()
  }

  const isFormValid = () => {
    return formData.betting_user_id.trim() && 
           formData.withdrawal_code.trim() &&
           verificationResult?.user && 
           verificationResult.user.user_id > 0
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
            Effectuer un Retrait
          </h1>
          <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400">
            Créer une transaction de retrait
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Chargement...</p>
        </div>
      ) : error ? (
        <ErrorDisplay error={error} variant="full" />
      ) : !platformUid ? (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sélectionner une Plateforme
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              Choisissez la plateforme sur laquelle vous souhaitez effectuer un retrait
            </p>
          </div>
          
          {availablePlatforms.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucune plateforme disponible</p>
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {availablePlatforms
                .map((platform) => (
                <Card
                  key={platform.uid}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700"
                  onClick={() => handlePlatformSelect(platform.uid)}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {platform.logo ? (
                        <img
                          src={platform.logo}
                          alt={platform.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                          <Shield className="h-6 w-6 text-orange-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{platform.name}</h3>
                        <Badge className="bg-red-100 text-white dark:bg-red-900 dark:text-white text-xs">
                          Retrait autorisé
                        </Badge>
                      </div>
                    </div>
                    {/* External Platform Info */}
                    {externalPlatformsData.has(platform.external_id) && (
                      <div className="space-y-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Ville:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {externalPlatformsData.get(platform.external_id)?.city}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Rue:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {externalPlatformsData.get(platform.external_id)?.street}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Min:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {platform.min_withdrawal_amount} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Max:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {platform.max_withdrawal_amount} FCFA
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : platform ? (
        <>
          {/* Platform Info */}
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-4 md:p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
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
                    <Badge className="bg-orange-100 text-white dark:bg-orange-900 dark:text-white">
                      Retrait
                    </Badge>
                    {platform.can_withdraw && (
                      <Badge className="bg-white/20 text-white">
                        Autorisé
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* External Platform Location Info */}
          {externalPlatformsData.has(platform.external_id) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl md:rounded-3xl border border-blue-200 dark:border-blue-800 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm md:text-base font-semibold text-blue-900 dark:text-blue-100">
                  Informations de Localisation
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Ville</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {externalPlatformsData.get(platform.external_id)?.city}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Rue</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {externalPlatformsData.get(platform.external_id)?.street}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Withdrawal Form */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Form */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-orange-500" />
                  Nouveau Retrait
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User ID Input */}
                  <div>
                    <Label htmlFor="betting_user_id" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      ID Utilisateur de Paris *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="betting_user_id"
                        type="text"
                        placeholder="Saisissez l'ID utilisateur"
                        value={formData.betting_user_id}
                        onChange={(e) => {
                          setFormData({...formData, betting_user_id: e.target.value})
                          setVerificationResult(null)
                          setVerificationError("")
                        }}
                        className="flex-1 rounded-xl border-2 focus:border-orange-500 focus:ring-orange-500/20"
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyUserId}
                        disabled={verifying || !formData.betting_user_id.trim()}
                        className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {verifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Verification Result */}
                    {verificationResult?.user && verificationResult.user.user_id > 0 && (
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800 dark:text-green-200">
                            Utilisateur vérifié: {verificationResult.user.name}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {verificationError && (
                      <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-800 dark:text-red-200">
                            {verificationError}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Withdrawal Code Input */}
                  <div>
                    <Label htmlFor="withdrawal_code" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Code de Retrait *
                    </Label>
                    <Input
                      id="withdrawal_code"
                      type="text"
                      placeholder="Saisissez le code de retrait"
                      value={formData.withdrawal_code}
                      onChange={(e) => setFormData({...formData, withdrawal_code: e.target.value})}
                      className="rounded-xl border-2 focus:border-orange-500 focus:ring-orange-500/20"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Le code de retrait est fourni par l'utilisateur sur la plateforme
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submitting || !isFormValid()}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl h-12"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Minus className="h-4 w-4 mr-2" />
                        Créer le Retrait
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Platform Limits */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-500" />
                  Limites de Retrait
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Montant minimum:</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {formatAmount(platform.min_withdrawal_amount)} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Montant maximum:</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {formatAmount(platform.max_withdrawal_amount)} FCFA
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Instructions</span>
                    </div>
                    <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                      <li>• Vérifiez l'ID utilisateur avant de créer le retrait</li>
                      <li>• Le code de retrait doit être fourni par l'utilisateur</li>
                      <li>• Le montant sera déterminé automatiquement</li>
                      <li>• La transaction sera traitée automatiquement</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Code de Retrait</span>
                    </div>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      L'utilisateur doit générer un code de retrait sur la plateforme de paris avant de pouvoir effectuer un retrait. Ce code sert de confirmation et de sécurité.
                    </p>
                  </div>
                </div>

                {verificationResult?.user && verificationResult.user.user_id > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Utilisateur Vérifié</span>
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                        <p><strong>Nom:</strong> {verificationResult.user.name}</p>
                        <p><strong>ID:</strong> {verificationResult.user.user_id}</p>
                        <p><strong>Devise:</strong> {verificationResult.user.currency_id}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default function BettingWithdrawalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BettingWithdrawalContent />
    </Suspense>
  )
}
