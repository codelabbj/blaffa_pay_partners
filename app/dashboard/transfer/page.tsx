"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCw, Send, Users, TrendingUp, TrendingDown, Copy, Activity, CreditCard, UserSearch, AlertCircle, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

interface User {
  uid: string
  display_name: string
}

interface Transfer {
  uid: string
  reference: string
  sender: number
  sender_name: string
  sender_email: string
  receiver: number
  receiver_name: string
  receiver_email: string
  amount: string
  fees: string
  status: string
  description: string
  sender_balance_before: string
  sender_balance_after: string
  receiver_balance_before: string
  receiver_balance_after: string
  completed_at: string | null
  failed_reason: string
  created_at: string
  updated_at: string
}

interface TransferStats {
  total_sent: number
  total_received: number
  amount_sent: number
  amount_received: number
}

export default function TransferPage() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    receiver_uid: "",
    amount: "",
    description: ""
  })
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState("")
  const [transferModalOpen, setTransferModalOpen] = useState(false)

  // User search state
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  // Transfer history state
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [transferStats, setTransferStats] = useState<TransferStats | null>(null)
  const [transferData, setTransferData] = useState<any>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState("")

  // Filters for transfer history
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"amount" | "date" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const itemsPerPage = 10

  // Search users function
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([])
      return
    }

    setSearchLoading(true)
    setSearchError("")
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/users/search/?search=${encodeURIComponent(query)}`
      const data = await apiFetch(endpoint)
      setUsers(data.results || [])
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setSearchError(errorMessage)
      toast({ title: "Erreur de recherche", description: errorMessage, variant: "destructive" })
    } finally {
      setSearchLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery)
      } else {
        setUsers([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Fetch transfer statistics
  const fetchTransferStats = async () => {
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transfers/my_transfers/`
      const data = await apiFetch(endpoint)
      // Extract stats from the summary object in the API response
      if (data.summary) {
        setTransferStats(data.summary)
      } else {
        setTransferStats(data)
      }
    } catch (err: any) {
      console.error('Failed to fetch transfer stats:', err)
    }
  }

  // Fetch transfer history
  const fetchTransferHistory = async () => {
    setHistoryLoading(true)
    setHistoryError("")
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transfers/my_transfers/`
      const data = await apiFetch(endpoint)
      
      // Store the raw data for later use
      setTransferData(data)
      
      // Combine sent and received transfers based on filter
      let allTransfers: Transfer[] = []
      if (typeFilter === "sent") {
        allTransfers = data.sent_transfers || []
      } else if (typeFilter === "received") {
        allTransfers = data.received_transfers || []
      } else {
        // Show both sent and received (for "all" filter)
        allTransfers = [...(data.sent_transfers || []), ...(data.received_transfers || [])]
      }

      // Apply client-side filtering and sorting
      let filteredTransfers: Transfer[] = allTransfers

      // Apply status filter
      if (statusFilter !== "all") {
        filteredTransfers = filteredTransfers.filter((transfer: Transfer) => transfer.status === statusFilter)
      }

      // Apply amount filters
      if (minAmount) {
        filteredTransfers = filteredTransfers.filter((transfer: Transfer) => parseFloat(transfer.amount) >= parseFloat(minAmount))
      }
      if (maxAmount) {
        filteredTransfers = filteredTransfers.filter((transfer: Transfer) => parseFloat(transfer.amount) <= parseFloat(maxAmount))
      }

      // Apply date filters
      if (dateFrom) {
        filteredTransfers = filteredTransfers.filter((transfer: Transfer) => 
          new Date(transfer.created_at) >= new Date(dateFrom)
        )
      }
      if (dateTo) {
        filteredTransfers = filteredTransfers.filter((transfer: Transfer) => 
          new Date(transfer.created_at) <= new Date(dateTo)
        )
      }

      // Apply sorting
      if (sortField) {
        filteredTransfers.sort((a: Transfer, b: Transfer) => {
          let aValue: number, bValue: number
          if (sortField === "amount") {
            aValue = parseFloat(a.amount)
            bValue = parseFloat(b.amount)
          } else if (sortField === "date") {
            aValue = new Date(a.created_at).getTime()
            bValue = new Date(b.created_at).getTime()
          } else {
            return 0
          }
          
          if (sortDirection === "asc") {
            return aValue - bValue
          } else {
            return bValue - aValue
          }
        })
      }

      setTransfers(filteredTransfers)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setHistoryError(errorMessage)
      toast({ title: "Erreur de chargement", description: errorMessage, variant: "destructive" })
    } finally {
      setHistoryLoading(false)
    }
  }

  // Handle transfer submission
  const handleTransfer = async () => {
    if (!selectedUser) {
      setTransferError("Veuillez sélectionner un destinataire")
      return
    }

    setTransferLoading(true)
    setTransferError("")
    try {
      const payload = {
        receiver_uid: selectedUser.uid,
        amount: transferForm.amount,
        description: transferForm.description
      }

      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transfers/`
      const data = await apiFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      
      toast({ 
        title: "Transfert réussi", 
        description: data.message || "Transfert effectué avec succès"
      })
      
      // Reset form and close modal only on success
      setTransferForm({
        receiver_uid: "",
        amount: "",
        description: ""
      })
      setSelectedUser(null)
      setSearchQuery("")
      setUsers([])
      setTransferModalOpen(false)
      
      // Refresh data
      await fetchTransferStats()
      await fetchTransferHistory()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setTransferError(errorMessage)
      toast({ title: "Erreur de transfert", description: errorMessage, variant: "destructive" })
      // Don't close modal on error - keep it open to show the error
    } finally {
      setTransferLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchTransferStats()
    fetchTransferHistory()
  }, [])

  // Reload history when filters change
  useEffect(() => {
    fetchTransferHistory()
  }, [currentPage, statusFilter, typeFilter, minAmount, maxAmount, dateFrom, dateTo, sortField, sortDirection])

  const totalPages = Math.ceil((transfers.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage

  const handleSort = (field: "amount" | "date") => {
    setCurrentPage(1)
    setSortDirection((prevDir) => (sortField === field ? (prevDir === "desc" ? "asc" : "desc") : "desc"))
    setSortField(field)
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "#ffc107" },
    processing: { label: "En cours", color: "#fd7e14" },
    completed: { label: "Terminé", color: "#28a745" },
    success: { label: "Succès", color: "#20c997" },
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

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-4 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">Transfert UV</h1>
              <p className="text-orange-100 text-sm md:text-lg">Envoyez de l'argent à d'autres utilisateurs</p>
            </div>
            <div className="flex md:hidden items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-full">
                <div className="text-lg font-bold text-center">
                  {transferStats ? `${(transferStats.total_sent || 0) + (transferStats.total_received || 0)} transferts` : "0 transferts"}
                </div>
                <div className="text-orange-100 text-xs text-center">Total des transferts</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl font-bold">
                  {transferStats ? `${(transferStats.total_sent || 0) + (transferStats.total_received || 0)} transferts` : "0 transferts"}
                </div>
                <div className="text-orange-100 text-sm">Total des transferts</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Transfer Statistics */}
      {transferStats && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl md:rounded-2xl">
                <Send className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Transferts Envoyés</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{transferStats.total_sent || 0}</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total: {(transferStats.amount_sent || 0).toLocaleString()} FCFA</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl md:rounded-2xl">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Transferts Reçus</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{transferStats.total_received || 0}</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total: {(transferStats.amount_received || 0).toLocaleString()} FCFA</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl md:rounded-2xl">
                <TrendingDown className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Montant Envoyé</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{(transferStats.amount_sent || 0).toLocaleString()} FCFA</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total des envois</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">Montant Reçu</h3>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{(transferStats.amount_received || 0).toLocaleString()} FCFA</div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total des réceptions</p>
          </div>
        </div>
      )}

      {/* New Transfer Button */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl">
        <div className="p-4 md:p-8 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
              <Send className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Nouveau Transfert</h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Envoyez de l'argent à un autre utilisateur</p>
            </div>
          </div>
          
          <Dialog open={transferModalOpen} onOpenChange={(open) => {
            setTransferModalOpen(open)
            if (open) {
              setTransferError("") // Clear error when opening modal
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl md:rounded-2xl h-10 md:h-12 text-sm md:text-base px-6 md:px-8">
                <Send className="h-4 w-4 mr-2" />
                Créer un nouveau transfert
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl md:rounded-3xl sm:max-w-[500px] mx-4 sm:mx-0">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-2xl font-bold">Nouveau Transfert</DialogTitle>
              </DialogHeader>
              
              {transferError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl md:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{transferError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4 md:space-y-6">
                {/* Receiver Search */}
                <div>
                  <Label htmlFor="receiver" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Destinataire *
                  </Label>
                  <div className="relative">
                    <Input
                      id="receiver"
                      type="text"
                      placeholder="Tapez le nom de l'utilisateur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-orange-500 focus:ring-orange-500/20 text-sm md:text-base pr-10"
                    />
                    {searchLoading ? (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    ) : selectedUser && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null)
                          setTransferForm({...transferForm, receiver_uid: ""})
                          setSearchQuery("")
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Search Results Dropdown */}
                  {searchQuery && !selectedUser && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                      {searchLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Recherche en cours...
                        </div>
                      ) : searchError ? (
                        <div className="p-4 text-center text-sm text-red-500">
                          Erreur de recherche: {searchError}
                        </div>
                      ) : users.length === 0 ? (
                        <div className="p-4 text-center">
                          <UserSearch className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Aucun utilisateur trouvé</p>
                          <p className="text-xs text-gray-400 mt-1">Veuillez saisir un nom existant</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          {users.map((user: User) => (
                            <div
                              key={user.uid}
                              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                              onClick={() => {
                                setSelectedUser(user)
                                setTransferForm({...transferForm, receiver_uid: user.uid})
                                setSearchQuery(user.display_name)
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{user.display_name}</span>
                                {selectedUser?.uid === user.uid && (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <Label htmlFor="amount" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Montant (FCFA) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                    className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-orange-500 focus:ring-orange-500/20 text-sm md:text-base"
                    required
                    min="1"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Description du transfert (optionnel)"
                    value={transferForm.description}
                    onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
                    className="rounded-xl md:rounded-2xl border-2 focus:border-orange-500 focus:ring-orange-500/20 text-sm md:text-base"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleTransfer}
                  disabled={transferLoading || !selectedUser || !transferForm.amount}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl md:rounded-2xl h-10 md:h-12 text-sm md:text-base"
                >
                  {transferLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le transfert
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Transfer History */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
        <div className="p-4 md:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl md:rounded-2xl">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Historique des Transferts</h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Consultez vos transferts envoyés et reçus</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchTransferHistory()
                fetchTransferStats()
              }}
              disabled={historyLoading}
              className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12 text-sm md:text-base px-3 md:px-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${historyLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
                  <SelectValue placeholder="Type de transfert" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="sent">Envoyés</SelectItem>
                  <SelectItem value="received">Reçus</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="failed">Échec</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1">
                <Input
                  placeholder="Montant minimum"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 text-sm md:text-base"
                />
              </div>

              <div className="flex-1">
                <Input
                  placeholder="Montant maximum"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 text-sm md:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="flex-1">
                <Label htmlFor="dateFrom" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
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
              <div className="flex-1">
                <Label htmlFor="dateTo" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
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
              {(dateFrom || dateTo) && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateFrom("")
                      setDateTo("")
                      setCurrentPage(1)
                    }}
                    className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 text-sm md:text-base px-3 md:px-4"
                  >
                    Effacer
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Transfer History Table */}
          {historyLoading ? (
            <div className="text-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Chargement...</p>
            </div>
          ) : historyError ? (
            <ErrorDisplay error={historyError} variant="full" />
          ) : (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Référence</TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Type</TableHead>
                      <TableHead className="font-semibold cursor-pointer text-xs md:text-sm py-3 md:py-4 px-3 md:px-6" onClick={() => handleSort("amount")}>
                        <div className="flex items-center gap-1 md:gap-2">
                          Montant
                          <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6 hidden md:table-cell">Utilisateur</TableHead>
                      <TableHead className="font-semibold cursor-pointer text-xs md:text-sm py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell" onClick={() => handleSort("date")}>
                        <div className="flex items-center gap-1 md:gap-2">
                          Date
                          <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Description</TableHead>
                      <TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 md:py-8">
                          <div className="text-center">
                            <CreditCard className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Aucun transfert trouvé</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transfers.map((transfer) => {
                        // Determine if this is a sent or received transfer
                        const isReceived = transferData?.received_transfers?.some((t: any) => t.uid === transfer.uid)
                        const isSent = transferData?.sent_transfers?.some((t: any) => t.uid === transfer.uid)
                        
                        return (
                          <TableRow key={transfer.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell className="py-3 md:py-4 px-3 md:px-6">
                              <div className="flex items-center gap-1 md:gap-2">
                                <span className="font-mono text-xs md:text-sm">{transfer.reference}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(transfer.reference)
                                    toast({ title: "Référence copiée!" })
                                  }}
                                  className="h-5 w-5 md:h-6 md:w-6 p-0"
                                >
                                  <Copy className="h-2 w-2 md:h-3 md:w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 md:py-4 px-3 md:px-6">
                              <Badge variant={isReceived ? "default" : "secondary"} className="text-xs">
                                {isReceived ? "Reçu" : "Envoyé"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold py-3 md:py-4 px-3 md:px-6">
                              <div className="flex flex-col">
                                <span className="text-sm md:text-base">{parseFloat(transfer.amount).toLocaleString()} FCFA</span>
                                {transfer.fees && parseFloat(transfer.fees) > 0 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Frais: {transfer.fees} FCFA
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 md:py-4 px-3 md:px-6 hidden md:table-cell">
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">
                                  {isReceived ? transfer.sender_name : transfer.receiver_name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {isReceived ? transfer.sender_email : transfer.receiver_email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs md:text-sm text-gray-500 dark:text-gray-400 py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell">
                              <div className="flex flex-col">
                                <span>{new Date(transfer.created_at).toLocaleDateString()}</span>
                                <span className="text-xs">
                                  {new Date(transfer.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 md:py-4 px-3 md:px-6">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {transfer.description || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 md:py-4 px-3 md:px-6">{getStatusBadge(transfer.status)}</TableCell>
                          </TableRow>
                        )
                      })
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
                Affichage {startIndex + 1} à {Math.min(startIndex + itemsPerPage, transfers.length)} sur {transfers.length} transferts
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || historyLoading}
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
                  disabled={currentPage === totalPages || historyLoading}
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
    </div>
  )
}
