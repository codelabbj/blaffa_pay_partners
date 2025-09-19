"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Check, RefreshCw, CreditCard, Phone, Network, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function CreateTransactionPage() {
  const [networks, setNetworks] = useState<any[]>([])
  const [networksLoading, setNetworksLoading] = useState(true)
  const [networksError, setNetworksError] = useState("")
  
  const [transactionForm, setTransactionForm] = useState({
    type: "" as "deposit" | "withdrawal" | "",
    amount: "",
    recipient_phone: "",
    network: "" as any,
  })
  
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()
  const router = useRouter()

  // Fetch networks on component mount
  useEffect(() => {
    const fetchNetworks = async () => {
      setNetworksLoading(true)
      setNetworksError("")
      try {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/networks/`
        const data = await apiFetch(endpoint)
        // Filter only active networks
        const activeNetworks = (data.results || []).filter((network: any) => network.is_active)
        setNetworks(activeNetworks)
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setNetworksError(errorMessage)
        toast({ title: t("payment.failedToLoadNetworks"), description: errorMessage, variant: "destructive" })
      } finally {
        setNetworksLoading(false)
      }
    }
    fetchNetworks()
  }, [baseUrl, apiFetch, t, toast])

  const handleTransactionTypeSelect = (type: "deposit" | "withdrawal") => {
    setTransactionForm(prev => ({ ...prev, type }))
  }

  const handleNetworkSelect = (network: any) => {
    setTransactionForm(prev => ({ ...prev, network }))
  }

  const handleCreateClick = () => {
    setConfirmModalOpen(true)
  }

  const handleConfirmTransaction = async () => {
    setSubmitting(true)
    setSubmitError("")
    try {
      const payload = {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        recipient_phone: transactionForm.recipient_phone,
        network: transactionForm.network.uid,
        objet: null
      }

      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/`
      await apiFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      
      toast({ 
        title: t("payment.transactionCreated"), 
        description: t("payment.transactionCreatedSuccessfully") 
      })
      setConfirmModalOpen(false)
      router.push("/dashboard/transactions")
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setSubmitError(errorMessage)
      toast({ 
        title: t("payment.failedToCreateTransaction"), 
        description: errorMessage, 
        variant: "destructive" 
      })
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = () => {
    return transactionForm.type && 
           transactionForm.amount && 
           parseFloat(transactionForm.amount) > 0 && 
           transactionForm.recipient_phone && 
           transactionForm.network
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.back()}
                  className="text-white hover:bg-white/20 rounded-2xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Nouvelle Transaction</h1>
              <p className="text-orange-100 text-lg">Créez une nouvelle transaction de paiement</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-bold">Transaction</div>
                <div className="text-orange-100 text-sm">Création</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Transaction Type Selection */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Type de Transaction</h2>
              <p className="text-gray-500 dark:text-gray-400">Sélectionnez le type de transaction à créer</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className={`relative overflow-hidden rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                transactionForm.type === "deposit" 
                  ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20" 
                  : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
              }`}
              onClick={() => handleTransactionTypeSelect("deposit")}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                    <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  {transactionForm.type === "deposit" && (
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Dépôt</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Ajouter de l'argent à votre compte ou transférer vers un autre compte
                </p>
                <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                  <DollarSign className="h-4 w-4" />
                  <span>Crédit de compte</span>
                </div>
              </div>
            </div>

            <div 
              className={`relative overflow-hidden rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                transactionForm.type === "withdrawal" 
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" 
                  : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
              }`}
              onClick={() => handleTransactionTypeSelect("withdrawal")}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                    <TrendingDown className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  {transactionForm.type === "withdrawal" && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Retrait</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Retirer de l'argent de votre compte vers un autre compte
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <DollarSign className="h-4 w-4" />
                  <span>Débit de compte</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Form */}
      {transactionForm.type && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Détails de la Transaction</h2>
                <p className="text-gray-500 dark:text-gray-400">Remplissez les informations de la transaction</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              {/* Amount */}
              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Montant (FCFA)
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0"
                    className="rounded-2xl border-2 focus:border-blue-500 focus:ring-blue-500/20 text-lg font-semibold pl-12"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Recipient Phone */}
              <div>
                <Label htmlFor="recipient_phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Numéro de Téléphone du Destinataire
                </Label>
                <div className="relative">
                  <Input
                    id="recipient_phone"
                    type="tel"
                    value={transactionForm.recipient_phone}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, recipient_phone: e.target.value }))}
                    placeholder="+225 0700000000"
                    className="rounded-2xl border-2 focus:border-blue-500 focus:ring-blue-500/20 pl-12"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Network Selection */}
              <div>
                <Label htmlFor="network" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Réseau de Paiement
                </Label>
                {networksLoading ? (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <RefreshCw className="h-5 w-5 animate-spin text-orange-500" />
                    <span className="text-gray-600 dark:text-gray-400">Chargement des réseaux...</span>
                  </div>
                ) : networksError ? (
                  <ErrorDisplay error={networksError} variant="inline" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {networks.map((network) => (
                      <div
                        key={network.uid}
                        className={`relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          transactionForm.network?.uid === network.uid
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                        onClick={() => handleNetworkSelect(network)}
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                              <Network className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            {transactionForm.network?.uid === network.uid && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{network.nom}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{network.country_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Button */}
              <div className="pt-6">
                <Button
                  onClick={handleCreateClick}
                  disabled={!isFormValid()}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl py-6 text-lg font-semibold"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Créer la Transaction
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirmer la Transaction</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Vérifiez les détails de votre transaction avant de la créer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Détails de la Transaction</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <Badge variant={transactionForm.type === "deposit" ? "default" : "secondary"}>
                    {transactionForm.type === "deposit" ? "Dépôt" : "Retrait"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Montant:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{transactionForm.amount} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Destinataire:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{transactionForm.recipient_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Réseau:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{transactionForm.network?.nom}</span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{submitError}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setConfirmModalOpen(false)}
              className="rounded-2xl"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmTransaction}
              disabled={submitting}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}