"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Plus, TrendingUp, TrendingDown, Wallet, RefreshCw, Activity, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useApi } from "@/lib/useApi"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UserPaymentPage() {
	// Account data state
	const [accountData, setAccountData] = useState<any>(null)
	const [accountLoading, setAccountLoading] = useState(true)
	const [accountError, setAccountError] = useState("")
	
	// Transactions state
	const [transactions, setTransactions] = useState<any[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [currentPage, setCurrentPage] = useState(1)
	const [searchTerm, setSearchTerm] = useState("")
	const [typeFilter, setTypeFilter] = useState("all")
	const [startDate, setStartDate] = useState("")
	const [endDate, setEndDate] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [sortField, setSortField] = useState<"amount" | "created_at" | "type" | null>(null)
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
	
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
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
	const { toast } = useToast()
	const apiFetch = useApi()

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

	// Fetch transactions
	const fetchTransactions = async () => {
		setLoading(true)
		setError("")
		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				page_size: itemsPerPage.toString(),
			})
			if (searchTerm.trim() !== "") {
				params.append("search", searchTerm)
			}
			if (typeFilter !== "all") {
				params.append("type", typeFilter)
			}
			if (startDate) {
				params.append("date_from", startDate)
			}
			if (endDate) {
				params.append("date_to", endDate)
			}
			const orderingParam = sortField
				? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
				: ""
			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/account/transactions/?${params.toString()}${orderingParam}`
			const data = await apiFetch(endpoint)
			setTransactions(data.results || [])
			setTotalCount(data.count || 0)
			setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
		} catch (err: any) {
			const errorMessage = extractErrorMessages(err)
			setError(errorMessage)
			toast({ title: t("payment.failedToLoadTransactions"), description: errorMessage, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}

	// Fetch networks
	const fetchNetworks = async () => {
		setNetworksLoading(true)
		try {
			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/networks/`
			const data = await apiFetch(endpoint)
			setNetworks(data.results || [])
		} catch (err: any) {
			console.error("Failed to fetch networks:", err)
		} finally {
			setNetworksLoading(false)
		}
	}

	useEffect(() => {
		fetchTransactions()
		fetchNetworks()
	}, [currentPage, searchTerm, typeFilter, startDate, endDate, sortField, sortDirection])

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

	const handleSort = (field: "amount" | "created_at" | "type") => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortDirection("desc")
		}
	}

	const handleCreateTransaction = async () => {
		setCreateLoading(true)
		setCreateError("")
		try {
			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/account/transactions/`
			const payload = {
				type: transactionForm.type,
				amount: parseFloat(transactionForm.amount),
				recipient_phone: transactionForm.recipient_phone,
				network: transactionForm.network,
				objet: transactionForm.objet
			}
			await apiFetch(endpoint, {
				method: "POST",
				body: JSON.stringify(payload)
			})
			toast({ title: t("payment.transactionCreated"), description: t("payment.transactionCreatedSuccessfully") })
			setCreateModalOpen(false)
			setTransactionForm({
				type: "deposit",
				amount: "",
				recipient_phone: "",
				network: "",
				objet: ""
			})
			fetchTransactions()
			refreshAccountData()
		} catch (err: any) {
			const errorMessage = extractErrorMessages(err)
			setCreateError(errorMessage)
			toast({ title: t("payment.failedToCreateTransaction"), description: errorMessage, variant: "destructive" })
		} finally {
			setCreateLoading(false)
		}
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
		toast({ title: t("common.copied"), description: t("common.copiedToClipboard") })
	}

	const startIndex = (currentPage - 1) * itemsPerPage

	return (
		<div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
			{/* Hero Section */}
			<div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-4 md:p-8 text-white shadow-2xl">
				<div className="absolute inset-0 bg-black/10"></div>
				<div className="relative z-10">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div className="flex-1">
							<h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">Gestion des Transactions</h1>
							<p className="text-orange-100 text-sm md:text-lg">Gérez vos transactions et votre compte</p>
						</div>
						<div className="flex md:hidden items-center justify-center">
							<div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-full">
								<div className="text-lg font-bold text-center">{accountData?.formatted_balance || "0 FCFA"}</div>
								<div className="text-orange-100 text-xs text-center">Solde actuel</div>
							</div>
						</div>
						<div className="hidden md:flex items-center space-x-4">
							<div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
								<div className="text-2xl font-bold">{accountData?.formatted_balance || "0 FCFA"}</div>
								<div className="text-orange-100 text-sm">Solde actuel</div>
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
							<div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
								<Wallet className="h-5 w-5 md:h-6 md:w-6 text-white" />
							</div>
							<div>
								<h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Vue d'ensemble du Compte</h2>
								<p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Informations détaillées de votre compte</p>
							</div>
						</div>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={refreshAccountData} 
							disabled={accountLoading}
							className="rounded-xl md:rounded-2xl border-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 w-full sm:w-auto"
						>
							<RefreshCw className={`h-4 w-4 mr-2 ${accountLoading ? 'animate-spin' : ''}`} />
							{t("common.refresh") || "Refresh"}
						</Button>
					</div>
					
					{accountLoading ? (
						<div className="p-8 md:p-12 text-center">
							<div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
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
										<p className="text-blue-100 text-xs md:text-sm font-medium mb-2">Solde Actuel</p>
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
										<p className="text-green-100 text-xs md:text-sm font-medium mb-2">Total Rechargé</p>
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
										<p className="text-purple-100 text-xs md:text-sm font-medium mb-2">Total Déposé</p>
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
										<p className="text-orange-100 text-xs md:text-sm font-medium mb-2">Total Retiré</p>
										<p className="text-xl md:text-3xl font-bold">{accountData.total_withdrawn} FCFA</p>
									</div>
								</div>
							</div>

							{/* Account Status */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
								<div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Statut du Compte</p>
											<Badge variant={accountData.is_active ? "default" : "destructive"} className="text-xs md:text-sm">
												{accountData.is_active ? "Actif" : "Inactif"}
											</Badge>
										</div>
										<div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${accountData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
									</div>
								</div>

								<div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Compte Gelé</p>
											<Badge variant={accountData.is_frozen ? "destructive" : "default"} className="text-xs md:text-sm">
												{accountData.is_frozen ? "Oui" : "Non"}
											</Badge>
										</div>
										<div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${accountData.is_frozen ? 'bg-red-500' : 'bg-green-500'}`}></div>
									</div>
								</div>

								<div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Taux d'Utilisation</p>
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
							<div className="p-2 md:p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl md:rounded-2xl">
								<Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
							</div>
							<div>
								<h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
								<p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Historique et gestion des transactions</p>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full lg:w-auto">
							<Button 
								variant="outline" 
								size="sm" 
								onClick={fetchTransactions} 
								disabled={loading}
								className="rounded-xl md:rounded-2xl border-2 hover:bg-green-50 dark:hover:bg-green-900/20 w-full sm:w-auto"
							>
								<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
								{t("common.refresh") || "Actualiser"}
							</Button>
							{/* <Button 
								onClick={() => setCreateModalOpen(true)}
								className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl md:rounded-2xl w-full sm:w-auto"
							>
								<Plus className="h-4 w-4 mr-2" />
								Nouvelle Transaction
							</Button> */}
						</div>
					</div>
				</div>

				<div className="p-4 md:p-8">
					{/* Filters and Search */}
					<div className="space-y-4 mb-4 md:mb-6">
						{/* Search and Type Filters */}
						<div className="flex flex-col lg:flex-row gap-3 md:gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Rechercher des transactions..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 focus:ring-blue-500/20 text-sm md:text-base"
								/>
							</div>
							<Select value={typeFilter} onValueChange={setTypeFilter}>
								<SelectTrigger className="w-full lg:w-48 rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
									<SelectValue placeholder="Type de transaction" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tous les types</SelectItem>
									<SelectItem value="deposit">Dépôt</SelectItem>
									<SelectItem value="withdrawal">Retrait</SelectItem>
								</SelectContent>
							</Select>
						</div>
						
						{/* Date Filters */}
						<div className="flex flex-col sm:flex-row gap-3 md:gap-4">
							<div className="flex-1">
								<Label htmlFor="startDate" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
									{t("common.startDate") || "Date de début"}
								</Label>
								<Input
									id="startDate"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 focus:ring-blue-500/20 text-sm md:text-base"
								/>
							</div>
							<div className="flex-1">
								<Label htmlFor="endDate" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
									{t("common.endDate") || "Date de fin"}
								</Label>
								<Input
									id="endDate"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 focus:ring-blue-500/20 text-sm md:text-base"
								/>
							</div>
							{(startDate || endDate) && (
								<div className="flex items-end">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setStartDate("")
											setEndDate("")
										}}
										className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 text-sm md:text-base px-3 md:px-4"
									>
										{t("common.clearDates") || "Effacer les dates"}
									</Button>
								</div>
							)}
						</div>
					</div>

					{/* Transactions Table */}
					{loading ? (
						<div className="text-center py-8 md:py-12">
							<div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
							<p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Chargement des transactions...</p>
						</div>
					) : error ? (
						<ErrorDisplay error={error} variant="full" />
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
											<TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Statut</TableHead>
											<TableHead className="font-semibold cursor-pointer text-xs md:text-sm py-3 md:py-4 px-3 md:px-6 hidden md:table-cell" onClick={() => handleSort("created_at")}>
												<div className="flex items-center gap-1 md:gap-2">
													Date
													<ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
												</div>
											</TableHead>
											<TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{transactions.length === 0 ? (
											<TableRow>
												<TableCell colSpan={6} className="text-center py-6 md:py-8">
													<div className="text-center">
														<CreditCard className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
														<p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Aucune transaction trouvée</p>
													</div>
												</TableCell>
											</TableRow>
										) : (
											transactions.map((transaction) => (
												<TableRow key={transaction.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
													<TableCell className="py-3 md:py-4 px-3 md:px-6">
														<div className="flex items-center gap-1 md:gap-2">
															<span className="font-mono text-xs md:text-sm">{transaction.reference}</span>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => copyToClipboard(transaction.reference)}
																className="h-5 w-5 md:h-6 md:w-6 p-0"
															>
																<Copy className="h-2 w-2 md:h-3 md:w-3" />
															</Button>
														</div>
													</TableCell>
													<TableCell className="py-3 md:py-4 px-3 md:px-6">
														<Badge variant={transaction.type === "deposit" ? "default" : "secondary"} className="text-xs">
															{transaction.type === "deposit" ? "Dépôt" : "Retrait"}
														</Badge>
													</TableCell>
													<TableCell className="font-semibold py-3 md:py-4 px-3 md:px-6 text-sm md:text-base">{transaction.formatted_amount}</TableCell>
													<TableCell className="py-3 md:py-4 px-3 md:px-6">
														<Badge 
															variant={
																transaction.status === "completed" ? "default" :
																transaction.status === "pending" ? "secondary" :
																"destructive"
															}
															className="text-xs"
														>
															{transaction.status_display}
														</Badge>
													</TableCell>
													<TableCell className="text-xs md:text-sm text-gray-500 dark:text-gray-400 py-3 md:py-4 px-3 md:px-6 hidden md:table-cell">
														{new Date(transaction.created_at).toLocaleDateString("fr-FR")}
													</TableCell>
													<TableCell className="py-3 md:py-4 px-3 md:px-6">
														<Button variant="ghost" size="sm" className="rounded-lg md:rounded-xl text-xs md:text-sm">
															Détails
														</Button>
													</TableCell>
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
								Affichage {startIndex + 1} à {Math.min(startIndex + itemsPerPage, totalCount)} sur {totalCount} transactions
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(currentPage - 1)}
									disabled={currentPage === 1}
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
									onClick={() => setCurrentPage(currentPage + 1)}
									disabled={currentPage === totalPages}
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

			{/* Create Transaction Modal */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl md:rounded-3xl mx-4 sm:mx-0">
					<DialogHeader>
						<DialogTitle className="text-lg md:text-2xl font-bold">Nouvelle Transaction</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 md:space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
							<div>
								<Label htmlFor="type" className="text-xs md:text-sm">Type de Transaction</Label>
								<Select 
									value={transactionForm.type} 
									onValueChange={(value: "deposit" | "withdraw") => setTransactionForm({...transactionForm, type: value})}
								>
									<SelectTrigger className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="deposit">Dépôt</SelectItem>
										<SelectItem value="withdraw">Retrait</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="amount" className="text-xs md:text-sm">Montant (FCFA)</Label>
								<Input
									id="amount"
									type="number"
									value={transactionForm.amount}
									onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
									placeholder="0"
									className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12 text-sm md:text-base"
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="recipient_phone" className="text-xs md:text-sm">Numéro de Téléphone</Label>
							<Input
								id="recipient_phone"
								value={transactionForm.recipient_phone}
								onChange={(e) => setTransactionForm({...transactionForm, recipient_phone: e.target.value})}
								placeholder="+225 0700000000"
								className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12 text-sm md:text-base"
							/>
						</div>
						<div>
							<Label htmlFor="network" className="text-xs md:text-sm">Réseau</Label>
							<Select 
								value={transactionForm.network} 
								onValueChange={(value) => setTransactionForm({...transactionForm, network: value})}
							>
								<SelectTrigger className="rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
									<SelectValue placeholder="Sélectionner un réseau" />
								</SelectTrigger>
								<SelectContent>
									{networks.map((network) => (
										<SelectItem key={network.uid} value={network.uid}>
											{network.nom}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="objet" className="text-xs md:text-sm">Objet</Label>
							<Textarea
								id="objet"
								value={transactionForm.objet}
								onChange={(e) => setTransactionForm({...transactionForm, objet: e.target.value})}
								placeholder="Description de la transaction..."
								className="rounded-xl md:rounded-2xl border-2 text-sm md:text-base"
								rows={3}
							/>
						</div>
						{createError && (
							<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl md:rounded-2xl p-3 md:p-4">
								<p className="text-red-600 dark:text-red-400 text-xs md:text-sm">{createError}</p>
							</div>
						)}
					</div>
					<div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 md:mt-6">
						<Button 
							variant="outline" 
							onClick={() => setCreateModalOpen(false)}
							className="rounded-xl md:rounded-2xl w-full sm:w-auto text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
						>
							Annuler
						</Button>
						<Button 
							onClick={handleCreateTransaction}
							disabled={createLoading}
							className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl md:rounded-2xl w-full sm:w-auto text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
						>
							{createLoading ? "Création..." : "Créer la Transaction"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}