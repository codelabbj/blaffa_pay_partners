"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Pencil, Trash, Clock, RefreshCw, Plus, Wallet, TrendingUp, TrendingDown, Copy, Activity, CreditCard } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useWebSocket } from "@/components/providers/websocket-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function UserTransactionsPage() {
  // Account data state
  const [accountData, setAccountData] = useState<any>(null)
  const [accountLoading, setAccountLoading] = useState(true)
  const [accountError, setAccountError] = useState("")

  // Transactions list state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"amount" | "date" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Networks state
  const [networks, setNetworks] = useState<any[]>([])
  const [networksLoading, setNetworksLoading] = useState(false)
  
  // Transaction creation state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")
  const [transactionForm, setTransactionForm] = useState({
    type: "deposit" as "deposit" | "withdraw",
    amount: "",
    recipient_phone: "",
    network: "",
    objet: ""
  })

  const { t } = useLanguage()
  const itemsPerPage = 10
  const apiFetch = useApi()
  const { toast } = useToast()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  // Fetch account data
  useEffect(() => {
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
    fetchAccountData()
  }, [baseUrl, apiFetch, t, toast])

  // Fetch networks when create modal opens
  useEffect(() => {
    const fetchNetworks = async () => {
      if (!createModalOpen) return
      setNetworksLoading(true)
      try {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/networks/`
        const data = await apiFetch(endpoint)
        setNetworks(data.results || [])
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        toast({ title: t("payment.failedToLoadNetworks"), description: errorMessage, variant: "destructive" })
      } finally {
        setNetworksLoading(false)
      }
    }
    fetchNetworks()
  }, [createModalOpen, baseUrl, apiFetch, t, toast])

  // Fetch user transactions from API
  const fetchTransactions = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: itemsPerPage.toString(),
      });

      // Add search parameter
      if (searchTerm.trim() !== "") {
        params.append("search", searchTerm);
      }

      // Add status filter
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      // Add type filter  
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      // Add sorting
      if (sortField) {
        const orderBy = sortField === "date" ? "created_at" : "amount";
        const prefix = sortDirection === "desc" ? "-" : "";
        params.append("ordering", `${prefix}${orderBy}`);
      }

      const endpoint = `${baseUrl}api/payments/user/transactions/?${params.toString()}`;
      const data = await apiFetch(endpoint)
      
      setTransactions(data.results || [])
      setTotalCount(data.count || 0)
      
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("transactions.failedToLoad") || "Failed to load transactions"
      setError(errorMessage)
      setTransactions([])
      setTotalCount(0)
      toast({
        title: t("transactions.failedToLoad") || "Failed to load",
        description: errorMessage,
        variant: "destructive",
      })
      console.error('Transactions fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTransactions()
    setRefreshing(false)
  }

  // Refresh account data
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

  // Handle transaction creation
  const handleCreateTransaction = async () => {
    setCreateLoading(true)
    setCreateError("")
    try {
      const payload = {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        recipient_phone: transactionForm.recipient_phone,
        network: transactionForm.network,
        objet: transactionForm.objet
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
        title: t("payment.success"), 
        description: t(`payment.${transactionForm.type}CreatedSuccessfully`) || `${transactionForm.type} created successfully!`
      })
      setCreateModalOpen(false)
      setTransactionForm({
        type: "deposit",
        amount: "",
        recipient_phone: "",
        network: "",
        objet: ""
      })
      // Refresh data
      setCurrentPage(1)
      await fetchTransactions()
      await refreshAccountData()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setCreateError(errorMessage)
      toast({ title: t("payment.createFailed"), description: errorMessage, variant: "destructive" })
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, searchTerm, statusFilter, typeFilter, sortField, sortDirection])

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage

  const handleSort = (field: "amount" | "date") => {
    setCurrentPage(1)
    setSortDirection((prevDir) => (sortField === field ? (prevDir === "desc" ? "asc" : "desc") : "desc"))
    setSortField(field)
  }

  // Enhanced status map with more statuses from the API response
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "#ffc107" },
    sent_to_user: { label: "Envoyé à l'utilisateur", color: "#17a2b8" },
    processing: { label: "En cours", color: "#fd7e14" },
    completed: { label: "Terminé", color: "#28a745" },
    success: { label: "Succès", color: "#20c997" },
    failed: { label: "Échec", color: "#dc3545" },
    cancelled: { label: "Annulé", color: "#6c757d" },
    timeout: { label: "Expiré", color: "#6f42c1" },
  };

  const getStatusBadge = (status: string) => {
    const info = statusMap[status] || { label: status, color: "#adb5bd" };
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
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      deposit: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      withdrawal: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      transfer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    }
    return <Badge className={colors[type] || ""}>{t(`transactions.${type}`) || type}</Badge>
  }

  // Format processing duration
  const formatProcessingDuration = (duration: string | null) => {
    if (!duration) return "-"
    return duration
  }

  // Listen for transaction updates via WebSocket
  const { lastMessage } = useWebSocket();
  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = typeof lastMessage.data === "string" ? JSON.parse(lastMessage.data) : lastMessage.data;

      // Handle new transaction creation
      if (data.type === "new_transaction" && data.event === "transaction_created" && data.transaction_data) {
        const newTx = data.transaction_data;
        if (currentPage === 1) {
          setTransactions(prev => [newTx, ...prev].slice(0, itemsPerPage));
        }
        setTotalCount(prev => prev + 1);
        toast({
          title: t("transactions.created") || "Transaction created",
          description: data.message || `Transaction ${newTx.reference} created successfully`,
        });
        return;
      }

      // Handle live transaction updates
      if (data.type === "transaction_update" && data.transaction_uid) {
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.uid === data.transaction_uid
              ? { ...tx, status: data.status, ...data.data }
              : tx
          )
        );
        toast({
          title: t("transactions.liveUpdate") || "Live update",
          description: `Transaction ${data.transaction_uid} status updated: ${data.status}`,
        });
        return;
      }
    } catch (err) {
      // Handle parse errors silently
    }
  }, [lastMessage, t, toast, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">{t("transactions.title") || "My Transactions"}</h1>
              <p className="text-blue-100 text-sm md:text-lg">{t("transactions.subtitle") || "Manage your transactions"}</p>
            </div>
            <div className="flex md:hidden items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-full">
                <div className="text-lg font-bold text-center">{accountData?.formatted_balance || "0 FCFA"}</div>
                <div className="text-blue-100 text-xs text-center">{t("payment.currentBalance") || "Current Balance"}</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-bold">{accountData?.formatted_balance || "0 FCFA"}</div>
                <div className="text-blue-100 text-sm">{t("payment.currentBalance") || "Current Balance"}</div>
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
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl md:rounded-2xl">
                <Wallet className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{t("payment.accountOverview") || "Account Overview"}</h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t("payment.accountDetails") || "Detailed account information"}</p>
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
            <div className="p-8 md:p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
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

      {/* Transactions Section */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
        <div className="p-4 md:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl md:rounded-2xl">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{t("transactions.transactionHistory") || "Transaction History"}</h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t("transactions.manageTransactions") || "Manage and track your transactions"}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
                className="rounded-xl md:rounded-2xl border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {t("common.refresh") || "Refresh"}
              </Button>
            
              <Button 
                onClick={() => router.push('/dashboard/transactions/create')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl md:rounded-2xl w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("payment.newTransaction") || "New Transaction"}
              </Button>
            </div> 
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("common.searchPlaceholder") || "Search by reference, phone, or amount..."}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 text-sm md:text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
                  <SelectValue placeholder={t("transactions.allStatuses") || "All Statuses"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("transactions.allStatuses") || "All Statuses"}</SelectItem>
                  <SelectItem value="pending">{t("transactions.pending") || "Pending"}</SelectItem>
                  <SelectItem value="sent_to_user">{t("transactions.sentToUser") || "Sent to User"}</SelectItem>
                  <SelectItem value="completed">{t("transactions.completed") || "Completed"}</SelectItem>
                  <SelectItem value="success">{t("transactions.success") || "Success"}</SelectItem>
                  <SelectItem value="failed">{t("transactions.failed") || "Failed"}</SelectItem>
                  <SelectItem value="cancelled">{t("transactions.cancelled") || "Cancelled"}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
                  <SelectValue placeholder={t("transactions.allTypes") || "All Types"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("transactions.allTypes") || "All Types"}</SelectItem>
                  <SelectItem value="deposit">{t("transactions.deposit") || "Deposit"}</SelectItem>
                  <SelectItem value="withdrawal">{t("transactions.withdrawal") || "Withdrawal"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Inline error display */}
          {error && (
            <div className="mb-4">
              <ErrorDisplay
                error={error}
                onRetry={fetchTransactions}
                variant="full"
                showDismiss={false}
              />
            </div>
          )}

          {/* Transactions Table */}
          {loading ? (
            <div className="text-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t("common.loading") || "Loading..."}</p>
            </div>
          ) : error ? (
            <ErrorDisplay error={error} variant="full" />
          ) : (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">{t("transactions.reference") || "Reference"}</TableHead>
                      <TableHead className="font-semibold cursor-pointer text-xs md:text-sm py-3 md:py-4 px-3 md:px-6" onClick={() => handleSort("amount")}>
                        <div className="flex items-center gap-1 md:gap-2">
                          {t("transactions.amount") || "Amount"}
                          <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6 hidden md:table-cell">{t("transactions.recipientInfo") || "Recipient"}</TableHead>
                      <TableHead className="font-semibold cursor-pointer text-xs md:text-sm py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell" onClick={() => handleSort("date")}>
                        <div className="flex items-center gap-1 md:gap-2">
                          {t("transactions.date") || "Date"}
                          <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">{t("transactions.type") || "Type"}</TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell">{t("transactions.network") || "Network"}</TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">{t("transactions.status") || "Status"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 md:py-8">
                          <div className="text-center">
                            <CreditCard className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t("transactions.noTransactionsFound") || "No transactions found"}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="py-3 md:py-4 px-3 md:px-6">
                            <div className="flex items-center gap-1 md:gap-2">
                              <span className="font-mono text-xs md:text-sm">{transaction.reference || transaction.uid.slice(0, 8)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(transaction.reference || transaction.uid)
                                  toast({ title: t("payment.referenceCopied") || "Reference copied!" })
                                }}
                                className="h-5 w-5 md:h-6 md:w-6 p-0"
                              >
                                <Copy className="h-2 w-2 md:h-3 md:w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold py-3 md:py-4 px-3 md:px-6">
                            <div className="flex flex-col">
                              <span className="text-sm md:text-base">{transaction.formatted_amount || `${parseFloat(transaction.amount).toLocaleString()} FCFA`}</span>
                              {transaction.fees && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Fees: {transaction.fees} FCFA
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 md:py-4 px-3 md:px-6 hidden md:table-cell">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {transaction.display_recipient_name || transaction.recipient_name || "-"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {transaction.recipient_phone || "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs md:text-sm text-gray-500 dark:text-gray-400 py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell">
                            <div className="flex flex-col">
                              <span>{transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : "-"}</span>
                              <span className="text-xs">
                                {transaction.created_at ? new Date(transaction.created_at).toLocaleTimeString() : ""}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 md:py-4 px-3 md:px-6">
                            <Badge variant={transaction.type === "deposit" ? "default" : "secondary"} className="text-xs">
                              {transaction.type === "deposit" ? (t("transactions.deposit") || "Deposit") : (t("transactions.withdrawal") || "Withdrawal")}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{transaction.network?.nom || "-"}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {transaction.network?.country_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 md:py-4 px-3 md:px-6">{getStatusBadge(transaction.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 mt-4 md:mt-6">
              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {t("transactions.showingResults") || "Showing"} {startIndex + 1} {t("common.to") || "to"} {Math.min(startIndex + itemsPerPage, totalCount)} {t("common.of") || "of"} {totalCount} {t("transactions.transactions") || "transactions"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="rounded-lg md:rounded-xl text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                >
                  <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="hidden sm:inline">{t("common.previous") || "Previous"}</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                <span className="text-xs md:text-sm font-medium px-2 md:px-3 py-1 md:py-2">
                  {t("transactions.pageOf") || "Page"} {currentPage} {t("common.of") || "of"} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="rounded-lg md:rounded-xl text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                >
                  <span className="hidden sm:inline">{t("common.next") || "Next"}</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Transaction Modal */}
      <Dialog open={createModalOpen} onOpenChange={(open) => { 
        if (!open) {
          setCreateModalOpen(false)
          setCreateError("")
          setTransactionForm({
            type: "deposit",
            amount: "",
            recipient_phone: "",
            network: "",
            objet: ""
          })
        }
      }}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl md:rounded-3xl sm:max-w-[500px] mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-2xl font-bold">{t("payment.newTransaction") || "Create New Transaction"}</DialogTitle>
          </DialogHeader>
          
          {createError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl md:rounded-2xl p-3 md:p-4">
              <p className="text-red-600 dark:text-red-400 text-xs md:text-sm">{createError}</p>
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <Label htmlFor="type" className="text-xs md:text-sm">{t("payment.transactionType") || "Transaction Type"} *</Label>
                <Select 
                  value={transactionForm.type} 
                  onValueChange={(value: "deposit" | "withdraw") => setTransactionForm({...transactionForm, type: value})}
                >
                  <SelectTrigger className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">{t("payment.deposit") || "Deposit"}</SelectItem>
                    <SelectItem value="withdraw">{t("payment.withdraw") || "Withdraw"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount" className="text-xs md:text-sm">{t("payment.amount") || "Amount"} (FCFA) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                  className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12 text-sm md:text-base"
                  required
                  min="1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="recipient_phone" className="text-xs md:text-sm">{t("payment.recipientPhone") || "Recipient Phone"} *</Label>
              <Input
                id="recipient_phone"
                type="tel"
                placeholder="+225 0700000000"
                value={transactionForm.recipient_phone}
                onChange={(e) => setTransactionForm({...transactionForm, recipient_phone: e.target.value})}
                className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12 text-sm md:text-base"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="network" className="text-xs md:text-sm">{t("payment.network") || "Network"} *</Label>
              <Select 
                value={transactionForm.network} 
                onValueChange={(value) => setTransactionForm({...transactionForm, network: value})}
                disabled={networksLoading}
              >
                <SelectTrigger className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
                  <SelectValue placeholder={networksLoading ? t("common.loading") || "Loading..." : t("payment.selectNetwork") || "Select Network"} />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((network) => (
                    <SelectItem key={network.uid} value={network.uid} disabled={!network.is_active}>
                      {network.nom} ({network.country_name}) {!network.is_active && " - " + (t("common.inactive") || "Inactive")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="objet" className="text-xs md:text-sm">{t("payment.description") || "Description"}</Label>
              <Textarea
                id="objet"
                placeholder="Enter transaction description..."
                value={transactionForm.objet}
                onChange={(e) => setTransactionForm({...transactionForm, objet: e.target.value})}
                className="rounded-xl md:rounded-2xl border-2 text-sm md:text-base"
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 md:mt-6">
            <DialogClose asChild>
              <Button 
                variant="outline" 
                disabled={createLoading}
                className="rounded-xl md:rounded-2xl w-full sm:w-auto text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
              >
                {t("common.cancel") || "Cancel"}
              </Button>
            </DialogClose>
            <Button 
              onClick={handleCreateTransaction} 
              disabled={createLoading || !transactionForm.amount || !transactionForm.recipient_phone || !transactionForm.network}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl md:rounded-2xl w-full sm:w-auto text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
            >
              {createLoading ? (t("common.processing") || "Processing...") : (t("common.create") || "Create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
