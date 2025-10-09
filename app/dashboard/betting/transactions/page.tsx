"use client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useBettingTransactions, useBettingPlatforms } from "@/lib/api/betting"
import { BettingTransaction, BettingTransactionsResponse } from "@/lib/types/betting"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCw, Activity, CreditCard, Copy, Eye, Plus, Minus, Filter, Calendar, DollarSign, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function BettingTransactionsContent() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const { getTransactions, cancelTransaction } = useBettingTransactions()
  const { getPlatforms } = useBettingPlatforms()
  const { toast } = useToast()

  // State
  const [transactions, setTransactions] = useState<BettingTransaction[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [platforms, setPlatforms] = useState<any[]>([])

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "all")
  const [typeFilter, setTypeFilter] = useState(searchParams.get('transaction_type') || "all")
  const [platformFilter, setPlatformFilter] = useState(searchParams.get('platform') || "all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"amount" | "date" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Cancellation dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<BettingTransaction | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelling, setCancelling] = useState(false)

  // Transaction detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedDetailTransaction, setSelectedDetailTransaction] = useState<BettingTransaction | null>(null)

  const itemsPerPage = 10

  // Fetch platforms for filter
  const fetchPlatforms = async () => {
    try {
      const data = await getPlatforms()
      setPlatforms(data.results || [])
    } catch (err) {
      console.error('Failed to fetch platforms:', err)
    }
  }

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true)
    setError("")
    try {
      const params: any = {
        page: currentPage,
        ordering: sortField ? `${sortDirection === "desc" ? "-" : ""}${sortField === "date" ? "created_at" : "amount"}` : "-created_at"
      }

      if (statusFilter && statusFilter !== "all") params.status = statusFilter
      if (typeFilter && typeFilter !== "all") params.transaction_type = typeFilter
      if (platformFilter && platformFilter !== "all") params.platform = platformFilter
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const data: BettingTransactionsResponse = await getTransactions(params)
      setTransactions(data.results || [])
      setTotalCount(data.count || 0)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur de chargement", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchPlatforms()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, statusFilter, typeFilter, platformFilter, dateFrom, dateTo, sortField, sortDirection])

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage

  const handleSort = (field: "amount" | "date") => {
    setCurrentPage(1)
    setSortDirection((prevDir) => (sortField === field ? (prevDir === "desc" ? "asc" : "desc") : "desc"))
    setSortField(field)
  }

  const canCancelTransaction = (transaction: BettingTransaction): boolean => {
    // Check if transaction status allows cancellation
    if (transaction.status === 'cancelled' || transaction.status === 'failed') {
      return false
    }

    // Check if cancellation has already been requested
    if (transaction.cancellation_requested_at !== null) {
      return false
    }

    // Check if API explicitly disallows cancellation
    if (transaction.is_cancellable === false || transaction.can_request_cancellation === false) {
      return false
    }

    // Check if transaction is within 25 minutes of creation
    const createdAt = new Date(transaction.created_at)
    const now = new Date()
    const timeDiffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
    
    if (timeDiffInMinutes > 25) {
      return false
    }

    // Transaction is eligible for cancellation
    return true
  }

  const handleCancelTransaction = (transaction: BettingTransaction) => {
    setSelectedTransaction(transaction)
    setCancelReason("Client changed mind - explicit request")
    setCancelDialogOpen(true)
  }

  const handleViewTransactionDetails = (transaction: BettingTransaction) => {
    setSelectedDetailTransaction(transaction)
    setDetailDialogOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedTransaction || !cancelReason.trim()) {
      toast({ 
        title: "Erreur", 
        description: "Veuillez fournir une raison pour l'annulation", 
        variant: "destructive" 
      })
      return
    }

    setCancelling(true)
    try {
      await cancelTransaction(selectedTransaction.uid, cancelReason.trim())
      toast({ 
        title: "Cancellation Requested", 
        description: "Your cancellation request has been submitted successfully" 
      })
      setCancelDialogOpen(false)
      setSelectedTransaction(null)
      setCancelReason("")
      // Refresh transactions list
      fetchTransactions()
    } catch (err: any) {
      console.error('Cancellation error:', err)
      const errorMessage = extractErrorMessages(err)
      toast({ 
        title: "Cancellation Failed", 
        description: errorMessage || "Failed to cancel transaction. Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setCancelling(false)
    }
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "#ffc107" },
    processing: { label: "En cours", color: "#fd7e14" },
    success: { label: "Succès", color: "#28a745" },
    failed: { label: "Échec", color: "#dc3545" },
    cancelled: { label: "Annulé", color: "#6c757d" },
  }

  const getStatusBadge = (status: string) => {
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

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' ? (
      <Plus className="h-4 w-4 text-green-500" />
    ) : (
      <Minus className="h-4 w-4 text-red-500" />
    )
  }

  const getTransactionTypeLabel = (type: string) => {
    return type === 'deposit' ? 'Dépôt' : 'Retrait'
  }

  const getTransactionTypeColor = (type: string) => {
    return type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-4 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">Transactions de Paris</h1>
              <p className="text-orange-100 text-sm md:text-lg">Historique de vos transactions de paris</p>
            </div>
            <div className="flex md:hidden items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-full">
                <div className="text-lg font-bold text-center">
                  {totalCount} transactions
                </div>
                <div className="text-orange-100 text-xs text-center">Total enregistré</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-bold">
                  {totalCount}
                </div>
                <div className="text-orange-100 text-sm">Total transactions</div>
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
              <Filter className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Filtres</h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Filtrez vos transactions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="status" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Statut
                </Label>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value)
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="processing">En cours</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="failed">Échec</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Type
                </Label>
                <Select value={typeFilter} onValueChange={(value) => {
                  setTypeFilter(value)
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="deposit">Dépôt</SelectItem>
                    <SelectItem value="withdrawal">Retrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="platform" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Plateforme
                </Label>
                <Select value={platformFilter} onValueChange={(value) => {
                  setPlatformFilter(value)
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
                    <SelectValue placeholder="Toutes les plateformes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les plateformes</SelectItem>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.uid} value={platform.uid}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="search" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Recherche
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Référence, ID utilisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-orange-500 focus:ring-orange-500/20 text-sm md:text-base pl-10"
                  />
                </div>
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
                  onChange={(e) => {
                    setDateFrom(e.target.value)
                    setCurrentPage(1)
                  }}
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
                  onChange={(e) => {
                    setDateTo(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 text-sm md:text-base"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
              onClick={() => {
                setStatusFilter("all")
                setTypeFilter("all")
                setPlatformFilter("all")
                setSearchQuery("")
                setDateFrom("")
                setDateTo("")
                setCurrentPage(1)
              }}
                className="rounded-xl border-2 h-10 text-sm px-4"
              >
                Effacer les filtres
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTransactions}
                disabled={loading}
                className="rounded-xl border-2 h-10 text-sm px-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Link href="/dashboard/betting/deposit">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-10 text-sm px-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Dépôt
                </Button>
              </Link>
              <Link href="/dashboard/betting/withdrawal">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl h-10 text-sm px-4"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Nouveau Retrait
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
        <div className="p-4 md:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                  {totalCount} transaction{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {loading ? (
            <div className="text-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Chargement...</p>
            </div>
          ) : error ? (
            <ErrorDisplay error={error} variant="full" />
          ) : (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Type</TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Référence</TableHead>
                      <TableHead className="font-semibold cursor-pointer text-xs md:text-sm py-3 md:py-4 px-3 md:px-6" onClick={() => handleSort("amount")}>
                        <div className="flex items-center gap-1 md:gap-2">
                          Montant
                          <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Plateforme</TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">ID Utilisateur</TableHead>
                      <TableHead className="font-semibold cursor-pointer text-xs md:text-sm py-3 md:py-4 px-3 md:px-6" onClick={() => handleSort("date")}>
                        <div className="flex items-center gap-1 md:gap-2">
                          Date
                          <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Statut</TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 md:py-8">
                          <div className="text-center">
                            <CreditCard className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Aucune transaction trouvée</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <React.Fragment key={transaction.uid}>
                          <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell className="py-3 md:py-4 px-3 md:px-6">
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(transaction.transaction_type)}
                                <span className={cn("text-sm font-medium", getTransactionTypeColor(transaction.transaction_type))}>
                                  {getTransactionTypeLabel(transaction.transaction_type)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 md:py-4 px-3 md:px-6">
                              <div className="flex items-center gap-1 md:gap-2">
                                <span className="font-mono text-xs md:text-sm">{transaction.reference}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(transaction.reference)
                                    toast({ title: "Référence copiée!" })
                                  }}
                                  className="h-5 w-5 md:h-6 md:w-6 p-0"
                                >
                                  <Copy className="h-2 w-2 md:h-3 md:w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold py-3 md:py-4 px-3 md:px-6">
                              <div className="flex flex-col">
                                <span className="text-sm md:text-base">{formatAmount(transaction.amount)} FCFA</span>
                                {transaction.commission_amount && parseFloat(transaction.commission_amount) > 0 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Commission: {formatAmount(transaction.commission_amount)} FCFA
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 md:py-4 px-3 md:px-6">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {transaction.platform_name}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 md:py-4 px-3 md:px-6">
                              <span className="font-mono text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                {transaction.betting_user_id}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs md:text-sm text-gray-500 dark:text-gray-400 py-3 md:py-4 px-3 md:px-6">
                              <div className="flex flex-col">
                                <span>{formatDate(transaction.created_at)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 md:py-4 px-3 md:px-6">{getStatusBadge(transaction.status)}</TableCell>
                            <TableCell className="py-3 md:py-4 px-3 md:px-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleViewTransactionDetails(transaction)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {/* Cancellation Button Row */}
                          {canCancelTransaction(transaction) && (
                            <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
                              <TableCell colSpan={8} className="py-2 px-3 md:px-6">
                                <div className="flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
                                    onClick={() => handleCancelTransaction(transaction)}
                                    disabled={cancelling && selectedTransaction?.uid === transaction.uid}
                                  >
                                    {cancelling && selectedTransaction?.uid === transaction.uid ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Cancelling...
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel Transaction
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
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
                Affichage {startIndex + 1} à {Math.min(startIndex + itemsPerPage, totalCount)} sur {totalCount} transactions
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
                  <span className="hidden sm:inline">Précédent</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                <span className="text-xs md:text-sm font-medium px-2 md:px-3 py-1 md:py-2">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="rounded-lg md:rounded-xl text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <div><strong>Reference:</strong> {selectedTransaction.reference}</div>
                  <div><strong>Type:</strong> {getTransactionTypeLabel(selectedTransaction.transaction_type)}</div>
                  <div><strong>Amount:</strong> {formatAmount(selectedTransaction.amount)} FCFA</div>
                  <div><strong>Platform:</strong> {selectedTransaction.platform_name}</div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="cancelReason" className="text-sm font-medium">
                  Cancellation Reason *
                </Label>
                <Textarea
                  id="cancelReason"
                  placeholder="Please explain why you are cancelling this transaction..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelling}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelling || !cancelReason.trim()}
            >
              {cancelling ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about this betting transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedDetailTransaction && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Reference</Label>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded flex-1">
                        {selectedDetailTransaction.reference}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedDetailTransaction.reference)
                          toast({ title: "Reference copied!" })
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Transaction Type</Label>
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(selectedDetailTransaction.transaction_type)}
                      <span className={cn("text-sm font-medium", getTransactionTypeColor(selectedDetailTransaction.transaction_type))}>
                        {getTransactionTypeLabel(selectedDetailTransaction.transaction_type)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedDetailTransaction.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Amount</Label>
                    <div className="text-lg font-semibold">
                      {formatAmount(selectedDetailTransaction.amount)} FCFA
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Platform</Label>
                    <div className="text-sm font-medium">
                      {selectedDetailTransaction.platform_name}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Betting User ID</Label>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded flex-1">
                        {selectedDetailTransaction.betting_user_id}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedDetailTransaction.betting_user_id)
                          toast({ title: "Betting User ID copied!" })
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created At</Label>
                    <div className="text-sm">
                      {formatDate(selectedDetailTransaction.created_at)}
                    </div>
                  </div>
                  {selectedDetailTransaction.withdrawal_code && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Withdrawal Code</Label>
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded flex-1">
                          {selectedDetailTransaction.withdrawal_code}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            if (selectedDetailTransaction.withdrawal_code) {
                              navigator.clipboard.writeText(selectedDetailTransaction.withdrawal_code)
                              toast({ title: "Withdrawal code copied!" })
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Commission Information */}
              {selectedDetailTransaction.commission_amount && parseFloat(selectedDetailTransaction.commission_amount) > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Commission Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Commission Rate</Label>
                      <div className="text-sm">
                        {parseFloat(selectedDetailTransaction.commission_rate) * 100}%
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Commission Amount</Label>
                      <div className="text-sm font-semibold">
                        {formatAmount(selectedDetailTransaction.commission_amount)} FCFA
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Commission Paid</Label>
                      <div className="text-sm">
                        {selectedDetailTransaction.commission_paid ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-orange-600 font-medium">No</span>
                        )}
                      </div>
                    </div>
                    {selectedDetailTransaction.commission_paid_at && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Commission Paid At</Label>
                        <div className="text-sm">
                          {formatDate(selectedDetailTransaction.commission_paid_at)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cancellation Information */}
              {(selectedDetailTransaction.cancellation_requested_at || selectedDetailTransaction.cancelled_at) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Cancellation Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDetailTransaction.cancellation_requested_at && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Cancellation Requested At</Label>
                        <div className="text-sm">
                          {formatDate(selectedDetailTransaction.cancellation_requested_at)}
                        </div>
                      </div>
                    )}
                    {selectedDetailTransaction.cancelled_at && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Cancelled At</Label>
                        <div className="text-sm">
                          {formatDate(selectedDetailTransaction.cancelled_at)}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Partner Refunded</Label>
                      <div className="text-sm">
                        {selectedDetailTransaction.partner_refunded ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-600 font-medium">No</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Balance Information */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Balance Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Balance Before</Label>
                    <div className="text-sm font-semibold">
                      {formatAmount(selectedDetailTransaction.partner_balance_before)} FCFA
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Balance After</Label>
                    <div className="text-sm font-semibold">
                      {formatAmount(selectedDetailTransaction.partner_balance_after)} FCFA
                    </div>
                  </div>
                </div>
              </div>

              {/* External Information */}
              {selectedDetailTransaction.external_transaction_id && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">External Information</h4>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">External Transaction ID</Label>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded flex-1">
                        {selectedDetailTransaction.external_transaction_id}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          if (selectedDetailTransaction.external_transaction_id) {
                            navigator.clipboard.writeText(selectedDetailTransaction.external_transaction_id)
                            toast({ title: "External Transaction ID copied!" })
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function BettingTransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BettingTransactionsContent />
    </Suspense>
  )
}
