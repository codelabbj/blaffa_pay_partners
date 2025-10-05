"use client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useBettingCommissions } from "@/lib/api/betting"
import { BettingCommissionStats, UnpaidCommissionsResponse, CommissionRates, CommissionPaymentHistoryResponse } from "@/lib/types/betting"
import { RefreshCw, DollarSign, TrendingUp, TrendingDown, Activity, CreditCard, Calendar, User, AlertCircle, CheckCircle, Clock, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function BettingCommissionsPage() {
  const { t } = useLanguage()
  const { getCommissionStats, getUnpaidCommissions, getCommissionRates, getPaymentHistory } = useBettingCommissions()
  const { toast } = useToast()

  // State
  const [commissionStats, setCommissionStats] = useState<BettingCommissionStats | null>(null)
  const [unpaidCommissions, setUnpaidCommissions] = useState<UnpaidCommissionsResponse | null>(null)
  const [commissionRates, setCommissionRates] = useState<CommissionRates | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<CommissionPaymentHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Filters
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const fetchData = async () => {
    setLoading(true)
    setError("")
    try {
      const [stats, unpaid, rates, history] = await Promise.all([
        getCommissionStats({ date_from: dateFrom, date_to: dateTo }),
        getUnpaidCommissions(),
        getCommissionRates(),
        getPaymentHistory()
      ])
      
      setCommissionStats(stats)
      setUnpaidCommissions(unpaid)
      setCommissionRates(rates)
      setPaymentHistory(history)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur de chargement", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateFrom, dateTo])

  const formatAmount = (amount: string | number) => {
    return parseFloat(amount.toString()).toLocaleString()
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      success: { label: "Succès", color: "#28a745" },
      pending: { label: "En attente", color: "#ffc107" },
      failed: { label: "Échec", color: "#dc3545" },
      cancelled: { label: "Annulé", color: "#6c757d" },
    }
    
    const info = statusMap[status] || { label: status, color: "#adb5bd" }
    return (
      <span
        style={{
          backgroundColor: info.color,
          color: "#fff",
          borderRadius: "0.375rem",
          padding: "0.25em 0.75em",
          fontWeight: 500,
          fontSize: "0.875rem",
          display: "inline-block",
        }}
      >
        {info.label}
      </span>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-4 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">Commissions de Paris</h1>
              <p className="text-orange-100 text-sm md:text-lg">Gérez vos commissions et paiements</p>
            </div>
            <div className="flex md:hidden items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-full">
                <div className="text-lg font-bold text-center">
                  {commissionStats ? formatAmount(commissionStats.total_commission) : "0"} FCFA
                </div>
                <div className="text-orange-100 text-xs text-center">Total commissions</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-bold">
                  {commissionStats ? formatAmount(commissionStats.total_commission) : "0"} FCFA
                </div>
                <div className="text-orange-100 text-sm">Total commissions</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-bold">
                  {commissionStats ? formatAmount(commissionStats.unpaid_commission) : "0"} FCFA
                </div>
                <div className="text-orange-100 text-sm">Non payées</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
        <div className="p-4 md:p-8">
          <div className="flex items-center gap-2 md:gap-3 mb-6">
            <div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Filtres</h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Filtrez par période</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateFrom" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Date de début
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 text-sm md:text-base"
              />
            </div>
            <div>
              <Label htmlFor="dateTo" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Date de fin
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 text-sm md:text-base"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateFrom("")
                setDateTo("")
              }}
              className="rounded-xl border-2 h-10 text-sm px-4"
            >
              Effacer les filtres
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="rounded-xl border-2 h-10 text-sm px-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Commission Statistics */}
      {commissionStats && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Total Transactions</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{commissionStats.total_transactions}</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Transactions avec commission</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl md:rounded-2xl">
                <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Total Commissions</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{formatAmount(commissionStats.total_commission)} FCFA</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Toutes commissions</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl md:rounded-2xl">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Commissions Payées</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{formatAmount(commissionStats.paid_commission)} FCFA</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Déjà payées</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Commissions Non Payées</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{formatAmount(commissionStats.unpaid_commission)} FCFA</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">En attente de paiement</p>
          </div>
        </div>
      )}

      {/* Commission Rates */}
      {commissionRates && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Taux de Commission Actuels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Taux de Dépôt</span>
                </div>
                <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {commissionRates.deposit_rate}%
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Taux de Retrait</span>
                </div>
                <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {commissionRates.withdrawal_rate}%
                </div>
              </div>
            </div>
            {commissionRates.message && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">{commissionRates.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Commission by Platform */}
      {commissionStats && commissionStats.by_platform.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Commissions par Plateforme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Plateforme</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Transactions</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Total Commission</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Non Payée</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionStats.by_platform.map((platform, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="font-medium text-gray-900 dark:text-white">{platform.platform__name}</span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{platform.count}</span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {formatAmount(platform.total_commission)} FCFA
                        </span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          {formatAmount(platform.unpaid_commission)} FCFA
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unpaid Commissions */}
      {unpaidCommissions && unpaidCommissions.transactions.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Commissions Non Payées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Résumé</span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Total: {formatAmount(unpaidCommissions.total_unpaid_amount)} FCFA sur {unpaidCommissions.transaction_count} transaction{unpaidCommissions.transaction_count > 1 ? 's' : ''}
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Référence</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Plateforme</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Type</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Montant</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Commission</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidCommissions.transactions.map((transaction) => (
                    <TableRow key={transaction.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="font-mono text-xs md:text-sm">{transaction.reference}</span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.platform_name}</span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <Badge className={cn(
                          "text-xs",
                          transaction.transaction_type === 'deposit' 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        )}>
                          {transaction.transaction_type === 'deposit' ? 'Dépôt' : 'Retrait'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatAmount(transaction.amount)} FCFA
                        </span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          {formatAmount(transaction.commission_amount)} FCFA
                        </span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.created_at)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {paymentHistory && paymentHistory.payments.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              Historique des Paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Résumé</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Total payé: {formatAmount(paymentHistory.total_paid_amount)} FCFA sur {paymentHistory.payment_count} paiement{paymentHistory.payment_count > 1 ? 's' : ''}
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Référence</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Montant</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Transactions</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Payé par</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Période</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.payments.map((payment) => (
                    <TableRow key={payment.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="font-mono text-xs md:text-sm">{payment.uid.slice(0, 8)}...</span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {formatAmount(payment.total_amount)} FCFA
                        </span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{payment.transaction_count}</span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{payment.paid_by_name}</span>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <div>{formatDate(payment.period_start)}</div>
                          <div>à {formatDate(payment.period_end)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(payment.created_at)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Chargement...</p>
        </div>
      )}

      {error && (
        <ErrorDisplay error={error} variant="full" />
      )}
    </div>
  )
}
