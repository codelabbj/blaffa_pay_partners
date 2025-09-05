"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CreditCard, DollarSign, TrendingUp, TrendingDown, Wallet, RefreshCw, Activity } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { StatCard } from "@/components/ui/stat-card"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

const chartConfig = {
  deposits: { color: "#16a34a", label: "Dépôts" },
  withdrawals: { color: "#dc2626", label: "Retraits" },
  approved: { color: "#2563eb", label: "Approuvé" },
  rejected: { color: "#dc2626", label: "Rejeté" },
  pending: { color: "#f59e0b", label: "En attente" },
}

const NETWORK_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6"]

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="bg-white dark:bg-gray-900 p-2 rounded shadow text-xs border">
      <div className="font-semibold">{label}</div>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} style={{ color: entry.color || entry.fill }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [rechargeStats, setRechargeStats] = useState<any>(null)
  
  // Account data state (from UserPaymentPage)
  const [accountData, setAccountData] = useState<any>(null)
  const [accountLoading, setAccountLoading] = useState(true)
  const [accountError, setAccountError] = useState("")

  // Fetch account data (from UserPaymentPage)
  const fetchAccountData = async () => {
    setAccountLoading(true)
    setAccountError("")
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/account/`
      const data = await apiFetch(endpoint)
      setAccountData(data)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setAccountError(errorMessage)
      toast({ title: t("payment.failedToLoadAccount"), description: errorMessage, variant: "destructive" })
    } finally {
      setAccountLoading(false)
    }
  }

  const refreshAccountData = async () => {
    setAccountLoading(true)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/account/`
      const data = await apiFetch(endpoint)
      setAccountData(data)
      toast({ title: t("payment.accountRefreshed"), description: t("payment.accountDataUpdated") })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      toast({ title: t("payment.refreshFailed"), description: errorMessage, variant: "destructive" })
    } finally {
      setAccountLoading(false)
    }
  }

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      setError("")
      try {
        const [dashboard, userStatsRes, rechargeStatsRes] = await Promise.all([
          apiFetch(`${baseUrl}api/payments/user/dashboard/`),
          apiFetch(`${baseUrl}api/payments/user/stats/`),
          apiFetch(`${baseUrl}api/payments/recharge-requests/stats/`),
        ])
        setStats(dashboard)
        setUserStats(userStatsRes)
        setRechargeStats(rechargeStatsRes)
      } catch (err: any) {
        setError("Impossible de charger les données du tableau de bord.")
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    fetchAccountData() // Fetch account data
  }, [apiFetch, baseUrl])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorDisplay error={error} variant="full" />
      </div>
    )
  }

  // Prepare stat values from real API data
  const totalUsers = stats?.account?.user_name ? 1 : 0
  const totalTransactions = userStats?.total_transactions ?? 0
  const totalApprovedRecharges = rechargeStats?.total_approved_amount ?? 0
  const totalRecharged = parseFloat(stats?.account?.total_recharged ?? "0")

  // Create charts data from API responses
  
  // Transaction comparison chart data
  const transactionComparisonData = [
    {
      name: "Dépôts",
      count: userStats?.deposits?.count ?? 0,
      amount: userStats?.deposits?.total_amount ?? 0,
      completed: userStats?.deposits?.completed_count ?? 0,
    },
    {
      name: "Retraits", 
      count: userStats?.withdrawals?.count ?? 0,
      amount: userStats?.withdrawals?.total_amount ?? 0,
      completed: userStats?.withdrawals?.completed_count ?? 0,
    }
  ]

  // Transaction status distribution for pie chart
  const transactionStatusData = userStats?.by_status ? Object.entries(userStats.by_status).map(([key, value]: [string, any]) => ({
    name: value.name,
    value: value.count,
    key: key
  })).filter((item: any) => item.value > 0) : []

  // Recharge status distribution for pie chart
  const rechargeStatusData = rechargeStats?.by_status ? Object.entries(rechargeStats.by_status).map(([key, value]: [string, any]) => ({
    name: value.name,
    value: value.count,
    key: key
  })).filter((item: any) => item.value > 0) : []

  // Network distribution data
  const networkData = userStats?.by_network ? Object.entries(userStats.by_network).map(([network, data]: [string, any], index) => ({
    name: network,
    count: data.count,
    amount: data.amount,
    color: NETWORK_COLORS[index % NETWORK_COLORS.length]
  })) : []

  // Recent activity from recent_transactions with ALL transaction details
  type RecentTransaction = {
    uid: string;
    type: string;
    type_display: string;
    amount: string;
    formatted_amount: string;
    recipient_phone: string;
    recipient_name?: string;
    display_recipient_name?: string;
    network?: { 
      uid: string;
      nom: string; 
      code: string;
      country_name: string;
      country_code: string;
    };
    objet: string;
    status: string;
    status_display: string;
    reference: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    processing_duration?: string;
    retry_count: number;
    max_retries: number;
    can_retry: boolean;
    error_message?: string;
    priority: number;
    fees?: string;
    balance_before?: string;
    balance_after?: string;
  };

  const recentActivity = stats?.recent_transactions?.slice(0, 6).map((txn: RecentTransaction) => ({
    ...txn,
    action:
      txn.type === "deposit"
        ? "Dépôt effectué"
        : txn.type === "withdrawal"
        ? "Retrait effectué"
        : "Transaction",
    user: stats.account.user_name,
    time: new Date(txn.created_at).toLocaleString("fr-FR", { 
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit", 
      minute: "2-digit" 
    }),
    networkInfo: txn.network,
  })) ?? []

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">{t("dashboard") || "Dashboard"}</h1>
              <p className="text-blue-100 text-sm md:text-lg">Vue d'ensemble de votre plateforme</p>
            </div>
            <div className="flex md:hidden items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-full">
                <div className="text-lg font-bold text-center">{stats?.account?.formatted_balance || "0 FCFA"}</div>
                <div className="text-blue-100 text-xs text-center">Solde actuel</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-bold">{stats?.account?.formatted_balance || "0 FCFA"}</div>
                <div className="text-blue-100 text-sm">Solde actuel</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Account Overview Section */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
        <div className="p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl md:rounded-2xl">
                <Wallet className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{t("payment.accountOverview") || "Account Overview"}</h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Informations détaillées de votre compte</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAccountData} 
              disabled={accountLoading}
              className="rounded-xl md:rounded-2xl border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${accountLoading ? 'animate-spin' : ''}`} />
              {t("common.refresh") || "Refresh"}
            </Button>
          </div>
          
          {accountLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
            </div>
          ) : accountError ? (
            <ErrorDisplay
              error={accountError}
              onRetry={refreshAccountData}
              variant="full"
              showDismiss={false}
            />
          ) : accountData ? (
            <div className="space-y-6 md:space-y-8">
              {/* Main Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <Wallet className="h-6 w-6 md:h-8 md:w-8 text-blue-100" />
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-blue-100 text-xs md:text-sm font-medium mb-2">{t("payment.currentBalance") || "Current Balance"}</p>
                    <p className="text-xl md:text-3xl font-bold">{accountData.formatted_balance}</p>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-100" />
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <p className="text-green-100 text-xs md:text-sm font-medium mb-2">{t("payment.totalRecharged") || "Total Recharged"}</p>
                    <p className="text-xl md:text-3xl font-bold">{accountData.total_recharged} FCFA</p>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <TrendingDown className="h-6 w-6 md:h-8 md:w-8 text-purple-100" />
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-400 rounded-full"></div>
                    </div>
                    <p className="text-purple-100 text-xs md:text-sm font-medium mb-2">{t("payment.totalDeposited") || "Total Deposited"}</p>
                    <p className="text-xl md:text-3xl font-bold">{accountData.total_deposited} FCFA</p>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <TrendingDown className="h-6 w-6 md:h-8 md:w-8 text-orange-100" />
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-400 rounded-full"></div>
                    </div>
                    <p className="text-orange-100 text-xs md:text-sm font-medium mb-2">{t("payment.totalWithdrawn") || "Total Withdrawn"}</p>
                    <p className="text-xl md:text-3xl font-bold">{accountData.total_withdrawn} FCFA</p>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t("payment.accountStatus") || "Account Status"}</p>
                      <Badge variant={accountData.is_active ? "default" : "destructive"} className="text-xs md:text-sm">
                        {accountData.is_active ? (t("payment.active") || "Active") : (t("payment.inactive") || "Inactive")}
                      </Badge>
                    </div>
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${accountData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t("payment.accountFrozen") || "Account Frozen"}</p>
                      <Badge variant={accountData.is_frozen ? "destructive" : "default"} className="text-xs md:text-sm">
                        {accountData.is_frozen ? (t("common.yes") || "Yes") : (t("common.no") || "No")}
                      </Badge>
                    </div>
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${accountData.is_frozen ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t("payment.utilizationRate") || "Utilization Rate"}</p>
                      <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{(accountData.utilization_rate * 100).toFixed(1)}%</p>
                    </div>
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl md:rounded-2xl flex items-center justify-center">
                      <div className="w-4 h-4 md:w-6 md:h-6 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl md:rounded-2xl">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Total Utilisateurs</h3>
          </div>
          <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{totalUsers.toLocaleString()}</div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Utilisateurs actifs</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl md:rounded-2xl">
              <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Total Transactions</h3>
          </div>
          <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{totalTransactions.toLocaleString()}</div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{userStats?.period_days ? `${userStats.period_days} derniers jours` : "30 derniers jours"}</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl md:rounded-2xl">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Demandes Recharge</h3>
          </div>
          <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{rechargeStats?.total_requests?.toLocaleString() ?? "0"}</div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {rechargeStats?.month_stats?.approval_rate ? `${rechargeStats.month_stats.approval_rate.toFixed(2)}% approuvé` : "Aucune donnée"}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Total Rechargé</h3>
          </div>
          <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{totalRecharged.toLocaleString()} FCFA</div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Solde: {stats?.account?.formatted_balance}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
        <div className="p-4 md:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl md:rounded-2xl">
              <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Analyses et Graphiques</h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Visualisation des données et tendances</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Transaction Types with Completed Status */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
              <div className="mb-4 md:mb-6">
                <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Transactions par Type</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Dépôts vs Retraits avec statuts ({userStats?.period_days || 30} derniers jours)</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={transactionComparisonData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="count" 
                    fill={chartConfig.deposits.color} 
                    name="Total transactions" 
                  />
                  <Bar 
                    dataKey="completed" 
                    fill={chartConfig.approved.color} 
                    name="Transactions terminées" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Transaction Status Distribution */}
            {transactionStatusData.length > 0 && (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Statut des Transactions</h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Distribution par statut des transactions</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={transactionStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {transactionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.key === 'completed' || entry.key === 'success' ? chartConfig.approved.color :
                          entry.key === 'failed' || entry.key === 'cancelled' ? chartConfig.rejected.color :
                          entry.key === 'pending' ? chartConfig.pending.color :
                          NETWORK_COLORS[index % NETWORK_COLORS.length]
                        } />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Network Distribution */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
              <div className="mb-4 md:mb-6">
                <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Répartition par Réseau</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Distribution des transactions par réseau</p>
              </div>
              {networkData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={networkData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {networkData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
                  Aucune donnée réseau disponible
                </div>
              )}
            </div>

            {/* Recharge Status Distribution */}
            {rechargeStatusData.length > 0 && (
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Statut des Recharges</h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Distribution par statut des demandes</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={rechargeStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {rechargeStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.key === 'approved' ? chartConfig.approved.color :
                          entry.key === 'rejected' ? chartConfig.rejected.color :
                          chartConfig.pending.color
                        } />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Transaction Amounts */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
              <div className="mb-4 md:mb-6">
                <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Montants des Transactions</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Volumes financiers par type</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={transactionComparisonData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={chartConfig.deposits.color}
                    strokeWidth={2}
                    dot={{ fill: chartConfig.deposits.color }}
                    name="Montant (FCFA)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
        <div className="p-4 md:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl md:rounded-2xl">
              <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Activité récente</h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Dernières transactions sur la plateforme</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="space-y-3 md:space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <Activity className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Aucune activité récente</p>
              </div>
            ) : (
              recentActivity.map((activity: {
                action: string;
                user: string;
                time: string;
                type: string;
                amount: string;
                status_display: string;
                network?: string;
              }, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 md:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                        activity.type === "deposit"
                          ? "bg-green-500"
                          : activity.type === "withdrawal"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium leading-none text-gray-900 dark:text-white truncate">
                        {activity.action} {activity.amount}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{activity.user}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{activity.time}</div>
                    <div className={`text-xs px-2 md:px-3 py-1 rounded-full font-medium ${
                      activity.status_display === "En attente" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" :
                      activity.status_display === "Terminée" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" :
                      activity.status_display === "Succès" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" :
                      activity.status_display === "Annulée" ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" :
                      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {activity.status_display}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics - Redesigned */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg md:rounded-xl">
              <Wallet className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Solde du Compte</h3>
          </div>
          <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats?.account?.formatted_balance}</div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">
            Solde actuel | Limite quotidienne dépôt: {parseFloat(stats?.account?.daily_deposit_limit ?? "0").toLocaleString()} FCFA
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Limite retrait: {parseFloat(stats?.account?.daily_withdrawal_limit ?? "0").toLocaleString()} FCFA
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg md:rounded-xl">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Statistiques Mensuelles</h3>
          </div>
          <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{(rechargeStats?.month_stats?.approval_rate ?? 0).toFixed(2)}%</div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">
            Taux d'approbation des recharges
          </p>
          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            <div>Total demandes: {rechargeStats?.month_stats?.total_requests ?? 0}</div>
            <div>Approuvées: {rechargeStats?.month_stats?.approved_count ?? 0}</div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg md:rounded-xl">
              <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Flux Financiers</h3>
          </div>
          <div className={`text-xl md:text-3xl font-bold mb-2 ${stats?.account?.net_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats?.account?.net_flow ?? 0} FCFA
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">
            Flux net (dépôts - retraits)
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div>Total déposé: {parseFloat(stats?.account?.total_deposited ?? "0").toLocaleString()} FCFA</div>
            <div>Total retiré: {parseFloat(stats?.account?.total_withdrawn ?? "0").toLocaleString()} FCFA</div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg md:rounded-xl">
              <Activity className="h-4 w-4 md:h-5 md:w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Statut du Compte</h3>
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className={`inline-flex px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
              stats?.account?.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {stats?.account?.is_active ? 'Actif' : 'Inactif'}
            </div>
            <div className={`inline-flex px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
              !stats?.account?.is_frozen ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {stats?.account?.is_frozen ? 'Gelé' : 'Normal'}
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2 md:mt-3">
            Taux d'utilisation: {stats?.account?.utilization_rate ?? 0}%
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Dernière transaction: {stats?.account?.last_transaction_at ? 
              new Date(stats.account.last_transaction_at).toLocaleDateString('fr-FR') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Additional Statistics from Month Stats */}
      {stats?.month_stats && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-white/30 dark:border-gray-700/50">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Statistiques Détaillées du Mois</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Analyse complète des transactions mensuelles</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20 backdrop-blur-sm p-6 rounded-3xl border border-green-200/50 dark:border-green-700/50 shadow-lg">
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Dépôts</h4>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.month_stats.deposits_count}</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  Montant: {stats.month_stats.deposits_amount.toLocaleString()} FCFA
                </p>
              </div>
              <div className="bg-gradient-to-r from-red-50/80 to-red-100/80 dark:from-red-900/20 dark:to-red-800/20 backdrop-blur-sm p-6 rounded-3xl border border-red-200/50 dark:border-red-700/50 shadow-lg">
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Retraits</h4>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.month_stats.withdrawals_count}</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  Montant: {stats.month_stats.withdrawals_amount.toLocaleString()} FCFA
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20 backdrop-blur-sm p-6 rounded-3xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Total</h4>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.month_stats.total_transactions}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  Transactions ce mois
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recharge Statistics Details */}
      {rechargeStats && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-white/30 dark:border-gray-700/50">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Détails des Demandes de Recharge</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Vue d'ensemble complète des recharges</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20 backdrop-blur-sm rounded-3xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">Total Demandes</h4>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{rechargeStats.total_requests}</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-yellow-50/80 to-yellow-100/80 dark:from-yellow-900/20 dark:to-yellow-800/20 backdrop-blur-sm rounded-3xl border border-yellow-200/50 dark:border-yellow-700/50 shadow-lg">
                <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-3">En Révision</h4>
                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{rechargeStats.pending_review}</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20 backdrop-blur-sm rounded-3xl border border-green-200/50 dark:border-green-700/50 shadow-lg">
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">Montant Approuvé</h4>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {rechargeStats.total_approved_amount.toLocaleString()} FCFA
                </p>
              </div>
            </div>
            
            {/* Detailed Status Breakdown */}
            <div className="mt-8">
              <h5 className="font-semibold mb-4 text-gray-900 dark:text-white">Répartition détaillée par statut:</h5>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(rechargeStats.by_status).map(([key, status]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/50">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{status.name}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}