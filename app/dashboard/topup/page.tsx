"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Plus, Upload, Wallet, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useApi } from "@/lib/useApi"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UserTopupPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [startDate, setStartDate] = useState("")
	const [endDate, setEndDate] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [topups, setTopups] = useState<any[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [sortField, setSortField] = useState<"amount" | "created_at" | "status" | null>(null)
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
	const { t } = useLanguage()
	const itemsPerPage = 10
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
	const { toast } = useToast()
	const apiFetch = useApi();
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [detailTopup, setDetailTopup] = useState<any | null>(null)
	const [detailLoading, setDetailLoading] = useState(false)
	const [detailError, setDetailError] = useState("")
	const [refreshing, setRefreshing] = useState(false)
	
	// Create topup modal state
	const [createModalOpen, setCreateModalOpen] = useState(false)
	const [createLoading, setCreateLoading] = useState(false)
	const [createError, setCreateError] = useState("")
	const [formData, setFormData] = useState({
		amount: "",
		proof_image: null as File | null,
		proof_description: "",
		transaction_date: ""
	})

	// Fetch topups from API
	const fetchTopups = useCallback(async () => {
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
			if (statusFilter !== "all") {
				params.append("status", statusFilter)
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
			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/recharges/?${params.toString()}${orderingParam}`
			const data = await apiFetch(endpoint)
			setTopups(data.results || [])
			setTotalCount(data.count || 0)
			setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
		} catch (err: any) {
			const errorMessage = extractErrorMessages(err)
			setError(errorMessage)
			setTopups([])
			setTotalCount(0)
			setTotalPages(1)
			toast({ title: t("topup.failedToLoad"), description: errorMessage, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, startDate, endDate, sortField, sortDirection, t, toast, apiFetch])

	useEffect(() => {
		fetchTopups()
	}, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, startDate, endDate, sortField, sortDirection, t, toast, apiFetch])

	const startIndex = (currentPage - 1) * itemsPerPage

	// Manual refresh function
	const handleRefresh = async () => {
		setRefreshing(true)
		setCurrentPage(1)
		try {
			await fetchTopups()
		} catch (error) {
			console.error('Refresh failed:', error)
		} finally {
			setRefreshing(false)
		}
	}

	const handleSort = (field: "amount" | "created_at" | "status") => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortDirection("desc")
		}
	}

	// Fetch topup details
	const handleOpenDetail = async (uid: string) => {
		setDetailModalOpen(true)
		setDetailLoading(true)
		setDetailError("")
		setDetailTopup(null)
		try {
			// For demo, just find in topups
			const found = topups.find((t) => t.uid === uid)
			setDetailTopup(found)
			toast({ title: t("topup.detailLoaded"), description: t("topup.detailLoadedSuccessfully") })
		} catch (err: any) {
			setDetailError(extractErrorMessages(err))
			toast({ title: t("topup.detailFailed"), description: extractErrorMessages(err), variant: "destructive" })
		} finally {
			setDetailLoading(false)
		}
	}

	const handleCloseDetail = () => {
		setDetailModalOpen(false)
		setDetailTopup(null)
		setDetailError("")
	}

	// Handle create topup
	const handleCreateTopup = async () => {
		setCreateLoading(true)
		setCreateError("")
		try {
			const formDataPayload = new FormData()
			formDataPayload.append("amount", formData.amount)
			if (formData.proof_image) {
				formDataPayload.append("proof_image", formData.proof_image)
			}
			formDataPayload.append("proof_description", formData.proof_description)
			if (formData.transaction_date) {
				formDataPayload.append("transaction_date", formData.transaction_date)
			}

			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/recharges/`
			await apiFetch(endpoint, {
				method: "POST",
				body: formDataPayload
			})
			
			toast({ title: t("topup.success"), description: t("topup.createdSuccessfully") })
			setCreateModalOpen(false)
			setFormData({
				amount: "",
				proof_image: null,
				proof_description: "",
				transaction_date: ""
			})
			// Refresh the list
			setCurrentPage(1)
		} catch (err: any) {
			const errorMessage = extractErrorMessages(err)
			setCreateError(errorMessage)
			toast({ title: t("topup.createFailed"), description: errorMessage, variant: "destructive" })
		} finally {
			setCreateLoading(false)
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setFormData(prev => ({ ...prev, proof_image: file }))
		}
	}

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "pending":
				return "outline"
			case "approved":
				return "default"
			case "rejected":
				return "destructive"
			case "expired":
				return "secondary"
			default:
				return "secondary"
		}
	}

	const formatTimeRemaining = (timeRemaining: string) => {
		if (!timeRemaining) return "-"
		const seconds = parseFloat(timeRemaining)
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		return `${hours}h ${minutes}m`
	}

	return (
		<div className="space-y-4 md:space-y-6 lg:space-y-8 overflow-x-hidden">
			{/* Hero Section */}
			<div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-4 md:p-8 text-white shadow-2xl">
				<div className="absolute inset-0 bg-black/10"></div>
				<div className="relative z-10">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div className="flex-1">
							<h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">{t("topup.title") || "My Top Up Requests"}</h1>
							<p className="text-orange-100 text-sm md:text-lg">{t("topup.subtitle") || "Manage your account recharge requests and track their status"}</p>
						</div>
						<div className="flex md:hidden items-center justify-center">
							<div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-full">
								<div className="text-lg font-bold text-center">{totalCount}</div>
								<div className="text-orange-100 text-xs text-center">{t("topup.totalRequests") || "Total Requests"}</div>
							</div>
						</div>
						<div className="hidden md:flex items-center space-x-4">
							<div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
								<div className="text-2xl font-bold">{totalCount}</div>
								<div className="text-orange-100 text-sm">{t("topup.totalRequests") || "Total Requests"}</div>
							</div>
						</div>
					</div>
				</div>
				{/* Decorative elements */}
				<div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
				<div className="absolute bottom-0 left-0 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl"></div>
			</div>

			{/* Topup Requests Section */}
			<div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
				<div className="p-4 md:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div className="flex items-center gap-2 md:gap-3">
							<div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl">
								<Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
							</div>
							<div>
								<h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{t("topup.requestHistory") || "Request History"}</h2>
								<p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t("topup.manageRequests") || "Manage and track your top-up requests"}</p>
							</div>
						</div>
						<div className="flex flex-col sm:flex-row gap-2">
							<Button 
								onClick={handleRefresh} 
								variant="outline" 
								size="sm"
								disabled={refreshing}
								className="rounded-xl md:rounded-2xl border-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 w-full sm:w-auto"
							>
								<RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
								{t("common.refresh") || "Refresh"}
							</Button>
							<Button 
								onClick={() => setCreateModalOpen(true)}
								className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl md:rounded-2xl w-full sm:w-auto"
							>
								<Plus className="h-4 w-4 mr-2" />
								{t("topup.createNew") || "Create New Request"}
							</Button>
						</div> 
					</div>
				</div>

				<div className="p-4 md:p-8">
					{/* Filters and Search */}
					<div className="space-y-4 mb-4 md:mb-6">
						{/* Search and Status Filters */}
						<div className="flex flex-col lg:flex-row gap-3 md:gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder={t("topup.search") || "Search by reference or amount..."}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 focus:ring-blue-500/20 text-sm md:text-base"
								/>
							</div>
							<div className="flex flex-col sm:flex-row gap-3 md:gap-4">
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-full sm:w-48 rounded-xl md:rounded-2xl border-2 h-10 md:h-12">
										<SelectValue placeholder={t("topup.allStatuses") || "All Statuses"} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">{t("topup.allStatuses") || "All Statuses"}</SelectItem>
										<SelectItem value="pending">{t("topup.pending") || "Pending"}</SelectItem>
										<SelectItem value="approved">{t("topup.approved") || "Approved"}</SelectItem>
										<SelectItem value="rejected">{t("topup.rejected") || "Rejected"}</SelectItem>
										<SelectItem value="expired">{t("topup.expired") || "Expired"}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						
						{/* Date Filters */}
						<div className="flex flex-col sm:flex-row gap-3 md:gap-4">
							<div className="flex-1">
								<Label htmlFor="startDate" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
									{t("common.startDate") || "Start Date"}
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
									{t("common.endDate") || "End Date"}
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
										{t("common.clearDates") || "Clear Dates"}
									</Button>
								</div>
							)}
						</div>
					</div>

					{/* Inline error display */}
					{error && (
						<div className="mb-4">
							<ErrorDisplay
								error={error}
								onRetry={() => {
									setCurrentPage(1)
									setError("")
								}}
								variant="full"
								showDismiss={false}
							/>
						</div>
					)}

					{/* Topup Requests Table */}
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
											<TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">{t("topup.reference") || "Reference"}</TableHead>
											<TableHead className="font-semibold cursor-pointer text-xs md:text-sm py-3 md:py-4 px-3 md:px-6" onClick={() => handleSort("amount")}>
												<div className="flex items-center gap-1 md:gap-2">
													{t("topup.amount") || "Amount"}
													<ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
												</div>
											</TableHead>
											<TableHead className="font-semibold cursor-pointer text-xs md:text-sm py-3 md:py-4 px-3 md:px-6" onClick={() => handleSort("status")}>
												<div className="flex items-center gap-1 md:gap-2">
													{t("topup.status") || "Status"}
													<ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
												</div>
											</TableHead>
											<TableHead className="font-semibold cursor-pointer text-xs md:text-sm py-3 md:py-4 px-3 md:px-6 hidden md:table-cell" onClick={() => handleSort("created_at")}>
												<div className="flex items-center gap-1 md:gap-2">
													{t("topup.createdAt") || "Created At"}
													<ArrowUpDown className="h-3 w-3 md:h-4 md:w-4" />
												</div>
											</TableHead>
											<TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell">{t("topup.expiresAt") || "Expires At"}</TableHead>
											<TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell">{t("topup.timeRemaining") || "Time Remaining"}</TableHead>
											<TableHead className="font-semibold text-xs md:text-sm py-3 md:py-4 px-3 md:px-6">{t("common.actions") || "Actions"}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{topups.length === 0 ? (
											<TableRow>
												<TableCell colSpan={7} className="text-center py-6 md:py-8">
													<div className="text-center">
														<Wallet className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
														<p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t("topup.noRequests") || "No top-up requests found"}</p>
														<p className="text-xs md:text-sm text-gray-400">Create your first top-up request to get started</p>
													</div>
												</TableCell>
											</TableRow>
										) : (
											topups.map((topup) => (
												<TableRow key={topup.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
													<TableCell className="py-3 md:py-4 px-3 md:px-6">
														<div className="flex items-center gap-1 md:gap-2">
															<span className="font-mono text-xs md:text-sm">{topup.reference}</span>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => {
																	navigator.clipboard.writeText(topup.reference)
																	toast({ title: t("topup.referenceCopied") || "Reference copied!" })
																}}
																className="h-5 w-5 md:h-6 md:w-6 p-0"
															>
																<Copy className="h-2 w-2 md:h-3 md:w-3" />
															</Button>
														</div>
													</TableCell>
													<TableCell className="font-semibold py-3 md:py-4 px-3 md:px-6">
														<span className="text-sm md:text-base">{topup.formatted_amount}</span>
													</TableCell>
													<TableCell className="py-3 md:py-4 px-3 md:px-6">
														<Badge variant={getStatusBadgeVariant(topup.status)} className="text-xs">
															{topup.status === "pending" && <Clock className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
															{topup.status === "approved" && <CheckCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
															{topup.status === "rejected" && <XCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
															{topup.status === "expired" && <AlertCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
															<span className="hidden sm:inline">{topup.status_display || topup.status}</span>
															<span className="sm:hidden">{topup.status_display?.charAt(0) || topup.status.charAt(0)}</span>
														</Badge>
													</TableCell>
													<TableCell className="text-xs md:text-sm text-gray-500 dark:text-gray-400 py-3 md:py-4 px-3 md:px-6 hidden md:table-cell">
														<div className="flex flex-col">
															<span>{topup.created_at ? new Date(topup.created_at).toLocaleDateString() : "-"}</span>
															<span className="text-xs">
																{topup.created_at ? new Date(topup.created_at).toLocaleTimeString() : ""}
															</span>
														</div>
													</TableCell>
													<TableCell className="text-xs md:text-sm text-gray-500 dark:text-gray-400 py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell">
														{topup.expires_at ? new Date(topup.expires_at).toLocaleDateString() : "-"}
													</TableCell>
													<TableCell className="py-3 md:py-4 px-3 md:px-6 hidden lg:table-cell">
														{topup.is_expired ? (
															<Badge variant="destructive" className="text-xs">
																<AlertCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />
																{t("topup.expired") || "Expired"}
															</Badge>
														) : (
															<span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
																{formatTimeRemaining(topup.time_remaining)}
															</span>
														)}
													</TableCell>
													<TableCell className="py-3 md:py-4 px-3 md:px-6">
														<Button 
															size="sm" 
															variant="outline" 
															onClick={() => handleOpenDetail(topup.uid)}
															className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 rounded-lg md:rounded-xl"
														>
															<span className="hidden sm:inline">{t("topup.viewDetails") || "View Details"}</span>
															<span className="sm:hidden">View</span>
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
								{t("topup.showingResults") || "Showing"} {startIndex + 1} {t("common.to") || "to"} {Math.min(startIndex + itemsPerPage, totalCount)} {t("common.of") || "of"} {totalCount} {t("topup.requests") || "requests"}
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
									{t("topup.pageOf") || "Page"} {currentPage} {t("common.of") || "of"} {totalPages}
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

			{/* Create Topup Modal */}
			<Dialog open={createModalOpen} onOpenChange={(open) => { 
				if (!open) {
					setCreateModalOpen(false)
					setCreateError("")
					setFormData({
						amount: "",
						proof_image: null,
						proof_description: "",
						transaction_date: ""
					})
				}
			}}>
				<DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl md:rounded-3xl sm:max-w-[600px] mx-4 sm:mx-0">
					<DialogHeader className="pb-4 md:pb-6">
						<DialogTitle className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
							<Plus className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
							{t("topup.createNew") || "Create New Top-Up Request"}
						</DialogTitle>
					</DialogHeader>
					
					{createError && (
						<ErrorDisplay
							error={createError}
							variant="inline"
							showRetry={false}
							className="mb-6"
						/>
					)}

					<div className="space-y-4 md:space-y-6">
						<div>
							<Label htmlFor="amount" className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
								{t("topup.amount") || "Amount"} *
							</Label>
							<Input
								id="amount"
								type="number"
								placeholder={t("topup.amountPlaceholder") || "Enter amount (e.g., 50000)"}
								value={formData.amount}
								onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
								required
								className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 focus:ring-blue-500/20 text-sm md:text-base"
							/>
						</div>

						<div>
							<Label htmlFor="proof_image" className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
								{t("topup.proofImage") || "Proof Image"}
							</Label>
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
								<Input
									id="proof_image"
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									className="flex-1 h-10 md:h-12 rounded-xl md:rounded-2xl border-2 text-sm"
								/>
								{formData.proof_image && (
									<Badge variant="outline" className="px-2 md:px-3 py-1 md:py-2 text-xs">
										<span className="truncate max-w-32 md:max-w-none">{formData.proof_image.name}</span>
									</Badge>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="proof_description" className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
								{t("topup.proofDescription") || "Proof Description"}
							</Label>
							<Textarea
								id="proof_description"
								placeholder={t("topup.proofDescriptionPlaceholder") || "Describe your payment proof..."}
								value={formData.proof_description}
								onChange={(e) => setFormData(prev => ({ ...prev, proof_description: e.target.value }))}
								rows={3}
								className="rounded-xl md:rounded-2xl border-2 focus:border-blue-500 focus:ring-blue-500/20 text-sm md:text-base"
							/>
						</div>

						<div>
							<Label htmlFor="transaction_date" className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
								{t("topup.transactionDate") || "Transaction Date"}
							</Label>
							<Input
								id="transaction_date"
								type="date"
								value={formData.transaction_date}
								onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
								className="h-10 md:h-12 rounded-xl md:rounded-2xl border-2 focus:border-blue-500 focus:ring-blue-500/20 text-sm md:text-base"
							/>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 md:mt-8">
						<DialogClose asChild>
							<Button 
								variant="outline" 
								disabled={createLoading}
								className="rounded-xl md:rounded-2xl text-sm md:text-base px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto"
							>
								{t("common.cancel") || "Cancel"}
							</Button>
						</DialogClose>
						<Button 
							onClick={handleCreateTopup} 
							disabled={createLoading || !formData.amount}
							className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-3 text-sm md:text-base w-full sm:w-auto"
						>
							{createLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									{t("common.creating") || "Creating..."}
								</>
							) : (
								t("common.create") || "Create"
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Topup Details Modal */}
			<Dialog open={detailModalOpen} onOpenChange={(open) => { if (!open) handleCloseDetail() }}>
				<DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl md:rounded-3xl sm:max-w-[700px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
					<DialogHeader className="pb-4 md:pb-6">
						<DialogTitle className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
							<Wallet className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
							{t("topup.details") || "Top Up Request Details"}
						</DialogTitle>
					</DialogHeader>
					{detailLoading ? (
						<div className="p-6 md:p-8 text-center">
							<div className="inline-flex items-center gap-2 md:gap-3 text-gray-600 dark:text-gray-400">
								<div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-600"></div>
								<span className="text-sm md:text-base">{t("common.loading")}</span>
							</div>
						</div>
					) : detailError ? (
						<ErrorDisplay
							error={detailError}
							variant="inline"
							showRetry={false}
							className="mb-4 md:mb-6"
						/>
					) : detailTopup ? (
						<div className="space-y-4 md:space-y-6">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
								<div className="space-y-3 md:space-y-4">
									<div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.reference") || "Reference"}
										</Label>
										<div className="flex items-center gap-2">
											<span className="font-mono text-xs md:text-sm">{detailTopup.reference}</span>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 md:h-8 md:w-8"
												onClick={() => {
													navigator.clipboard.writeText(detailTopup.reference)
													toast({ title: t("topup.copiedReference") || "Reference copied!" })
												}}
											>
												<Copy className="h-3 w-3 md:h-4 md:w-4" />
											</Button>
										</div>
									</div>
									
									<div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.amount") || "Amount"}
										</Label>
										<p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
											{detailTopup.formatted_amount}
										</p>
									</div>
									
									<div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.status") || "Status"}
										</Label>
										<div>
											<Badge variant={getStatusBadgeVariant(detailTopup.status)} className="text-xs">
												{detailTopup.status === "pending" && <Clock className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
												{detailTopup.status === "approved" && <CheckCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
												{detailTopup.status === "rejected" && <XCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
												{detailTopup.status === "expired" && <AlertCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />}
												{detailTopup.status_display || detailTopup.status}
											</Badge>
										</div>
									</div>

									<div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.createdAt") || "Created At"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.created_at ? new Date(detailTopup.created_at).toLocaleString() : "-"}
										</p>
									</div>

									<div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.expiresAt") || "Expires At"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.expires_at ? new Date(detailTopup.expires_at).toLocaleString() : "-"}
										</p>
									</div>
								</div>

								<div className="space-y-3 md:space-y-4">
									<div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.timeRemaining") || "Time Remaining"}
										</Label>
										<p>
											{detailTopup.is_expired ? (
												<Badge variant="destructive" className="text-xs">
													<AlertCircle className="h-2 w-2 md:h-3 md:w-3 mr-1" />
													{t("topup.expired") || "Expired"}
												</Badge>
											) : (
												<span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
													{formatTimeRemaining(detailTopup.time_remaining)}
												</span>
											)}
										</p>
									</div>

									<div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.transactionDate") || "Transaction Date"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.transaction_date ? new Date(detailTopup.transaction_date).toLocaleDateString() : "-"}
										</p>
									</div>

									<div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.canSubmitProof") || "Can Submit Proof"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.can_submit_proof ? t("common.yes") || "Yes" : t("common.no") || "No"}
										</p>
									</div>

									<div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.reviewedAt") || "Reviewed At"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.reviewed_at ? new Date(detailTopup.reviewed_at).toLocaleString() : "-"}
										</p>
									</div>

									<div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl">
										<Label className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
											{t("topup.processedAt") || "Processed At"}
										</Label>
										<p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
											{detailTopup.processed_at ? new Date(detailTopup.processed_at).toLocaleString() : "-"}
										</p>
									</div>
								</div>
							</div>

							{detailTopup.proof_description && (
								<div className="bg-blue-50/80 dark:bg-blue-900/20 p-3 md:p-4 rounded-xl md:rounded-2xl">
									<Label className="text-xs md:text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 block">
										{t("topup.proofDescription") || "Proof Description"}
									</Label>
									<p className="text-xs md:text-sm text-blue-800 dark:text-blue-200 mt-1">
										{detailTopup.proof_description}
									</p>
								</div>
							)}

							{detailTopup.rejection_reason && (
								<div className="bg-red-50/80 dark:bg-red-900/20 p-3 md:p-4 rounded-xl md:rounded-2xl">
									<Label className="text-xs md:text-sm font-semibold text-red-900 dark:text-red-200 mb-2 block">
										{t("topup.rejectionReason") || "Rejection Reason"}
									</Label>
									<p className="text-xs md:text-sm text-red-800 dark:text-red-200 mt-1">
										{detailTopup.rejection_reason}
									</p>
								</div>
							)}

							{detailTopup.admin_notes && (
								<div className="bg-yellow-50/80 dark:bg-yellow-900/20 p-3 md:p-4 rounded-xl md:rounded-2xl">
									<Label className="text-xs md:text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2 block">
										{t("topup.adminNotes") || "Admin Notes"}
									</Label>
									<p className="text-xs md:text-sm text-yellow-800 dark:text-yellow-200 mt-1">
										{detailTopup.admin_notes}
									</p>
								</div>
							)}
						</div>
					) : null}
					<DialogClose asChild>
						<Button className="mt-4 md:mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl md:rounded-2xl text-sm md:text-base py-2 md:py-3">
							{t("common.close") || "Close"}
						</Button>
					</DialogClose>
				</DialogContent>
			</Dialog>
		</div>
	)
}